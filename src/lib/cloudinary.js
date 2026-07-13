import imageCompression from 'browser-image-compression';

export function extractCloudinaryPublicId(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;

  const uploadMarker = '/upload/';
  const uploadIndex = imageUrl.indexOf(uploadMarker);
  if (uploadIndex === -1) return null;

  const afterUpload = imageUrl.slice(uploadIndex + uploadMarker.length);
  const parts = afterUpload.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  // Ignore transformation/version segments
  const cleanedParts = parts.filter((segment) => !segment.startsWith('v') || Number.isNaN(Number(segment.slice(1))));
  if (cleanedParts.length === 0) return null;

  const last = cleanedParts[cleanedParts.length - 1];
  const dotIndex = last.lastIndexOf('.');
  cleanedParts[cleanedParts.length - 1] = dotIndex > 0 ? last.slice(0, dotIndex) : last;

  return cleanedParts.join('/');
}

export async function uploadImage(file, options = {}) {
  // CONFIGURATION DE LA COMPRESSION ULTRA-AGRESSIVE
  const compressionOptions = {
    maxSizeMB: 0.5,          // Limite très basse à 500 Ko
    maxWidthOrHeight: 1024, // Taille optimisée pour le web/mobile
    useWebWorker: true,
    initialQuality: 0.6     // Compression plus forte dès le départ
  };

  let fileToUpload = file;

  // Appliquer la compression uniquement si c'est une image lourde ou nécessaire
  try {
    if (file.type.startsWith('image/')) {
      console.log(`[Vestyle Compression] Taille originale: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      fileToUpload = await imageCompression(file, compressionOptions);
      console.log(`[Vestyle Compression] Nouvelle taille: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`);
    }
  } catch (error) {
    console.error("[Vestyle Compression] Erreur:", error);
    // On continue avec le fichier original si la compression échoue
  }

  const formData = new FormData();
  formData.append('action', 'upload');
  formData.append('file', fileToUpload, file.name); // Conserver le nom original
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  const response = await fetch('/api/cloudinary', {
    method: 'POST',
    body: formData,
  });

  // Vérifier le content-type avant de parser JSON
  const contentType = response.headers.get('content-type');
  let data;

  try {
    if (contentType?.includes('application/json')) {
      const text = await response.text();
      if (!text) {
        throw new Error('Réponse API vide');
      }
      data = JSON.parse(text);
    } else {
      const text = await response.text();
      throw new Error(`Réponse invalide - Content-Type: ${contentType}, Texte: ${text?.slice(0, 200) || 'vide'}`);
    }
  } catch (parseError) {
    if (parseError.message.includes('JSON')) {
      console.error('[Cloudinary] JSON Parse Error:', parseError.message);
      throw new Error(`Erreur parsing réponse Cloudinary: ${parseError.message}`);
    }
    throw parseError;
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.details?.error?.message || 'Upload Cloudinary impossible');
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
