/**
 * QR Code Generator for VesTyle
 * Uses QR Server API — no npm package needed, works offline-friendly via cache
 */

/**
 * Returns the URL of a QR code image for a given boutique
 * @param {string} slug - The boutique slug
 * @param {string} storeCode - The 5-digit store code
 * @param {number} size - Size in pixels (default 300)
 */
export function getBoutiqueQrUrl(slug, storeCode, size = 300) {
  const targetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vestyless.vercel.app'}/boutique/${slug}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(targetUrl)}&color=128C7E&bgcolor=FFFFFF&qzone=2&format=png`;
}

/**
 * Returns the URL of a QR code image for a given product
 * @param {string} productId - The product UUID
 * @param {string} boutiqueSlug - The boutique slug
 * @param {number} size - Size in pixels (default 300)
 */
export function getProductQrUrl(productId, boutiqueSlug, size = 300) {
  const targetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vestyless.vercel.app'}/boutique/${boutiqueSlug}?product=${productId}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(targetUrl)}&color=128C7E&bgcolor=FFFFFF&qzone=2&format=png`;
}

/**
 * Returns the URL of a QR code for a 5-digit store code lookup
 */
export function getStoreCodeQrUrl(storeCode, size = 300) {
  const targetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vestyless.vercel.app'}/?code=${storeCode}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(targetUrl)}&color=075E54&bgcolor=FFFFFF&qzone=2&format=png`;
}
