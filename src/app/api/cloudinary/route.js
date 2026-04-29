import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function signParams(params, apiSecret) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return createHash('sha1').update(`${sorted}${apiSecret}`).digest('hex');
}

async function handleUpload(formData) {
  const file = formData.get('file');
  const folder = formData.get('folder') || 'vestyle';

  if (!file) {
    return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Configuration Cloudinary manquante' }, { status: 500 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder,
    timestamp,
  };
  const signature = signParams(paramsToSign, apiSecret);

  const uploadForm = new FormData();
  uploadForm.append('file', file);
  uploadForm.append('api_key', apiKey);
  uploadForm.append('timestamp', String(timestamp));
  uploadForm.append('folder', folder);
  uploadForm.append('signature', signature);

  const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: uploadForm,
  });

  const cloudinaryData = await cloudinaryRes.json();
  if (!cloudinaryRes.ok) {
    return NextResponse.json({ error: cloudinaryData?.error?.message || 'Echec upload Cloudinary' }, { status: 400 });
  }

  return NextResponse.json({
    secure_url: cloudinaryData.secure_url,
    public_id: cloudinaryData.public_id,
  });
}

async function handleDelete(publicId) {
  if (!publicId) {
    return NextResponse.json({ error: 'publicId manquant' }, { status: 400 });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Configuration Cloudinary manquante' }, { status: 500 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    public_id: publicId,
    timestamp,
  };
  const signature = signParams(paramsToSign, apiSecret);

  const deleteForm = new URLSearchParams();
  deleteForm.set('public_id', publicId);
  deleteForm.set('api_key', apiKey);
  deleteForm.set('timestamp', String(timestamp));
  deleteForm.set('signature', signature);

  const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: deleteForm.toString(),
  });

  const cloudinaryData = await cloudinaryRes.json();
  if (!cloudinaryRes.ok) {
    return NextResponse.json({ error: cloudinaryData?.error?.message || 'Echec suppression Cloudinary' }, { status: 400 });
  }

  return NextResponse.json({ result: cloudinaryData.result });
}

export async function POST(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const action = formData.get('action');

    if (action === 'upload') {
      return handleUpload(formData);
    }

    return NextResponse.json({ error: 'Action multipart invalide' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.action) {
    return NextResponse.json({ error: 'Action manquante' }, { status: 400 });
  }

  if (body.action === 'delete') {
    return handleDelete(body.publicId);
  }

  return NextResponse.json({ error: 'Action non supportee' }, { status: 400 });
}
