/**
 * VeStyle — Registre Central des Composants Dynamiques
 * Chaque bloc est entièrement paramétrable via ses props.
 * Mistral utilise ce registre pour comprendre ce qu'il peut modifier.
 */

// ─── Types de props supportés ────────────────────────────────────────────────
export const PROP_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  COLOR: 'color',
  GRADIENT: 'gradient',
  ENUM: 'enum',
  URL: 'url',
  CLOUDINARY_URL: 'cloudinary_url',
  ARRAY: 'array',
  OBJECT: 'object',
};

// ─── Registre complet des blocs ──────────────────────────────────────────────
export const COMPONENT_REGISTRY = {

  // ═══ HERO BANNER ══════════════════════════════════════════════════════════
  hero: {
    label: 'Hero Banner',
    emoji: '🌟',
    description: 'Bannière principale avec titre, sous-titre et bouton d\'action',
    category: 'layout',
    props: {
      title:              { type: 'string',  default: 'Bienvenue dans notre boutique',    label: 'Titre principal' },
      subtitle:           { type: 'string',  default: 'Découvrez notre sélection unique', label: 'Sous-titre' },
      backgroundType:     { type: 'enum',    default: 'gradient', values: ['gradient', 'image', 'video', 'solid', 'particles'], label: 'Type d\'arrière-plan' },
      backgroundGradient: { type: 'gradient',default: '135deg,#667eea 0%,#764ba2 100%',  label: 'Dégradé' },
      backgroundImage:    { type: 'cloudinary_url', default: '',                         label: 'Image de fond' },
      backgroundVideo:    { type: 'url',     default: '',                                label: 'Vidéo de fond (URL)' },
      backgroundSolid:    { type: 'color',   default: '#1a1a2e',                         label: 'Couleur pleine' },
      overlayColor:       { type: 'color',   default: '#000000',                         label: 'Couleur voile' },
      overlayOpacity:     { type: 'number',  default: 0.4, min: 0, max: 1, step: 0.05,  label: 'Opacité du voile' },
      height:             { type: 'enum',    default: 'screen', values: ['auto', 'screen', 'half', 'third', 'tall'], label: 'Hauteur' },
      textAlign:          { type: 'enum',    default: 'center', values: ['left', 'center', 'right'],                label: 'Alignement texte' },
      titleSize:          { type: 'enum',    default: '4xl', values: ['2xl', '3xl', '4xl', '5xl', '6xl', '7xl'],   label: 'Taille du titre' },
      titleColor:         { type: 'color',   default: '#ffffff',                         label: 'Couleur titre' },
      titleGradient:      { type: 'gradient',default: '',                                label: 'Dégradé titre (vide = couleur unie)' },
      titleWeight:        { type: 'enum',    default: '800', values: ['400', '600', '700', '800', '900'],           label: 'Graisse titre' },
      subtitleColor:      { type: 'color',   default: 'rgba(255,255,255,0.85)',          label: 'Couleur sous-titre' },
      ctaText:            { type: 'string',  default: 'Découvrir',                       label: 'Texte bouton' },
      ctaLink:            { type: 'string',  default: '#catalogue',                      label: 'Lien bouton' },
      ctaStyle:           { type: 'enum',    default: 'solid', values: ['solid', 'outline', 'ghost', 'gradient'],   label: 'Style bouton' },
      ctaColor:           { type: 'color',   default: '#ffffff',                         label: 'Couleur bouton' },
      ctaBg:              { type: 'color',   default: 'transparent',                     label: 'Fond bouton' },
      ctaRadius:          { type: 'number',  default: 8, min: 0, max: 50,               label: 'Arrondi bouton (px)' },
      animation:          { type: 'enum',    default: 'fade-up', values: ['none', 'fade', 'fade-up', 'slide-left', 'zoom', 'typewriter'], label: 'Animation entrée' },
      showScrollIndicator:{ type: 'boolean', default: true,                              label: 'Indicateur de scroll' },
      showBadges:         { type: 'boolean', default: false,                             label: 'Afficher badges' },
      badges:             { type: 'array',   default: [],                                label: 'Badges (ex: "✓ Livraison gratuite")' },
      paddingTop:         { type: 'number',  default: 80, min: 0, max: 300,             label: 'Padding haut (px)' },
      paddingBottom:      { type: 'number',  default: 80, min: 0, max: 300,             label: 'Padding bas (px)' },
    }
  },

  // ═══ CAROUSEL ═════════════════════════════════════════════════════════════
  carousel: {
    label: 'Carrousel',
    emoji: '🎠',
    description: 'Diaporama d\'images ou de slides avec animations',
    category: 'media',
    props: {
      slides:         { type: 'array',   default: [],                                label: 'Slides' },
      autoPlay:       { type: 'boolean', default: true,                              label: 'Lecture auto' },
      autoPlayDelay:  { type: 'number',  default: 4000, min: 1000, max: 10000,       label: 'Délai (ms)' },
      transition:     { type: 'enum',    default: 'fade', values: ['fade', 'slide', 'zoom', 'ken-burns'], label: 'Transition' },
      showDots:       { type: 'boolean', default: true,                              label: 'Afficher points' },
      showArrows:     { type: 'boolean', default: true,                              label: 'Afficher flèches' },
      showCaptions:   { type: 'boolean', default: true,                              label: 'Afficher légendes' },
      height:         { type: 'enum',    default: 'screen', values: ['auto', 'screen', 'half', 'third', 'tall'], label: 'Hauteur' },
      overlayColor:   { type: 'color',   default: 'rgba(0,0,0,0.3)',                 label: 'Voile coloré' },
      dotsColor:      { type: 'color',   default: '#ffffff',                         label: 'Couleur points' },
      arrowColor:     { type: 'color',   default: '#ffffff',                         label: 'Couleur flèches' },
      arrowBg:        { type: 'color',   default: 'rgba(0,0,0,0.4)',                 label: 'Fond flèches' },
      borderRadius:   { type: 'number',  default: 0, min: 0, max: 40,               label: 'Arrondi (px)' },
      pauseOnHover:   { type: 'boolean', default: true,                              label: 'Pause au survol' },
    }
  },

  // ═══ OFFERING GRID (Produits + Services unifiés) ═══════════════════════════
  offeringGrid: {
    label: 'Grille Produits / Services',
    emoji: '🛍️',
    description: 'Affiche vos produits et/ou services en grille ou liste',
    category: 'commerce',
    props: {
      title:           { type: 'string',  default: 'Nos Offres',                    label: 'Titre section' },
      subtitle:        { type: 'string',  default: '',                              label: 'Sous-titre' },
      offerTypes:      { type: 'enum',    default: 'both', values: ['products', 'services', 'both'], label: 'Types d\'offres' },
      columns:         { type: 'enum',    default: '3', values: ['1', '2', '3', '4'], label: 'Colonnes' },
      layout:          { type: 'enum',    default: 'grid', values: ['grid', 'list', 'masonry', 'featured'], label: 'Disposition' },
      cardStyle:       { type: 'enum',    default: 'shadow', values: ['shadow', 'border', 'flat', 'glass'], label: 'Style carte' },
      cardRadius:      { type: 'number',  default: 12, min: 0, max: 40,            label: 'Arrondi cartes (px)' },
      showPrice:       { type: 'boolean', default: true,                            label: 'Afficher prix' },
      currency:        { type: 'string',  default: 'XOF',                          label: 'Devise' },
      showRating:      { type: 'boolean', default: true,                            label: 'Afficher notes' },
      showBadges:      { type: 'boolean', default: true,                            label: 'Afficher badges' },
      showAddToCart:   { type: 'boolean', default: true,                            label: 'Bouton panier' },
      addToCartText:   { type: 'string',  default: 'Ajouter',                      label: 'Texte bouton panier' },
      showWishlist:    { type: 'boolean', default: true,                            label: 'Bouton favoris' },
      showFilters:     { type: 'boolean', default: true,                            label: 'Filtres par catégorie' },
      itemsPerPage:    { type: 'number',  default: 12, min: 4, max: 48,            label: 'Items par page' },
      imageRatio:      { type: 'enum',    default: 'square', values: ['square', 'portrait', 'landscape', 'auto'], label: 'Ratio image' },
      hoverEffect:     { type: 'enum',    default: 'lift', values: ['none', 'lift', 'zoom', 'overlay'], label: 'Effet survol' },
      bgColor:         { type: 'color',   default: '#f9fafb',                       label: 'Couleur fond section' },
      paddingTop:      { type: 'number',  default: 60, min: 0, max: 200,           label: 'Padding haut (px)' },
      paddingBottom:   { type: 'number',  default: 60, min: 0, max: 200,           label: 'Padding bas (px)' },
    }
  },

  // ═══ RICH TEXT ════════════════════════════════════════════════════════════
  richText: {
    label: 'Texte Riche',
    emoji: '📝',
    description: 'Bloc de texte formaté avec titre, paragraphes et liste',
    category: 'content',
    props: {
      title:       { type: 'string',  default: 'Notre Histoire',              label: 'Titre' },
      titleSize:   { type: 'enum',    default: '3xl', values: ['xl', '2xl', '3xl', '4xl', '5xl'], label: 'Taille titre' },
      titleColor:  { type: 'color',   default: '#111827',                     label: 'Couleur titre' },
      titleAlign:  { type: 'enum',    default: 'center', values: ['left', 'center', 'right'],     label: 'Alignement titre' },
      content:     { type: 'string',  default: 'Écrivez votre contenu ici...', label: 'Contenu (HTML ou texte)' },
      contentColor:{ type: 'color',   default: '#374151',                     label: 'Couleur texte' },
      contentSize: { type: 'enum',    default: 'base', values: ['sm', 'base', 'lg', 'xl'],        label: 'Taille texte' },
      bgColor:     { type: 'color',   default: '#ffffff',                     label: 'Fond section' },
      maxWidth:    { type: 'enum',    default: '3xl', values: ['sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'], label: 'Largeur max' },
      showDivider: { type: 'boolean', default: false,                         label: 'Séparateur décoratif' },
      dividerColor:{ type: 'color',   default: '#6366f1',                     label: 'Couleur séparateur' },
      paddingTop:  { type: 'number',  default: 60, min: 0, max: 200,         label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number', default: 60, min: 0, max: 200,         label: 'Padding bas (px)' },
    }
  },

  // ═══ TESTIMONIAL SLIDER ═══════════════════════════════════════════════════
  testimonialSlider: {
    label: 'Avis Clients',
    emoji: '⭐',
    description: 'Carrousel d\'avis et témoignages clients',
    category: 'social',
    props: {
      title:          { type: 'string',  default: 'Ce que disent nos clients',  label: 'Titre section' },
      subtitle:       { type: 'string',  default: '',                           label: 'Sous-titre' },
      testimonials:   { type: 'array',   default: [],                           label: 'Témoignages' },
      layout:         { type: 'enum',    default: 'slider', values: ['slider', 'grid', 'masonry'], label: 'Disposition' },
      cardStyle:      { type: 'enum',    default: 'card', values: ['card', 'quote', 'minimal', 'glass'], label: 'Style carte' },
      bgColor:        { type: 'color',   default: '#f9fafb',                    label: 'Fond section' },
      cardBg:         { type: 'color',   default: '#ffffff',                    label: 'Fond carte' },
      textColor:      { type: 'color',   default: '#374151',                    label: 'Couleur texte' },
      starColor:      { type: 'color',   default: '#f59e0b',                    label: 'Couleur étoiles' },
      autoPlay:       { type: 'boolean', default: true,                         label: 'Lecture auto' },
      showRating:     { type: 'boolean', default: true,                         label: 'Afficher notes' },
      showAvatar:     { type: 'boolean', default: true,                         label: 'Afficher avatar' },
      paddingTop:     { type: 'number',  default: 60, min: 0, max: 200,        label: 'Padding haut (px)' },
      paddingBottom:  { type: 'number',  default: 60, min: 0, max: 200,        label: 'Padding bas (px)' },
    }
  },

  // ═══ STATS BAR ════════════════════════════════════════════════════════════
  statsBar: {
    label: 'Barre de Statistiques',
    emoji: '📊',
    description: 'Chiffres clés animés (clients, commandes, satisfaction...)',
    category: 'content',
    props: {
      stats:       { type: 'array',   default: [
        { value: '1 200', label: 'Clients satisfaits', icon: '👥' },
        { value: '4.9★',  label: 'Note moyenne',       icon: '⭐' },
        { value: '5 000', label: 'Commandes livrées',  icon: '📦' },
        { value: '100%',  label: 'Satisfaction',       icon: '✅' },
      ], label: 'Statistiques' },
      layout:      { type: 'enum',    default: 'row', values: ['row', 'column', 'cards'], label: 'Disposition' },
      bgColor:     { type: 'color',   default: '#1e1b4b',   label: 'Fond section' },
      textColor:   { type: 'color',   default: '#ffffff',   label: 'Couleur texte' },
      valueColor:  { type: 'color',   default: '#a5b4fc',   label: 'Couleur valeur' },
      animated:    { type: 'boolean', default: true,        label: 'Animer les chiffres' },
      showDivider: { type: 'boolean', default: true,        label: 'Séparateurs entre stats' },
      paddingTop:  { type: 'number',  default: 40, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number', default: 40, min: 0, max: 200, label: 'Padding bas (px)' },
    }
  },

  // ═══ FAQ ACCORDION ════════════════════════════════════════════════════════
  faqAccordion: {
    label: 'FAQ / Accordéon',
    emoji: '❓',
    description: 'Questions fréquentes en accordéon interactif',
    category: 'content',
    props: {
      title:        { type: 'string',  default: 'Questions fréquentes',  label: 'Titre' },
      subtitle:     { type: 'string',  default: '',                      label: 'Sous-titre' },
      items:        { type: 'array',   default: [
        { question: 'Quels sont vos délais de livraison ?', answer: 'Nous livrons en 2 à 5 jours ouvrables.' },
        { question: 'Comment suivre ma commande ?',         answer: 'Un lien de suivi vous est envoyé par email dès l\'expédition.' },
        { question: 'Puis-je retourner un article ?',       answer: 'Oui, vous avez 14 jours pour retourner un article non utilisé.' },
      ], label: 'Questions / Réponses' },
      allowMultiple:{ type: 'boolean', default: false,        label: 'Plusieurs ouverts simultanément' },
      defaultOpen:  { type: 'number',  default: -1, min: -1, label: 'Ouvert par défaut (-1 = aucun)' },
      style:        { type: 'enum',    default: 'border', values: ['border', 'card', 'minimal', 'boxed'], label: 'Style' },
      bgColor:      { type: 'color',   default: '#ffffff',    label: 'Fond section' },
      itemBg:       { type: 'color',   default: '#f9fafb',    label: 'Fond item' },
      textColor:    { type: 'color',   default: '#111827',    label: 'Couleur texte' },
      iconColor:    { type: 'color',   default: '#6366f1',    label: 'Couleur icône +/-' },
      paddingTop:   { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    }
  },

  // ═══ COUNTDOWN ════════════════════════════════════════════════════════════
  countdown: {
    label: 'Compte à Rebours',
    emoji: '⏱️',
    description: 'Minuterie pour promotions ou événements',
    category: 'marketing',
    props: {
      title:       { type: 'string',  default: '⚡ Offre Flash — Temps restant :',label: 'Titre' },
      targetDate:  { type: 'string',  default: '',                               label: 'Date cible (ISO)' },
      expiredText: { type: 'string',  default: 'L\'offre a expiré !',            label: 'Texte expiré' },
      ctaText:     { type: 'string',  default: 'Profiter de l\'offre',           label: 'Bouton CTA' },
      ctaLink:     { type: 'string',  default: '#catalogue',                     label: 'Lien CTA' },
      bgColor:     { type: 'color',   default: '#7c3aed',                        label: 'Fond section' },
      textColor:   { type: 'color',   default: '#ffffff',                        label: 'Couleur texte' },
      digitBg:     { type: 'color',   default: 'rgba(255,255,255,0.15)',         label: 'Fond chiffres' },
      showDays:    { type: 'boolean', default: true,  label: 'Afficher jours' },
      showHours:   { type: 'boolean', default: true,  label: 'Afficher heures' },
      showMinutes: { type: 'boolean', default: true,  label: 'Afficher minutes' },
      showSeconds: { type: 'boolean', default: true,  label: 'Afficher secondes' },
      paddingTop:  { type: 'number',  default: 40, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number', default: 40, min: 0, max: 200, label: 'Padding bas (px)' },
    }
  },

  // ═══ VIDEO EMBED ══════════════════════════════════════════════════════════
  videoEmbed: {
    label: 'Vidéo Intégrée',
    emoji: '🎬',
    description: 'Vidéo YouTube, Vimeo ou MP4 avec vignette personnalisée',
    category: 'media',
    props: {
      title:       { type: 'string',  default: '',                                   label: 'Titre section' },
      videoUrl:    { type: 'url',     default: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', label: 'URL vidéo (YouTube/Vimeo)' },
      thumbnail:   { type: 'cloudinary_url', default: '',                            label: 'Vignette (optionnel)' },
      autoPlay:    { type: 'boolean', default: false, label: 'Lecture auto' },
      muted:       { type: 'boolean', default: true,  label: 'Muet par défaut' },
      showControls:{ type: 'boolean', default: true,  label: 'Afficher contrôles' },
      borderRadius:{ type: 'number',  default: 12, min: 0, max: 40, label: 'Arrondi (px)' },
      maxWidth:    { type: 'enum',    default: '4xl', values: ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'full'], label: 'Largeur max' },
      bgColor:     { type: 'color',   default: '#111827', label: 'Fond section' },
      paddingTop:  { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number', default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    }
  },

  // ═══ IMAGE GALLERY ════════════════════════════════════════════════════════
  imageGallery: {
    label: 'Galerie d\'Images',
    emoji: '🖼️',
    description: 'Galerie de photos en grille, masonry ou carrousel',
    category: 'media',
    props: {
      title:       { type: 'string', default: 'Notre Galerie',                     label: 'Titre' },
      images:      { type: 'array',  default: [],                                  label: 'Images' },
      layout:      { type: 'enum',   default: 'masonry', values: ['grid', 'masonry', 'carousel', 'fullwidth'], label: 'Disposition' },
      columns:     { type: 'enum',   default: '3', values: ['2', '3', '4', '5'],  label: 'Colonnes' },
      gap:         { type: 'number', default: 8, min: 0, max: 40,                 label: 'Espacement (px)' },
      borderRadius:{ type: 'number', default: 8, min: 0, max: 40,                 label: 'Arrondi (px)' },
      hoverEffect: { type: 'enum',   default: 'zoom', values: ['none', 'zoom', 'overlay', 'lift'], label: 'Effet survol' },
      openLightbox:{ type: 'boolean',default: true,                                label: 'Lightbox au clic' },
      bgColor:     { type: 'color',  default: '#ffffff',                           label: 'Fond section' },
      paddingTop:  { type: 'number', default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    }
  },

  // ═══ DIVIDER ══════════════════════════════════════════════════════════════
  divider: {
    label: 'Séparateur',
    emoji: '➖',
    description: 'Ligne ou forme décorative de séparation',
    category: 'layout',
    props: {
      style:  { type: 'enum',   default: 'line', values: ['line', 'wave', 'diagonal', 'dots', 'zigzag', 'none'], label: 'Style' },
      color:  { type: 'color',  default: '#e5e7eb', label: 'Couleur' },
      height: { type: 'number', default: 2, min: 1, max: 20, label: 'Épaisseur (px)' },
      width:  { type: 'enum',   default: 'full', values: ['full', '3/4', '1/2', '1/4'], label: 'Largeur' },
      margin: { type: 'number', default: 24, min: 0, max: 100, label: 'Marge (px)' },
    }
  },

  // ═══ SPACER ═══════════════════════════════════════════════════════════════
  spacer: {
    label: 'Espace Vide',
    emoji: '⬜',
    description: 'Espace vertical vide pour la mise en page',
    category: 'layout',
    props: {
      height:  { type: 'number', default: 60, min: 4, max: 400, label: 'Hauteur (px)' },
      bgColor: { type: 'color',  default: 'transparent',         label: 'Couleur fond' },
    }
  },

  // ═══ CONTACT FORM ═════════════════════════════════════════════════════════
  contactForm: {
    label: 'Formulaire de Contact',
    emoji: '📬',
    description: 'Formulaire de contact avec carte et informations',
    category: 'utility',
    props: {
      title:         { type: 'string',  default: 'Nous Contacter',   label: 'Titre' },
      subtitle:      { type: 'string',  default: 'Répondons à toutes vos questions', label: 'Sous-titre' },
      showPhone:     { type: 'boolean', default: true,               label: 'Téléphone' },
      phone:         { type: 'string',  default: '',                 label: 'Numéro' },
      showEmail:     { type: 'boolean', default: true,               label: 'Email' },
      email:         { type: 'string',  default: '',                 label: 'Adresse email' },
      showAddress:   { type: 'boolean', default: true,               label: 'Adresse' },
      address:       { type: 'string',  default: '',                 label: 'Adresse physique' },
      showWhatsApp:  { type: 'boolean', default: true,               label: 'WhatsApp' },
      whatsapp:      { type: 'string',  default: '',                 label: 'Numéro WhatsApp' },
      showMap:       { type: 'boolean', default: false,              label: 'Carte intégrée' },
      mapEmbedUrl:   { type: 'url',     default: '',                 label: 'URL d\'intégration Google Maps' },
      showForm:      { type: 'boolean', default: true,               label: 'Formulaire de message' },
      confirmMessage:{ type: 'string',  default: 'Message envoyé ! Nous vous répondrons bientôt.', label: 'Message confirmation' },
      bgColor:       { type: 'color',   default: '#f9fafb',          label: 'Fond section' },
      paddingTop:    { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom: { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    }
  },

  // ═══ NEWSLETTER ═══════════════════════════════════════════════════════════
  newsletterSignup: {
    label: 'Inscription Newsletter',
    emoji: '📧',
    description: 'Capture d\'emails avec offre incitative',
    category: 'marketing',
    props: {
      title:         { type: 'string',  default: 'Restez informé(e) !',         label: 'Titre' },
      subtitle:      { type: 'string',  default: 'Offres exclusives en avant-première', label: 'Sous-titre' },
      placeholder:   { type: 'string',  default: 'Votre adresse email',         label: 'Placeholder champ email' },
      buttonText:    { type: 'string',  default: "S'abonner",                   label: 'Texte bouton' },
      showIncentive: { type: 'boolean', default: true,                           label: 'Afficher incitation' },
      incentive:     { type: 'string',  default: '-10% sur votre première commande', label: 'Incitation' },
      confirmMsg:    { type: 'string',  default: 'Merci ! Votre inscription est confirmée.', label: 'Message confirmation' },
      bgColor:       { type: 'color',   default: '#1e1b4b',                     label: 'Fond section' },
      textColor:     { type: 'color',   default: '#ffffff',                     label: 'Couleur texte' },
      buttonBg:      { type: 'color',   default: '#6366f1',                     label: 'Fond bouton' },
      buttonColor:   { type: 'color',   default: '#ffffff',                     label: 'Texte bouton' },
      layout:        { type: 'enum',    default: 'centered', values: ['centered', 'inline', 'split'], label: 'Disposition' },
      paddingTop:    { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom: { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    }
  },

  // ═══ SOCIAL LINKS ═════════════════════════════════════════════════════════
  socialLinks: {
    label: 'Liens Sociaux',
    emoji: '🔗',
    description: 'Boutons vers vos réseaux sociaux',
    category: 'social',
    props: {
      title:       { type: 'string',  default: 'Suivez-nous',   label: 'Titre' },
      instagram:   { type: 'url',     default: '',              label: 'Instagram' },
      facebook:    { type: 'url',     default: '',              label: 'Facebook' },
      tiktok:      { type: 'url',     default: '',              label: 'TikTok' },
      whatsapp:    { type: 'string',  default: '',              label: 'WhatsApp (numéro)' },
      youtube:     { type: 'url',     default: '',              label: 'YouTube' },
      twitter:     { type: 'url',     default: '',              label: 'X / Twitter' },
      style:       { type: 'enum',    default: 'rounded', values: ['rounded', 'square', 'pill', 'minimal'], label: 'Style boutons' },
      size:        { type: 'enum',    default: 'md', values: ['sm', 'md', 'lg'], label: 'Taille' },
      bgColor:     { type: 'color',   default: '#ffffff',      label: 'Fond section' },
      paddingTop:  { type: 'number',  default: 40, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number', default: 40, min: 0, max: 200, label: 'Padding bas (px)' },
    }
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retourne la config par défaut d'un composant */
export function getDefaultConfig(type) {
  const def = COMPONENT_REGISTRY[type];
  if (!def) return {};
  return Object.fromEntries(
    Object.entries(def.props).map(([key, prop]) => [key, prop.default])
  );
}

/** Retourne le schéma Mistral-friendly (pour le prompt système) */
export function getComponentSchemaForAI() {
  return Object.entries(COMPONENT_REGISTRY).map(([type, def]) => ({
    type,
    label: def.label,
    description: def.description,
    category: def.category,
    props: Object.entries(def.props).map(([key, prop]) => ({
      key,
      type: prop.type,
      label: prop.label,
      default: prop.default,
      ...(prop.values ? { values: prop.values } : {}),
      ...(prop.min !== undefined ? { min: prop.min } : {}),
      ...(prop.max !== undefined ? { max: prop.max } : {}),
    }))
  }));
}

/** Valide qu'une valeur respecte son type de prop */
export function validatePropValue(propDef, value) {
  if (value === null || value === undefined) return false;
  switch (propDef.type) {
    case 'string': return typeof value === 'string';
    case 'number': {
      const n = Number(value);
      if (isNaN(n)) return false;
      if (propDef.min !== undefined && n < propDef.min) return false;
      if (propDef.max !== undefined && n > propDef.max) return false;
      return true;
    }
    case 'boolean': return typeof value === 'boolean';
    case 'enum': return propDef.values?.includes(value);
    case 'color': return typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl') || value.includes('rgba') || value === 'transparent');
    case 'gradient': return typeof value === 'string';
    case 'url': case 'cloudinary_url': return typeof value === 'string';
    case 'array': return Array.isArray(value);
    case 'object': return typeof value === 'object' && !Array.isArray(value);
    default: return true;
  }
}

/** Nettoie et valide les props d'un bloc contre son schéma */
export function sanitizeBlockConfig(type, config) {
  const def = COMPONENT_REGISTRY[type];
  if (!def) return config;

  const sanitized = { ...getDefaultConfig(type) };
  for (const [key, value] of Object.entries(config)) {
    const propDef = def.props[key];
    if (!propDef) continue; // Ignorer les props inconnues
    if (validatePropValue(propDef, value)) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const BLOCK_CATEGORIES = {
  layout:    { label: 'Mise en page',   emoji: '📐' },
  media:     { label: 'Médias',         emoji: '🖼️' },
  commerce:  { label: 'Commerce',       emoji: '🛒' },
  content:   { label: 'Contenu',        emoji: '📝' },
  social:    { label: 'Social',         emoji: '🌐' },
  marketing: { label: 'Marketing',      emoji: '📣' },
  utility:   { label: 'Utilitaires',    emoji: '🔧' },
};
