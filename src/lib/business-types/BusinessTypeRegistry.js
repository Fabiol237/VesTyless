/**
 * VesTyle — Registre Central des Types d'Activités (BusinessTypeRegistry)
 * ─────────────────────────────────────────────────────────────────────────────
 * SOURCE DE VÉRITÉ UNIQUE pour l'identité métier du vendeur dans Vestin.
 * 
 * Moteur métier permettant à toute l'application (Onboarding, Dashboard,
 * Éditeur, CapabilityEngine, CompositionEngine, UniversalStorefront) de :
 * - Connaître avec précision les 19 types métiers canoniques
 * - Normaliser de façon déterministe les alias historiques (sans conversion silencieuse)
 * - Fournir la terminologie déclarative contextuelle
 * - Fournir les options UI officielles pour l'onboarding et les formulaires
 * - Exposer les capacités, composants recommandés et incompatibles
 *
 * EXTENSIBILITÉ :
 * Permet d'enregistrer des types métiers personnalisés via `businessTypeRegistry.register()`.
 */

import { BUSINESS_TYPE_DEFINITIONS } from './businessTypeDefinitions.js';

/**
 * Table exhaustive et explicite des correspondances historiques (Legacy Aliases).
 * Tout mapping est rigoureusement justifié et documenté.
 */
export const EXPLICIT_LEGACY_ALIASES = {
  // Alias de commerce de détail standard → product
  ecommerce: 'product',
  products: 'product',
  boutique: 'product',
  tech: 'product',
  high_tech: 'product',
  gadgets: 'product',
  fashion: 'product',
  mode: 'product',
  mode_luxe: 'product',
  vetement: 'product',
  habit: 'product',
  supermarket: 'product',
  supermarche: 'product',
  epicerie: 'product',
  furniture: 'product',
  deco: 'product',
  sante: 'product',
  pharma: 'product',

  // Alias de prestations de services → service
  services: 'service',
  prestataire: 'service',

  // Alias de restauration → restaurant
  restauration: 'restaurant',
  gastronomie: 'restaurant',
  food: 'restaurant',
  bakery: 'restaurant',
  boulangerie: 'restaurant',
  patisserie: 'restaurant',

  // Alias de soins / coiffure → hair_salon / beauty
  barber: 'hair_salon',
  coiffure: 'hair_salon',
  salon: 'hair_salon',
  hairdresser: 'hair_salon',
  spa: 'beauty',
  cosmetique: 'beauty',

  // Alias d'événements & contenu → event / digital_service
  events: 'event',
  content: 'digital_service',

  // Alias d'immobilier & transport / technique
  realestate: 'real_estate',
  immo: 'real_estate',
  immobilier: 'real_estate',
  garage: 'automotive',
  auto: 'automotive',
  sport: 'fitness',
  gym: 'fitness',
  b2b: 'business',
  corporate: 'business',
};

/**
 * Alias ambigus : termes historiques trop génériques pour être mappés sans précaution.
 * Le système documente la raison et fournit des candidats explicites.
 */
export const AMBIGUOUS_LEGACY_ALIASES = {
  creative: {
    candidates: ['digital_service', 'photography', 'artisan', 'event'],
    reason: 'Le terme "creative" peut désigner du graphisme (digital_service), de la photographie, de l\'artisanat ou de l\'événementiel.',
  },
  wellness: {
    candidates: ['beauty', 'hair_salon', 'fitness'],
    reason: 'Le terme "wellness" peut désigner un institut de beauté, un salon de coiffure ou une activité de fitness/yoga.',
  },
  other: {
    candidates: ['product', 'service', 'hybrid', 'business'],
    reason: 'Le terme "other" est un état UI générique non résolu sans secteur d\'activité canonique déterminé.',
  },
};

/**
 * Catalogue centralisé des sous-secteurs par type d'activité canonique (Master Prompt 1/5).
 * Fournit une structure déclarative riche et exploitable sans if businessType dispersés.
 */
