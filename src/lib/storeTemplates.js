/**
 * VeStyle — Catalogue de Secteurs, Sous-Secteurs et Templates
 * 
 * Workflow de création de templates :
 *   1. L'architecte reçoit un lien/fichier de site de référence
 *   2. Il analyse la structure visuelle et identifie les blocs nécessaires
 *   3. Il crée le JSON assemblé dans /templates/ + l'enregistre dans templateLoader.js
 *   4. Il ajoute la fiche descriptive ici dans le bon tableau sectoriel
 *   5. Le vendeur voit le template dans l'éditeur et le choisit en 1 clic
 */

// ═══════════════════════════════════════════════════════════════════════════
// SECTEUR 1 : COMMERCE & BOUTIQUE 🛍️
// ═══════════════════════════════════════════════════════════════════════════
const BOUTIQUE_TEMPLATES = [
  {
    id: 'boutique_livres_scolaires',
    sector: 'boutique',
    subSector: 'boutique_livres',
    name: 'Librairie Numérique PDF',
    tagline: 'Livres scolaires, PDF, livraison WhatsApp',
    emoji: '📚',
    badge: 'Éducation',
    badgeColor: '#25D366',
    preview: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #059669 100%)',
    accentHex: '#25D366',
    description: 'Template librairie numérique propre et épuré. Hero blanc centré avec badge confiance, 4 avantages clés, grille de livres PDF populaires, catégories filtrables et bannière CTA verte.',
    theme: {
      primaryColor: '#25D366',
      secondaryColor: '#ffffff',
      accentColor: '#065f46',
      fontFamily: 'Inter',
      mode: 'light',
    },
    modules: ['vitrine', 'catalogue', 'contact'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTEUR 2 : ARTISANAT & GASTRONOMIE 🍷
// ═══════════════════════════════════════════════════════════════════════════
const ARTISAN_TEMPLATES = [
  // À alimenter progressivement
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTEUR 3 : PRESTATAIRE & SERVICES 💼
// ═══════════════════════════════════════════════════════════════════════════
const PRESTATAIRE_TEMPLATES = [
  // À alimenter progressivement
];

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
export const STORE_TEMPLATES = [
  ...BOUTIQUE_TEMPLATES,
  ...ARTISAN_TEMPLATES,
  ...PRESTATAIRE_TEMPLATES,
];

export const SECTORS = [
  {
    id: 'boutique',
    label: 'Commerce & Boutique',
    emoji: '🛍️',
    description: 'Vente de produits physiques (High-Tech, Mode, Alimentation...)',
    gradient: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
    color: '#2563EB',
    count: BOUTIQUE_TEMPLATES.length,
    subSectors: [
      { id: 'boutique_livres', label: 'Livres, Éducation & Médias', emoji: '📚' },
      { id: 'boutique_tech', label: 'Électronique & High-Tech', emoji: '⚡' },
      { id: 'boutique_fashion', label: 'Mode & Luxe', emoji: '✨' },
      { id: 'boutique_food', label: 'Alimentation & Épicerie', emoji: '🥦' },
    ],
  },
  {
    id: 'artisan',
    label: 'Artisanat & Gastronomie',
    emoji: '🍷',
    description: 'Restaurants, cafés, salons de beauté, ateliers et savoir-faire',
    gradient: 'linear-gradient(135deg, #C87D55 0%, #1C0A00 100%)',
    color: '#C87D55',
    count: ARTISAN_TEMPLATES.length,
    subSectors: [
      { id: 'artisan_resto', label: 'Restauration & Table', emoji: '🍷' },
      { id: 'artisan_beaute', label: 'Beauté & Soins', emoji: '✂️' },
    ],
  },
  {
    id: 'prestataire',
    label: 'Prestataire & Services',
    emoji: '💼',
    description: 'Services professionnels, agences, consulting et indépendants',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #0F0C29 100%)',
    color: '#6366F1',
    count: PRESTATAIRE_TEMPLATES.length,
    subSectors: [
      { id: 'presta_agence', label: 'Agence & Services B2B', emoji: '🏢' },
      { id: 'presta_freelance', label: 'Freelance & Consultant', emoji: '🚀' },
    ],
  },
];

export function getTemplateById(id) {
  return STORE_TEMPLATES.find(t => t.id === id) || null;
}

export function getTemplatesBySector(sectorId) {
  return STORE_TEMPLATES.filter(t => t.sector === sectorId);
}

export function getTemplatesBySubSector(subSectorId) {
  return STORE_TEMPLATES.filter(t => t.subSector === subSectorId);
}

export function getTemplate(templateId) {
  return getTemplateById(templateId);
}

export default STORE_TEMPLATES;
