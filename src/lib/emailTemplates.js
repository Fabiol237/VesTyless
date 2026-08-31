/**
 * VeStyle - Moteur de Templates d'Emails Haute Fidélité
 * Design ultra-soigné, responsive, compatible tous clients (Gmail, Apple Mail, Outlook, Yahoo)
 * Couleurs : Bleu Roi (#1E40AF), Or Ambré (#F59E0B), Vert Emeraude (#10B981), Sombre Ardoise (#0F172A)
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vestyless.vercel.app';
const LOGO_URL = `${SITE_URL}/icon-512.png`;

/**
 * Layout de base unifié pour tous les emails VeStyle
 */
function emailLayout({ title, previewText, headerBadge, headerTitle, headerSubtitle, themeColor = '#1E40AF', contentHtml, ctaText, ctaUrl }) {
  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title || 'Notification VeStyle'}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    html, body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-collapse: collapse !important; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; }
    a { color: #1E40AF; text-decoration: none; }
    
    /* Responsive rules */
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; margin: auto !important; border-radius: 0 !important; }
      .fluid-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .header-padding { padding: 36px 20px !important; }
      .cta-button { width: 100% !important; text-align: center !important; }
      .stack-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #F1F5F9;">
  ${previewText ? `<div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">${previewText}</div>` : ''}
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F1F5F9; padding: 24px 10px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); border: 1px solid #E2E8F0;">
          
          <!-- TOP HEADER BANNER -->
          <tr>
            <td class="header-padding" style="background: linear-gradient(135deg, ${themeColor} 0%, #0F172A 100%); padding: 44px 36px; text-align: center; color: #FFFFFF;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Brand Logo with Halo Effect -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="background: rgba(255, 255, 255, 0.12); padding: 8px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.25);">
                          <img src="${LOGO_URL}" width="54" height="54" alt="VeStyle" style="width: 54px; height: 54px; border-radius: 14px; display: block;" onerror="this.style.display='none'" />
                        </td>
                      </tr>
                    </table>

                    <div style="font-size: 22px; font-weight: 900; letter-spacing: 0.5px; margin-top: 12px; text-transform: uppercase; color: #FFFFFF;">
                      Ve<span style="color: #F59E0B;">Style</span>
                    </div>

                    ${headerBadge ? `
                    <div style="margin-top: 14px;">
                      <span style="display: inline-block; background: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.35); padding: 5px 14px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #FFFFFF;">
                        ${headerBadge}
                      </span>
                    </div>
                    ` : ''}

                    <h1 style="margin: 16px 0 0 0; font-size: 24px; font-weight: 800; line-height: 1.25; color: #FFFFFF;">
                      ${headerTitle || title}
                    </h1>

                    ${headerSubtitle ? `
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.82); line-height: 1.5; font-weight: 400;">
                      ${headerSubtitle}
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CONTENT BODY -->
          <tr>
            <td class="fluid-padding" style="padding: 36px 36px 28px 36px; background-color: #FFFFFF;">
              ${contentHtml}

              ${ctaText && ctaUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" class="cta-button" target="_blank" style="display: inline-block; background: linear-gradient(135deg, ${themeColor} 0%, #1E3A8A 100%); color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 15px 36px; border-radius: 14px; box-shadow: 0 6px 18px rgba(30, 64, 175, 0.25); mso-padding-alt: 0;">
                      <!--[if mso]><i style="letter-spacing: 25px; mso-font-width: -100%; mso-text-raise: 30pt">&nbsp;</i><![endif]-->
                      <span style="mso-text-raise: 15pt;">${ctaText} &rarr;</span>
                      <!--[if mso]><i style="letter-spacing: 25px; mso-font-width: -100%">&nbsp;</i><![endif]-->
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- TRUST BADGE FOOTER -->
          <tr>
            <td style="padding: 24px 36px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="padding: 0 10px; font-size: 12px; color: #64748B; font-weight: 600;">
                          ⚡ Marketplace Proximité
                        </td>
                        <td style="color: #CBD5E1;">•</td>
                        <td style="padding: 0 10px; font-size: 12px; color: #64748B; font-weight: 600;">
                          📍 Douala &amp; Yaoundé
                        </td>
                        <td style="color: #CBD5E1;">•</td>
                        <td style="padding: 0 10px; font-size: 12px; color: #64748B; font-weight: 600;">
                          🔒 100% Sécurisé
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                      Cet email a été envoyé automatiquement par le réseau <strong>VeStyle</strong>.<br>
                      Pour toute question, visitez <a href="${SITE_URL}" style="color: #1E40AF; text-decoration: underline;">vestyless.vercel.app</a>.
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 11px; color: #CBD5E1;">
                      &copy; ${new Date().getFullYear()} VeStyle Corporation. Tous droits réservés.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── FORMATTER MONÉTAIRE ──────────────────────────────────────────────────────
const fmtFCFA = (val) => {
  if (!val && val !== 0) return '0 FCFA';
  return Number(val).toLocaleString('fr-FR') + ' FCFA';
};

// ── TEMPLATE 1 : CONFIRMATION DE COMMANDE CLIENT ────────────────────────────
export function generateOrderCustomerEmail({ customerName, orderId, storeName, items = [], totalAmount, deliveryAddress, trackingUrl }) {
  const itemsRows = items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9;">
        <div style="font-size: 14px; font-weight: 700; color: #1E293B;">${item.name || item.title || 'Article'}</div>
        <div style="font-size: 12px; color: #64748B;">Quantité : ${item.quantity || 1} &times; ${fmtFCFA(item.price)}</div>
      </td>
      <td align="right" style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; font-size: 14px; font-weight: 800; color: #0F172A;">
        ${fmtFCFA((item.price || 0) * (item.quantity || 1))}
      </td>
    </tr>
  `).join('');

  const contentHtml = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin-top: 0;">
      Bonjour <strong>${customerName || 'Cher Client'}</strong>,<br>
      Votre commande chez <strong>${storeName || 'la boutique'}</strong> a bien été enregistrée et transmise au vendeur avec succès.
    </p>

    <!-- Détails Commande Box -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin: 24px 0; padding: 20px;">
      <tr>
        <td>
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748B; margin-bottom: 12px;">
            Récapitulatif de la commande #${orderId ? orderId.toString().slice(-6) : 'N/A'}
          </div>
          
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            ${itemsRows.length > 0 ? itemsRows : `
              <tr>
                <td style="padding: 10px 0; color: #64748B; font-size: 13px;">Articles commandés auprès de ${storeName}</td>
              </tr>
            `}
            <tr>
              <td style="padding-top: 14px; font-size: 15px; font-weight: 800; color: #0F172A;">Total à régler :</td>
              <td align="right" style="padding-top: 14px; font-size: 18px; font-weight: 900; color: #1E40AF;">
                ${fmtFCFA(totalAmount)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${deliveryAddress ? `
    <div style="background: #EFF6FF; border-left: 4px solid #1E40AF; padding: 14px 18px; border-radius: 8px; font-size: 13px; color: #1E3A8A; margin-bottom: 20px;">
      📍 <strong>Adresse de livraison :</strong> ${deliveryAddress}
    </div>
    ` : ''}

    <p style="font-size: 13px; color: #64748B; line-height: 1.5;">
      Le vendeur prépare votre colis. Vous pouvez suivre l'avancement en temps réel ou contacter la boutique en un clic.
    </p>
  `;

  return emailLayout({
    title: `Confirmation de commande #${orderId ? orderId.toString().slice(-6) : ''} - VeStyle`,
    previewText: `Votre commande chez ${storeName} a bien été enregistrée pour un montant de ${fmtFCFA(totalAmount)}.`,
    headerBadge: 'Commande Confirmée ✅',
    headerTitle: 'Merci pour votre commande !',
    headerSubtitle: `Boutique partenaire : ${storeName}`,
    themeColor: '#1E40AF',
    contentHtml,
    ctaText: 'Suivre ma commande en direct',
    ctaUrl: trackingUrl || `${SITE_URL}/suivi/${orderId || ''}`,
  });
}

