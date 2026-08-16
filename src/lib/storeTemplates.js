/**
 * VeStyle — Templates Sectoriels (3 Grands Secteurs & Sous-Secteurs Metier)
 * Chaque template a sa fiche technique `specifications` pour l'inspection [i]
 * et la configuration dynamique du Dashboard.
 */

// ═══════════════════════════════════════════════════════════════════════════
// SECTEUR 1 : COMMERCE & BOUTIQUE 🛍️
// ═══════════════════════════════════════════════════════════════════════════
const BOUTIQUE_TEMPLATES = [
  {
    id: 'boutique_tech_pro',
    sector: 'boutique',
    subSector: 'boutique_tech',
    name: 'Tech & Électronique Flagship',
    tagline: 'Smartphones, Laptops, TV 4K, Électroménager, Gaming',
    emoji: '⚡',
    badge: 'Flagship 1000L',
    badgeColor: '#2563EB',
    preview: 'linear-gradient(135deg, #09090B 0%, #1E40AF 50%, #2563EB 100%)',
    accentHex: '#2563EB',
    description: 'Template High-Tech haut de gamme inspiré des Apple & Samsung Stores. Carrousel Héro 5 visuels, offres flash avec compte à rebours, fiche produit 5 visuels avec filtres de caractéristiques et panier WhatsApp.',
    features: ['Carrousel Héro 5 Slides', 'Ventes Flash Compte à Rebours', 'Galerie Fiche Produit 5 Visuels', 'Garantie 1 An & SAV', 'Panier WhatsApp'],
    supports: ['opening_hours', 'catalogue_grid', 'promo_banner', 'hero_slides', 'flash_deals'],
    specifications: {
      pagesCount: 5,
      pagesList: [
        { name: 'Page Accueil', desc: 'Hero Carrousel 5 slides, Ventes Flash live, Badges de réassurance & extrait catalogue.' },
        { name: 'Page Catalogue', desc: 'Filtres par sous-catégories (Smartphones, Laptops...) et marques (Apple, Samsung...), tri par prix & promos.' },
        { name: 'Page Ventes Flash', desc: 'Compte à rebours dynamique en temps réel avec remises jusqu\'à -50%.' },
        { name: 'Page Garantie 1 An & SAV', desc: 'Transparence totale, conditions d\'échange sous 7 jours et support SAV Douala/Yaoundé.' },
        { name: 'Panier Drawer WhatsApp', desc: 'Génération automatique de message formaté WhatsApp avec détail des options choisies.' },
      ],
      carousels: [
        { name: 'Héro Principal (5 Slides)', count: 5, where: 'Page Accueil' },
        { name: 'Galerie Fiche Produit (5 Visuels)', count: 5, where: 'Modal Produit' },
      ],
      configurables: [
        { key: 'hero_slides', label: 'Carrousel Héro (5 Visuels)', type: 'slides' },
        { key: 'flash_deals', label: 'Offres Flash & Compte à Rebours', type: 'toggle' },
        { key: 'tech_specs', label: 'Fiches Techniques Produits', type: 'specs' },
        { key: 'warranty_info', label: 'Garantie 1 An & SAV', type: 'info' },
      ],
    },
    theme: {
      primaryColor: '#2563EB',
      secondaryColor: '#09090B',
      accentColor: '#F59E0B',
      fontFamily: 'Plus Jakarta Sans',
      mode: 'dark',
    },
    modules: ['vitrine', 'catalogue', 'contact'],
  },
  {
    id: 'boutique_pro',
    sector: 'boutique',
    subSector: 'boutique_fashion',
    name: 'Grand Magasin Fashion & Mode',
    tagline: 'Vêtements, Chaussures, Sacs, Accessoires de Mode',
    emoji: '👗',
    badge: 'Populaire',
    badgeColor: '#E60000',
    preview: 'linear-gradient(135deg, #111111 0%, #333333 40%, #E60000 100%)',
    accentHex: '#E60000',
    description: 'Design épuré et moderne pour enseignes de mode. Présentation par collections, filtres de tailles/couleurs et panier WhatsApp.',
    specifications: {
      pagesCount: 4,
      pagesList: [
        { name: 'Page Accueil', desc: 'Bannière collection saisonnière, sélecteur de catégories et nouveautés.' },
        { name: 'Page Catalogue', desc: 'Grille produits avec filtres par taille, couleur et genre.' },
        { name: 'Page Lookbook', desc: 'Galerie photos d\'inspiration et tenues assorties.' },
        { name: 'Panier WhatsApp', desc: 'Commande directe WhatsApp avec taille et couleur sélectionnées.' },
      ],
      carousels: [
        { name: 'Bannière Collection Saisons', count: 3, where: 'Page Accueil' },
      ],
      configurables: [
        { key: 'lookbook', label: 'Galerie Lookbook', type: 'gallery' },
        { key: 'size_guide', label: 'Guide des Tailles', type: 'toggle' },
      ],
    },
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
    subSector: 'boutique_fashion',
    name: 'Maison Luxe & Parfumerie',
    tagline: 'Parfumerie, Bijouterie, Haute Couture, Créations',
    emoji: '✨',
    badge: 'Luxe',
    badgeColor: '#8C5E3C',
    preview: 'linear-gradient(135deg, #FAF8F3 0%, #D4A574 50%, #1A1814 100%)',
    accentHex: '#8C5E3C',
    description: 'Esthétique épurée inspirée des grandes maisons de luxe. Typographie travaillée, volet produit immersif et expérience d\'achat d\'exception.',
    specifications: {
      pagesCount: 4,
      pagesList: [
        { name: 'Page Manifeste', desc: 'Présentation de la maison et histoire de la marque.' },
        { name: 'Page Collections', desc: 'Vitrine immersive avec visuels HD.' },
        { name: 'Page Fiche Immersive', desc: 'Description poétique et détails de confection.' },
        { name: 'Panier Reçu Minimal', desc: 'Reçu élégant transmis sur WhatsApp.' },
      ],
      carousels: [
        { name: 'Hero Minimal', count: 2, where: 'Page Accueil' },
      ],
      configurables: [
        { key: 'brand_story', label: 'Histoire de la Marque', type: 'text' },
      ],
    },
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
    subSector: 'boutique_food',
    name: 'Supermarché & Épicerie Express',
    tagline: 'Supermarché, Produits frais, Épicerie fine',
    emoji: '🍎',
    badge: 'Express',
    badgeColor: '#059669',
    preview: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #064E3B 100%)',
    accentHex: '#059669',
    description: 'Optimisé pour les achats quotidiens et épiceries. Rayons filtrables, recherche instantanée et commande rapide.',
    specifications: {
      pagesCount: 3,
      pagesList: [
        { name: 'Page Rayons', desc: 'Barre de recherche rapide et filtres par rayon (Frais, Boissons, Épicerie).' },
        { name: 'Page Promos du Jour', desc: 'Articles en réduction quotidienne.' },
        { name: 'Panier Panier-Express', desc: 'Commande rapide pour livraison à domicile.' },
      ],
      carousels: [
        { name: 'Promos Semaine', count: 3, where: 'Page Rayons' },
      ],
      configurables: [
        { key: 'fresh_badges', label: 'Badges Produits Frais', type: 'toggle' },
      ],
    },
    theme: {
      primaryColor: '#059669',
      secondaryColor: '#FFFFFF',
      accentColor: '#F59E0B',
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
  {
    id: 'artisan_resto_gourmet',
    sector: 'artisan',
    subSector: 'artisan_resto',
    name: 'Bistro & Restaurant Gourmet',
    tagline: 'Restaurant, Café, Bar, Boulangerie, Traiteur',
    emoji: '🍷',
    badge: 'Gastronomie',
    badgeColor: '#C87D55',
    preview: 'linear-gradient(135deg, #1C0A00 0%, #C87D55 50%, #FF6B35 100%)',
    accentHex: '#C87D55',
    description: 'Template complet pour métiers de la table. Carte du chef interactive, réservations de table WhatsApp en direct et horaires live.',
    specifications: {
      pagesCount: 5,
      pagesList: [
        { name: 'Page Accueil', desc: 'Hero visuel, spécialité du chef et statut ouvert/fermé.' },
        { name: 'Page Carte & Menus', desc: 'Entrées, plats, desserts et boissons avec photos et allergènes.' },
        { name: 'Page Réservation', desc: 'Formulaire de réservation de table avec choix date/heure/couverts.' },
        { name: 'Page Événements', desc: 'Soirées à thème et privatisation.' },
        { name: 'Page Accès & Horaires', desc: 'Plan Google Maps et horaires de service.' },
      ],
      carousels: [
        { name: 'Plats du Chef', count: 4, where: 'Page Accueil' },
      ],
      configurables: [
        { key: 'table_booking', label: 'Module de Réservation de Table', type: 'booking' },
        { key: 'menu_card', label: 'Carte des Plats & Boissons', type: 'menu' },
        { key: 'chef_special', label: 'Plat du Jour Spécial', type: 'highlight' },
      ],
    },
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
    subSector: 'artisan_beaute',
    name: 'Atelier & Salon de Beauté',
    tagline: 'Salon de coiffure, Spa, Couturier, Artisanat d\'art',
    emoji: '✂️',
    badge: 'Savoir-Faire',
    badgeColor: '#EC4899',
    preview: 'linear-gradient(135deg, #831843 0%, #EC4899 50%, #FDF2F8 100%)',
    accentHex: '#EC4899',
    description: 'Sublime le savoir-faire artisanal et les soins sur-mesure. Prise de rendez-vous horodatée, galerie de créations et tarifs.',
    specifications: {
      pagesCount: 4,
      pagesList: [
        { name: 'Page Accueil', desc: 'Présentation de l\'équipe et des prestations phares.' },
        { name: 'Page Soins & Tarifs', desc: 'Grille tarifaire détaillée des prestations.' },
        { name: 'Page Rendez-Vous', desc: 'Prise de RDV par créneau horaire.' },
        { name: 'Page Galerie', desc: 'Portfolio des réalisations et avis clients.' },
      ],
      carousels: [
        { name: 'Galerie Réalisations', count: 6, where: 'Page Galerie' },
      ],
      configurables: [
        { key: 'appointments', label: 'Prise de RDV par créneau', type: 'booking' },
        { key: 'pricing_table', label: 'Grille Tarifaire Prestations', type: 'pricing' },
      ],
    },
    theme: {
      primaryColor: '#EC4899',
      secondaryColor: '#FDF2F8',
      accentColor: '#831843',
      fontFamily: 'Inter',
      mode: 'light',
    },
    modules: ['vitrine', 'services', 'contact'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTEUR 3 : PRESTATAIRE & SERVICES 💼
// ═══════════════════════════════════════════════════════════════════════════
const PRESTATAIRE_TEMPLATES = [
  {
    id: 'presta_agence_corporate',
    sector: 'prestataire',
    subSector: 'presta_agence',
    name: 'Agence & Corporate Pro',
    tagline: 'Cabinet conseil, Agence web, Immobilière, Services B2B',
    emoji: '🏢',
    badge: 'Business Pro',
    badgeColor: '#6366F1',
    preview: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
    accentHex: '#6366F1',
    description: 'Présentation institutionnelle haut de gamme. Packs de services, devis estimatif automatique et prise de contact rapide.',
    specifications: {
      pagesCount: 5,
      pagesList: [
        { name: 'Page Accueil', desc: 'Chiffres clés, valeurs et services principaux.' },
        { name: 'Page Services & Packs', desc: 'Détail des formules et options.' },
        { name: 'Page Demande de Devis', desc: 'Formulaire d\'estimation express.' },
        { name: 'Page Études de Cas', desc: 'Témoignages et projets réalisés.' },
        { name: 'Page Contact', desc: 'Formulaire et coordonnées d\'agence.' },
      ],
      carousels: [
        { name: 'Témoignages Clients', count: 4, where: 'Page Accueil' },
      ],
      configurables: [
        { key: 'devis_builder', label: 'Générateur de Devis Express', type: 'quote' },
        { key: 'service_packs', label: 'Packs & Tarifs d\'Intervention', type: 'packs' },
      ],
    },
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
    subSector: 'presta_freelance',
    name: 'Freelance & Consultant Portfolio',
    tagline: 'Designer, Développeur, Coach, Photographe, Indépendant',
    emoji: '🚀',
    badge: 'Portfolio',
    badgeColor: '#0052CC',
    preview: 'linear-gradient(135deg, #003087 0%, #0052CC 50%, #F4F6F9 100%)',
    accentHex: '#0052CC',
    description: 'Mettez en valeur votre expertise personnelle. Formulaire de devis direct et réservation de consultation.',
    specifications: {
      pagesCount: 4,
      pagesList: [
        { name: 'Page Bio & Portfolio', desc: 'Présentation et travaux récents.' },
        { name: 'Page Prestations', desc: 'Tarifs horaires et forfaits.' },
        { name: 'Page Consultation', desc: 'Prise de RDV pour appel découvert.' },
        { name: 'Page Contact Direct', desc: 'Lien WhatsApp direct.' },
      ],
      carousels: [
        { name: 'Portfolio Projets', count: 5, where: 'Page Bio' },
      ],
      configurables: [
        { key: 'consultation_booking', label: 'Prise de RDV Consultation', type: 'booking' },
      ],
    },
    theme: {
      primaryColor: '#0052CC',
      secondaryColor: '#F4F6F9',
      accentColor: '#FF6B00',
      fontFamily: 'Inter',
      mode: 'light',
    },
    modules: ['vitrine', 'services', 'devis', 'contact'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS & STRUCTURE HIERARCHIQUE
// ═══════════════════════════════════════════════════════════════════════════
export const STORE_TEMPLATES = [
  ...BOUTIQUE_TEMPLATES,
  ...ARTISAN_TEMPLATES,
  ...PRESTATAIRE_TEMPLATES,
];

export const SECTOR_TEMPLATES = {
  boutique: BOUTIQUE_TEMPLATES,
  artisan: ARTISAN_TEMPLATES,
  prestataire: PRESTATAIRE_TEMPLATES,
};

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
      { id: 'boutique_tech', label: 'Électronique & High-Tech', emoji: '📱' },
      { id: 'boutique_fashion', label: 'Mode, Vêtements & Luxe', emoji: '👗' },
      { id: 'boutique_food', label: 'Alimentation & Supermarché', emoji: '🍎' },
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
      { id: 'artisan_resto', label: 'Restauration & Table', emoji: '🍽️' },
      { id: 'artisan_beaute', label: 'Beauté, Coiffure & Soins', emoji: '✂️' },
    ],
  },
  {
    id: 'prestataire',
    label: 'Prestataire & Services',
    emoji: '💼',
    description: 'Services professionnels, agences, consulting et indépenants',
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
  return STORE_TEMPLATES.find(t => t.id === id) || STORE_TEMPLATES[0];
}

export function getTemplatesBySector(sectorId) {
  return SECTOR_TEMPLATES[sectorId] || [];
}

export function getTemplatesBySubSector(subSectorId) {
  return STORE_TEMPLATES.filter(t => t.subSector === subSectorId);
}

export function getTemplate(templateId) {
  return getTemplateById(templateId);
}

export default STORE_TEMPLATES;
