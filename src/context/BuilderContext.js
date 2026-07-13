'use client';
import { createContext, useContext, useReducer, useCallback } from 'react';

// ─── Secteurs d'activité enrichis ──────────────────────────────────────────
export const BUSINESS_TYPES = {
  // ── E-COMMERCE ──────────────────────────────────────────────────────────
  ecommerce: {
    id: 'ecommerce', label: 'Boutique Générale', emoji: '🛍️',
    description: 'Produits physiques, numériques et marketplace.',
    gradient: 'linear-gradient(135deg, #25D366, #128C7E)',
    category: 'commerce',
    modules: ['vitrine', 'catalogue', 'testimonials', 'newsletter', 'contact'],
    theme: { primaryColor: '#25D366', secondaryColor: '#f0f2f5', accentColor: '#008069', fontFamily: 'Inter', mode: 'light' }
  },
  fashion: {
    id: 'fashion', label: 'Mode & Vêtements', emoji: '👗',
    description: 'Boutique de mode, prêt-à-porter et accessoires.',
    gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    category: 'commerce',
    modules: ['vitrine', 'catalogue', 'lookbook', 'testimonials', 'newsletter', 'contact'],
    theme: { primaryColor: '#ec4899', secondaryColor: '#fdf2f8', accentColor: '#8b5cf6', fontFamily: 'Cormorant Garamond', mode: 'light' }
  },
  grocery: {
    id: 'grocery', label: 'Épicerie & Alimentation', emoji: '🛒',
    description: 'Marché, épicerie, produits alimentaires.',
    gradient: 'linear-gradient(135deg, #1B7A3A, #2ECC71)',
    category: 'commerce',
    modules: ['vitrine', 'catalogue', 'newsletter', 'contact'],
    theme: { primaryColor: '#1B7A3A', secondaryColor: '#F0FFF4', accentColor: '#FF8C00', fontFamily: 'Inter', mode: 'light' }
  },
  // ── HÔTELLERIE ──────────────────────────────────────────────────────────
  hotel: {
    id: 'hotel', label: 'Hôtel & Hébergement', emoji: '🏨',
    description: 'Chambres, réservations et services hôteliers.',
    gradient: 'linear-gradient(135deg, #b45309, #78350f)',
    category: 'hospitality',
    modules: ['vitrine', 'services', 'reservation', 'testimonials', 'contact'],
    theme: { primaryColor: '#b45309', secondaryColor: '#fffbeb', accentColor: '#78350f', fontFamily: 'Cormorant Garamond', mode: 'light' }
  },
  // ── RESTAURATION ────────────────────────────────────────────────────────
  restaurant: {
    id: 'restaurant', label: 'Restaurant & Gastronomie', emoji: '🍽️',
    description: 'Menu digital, commandes et réservations de table.',
    gradient: 'linear-gradient(135deg, #D4AF37, #8B1A1A)',
    category: 'food',
    modules: ['vitrine', 'restaurant', 'reservation', 'testimonials', 'contact'],
    theme: { primaryColor: '#D4AF37', secondaryColor: '#120A00', accentColor: '#8B1A1A', fontFamily: 'Lora', mode: 'dark' }
  },
  cafe: {
    id: 'cafe', label: 'Café & Snack', emoji: '☕',
    description: 'Cafétéria, snack, commande à emporter.',
    gradient: 'linear-gradient(135deg, #92400e, #451a03)',
    category: 'food',
    modules: ['vitrine', 'restaurant', 'newsletter', 'contact'],
    theme: { primaryColor: '#92400e', secondaryColor: '#fef3c7', accentColor: '#451a03', fontFamily: 'Plus Jakarta Sans', mode: 'light' }
  },
  // ── SERVICES ────────────────────────────────────────────────────────────
  services: {
    id: 'services', label: 'Services & Consultations', emoji: '💼',
    description: 'Consultants, coachs, agences, prestataires.',
    gradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
    category: 'services',
    modules: ['vitrine', 'services', 'reservation', 'devis', 'testimonials', 'contact'],
    theme: { primaryColor: '#0284c7', secondaryColor: '#f0f9ff', accentColor: '#0369a1', fontFamily: 'Outfit', mode: 'light' }
  },
  beauty: {
    id: 'beauty', label: 'Beauté & Salon', emoji: '💅',
    description: 'Coiffure, esthétique, spa et soins.',
    gradient: 'linear-gradient(135deg, #B5325A, #D4AF37)',
    category: 'services',
    modules: ['vitrine', 'services', 'reservation', 'testimonials', 'contact'],
    theme: { primaryColor: '#B5325A', secondaryColor: '#FFF5F7', accentColor: '#D4AF37', fontFamily: 'Cormorant Garamond', mode: 'light' }
  },
  realestate: {
    id: 'realestate', label: 'Immobilier', emoji: '🏠',
    description: 'Agence immobilière, locations et ventes.',
    gradient: 'linear-gradient(135deg, #003087, #0052CC)',
    category: 'services',
    modules: ['vitrine', 'properties', 'services', 'devis', 'contact'],
    theme: { primaryColor: '#003087', secondaryColor: '#F4F6F9', accentColor: '#FF6B00', fontFamily: 'Inter', mode: 'light' }
  },
  // ── CRÉATIFS ────────────────────────────────────────────────────────────
  creative: {
    id: 'creative', label: 'Créatifs & Agences', emoji: '🎨',
    description: 'Portfolios, agences créatives, influenceurs.',
    gradient: 'linear-gradient(135deg, #c026d3, #7c3aed)',
    category: 'creative',
    modules: ['vitrine', 'portfolio', 'services', 'links', 'contact'],
    theme: { primaryColor: '#c026d3', secondaryColor: '#18181b', accentColor: '#e879f9', fontFamily: 'Space Grotesk', mode: 'dark' }
  },
  // ── ÉVÉNEMENTIEL ────────────────────────────────────────────────────────
  event: {
    id: 'event', label: 'Événements & Billetterie', emoji: '🎟️',
    description: 'Concerts, conférences, mariages, soirées.',
    gradient: 'linear-gradient(135deg, #eab308, #d97706)',
    category: 'event',
    modules: ['vitrine', 'billetterie', 'newsletter', 'contact'],
    theme: { primaryColor: '#eab308', secondaryColor: '#111827', accentColor: '#fef08a', fontFamily: 'Space Grotesk', mode: 'dark' }
  },
};