// ── TEMPLATE 2 : ALERTE NOUVELLE COMMANDE POUR LE VENDEUR ───────────────────
export function generateOrderVendorEmail({ vendorName, storeName, orderId, customerName, customerPhone, items = [], totalAmount, hubUrl }) {
  const contentHtml = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin-top: 0;">
      Bonjour <strong>${vendorName || storeName}</strong>,<br>
      Excellente nouvelle ! Vous venez de recevoir une <strong>nouvelle commande</strong> sur votre boutique VeStyle.
    </p>

    <!-- Highlight Box -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border: 1px solid #A7F3D0; border-radius: 16px; margin: 20px 0; padding: 20px;">
      <tr>
        <td align="center">
          <div style="font-size: 12px; font-weight: 800; color: #065F46; text-transform: uppercase; letter-spacing: 1px;">Montant de la vente</div>
          <div style="font-size: 32px; font-weight: 900; color: #047857; margin-top: 4px;">
            ${fmtFCFA(totalAmount)}
          </div>
        </td>
      </tr>
    </table>

    <!-- Coordonnées Client -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 18px; margin-bottom: 20px;">
      <tr>
        <td>
          <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">👤 Informations du client :</div>
          <div style="font-size: 13px; color: #475569;">• <strong>Nom :</strong> ${customerName || 'Client'}</div>
          ${customerPhone ? `<div style="font-size: 13px; color: #475569; margin-top: 4px;">• <strong>Téléphone / WhatsApp :</strong> <a href="https://wa.me/${customerPhone.replace(/\\D/g, '')}" style="color: #059669; font-weight: 700;">+${customerPhone} (Écrire sur WhatsApp)</a></div>` : ''}
        </td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #64748B; line-height: 1.5;">
      ⚡ <strong>Action requise :</strong> Rendez-vous sur votre tableau de bord pour accepter la commande et planifier la remise ou livraison.
    </p>
  `;

  return emailLayout({
    title: `🔥 Nouvelle commande (${fmtFCFA(totalAmount)}) - VeStyle Hub`,
    previewText: `Nouvelle vente de ${fmtFCFA(totalAmount)} par ${customerName} sur ${storeName}.`,
    headerBadge: 'Nouvelle Vente 🛍️',
    headerTitle: `Nouvelle commande reçue !`,
    headerSubtitle: `Boutique : ${storeName}`,
    themeColor: '#059669',
    contentHtml,
    ctaText: 'Gérer la commande dans le Hub',
    ctaUrl: hubUrl || `${SITE_URL}/dashboard/orders`,
  });
}

// ── TEMPLATE 3 : MISE À JOUR STATUT LIVRAISON ───────────────────────────────
export function generateStatusUpdateEmail({ customerName, orderId, statusTitle, statusMessage, statusIcon = '🚚', trackingUrl }) {
  const contentHtml = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin-top: 0;">
      Bonjour <strong>${customerName || 'Cher Client'}</strong>,<br>
      Le statut de votre commande <strong>#${orderId ? orderId.toString().slice(-6) : ''}</strong> a été mis à jour par votre boutique.
    </p>

    <!-- Status Card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin: 20px 0; padding: 24px; text-align: center;">
      <tr>
        <td align="center">
          <div style="font-size: 40px; margin-bottom: 8px;">${statusIcon}</div>
          <div style="font-size: 18px; font-weight: 800; color: #0F172A;">${statusTitle}</div>
          <div style="font-size: 14px; color: #64748B; margin-top: 6px; line-height: 1.5;">${statusMessage}</div>
        </td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #64748B; text-align: center; line-height: 1.5;">
      Cliquez ci-dessous pour voir la localisation du livreur et les détails en direct.
    </p>
  `;

  return emailLayout({
    title: `${statusIcon} ${statusTitle} - Commande VeStyle`,
    previewText: statusMessage || `Mise à jour de votre commande VeStyle.`,
    headerBadge: 'Suivi de Livraison',
    headerTitle: statusTitle,
    headerSubtitle: `Commande #${orderId ? orderId.toString().slice(-6) : ''}`,
    themeColor: '#2563EB',
    contentHtml,
    ctaText: 'Suivre en temps réel',
    ctaUrl: trackingUrl || `${SITE_URL}/suivi/${orderId || ''}`,
  });
}

