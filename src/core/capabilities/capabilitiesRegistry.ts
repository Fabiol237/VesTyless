/**
 * VesTyle V1 — Central Capabilities Registry
 * ─────────────────────────────────────────────────────────────────────────────
 * Registre canonique de toutes les capacités métier de la plateforme.
 * 
 * RÈGLE D'OR :
 * Le Dashboard active ce que le site PEUT FAIRE (Capacités).
 * Le Design définit COMMENT ces capacités sont présentées visuellement.
 */

export interface CapabilityMeta {
  id: string;
  name: string;
  category: 'commerce' | 'hospitality' | 'food' | 'services' | 'education' | 'health' | 'real_estate' | 'media' | 'organization' | 'core';
  description: string;
  icon: string;
  supportsWhatsAppTrigger: boolean;
}

export const CAPABILITIES_CATALOG: Record<string, CapabilityMeta> = {
  // ── Commerce & Vente ──
  PRODUCTS: {
    id: 'PRODUCTS',
    name: 'Catalogue de Produits & Variantes',
    category: 'commerce',
    description: 'Gestion des articles physiques, photos, prix, variantes (tailles, couleurs).',
    icon: 'Package',
    supportsWhatsAppTrigger: true,
  },
  INVENTORY: {
    id: 'INVENTORY',
    name: 'Gestion des Stocks & Alertes Rupture',
    category: 'commerce',
    description: 'Comptabilisation des unités, seuils critiques et alertes.',
    icon: 'Layers',
    supportsWhatsAppTrigger: false,
  },
  STOCK_LOGS: {
    id: 'STOCK_LOGS',
    name: 'Historique des Mouvements de Stock',
    category: 'commerce',
    description: 'Traçabilité des entrées, sorties et ajustements avec notes explicatives.',
    icon: 'History',
    supportsWhatsAppTrigger: false,
  },
  ORDERS: {
    id: 'ORDERS',
    name: 'Gestion des Commandes & Reçus',
    category: 'commerce',
    description: 'Suivi des statuts de commande, tickets de caisse et factures imprimables.',
    icon: 'ShoppingCart',
    supportsWhatsAppTrigger: true,
  },
  CUSTOMERS: {
    id: 'CUSTOMERS',
    name: 'Base Clients & Fidélité',
    category: 'commerce',
    description: 'Coordonnées clients, historique des achats et suivi.',
    icon: 'Users',
    supportsWhatsAppTrigger: true,
  },
  DELIVERY: {
    id: 'DELIVERY',
    name: 'Logistique & Suivi Livreur',
    category: 'commerce',
    description: 'Assignation de livreur et suivi GPS en direct.',
    icon: 'Truck',
    supportsWhatsAppTrigger: true,
  },
  PROMOTIONS: {
    id: 'PROMOTIONS',
    name: 'Promotions Planifiées & Compte à Rebours',
    category: 'commerce',
    description: 'Remises temporaires en pourcentage ou montant fixe.',
    icon: 'Tag',
    supportsWhatsAppTrigger: false,
  },

  // ── Hébergement ──
  ROOMS: {
    id: 'ROOMS',
    name: 'Chambres & Types de Logements',
    category: 'hospitality',
    description: 'Descriptifs, équipements, photos, capacité d’accueil.',
    icon: 'BedDouble',
    supportsWhatsAppTrigger: true,
  },
  AVAILABILITY: {
    id: 'AVAILABILITY',
    name: 'Calendrier de Disponibilité',
    category: 'hospitality',
    description: 'Gestion des dates d’arrivée/départ et périodes bloquées.',
    icon: 'Calendar',
    supportsWhatsAppTrigger: false,
  },
  BOOKINGS: {
    id: 'BOOKINGS',
    name: 'Réservations de Séjour',
    category: 'hospitality',
    description: 'Suivi des demandes de séjour, acomptes et confirmations.',
    icon: 'CalendarCheck',
    supportsWhatsAppTrigger: true,
  },
  GUESTS: {
    id: 'GUESTS',
    name: 'Fichier des Voyageurs',
    category: 'hospitality',
    description: 'Registre des arrivées, identité et demandes spéciales.',
    icon: 'UserCheck',
    supportsWhatsAppTrigger: true,
  },
  PRICING_SEASONS: {
    id: 'PRICING_SEASONS',
    name: 'Tarification Saisonnière',
    category: 'hospitality',
    description: 'Tarifs haute/basse saison et remises long séjour.',
    icon: 'DollarSign',
    supportsWhatsAppTrigger: false,
  },

  // ── Restauration ──
  MENU: {
    id: 'MENU',
    name: 'Carte & Menu du Restaurant',
    category: 'food',
    description: 'Entrées, plats, desserts, boissons, plats du jour.',
    icon: 'UtensilsCrossed',
    supportsWhatsAppTrigger: true,
  },
  TABLES: {
    id: 'TABLES',
    name: 'Gestion des Tables & Salle',
    category: 'food',
    description: 'Plan de salle, numérotation et capacité des tables.',
    icon: 'LayoutGrid',
    supportsWhatsAppTrigger: false,
  },
  RESTAURANT_ORDERS: {
    id: 'RESTAURANT_ORDERS',
    name: 'Commandes Repas & Livraison Express',
    category: 'food',
    description: 'Commandes à emporter ou en livraison à domicile.',
    icon: 'ShoppingBag',
    supportsWhatsAppTrigger: true,
  },
  RESERVATIONS: {
    id: 'RESERVATIONS',
    name: 'Réservation de Tables',
    category: 'food',
    description: 'Prise de réservation de table avec créneau horaire.',
    icon: 'CalendarDays',
    supportsWhatsAppTrigger: true,
  },
  ALLERGENS: {
    id: 'ALLERGENS',
    name: 'Allergènes & Régimes Spéciaux',
    category: 'food',
    description: 'Informations diététiques, végétarien, sans gluten, etc.',
    icon: 'ShieldCheck',
    supportsWhatsAppTrigger: false,
  },

  // ── Services & Prestations ──
  SERVICES: {
    id: 'SERVICES',
    name: 'Catalogue des Prestations',
    category: 'services',
    description: 'Intitulé, durée, tarif indicatif et détails de la prestation.',
    icon: 'Briefcase',
    supportsWhatsAppTrigger: true,
  },
  APPOINTMENTS: {
    id: 'APPOINTMENTS',
    name: 'Prise de Rendez-vous en Ligne',
    category: 'services',
    description: 'Créneaux de disponibilité et confirmation de RDV.',
    icon: 'Clock',
    supportsWhatsAppTrigger: true,
  },
  REQUESTS: {
    id: 'REQUESTS',
    name: 'Demandes de Devis & Diagnostics',
    category: 'services',
    description: 'Formulaires sur mesure pour chiffrage de projet.',
    icon: 'FileText',
    supportsWhatsAppTrigger: true,
  },
  STAFF: {
    id: 'STAFF',
    name: 'Équipe & Praticiens',
    category: 'services',
    description: 'Profils des collaborateurs, coiffeurs, consultants.',
    icon: 'Users2',
    supportsWhatsAppTrigger: false,
  },

  // ── Éducation ──
  COURSES: {
    id: 'COURSES',
    name: 'Catalogue des Cours & Formations',
    category: 'education',
    description: 'Programmes, modules, prérequis et tarifs d’inscription.',
    icon: 'GraduationCap',
    supportsWhatsAppTrigger: true,
  },
  STUDENTS: {
    id: 'STUDENTS',
    name: 'Fichier des Apprenants',
    category: 'education',
    description: 'Gestion des inscrits, coordonnées et suivi.',
    icon: 'UserGraduate',
    supportsWhatsAppTrigger: true,
  },
  ENROLLMENTS: {
    id: 'ENROLLMENTS',
    name: 'Inscriptions & Sessions',
    category: 'education',
    description: 'Dates de rentrée, effectifs et validations d’admission.',
    icon: 'CheckSquare',
    supportsWhatsAppTrigger: true,
  },

  // ── Santé ──
  HEALTH_SERVICES: {
    id: 'HEALTH_SERVICES',
    name: 'Soins & Spécialités Médicales',
    category: 'health',
    description: 'Consultations, bilans, téléconsultation.',
    icon: 'HeartPulse',
    supportsWhatsAppTrigger: true,
  },
  PATIENTS: {
    id: 'PATIENTS',
    name: 'Dossiers & Contacts Patients',
    category: 'health',
    description: 'Prise de contact sécurisée et orientation.',
    icon: 'Activity',
    supportsWhatsAppTrigger: true,
  },
  DUTY_HOURS: {
    id: 'DUTY_HOURS',
    name: 'Horaires de Garde & Urgences',
    category: 'health',
    description: 'Affichage des permanences et numéros d’urgence.',
    icon: 'AlertCircle',
    supportsWhatsAppTrigger: true,
  },

  // ── Immobilier & Transport ──
  PROPERTIES: {
    id: 'PROPERTIES',
    name: 'Biens Immobiliers (Vente / Location)',
    category: 'real_estate',
    description: 'Terrains, villas, appartements, surfaces et prix.',
    icon: 'Building',
    supportsWhatsAppTrigger: true,
  },
  VEHICLES: {
    id: 'VEHICLES',
    name: 'Parc de Véhicules & Engins',
    category: 'real_estate',
    description: 'Flotte automobile, modèles, tarifs journaliers.',
    icon: 'Car',
    supportsWhatsAppTrigger: true,
  },
  VIEWINGS: {
    id: 'VIEWINGS',
    name: 'Visites & Essais sur Rendez-vous',
    category: 'real_estate',
    description: 'Planning des visites de biens ou essais de véhicules.',
    icon: 'MapPin',
    supportsWhatsAppTrigger: true,
  },

  // ── Création & Médias ──
  PORTFOLIO: {
    id: 'PORTFOLIO',
    name: 'Galerie de Réalisations & Projets',
    category: 'media',
    description: 'Photos haute résolution, vidéos, études de cas.',
    icon: 'Image',
    supportsWhatsAppTrigger: false,
  },
  MEDIA: {
    id: 'MEDIA',
    name: 'Vidéothèque & Contenus Numériques',
    category: 'media',
    description: 'Podcasts, extraits musicaux, vidéos immersives.',
    icon: 'Film',
    supportsWhatsAppTrigger: false,
  },

  // ── Organisations & Core ──
  TEAM: {
    id: 'TEAM',
    name: 'Organigramme & Membres',
    category: 'organization',
    description: 'Présentation de la direction, des équipes et départements.',
    icon: 'Users',
    supportsWhatsAppTrigger: false,
  },
  ORGANIZATION_INFO: {
    id: 'ORGANIZATION_INFO',
    name: 'Présentation Institutionnelle',
    category: 'organization',
    description: 'Mission, vision, rapports annuels, statuts.',
    icon: 'Landmark',
    supportsWhatsAppTrigger: false,
  },
  REVIEWS: {
    id: 'REVIEWS',
    name: 'Avis & Témoignages Vérifiés',
    category: 'core',
    description: 'Notes et retours d’expérience clients.',
    icon: 'Star',
    supportsWhatsAppTrigger: false,
  },
  WHATSAPP_COMMERCE: {
    id: 'WHATSAPP_COMMERCE',
    name: 'Conversion Directe WhatsApp',
    category: 'core',
    description: 'Envoi d’ordre formaté avec panier pré-rempli dans WhatsApp.',
    icon: 'MessageCircle',
    supportsWhatsAppTrigger: true,
  }
};

/**
 * Vérifie si un ensemble de capacités fournies satisfait les exigences d'un Design.
 */
export function checkCapabilitiesCompatibility(
  siteCapabilities: Record<string, boolean> | string[],
  requiredCapabilities: string[] = []
): { isCompatible: boolean; missing: string[] } {
  const activeSet = new Set(
    Array.isArray(siteCapabilities)
      ? siteCapabilities
      : Object.keys(siteCapabilities).filter(k => siteCapabilities[k])
  );

  const missing = requiredCapabilities.filter(req => !activeSet.has(req));
  return {
    isCompatible: missing.length === 0,
    missing,
  };
}
