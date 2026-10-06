/**
 * smartActivityDeducer.js — VesTyle Next Generation
 * ─────────────────────────────────────────────────────────────────────────────
 * Moteur d'analyse d'activité et de déduction intelligente pour l'onboarding VesTyle.
 *
 * Principe directeur :
 * "Le vendeur explique son activité → VesTyle comprend → VesTyle demande seulement
 * les informations importantes manquantes → VesTyle propose la boutique → le vendeur valide
 * → VesTyle crée la boutique."
 *
 * ZÉRO question technique sur les templates, structures ou blocs.
 * ZÉRO devinette sur une information critique sans confirmation du vendeur.
 */

export function analyzeSellerActivity({
  businessName = '',
  phone = '',
  city = '',
  activityText = '',
  visualPreference = null,
  clarificationAnswers = {},
}) {
  const normText = `${businessName} ${activityText} ${city}`.toLowerCase();

  // ── 1. CLASSIFICATION SÉMANTIQUE MÉTIER ─────────────────────────────────────
  let domain = 'Commerce Général';
  let businessType = 'general_store';
  let offerType = 'products'; // 'products' | 'services' | 'both'
  let inferredOffer = 'Produits de qualité sélectionnés pour nos clients';
  let targetAudience = 'Grand public et clients locaux';
  let mainGoal = 'Présenter le catalogue et recevoir des commandes directes sur WhatsApp';
  let primaryAction = 'whatsapp';
  let suggestedMood = 'modern';
  let questions = [];

  // A. Coiffure, Tresses, Beauté & Soins Esthétiques
  if (
    normText.includes('coiff') || normText.includes('tresse') || normText.includes('perruque') ||
    normText.includes('ongle') || normText.includes('soin') || normText.includes('esthéti') ||
    normText.includes('maquillage') || normText.includes('make up') || normText.includes('barber') ||
    normText.includes('barbier') || normText.includes('salon')
  ) {
    domain = 'Beauté, Coiffure & Soins';
    businessType = 'beauty_cosmetics';
    offerType = normText.includes('perruque') || normText.includes('produit') ? 'both' : 'services';
    inferredOffer = 'Prestations de coiffure, tresses, soins capillaires et esthétiques';
    targetAudience = 'Femmes et hommes à la recherche de soins et coiffures soignés';
    mainGoal = 'Prise de rendez-vous rapide sur WhatsApp et vitrine des réalisations';
    primaryAction = 'booking';
    suggestedMood = 'luxury';

    if (clarificationAnswers.appointmentMode === undefined) {
      questions.push({
        id: 'appointmentMode',
        label: 'Prise de rendez-vous',
        question: 'Comment souhaitez-vous que vos clientes prennent rendez-vous ?',
        type: 'choice',
        options: [
          { value: 'whatsapp', label: '💬 Directement par message WhatsApp', desc: 'Idéal pour échanger et convenir d’une heure' },
          { value: 'phone', label: '📞 Par appel téléphonique direct', desc: 'Pour les réservations immédiates' },
        ],
        defaultValue: 'whatsapp',
      });
    }

    if (clarificationAnswers.hasLocation === undefined) {
      questions.push({
        id: 'hasLocation',
        label: 'Lieu des prestations',
        question: 'Où effectuez-vous vos prestations ?',
        type: 'choice',
        options: [
          { value: 'salon', label: '🏢 En salon / à mon adresse', desc: 'Les clientes se déplacent' },
          { value: 'domicile', label: '🚗 À domicile / déplacement', desc: 'Vous vous déplacez chez le client' },
          { value: 'both', label: '✨ Les deux (salon & domicile)', desc: 'Prestations flexibles' },
        ],
        defaultValue: 'salon',
      });
    }
  }

  // B. Restauration, Fast-Food, Traiteur & Pâtisserie
  else if (
    normText.includes('resto') || normText.includes('nourriture') || normText.includes('manger') ||
    normText.includes('burger') || normText.includes('pizza') || normText.includes('grill') ||
    normText.includes('chawarma') || normText.includes('traiteur') || normText.includes('gateau') ||
    normText.includes('gâteau') || normText.includes('pâtisserie') || normText.includes('plat') ||
    normText.includes('cuisine') || normText.includes('snack') || normText.includes('ndolè') ||
    normText.includes('poisson') || normText.includes('poulet') || normText.includes('cocktail')
  ) {
    domain = 'Restauration, Cuisine & Gourmandises';
    businessType = 'restaurant_fastfood';
    offerType = 'products';
    inferredOffer = 'Plats cuisinés, spécialités savoureuses et formules repas';
    targetAudience = 'Amateurs de bonne cuisine locale, déjeuners et dîners gourmands';
    mainGoal = 'Afficher le menu du jour et recevoir les commandes de repas par WhatsApp';
    primaryAction = 'whatsapp';
    suggestedMood = 'warm';

    if (clarificationAnswers.deliveryMode === undefined) {
      questions.push({
        id: 'deliveryMode',
        label: 'Livraison & Retrait',
        question: 'Quel est votre mode de service principal ?',
        type: 'choice',
        options: [
          { value: 'delivery_takeout', label: '🛵 Livraison à domicile & À emporter', desc: 'Commandes expédiées rapidement' },
          { value: 'onsite', label: '🍽️ Sur place uniquement (au restaurant)', desc: 'Service en salle' },
          { value: 'all', label: '✨ Sur place, à emporter & livraison', desc: 'Service complet' },
        ],
        defaultValue: 'delivery_takeout',
      });
    }
  }

  // C. Mode, Vêtements, Chaussures & Prêt-à-porter
  else if (
    normText.includes('vetement') || normText.includes('vêtement') || normText.includes('habit') ||
    normText.includes('robe') || normText.includes('costume') || normText.includes('chaussure') ||
    normText.includes('sneaker') || normText.includes('sac') || normText.includes('mode') ||
    normText.includes('fashion') || normText.includes('bijou') || normText.includes('montre') ||
    normText.includes('tissu') || normText.includes('wax') || normText.includes('couture') ||
    normText.includes('lingerie')
  ) {
    domain = 'Mode, Prêt-à-Porter & Accessoires';
    businessType = 'fashion_clothing';
    offerType = normText.includes('couture') || normText.includes('mesure') ? 'both' : 'products';
    inferredOffer = 'Vêtements élégants, pièces de mode tendance et accessoires';
    targetAudience = 'Clients soucieux de leur style et amateurs de mode contemporaine';
    mainGoal = 'Mettre en valeur les collections et déclencher des ventes directes';
    primaryAction = 'catalog';
    suggestedMood = 'luxury';

    if (clarificationAnswers.deliveryOption === undefined) {
      questions.push({
        id: 'deliveryOption',
        label: 'Expédition & Livraison',
        question: 'Comment livrez-vous vos articles ?',
        type: 'choice',
        options: [
          { value: 'city_wide', label: '🛵 Livraison locale dans toute la ville', desc: 'Paiement à la livraison ou avance' },
          { value: 'national', label: '📦 Expédition nationale & inter-villes', desc: 'Envoi par agence de voyage / colis' },
          { value: 'shop_pickup', label: '🛍️ Retrait en boutique & livraison', desc: 'Option flexible' },
        ],
        defaultValue: 'city_wide',
      });
    }
  }

  // D. High-Tech, Smartphones, Informatique & Électronique
  else if (
    normText.includes('phone') || normText.includes('iphone') || normText.includes('samsung') ||
    normText.includes('ordinateur') || normText.includes('pc') || normText.includes('laptop') ||
    normText.includes('tech') || normText.includes('electro') || normText.includes('électro') ||
    normText.includes('ecouteur') || normText.includes('écouteur') || normText.includes('accessoire phone') ||
    normText.includes('tablette') || normText.includes('tv') || normText.includes('écran')
  ) {
    domain = 'High-Tech, Téléphonie & Électronique';
    businessType = 'electronics_hitech';
    offerType = normText.includes('réparation') || normText.includes('depannage') ? 'both' : 'products';
    inferredOffer = 'Smartphones, ordinateurs, accessoires certifiés et garantis';
    targetAudience = 'Particuliers et professionnels à la recherche d’équipements technologiques fiables';
    mainGoal = 'Présenter les fiches techniques claires et valider les commandes rapidement';
    primaryAction = 'catalog';
    suggestedMood = 'modern';

    if (clarificationAnswers.warranty === undefined) {
      questions.push({
        id: 'warranty',
        label: 'Garantie & Authenticité',
        question: 'Proposez-vous une garantie sur vos appareils ?',
        type: 'choice',
        options: [
          { value: 'yes_warranty', label: '🛡️ Oui, appareils garantis avec SAV', desc: 'Renforce immédiatement la confiance' },
          { value: 'tested', label: '✅ Appareils testés et vérifiés avant achat', desc: 'Qualité contrôlée' },
        ],
        defaultValue: 'yes_warranty',
      });
    }
  }

  // E. Chiens, Chats, Animaux & Animalerie
  else if (
    normText.includes('chien') || normText.includes('chat') || normText.includes('animal') ||
    normText.includes('animaux') || normText.includes('chiot') || normText.includes('chaton') ||
    normText.includes('croquette') || normText.includes('veterinaire') || normText.includes('vétérinaire') ||
    normText.includes('dressage') || normText.includes('éleveur') || normText.includes('elevage')
  ) {
    domain = 'Élevage & Animalerie';
    businessType = 'pets_animals';
    offerType = normText.includes('dressage') || normText.includes('garde') ? 'both' : 'products';
    inferredOffer = 'Chiots et chatons de race, alimentation de qualité et soins animaliers';
    targetAudience = 'Familles et passionnés d’animaux de compagnie';
    mainGoal = 'Présenter les portées disponibles, rassurer sur la santé et faciliter l’adoption';
    primaryAction = 'whatsapp';
    suggestedMood = 'warm';

    if (clarificationAnswers.vaccinationStatus === undefined) {
      questions.push({
        id: 'vaccinationStatus',
        label: 'Santé & Suivi vétérinaire',
        question: 'Vos animaux sont-ils vaccinés et carnet de santé à jour ?',
        type: 'choice',
        options: [
          { value: 'vaccinated', label: '💉 Oui, vaccinés, vermifugés avec carnet', desc: 'Mentionné en priorité sur la vitrine' },
          { value: 'standard', label: '🩺 Suivi vétérinaire régulier', desc: 'Garantie de bonne santé' },
        ],
        defaultValue: 'vaccinated',
      });
    }
  }

  // F. Artisans, BTP, Menuiserie, Plomberie, Décoration
  else if (
    normText.includes('artisan') || normText.includes('menuis') || normText.includes('plomb') ||
    normText.includes('peintre') || normText.includes('btp') || normText.includes('renov') ||
    normText.includes('décorat') || normText.includes('meuble') || normText.includes('bois') ||
    normText.includes('ferron') || normText.includes('alu') || normText.includes('chantier')
  ) {
    domain = 'Artisanat, Travaux & Réalisations';
    businessType = 'crafts_services';
    offerType = 'both';
    inferredOffer = 'Fabrications sur mesure, prestations de travaux et rénovations';
    targetAudience = 'Propriétaires de maisons, bureaux et chantiers de construction';
    mainGoal = 'Exposer la galerie de réalisations et recevoir des demandes de devis sur WhatsApp';
    primaryAction = 'quote';
    suggestedMood = 'warm';

    if (clarificationAnswers.quoteMode === undefined) {
      questions.push({
        id: 'quoteMode',
        label: 'Demande de devis',
        question: 'Comment établissez-vous vos estimations de prix ?',
        type: 'choice',
        options: [
          { value: 'free_quote', label: '📋 Devis gratuit rapide sur WhatsApp après photos/plans', desc: 'Très efficace pour convertir' },
          { value: 'site_visit', label: '📐 Déplacement sur site pour métrage', desc: 'Précision maximale' },
        ],
        defaultValue: 'free_quote',
      });
    }
  }

  // G. Hôtellerie, Meublés, Résidences & Tourisme
  else if (
    normText.includes('hotel') || normText.includes('hôtel') || normText.includes('meublé') ||
    normText.includes('appartement meublé') || normText.includes('residence') || normText.includes('résidence') ||
    normText.includes('chambre') || normText.includes('voyage') || normText.includes('tourisme') ||
    normText.includes('auberge')
  ) {
    domain = 'Hébergement, Meublés & Séjours';
    businessType = 'hotel_resort';
    offerType = 'services';
    inferredOffer = 'Appartements meublés grand confort, chambres équipées et séjours sur mesure';
    targetAudience = 'Voyageurs d’affaires, touristes et résidents temporaires';
    mainGoal = 'Montrer les photos des logements, disponibilités et réserver en direct sans commission';
    primaryAction = 'booking';
    suggestedMood = 'luxury';

    if (clarificationAnswers.rentalDuration === undefined) {
      questions.push({
        id: 'rentalDuration',
        label: 'Type de séjour',
        question: 'Quelles sont vos formules de location principales ?',
        type: 'choice',
        options: [
          { value: 'daily_weekly', label: '🌙 À la nuitée et à la semaine', desc: 'Courts séjours touristiques / affaires' },
          { value: 'monthly', label: '📅 Au mois (moyen & long séjour)', desc: 'Résidents temporaires' },
          { value: 'both', label: '✨ Toutes durées (nuitée, semaine, mois)', desc: 'Flexibilité totale' },
        ],
        defaultValue: 'both',
      });
    }
  }

  // H. Services Professionnels, Agence, Formation, Conseil
  else if (
    normText.includes('conseil') || normText.includes('agence') || normText.includes('formation') ||
    normText.includes('coach') || normText.includes('jurid') || normText.includes('comptab') ||
    normText.includes('marketing') || normText.includes('digital') || normText.includes('design') ||
    normText.includes('graphis')
  ) {
    domain = 'Services Professionnels & Conseil';
    businessType = 'services_consulting';
    offerType = 'services';
    inferredOffer = 'Accompagnement d’experts, formations qualifiantes et solutions sur mesure';
    targetAudience = 'Entrepreneurs, entreprises et professionnels en quête d’expertise';
    mainGoal = 'Démontrer la crédibilité, afficher les avis clients et déclencher des prises de contact';
    primaryAction = 'quote';
    suggestedMood = 'modern';
  }

  // ── 2. CHOIX VISUEL COMPRÉHENSIBLE ──────────────────────────────────────────
  const finalMoodKey = visualPreference && MOOD_PRESETS[visualPreference] ? visualPreference : suggestedMood;
  const moodConf = MOOD_PRESETS[finalMoodKey] || MOOD_PRESETS.modern;

  // ── 3. SYNTHÈSE DE COMPRÉHENSION STRUCTURÉE (PRÉSENTÉE AU VENDEUR) ──────────
  const understandingSummary = {
    domaine: domain,
    activite: activityText || inferredOffer,
    produitsServices: offerType === 'products' ? 'Catalogue de Produits physiques' : offerType === 'services' ? 'Prestations & Services sur mesure' : 'Offre Hybride (Produits & Services)',
    public: targetAudience,
    localisation: city || 'Cameroun',
    objectif: mainGoal,
    directionVisuelle: moodConf.label,
  };

  // ── 4. GÉNÉRATION DE LA CONFIGURATION CANONIQUE DU STORE ────────────────────
  const cleanCity = city || 'Douala';
  const cleanName = businessName || 'Ma Boutique';
  const cleanPhone = phone || '+237 600 000 000';

  const sections = [
    {
      id: `header_${Date.now()}_1`,
      type: 'HEADER',
      variant: 'header_001',
      enabled: true,
      order: 0,
      config: {
        storeName: cleanName,
        city: cleanCity,
        phone: cleanPhone,
        whatsapp: cleanPhone,
        isSticky: true,
        showCity: true,
        showStatusBadge: true,
      },
    },
    {
      id: `hero_${Date.now()}_2`,
      type: 'HERO',
      variant: moodConf.heroVariant || 'hero_001',
      enabled: true,
      order: 1,
      config: {
        title: cleanName,
        subtitle: inferredOffer,
        badgeText: `✦ Ouvert à ${cleanCity}`,
        ctaText: primaryAction === 'booking' ? 'Prendre rendez-vous' : primaryAction === 'quote' ? 'Demander un devis' : 'Commander sur WhatsApp',
        ctaAction: 'whatsapp',
        ctaLink: `https://wa.me/${cleanPhone.replace(/\D/g, '')}`,
        imageUrl: '',
      },
    },
    {
      id: `product_${Date.now()}_3`,
      type: offerType === 'services' ? 'SERVICE' : 'PRODUCT',
      variant: offerType === 'services' ? 'service_cards' : 'product_grid_v2',
      enabled: true,
      order: 2,
      config: {
        title: offerType === 'services' ? 'Nos Prestations & Tarifs' : 'Nos Articles Disponibles',
        subtitle: `Sélectionnez et commandez en direct à ${cleanCity}`,
        displayStyle: 'grid',
        columns: 2,
      },
    },
    {
      id: `testimonial_${Date.now()}_4`,
      type: 'TESTIMONIAL',
      variant: 'testimonial_grid',
      enabled: true,
      order: 3,
      config: {
        title: 'La Confiance de nos Clients',
        subtitle: `Déjà plus de 500 clients satisfaits à ${cleanCity} et partout dans la région.`,
      },
    },
    {
      id: `contact_${Date.now()}_5`,
      type: 'CONTACT',
      variant: 'contact_whatsapp_direct',
      enabled: true,
      order: 4,
      config: {
        title: 'Contact & Accès Rapide',
        city: cleanCity,
        whatsappNumber: cleanPhone,
        phone: cleanPhone,
        whatsappMessage: `Bonjour ${cleanName}, je souhaite des informations / passer commande.`,
      },
    },
    {
      id: `footer_${Date.now()}_6`,
      type: 'FOOTER',
      variant: 'footer_minimal',
      enabled: true,
      order: 5,
      config: {
        storeName: cleanName,
        city: cleanCity,
        tagline: inferredOffer,
      },
    },
  ];

  const draftConfig = {
    theme: {
      ...moodConf.theme,
      font: moodConf.theme.font || 'Inter',
      colors: {
        primary: moodConf.theme.primaryColor,
        accent: moodConf.theme.accentColor,
        background: moodConf.theme.bgColor,
        text: moodConf.theme.textColor,
      },
    },
    sections,
    activeVstCode: `VST-${businessType.toUpperCase().slice(0, 5)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-V1`,
  };

  return {
    domain,
    businessType,
    offerType,
    inferredOffer,
    targetAudience,
    mainGoal,
    primaryAction,
    suggestedMood,
    visualDirection: moodConf.label,
    understandingSummary,
    missingCriticalQuestions: questions,
    draftConfig,
  };
}
