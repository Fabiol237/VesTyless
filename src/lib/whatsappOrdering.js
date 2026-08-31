/**
 * Utilitaire de Commande WhatsApp Directe & Boucle Virale
 * Politique de Fer : Zéro friction, 1 clic vers WhatsApp avec signature de parrainage virale
 */

/**
 * Nettoie et formate un numéro de téléphone pour WhatsApp (ex: Cameroun +237)
 * @param {string} phone
 * @param {string} defaultCountryCode
 * @returns {string}
 */
export function formatWhatsAppPhone(phone, defaultCountryCode = '237') {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (!cleaned.startsWith(defaultCountryCode) && cleaned.length <= 9) {
    cleaned = `${defaultCountryCode}${cleaned}`;
  }
  return cleaned;
}

/**
 * Génère le texte formaté pour la commande WhatsApp avec signature virale
 * @param {Object} options
 * @param {Array} options.items - Liste des articles [{ title, price, quantity, variant }]
 * @param {number} options.totalPrice - Prix total
 * @param {string} options.storeName - Nom de la boutique
 * @param {string} [options.customerName] - Nom du client
 * @param {string} [options.customerPhone] - Téléphone du client
 * @param {string} [options.deliveryAddress] - Adresse ou ville de livraison
 * @param {string} [options.notes] - Remarques du client
 * @returns {string}
 */
export function generateWhatsAppOrderMessage({
  items = [],
  totalPrice = 0,
  storeName = 'Boutique',
  customerName = '',
  customerPhone = '',
  deliveryAddress = '',
  notes = '',
}) {
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let message = `🛒 *NOUVELLE COMMANDE - ${storeName.toUpperCase()}*\n`;
  message += `📅 Date : ${dateStr}\n`;
  message += `───────────────────────\n\n`;

  if (customerName || customerPhone || deliveryAddress) {
    message += `👤 *INFORMATIONS CLIENT*\n`;
    if (customerName) message += `• Nom : *${customerName.trim()}*\n`;
    if (customerPhone) message += `• Tél : ${customerPhone.trim()}\n`;
    if (deliveryAddress) message += `• Lieu de livraison : *${deliveryAddress.trim()}*\n`;
    message += `\n`;
  }

  message += `📦 *ARTICLES COMMANDÉS*\n`;
  items.forEach((item, index) => {
    const qty = item.quantity || 1;
    const itemTotal = ((item.price || 0) * qty).toLocaleString('fr-FR');
    const variantInfo = item.variant ? ` (${item.variant})` : '';
    message += `${index + 1}. *${item.title || item.name}*${variantInfo}\n`;
    message += `   Quantité : ${qty} × ${(item.price || 0).toLocaleString('fr-FR')} FCFA = *${itemTotal} FCFA*\n`;
  });

  message += `\n───────────────────────\n`;
  message += `💰 *TOTAL À PAYER : ${Number(totalPrice).toLocaleString('fr-FR')} FCFA*\n`;

  if (notes) {
    message += `\n📝 *Instructions particulières :*\n${notes.trim()}\n`;
  }

  message += `\n───────────────────────\n`;
  // Boucle virale : Acquisition de nouveaux marchands gratuite
  message += `🚀 *Commande passée via VeStyle*\n`;
  message += `👉 _Créez votre propre boutique en ligne gratuitement sur : https://vestyless.vercel.app_`;

  return message;
}

/**
 * Ouvre directement la conversation WhatsApp avec le message encodé
 * @param {string} phone - Numéro du marchand
 * @param {string} message - Message formaté
 */
export function openWhatsAppOrder(phone, message) {
  const formattedPhone = formatWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(message);
  const url = `https://wa.me/${formattedPhone}?text=${encodedText}`;

  // Retour haptique natif si disponible
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([30, 50, 30]);
    } catch {
      // Ignorer si bloqué par le navigateur
    }
  }

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
