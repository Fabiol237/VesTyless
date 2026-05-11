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

  // Trim to avoid whitespace issues in .env
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Cloudinary Configuration Missing:', { cloudName: !!cloudName, apiKey: !!apiKey, apiSecret: !!apiSecret });
    return NextResponse.json({ error: 'Configuration Cloudinary manquante' }, { status: 500 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder,
    timestamp,
  };
  const signature = signParams(paramsToSign, apiSecret);

  const uploadForm = new FormData();
  // Ensure we pass a filename to Cloudinary (some environments need this for Blobs)
  uploadForm.append('file', file, file.name || `upload_${Date.now()}.jpg`);
  uploadForm.append('api_key', apiKey);
  uploadForm.append('timestamp', String(timestamp));
  uploadForm.append('folder', folder);
  uploadForm.append('signature', signature);

  console.log(`[Cloudinary API] Début de l'upload vers ${cloudName}...`);
  const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: uploadForm,
  });

  const cloudinaryData = await cloudinaryRes.json();
  if (!cloudinaryRes.ok) {
    console.error('Cloudinary Upload Error Details:', JSON.stringify(cloudinaryData, null, 2));
    return NextResponse.json({ 
      error: cloudinaryData?.error?.message || 'Echec upload Cloudinary',
      details: cloudinaryData
    }, { status: 400 });
  }

  console.log(`[Cloudinary API] Upload réussi: ${cloudinaryData.secure_url}`);
  return NextResponse.json({
    secure_url: cloudinaryData.secure_url,
    public_id: cloudinaryData.public_id,
  });
}

async function handleDelete(publicId) {
  if (!publicId) {
    return NextResponse.json({ error: 'publicId manquant' }, { status: 400 });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

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
    console.error('Cloudinary Delete Error Details:', cloudinaryData);
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