export const CANONICAL_SUB_SECTORS = Object.freeze({
  product: [
    { id: 'clothing_fashion', label: 'Mode & Habillement', emoji: '👗', description: 'Prêt-à-porter, vêtements et collections saisonnières' },
    { id: 'shoes_sneakers', label: 'Chaussures & Baskets', emoji: '👟', description: 'Chaussures de ville, baskets, sandales et maroquinerie' },
    { id: 'electronics_tech', label: 'High-Tech & Électronique', emoji: '📱', description: 'Smartphones, accessoires, ordinateurs et gadgets' },
    { id: 'accessories_jewelry', label: 'Bijoux & Accessoires', emoji: '💍', description: 'Bijouterie, montres, sacs, ceintures et lunettes' },
    { id: 'home_decor', label: 'Maison & Décoration', emoji: '🛋️', description: 'Mobilier, luminaires, linge de maison et design intérieur' },
    { id: 'sports_outdoors', label: 'Sport & Plein Air', emoji: '⚽', description: 'Équipements de sport, fitness et loisirs outdoor' },
    { id: 'kids_toys', label: 'Enfants & Bébés', emoji: '🧸', description: 'Jouets, puériculture et vêtements enfants' },
    { id: 'general_retail', label: 'Commerce Général', emoji: '🛍️', description: 'Boutique généraliste et articles divers' },
  ],
  service: [
    { id: 'consulting', label: 'Conseil & Stratégie', emoji: '📊', description: 'Conseil en gestion, audit, stratégie et organisation' },
    { id: 'legal_accounting', label: 'Juridique & Comptabilité', emoji: '⚖️', description: 'Services juridiques, fiscalité et expertise comptable' },
    { id: 'cleaning_maintenance', label: 'Entretien & Nettoyage', emoji: '🧹', description: 'Nettoyage professionnel de locaux et entretien' },
    { id: 'events_planning', label: 'Organisation d\'Événements', emoji: '🎉', description: 'Planification d\'événements professionnels et privés' },
    { id: 'coaching_training', label: 'Coaching & Formation', emoji: '🎯', description: 'Coaching personnel, professionnel et formations' },
  ],
  restaurant: [
    { id: 'traditional_resto', label: 'Restaurant Traditionnel', emoji: '🍽️', description: 'Cuisine locale, plats cuisinés et service à table' },
    { id: 'fast_food', label: 'Restauration Rapide / Fast-Food', emoji: '🍔', description: 'Burgers, grillades, snacks et plats à emporter' },
    { id: 'bakery_pastry', label: 'Boulangerie & Pâtisserie', emoji: '🥐', description: 'Pains frais, viennoiseries, gâteaux et douceurs' },
    { id: 'catering_traiteur', label: 'Service Traiteur', emoji: '🍱', description: 'Traiteur pour réceptions, mariages et événements' },
    { id: 'bar_lounge', label: 'Bar & Lounge', emoji: '🍸', description: 'Cocktails, tapas et ambiance musicale' },
    { id: 'cafe_tea', label: 'Café & Salon de Thé', emoji: '☕', description: 'Cafés de spécialité, thés et petites douceurs' },
  ],
  hair_salon: [
    { id: 'barbershop', label: 'Barbershop & Coiffure Homme', emoji: '💈', description: 'Coupes hommes, taille de barbe et soins masculins' },
    { id: 'womens_hair', label: 'Salon de Coiffure Femme', emoji: '💇‍♀️', description: 'Coupes, brushings, colorations et lissages' },
    { id: 'braiding_locks', label: 'Tresses, Nattes & Locks', emoji: '✨', description: 'Tresses africaines, dreadlocks et coiffures protectrices' },
    { id: 'hair_spa', label: 'Soins Capillaires & Spa', emoji: '💆‍♀️', description: 'Traitements profonds, soins du cuir chevelu et détente' },
  ],
  beauty: [
    { id: 'cosmetics_makeup', label: 'Cosmétiques & Maquillage', emoji: '💄', description: 'Produits de beauté, maquillage pro et accessoires' },
    { id: 'skincare_dermatology', label: 'Soins de la Peau (Skincare)', emoji: '🧴', description: 'Soins du visage, crèmes dermatologiques et sérums' },
    { id: 'nail_bar', label: 'Onglerie & Manucure', emoji: '💅', description: 'Pose vernis semi-permanent, gel, nail art et pédicure' },
    { id: 'spa_massage', label: 'Institut Spa & Massage', emoji: '🧖‍♀️', description: 'Massages relaxants, gommages et soins corporels' },
    { id: 'perfumery', label: 'Parfumerie & Fragrances', emoji: '🌸', description: 'Parfums de luxe, brumes et eaux de toilette' },
  ],
  hotel: [
    { id: 'boutique_hotel', label: 'Hôtel & Résidence', emoji: '🏨', description: 'Chambres d\'hôtel avec conciergerie et services' },
    { id: 'guest_house', label: 'Maison d\'Hôtes & Auberge', emoji: '🏡', description: 'Séjour chaleureux et convivial' },
    { id: 'resort', label: 'Complexe Touristique & Resort', emoji: '🌴', description: 'Villages vacances, piscines et activités' },
    { id: 'furnished_apartment', label: 'Appartements Meublés', emoji: '🛋️', description: 'Locations meublées court et moyen séjour' },
  ],
  real_estate: [
    { id: 'agency_sale_rent', label: 'Agence Vente & Location', emoji: '🏢', description: 'Transactions immobilières, maisons, appartements et terrains' },
    { id: 'commercial_property', label: 'Immobilier Commercial', emoji: '🏬', description: 'Bureaux, boutiques et entrepôts' },
    { id: 'developer_promoter', label: 'Promotion Immobilière', emoji: '🏗️', description: 'Programmes neufs et constructions' },
  ],
  automotive: [
    { id: 'mechanic_garage', label: 'Garage & Mécanique', emoji: '🔧', description: 'Réparation, diagnostic et entretien de véhicules' },
    { id: 'car_dealership', label: 'Vente de Véhicules', emoji: '🚗', description: 'Véhicules neufs et d\'occasion' },
    { id: 'car_wash_detailing', label: 'Lavage & Detailing Auto', emoji: '✨', description: 'Nettoyage vapeur, lustrage et protection céramique' },
    { id: 'spare_parts', label: 'Pièces Détachées', emoji: '⚙️', description: 'Pièces auto/moto d\'origine et accessoires' },
  ],
  fitness: [
    { id: 'gym_club', label: 'Salle de Sport & Musculation', emoji: '🏋️‍♂️', description: 'Abonnements fitness, machines et cours collectifs' },
    { id: 'personal_trainer', label: 'Coach Sportif Privé', emoji: '🏃‍♂️', description: 'Accompagnement personnalisé et suivi nutritionnel' },
    { id: 'yoga_pilates', label: 'Yoga & Pilates', emoji: '🧘‍♀️', description: 'Séances de yoga, méditation et renforcement postural' },
    { id: 'martial_arts', label: 'Arts Martiaux & Boxe', emoji: '🥊', description: 'Cours de boxe, judo, karaté et self-défense' },
  ],
  artisan: [
    { id: 'tailor_couture', label: 'Couture & Sur-Mesure', emoji: '🧵', description: 'Confection personnalisée, retouches et haute couture' },
    { id: 'carpenter_furniture', label: 'Menuiserie & Ébénisterie', emoji: '🪑', description: 'Meubles sur mesure, bois massif et agencement' },
    { id: 'shoemaker', label: 'Cordonnerie & Cuir', emoji: '👞', description: 'Fabrication et réparation de souliers et maroquinerie' },
    { id: 'handmade_crafts', label: 'Artisanat d\'Art', emoji: '🎨', description: 'Poterie, vannerie, bijoux artisanaux et objets d\'art' },
  ],
  digital_service: [
    { id: 'web_design', label: 'Création Web & UI/UX', emoji: '💻', description: 'Sites internet, applications et maquettes Figma' },
    { id: 'graphic_branding', label: 'Identité Visuelle & Graphisme', emoji: '🎨', description: 'Logos, chartes graphiques et supports de communication' },
    { id: 'digital_marketing', label: 'Marketing Digital & Ads', emoji: '📈', description: 'Gestion réseaux sociaux, publicité en ligne et SEO' },
    { id: 'video_photo', label: 'Production Vidéo & Photo', emoji: '📸', description: 'Shooting produits, reportages et montage vidéo' },
  ],
  event: [
    { id: 'wedding_planner', label: 'Organisation de Mariages', emoji: '💍', description: 'Coordination complète du jour J et scénographie' },
    { id: 'conference_corporate', label: 'Événements d\'Entreprise', emoji: '🎙️', description: 'Séminaires, galas et lancements de produits' },
    { id: 'dj_sound_light', label: 'DJ, Sonorisation & Lumière', emoji: '🎧', description: 'Animation musicale et matériel son/lumière' },
    { id: 'party_rental', label: 'Location de Matériel Événementiel', emoji: '🎪', description: 'Tentes, chaises, vaisselle et décors' },
  ],
  healthcare: [
    { id: 'pharmacy', label: 'Pharmacie & Parapharmacie', emoji: '💊', description: 'Médicaments, matériel médical et conseils santé' },
    { id: 'clinic_cabinet', label: 'Cabinet Médical & Clinique', emoji: '🩺', description: 'Consultations médicales et soins spécialisés' },
    { id: 'optician', label: 'Opticien & Lunetterie', emoji: '👓', description: 'Montures, verres correcteurs et solaires' },
    { id: 'dental', label: 'Cabinet Dentaire', emoji: '🦷', description: 'Soins bucco-dentaires et orthodontie' },
  ],
  education: [
    { id: 'tutoring_school', label: 'Soutien Scolaire & Cours', emoji: '📚', description: 'Aide aux devoirs et cours particuliers' },
    { id: 'language_center', label: 'Centre de Langues', emoji: '🗣️', description: 'Cours d\'anglais, français et certifications' },
    { id: 'vocational_training', label: 'Formation Professionnelle', emoji: '🎓', description: 'Métiers pratiques et reconversion' },
    { id: 'online_courses', label: 'Cours & Formations en Ligne', emoji: '💻', description: 'E-learning et masterclasses vidéo' },
  ],
  grocery: [
    { id: 'supermarket_epicerie', label: 'Supermarché & Épicerie', emoji: '🛒', description: 'Produits du quotidien, conserves et boissons' },
    { id: 'butchery', label: 'Boucherie & Charcuterie', emoji: '🥩', description: 'Viandes fraîches et volailles de qualité' },
    { id: 'fishmonger', label: 'Poissonnerie & Produits de la Mer', emoji: '🐟', description: 'Poissons frais et crustacés' },
    { id: 'organic_local', label: 'Produits Bio & Locaux', emoji: '🥑', description: 'Fruits, légumes bio et produits du terroir' },
  ],
  nightlife: [
    { id: 'nightclub', label: 'Boîte de Nuit & Club', emoji: '🪩', description: 'Soirées clubbing et artistes invités' },
    { id: 'cocktail_bar', label: 'Bar à Cocktails', emoji: '🍸', description: 'Mixologie raffinée et ambiance tamisée' },
    { id: 'lounge_shisha', label: 'Lounge & Chicha', emoji: '💨', description: 'Espace détente et saveurs chicha' },
  ],
  hybrid: [
    { id: 'concept_store', label: 'Concept Store', emoji: '✨', description: 'Mixte de produits exclusifs et expériences' },
    { id: 'resto_boutique', label: 'Café-Boutique', emoji: '☕', description: 'Restauration légère et vente d\'articles' },
    { id: 'salon_cosmetics', label: 'Salon & Vente Cosmétiques', emoji: '💅', description: 'Soins sur place et vente de produits' },
  ],
  home_service: [
    { id: 'plumbing', label: 'Plomberie & Sanitaire', emoji: '🚰', description: 'Dépannage fuites, chauffe-eau et installations' },
    { id: 'electrical', label: 'Électricité Générale', emoji: '⚡', description: 'Mise aux normes, dépannage et tableaux électriques' },
    { id: 'ac_refrigeration', label: 'Climatisation & Froid', emoji: '❄️', description: 'Entretien, installation et recharge climatiseur' },
    { id: 'cleaning_moving', label: 'Nettoyage & Déménagement', emoji: '📦', description: 'Grand ménage, fin de chantier et manutention' },
  ],
  business: [
    { id: 'b2b_supplies', label: 'Fournitures & Équipements B2B', emoji: '📦', description: 'Matériel de bureau, consommables et fournitures pro' },
    { id: 'industrial_equipment', label: 'Machines & Équipements Industriels', emoji: '⚙️', description: 'Outillage lourd et équipements techniques' },
    { id: 'corporate_services', label: 'Services aux Entreprises', emoji: '🏢', description: 'Externalisation, maintenance et solutions pro' },
  ],
});

