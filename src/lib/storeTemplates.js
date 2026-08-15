/**
 * VeStyle — Templates Sectoriels (Boutique / Artisan & Restaurant / Prestataire)
 * Chaque secteur a ses templates visuels complets conformes à son activité.
 * Architecture : secteur → templates → pages configurables & fonctionnalités supportées
 */

// ═══════════════════════════════════════════════════════════════════════════
// SECTEUR 1 : BOUTIQUE 🛍️ (E-Commerce, Mode, Électronique, Alimentation)
// ═══════════════════════════════════════════════════════════════════════════
const BOUTIQUE_TEMPLATES = [
  {
    id: 'boutique_pro',
    sector: 'boutique',
    name: 'Grand Magasin Pro',
    tagline: 'Vêtements, Électronique, Cosmétiques, Multi-rayons',
    emoji: '🏢',
    badge: 'Populaire',
    badgeColor: '#E60000',
    preview: 'linear-gradient(135deg, #111111 0%, #333333 40%, #E60000 100%)',
    accentHex: '#E60000',
    description: 'Design inspiré des grands distributeurs (Mega-menu, Hero Slider, Grille Produits). Panier WhatsApp rapide et navigation fluide.',
    pages: ['Accueil', 'Catalogue', 'Promotions', 'À Propos', 'Panier'],
    features: ['Mega-Menu Catégories', 'Hero Slider Animé', 'Grille de Catalogue', 'Panier WhatsApp'],
    configurablePages: ['accueil', 'catalogue'],
    heroVariant: 'slider',
    supports: ['opening_hours', 'catalogue_grid', 'promo_banner'],
    tags: ['E-Commerce', 'Vêtements', 'High-Tech', 'Alimentation'],
    theme: {
      primaryColor: '#E60000',
      secondaryColor: '#111111',
      accentColor: '#FFFFFF',
      fontFamily: 'Inter',
      mode: 'light',
    },
    modules: ['vitrine', 'catalogue', 'contact'],
  },
  {
    id: 'boutique_luxe',
    sector: 'boutique',
    name: 'Maison Luxe & Minimal',
    tagline: 'Parfumerie, Bijouterie, Haute Couture, Créations',
    emoji: '✨',
    badge: 'Luxe',
    badgeColor: '#8C5E3C',
    preview: 'linear-gradient(135deg, #FAF8F3 0%, #D4A574 50%, #1A1814 100%)',
    accentHex: '#8C5E3C',
    description: 'Esthétique épurée inspirée des grandes maisons de luxe. Typographie travaillée, volet produit immersif et expérience sensorielle.',
    pages: ['Manifeste', 'Philosophie', 'Collection', 'Panier'],
    features: ['Typographie Garamond', 'Fiche Produit Immersive', 'Manifeste de Marque', 'Panier Reçu Minimal'],
    configurablePages: ['accueil', 'catalogue'],
    heroVariant: 'minimal',
    supports: ['opening_hours', 'catalogue_grid', 'promo_banner'],
    tags: ['Luxe', 'Bijoux', 'Parfums', 'Artisanat d\'art'],
    theme: {
      primaryColor: '#8C5E3C',
      secondaryColor: '#FAF8F3',
      accentColor: '#1A1814',
      fontFamily: 'Playfair Display',
      mode: 'light',
    },
    modules: ['vitrine', 'catalogue', 'contact'],
  },
  {
    id: 'boutique_market',
    sector: 'boutique',
    name: 'Flash Market & Alimentation',
    tagline: 'Supermarché, Épicerie, Produits frais, Vente Flash',
    emoji: '🍎',
    badge: 'Express',
    badgeColor: '#25D366',
    preview: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #064E3B 100%)',
    accentHex: '#059669',
    description: 'Optimisé pour les ventes rapides et achats impulsifs. Navigation par onglets rapides, badges de promo et commande instantanée.',
    pages: ['Accueil', 'Rayons', 'Offres Flash', 'Panier'],
    features: ['Rayons Filtrables', 'Badges Promo & Compte à rebours', 'Commande express WhatsApp'],
    configurablePages: ['accueil', 'catalogue'],
    heroVariant: 'search_hero',
    supports: ['opening_hours', 'catalogue_grid', 'promo_banner'],
    tags: ['Épicerie', 'Supermarché', 'Express', 'Vente Flash'],
    theme: {
      primaryColor: '#059669',
      secondaryColor: '#FFFFFF',
      accentColor: '#F59E0B',
      fontFamily: 'Inter',
      mode: 'light',
    },
    modules: ['vitrine', 'catalogue', 'contact'],
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTEUR 2 : ARTISAN & RESTAURANT 🏺 (Restauration, Fast-Food, Atelier, Beauté)
// ═══════════════════════════════════════════════════════════════════════════
const ARTISAN_TEMPLATES = [
  {
    id: 'artisan_resto_gourmet',
    sector: 'artisan',
    name: 'Bistro & Restaurant Gourmet',
    tagline: 'Restaurant, Café, Bar, Boulangerie, Traiteur',
    emoji: '🍷',
    badge: 'Gastronomie',
    badgeColor: '#C87D55',
    preview: 'linear-gradient(135deg, #1C0A00 0%, #C87D55 50%, #FF6B35 100%)',
    accentHex: '#C87D55',
    description: 'Template complet pour métiers de la table. Présentation de la carte / menu, module de réservation de table en direct et horaires d\'ouverture.',
    pages: ['Accueil', 'Carte & Menus', 'Réservation', 'Spécialités', 'Horaires & Accès'],
    features: ['Carte du Chef par Catégorie', 'Réservation de Table WhatsApp', 'Statut Ouvert/Fermé Live', 'Spécialités du Jour'],
    configurablePages: ['accueil', 'carte', 'reservation'],
    heroVariant: 'banner_fixed',
    supports: ['opening_hours', 'reservations', 'menu_card', 'promo_banner'],
    tags: ['Restaurant', 'Bistro', 'Café', 'Gourmet'],
    theme: {
      primaryColor: '#C87D55',
      secondaryColor: '#1C0A00',
      accentColor: '#FF6B35',
      fontFamily: 'Outfit',
      mode: 'dark',
    },
    modules: ['vitrine', 'restaurant', 'contact'],
  },
  {
    id: 'artisan_atelier_beaute',
    sector: 'artisan',
    name: 'Atelier & Salon de Beauté',
    tagline: 'Salon de coiffure, Spa, Couturier, Artisanat d\'art',
    emoji: '✂️',
    badge: 'Savoir-Faire',
    badgeColor: '#EC4899',
    preview: 'linear-gradient(135deg, #831843 0%, #EC4899 50%, #FDF2F8 100%)',
    accentHex: '#EC4899',
    description: 'Sublime le savoir-faire artisanal et les soins sur-mesure. Prise de rendez-vous horodatée, galerie de créations et grille tarifaire.',
    pages: ['Accueil', 'Soins & Prestations', 'Prise de RDV', 'Galerie Créations', 'Horaires'],
    features: ['Prise de Rendez-vous Horodatée', 'Galerie Photos Réalisations', 'Forfaits & Tarifs', 'Accès & Contact'],
    configurablePages: ['accueil', 'services', 'reservation'],
    heroVariant: 'profile_hero',
    supports: ['opening_hours', 'reservations', 'services', 'promo_banner'],
    tags: ['Beauté', 'Coiffure', 'Atelier', 'Artisanat'],
    theme: {
      primaryColor: '#EC4899',
      secondaryColor: '#FDF2F8',
      accentColor: '#831843',
      fontFamily: 'Inter',
      mode: 'light',
    },
    modules: ['vitrine', 'services', 'contact'],
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTEUR 3 : PRESTATAIRE 💼 (Services Pro, Agence, Consulting, Freelance)
// ═══════════════════════════════════════════════════════════════════════════
const PRESTATAIRE_TEMPLATES = [
  {
    id: 'presta_agence_corporate',
    sector: 'prestataire',
    name: 'Agence & Services Pro',
    tagline: 'Cabinet conseil, Agence web, Immobilière, Services B2B',
    emoji: '🏢',
    badge: 'Business Pro',
    badgeColor: '#6366F1',
    preview: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
    accentHex: '#6366F1',
    description: 'Présentation institutionnelle haut de gamme. Formules de services, générateur de devis gratuit, prise de RDV et témoignages clients.',
    pages: ['Accueil', 'Nos Services', 'Demander un Devis', 'Réalisations', 'Contact & Horaires'],
    features: ['Formules Tarifaires & Packs', 'Formulaire Devis Express', 'Prise de RDV en Ligne', 'Plages Horaires d\'Intervention'],
    configurablePages: ['accueil', 'services', 'devis'],
    heroVariant: 'banner_fixed',
    supports: ['opening_hours', 'services', 'devis', 'reservations', 'promo_banner'],
    tags: ['Agence', 'Consulting', 'B2B', 'Immobilier'],
    theme: {
      primaryColor: '#6366F1',
      secondaryColor: '#0F0C29',
      accentColor: '#A855F7',
      fontFamily: 'Inter',
      mode: 'dark',
    },
    modules: ['vitrine', 'services', 'devis', 'contact'],
  },
  {
    id: 'presta_freelance_portfolio',
    sector: 'prestataire',
    name: 'Freelance & Consultant',
    tagline: 'Designer, Développeur, Coach, Photographe, Indépendant',
    emoji: '🚀',
    badge: 'Portfolio',
    badgeColor: '#0052CC',
    preview: 'linear-gradient(135deg, #003087 0%, #0052CC 50%, #F4F6F9 100%)',
    accentHex: '#0052CC',
    description: 'Mettez en valeur vos projets personnels et votre expertise. Formulaire de devis WhatsApp direct et réservation de consultation.',
    pages: ['Accueil', 'Compétences & Services', 'Devis Rapide', 'Portfolio', 'Disponibilités'],
    features: ['En-tête Profil Immersif', 'Demande de Devis Directe', 'Portfolio Projets', 'Horaires de Disponibilité'],
    configurablePages: ['accueil', 'services', 'devis'],
    heroVariant: 'profile_hero',
    supports: ['opening_hours', 'services', 'devis', 'promo_banner'],
    tags: ['Freelance', 'Design', 'Coach', 'Portfolio'],
    theme: {
      primaryColor: '#0052CC',
      secondaryColor: '#F4F6F9',
      accentColor: '#FF6B00',
      fontFamily: 'Inter',
      mode: 'light',
    },
    modules: ['vitrine', 'services', 'devis', 'contact'],
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS & HELPERS
// ═══════════════════════════════════════════════════════════════════════════
export const STORE_TEMPLATES = [
  ...BOUTIQUE_TEMPLATES,
  ...ARTISAN_TEMPLATES,
  ...PRESTATAIRE_TEMPLATES,
];

export const SECTOR_TEMPLATES = {
  boutique:    BOUTIQUE_TEMPLATES,
  artisan:     ARTISAN_TEMPLATES,
  prestataire: PRESTATAIRE_TEMPLATES,
};

export const SECTORS = [
  {
    id: 'boutique',
    label: 'Boutique (E-Commerce)',
    emoji: '🛍️',
    description: 'Vente de produits physiques, mode, électroménager ou alimentaire',
    gradient: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    color: '#25D366',
    count: BOUTIQUE_TEMPLATES.length,
  },
  {
    id: 'artisan',
    label: 'Artisan & Restaurant',
    emoji: '🏺',
    description: 'Restaurants, cafés, salons de beauté, ateliers et savoir-faire',
    gradient: 'linear-gradient(135deg, #C87D55 0%, #1C0A00 100%)',
    color: '#C87D55',
    count: ARTISAN_TEMPLATES.length,
  },
  {
    id: 'prestataire',
    label: 'Prestataire & Services',
    emoji: '💼',
    description: 'Services professionnels, agences, conseil, devis et rendez-vous',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #0F0C29 100%)',
    color: '#6366F1',
    count: PRESTATAIRE_TEMPLATES.length,
  },
];

export function getTemplateById(id) {
  return STORE_TEMPLATES.find(t => t.id === id) || STORE_TEMPLATES[0];
}

/** Retourne les templates d'un secteur */
export function getTemplatesBySector(sectorId) {
  return SECTOR_TEMPLATES[sectorId] || [];
}

/** Compatibilité legacy (apply-template route) */
export function getTemplate(templateId) {
  return getTemplateById(templateId);
}

export default STORE_TEMPLATES;
