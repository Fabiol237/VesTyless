/**
 * VeStyle — Catalogue Complet des Secteurs, Personas & Templates Sur-Mesure
 * Chaque template est calibré pour donner l'impression d'avoir été conçu exclusivement pour le métier du commerçant.
 */

export const STORE_TEMPLATES = [
  // ── 1. RESTAURATION & GASTRONOMIE 🍽️ ──
  {
    id: 'restaurant',
    sector: 'gastronomie',
    subSector: 'resto_gourmand',
    name: 'Table Gourmande & Lounge',
    tagline: 'Menu du chef, réservations & commande express',
    emoji: '🍽️',
    badge: 'Gastronomie',
    badgeColor: '#EA580C',
    preview: 'linear-gradient(135deg, #1C0A00 0%, #3B1604 50%, #C87D55 100%)',
    accentHex: '#EA580C',
    description: 'Ambiance feutrée, carte des vins, plats mijotés, indication des temps de cuisson et réservation de table intégrée.',
    theme: {
      primaryColor: '#EA580C',
      secondaryColor: '#1C0A00',
      accentColor: '#C87D55',
      fontFamily: "'Outfit', sans-serif",
      mode: 'dark',
    },
    terminology: {
      cartTitle: 'Votre Commande Gourmande',
      orderButton: 'Commander le Menu sur WhatsApp',
      bookingButton: 'Réserver une Table',
      catalogTab: 'La Carte du Chef',
    },
    animationClass: 'animate-steam-warm',
    supports: ['reservations', 'opening_hours', 'spicy_levels', 'cooking_times'],
  },

  // ── 2. HIGH-TECH, SMARTPHONES & GAMING ⚡ ──
  {
    id: 'tech_pro',
    sector: 'high_tech',
    subSector: 'tech_cyber',
    name: 'High-Tech & Cyber Store',
    tagline: 'Fiches techniques, garanties & comparaison specs',
    emoji: '⚡',
    badge: 'High-Tech',
    badgeColor: '#2563EB',
    preview: 'linear-gradient(135deg, #0B0F19 0%, #1E293B 50%, #2563EB 100%)',
    accentHex: '#2563EB',
    description: 'Style Apple/Cyberpunk avec lueurs néon, badges RAM/Stockage, certifications officielles et stock en temps réel.',
    theme: {
      primaryColor: '#2563EB',
      secondaryColor: '#0F172A',
      accentColor: '#38BDF8',
      fontFamily: 'Inter',
      mode: 'dark',
    },
    terminology: {
      cartTitle: 'Votre Panier Tech',
      orderButton: 'Commander avec Garantie Officielle',
      bookingButton: 'Demander un Diagnostic',
      catalogTab: 'Catalogue Appareils',
    },
    animationClass: 'animate-cyber-glow',
    supports: ['tech_specs', 'warranty_badge', 'stock_gauge', 'comparisons'],
  },

  // ── 3. MODE, HAUTE COUTURE & BIJOUTERIE ✨ ──
  {
    id: 'boutique_luxe',
    sector: 'mode_luxe',
    subSector: 'fashion_couture',
    name: 'Maison Haute Couture & Joaillerie',
    tagline: 'Lookbooks, coupes d\'exception & matières nobles',
    emoji: '✨',
    badge: 'Luxe & Mode',
    badgeColor: '#D4AF37',
    preview: 'linear-gradient(135deg, #FAF8F3 0%, #F5EFEB 50%, #D4AF37 100%)',
    accentHex: '#D4AF37',
    description: 'Esthétique éditoriale Vogue/Aesop avec typographie raffinée, guides des tailles, zoom matières et reflets or.',
    theme: {
      primaryColor: '#D4AF37',
      secondaryColor: '#FAF8F3',
      accentColor: '#1A1814',
      fontFamily: "'Playfair Display', serif",
      mode: 'light',
    },
    terminology: {
      cartTitle: 'Votre Sélection Exclusive',
      orderButton: 'Acquérir la Pièce',
      bookingButton: 'Rendez-vous Showroom Privé',
      catalogTab: 'Nouvelle Collection',
    },
    animationClass: 'animate-gold-shimmer',
    supports: ['size_guide', 'materials_zoom', 'lookbook', 'color_variants'],
  },

  // ── 4. PHARMACIE, SANTÉ & BIEN-ÊTRE 🌿 ──
  {
    id: 'sante_pharma',
    sector: 'sante',
    subSector: 'pharma_care',
    name: 'Officine Santé & Parapharmacie',
    tagline: 'Conseils pharmaceutiques, ordonnances & soins certifiés',
    emoji: '🌿',
    badge: 'Santé & Soins',
    badgeColor: '#10B981',
    preview: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #10B981 100%)',
    accentHex: '#10B981',
    description: 'Interface clinique apaisante, transmission d\'ordonnances sur WhatsApp, posologie claire et conseils pharmaciens.',
    theme: {
      primaryColor: '#10B981',
      secondaryColor: '#F8FAFC',
      accentColor: '#047857',
      fontFamily: 'Inter',
      mode: 'light',
    },
    terminology: {
      cartTitle: 'Vos Produits de Soin',
      orderButton: 'Valider l\'Ordonnance / Panier',
      bookingButton: 'Conseil Pharmacien Express',
      catalogTab: 'Médicaments & Soins',
    },
    animationClass: 'animate-clinical-pulse',
    supports: ['prescription_upload', 'dosage_info', 'certified_seal', 'emergency_contact'],
  },

  // ── 5. SUPERMARCHÉ, FRAIS & ÉPICERIE 🛒 ──
  {
    id: 'supermarche_frais',
    sector: 'supermarche',
    subSector: 'grocery_fresh',
    name: 'Marché Frais & Superette Express',
    tagline: 'Fruits, légumes, surgelés & livraison en 30 min',
    emoji: '🛒',
    badge: 'Supermarché',
    badgeColor: '#059669',
    preview: 'linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 50%, #059669 100%)',
    accentHex: '#059669',
    description: 'Navigation ultra-rapide par rayons, prix au kilo/litre, badge fraîcheur garantie et expédition coursier en 30 minutes.',
    theme: {
      primaryColor: '#059669',
      secondaryColor: '#FFFFFF',
      accentColor: '#F59E0B',
      fontFamily: 'Inter',
      mode: 'light',
    },
    terminology: {
      cartTitle: 'Mon Panier de Courses',
      orderButton: 'Livraison Express 30 min',
      bookingButton: 'Commander par liste WhatsApp',
      catalogTab: 'Tous les Rayons',
    },
    animationClass: 'animate-fresh-pop',
    supports: ['weight_pricing', 'express_delivery_timer', 'freshness_seal', 'bulk_discount'],
  },

  // ── 6. SALON DE COIFFURE, BEAUTÉ & SPA ✂️ ──
  {
    id: 'artisan_beaute',
    sector: 'beaute',
    subSector: 'salon_spa',
    name: 'Salon Beauté, Coiffure & Spa',
    tagline: 'Prestations, durées de soins & réservation en ligne',
    emoji: '✂️',
    badge: 'Beauté & Spa',
    badgeColor: '#E11D48',
    preview: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 50%, #E11D48 100%)',
    accentHex: '#E11D48',
    description: 'Grille des rituels et soins, durée estimée par séance, galerie de réalisations et planning de rendez-vous en direct.',
    theme: {
      primaryColor: '#E11D48',
      secondaryColor: '#FFF1F2',
      accentColor: '#881337',
      fontFamily: "'Outfit', sans-serif",
      mode: 'light',
    },
    terminology: {
      cartTitle: 'Mes Soins Sélectionnés',
      orderButton: 'Prendre Rendez-vous',
      bookingButton: 'Réserver un Créneau',
      catalogTab: 'Prestations & Tarifs',
    },
    animationClass: 'animate-spa-glow',
    supports: ['service_duration', 'portfolio_gallery', 'practitioner_select', 'calendar_booking'],
  },

  // ── 7. COMMERCE UNIVERSEL PRO 🛍️ ──
  {
    id: 'boutique_pro',
    sector: 'boutique',
    subSector: 'boutique_general',
    name: 'Commerce & Vente en Ligne Pro',
    tagline: 'Vente multicanale avec panier WhatsApp & filtres avancés',
    emoji: '🛍️',
    badge: 'E-Commerce',
    badgeColor: '#128C7E',
    preview: 'linear-gradient(135deg, #FAF8F6 0%, #E2E8F0 50%, #128C7E 100%)',
    accentHex: '#128C7E',
    description: 'Le modèle e-commerce tout-en-un équilibré, parfait pour tout type de commerce de détail et grossistes.',
    theme: {
      primaryColor: '#128C7E',
      secondaryColor: '#F8F8F6',
      accentColor: '#075E54',
      fontFamily: 'Inter',
      mode: 'light',
    },
    terminology: {
      cartTitle: 'Mon Panier',
      orderButton: 'Finaliser la Commande',
      bookingButton: 'Contacter la Boutique',
      catalogTab: 'Catalogue Produits',
    },
    animationClass: 'animate-fade-in',
    supports: ['multi_categories', 'promotions', 'customer_reviews', 'fast_checkout'],
  },

  // ── 8. PRESTATAIRE B2B & CONSULTING 💼 ──
  {
    id: 'presta_services',
    sector: 'services',
    subSector: 'b2b_agency',
    name: 'Agence & Services Professionnels',
    tagline: 'Demande de devis sur-mesure & portfolio clients',
    emoji: '💼',
    badge: 'B2B & Services',
    badgeColor: '#6366F1',
    preview: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #6366F1 100%)',
    accentHex: '#6366F1',
    description: 'Présentation de compétences, études de cas, tarification transparente et générateur instantané de devis chiffré.',
    theme: {
      primaryColor: '#6366F1',
      secondaryColor: '#0F172A',
      accentColor: '#A5B4FC',
      fontFamily: 'Inter',
      mode: 'dark',
    },
    terminology: {
      cartTitle: 'Prestations Sélectionnées',
      orderButton: 'Demander un Devis Détaillé',
      bookingButton: 'Prendre Rendez-vous Conseil',
      catalogTab: 'Nos Services & Expertises',
    },
    animationClass: 'animate-cyber-glow',
    supports: ['instant_quote', 'case_studies', 'service_tiers', 'client_testimonials'],
  },

  // ── 9. LIBRAIRIE & ÉDUCATION 📚 ──
  {
    id: 'boutique_livres_scolaires',
    sector: 'education',
    subSector: 'bookstore_edu',
    name: 'Librairie & Manuels Scolaires',
    tagline: 'Livres, PDF, fournitures & kits d\'examen',
    emoji: '📚',
    badge: 'Éducation',
    badgeColor: '#25D366',
    preview: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #25D366 100%)',
    accentHex: '#25D366',
    description: 'Recherche par classe / niveau scolaire, téléchargement instantané d\'extraits et kits complets de rentrée scolaire.',
    theme: {
      primaryColor: '#25D366',
      secondaryColor: '#FFFFFF',
      accentColor: '#065F46',
      fontFamily: 'Inter',
      mode: 'light',
    },
    terminology: {
      cartTitle: 'Ma Liste de Livres',
      orderButton: 'Commander les Fournitures',
      bookingButton: 'Demander un Devis École',
      catalogTab: 'Manuels & Livres',
    },
    animationClass: 'animate-fade-in',
    supports: ['school_levels', 'pdf_preview', 'exam_bundles', 'reading_samples'],
  }
];