class BusinessTypeRegistry {
  constructor() {
    this.types = new Map();
    // Initialisation avec les 19 types fondamentaux canoniques
    Object.entries(BUSINESS_TYPE_DEFINITIONS).forEach(([key, def]) => {
      this.types.set(key, def);
    });
  }

  /**
   * Enregistrer ou étendre un type d'activité
   * @param {object} definition - Définition complète du secteur d'activité
   */
  register(definition) {
    if (!definition || !definition.id) {
      throw new Error('[BusinessTypeRegistry] Définition de secteur invalide : un "id" est obligatoire.');
    }

    const sanitized = {
      id: definition.id,
      label: definition.label || definition.id,
      category: definition.category || 'general',
      emoji: definition.emoji || '🏪',
      description: definition.description || '',
      capabilities: {
        hasProducts: false,
        hasServices: false,
        hasCart: false,
        hasBooking: false,
        hasMenu: false,
        hasRooms: false,
        hasStaff: false,
        hasQuotes: false,
        hasWholesalePricing: false,
        hasDelivery: false,
        hasInventory: false,
        hasVariants: false,
        ...(definition.capabilities || {}),
      },
      recommendedComponents: definition.recommendedComponents || ['HEADER', 'HERO', 'PRODUCT', 'FOOTER'],
      incompatibleComponents: definition.incompatibleComponents || [],
      businessFeatures: definition.businessFeatures || [],
      configProperties: definition.configProperties || {},
      terminology: {
        cartTitle: 'Mon Panier',
        orderButton: 'Commander sur WhatsApp',
        bookingTitle: 'Prendre Rendez-vous',
        bookingButton: 'Nous Contacter',
        catalogTab: 'Catalogue',
        ctaText: 'Découvrir',
        ...(definition.terminology || {}),
      },
    };

    this.types.set(definition.id, sanitized);
    return sanitized;
  }

