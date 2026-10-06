/**
 * VesTyle — Définitions Exhaustives des Types d'Activités Métier (Business Types)
 * ─────────────────────────────────────────────────────────────────────────────
 * Chaque type d'activité définit :
 * 1. capabilities            → Capacités actives (panier, réservation, menu, devis, etc.)
 * 2. recommendedComponents   → Familles de composants prioritaires
 * 3. incompatibleComponents  → Familles de composants exclues
 * 4. businessFeatures        → Fonctionnalités métier avancées
 * 5. configProperties        → Propriétés de configuration spécifiques
 * 6. terminology             → Libellés et termes contextuels déclaratifs
 */

export const BUSINESS_TYPE_DEFINITIONS = {
  // ── 1. PRODUCT (Commerce de Détail / E-commerce Standard) ──
  product: {
    id: 'product',
    label: 'Commerce de Détail (Produits)',
    category: 'commerce',
    emoji: '🛍️',
    description: 'Vente directe d\'articles physiques avec panier, gestion de stock et paiement/commande rapide.',
    capabilities: {
      hasProducts: true,
      hasServices: false,
      hasCart: true,
      hasBooking: false,
      hasMenu: false,
      hasRooms: false,
      hasStaff: false,
      hasQuotes: false,
      hasWholesalePricing: false,
      hasDelivery: true,
      hasInventory: true,
      hasVariants: true,
    },
    recommendedComponents: ['HEADER', 'HERO', 'CAROUSEL', 'CATEGORY', 'PRODUCT', 'PROMOTION', 'TESTIMONIAL', 'FAQ', 'FOOTER'],
    incompatibleComponents: ['SERVICE'],
    businessFeatures: [
      'Panier d\'achat instantané',
      'Filtrage dynamique par univers et catégories',
      'Bouton de commande direct via WhatsApp',
      'Affichage des stocks et badges promotionnels',
      'Calcul des frais de livraison par ville',
    ],
    configProperties: {
      allowOutOfStockOrders: { type: 'boolean', default: false, label: 'Autoriser les commandes hors-stock' },
      minOrderAmount: { type: 'number', default: 0, label: 'Montant minimum de commande (FCFA)' },
      showProductRatings: { type: 'boolean', default: true, label: 'Afficher les notes des articles' },
      defaultGridColumns: { type: 'number', default: 3, min: 2, max: 4, label: 'Colonnes par défaut' },
    },
    terminology: {
      cartTitle: 'Mon Panier',
      orderButton: 'Commander sur WhatsApp',
      bookingTitle: 'Demander une Information',
      bookingButton: 'Nous Contacter',
      catalogTab: 'Nos Produits',
      ctaText: 'Découvrir la Collection',
    },
  },

  // ── 2. SERVICE (Prestataires, RDV, Consultations) ──
  service: {
    id: 'service',
    label: 'Prestations de Services & Rendez-vous',
    category: 'services',
    emoji: '💼',
    description: 'Offres de prestations professionnelles avec tarification horaire/forfaitaire et prise de rendez-vous.',
    capabilities: {
      hasProducts: false,
      hasServices: true,
      hasCart: false,
      hasBooking: true,
      hasMenu: false,
      hasRooms: false,
      hasStaff: true,
      hasQuotes: true,
      hasWholesalePricing: false,
      hasDelivery: false,
      hasInventory: false,
      hasVariants: false,
    },
    recommendedComponents: ['HEADER', 'HERO', 'SERVICE', 'GALLERY', 'TESTIMONIAL', 'FAQ', 'FOOTER'],
    incompatibleComponents: ['PRODUCT', 'CAROUSEL'],
    businessFeatures: [
      'Réservation de créneau avec message WhatsApp pré-rempli',
      'Affichage des durées et tarifs estimés des prestations',
      'Demande de devis personnalisé en ligne',
      'Galerie de réalisations antérieures',
    ],
    configProperties: {
      requiresDeposit: { type: 'boolean', default: false, label: 'Acompte obligatoire à la réservation' },
      depositPercentage: { type: 'number', default: 30, min: 10, max: 100, label: 'Pourcentage d\'acompte (%)' },
      advanceNoticeHours: { type: 'number', default: 24, label: 'Délai de prévenance (heures)' },
      allowCustomQuotes: { type: 'boolean', default: true, label: 'Permettre les demandes sur-mesure' },
    },
    terminology: {
      cartTitle: 'Mes Prestations',
      orderButton: 'Prendre Rendez-vous',
      bookingTitle: 'Prendre Rendez-vous',
      bookingButton: 'Confirmer le Créneau',
      catalogTab: 'Nos Prestations & Tarifs',
      ctaText: 'Prendre Rendez-vous',
    },
  },

  // ── 3. HYBRID (Produits + Services Simultanés) ──
  hybrid: {
    id: 'hybrid',
    label: 'Commerce Hybride (Produits & Prestations)',
    category: 'commerce',
    emoji: '🔄',
    description: 'Boutiques vendant à la fois des articles physiques et des services associés (ex: boutique mode + retouches).',
    capabilities: {
      hasProducts: true,
      hasServices: true,
      hasCart: true,
      hasBooking: true,
      hasMenu: false,
      hasRooms: false,
      hasStaff: true,
      hasQuotes: true,
      hasWholesalePricing: false,
      hasDelivery: true,
      hasInventory: true,
      hasVariants: true,
    },
    recommendedComponents: ['HEADER', 'HERO', 'CATEGORY', 'PRODUCT', 'SERVICE', 'CAROUSEL', 'PROMOTION', 'TESTIMONIAL', 'FAQ', 'FOOTER'],
    incompatibleComponents: [],
    businessFeatures: [
      'Double catalogue dynamique (Articles physiques & Prestations)',
      'Tunnel d\'achat avec choix panier ou réservation directe',
      'Présentation croisée (Produits recommandés lors de la réservation de service)',
    ],
    configProperties: {
      primarySectionFocus: { type: 'string', default: 'products', options: ['products', 'services'], label: 'Mise en avant principale' },
      enableUnifiedCheckout: { type: 'boolean', default: true, label: 'Commande unifiée' },
    },
    terminology: {
      cartTitle: 'Mon Panier & Prestations',
      orderButton: 'Commander / Réserver',
      bookingTitle: 'Prendre Rendez-vous',
      bookingButton: 'Réserver un Créneau',
      catalogTab: 'Catalogue & Services',
      ctaText: 'Découvrir nos Offres',
    },
  },

  // ── 4. RESTAURANT (Restauration, Fast-Food, Traiteurs) ──
  restaurant: {
    id: 'restaurant',
    label: 'Restauration & Gastronomie',
    category: 'hospitality',
    emoji: '🍽️',
    description: 'Menus interactifs, cartes des plats, réservation de table et commandes à emporter ou en livraison.',
    capabilities: {
      hasProducts: true, // Plats au menu
      hasServices: false,
      hasCart: true,
      hasBooking: true, // Réservation de table
      hasMenu: true,
      hasRooms: false,
      hasStaff: false,
      hasQuotes: true, // Traiteur / Banquets
      hasWholesalePricing: false,
      hasDelivery: true,
      hasInventory: false,
      hasVariants: true, // Suppléments, cuissons
    },
    recommendedComponents: ['HEADER', 'HERO', 'CATEGORY', 'PRODUCT', 'PROMOTION', 'GALLERY', 'TESTIMONIAL', 'FAQ', 'FOOTER'],
    incompatibleComponents: ['SERVICE'],
    businessFeatures: [
      'Menu digital par catégories (Entrées, Plats, Boissons, Desserts)',
      'Réservation de table en temps réel (Nombre de couverts, heure)',
      'Commande de plats avec options d\'assaisonnement / suppléments',
      'Indication des horaires d\'ouverture et de fermeture du service',
    ],
    configProperties: {
      maxTableGuests: { type: 'number', default: 12, label: 'Capacité max par table' },
      isDeliveryAvailable: { type: 'boolean', default: true, label: 'Livraison à domicile active' },
      estimatedPrepTimeMinutes: { type: 'number', default: 30, label: 'Temps moyen de préparation (min)' },
      showCaloriesOrAllergens: { type: 'boolean', default: false, label: 'Afficher les allergènes' },
    },
    terminology: {
      cartTitle: 'Votre Commande Gourmande',
      orderButton: 'Commander le Menu sur WhatsApp',
      bookingTitle: 'Réserver une Table',
      bookingButton: 'Réserver une Table',
      catalogTab: 'La Carte du Chef',
      ctaText: 'Découvrir la Carte',
    },
  },

  // ── 5. HOTEL (Hôtellerie, Résidences, Meublés, Auberges) ──
  hotel: {
    id: 'hotel',
    label: 'Hôtellerie & Résidences Meublées',
    category: 'hospitality',
    emoji: '🏨',
    description: 'Chambres, suites et appartements avec dates de séjour, équipements (WiFi, clim) et réservation.',
    capabilities: {
      hasProducts: false,
      hasServices: true, // Nuitées et extras
      hasCart: false,
      hasBooking: true,
      hasMenu: false,
      hasRooms: true,
      hasStaff: false,
      hasQuotes: true,
      hasWholesalePricing: false,
      hasDelivery: false,
      hasInventory: true, // Nombre de chambres disponibles
      hasVariants: false,
    },
    recommendedComponents: ['HEADER', 'HERO', 'SERVICE', 'GALLERY', 'PROMOTION', 'TESTIMONIAL', 'FAQ', 'FOOTER'],
    incompatibleComponents: ['PRODUCT', 'CATEGORY'],
    businessFeatures: [
      'Sélecteur de dates d\'arrivée et de départ (Check-in / Check-out)',
      'Fiches de chambres avec liste des commodités et équipements',
      'Galerie photos haute définition des espaces et suites',
      'Tarification par nuitée avec calcul automatique de la durée',
    ],
    configProperties: {
      checkInTime: { type: 'string', default: '14:00', label: 'Heure d\'arrivée (Check-in)' },
      checkOutTime: { type: 'string', default: '12:00', label: 'Heure de départ (Check-out)' },
      requiresIdentityDocument: { type: 'boolean', default: true, label: 'Pièce d\'identité requise' },
      hasSecurityDeposit: { type: 'boolean', default: true, label: 'Caution de garantie requise' },
    },
    terminology: {
      cartTitle: 'Mes Réservations & Extras',
      orderButton: 'Vérifier la Disponibilité',
      bookingTitle: 'Réserver un Séjour',
      bookingButton: 'Vérifier les Dates',
      catalogTab: 'Nos Chambres & Suites',
      ctaText: 'Explorer nos Hébergements',
    },
  },

  // ── 6. BEAUTY (Instituts de Beauté, Spa, Cosmétique) ──
  beauty: {
    id: 'beauty',
    label: 'Institut de Beauté & Soins Esthétiques',
    category: 'wellness',
    emoji: '✨',
    description: 'Soins du visage, onglerie, massages et cosmétiques avec sélection de praticienne et créneau.',
    capabilities: {
      hasProducts: true, // Vente de crèmes / produits
      hasServices: true, // Soins
      hasCart: true,
      hasBooking: true,
      hasMenu: false,
      hasRooms: false,
      hasStaff: true,
      hasQuotes: false,
      hasWholesalePricing: false,
      hasDelivery: true,
      hasInventory: true,
      hasVariants: true,
    },
    recommendedComponents: ['HEADER', 'HERO', 'SERVICE', 'PRODUCT', 'GALLERY', 'TESTIMONIAL', 'PROMOTION', 'FAQ', 'FOOTER'],
    incompatibleComponents: [],
    businessFeatures: [
      'Prise de rendez-vous par type de soin avec choix de l\'esthéticienne',
      'Boutique de produits cosmétiques de soin intégrée',
      'Galerie Lookbook avant/après et réalisations',
    ],
    configProperties: {
      bufferTimeBetweenClients: { type: 'number', default: 15, label: 'Pause entre rendez-vous (min)' },
      allowStaffSelection: { type: 'boolean', default: true, label: 'Permettre le choix du praticien' },
    },
    terminology: {
      cartTitle: 'Mes Soins & Produits',
      orderButton: 'Prendre Rendez-vous',
      bookingTitle: 'Réserver un Soin',
      bookingButton: 'Choisir mon Soin',
      catalogTab: 'Nos Soins & Cosmétiques',
      ctaText: 'Prendre Rendez-vous',
    },
  },

  // ── 7. HAIR_SALON (Salons de Coiffure & Barbiers) ──
  hair_salon: {
    id: 'hair_salon',
    label: 'Salon de Coiffure & Barber Shop',
    category: 'wellness',
    emoji: '✂️',
    description: 'Coupes hommes/femmes, tresses, locks, coloration et soins capillaires.',
    capabilities: {
      hasProducts: true, // Produits capillaires
      hasServices: true, // Coupes, tresses
      hasCart: true,
      hasBooking: true,
      hasMenu: false,
      hasRooms: false,
      hasStaff: true,
      hasQuotes: false,
      hasWholesalePricing: false,
      hasDelivery: false,
      hasInventory: false,
      hasVariants: true,
    },
    recommendedComponents: ['HEADER', 'HERO', 'SERVICE', 'GALLERY', 'TESTIMONIAL', 'PROMOTION', 'FOOTER'],
    incompatibleComponents: [],
    businessFeatures: [
      'Grille de prestations capillaires avec durées précises',
      'Sélection du coiffeur / barbier préféré',
      'Galerie des modèles de coupes et tresses',
    ],
    configProperties: {
      serviceDurationStepMinutes: { type: 'number', default: 30, label: 'Pas de réservation (min)' },
      allowWalkIns: { type: 'boolean', default: true, label: 'Afficher "Sans rendez-vous accepté"' },
    },
    terminology: {
      cartTitle: 'Mes Prestations Coiffure',
      orderButton: 'Réserver ma Séance',
      bookingTitle: 'Prendre Rendez-vous Coiffure',
      bookingButton: 'Choisir un Coiffeur',
      catalogTab: 'Carte des Prestations',
      ctaText: 'Prendre Rendez-vous',
    },
  },

  // ── 8. FITNESS (Salles de Sport, Coachs, Yoga, Danse) ──
  fitness: {
    id: 'fitness',
    label: 'Fitness, Sport & Coaching',
    category: 'wellness',
    emoji: '🏋️',
    description: 'Abonnements de salle, séances de coaching privé, cours collectifs et planning hebdomadaire.',
    capabilities: {
      hasProducts: true, // Compléments, tenues
      hasServices: true, // Séances, coachings
      hasCart: true,
      hasBooking: true,
      hasMenu: false,
      hasRooms: false,
      hasStaff: true,
      hasQuotes: true,
      hasWholesalePricing: false,
      hasDelivery: false,
      hasInventory: false,
      hasVariants: false,
    },
    recommendedComponents: ['HEADER', 'HERO', 'SERVICE', 'GALLERY', 'TESTIMONIAL', 'PROMOTION', 'FAQ', 'FOOTER'],
    incompatibleComponents: ['CAROUSEL'],
    businessFeatures: [
      'Grille des forfaits mensuels et pass journaliers',
      'Réservation de créneau de coaching individuel',
      'Présentation des profils et certifications des coachs',
    ],
    configProperties: {
      trialSessionAvailable: { type: 'boolean', default: true, label: 'Séance d\'essai gratuite offerte' },
      membershipTermsMonths: { type: 'number', default: 1, label: 'Engagement standard (mois)' },
    },
    terminology: {
      cartTitle: 'Mes Abonnements & Séances',
      orderButton: 'Rejoindre le Club',
      bookingTitle: 'Réserver une Séance d\'Essai',
      bookingButton: 'Réserver un Créneau',
      catalogTab: 'Formules & Abonnements',
      ctaText: 'Démarrer maintenant',
    },
  },

  // ── 9. PROFESSIONAL (Cabinets, Consultants, Avocats, Comptables) ──
  professional: {
    id: 'professional',
    label: 'Professions Libérales & Cabinets Conseil',
    category: 'corporate',
    emoji: '⚖️',
    description: 'Services d\'experts, consultations juridiques, fiscales ou stratégiques avec prise de RDV formel.',
    capabilities: {
      hasProducts: false,
      hasServices: true,
      hasCart: false,
      hasBooking: true,
      hasMenu: false,
      hasRooms: false,
      hasStaff: true,
      hasQuotes: true,
      hasWholesalePricing: false,
      hasDelivery: false,
      hasInventory: false,
      hasVariants: false,
    },
    recommendedComponents: ['HEADER', 'HERO', 'SERVICE', 'TESTIMONIAL', 'FAQ', 'FOOTER'],
    incompatibleComponents: ['PRODUCT', 'CAROUSEL', 'CATEGORY'],
    businessFeatures: [
      'Consultation en cabinet ou visioconférence',
      'Formulaire de cadrage préalable des besoins',
      'Présentation des domaines d\'expertise et références',
    ],
    configProperties: {
      consultationFormat: { type: 'string', default: 'both', options: ['in_person', 'remote', 'both'], label: 'Format des RDV' },
      requiresBriefForm: { type: 'boolean', default: true, label: 'Questionnaire préalable requis' },
    },
    terminology: {
      cartTitle: 'Consultations Sélectionnées',
      orderButton: 'Prendre Rendez-vous',
      bookingTitle: 'Prendre Rendez-vous Conseil',
      bookingButton: 'Planifier la Consultation',
      catalogTab: 'Domaines d\'Expertise',
      ctaText: 'Consulter un Expert',
    },
  },

  // ── 10. EDUCATION (Écoles, Formations, Tuteurs, Cours Particuliers) ──
  education: {
    id: 'education',
    label: 'Formation, Cours & Enseignement',
    category: 'corporate',
    emoji: '🎓',
    description: 'Programmes pédagogiques, cours de soutien, certifications et sessions d\'apprentissage.',
    capabilities: {
      hasProducts: true, // Livres / Supports
      hasServices: true, // Formations
      hasCart: true,
      hasBooking: true,
      hasMenu: false,
      hasRooms: false,
      hasStaff: true,
      hasQuotes: true,
      hasWholesalePricing: false,
      hasDelivery: false,
      hasInventory: true, // Places disponibles
      hasVariants: false,
    },
    recommendedComponents: ['HEADER', 'HERO', 'SERVICE', 'CATEGORY', 'TESTIMONIAL', 'FAQ', 'FOOTER'],
    incompatibleComponents: ['CAROUSEL'],
    businessFeatures: [
      'Fiches de programmes détaillées avec objectifs et syllabus',
      'Inscription à une session avec compteur de places restantes',
      'Témoignages d\'anciens étudiants et taux de réussite',
    ],
    configProperties: {
      certificationDelivered: { type: 'boolean', default: true, label: 'Délivre un certificat' },
      maxStudentsPerClass: { type: 'number', default: 15, label: 'Nombre max d\'élèves par session' },
    },
    terminology: {
      cartTitle: 'Mes Cours & Supports',
      orderButton: 'S\'inscrire à la Session',
      bookingTitle: 'Demander une Inscription',
      bookingButton: 'S\'inscrire au Cours',
      catalogTab: 'Programmes & Formations',
      ctaText: 'Découvrir les Formations',
    },
  },

  // ── 11. PHOTOGRAPHY (Photographes, Vidéastes, Studios) ──
  photography: {
    id: 'photography',
    label: 'Photographie & Production Audiovisuelle',
    category: 'creative',
    emoji: '📷',
    description: 'Shooting studio, mariages, événements, portraits et forfaits de retouche.',
    capabilities: {
      hasProducts: true, // Tirages, albums
      hasServices: true, // Séances photo
      hasCart: true,
      hasBooking: true,
      hasMenu: false,
      hasRooms: false,
      hasStaff: false,
      hasQuotes: true,
      hasWholesalePricing: false,
      hasDelivery: true,
      hasInventory: false,
      hasVariants: true,
    },
    recommendedComponents: ['HEADER', 'HERO', 'GALLERY', 'CAROUSEL', 'SERVICE', 'TESTIMONIAL', 'FAQ', 'FOOTER'],
    incompatibleComponents: [],
    businessFeatures: [
      'Book photo immersif plein écran par univers (Mariages, Portraits, Mode)',
      'Forfaits de shooting avec nombre de photos retouchées incluses',
      'Réservation de date avec vérification de disponibilité',
    ],
    configProperties: {
      turnaroundDays: { type: 'number', default: 7, label: 'Délai de livraison des photos (jours)' },
      includesRawFiles: { type: 'boolean', default: false, label: 'Fichiers bruts (RAW) inclus' },
    },
    terminology: {
      cartTitle: 'Mes Forfaits & Tirages',
      orderButton: 'Réserver un Shooting',
      bookingTitle: 'Réserver une Séance Photo',
      bookingButton: 'Vérifier la Date',
      catalogTab: 'Forfaits & Book Photo',
      ctaText: 'Voir le Portfolio',
    },
  },

  // ── 12. AUTOMOTIVE (Garages, Concessionnaires, Pièces, Lavage) ──
  automotive: {
    id: 'automotive',
    label: 'Automobile, Garage & Pièces Détachées',
    category: 'technical',
    emoji: '🚗',
    description: 'Vente de véhicules, pièces auto/moto, entretien mécanique, diagnostic et lavage.',
    capabilities: {
      hasProducts: true, // Pièces détachées, véhicules
      hasServices: true, // Réparations, vidanges
      hasCart: true,
      hasBooking: true, // RDV atelier
      hasMenu: false,
      hasRooms: false,
      hasStaff: false,
      hasQuotes: true,
      hasWholesalePricing: true,
      hasDelivery: true,
      hasInventory: true,
      hasVariants: true,
    },
    recommendedComponents: ['HEADER', 'HERO', 'CATEGORY', 'PRODUCT', 'SERVICE', 'PROMOTION', 'FAQ', 'FOOTER'],
    incompatibleComponents: [],
    businessFeatures: [
      'Recherche de pièces par marque et modèle de véhicule',
      'Prise de rendez-vous pour vidange ou contrôle technique',
      'Demande de cotation pour réparation de carrosserie',
    ],
    configProperties: {
      vehicleBrandsHandled: { type: 'string', default: 'Toutes marques', label: 'Marques prises en charge' },
      providesWarranty: { type: 'boolean', default: true, label: 'Garantie sur pièces et main d\'œuvre' },
    },
    terminology: {
      cartTitle: 'Mon Panier Pièces & RDV',
      orderButton: 'Commander / Prendre RDV',
      bookingTitle: 'Prendre Rendez-vous Atelier',
      bookingButton: 'Prendre RDV Garage',
      catalogTab: 'Pièces & Entretiens',
      ctaText: 'Prendre RDV Atelier',
    },
  },

  // ── 13. REAL_ESTATE (Agences Immobilières, Terrains, Locations) ──
  real_estate: {
    id: 'real_estate',
    label: 'Immobilier, Terrains & Gestion Locative',
    category: 'property',
    emoji: '🏢',
    description: 'Vente et location de maisons, appartements, bureaux et terrains titrés au Cameroun.',
    capabilities: {
      hasProducts: false,
      hasServices: true, // Visites et mandats
      hasCart: false,
      hasBooking: true, // Visite sur site
      hasMenu: false,
      hasRooms: true, // Nombre de pièces
      hasStaff: true, // Agents
      hasQuotes: true,
      hasWholesalePricing: false,
      hasDelivery: false,
      hasInventory: true,
      hasVariants: false,
    },
    recommendedComponents: ['HEADER', 'HERO', 'GALLERY', 'SERVICE', 'TESTIMONIAL', 'FAQ', 'FOOTER'],
    incompatibleComponents: ['PRODUCT', 'CATEGORY'],
    businessFeatures: [
      'Fiches biens immobiliers avec surface, localisation et statut juridique (titre foncier)',
      'Demande de visite accompagnée par un agent immobilier',
      'Galerie photos 360° et vidéos des propriétés',
    ],
    configProperties: {
      supportedCities: { type: 'string', default: 'Douala, Yaoundé, Kribi', label: 'Villes couvertes' },
      isVerifiedTitleOnly: { type: 'boolean', default: true, label: 'Uniquement terrains et biens titrés' },
    },
    terminology: {
      cartTitle: 'Biens Sélectionnés',
      orderButton: 'Demander une Visite',
      bookingTitle: 'Planifier une Visite',
      bookingButton: 'Visiter ce Bien',
      catalogTab: 'Nos Biens Disponibles',
      ctaText: 'Explorer les Propriétés',
    },
  },

  // ── 14. ARTISAN (Menuisiers, Couturiers, Tapissiers, Métalliers) ──
  artisan: {
    id: 'artisan',
    label: 'Artisanat d\'Art & Fabrication Locale',
    category: 'creative',
    emoji: '🔨',
    description: 'Créations sur-mesure, menuiserie, ferronnerie, maroquinerie et couture traditionnelle.',
    capabilities: {
      hasProducts: true, // Créations prêtes
      hasServices: true, // Commandes sur-mesure
      hasCart: true,
      hasBooking: false,
      hasMenu: false,
      hasRooms: false,
      hasStaff: false,
      hasQuotes: true,
      hasWholesalePricing: true,
      hasDelivery: true,
      hasInventory: true,
      hasVariants: true,
    },
    recommendedComponents: ['HEADER', 'HERO', 'GALLERY', 'PRODUCT', 'SERVICE', 'TESTIMONIAL', 'FOOTER'],
    incompatibleComponents: ['CAROUSEL'],
    businessFeatures: [
      'Vitrine des œuvres fabriquées à la main avec détails des matériaux',
      'Demande de devis pour fabrication personnalisée',
      'Présentation des étapes de l\'atelier de fabrication',
    ],
    configProperties: {
      standardLeadTimeWeeks: { type: 'number', default: 2, label: 'Délai moyen de confection (semaines)' },
      materialsOrigin: { type: 'string', default: 'Bois et matières locales du Cameroun', label: 'Origine des matières' },
    },
    terminology: {
      cartTitle: 'Mes Créations Sélectionnées',
      orderButton: 'Commander sur WhatsApp',
      bookingTitle: 'Demander une Création Sur-mesure',
      bookingButton: 'Demander un Devis Création',
      catalogTab: 'Créations & Collections',
      ctaText: 'Découvrir nos Créations',
    },
  },

  // ── 15. EVENT (Événementiel, Décorateurs, DJs, Salles de Fêtes) ──
  event: {
    id: 'event',
    label: 'Événementiel, Mariages & Réceptions',
    category: 'creative',
    emoji: '🎉',
    description: 'Organisation d\'événements, location de matériel, sonorisation, décoration et traiteur.',
    capabilities: {
      hasProducts: true, // Matériel en location
      hasServices: true, // Prestations d'animation / déco
      hasCart: true,
      hasBooking: true, // Réservation de date
      hasMenu: false,
      hasRooms: false,
      hasStaff: true,
      hasQuotes: true,
      hasWholesalePricing: false,
      hasDelivery: true,
      hasInventory: true,
      hasVariants: true,
    },
    recommendedComponents: ['HEADER', 'HERO', 'GALLERY', 'SERVICE', 'PRODUCT', 'TESTIMONIAL', 'FAQ', 'FOOTER'],
    incompatibleComponents: [],
    businessFeatures: [
      'Pack complet mariage / séminaire / anniversaire clé en main',
      'Vérification de la disponibilité du calendrier pour une date',
      'Catalogue de location (chaises, tentes, jeux de lumière)',
    ],
    configProperties: {
      minEventBudget: { type: 'number', default: 100000, label: 'Budget minimum pris en charge (FCFA)' },
      requiresSiteVisit: { type: 'boolean', default: true, label: 'Visite préalable des lieux obligatoire' },
    },
    terminology: {
      cartTitle: 'Ma Sélection Événement',
      orderButton: 'Demander une Cotation',
      bookingTitle: 'Réserver une Date d\'Événement',
      bookingButton: 'Vérifier la Disponibilité',
      catalogTab: 'Packs & Équipements',
      ctaText: 'Organiser un Événement',
    },
  },

  // ── 16. BUSINESS (B2B, Entreprises de Services, Fournisseurs) ──
  business: {
    id: 'business',
    label: 'Solutions B2B & Services aux Entreprises',
    category: 'corporate',
    emoji: '🏢',
    description: 'Prestations corporate, fournitures de bureau, sécurité et sous-traitance industrielle.',
    capabilities: {
      hasProducts: true,
      hasServices: true,
      hasCart: false,
      hasBooking: false,
      hasMenu: false,
      hasRooms: false,
      hasStaff: false,
      hasQuotes: true,
      hasWholesalePricing: true,
      hasDelivery: true,
      hasInventory: true,
      hasVariants: false,
    },
    recommendedComponents: ['HEADER', 'HERO', 'SERVICE', 'PRODUCT', 'TESTIMONIAL', 'FAQ', 'FOOTER'],
    incompatibleComponents: ['CAROUSEL'],
    businessFeatures: [
      'Demande de proposition commerciale et appel d\'offres',
      'Grilles tarifaires pour commandes récurrentes et abonnements',
      'Paiement sur facture et bon de commande',
    ],
    configProperties: {
      paymentTermsDays: { type: 'number', default: 30, label: 'Conditions de paiement (jours)' },
      minContractDurationMonths: { type: 'number', default: 6, label: 'Durée minimale de contrat' },
    },
    terminology: {
      cartTitle: 'Proposition Commerciale',
      orderButton: 'Demander une Proposition',
      bookingTitle: 'Prendre Rendez-vous B2B',
      bookingButton: 'Contacter l\'Équipe',
      catalogTab: 'Services aux Entreprises',
      ctaText: 'Demander une Démo',
    },
  },

  // ── 17. WHOLESALE (Grossistes, Demi-Gros, Import-Export) ──
  wholesale: {
    id: 'wholesale',
    label: 'Commerce de Gros & Import-Export',
    category: 'commerce',
    emoji: '📦',
    description: 'Vente par cartons, conteneurs ou balles avec quantité minimale de commande (MOQ) et prix dégressifs.',
    capabilities: {
      hasProducts: true,
      hasServices: false,
      hasCart: true,
      hasBooking: false,
      hasMenu: false,
      hasRooms: false,
      hasStaff: false,
      hasQuotes: true,
      hasWholesalePricing: true,
      hasDelivery: true,
      hasInventory: true,
      hasVariants: true,
    },
    recommendedComponents: ['HEADER', 'HERO', 'CATEGORY', 'PRODUCT', 'PROMOTION', 'FAQ', 'FOOTER'],
    incompatibleComponents: ['SERVICE'],
    businessFeatures: [
      'Quantités Minimales de Commande (MOQ) imposées par article',
      'Barèmes de prix dégressifs par paliers de volume',
      'Conditionnement par carton, pack ou palette',
      'Calcul du transport fret routier ou maritime',
    ],
    configProperties: {
      defaultMOQ: { type: 'number', default: 10, min: 2, label: 'Quantité minimale par défaut (MOQ)' },
      enableTieredPricing: { type: 'boolean', default: true, label: 'Activer les prix dégressifs' },
      shipsNationwide: { type: 'boolean', default: true, label: 'Expédition sur tout le territoire' },
    },
    terminology: {
      cartTitle: 'Ma Commande en Gros (MOQ)',
      orderButton: 'Commander par Cartons',
      bookingTitle: 'Demander un Barème Grossiste',
      bookingButton: 'Demander un Devis Volume',
      catalogTab: 'Catalogue Grossiste',
      ctaText: 'Voir les Tarifs Gros',
    },
  },

  // ── 18. DIGITAL_SERVICE (Créateurs de Contenu, Développeurs, Graphistes) ──
  digital_service: {
    id: 'digital_service',
    label: 'Services Numériques, Tech & Design',
    category: 'creative',
    emoji: '💻',
    description: 'Création de sites, logos, montages vidéo, community management et développement logiciel.',
    capabilities: {
      hasProducts: true, // Templates, assets
      hasServices: true, // Projets
      hasCart: true,
      hasBooking: true, // Cadrage visio
      hasMenu: false,
      hasRooms: false,
      hasStaff: false,
      hasQuotes: true,
      hasWholesalePricing: false,
      hasDelivery: false,
      hasInventory: false,
      hasVariants: false,
    },
    recommendedComponents: ['HEADER', 'HERO', 'SERVICE', 'GALLERY', 'PRODUCT', 'TESTIMONIAL', 'FAQ', 'FOOTER'],
    incompatibleComponents: ['CAROUSEL'],
    businessFeatures: [
      'Packs de services digitaux avec livrables précis et révisions',
      'Portfolio interactif avec liens vers les projets en ligne',
      'Livraison 100% dématérialisée',
    ],
    configProperties: {
      includesRevisionsCount: { type: 'number', default: 3, label: 'Nombre de révisions incluses' },
      githubOrFigmaLinksEnabled: { type: 'boolean', default: true, label: 'Afficher les liens prototypes' },
    },
    terminology: {
      cartTitle: 'Mes Packs Digitaux',
      orderButton: 'Lancer mon Projet',
      bookingTitle: 'Cadrer un Projet Digital',
      bookingButton: 'Planifier un Cadrage',
      catalogTab: 'Offres & Packs Digitaux',
      ctaText: 'Lancer un Projet',
    },
  },

  // ── 19. HOME_SERVICE (Dépannage à Domicile, Plomberie, Ménage, Climatisation) ──
  home_service: {
    id: 'home_service',
    label: 'Services & Dépannage à Domicile',
    category: 'technical',
    emoji: '🔧',
    description: 'Interventions d\'urgence et entretien chez le client : plomberie, électricité, nettoyage, froid.',
    capabilities: {
      hasProducts: true, // Pièces de rechange
      hasServices: true, // Interventions
      hasCart: false,
      hasBooking: true, // Intervention d'urgence
      hasMenu: false,
      hasRooms: false,
      hasStaff: true,
      hasQuotes: true,
      hasWholesalePricing: false,
      hasDelivery: false,
      hasInventory: false,
      hasVariants: false,
    },
    recommendedComponents: ['HEADER', 'HERO', 'SERVICE', 'TESTIMONIAL', 'FAQ', 'FOOTER'],
    incompatibleComponents: ['CAROUSEL', 'PRODUCT'],
    businessFeatures: [
      'Bouton d\'urgence SOS pour intervention en moins de 2h',
      'Zone de couverture géographique par quartier (ex: Akwa, Bonapriso, Bastos)',
      'Tarification forfaitaire pour diagnostic et déplacement',
    ],
    configProperties: {
      emergencyCalloutAvailable: { type: 'boolean', default: true, label: 'Dépannage d\'urgence 24/7' },
      calloutFeeFCFA: { type: 'number', default: 5000, label: 'Frais de déplacement de base (FCFA)' },
      coverageRadiusKm: { type: 'number', default: 25, label: 'Rayon d\'intervention (km)' },
    },
    terminology: {
      cartTitle: 'Interventions Sélectionnées',
      orderButton: 'Demander une Intervention',
      bookingTitle: 'Demander une Intervention Urgente',
      bookingButton: 'Planifier le Dépannage',
      catalogTab: 'Nos Forfaits d\'Intervention',
      ctaText: 'Demander un Dépannage',
    },
  },
};