// ── TEMPLATE 4 : BIENVENUE SUR VESTYLE (CLIENT OU VENDEUR) ──────────────────
export function generateWelcomeEmail({ userName, isSeller = false, storeName, dashboardUrl }) {
  const contentHtml = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin-top: 0;">
      Bonjour <strong>${userName || 'et bienvenue'}</strong>,<br>
      Nous sommes ravis de vous compter parmi la communauté <strong>VeStyle</strong>, la première marketplace de proximité au Cameroun.
    </p>

    ${isSeller ? `
      <!-- Seller steps -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin: 20px 0; padding: 20px;">
        <tr>
          <td>
            <div style="font-size: 14px; font-weight: 800; color: #0F172A; margin-bottom: 12px;">🚀 Vos 3 prochaines étapes :</div>
            <div style="font-size: 13px; color: #475569; margin-bottom: 8px;">1️⃣ <strong>Ajoutez vos articles :</strong> Photos, prix et descriptions attractives.</div>
            <div style="font-size: 13px; color: #475569; margin-bottom: 8px;">2️⃣ <strong>Personnalisez votre boutique :</strong> Couleurs, logo et lien WhatsApp.</div>
            <div style="font-size: 13px; color: #475569;">3️⃣ <strong>Partagez votre lien :</strong> Attirez vos premiers clients à Douala et Yaoundé !</div>
          </td>
        </tr>
      </table>
    ` : `
      <!-- Buyer perks -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin: 20px 0; padding: 20px;">
        <tr>
          <td>
            <div style="font-size: 14px; font-weight: 800; color: #0F172A; margin-bottom: 12px;">🛍️ Ce que vous pouvez faire sur VeStyle :</div>
            <div style="font-size: 13px; color: #475569; margin-bottom: 8px;">📸 <strong>Recherche Visuelle IA :</strong> Prenez une photo d'un habit pour trouver sa boutique.</div>
            <div style="font-size: 13px; color: #475569; margin-bottom: 8px;">🏪 <strong>Boutiques de Proximité :</strong> Trouvez les meilleures adresses près de chez vous.</div>
            <div style="font-size: 13px; color: #475569;">💬 <strong>Contact Direct :</strong> Discutez directement avec les marchands sur WhatsApp.</div>
          </td>
        </tr>
      </table>
    `}
  `;

  return emailLayout({
    title: `Bienvenue sur VeStyle ! ✨`,
    previewText: `Bienvenue sur VeStyle, le marketplace de proximité à Douala & Yaoundé.`,
    headerBadge: isSeller ? 'Compte Vendeur Pro 🏪' : 'Bienvenue 🌟',
    headerTitle: isSeller ? `Votre boutique ${storeName || ''} est prête !` : 'Bienvenue sur VeStyle !',
    headerSubtitle: isSeller ? 'Commencez à vendre dès aujourd\'hui' : 'La mode et le commerce local réinventés',
    themeColor: isSeller ? '#D97706' : '#1E40AF',
    contentHtml,
    ctaText: isSeller ? 'Ouvrir mon Hub Marchand' : 'Découvrir les boutiques',
    ctaUrl: dashboardUrl || (isSeller ? `${SITE_URL}/dashboard` : `${SITE_URL}/`),
  });
}

// ── TEMPLATE 5 : ALERTE STOCK FAIBLE ────────────────────────────────────────
export function generateStockAlertEmail({ vendorName, productName, currentStock, restockUrl }) {
  const contentHtml = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin-top: 0;">
      Bonjour <strong>${vendorName || 'Cher Commerçant'}</strong>,<br>
      Attention : le niveau de stock pour l'un de vos articles phares a atteint un seuil critique.
    </p>

    <!-- Stock Warning Box -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 16px; margin: 20px 0; padding: 20px; text-align: center;">
      <tr>
        <td>
          <div style="font-size: 14px; font-weight: 700; color: #92400E;">Article concerné :</div>
          <div style="font-size: 18px; font-weight: 900; color: #78350F; margin: 4px 0 12px 0;">${productName}</div>
          <div style="display: inline-block; background: #EF4444; color: #FFFFFF; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 999px;">
            ⚠️ Reste seulement : ${currentStock} unité(s)
          </div>
        </td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #64748B; line-height: 1.5;">
      Réapprovisionnez rapidement pour ne pas perdre de ventes auprès de vos clients potentiels.
    </p>
  `;

  return emailLayout({
    title: `⚠️ Alerte Stock Faible : ${productName} - VeStyle`,
    previewText: `Il ne reste que ${currentStock} exemplaire(s) de "${productName}".`,
    headerBadge: 'Alerte Inventaire 📦',
    headerTitle: 'Stock presque épuisé !',
    headerSubtitle: `Produit : ${productName}`,
    themeColor: '#EA580C',
    contentHtml,
    ctaText: 'Ajuster mon stock',
    ctaUrl: restockUrl || `${SITE_URL}/dashboard/products`,
  });
}

// ── TEMPLATE 6 : NOTIFICATION UNIVERSELLE / GÉNÉRIQUE ────────────────────────
export function generateGenericNotificationEmail({ subject, message, badge = 'VeStyle Notification', icon = '📢', themeColor = '#1E40AF', ctaText, ctaUrl, extraData = {} }) {
  const contentHtml = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin-top: 0;">
      ${message || 'Vous avez reçu une nouvelle mise à jour sur VeStyle.'}
    </p>

    ${extraData && Object.keys(extraData).length > 0 ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin: 20px 0; padding: 18px;">
      <tr>
        <td>
          ${Object.entries(extraData).map(([k, v]) => `
            <div style="font-size: 13px; color: #475569; margin-bottom: 6px;">
              • <strong>${k} :</strong> ${v}
            </div>
          `).join('')}
        </td>
      </tr>
    </table>
    ` : ''}
  `;

  return emailLayout({
    title: subject,
    previewText: message ? message.slice(0, 120) : subject,
    headerBadge: badge,
    headerTitle: `${icon} ${subject}`,
    themeColor,
    contentHtml,
    ctaText,
    ctaUrl,
  });
}
