/**
 * VesTyle V1 — @/lib/storeBlocks (Stub de compatibilité)
 * ─────────────────────────────────────────────────────────────────────────────
 * Fournit la fonction `getStoreBlocks` utilisée par les templates legacy
 * (TemplateBoutique, TemplateBoutiquePro, TemplatePresta, TemplateResto, TemplateTechPro).
 *
 * Retourne des blocs de contenu par défaut dérivés des données du store Supabase.
 */

/**
 * Extrait les blocs de contenu structurés à partir d'un objet store Supabase brut.
 * Compatible avec les templates legacy Vestin.
 *
 * @param {object|null} store - L'objet store provenant de Supabase (stores_public)
 * @returns {object} Blocs de contenu structurés
 */
export function getStoreBlocks(store) {
  const name = store?.name || 'Mon Établissement';
  const description = store?.description || 'Bienvenue dans notre établissement.';
  const city = store?.city || 'Douala';
  const phone = store?.phone || '';
  const whatsapp = store?.whatsapp_link || store?.whatsapp_number || phone;
  const logoUrl = store?.logo_url || '';
  const bannerUrl = store?.banner_url || store?.cover_url || '';
  const businessType = store?.business_type || 'product';

  // Résoudre la configuration depuis published_config si disponible
  const pubConfig = store?.published_config || {};

  return {
    hero: {
      title: pubConfig?.hero?.title || name,
      subtitle: pubConfig?.hero?.subtitle || description,
      imageUrl: pubConfig?.hero?.imageUrl || bannerUrl,
      ctaText: pubConfig?.hero?.ctaText || 'Découvrir nos offres',
      ctaUrl: pubConfig?.hero?.ctaUrl || '#catalog',
      badge: pubConfig?.hero?.badge || '',
    },
    about: {
      title: pubConfig?.about?.title || `À propos de ${name}`,
      text: pubConfig?.about?.text || description,
      imageUrl: pubConfig?.about?.imageUrl || bannerUrl,
    },
    contact: {
      phone,
      whatsapp,
      city,
      address: pubConfig?.contact?.address || city,
      email: pubConfig?.contact?.email || '',
      hours: pubConfig?.contact?.hours || 'Lun–Sam 8h–20h',
    },
    brand: {
      name,
      logoUrl,
      tagline: pubConfig?.brand?.tagline || description,
      city,
      businessType,
    },
    seo: {
      title: pubConfig?.seo?.title || `${name} — ${city}`,
      description: pubConfig?.seo?.description || description,
      keywords: pubConfig?.seo?.keywords || [name, city, businessType].join(', '),
    },
    social: {
      facebook: pubConfig?.social?.facebook || '',
      instagram: pubConfig?.social?.instagram || '',
      tiktok: pubConfig?.social?.tiktok || '',
    },
    theme: {
      primaryColor: store?.theme_color || '#E5A93C',
      accentColor: store?.accent_color || '#D97706',
      bgColor: store?.secondary_color || '#090D16',
      font: store?.font_family || 'Inter',
    },
  };
}

/**
 * Retourne un bloc hero par défaut pour les templates qui en ont besoin directement.
 */
export function getHeroBlock(store) {
  return getStoreBlocks(store).hero;
}

/**
 * Retourne le bloc contact par défaut.
 */
export function getContactBlock(store) {
  return getStoreBlocks(store).contact;
}

export default { getStoreBlocks, getHeroBlock, getContactBlock };
