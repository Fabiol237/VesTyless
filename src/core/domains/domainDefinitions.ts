/**
 * VesTyle V1 — Domain Definitions & Strict Taxonomy
 * ─────────────────────────────────────────────────────────────────────────────
 * Définition officielle et immuable des 9 Domaines Métier de VesTyle
 * et de leurs catégories associées.
 */

export interface DomainCategory {
  id: string;
  name: string;
  description?: string;
  suggestedTags?: string[];
  defaultCapabilities?: string[];
}

export interface DomainDefinition {
  id: string;
  name: string;
  slug: string;
  icon: string;
  badge: string;
  color: string;
  description: string;
  categories: DomainCategory[];
  defaultCapabilities: string[];
  recommendedDesigns: string[];
}

export const VESTYLE_DOMAINS: Record<string, DomainDefinition> = {
  vendeur: {
    id: 'vendeur',
    name: 'Vendeur (Commerce & E-Commerce)',
    slug: 'vendeur',
    icon: 'ShoppingBag',
    badge: 'E-Commerce & Vente',
    color: '#10B981',
    description: 'Boutiques de vente au détail et en gros, magasins physiques et e-commerce.',
    defaultCapabilities: [
      'PRODUCTS',
      'INVENTORY',
      'ORDERS',
      'STOCK_LOGS',
      'CUSTOMERS',
      'DELIVERY',
      'PROMOTIONS',
      'WHATSAPP_COMMERCE',
      'REVIEWS'
    ],
    categories: [
      { id: 'mode', name: 'Mode & Habillement', suggestedTags: ['vetements', 'chaussures', 'accessoires', 'sacs'] },
      { id: 'alimentation', name: 'Alimentation & Épicerie', suggestedTags: ['vivres', 'produits frais', 'boissons'] },
      { id: 'beaute', name: 'Beauté & Cosmétiques', suggestedTags: ['soins', 'maquillage', 'parfums', 'capillaire'] },
      { id: 'maison', name: 'Maison & Décoration', suggestedTags: ['meubles', 'electromenager', 'literie'] },
      { id: 'technologie', name: 'Technologie & Gadgets', suggestedTags: ['telephones', 'ordinateurs', 'accessoires'] },
      { id: 'auto_moto', name: 'Auto & Moto', suggestedTags: ['pieces', 'accessoires', 'pneumatique'] },
      { id: 'construction', name: 'Construction & Quincaillerie', suggestedTags: ['materiaux', 'outillage', 'peinture'] },
      { id: 'agriculture', name: 'Agriculture & Élevage', suggestedTags: ['volaille', 'betail', 'semences', 'aliments'] },
      { id: 'sport_loisirs', name: 'Sport & Loisirs', suggestedTags: ['fitness', 'equipements', 'jeux'] },
      { id: 'enfants_animaux', name: 'Enfants & Animaux', suggestedTags: ['jouets', 'puericulture', 'animalerie'] },
      { id: 'autres', name: 'Autres Commerces', suggestedTags: ['divers', 'artisanat'] },
    ],
    recommendedDesigns: ['vst_dsn_prestige_atelier_001', 'vst_dsn_commerce_librairie_006', 'vst_dsn_agro_elevage_004']
  },

  hebergement: {
    id: 'hebergement',
    name: 'Hébergement (Hôtels & Résidences)',
    slug: 'hebergement',
    icon: 'Building2',
    badge: 'Réservation de Séjour',
    color: '#3B82F6',
    description: 'Hôtels, résidences meublées, appartements d’hôtes et complexes touristiques.',
    defaultCapabilities: [
      'ROOMS',
      'AVAILABILITY',
      'BOOKINGS',
      'GUESTS',
      'PRICING_SEASONS',
      'AMENITIES',
      'REVIEWS',
      'WHATSAPP_BOOKING'
    ],
    categories: [
      { id: 'hotel', name: 'Hôtel', suggestedTags: ['chambres', 'suites', 'piscine', 'room-service'] },
      { id: 'residence', name: 'Résidence Meublée', suggestedTags: ['appartement', 'studio', 'longue duree'] },
      { id: 'location', name: 'Location Courte Durée', suggestedTags: ['vacances', 'villa', 'airbnb'] },
      { id: 'tourisme', name: 'Tourisme & Éco-Lodge', suggestedTags: ['nature', 'bungalow', 'safari'] },
      { id: 'autres', name: 'Autres Hébergements', suggestedTags: ['auberge', 'dortoir'] },
    ],
    recommendedDesigns: ['vst_dsn_location_standing_005', 'vst_dsn_services_vip_003']
  },

  restauration: {
    id: 'restauration',
    name: 'Restauration (Restaurants, Cafés & Traiteurs)',
    slug: 'restauration',
    icon: 'Utensils',
    badge: 'Menu & Réservation Table',
    color: '#F97316',
    description: 'Restaurants gastronomiques, maquis, snacks, cafés, pâtisseries et services traiteur.',
    defaultCapabilities: [
      'MENU',
      'TABLES',
      'RESTAURANT_ORDERS',
      'RESERVATIONS',
      'DELIVERY',
      'ALLERGENS',
      'WHATSAPP_ORDERING'
    ],
    categories: [
      { id: 'restaurant', name: 'Restaurant', suggestedTags: ['gastronomie', 'plats', 'grillades', 'poisson braise'] },
      { id: 'cafe', name: 'Café & Salon de Thé', suggestedTags: ['boissons', 'petit-dejeuner', 'brunch'] },
      { id: 'bar', name: 'Bar & Lounge', suggestedTags: ['cocktails', 'tapas', 'ambiance'] },
      { id: 'traiteur', name: 'Traiteur & Événements', suggestedTags: ['buffet', 'cocktail dinatoire', 'mariage'] },
      { id: 'boulangerie_patisserie', name: 'Boulangerie & Pâtisserie', suggestedTags: ['gateaux', 'pain', 'viennoiserie'] },
      { id: 'autres', name: 'Autres Restauration', suggestedTags: ['fast-food', 'food-truck'] },
    ],
    recommendedDesigns: ['vst_dsn_resto_terroir_002', 'vst_dsn_prestige_atelier_001']
  },

  services: {
    id: 'services',
    name: 'Services (Prestations, RDV & Devis)',
    slug: 'services',
    icon: 'Briefcase',
    badge: 'Prise de RDV & Devis',
    color: '#8B5CF6',
    description: 'Salons de coiffure, agences, consultants, réparateurs, cabinets et artisans.',
    defaultCapabilities: [
      'SERVICES',
      'APPOINTMENTS',
      'REQUESTS',
      'STAFF',
      'PORTFOLIO',
      'REVIEWS',
      'WHATSAPP_LEADS'
    ],
    categories: [
      { id: 'particuliers', name: 'Services aux particuliers', suggestedTags: ['menage', 'jardinage', 'plomberie', 'electricite'] },
      { id: 'entreprises', name: 'Services aux entreprises (B2B)', suggestedTags: ['audit', 'comptabilite', 'marketing', 'it'] },
      { id: 'techniques', name: 'Services techniques & Dépannage', suggestedTags: ['reparation', 'maintenance', 'installation'] },
      { id: 'professionnels', name: 'Services professionnels & Juridiques', suggestedTags: ['avocat', 'conseil', 'cabinet'] },
      { id: 'beaute_soin', name: 'Beauté, Coiffure & Soins', suggestedTags: ['salon', 'tresses', 'barbier', 'spa'] },
      { id: 'transport_livraison', name: 'Transport & Livraison', suggestedTags: ['coursier', 'demenagement', 'fret'] },
      { id: 'autres', name: 'Autres Services', suggestedTags: ['divers'] },
    ],
    recommendedDesigns: ['vst_dsn_services_vip_003', 'vst_dsn_location_standing_005']
  },

  education: {
    id: 'education',
    name: 'Éducation (Écoles & Formations)',
    slug: 'education',
    icon: 'GraduationCap',
    badge: 'Cours & Inscriptions',
    color: '#06B6D4',
    description: 'Écoles primaires/secondaires, instituts de formation, tuteurs et académies en ligne.',
    defaultCapabilities: [
      'COURSES',
      'STUDENTS',
      'ENROLLMENTS',
      'PROGRAMS',
      'TUTORS',
      'CERTIFICATIONS',
      'WHATSAPP_ENROLLMENT'
    ],
    categories: [
      { id: 'ecole', name: 'École & Collège / Lycée', suggestedTags: ['primaire', 'secondaire', 'bilingue'] },
      { id: 'formation', name: 'Centre de Formation Professionnelle', suggestedTags: ['metiers', 'certifications', 'pratique'] },
      { id: 'superieur', name: 'Enseignement Supérieur & Université', suggestedTags: ['licence', 'master', 'faculte'] },
      { id: 'en_ligne', name: 'Formation en Ligne & E-Learning', suggestedTags: ['cours video', 'webinaires', 'bootcamp'] },
      { id: 'autres', name: 'Autres Éducation', suggestedTags: ['cours du soir', 'soutien scolaire'] },
    ],
    recommendedDesigns: ['vst_dsn_commerce_librairie_006', 'vst_dsn_services_vip_003']
  },

  sante: {
    id: 'sante',
    name: 'Santé & Pharmacie',
    slug: 'sante',
    icon: 'HeartPulse',
    badge: 'Consultations & Pharmacie',
    color: '#EC4899',
    description: 'Cliniques, cabinets médicaux, pharmacies, laboratoires et centres de bien-être.',
    defaultCapabilities: [
      'HEALTH_SERVICES',
      'CONSULTATIONS',
      'PATIENTS',
      'DUTY_HOURS',
      'PHARMACY_CATALOG',
      'EMERGENCY_CONTACT',
      'WHATSAPP_HEALTH'
    ],
    categories: [
      { id: 'sante', name: 'Santé & Clinique', suggestedTags: ['medecine', 'consultations', 'urgence'] },
      { id: 'pharmacie', name: 'Pharmacie & Parapharmacie', suggestedTags: ['medicaments', 'garde', 'ordonnances'] },
      { id: 'laboratoire', name: 'Laboratoire d’Analyses', suggestedTags: ['tests', 'bilan sanguin', 'depistage'] },
      { id: 'bien_etre', name: 'Bien-être & Thérapie', suggestedTags: ['nutrition', 'kinesitherapie', 'psychologie'] },
      { id: 'autres', name: 'Autres Santé', suggestedTags: ['optique', 'dentaire'] },
    ],
    recommendedDesigns: ['vst_dsn_services_vip_003', 'vst_dsn_location_standing_005']
  },

  immobilier_transport: {
    id: 'immobilier_transport',
    name: 'Immobilier & Transport',
    slug: 'immobilier-transport',
    icon: 'Car',
    badge: 'Biens & Véhicules',
    color: '#EAB308',
    description: 'Agences immobilières, promoteurs, location de véhicules, logistique et agences de voyage.',
    defaultCapabilities: [
      'PROPERTIES',
      'VEHICLES',
      'RENTALS',
      'LOGISTICS',
      'VIEWINGS',
      'INSPECTIONS',
      'WHATSAPP_BOOKING'
    ],
    categories: [
      { id: 'immobilier', name: 'Immobilier & Agence', suggestedTags: ['vente terrain', 'location appartement', 'villas'] },
      { id: 'architecture', name: 'Architecture & Construction', suggestedTags: ['plans', 'chantier', 'ingenierie'] },
      { id: 'transport', name: 'Transport de Personnes', suggestedTags: ['navette', 'chauffeur VIP', 'bus'] },
      { id: 'logistique', name: 'Logistique & Fret', suggestedTags: ['colis', 'container', 'import-export'] },
      { id: 'location_vehicules', name: 'Location de Véhicules', suggestedTags: ['voitures', '4x4', 'utilitaires'] },
      { id: 'voyage', name: 'Voyage & Billetterie', suggestedTags: ['vols', 'circuits', 'sejours'] },
      { id: 'autres', name: 'Autres Immobilier/Transport', suggestedTags: ['gardiennage', 'transit'] },
    ],
    recommendedDesigns: ['vst_dsn_location_standing_005', 'vst_dsn_prestige_atelier_001']
  },

  creation_medias: {
    id: 'creation_medias',
    name: 'Création & Médias',
    slug: 'creation-medias',
    icon: 'Palette',
    badge: 'Portfolio & Médias',
    color: '#A855F7',
    description: 'Photographes, vidéastes, studios d’art, créateurs de contenu, médias et designers.',
    defaultCapabilities: [
      'PORTFOLIO',
      'PROJECTS',
      'MEDIA',
      'SERVICES',
      'RATE_CARD',
      'CLIENT_REVIEWS',
      'WHATSAPP_BOOKING'
    ],
    categories: [
      { id: 'creation', name: 'Création & Design Graphique', suggestedTags: ['branding', 'ui-ux', 'illustration'] },
      { id: 'arts', name: 'Arts & Artisanat d’Art', suggestedTags: ['sculpture', 'peinture', 'modele'] },
      { id: 'photo_video', name: 'Photographie & Vidéo', suggestedTags: ['shooting', 'mariage', 'clip', 'drone'] },
      { id: 'medias', name: 'Médias & Presse', suggestedTags: ['journal', 'podcast', 'blog', 'chaine'] },
      { id: 'evenementiel', name: 'Événementiel & Spectacle', suggestedTags: ['dj', 'decorateur', 'scene'] },
      { id: 'contenu_numerique', name: 'Contenu Numérique & Influence', suggestedTags: ['youtube', 'tiktok', 'formation video'] },
      { id: 'autres', name: 'Autres Création', suggestedTags: ['musique', 'edition'] },
    ],
    recommendedDesigns: ['vst_dsn_prestige_atelier_001', 'vst_dsn_commerce_librairie_006']
  },

  organisations: {
    id: 'organisations',
    name: 'Organisations & Entreprises',
    slug: 'organisations',
    icon: 'Landmark',
    badge: 'Institution & Entreprise',
    color: '#64748B',
    description: 'Entreprises, startups, associations, ONG, institutions publiques et portfolios personnels.',
    defaultCapabilities: [
      'TEAM',
      'ORGANIZATION_INFO',
      'ANNOUNCEMENTS',
      'SERVICES',
      'PROJECTS',
      'CONTACTS',
      'MEMBERSHIPS'
    ],
    categories: [
      { id: 'entreprise', name: 'Entreprise & Corporate', suggestedTags: ['societe', 'siege', 'filiales'] },
      { id: 'startup', name: 'Startup & Innovation', suggestedTags: ['tech', 'investisseurs', 'produit'] },
      { id: 'association_ong', name: 'Association & ONG', suggestedTags: ['humanitaire', 'dons', 'benevoles'] },
      { id: 'institution', name: 'Institution & Organisme Public', suggestedTags: ['ministere', 'mairie', 'syndicat'] },
      { id: 'communaute', name: 'Communauté & Club', suggestedTags: ['reseau', 'membres', 'evenements'] },
      { id: 'personnel_portfolio', name: 'Personnel & Portfolio Pro', suggestedTags: ['cv', 'consultant', 'chercheur'] },
      { id: 'autres', name: 'Autres Organisations', suggestedTags: ['fondation'] },
    ],
    recommendedDesigns: ['vst_dsn_commerce_librairie_006', 'vst_dsn_services_vip_003']
  }
};

/**
 * Résout la définition canonique d'un domaine.
 */
export function getDomainById(domainId: string): DomainDefinition {
  const norm = String(domainId || '').trim().toLowerCase();
  if (VESTYLE_DOMAINS[norm]) return VESTYLE_DOMAINS[norm];
  return VESTYLE_DOMAINS.vendeur;
}

/**
 * Récupère toutes les catégories d'un domaine donné.
 */
export function getCategoriesByDomain(domainId: string): DomainCategory[] {
  const domain = getDomainById(domainId);
  return domain.categories || [];
}

/**
 * Valide si une catégorie appartient bien au domaine spécifié.
 */
export function validateCategoryForDomain(domainId: string, categoryId: string): boolean {
  const cats = getCategoriesByDomain(domainId);
  return cats.some(c => c.id === categoryId);
}