// ─── Catégories de secteurs pour l'affichage groupé ────────────────────────
export const SECTOR_CATEGORIES = {
  commerce: { label: '🛒 Commerce & Vente', color: '#25D366' },
  hospitality: { label: '🏨 Hôtellerie', color: '#b45309' },
  food: { label: '🍽️ Restauration', color: '#D4AF37' },
  services: { label: '💼 Services', color: '#0284c7' },
  creative: { label: '🎨 Créatifs', color: '#c026d3' },
  event: { label: '🎟️ Événementiel', color: '#eab308' },
};

// ─── Définitions complètes de tous les modules ─────────────────────────────
export const MODULE_DEFINITIONS = {
  vitrine: {
    type: 'vitrine', label: "Page d'accueil", icon: 'Home', emoji: '🏠',
    description: 'Page principale avec héros, slogan et appel à action.',
    color: '#6366f1',
    availableIn: ['ecommerce','fashion','grocery','hotel','restaurant','cafe','services','beauty','realestate','creative','event'],
    defaultConfig: {
      headline: 'Bienvenue !',
      subheadline: 'Découvrez ce que nous vous proposons',
      ctaText: 'Découvrir',
      ctaLink: 'catalogue',
      bgType: 'gradient',
      bgImage: '',
      bgVideo: '',
      showBadges: true,
      badge1: '✓ Livraison rapide',
      badge2: '✓ Paiement sécurisé',
      badge3: '✓ Satisfaction garantie',
      showSocials: true,
      whatsapp: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      showRating: true,
      ratingValue: '4.9',
      ratingCount: '120',
    }
  },
  catalogue: {
    type: 'catalogue', label: 'Catalogue Produits', icon: 'ShoppingBag', emoji: '🛍️',
    description: 'Vendez des produits avec panier, filtres et variantes.',
    color: '#10b981',
    availableIn: ['ecommerce','fashion','grocery'],
    defaultConfig: {
      gridCols: 3,
      showFilters: true,
      filterBy: 'category',
      showStock: true,
      currency: 'XOF',
      allowCart: true,
      showPriceRange: true,
      allowWishlist: true,
      sortOptions: ['Nouveautés', 'Prix croissant', 'Prix décroissant', 'Populaires'],
      showSizes: false,
      showColors: false,
      showBrand: false,
      emptyMessage: 'Aucun produit pour le moment.',
      // États comportementaux
      outOfStockBehavior: 'show_badge', // 'hide' | 'show_badge' | 'show_notify'
      outOfStockMessage: 'Rupture de stock',
      notifyMeEnabled: true,
      notifyMeText: 'Me notifier',
      reservedBadgeText: 'Réservé',
      showDeliveryBadge: true,
      deliveryText: 'Livraison disponible',
    }
  },
  lookbook: {
    type: 'lookbook', label: 'Lookbook / Collections', icon: 'Shirt', emoji: '👔',
    description: 'Collections saisonnières et tenues complètes.',
    color: '#ec4899',
    availableIn: ['fashion'],
    defaultConfig: {
      layout: 'editorial',
      headline: 'Notre Collection',
      subline: 'Découvrez notre sélection de la saison',
      showShopTheLook: true,
      shopTheLookText: 'Acheter la tenue',
      collections: [],
    }
  },
  reservation: {
    type: 'reservation', label: 'Réservations', icon: 'Calendar', emoji: '📅',
    description: 'Prise de RDV avec calendrier interactif et gestion des états.',
    color: '#f59e0b',
    availableIn: ['hotel','restaurant','services','beauty','cafe'],
    defaultConfig: {
      // Horaires par jour
      workingHours: {
        Lun: { open: true, start: '09:00', end: '18:00' },
        Mar: { open: true, start: '09:00', end: '18:00' },
        Mer: { open: true, start: '09:00', end: '18:00' },
        Jeu: { open: true, start: '09:00', end: '18:00' },
        Ven: { open: true, start: '09:00', end: '18:00' },
        Sam: { open: true, start: '10:00', end: '16:00' },
        Dim: { open: false, start: '10:00', end: '14:00' },
      },
      slotDuration: 60,       // minutes
      bufferTime: 15,          // minutes entre créneaux
      maxPerSlot: 1,           // personnes max par créneau
      maxDaysAhead: 30,        // jours réservables à l'avance
      requirePayment: false,
      depositAmount: 0,
      currency: 'XOF',
      // Messages configurables par l'admin
      confirmationMessage: 'Votre réservation est confirmée ! Nous vous contacterons bientôt.',
      alreadyBookedMessage: 'Vous avez déjà une réservation. Souhaitez-vous la modifier ?',
      fullSlotMessage: 'Ce créneau est complet. Consultez d\'autres disponibilités.',
      waitlistEnabled: true,
      waitlistMessage: 'Inscrivez-vous en liste d\'attente et nous vous préviendrons.',
      cancelMessage: 'Votre annulation a bien été prise en compte.',
      cancelDeadlineHours: 24, // Annulation possible X heures avant
      // Notifications
      whatsappNotif: true,
      whatsappNumber: '',
      emailNotif: false,
      // Comportements
      requirePhone: true,
      requireEmail: false,
      requireNote: false,
      noteLabel: 'Précisions ou demandes particulières',
      allowMultiService: false,
      services: [],           // Liste des services/prestations à choisir
      // Politique
      cancellationPolicy: 'Annulation gratuite jusqu\'à 24h avant le rendez-vous.',
    }
  },
  restaurant: {
    type: 'restaurant', label: 'Menu Digital', icon: 'UtensilsCrossed', emoji: '🍽️',
    description: 'Menu interactif par catégories, avec commandes et filtres.',
    color: '#f97316',
    availableIn: ['restaurant','cafe'],
    defaultConfig: {
      currency: 'XOF',
      showAllergens: true,
      showCalories: false,
      showCategories: true,
      showImages: true,
      allowClickCollect: true,
      clickCollectText: 'Commander à emporter',
      allowTableBooking: true,
      tableBookingText: 'Réserver une table',
      minOrderAmount: 0,
      deliveryEnabled: false,
      deliveryFee: 0,
      deliveryText: 'Livraison à domicile',
      // Comportement commande
      orderConfirmMessage: 'Votre commande a été transmise ! Temps d\'attente estimé : 20 min.',
      orderCancelMessage: 'Commande annulée.',
      // Horaires spéciaux
      specialHours: '',
      closedMessage: 'Nous sommes actuellement fermés. Revenez bientôt !',
      // Tags/filtres visibles
      showVegFilter: true,
      showSpicyFilter: true,
      showPopularBadge: true,
      popularBadgeText: '⭐ Populaire',
      newBadgeText: '🆕 Nouveau',
    }
  },
  services: {
    type: 'services', label: 'Nos Services / Chambres', icon: 'Briefcase', emoji: '💼',
    description: 'Liste de prestations, offres ou types de chambres.',
    color: '#0ea5e9',
    availableIn: ['hotel','services','beauty','creative','realestate'],
    defaultConfig: {
      layout: 'cards',        // 'cards' | 'list' | 'grid'
      showPricing: true,
      currency: 'XOF',
      showDuration: true,
      showBookingButton: true,
      bookingButtonText: 'Réserver',
      showDescription: true,
      showImages: true,
      // Pour hôtels
      showRoomCapacity: false,
      showAmenities: false,
      // Comportements
      soldOutText: 'Complet',
      availableText: 'Disponible',
      showAvailabilityBadge: true,
      // Contact direct
      showWhatsappButton: true,
      whatsappText: 'WhatsApp',
      whatsappNumber: '',
    }
  },
  properties: {
    type: 'properties', label: 'Propriétés', icon: 'Home', emoji: '🏠',
    description: 'Listings immobiliers avec photos, prix et visites.',
    color: '#003087',
    availableIn: ['realestate'],
    defaultConfig: {
      layout: 'cards',
      currency: 'XOF',
      showPrice: true,
      showSurface: true,
      showRooms: true,
      showMap: false,
      allowVisitRequest: true,
      visitButtonText: 'Demander une visite',
      soldText: 'Vendu',
      rentedText: 'Loué',
      availableText: 'Disponible',
    }
  },
  portfolio: {
    type: 'portfolio', label: 'Portfolio / Réalisations', icon: 'Image', emoji: '🖼️',
    description: 'Galerie de projets avec lightbox et filtres par catégorie.',
    color: '#8b5cf6',
    availableIn: ['creative','services'],
    defaultConfig: {
      layout: 'masonry',      // 'masonry' | 'grid' | 'carousel'
      showTags: true,
      enableLightbox: true,
      showFeatured: true,
      showClientName: false,
      showDate: true,
      showDescription: true,
      ctaText: 'Travailler avec nous',
      ctaLink: 'contact',
    }
  },
  billetterie: {
    type: 'billetterie', label: 'Billetterie', icon: 'Ticket', emoji: '🎟️',
    description: 'Vente de billets avec QR codes, compteur et liste d\'attente.',
    color: '#ef4444',
    availableIn: ['event'],
    defaultConfig: {
      showCountdown: true,
      enableQR: true,
      maxPerOrder: 10,
      currency: 'XOF',
      showRemainingTickets: true,
      soldOutMessage: 'Événement complet. Inscrivez-vous sur la liste d\'attente.',
      waitlistEnabled: true,
      waitlistText: 'Liste d\'attente',
      confirmMessage: 'Votre billet a été réservé ! Un QR code vous sera envoyé.',
      showEventDetails: true,
      showVenue: true,
      showDressCode: false,
      dressCode: '',
    }
  },
  devis: {
    type: 'devis', label: 'Demande de Devis', icon: 'FileText', emoji: '📋',
    description: 'Formulaire intelligent avec budget, délai et assistance IA.',
    color: '#06b6d4',
    availableIn: ['services','realestate','creative'],
    defaultConfig: {
      aiAssisted: true,
      showBudget: true,
      budgetLabel: 'Budget estimé',
      showDeadline: true,
      deadlineLabel: 'Délai souhaité',
      showProject: true,
      projectLabel: 'Description du projet',
      requirePhone: true,
      requireEmail: true,
      confirmMessage: 'Votre demande a bien été reçue ! Nous vous répondons sous 24h.',
      autoReplyEnabled: false,
      autoReplyText: 'Merci pour votre demande. Nous revenons vers vous rapidement.',
    }
  },
  links: {
    type: 'links', label: 'Liens & Réseaux', icon: 'Link2', emoji: '🔗',
    description: 'Hub de liens style "link-in-bio" pour réseaux sociaux.',
    color: '#ec4899',
    availableIn: ['creative','ecommerce','fashion'],
    defaultConfig: {
      showIcons: true,
      buttonStyle: 'pill',    // 'pill' | 'rounded' | 'square'
      animated: true,
      bgStyle: 'gradient',
      showAvatar: true,
      showBio: true,
      bio: '',
    }
  },
  testimonials: {
    type: 'testimonials', label: 'Avis Clients', icon: 'Star', emoji: '⭐',
    description: 'Avis vérifiés avec système de notation et soumission.',
    color: '#fbbf24',
    availableIn: ['ecommerce','fashion','grocery','hotel','restaurant','cafe','services','beauty'],
    defaultConfig: {
      layout: 'carousel',     // 'carousel' | 'grid' | 'list'
      showStars: true,
      allowSubmit: true,
      submitText: 'Laisser un avis',
      minRating: 1,
      showVerifiedBadge: true,
      verifiedText: '✓ Achat vérifié',
      emptyMessage: 'Soyez le premier à laisser un avis !',
      moderationEnabled: false,
      moderationMessage: 'Votre avis sera publié après validation.',
    }
  },
  contact: {
    type: 'contact', label: 'Contact', icon: 'Mail', emoji: '✉️',
    description: 'Formulaire de contact, carte, horaires et infos.',
    color: '#64748b',
    availableIn: ['ecommerce','fashion','grocery','hotel','restaurant','cafe','services','beauty','realestate','creative','event'],
    defaultConfig: {
      showMap: false,
      mapEmbedUrl: '',
      showPhone: true,
      phoneLabel: 'Téléphone',
      showEmail: true,
      emailLabel: 'Email',
      showAddress: true,
      addressLabel: 'Adresse',
      showHours: true,
      hoursLabel: 'Horaires',
      hours: 'Lun–Ven : 9h–18h\nSam : 10h–16h',
      showWhatsapp: true,
      whatsappText: 'Contactez-nous sur WhatsApp',
      whatsappNumber: '',
      showForm: true,
      formTitle: 'Envoyez-nous un message',
      confirmMessage: 'Merci ! Nous avons bien reçu votre message.',
    }
  },
  newsletter: {
    type: 'newsletter', label: 'Newsletter', icon: 'Send', emoji: '📧',
    description: 'Capturez les emails de vos visiteurs avec une offre.',
    color: '#a78bfa',
    availableIn: ['ecommerce','fashion','grocery','event','creative'],
    defaultConfig: {
      headline: 'Restez informé(e) !',
      subtext: 'Recevez nos actualités et offres exclusives en avant-première.',
      buttonText: "S'abonner",
      incentive: '-10% sur votre prochaine commande',
      showIncentive: true,
      confirmMessage: 'Merci ! Votre inscription est confirmée.',
      alreadySubscribedMessage: 'Vous êtes déjà inscrit(e). Merci !',
      placeholder: 'Votre adresse email',
    }
  },
  abonnement: {
    type: 'abonnement', label: 'Abonnements', icon: 'Repeat', emoji: '🔄',
    description: 'Offres d\'abonnement mensuel ou annuel.',
    color: '#8b5cf6',
    availableIn: ['services','creative','event'],
    defaultConfig: {
      currency: 'XOF',
      showAnnualDiscount: true,
      annualDiscountText: '2 mois offerts',
      plans: [],
      ctaText: 'Choisir ce plan',
      confirmMessage: 'Abonnement activé avec succès !',
    }
  },
};

