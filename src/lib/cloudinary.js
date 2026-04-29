export function extractCloudinaryPublicId(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;

  const uploadMarker = '/upload/';
  const uploadIndex = imageUrl.indexOf(uploadMarker);
  if (uploadIndex === -1) return null;

  const afterUpload = imageUrl.slice(uploadIndex + uploadMarker.length);
  const parts = afterUpload.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  // Ignore transformation/version segments like "c_fill,w_800" and "v1712345678".
  const cleanedParts = parts.filter((segment) => !segment.startsWith('v') || Number.isNaN(Number(segment.slice(1))));
  if (cleanedParts.length === 0) return null;

  const last = cleanedParts[cleanedParts.length - 1];
  const dotIndex = last.lastIndexOf('.');
  cleanedParts[cleanedParts.length - 1] = dotIndex > 0 ? last.slice(0, dotIndex) : last;

  return cleanedParts.join('/');
}

export async function uploadImage(file, options = {}) {
  const formData = new FormData();
  formData.append('action', 'upload');
  formData.append('file', file);
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  const response = await fetch('/api/cloudinary', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || 'Upload Cloudinary impossible');
  }

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
  };
}

export async function deleteCloudinaryByUrl(imageUrl) {
  const publicId = extractCloudinaryPublicId(imageUrl);
  if (!publicId) return false;

  const response = await fetch('/api/cloudinary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'delete',
      publicId,
    }),
  });

  if (!response.ok) return false;
  return true;
}