  /**
   * Récupérer un type d'activité par son ID canonique ou alias legacy explicite.
   * Retourne null si le type est inconnu, ambigu ou manquant (ZÉRO fallback silencieux).
   * @param {string} typeId 
   * @returns {object|null}
   */
  get(typeId) {
    if (!typeId || typeof typeId !== 'string') return null;
    const clean = typeId.trim().toLowerCase();
    if (this.types.has(clean)) {
      return this.types.get(clean);
    }
    if (EXPLICIT_LEGACY_ALIASES[clean]) {
      return this.types.get(EXPLICIT_LEGACY_ALIASES[clean]);
    }
    return null;
  }

  /**
   * Vérifie si un ID correspond exactement à l'un des 19 types canoniques enregistrés
   * @param {string} typeId
   * @returns {boolean}
   */
  has(typeId) {
    if (!typeId || typeof typeId !== 'string') return false;
    return this.types.has(typeId.trim().toLowerCase());
  }

  /**
   * Analyse approfondie d'un identifiant métier (diagnostic / traçabilité formelle)
   * @param {string} input - Identifiant, alias ou chaîne brute
   * @returns {{ input: any, status: 'CANONICAL'|'LEGACY_ALIAS'|'AMBIGUOUS'|'UNKNOWN'|'MISSING', canonicalId: string|null, candidates?: string[], isAmbiguous: boolean, isUnknown: boolean, isCanonical: boolean, isMissing: boolean, isLegacy?: boolean, reason?: string }}
   */
  analyze(input) {
    // 0. Cas manquant / null / undefined / vide
    if (input === null || input === undefined) {
      return {
        input,
        status: 'MISSING',
        canonicalId: null,
        isAmbiguous: false,
        isUnknown: false,
        isCanonical: false,
        isMissing: true,
        reason: 'Identifiant d\'activité absent (null ou undefined).',
      };
    }

    if (typeof input !== 'string' || !input.trim()) {
      return {
        input,
        status: 'MISSING',
        canonicalId: null,
        isAmbiguous: false,
        isUnknown: false,
        isCanonical: false,
        isMissing: true,
        reason: 'Identifiant d\'activité vide ou composé uniquement d\'espaces.',
      };
    }

    const clean = input.trim().toLowerCase();

    // 1. Déjà canonique ? (19 types fondamentaux)
    if (this.types.has(clean)) {
      return {
        input,
        status: 'CANONICAL',
        canonicalId: clean,
        isAmbiguous: false,
        isUnknown: false,
        isCanonical: true,
        isMissing: false,
      };
    }

    // 2. Alias ambigu répertorié ? (creative, wellness, other)
    if (AMBIGUOUS_LEGACY_ALIASES[clean]) {
      const amb = AMBIGUOUS_LEGACY_ALIASES[clean];
      return {
        input,
        status: 'AMBIGUOUS',
        canonicalId: null, // INTERDIT : aucun choix silencieux de type
        candidates: amb.candidates,
        isAmbiguous: true,
        isUnknown: false,
        isCanonical: false,
        isMissing: false,
        reason: amb.reason,
      };
    }

    // 3. Alias legacy explicite répertorié ? (ecommerce, gastronomie, services...)
    if (EXPLICIT_LEGACY_ALIASES[clean]) {
      const resolved = EXPLICIT_LEGACY_ALIASES[clean];
      return {
        input,
        status: 'LEGACY_ALIAS',
        canonicalId: resolved,
        isAmbiguous: false,
        isUnknown: false,
        isCanonical: false,
        isMissing: false,
        isLegacy: true,
        reason: `Alias historique explicite "${clean}" normalisé vers le type canonique "${resolved}".`,
      };
    }

    // 4. Inconnu total
    return {
      input,
      status: 'UNKNOWN',
      canonicalId: null, // INTERDIT : aucune conversion silencieuse vers 'product'
      isAmbiguous: false,
      isUnknown: true,
      isCanonical: false,
      isMissing: false,
      reason: `Secteur inconnu "${clean}" : aucune correspondance canonique répertoriée.`,
    };
  }