// ─── State initial ──────────────────────────────────────────────────────────
const initialState = {
  store: null,
  modules: [],
  activeModuleId: null,
  previewTab: 'desktop',
  showPreview: false,
  themeConfig: null,
  businessType: null,
  isDirty: false,
  isSaving: false,
};

// ─── Reducer ────────────────────────────────────────────────────────────────
function builderReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        store: action.store,
        modules: action.modules,
        themeConfig: action.themeConfig,
        businessType: action.businessType || null,
        isDirty: false,
      };

    case 'SET_BUSINESS_TYPE': {
      const bt = BUSINESS_TYPES[action.businessType];
      if (!bt) return state;
      const newModules = bt.modules.map((type, i) => {
        const def = MODULE_DEFINITIONS[type];
        if (!def) return null;
        return {
          id: `temp_${Date.now()}_${i}`,
          type,
          label: def.label,
          icon: def.icon,
          position: i,
          is_active: true,
          config: { ...def.defaultConfig },
        };
      }).filter(Boolean);
      return {
        ...state,
        businessType: action.businessType,
        modules: newModules,
        themeConfig: bt.theme,
        activeModuleId: newModules[0]?.id || null,
        isDirty: true,
      };
    }

    case 'LOAD_TEMPLATE': {
      const newModules = action.modules.map((type, i) => {
        const def = MODULE_DEFINITIONS[type];
        if (!def) return null;
        return {
          id: `temp_${Date.now()}_${i}`,
          type, label: def.label, icon: def.icon,
          position: i, is_active: true,
          config: { ...def.defaultConfig },
        };
      }).filter(Boolean);
      return { ...state, modules: newModules, themeConfig: action.themeConfig, activeModuleId: newModules[0]?.id, isDirty: true };
    }

    case 'ADD_MODULE': {
      const def = MODULE_DEFINITIONS[action.moduleType];
      if (!def) return state;
      const newModule = {
        id: `temp_${Date.now()}`,
        type: action.moduleType, label: def.label, icon: def.icon,
        position: state.modules.length, is_active: true,
        config: { ...def.defaultConfig },
      };
      return { ...state, modules: [...state.modules, newModule], activeModuleId: newModule.id, isDirty: true };
    }

    case 'REMOVE_MODULE':
      return {
        ...state,
        modules: state.modules.filter(m => m.id !== action.moduleId).map((m, i) => ({ ...m, position: i })),
        activeModuleId: state.activeModuleId === action.moduleId ? null : state.activeModuleId,
        isDirty: true,
      };

    case 'TOGGLE_MODULE':
      return {
        ...state,
        modules: state.modules.map(m => m.id === action.moduleId ? { ...m, is_active: !m.is_active } : m),
        isDirty: true,
      };

    case 'UPDATE_MODULE_CONFIG':
      return {
        ...state,
        modules: state.modules.map(m => m.id === action.moduleId ? { ...m, config: { ...m.config, ...action.config } } : m),
        isDirty: true,
      };

    case 'UPDATE_MODULE_LABEL':
      return {
        ...state,
        modules: state.modules.map(m => m.id === action.moduleId ? { ...m, label: action.label } : m),
        isDirty: true,
      };

    case 'REORDER_MODULES':
      return { ...state, modules: action.modules.map((m, i) => ({ ...m, position: i })), isDirty: true };

    case 'SET_ACTIVE_MODULE':
      return { ...state, activeModuleId: action.moduleId };

    case 'SET_THEME':
      return { ...state, themeConfig: { ...state.themeConfig, ...action.themeConfig }, isDirty: true };

    case 'SET_PREVIEW_TAB':
      return { ...state, previewTab: action.tab };

    case 'TOGGLE_MOBILE_PREVIEW':
      return { ...state, showPreview: !state.showPreview };

    case 'MARK_SAVED':
      return { ...state, isDirty: false, isSaving: false };

    case 'UPDATE_MODULE_ID':
      return {
        ...state,
        modules: state.modules.map(m => m.id === action.oldId ? { ...m, id: action.newId } : m),
        activeModuleId: state.activeModuleId === action.oldId ? action.newId : state.activeModuleId,
      };

    default:
      return state;
  }
}