/**
 * @deprecated Remplacé par BusinessTypeRegistry (source de vérité unique).
 * Conservé pour la rétrocompatibilité des sélecteurs de presets de templates historiques.
 */
export const SECTORS = [
  { id: 'all', label: 'Tous les Métiers', emoji: '✨' },
  { id: 'gastronomie', label: 'Restauration & Food', emoji: '🍽️' },
  { id: 'high_tech', label: 'High-Tech & Gadgets', emoji: '⚡' },
  { id: 'mode_luxe', label: 'Mode & Haute Couture', emoji: '✨' },
  { id: 'sante', label: 'Santé & Pharmacie', emoji: '🌿' },
  { id: 'supermarche', label: 'Supermarché & Frais', emoji: '🛒' },
  { id: 'beaute', label: 'Beauté, Coiffure & Spa', emoji: '✂️' },
  { id: 'boutique', label: 'Commerce Général', emoji: '🛍️' },
  { id: 'services', label: 'Services & Agence', emoji: '💼' },
  { id: 'education', label: 'Librairie & Éducation', emoji: '📚' },
];

/**
 * Pont explicite de normalisation pour les anciens identifiants de secteurs
 */
export const LEGACY_SECTOR_TO_BUSINESS_TYPE = {
  gastronomie: 'restaurant',
  high_tech: 'product',
  mode_luxe: 'product',
  sante: 'product',
  supermarche: 'product',
  beaute: 'beauty',
  boutique: 'product',
  services: 'service',
  education: 'education',
};

export function getTemplateById(id) {
  return STORE_TEMPLATES.find(t => t.id === id) || STORE_TEMPLATES[0];
}

export function getTemplatesBySector(sectorId) {
  if (!sectorId || sectorId === 'all') return STORE_TEMPLATES;
  return STORE_TEMPLATES.filter(t => t.sector === sectorId);
}
