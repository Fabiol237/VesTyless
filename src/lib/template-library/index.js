/**
 * VesTyle V1 — @/lib/template-library (Stub)
 * ─────────────────────────────────────────────────────────────────────────────
 * Catalogue des templates Vestin disponibles pour le AI Template Matcher.
 * Utilisé par /api/ai/match-template pour sélectionner un template depuis
 * une description textuelle en langage naturel.
 */

export const TEMPLATE_LIBRARY = [
  {
    id: 'vst_dsn_prestige_atelier_001',
    name: 'Prestige Atelier',
    sector: 'fashion',
    style: 'luxe',
    description: 'Design luxueux et sombre pour mode, haute couture, bijoux, accessoires premium.',
    tags: ['mode', 'fashion', 'luxe', 'bijoux', 'atelier', 'couture', 'premium'],
    conversionMode: 'WHATSAPP_DIRECT',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  },
  {
    id: 'vst_dsn_resto_terroir_002',
    name: 'Resto Terroir',
    sector: 'restaurant',
    style: 'warm',
    description: 'Design chaleureux et authentique pour restaurants, bars, traiteurs, food trucks.',
    tags: ['restaurant', 'manger', 'terroir', 'cuisine', 'menu', 'grillades', 'traiteur'],
    conversionMode: 'BOOKING_FIRST',
    thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
  },
  {
    id: 'vst_dsn_services_vip_003',
    name: 'Services VIP',
    sector: 'services',
    style: 'minimal',
    description: 'Design professionnel pour services B2B, consultants, avocats, agences, santé, éducation.',
    tags: ['services', 'conseil', 'consultation', 'education', 'formation', 'sante', 'pharmacie', 'avocat'],
    conversionMode: 'QUOTE_REQUEST',
    thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&q=80',
  },
  {
    id: 'vst_dsn_agro_elevage_004',
    name: 'Agro & Élevage',
    sector: 'agriculture',
    style: 'artisanal',
    description: 'Design terroir et nature pour agriculteurs, éleveurs, marchés et épiceries.',
    tags: ['agriculture', 'elevage', 'vivres', 'marche', 'epicerie', 'ferme', 'semences'],
    conversionMode: 'WHATSAPP_DIRECT',
    thumbnail: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&q=80',
  },
  {
    id: 'vst_dsn_location_standing_005',
    name: 'Location Standing',
    sector: 'hotel',
    style: 'luxe',
    description: 'Design élégant pour hôtels, résidences meublées, locations courte durée, immobilier.',
    tags: ['hotel', 'chambre', 'residence', 'location', 'sejour', 'hebergement', 'appartement'],
    conversionMode: 'BOOKING_FIRST',
    thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
  },
  {
    id: 'vst_dsn_commerce_librairie_006',
    name: 'Commerce Librairie',
    sector: 'retail',
    style: 'bold',
    description: 'Design moderne pour boutiques généralistes, librairies, papeteries, multiservices.',
    tags: ['boutique', 'commerce', 'librairie', 'papeterie', 'produits', 'general'],
    conversionMode: 'CATALOG_BROWSING',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
];

/**
 * Retourne les N templates les plus compatibles avec un secteur/style donné.
 * @param {string} sector - Le secteur d'activité détecté
 * @param {string} style - Le style visuel préféré
 * @param {number} limit - Nombre de résultats (défaut: 3)
 * @returns {object[]}
 */
export function getMatchingTemplates(sector, style, limit = 3) {
  const scored = TEMPLATE_LIBRARY.map(t => {
    let score = 0;
    if (t.sector === sector) score += 10;
    if (t.style === style) score += 5;
    if (t.tags.some(tag => sector?.includes(tag))) score += 3;
    return { ...t, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export default TEMPLATE_LIBRARY;