// ─── Context & Provider ────────────────────────────────────────────────────
const BuilderContext = createContext(null);

export function BuilderProvider({ children }) {
  const [state, dispatch] = useReducer(builderReducer, initialState);

  const init = useCallback((store, modules, themeConfig, businessType) => {
    dispatch({ type: 'INIT', store, modules, themeConfig, businessType });
  }, []);

  const setBusinessType = useCallback((businessType) => {
    dispatch({ type: 'SET_BUSINESS_TYPE', businessType });
  }, []);

  const addModule = useCallback((moduleType) => {
    dispatch({ type: 'ADD_MODULE', moduleType });
  }, []);

  const removeModule = useCallback((moduleId) => {
    dispatch({ type: 'REMOVE_MODULE', moduleId });
  }, []);

  const toggleModule = useCallback((moduleId) => {
    dispatch({ type: 'TOGGLE_MODULE', moduleId });
  }, []);

  const updateModuleConfig = useCallback((moduleId, config) => {
    dispatch({ type: 'UPDATE_MODULE_CONFIG', moduleId, config });
  }, []);

  const updateModuleLabel = useCallback((moduleId, label) => {
    dispatch({ type: 'UPDATE_MODULE_LABEL', moduleId, label });
  }, []);

  const reorderModules = useCallback((modules) => {
    dispatch({ type: 'REORDER_MODULES', modules });
  }, []);

  const setActiveModule = useCallback((moduleId) => {
    dispatch({ type: 'SET_ACTIVE_MODULE', moduleId });
  }, []);

  const setTheme = useCallback((themeConfig) => {
    dispatch({ type: 'SET_THEME', themeConfig });
  }, []);

  const setPreviewTab = useCallback((tab) => {
    dispatch({ type: 'SET_PREVIEW_TAB', tab });
  }, []);

  const toggleMobilePreview = useCallback(() => {
    dispatch({ type: 'TOGGLE_MOBILE_PREVIEW' });
  }, []);

  return (
    <BuilderContext.Provider value={{
      state, dispatch,
      init, setBusinessType,
      addModule, removeModule, toggleModule,
      updateModuleConfig, updateModuleLabel, reorderModules,
      setActiveModule, setTheme, setPreviewTab, toggleMobilePreview,
    }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error('useBuilder must be used inside BuilderProvider');
  return ctx;
}