  /**
   * Normalise une chaîne vers son ID de type métier canonique.
   * Retourne null pour UNKNOWN, AMBIGUOUS et MISSING (sauf si un fallback explicite est fourni).
   * @param {string} input - Identifiant brut
   * @param {object} options - Options de normalisation { strict: false, fallback: undefined }
   * @returns {string|null} ID canonique ou null (ou options.fallback)
   */
  normalize(input, options = {}) {
    const analysis = this.analyze(input);
    if (options.strict && (analysis.isUnknown || analysis.isAmbiguous || analysis.isMissing)) {
      throw new Error(`[BusinessTypeRegistry] Type métier non résolu (${analysis.status}) : "${input}". ${analysis.reason || ''}`);
    }
    if (analysis.canonicalId) {
      return analysis.canonicalId;
    }
    if (options.fallback !== undefined) {
      return options.fallback;
    }
    return null;
  }

  /**
   * Obtenir la terminologie déclarative pour un type d'activité
   * @param {string} typeId
   * @returns {{ cartTitle: string, orderButton: string, bookingTitle: string, bookingButton: string, catalogTab: string, ctaText: string }}
   */
  getTerminology(typeId) {
    const def = this.get(typeId);
    if (def && def.terminology) {
      return def.terminology;
    }
    return {
      cartTitle: 'Mon Panier',
      orderButton: 'Commander sur WhatsApp',
      bookingTitle: 'Prendre Rendez-vous',
      bookingButton: 'Nous Contacter',
      catalogTab: 'Catalogue',
      ctaText: 'Découvrir',
    };
  }

