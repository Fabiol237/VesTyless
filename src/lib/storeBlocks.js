/**
 * VeStyle — Schema Universel de Blocs de Boutique (Single JSON Standardized Block Schema)
 * 
 * Tous les templates de la plateforme consomment cette même structure JSON unifiée.
 * Chaque template conserve son propre design visuel d'exception tout en garantissant
 * la persistance et la cohérence parfaite des données du marchand lors de changements de template.
 */

export const STANDARD_BLOCK_KEYS = {
  HERO: 'hero',
  PROMO_FLASH: 'promo_flash',
  CATALOG: 'catalog',
  TRUST_FEATURES: 'trust_features',
  BOOKING_SERVICE: 'booking_service',
  ABOUT: 'about',
};

/**
 * Retourne la structure JSON universelle de blocs par défaut pour une boutique.
 */
export function getDefaultStoreBlocks(store = {}) {
  const name = store?.name || 'Ma Boutique';
  const desc = store?.description || 'Découvrez notre collection exclusive et nos meilleures offres.';
  const logo = store?.logo_url || null;
  const banner = store?.banner_url || null;

  return {
    hero: {
      type: 'hero',
      enabled: true,
      badge: '⚡ Boutique Officielle',
      title: name,
      subtitle: desc,
      ctaText: 'Découvrir la Collection',
      slides: [
        {
          id: 'slide_1',
          title: name,
          subtitle: desc,
          badge: '✨ En vedette',
          image: banner || logo || null,
          ctaText: 'Voir les produits',
        }
      ]
    },
    promo_flash: {
      type: 'promo_flash',
      enabled: true,
      title: 'Ventes Flash & Promos',
      subtitle: 'Offres limitées selon les stocks disponibles',
      countdownHours: 24,
    },
    catalog: {
      type: 'catalog',
      enabled: true,
      title: 'Notre Catalogue',
      subtitle: 'Explorez nos articles et collections',
      showCategories: true,
      showBrands: true,
      displayStyle: 'grid', // 'grid' | 'list'
    },
    trust_features: {
      type: 'trust_features',
      enabled: true,
      title: 'Nos Engagements',
      items: [
        { id: 'f1', icon: '🛡️', title: 'Garantie & Qualité', desc: 'Produits certifiés et vérifiés' },
        { id: 'f2', icon: '⚡', title: 'Livraison Rapide', desc: 'Douala, Yaoundé & villes partenaires' },
        { id: 'f3', icon: '💬', title: 'Support WhatsApp', desc: 'Réponse et conseil personnalisé' },
      ]
    },
    booking_service: {
      type: 'booking_service',
      enabled: false,
      title: 'Réservation & Prise de RDV',
      subtitle: 'Réservez votre créneau ou votre table directement',
      whatsappInstant: true,
    },
    about: {
      type: 'about',
      enabled: true,
      title: 'À propos de notre enseigne',
      content: desc,
      values: ['Excellence', 'Authenticité', 'Service Client'],
    }
  };
}

/**
 * Helper qui extrait les blocs normalisés à partir de store.layout_config.blocks
 * avec fallback automatique vers getDefaultStoreBlocks si non configuré.
 */
export function getStoreBlocks(store = {}) {
  const existing = store?.layout_config?.blocks;
  const defaults = getDefaultStoreBlocks(store);

  if (!existing) return defaults;

  // Fusion des blocs existants avec les valeurs par défaut
  return {
    hero: { ...defaults.hero, ...existing.hero },
    promo_flash: { ...defaults.promo_flash, ...existing.promo_flash },
    catalog: { ...defaults.catalog, ...existing.catalog },
    trust_features: { ...defaults.trust_features, ...existing.trust_features },
    booking_service: { ...defaults.booking_service, ...existing.booking_service },
    about: { ...defaults.about, ...existing.about },
  };
}
