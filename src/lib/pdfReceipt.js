import { jsPDF } from 'jspdf';

/**
 * VesTyle — Generateur de Recus & Factures PDF
 * Génère des reçus de commande officiels au format PDF haute définition.
 * 
 * @param {Object} order - Objet commande (id, created_at, customer_name, customer_phone, city, items, total_amount, store_name, payment_method)
 * @param {string} filename - Nom du fichier PDF généré
 */
export async function generatePDFReceipt(order, filename) {
  if (!order) return false;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currencyFmt = (val) => new Intl.NumberFormat('fr-FR').format(Number(val || 0)) + ' FCFA';
  const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : new Date().toLocaleDateString('fr-FR');

  const pdfName = filename || `Recu_Vestyle_${order.id ? order.id.slice(0, 8) : 'commande'}.pdf`;

  // ── EN-TÊTE FACTURE ────────────────────────────────────────────────────────
  // Fond bandeau bleu nuit
  doc.setFillColor(30, 58, 138); // Blue #1e3a8a
  doc.rect(0, 0, 210, 38, 'F');

  // Titre VeStyle
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('VesTyle Pro', 14, 18);

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(219, 234, 254);
  doc.text('Marketplace Social & Commerce Local — Cameroun', 14, 26);

  // Badge REÇU DE COMMANDE sur la droite
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('REÇU DE COMMANDE', 196, 18, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Ref: #${order.id ? order.id.slice(0, 10).toUpperCase() : 'REC-' + Date.now()}`, 196, 26, { align: 'right' });

  // ── INFOS CLIENT & BOUTIQUE ────────────────────────────────────────────────
  let y = 50;

  doc.setLineWidth(0.3);
  doc.setDrawColor(226, 232, 240);

  // Cadre Client
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 88, 36, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('INFORMATIONS CLIENT', 18, y + 8);

  doc.setFontSize(8.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Client : ${order.customer_name || 'Client VeStyle'}`, 18, y + 15);
  doc.text(`Téléphone : ${order.customer_phone || order.phone_whatsapp || '—'}`, 18, y + 21);
  doc.text(`Ville / Quartier : ${order.city || 'Douala'} ${order.address ? '• ' + order.address : ''}`, 18, y + 27);

  // Cadre Boutique & Date
  doc.roundedRect(108, y, 88, 36, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('DÉTAILS COMMANDE', 112, y + 8);

  doc.setFontSize(8.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Boutique : ${order.store_name || order.stores?.name || 'Boutique Partenaire'}`, 112, y + 15);
  doc.text(`Date : ${orderDate}`, 112, y + 21);
  doc.text(`Paiement : ${order.payment_method || 'Mobile Money / À la livraison'}`, 112, y + 27);

  // ── TABLEAU DES ARTICLES ─────────────────────────────────────────────────
  y += 48;

  // En-tête tableau (Bleu foncé)
  doc.setFillColor(37, 99, 235);
  doc.rect(14, y, 182, 9, 'F');

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Article / Description', 18, y + 6);
  doc.text('Qté', 130, y + 6, { align: 'center' });
  doc.text('Prix Unitaire', 160, y + 6, { align: 'right' });
  doc.text('Total', 192, y + 6, { align: 'right' });

  y += 9;

  const items = order.items || order.order_items || [
    { name: order.product_name || 'Article sélectionné', quantity: 1, price: order.total_amount || order.price || 0 }
  ];

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);

  items.forEach((item, index) => {
    // Alternance couleur de ligne
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 9, 'F');
    }

    const itemName = item.name || item.products?.name || 'Article';
    const itemQty = item.quantity || item.qty || 1;
    const itemPrice = item.price || item.unit_price || 0;
    const itemTotal = itemQty * itemPrice;

    doc.text(itemName.slice(0, 50), 18, y + 6);
    doc.text(String(itemQty), 130, y + 6, { align: 'center' });
    doc.text(currencyFmt(itemPrice), 160, y + 6, { align: 'right' });
    doc.text(currencyFmt(itemTotal), 192, y + 6, { align: 'right' });

    y += 9;
  });

  // Ligne de séparation
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 2, 196, y + 2);
  y += 8;

  // ── RECAPITULATIF TOTAL ──────────────────────────────────────────────────
  const totalAmount = order.total_amount || order.total || items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(120, y, 76, 26, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Sous-total :', 124, y + 8);
  doc.text(currencyFmt(totalAmount), 192, y + 8, { align: 'right' });

  doc.text('Livraison / Frais :', 124, y + 14);
  doc.text('Inclus / À régler', 192, y + 14, { align: 'right' });

  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL :', 124, y + 22);
  doc.setTextColor(37, 99, 235);
  doc.text(currencyFmt(totalAmount), 192, y + 22, { align: 'right' });

  // ── PIED DE PAGE & VÉRIFICATION ──────────────────────────────────────────
  y = 265;

  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);

  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Merci pour votre confiance sur VeStyle Cameroun ! Ce reçu certifie votre commande.', 105, y + 6, { align: 'center' });
  doc.text('VeStyle • Douala & Yaoundé • Support WhatsApp 24/7', 105, y + 11, { align: 'center' });

  // Sauvegarde et téléchargement du PDF
  doc.save(pdfName);
  return true;
}
