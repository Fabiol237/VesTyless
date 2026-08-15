import imageCompression from 'browser-image-compression';

/**
 * VesTyle — Compresseur d'images ultra-rapide (-90% à 95% de taille)
 * Convertit les photos lourdes de smartphones (10MB+) en WebP optimisé (< 150 KB)
 * sur le thread WebWorker du navigateur avant l'upload.
 */
export async function compressImage(file, customOptions = {}) {
  if (!file || !file.type.startsWith('image/')) return file;

  const defaultOptions = {
    maxSizeMB: 0.15,          // Cible : 150 Ko maximum (au lieu de 5-10 MB)
    maxWidthOrHeight: 1200,   // Définition HD idéale pour écrans rétina & mobiles
    useWebWorker: true,       // Utilise un thread séparé pour 0 freeze de l'UI
    initialQuality: 0.75,     // Maintient une netteté visuelle parfaite
    fileType: 'image/webp',   // WebP moderne 30% plus léger que le JPEG
    ...customOptions,
  };

  try {
    const originalSizeMb = (file.size / (1024 * 1024)).toFixed(2);
    console.log(`[VeStyle Compression] Image originale: ${originalSizeMb} MB (${file.name})`);

    const compressedFile = await imageCompression(file, defaultOptions);

    const compressedSizeKb = (compressedFile.size / 1024).toFixed(1);
    const reductionPct = Math.round((1 - compressedFile.size / file.size) * 100);

    console.log(`⚡ [VeStyle Compression] Image compressée: ${compressedSizeKb} KB (-${reductionPct}% économisés)`);

    return compressedFile;
  } catch (error) {
    console.warn('[VeStyle Compression] Fallback sur le fichier original:', error?.message);
    return file;
  }
}
