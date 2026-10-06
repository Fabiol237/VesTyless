/**
 * VesTyle V1 — @/lib/headers/headerDefinitions (Stub)
 * ─────────────────────────────────────────────────────────────────────────────
 * Catalogue des 100 définitions de headers pour la galerie admin.
 * Chaque définition décrit un header visuel unique avec ses métadonnées.
 */

/**
 * Définition d'un header.
 * @typedef {Object} HeaderDefinition
 * @property {number} id - Numéro unique (1-100)
 * @property {string} name - Nom descriptif du header
 * @property {string} category - Catégorie (minimal, ecommerce_dense, etc.)
 * @property {string} description - Description courte
 * @property {string[]} tags - Tags pour la recherche
 * @property {string} variant - Variante CSS/layout
 * @property {boolean} hasMobileMenu - A un menu mobile
 * @property {boolean} hasSearch - A une barre de recherche
 * @property {boolean} hasCart - A un panier
 */

function generateHeaders() {
  const categories = [
    { id: 'minimal', label: 'Minimaliste', range: [1, 10] },
    { id: 'ecommerce_dense', label: 'E-Commerce', range: [11, 20] },
    { id: 'double_decker', label: 'Double Étage', range: [21, 30] },
    { id: 'floating_pill', label: 'Capsule Flottante', range: [31, 40] },
    { id: 'editorial_luxury', label: 'Luxe & Prestige', range: [41, 50] },
    { id: 'services_booking', label: 'Services & RDV', range: [51, 60] },
    { id: 'hybrid_pro', label: 'Hybride Pro', range: [61, 70] },
    { id: 'restaurant_food', label: 'Restaurant', range: [71, 80] },
    { id: 'cyber_tech', label: 'Cyber Tech', range: [81, 90] },
    { id: 'marquee_promo', label: 'Bandeau Flash', range: [91, 100] },
  ];

  const headers = [];
  for (const cat of categories) {
    const [start, end] = cat.range;
    for (let i = start; i <= end; i++) {
      headers.push({
        id: i,
        name: `Header ${i} — ${cat.label}`,
        category: cat.id,
        description: `Variante ${i - start + 1} du style ${cat.label}.`,
        tags: [cat.id, cat.label.toLowerCase()],
        variant: `${cat.id}_${i}`,
        hasMobileMenu: true,
        hasSearch: i % 3 === 0,
        hasCart: ['ecommerce_dense', 'hybrid_pro', 'cyber_tech'].includes(cat.id),
        layout: i % 2 === 0 ? 'centered' : 'split',
        height: i % 3 === 0 ? 'compact' : i % 3 === 1 ? 'standard' : 'tall',
      });
    }
  }
  return headers;
}

export const HEADERS_100_DEFINITIONS = generateHeaders();

export default HEADERS_100_DEFINITIONS;
