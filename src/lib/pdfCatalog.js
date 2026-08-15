import { jsPDF } from 'jspdf';

/**
 * VesTyle — Générateur de Catalogue Produits PDF avec QR Code (Made-in-China style)
 * Génère un catalogue commercial haute définition pour les marchands et grossistes.
 * 
 * @param {Object} store - Infos magasin (name, slug, logo_url, phone, city, category)
 * @param {Array} products - Liste des produits du magasin (id, name, price, category, image_url)
 * @param {string} filename - Nom optionnel du fichier PDF généré
 */
export async function generateStorePDFCatalog(store, products = [], filename) {
  if (!store) return false;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currencyFmt = (val) => new Intl.NumberFormat('fr-FR').format(Number(val || 0)) + ' FCFA';
  const storeName = store.name || 'Boutique Partenaire';
  const storeSlug = store.slug || 'boutique';
  const storeUrl = `https://vestyle.cm/boutique/${storeSlug}`;
  const pdfName = filename || `Catalogue_Vestyle_${storeSlug}.pdf`;

  // URL du QR Code généré via API haute définition
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(storeUrl)}`;

  // ── EN-TÊTE DU CATALOGUE ──────────────────────────────────────────────────
  // Bandeau Dégradé Bleu Nuit Pro
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, 210, 42, 'F');

  // Ligne de couleur dorée / émeraude
  doc.setFillColor(16, 185, 129); // Emerald-500
  doc.rect(0, 40, 210, 2, 'F');

  // Titre & Logo Magasin
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(storeName.slice(0, 32), 14, 18);

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`CATALOGUE OFFICIEL MARCHE & GROSSISTE — ${store.city || 'Douala & Yaoundé'}`, 14, 26);
  doc.text(`Contact / WhatsApp : ${store.phone || store.whatsapp || '+237 6XX XXX XXX'}`, 14, 32);

  // Titre Droite
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('VeStyle Commerce', 196, 18, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`${products.length} Article${products.length > 1 ? 's' : ''} disponibles`, 196, 26, { align: 'right' });

  // ── BLOC SCANNER QR CODE & BOUTIQUE EN LIGNE ──────────────────────────────
  let y = 48;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 34, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('📱 Scannez pour Visiter la Boutique en Ligne & Commander Directement', 20, y + 10);

  doc.setFontSize(8.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Lien direct : ${storeUrl}`, 20, y + 18);
  doc.text('Livraison rapide à domicile ou en boutique à Douala, Yaoundé & toutes villes.', 20, y + 24);

  // Charger et insérer l'image du QR Code
  try {
    const qrImage = await loadImageAsDataUrl(qrCodeApiUrl);
    if (qrImage) {
      doc.addImage(qrImage, 'PNG', 162, y + 4, 26, 26);
    }
  } catch (e) {
    // Fallback texte si hors-ligne
    doc.setFontSize(8);
    doc.text('[QR Code]', 170, y + 18);
  }

  // ── EN-TÊTE TABLEAU DES PRODUITS ─────────────────────────────────────────
  y += 42;

  doc.setFillColor(37, 99, 235);
  doc.rect(14, y, 182, 9, 'F');

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('N°', 18, y + 6);
  doc.text('Nom du Produit / Catégorie', 30, y + 6);
  doc.text('Prix Détail', 140, y + 6, { align: 'right' });
  doc.text('Prix Gros (-20%)', 192, y + 6, { align: 'right' });

  y += 9;

  // ── LISTE DES PRODUITS (Multi-pages automatique) ─────────────────────────
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);

  const productList = products.length > 0 ? products : [
    { name: 'Article Exemple 1', price: 15000, category: 'Mode & Vêtements' },
    { name: 'Article Exemple 2', price: 25000, category: 'Chaussures & Accessoires' },
  ];

  productList.forEach((prod, index) => {
    // Vérifier s'il reste de la place sur la page A4 (max 260mm)
    if (y > 255) {
      doc.addPage();
      y = 20;

      // Réimprimer en-tête tableau sur la nouvelle page
      doc.setFillColor(37, 99, 235);
      doc.rect(14, y, 182, 9, 'F');
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('N°', 18, y + 6);
      doc.text('Nom du Produit / Catégorie', 30, y + 6);
      doc.text('Prix Détail', 140, y + 6, { align: 'right' });
      doc.text('Prix Gros (-20%)', 192, y + 6, { align: 'right' });
      y += 9;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
    }

    // Alternance couleur de ligne
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 9, 'F');
    }

    const prodName = prod.name || 'Produit';
    const prodCat = prod.category || 'Général';
    const priceDetail = Number(prod.price || 0);
    const priceGros = Math.round(priceDetail * 0.8);

    doc.setTextColor(30, 41, 59);
    doc.text(String(index + 1), 18, y + 6);
    doc.text(`${prodName.slice(0, 45)} (${prodCat})`, 30, y + 6);

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(currencyFmt(priceDetail), 140, y + 6, { align: 'right' });

    doc.setTextColor(16, 185, 129); // Vert Grossiste
    doc.text(currencyFmt(priceGros), 192, y + 6, { align: 'right' });

    doc.setFont('Helvetica', 'normal');
    y += 9;
  });

  // Ligne de fin de tableau
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 2, 196, y + 2);

  // ── PIED DE PAGE CATALOGUE ───────────────────────────────────────────────
  const pageHeight = doc.internal.pageSize.height || 297;
  const footerY = pageHeight - 20;

  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, 196, footerY);

  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`VeStyle Marketplace Cameroun • Catalogue officiel de ${storeName}`, 105, footerY + 6, { align: 'center' });
  doc.text('Commandes & Négociations en direct par WhatsApp et Mobile Money', 105, footerY + 11, { align: 'center' });

  // Sauvegarde et téléchargement du PDF
  doc.save(pdfName);
  return true;
}

/**
 * Charge une image distant sous forme de Data URL base64
 */
function loadImageAsDataUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