  /**
   * Obtenir tous les types d'activités enregistrés sous forme de tableau
   */
  getAll() {
    return Array.from(this.types.values());
  }

  /**
   * Fournit les options officielles dérivées pour l'Onboarding et les formulaires UI.
   * Aucune duplication : toutes les métadonnées proviennent strictement du registre.
   */
  getOnboardingChoices() {
    return this.getAll().map((def) => ({
      id: def.id,
      label: def.label,
      category: def.category,
      emoji: def.emoji,
      description: def.description,
      recommendedComponents: def.recommendedComponents,
    }));
  }

  /**
   * Obtenir les types d'activités groupés par catégorie
   */
  getAllGrouped() {
    const grouped = {
      commerce: [],
      services: [],
      hospitality: [],
      wellness: [],
      corporate: [],
      creative: [],
      technical: [],
      property: [],
    };

    this.types.forEach((def) => {
      const cat = def.category || 'commerce';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(def);
    });

    return grouped;
  }

  /**
   * Vérifie si une famille de composants est compatible avec un type d'activité
   * @param {string} businessTypeId - Ex: 'restaurant', 'hotel', 'product'
   * @param {string} componentFamily - Ex: 'PRODUCT', 'SERVICE', 'CAROUSEL'
   * @returns {boolean}
   */
  isComponentCompatible(businessTypeId, componentFamily) {
    const typeDef = this.get(businessTypeId);
    const upperFam = (componentFamily || '').toUpperCase();
    return !typeDef.incompatibleComponents.map((c) => c.toUpperCase()).includes(upperFam);
  }

  /**
   * Obtenir les capacités actives pour un type d'activité
   */
  getCapabilities(businessTypeId) {
    const typeDef = this.get(businessTypeId);
    return typeDef.capabilities;
  }

  /**
   * Obtenir la liste des familles de composants recommandées
   */
  getRecommendedFamilies(businessTypeId) {
    const typeDef = this.get(businessTypeId);
    return typeDef.recommendedComponents;
  }

  /**
   * Obtenir la liste des familles de composants incompatibles
   */
  getIncompatibleFamilies(businessTypeId) {
    const typeDef = this.get(businessTypeId);
    return typeDef.incompatibleComponents;
  }

  /**
   * Obtenir les fonctionnalités métier spécifiques
   */
  getBusinessFeatures(businessTypeId) {
    const typeDef = this.get(businessTypeId);
    return typeDef.businessFeatures;
  }

  /**
   * Obtenir le schéma des propriétés de configuration
   */
  getConfigProperties(businessTypeId) {
    const typeDef = this.get(businessTypeId);
    return typeDef.configProperties;
  }

  /**
   * Valide une configuration de boutique selon les règles de son type d'activité
   * @returns {{ valid: boolean, incompatibleSections: string[], warnings: string[] }}
   */
  validateStoreConfigForBusinessType(storeConfig, businessTypeId) {
    const typeDef = this.get(businessTypeId || storeConfig?.businessType);
    const sections = storeConfig?.sections || [];
    const incompatibleSections = [];
    const warnings = [];

    sections.forEach((sec) => {
      const typeUpper = (sec.type || '').toUpperCase();
      if (typeDef.incompatibleComponents.map((c) => c.toUpperCase()).includes(typeUpper)) {
        incompatibleSections.push(`Section "${sec.id || sec.variant}" (${typeUpper}) est incompatible avec le secteur "${typeDef.label}".`);
      }
    });

    // Avertissements si des composants essentiels recommandés sont absents
    const presentFamilies = new Set(sections.map((s) => (s.type || '').toUpperCase()));
    if (typeDef.recommendedComponents.includes('SERVICE') && !presentFamilies.has('SERVICE')) {
      warnings.push(`Votre boutique est de type "${typeDef.label}" mais ne contient aucune section Prestations/Services.`);
    }
    if (typeDef.recommendedComponents.includes('PRODUCT') && !presentFamilies.has('PRODUCT')) {
      warnings.push(`Votre boutique est de type "${typeDef.label}" mais ne contient aucune section Catalogue Produits.`);
    }

    return {
      valid: incompatibleSections.length === 0,
      incompatibleSections,
      warnings,
    };
  }

  /**
   * Obtenir la liste des sous-secteurs pour un type d'activité donné
   * @param {string} businessTypeId - ID ou alias du type d'activité
   * @returns {Array<{ id: string, label: string, emoji: string, description: string }>}
   */
  getSubSectors(businessTypeId) {
    const canonicalId = this.normalize(businessTypeId);
    return CANONICAL_SUB_SECTORS[canonicalId] || [];
  }

  /**
   * Vérifie si un sous-secteur est valide pour un type d'activité donné
   * @param {string} businessTypeId
   * @param {string} subSectorId
   * @returns {boolean}
   */
  isValidSubSector(businessTypeId, subSectorId) {
    if (!subSectorId || typeof subSectorId !== 'string') return false;
    const subSectors = this.getSubSectors(businessTypeId);
    return subSectors.some((s) => s.id === subSectorId.trim().toLowerCase());
  }

  /**
   * Normalise un identifiant de sous-secteur
   * @param {string} businessTypeId
   * @param {string} rawSubSector
   * @returns {string|null}
   */
  normalizeSubSector(businessTypeId, rawSubSector) {
    if (!rawSubSector || typeof rawSubSector !== 'string') return null;
    const clean = rawSubSector.trim().toLowerCase();
    const subSectors = this.getSubSectors(businessTypeId);
    const matched = subSectors.find((s) => s.id === clean || s.label.toLowerCase() === clean);
    return matched ? matched.id : clean;
  }
}

export const businessTypeRegistry = new BusinessTypeRegistry();
export { BusinessTypeRegistry };
