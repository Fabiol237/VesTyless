/**
 * VesTyle — Block Engine : Registre Unifié
 *
 * Source unique de vérité pour les 60 types de blocs.
 * Fusionne l'ancien componentRegistry.js (builder) et storeBlocks.js (boutique)
 * en un seul schéma cohérent.
 *
 * Structure d'un bloc dans layout_config.blocks :
 * {
 *   id: string,
 *   type: BlockType,          // ex: "hero"
 *   variant: string,          // ex: "split"
 *   enabled: boolean,
 *   position: number,
 *   settings: object,         // Dimensions, couleurs, layout
 *   content: object,          // Textes, images (données vendeur)
 * }
 */

// ─── Types de props supportés ────────────────────────────────────────────────
export const PROP_TYPES = {
  STRING:        'string',
  NUMBER:        'number',
  BOOLEAN:       'boolean',
  COLOR:         'color',
  GRADIENT:      'gradient',
  ENUM:          'enum',
  URL:           'url',
  CLOUDINARY_URL:'cloudinary_url',
  ARRAY:         'array',
  OBJECT:        'object',
};

// ─── Catégories de blocs ─────────────────────────────────────────────────────
export const BLOCK_CATEGORIES = {
  layout:     { label: 'Mise en page',         emoji: '📐', order: 1 },
  navigation: { label: 'Navigation',            emoji: '🧭', order: 2 },
  hero:       { label: 'Hero & Bannières',      emoji: '🌟', order: 3 },
  commerce:   { label: 'Commerce',              emoji: '🛒', order: 4 },
  content:    { label: 'Contenu',               emoji: '📝', order: 5 },
  media:      { label: 'Médias',                emoji: '🖼️', order: 6 },
  identity:   { label: 'Identité & Contact',   emoji: '🏪', order: 7 },
  social:     { label: 'Social & Réputation',  emoji: '🌐', order: 8 },
  marketing:  { label: 'Marketing',             emoji: '📣', order: 9 },
  utility:    { label: 'Utilitaires',           emoji: '🔧', order: 10 },
  transact:   { label: 'Transactions',          emoji: '💳', order: 11 },
  booking:    { label: 'Réservation',           emoji: '📅', order: 12 },
};

// ─── Registre complet des 60 blocs ──────────────────────────────────────────
export const BLOCK_REGISTRY = {

  // ════════════════════════════════════════════════════════════════════════════
  // 01. HEADER
  // ════════════════════════════════════════════════════════════════════════════
  header: {
    label: 'En-tête',
    emoji: '🔝',
    category: 'navigation',
    description: 'Barre d\'en-tête avec logo, navigation et actions',
    variants: ['minimal', 'sticky', 'transparent', 'centered', 'sidebar'],
    defaultVariant: 'sticky',
    settings: {
      logoPosition:   { type: 'enum',    default: 'left',   values: ['left', 'center', 'right'],        label: 'Position logo' },
      height:         { type: 'enum',    default: 'md',     values: ['sm', 'md', 'lg'],                 label: 'Hauteur' },
      transparent:    { type: 'boolean', default: false,                                                label: 'Transparent au départ' },
      sticky:         { type: 'boolean', default: true,                                                 label: 'Collant au scroll' },
      showCart:       { type: 'boolean', default: true,                                                 label: 'Icône panier' },
      showSearch:     { type: 'boolean', default: true,                                                 label: 'Icône recherche' },
      bgColor:        { type: 'color',   default: '#ffffff',                                            label: 'Fond' },
      textColor:      { type: 'color',   default: '#111827',                                            label: 'Couleur texte' },
      borderBottom:   { type: 'boolean', default: true,                                                 label: 'Bordure bas' },
    },
    content: {
      logo:      { type: 'cloudinary_url', default: null,    label: 'Logo' },
      storeName: { type: 'string',         default: '',      label: 'Nom boutique' },
      links:     { type: 'array',          default: [],      label: 'Liens navigation' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 02. NAVIGATION
  // ════════════════════════════════════════════════════════════════════════════
  navigation: {
    label: 'Navigation',
    emoji: '🧭',
    category: 'navigation',
    description: 'Menu de navigation horizontal ou vertical',
    variants: ['horizontal', 'vertical', 'tabs', 'breadcrumb', 'mobile-drawer'],
    defaultVariant: 'horizontal',
    settings: {
      style:      { type: 'enum',    default: 'underline', values: ['underline', 'pills', 'solid', 'minimal'], label: 'Style actif' },
      align:      { type: 'enum',    default: 'left',      values: ['left', 'center', 'right'],               label: 'Alignement' },
      bgColor:    { type: 'color',   default: 'transparent',                                                   label: 'Fond' },
      textColor:  { type: 'color',   default: '#374151',                                                       label: 'Couleur' },
      activeColor:{ type: 'color',   default: '#6366f1',                                                       label: 'Couleur actif' },
    },
    content: {
      links: { type: 'array', default: [], label: 'Liens' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 03. ANNOUNCEMENT
  // ════════════════════════════════════════════════════════════════════════════
  announcement: {
    label: 'Bandeau annonce',
    emoji: '📢',
    category: 'marketing',
    description: 'Bandeau d\'annonce en haut de page (promo, info)',
    variants: ['simple', 'dismissible', 'rotating'],
    defaultVariant: 'simple',
    settings: {
      bgColor:    { type: 'color',   default: '#1e1b4b',  label: 'Fond' },
      textColor:  { type: 'color',   default: '#ffffff',  label: 'Texte' },
      height:     { type: 'number',  default: 40, min: 28, max: 80, label: 'Hauteur (px)' },
      dismissible:{ type: 'boolean', default: true,       label: 'Fermable' },
    },
    content: {
      message: { type: 'string', default: '🚀 Livraison gratuite dès 25 000 FCFA', label: 'Message' },
      ctaText: { type: 'string', default: '',   label: 'Texte CTA (optionnel)' },
      ctaLink: { type: 'string', default: '',   label: 'Lien CTA' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 04. BREADCRUMB
  // ════════════════════════════════════════════════════════════════════════════
  breadcrumb: {
    label: 'Fil d\'Ariane',
    emoji: '🔗',
    category: 'navigation',
    description: 'Chemin de navigation hiérarchique',
    variants: ['simple', 'with-icons', 'minimal'],
    defaultVariant: 'simple',
    settings: {
      separator: { type: 'enum', default: 'slash', values: ['slash', 'arrow', 'dot', 'chevron'], label: 'Séparateur' },
      textColor: { type: 'color', default: '#6b7280', label: 'Couleur' },
    },
    content: {
      items: { type: 'array', default: [], label: 'Éléments' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 05. SEARCH
  // ════════════════════════════════════════════════════════════════════════════
  search: {
    label: 'Barre de recherche',
    emoji: '🔍',
    category: 'utility',
    description: 'Barre de recherche avec autocomplétion',
    variants: ['inline', 'hero', 'modal', 'floating'],
    defaultVariant: 'inline',
    settings: {
      placeholder: { type: 'string',  default: 'Rechercher...', label: 'Placeholder' },
      bgColor:     { type: 'color',   default: '#ffffff',       label: 'Fond' },
      borderRadius:{ type: 'number',  default: 8, min: 0, max: 50, label: 'Arrondi (px)' },
      showIcon:    { type: 'boolean', default: true,             label: 'Icône recherche' },
      size:        { type: 'enum',    default: 'md', values: ['sm', 'md', 'lg', 'xl'], label: 'Taille' },
    },
    content: {},
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 06. HERO
  // ════════════════════════════════════════════════════════════════════════════
  hero: {
    label: 'Hero Banner',
    emoji: '🌟',
    category: 'hero',
    description: 'Bannière principale immersive avec titre, sous-titre et CTA',
    variants: ['centered', 'split', 'fullscreen', 'minimal', 'image-overlay', 'carousel', 'video'],
    defaultVariant: 'centered',
    settings: {
      height:             { type: 'enum',    default: 'screen',  values: ['auto', 'screen', 'half', 'third', 'tall', 'custom'], label: 'Hauteur' },
      customHeight:       { type: 'number',  default: 600, min: 200, max: 1200,                                                 label: 'Hauteur custom (px)' },
      backgroundType:     { type: 'enum',    default: 'gradient',values: ['gradient', 'image', 'video', 'solid', 'none'],       label: 'Fond' },
      backgroundGradient: { type: 'gradient',default: '135deg,#667eea 0%,#764ba2 100%',                                        label: 'Dégradé' },
      backgroundImage:    { type: 'cloudinary_url', default: null,                                                             label: 'Image de fond' },
      overlayOpacity:     { type: 'number',  default: 0.4, min: 0, max: 1, step: 0.05,                                        label: 'Opacité voile' },
      overlayColor:       { type: 'color',   default: '#000000',                                                               label: 'Couleur voile' },
      textAlign:          { type: 'enum',    default: 'center',  values: ['left', 'center', 'right'],                          label: 'Alignement texte' },
      imagePosition:      { type: 'enum',    default: 'right',   values: ['left', 'right'],                                    label: 'Position image (split)' },
      titleSize:          { type: 'enum',    default: '4xl',     values: ['2xl', '3xl', '4xl', '5xl', '6xl', '7xl'],           label: 'Taille titre' },
      titleColor:         { type: 'color',   default: '#ffffff',                                                               label: 'Couleur titre' },
      titleWeight:        { type: 'enum',    default: '800',     values: ['400', '600', '700', '800', '900'],                  label: 'Graisse titre' },
      subtitleColor:      { type: 'color',   default: 'rgba(255,255,255,0.85)',                                                label: 'Couleur sous-titre' },
      ctaStyle:           { type: 'enum',    default: 'solid',   values: ['solid', 'outline', 'ghost', 'gradient'],            label: 'Style bouton' },
      ctaColor:           { type: 'color',   default: '#ffffff',                                                               label: 'Couleur bouton texte' },
      ctaBg:              { type: 'color',   default: 'transparent',                                                           label: 'Fond bouton' },
      ctaRadius:          { type: 'number',  default: 8, min: 0, max: 50,                                                     label: 'Arrondi bouton (px)' },
      animation:          { type: 'enum',    default: 'fade-up', values: ['none', 'fade', 'fade-up', 'slide-left', 'zoom'],    label: 'Animation' },
      showScrollIndicator:{ type: 'boolean', default: true,                                                                    label: 'Indicateur scroll' },
      borderRadius:       { type: 'enum',    default: 'none',    values: ['none', 'sm', 'md', 'lg', 'xl'],                    label: 'Arrondi section' },
      paddingTop:         { type: 'number',  default: 80, min: 0, max: 300,                                                   label: 'Padding haut (px)' },
      paddingBottom:      { type: 'number',  default: 80, min: 0, max: 300,                                                   label: 'Padding bas (px)' },
    },
    content: {
      badge:      { type: 'string',         default: '',                 label: 'Badge' },
      title:      { type: 'string',         default: 'Bienvenue',        label: 'Titre' },
      subtitle:   { type: 'string',         default: '',                 label: 'Sous-titre' },
      ctaText:    { type: 'string',         default: 'Découvrir',        label: 'Texte bouton' },
      ctaLink:    { type: 'string',         default: '#',                label: 'Lien bouton' },
      ctaSecond:  { type: 'string',         default: '',                 label: 'Texte bouton secondaire' },
      ctaSecondLink: { type: 'string',      default: '#',                label: 'Lien bouton secondaire' },
      image:      { type: 'cloudinary_url', default: null,               label: 'Image (split/overlay)' },
      slides:     { type: 'array',          default: [],                 label: 'Slides (carousel)' },
      videoUrl:   { type: 'url',            default: '',                 label: 'URL vidéo (video variant)' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 07. SECTION
  // ════════════════════════════════════════════════════════════════════════════
  section: {
    label: 'Section',
    emoji: '📦',
    category: 'layout',
    description: 'Conteneur de section avec titre et sous-titre',
    variants: ['standard', 'full-width', 'contained', 'angled'],
    defaultVariant: 'standard',
    settings: {
      bgColor:      { type: 'color',   default: '#ffffff',  label: 'Fond' },
      paddingTop:   { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
      maxWidth:     { type: 'enum',    default: 'xl', values: ['sm', 'md', 'lg', 'xl', '2xl', 'full'], label: 'Largeur max' },
      titleAlign:   { type: 'enum',    default: 'center', values: ['left', 'center', 'right'],         label: 'Alignement titre' },
    },
    content: {
      title:    { type: 'string', default: '', label: 'Titre de section' },
      subtitle: { type: 'string', default: '', label: 'Sous-titre' },
      eyebrow:  { type: 'string', default: '', label: 'Sur-titre (eyebrow)' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 08. TEXT
  // ════════════════════════════════════════════════════════════════════════════
  text: {
    label: 'Texte Riche',
    emoji: '📝',
    category: 'content',
    description: 'Bloc de texte formaté avec titre, paragraphes, listes',
    variants: ['simple', 'two-columns', 'with-image', 'pull-quote'],
    defaultVariant: 'simple',
    settings: {
      titleSize:    { type: 'enum',    default: '3xl',    values: ['xl', '2xl', '3xl', '4xl', '5xl'],    label: 'Taille titre' },
      titleColor:   { type: 'color',   default: '#111827',                                                label: 'Couleur titre' },
      titleAlign:   { type: 'enum',    default: 'left',   values: ['left', 'center', 'right'],            label: 'Alignement titre' },
      contentColor: { type: 'color',   default: '#374151',                                                label: 'Couleur texte' },
      contentSize:  { type: 'enum',    default: 'base',   values: ['sm', 'base', 'lg', 'xl'],             label: 'Taille texte' },
      bgColor:      { type: 'color',   default: '#ffffff',                                                label: 'Fond' },
      maxWidth:     { type: 'enum',    default: '3xl',    values: ['sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'], label: 'Largeur max' },
      showDivider:  { type: 'boolean', default: false,                                                    label: 'Séparateur décoratif' },
      dividerColor: { type: 'color',   default: '#6366f1',                                                label: 'Couleur séparateur' },
      paddingTop:   { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:    { type: 'string', default: '',                            label: 'Titre' },
      content:  { type: 'string', default: 'Votre texte ici...',         label: 'Contenu (HTML ou Markdown)' },
      image:    { type: 'cloudinary_url', default: null,                 label: 'Image (variant with-image)' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 09. MEDIA
  // ════════════════════════════════════════════════════════════════════════════
  media: {
    label: 'Média',
    emoji: '🖼️',
    category: 'media',
    description: 'Image ou vidéo unique mise en valeur',
    variants: ['full-width', 'contained', 'float-left', 'float-right'],
    defaultVariant: 'contained',
    settings: {
      borderRadius: { type: 'number',  default: 12, min: 0, max: 50,  label: 'Arrondi (px)' },
      maxWidth:     { type: 'enum',    default: '4xl', values: ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'full'], label: 'Largeur max' },
      ratio:        { type: 'enum',    default: 'landscape', values: ['square', 'portrait', 'landscape', 'cinema', 'auto'], label: 'Ratio' },
      caption:      { type: 'boolean', default: false, label: 'Afficher légende' },
      bgColor:      { type: 'color',   default: '#f9fafb', label: 'Fond section' },
      shadow:       { type: 'boolean', default: true,  label: 'Ombre portée' },
    },
    content: {
      src:      { type: 'cloudinary_url', default: null, label: 'Image / URL vidéo' },
      alt:      { type: 'string',         default: '',   label: 'Texte alternatif' },
      caption:  { type: 'string',         default: '',   label: 'Légende' },
      type:     { type: 'enum',           default: 'image', label: 'Type' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 10. FEATURE
  // ════════════════════════════════════════════════════════════════════════════
  feature: {
    label: 'Caractéristiques',
    emoji: '✨',
    category: 'content',
    description: 'Grille d\'avantages, valeurs ou caractéristiques',
    variants: ['icons-grid', 'icons-list', 'cards', 'alternating', 'horizontal'],
    defaultVariant: 'icons-grid',
    settings: {
      columns:      { type: 'enum',    default: '3',    values: ['2', '3', '4'],                         label: 'Colonnes' },
      iconStyle:    { type: 'enum',    default: 'emoji', values: ['emoji', 'outline', 'filled', 'none'], label: 'Style icône' },
      iconColor:    { type: 'color',   default: '#6366f1',                                               label: 'Couleur icône' },
      iconBg:       { type: 'color',   default: '#ede9fe',                                               label: 'Fond icône' },
      cardStyle:    { type: 'enum',    default: 'none',  values: ['none', 'card', 'glass', 'border'],    label: 'Style carte' },
      bgColor:      { type: 'color',   default: '#ffffff',                                               label: 'Fond section' },
      titleColor:   { type: 'color',   default: '#111827',                                               label: 'Couleur titre' },
      textColor:    { type: 'color',   default: '#6b7280',                                               label: 'Couleur texte' },
      paddingTop:   { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:    { type: 'string', default: 'Nos engagements',  label: 'Titre section' },
      subtitle: { type: 'string', default: '',                 label: 'Sous-titre' },
      items:    { type: 'array',  default: [
        { icon: '🛡️', title: 'Qualité garantie',   desc: 'Produits certifiés et vérifiés' },
        { icon: '⚡',  title: 'Livraison rapide',   desc: 'Douala, Yaoundé & villes partenaires' },
        { icon: '💬',  title: 'Support WhatsApp',   desc: 'Réponse et conseil personnalisé' },
      ], label: 'Éléments' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 11. STATS
  // ════════════════════════════════════════════════════════════════════════════
  stats: {
    label: 'Statistiques',
    emoji: '📊',
    category: 'content',
    description: 'Chiffres clés animés',
    variants: ['row', 'cards', 'dark-band', 'with-icons'],
    defaultVariant: 'row',
    settings: {
      layout:       { type: 'enum',    default: 'row',    values: ['row', 'cards', 'column'],  label: 'Disposition' },
      bgColor:      { type: 'color',   default: '#1e1b4b',                                    label: 'Fond' },
      textColor:    { type: 'color',   default: '#ffffff',                                    label: 'Couleur texte' },
      valueColor:   { type: 'color',   default: '#a5b4fc',                                    label: 'Couleur valeur' },
      animated:     { type: 'boolean', default: true,                                         label: 'Animer les chiffres' },
      showDivider:  { type: 'boolean', default: true,                                         label: 'Séparateurs' },
      paddingTop:   { type: 'number',  default: 40, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 40, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title: { type: 'string', default: '', label: 'Titre (optionnel)' },
      items: { type: 'array',  default: [
        { value: '1 200', label: 'Clients satisfaits', icon: '👥' },
        { value: '4.9★',  label: 'Note moyenne',       icon: '⭐' },
        { value: '5 000', label: 'Commandes livrées',  icon: '📦' },
        { value: '100%',  label: 'Satisfaction',       icon: '✅' },
      ], label: 'Statistiques' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 12. SHOWCASE
  // ════════════════════════════════════════════════════════════════════════════
  showcase: {
    label: 'Vitrine',
    emoji: '🎯',
    category: 'commerce',
    description: 'Mise en avant d\'un produit ou service phare',
    variants: ['split', 'fullscreen', 'centered', 'floating-card'],
    defaultVariant: 'split',
    settings: {
      imagePosition:{ type: 'enum',    default: 'right',   values: ['left', 'right'],  label: 'Position image' },
      bgColor:      { type: 'color',   default: '#f9fafb',                              label: 'Fond' },
      borderRadius: { type: 'number',  default: 16, min: 0, max: 50,                   label: 'Arrondi image (px)' },
      showBadge:    { type: 'boolean', default: true,                                   label: 'Afficher badge' },
      showPrice:    { type: 'boolean', default: true,                                   label: 'Afficher prix' },
      paddingTop:   { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      badge:    { type: 'string',         default: '⭐ Coup de cœur', label: 'Badge' },
      title:    { type: 'string',         default: '',                label: 'Titre produit' },
      desc:     { type: 'string',         default: '',                label: 'Description' },
      price:    { type: 'string',         default: '',                label: 'Prix' },
      image:    { type: 'cloudinary_url', default: null,              label: 'Image' },
      ctaText:  { type: 'string',         default: 'Voir le produit', label: 'Texte CTA' },
      ctaLink:  { type: 'string',         default: '#',               label: 'Lien CTA' },
      features: { type: 'array',          default: [],                label: 'Points forts' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 13. TIMELINE
  // ════════════════════════════════════════════════════════════════════════════
  timeline: {
    label: 'Timeline',
    emoji: '⏳',
    category: 'content',
    description: 'Chronologie d\'événements ou d\'étapes',
    variants: ['vertical', 'horizontal', 'alternating'],
    defaultVariant: 'vertical',
    settings: {
      accentColor:  { type: 'color',   default: '#6366f1', label: 'Couleur accent' },
      bgColor:      { type: 'color',   default: '#ffffff',  label: 'Fond' },
      textColor:    { type: 'color',   default: '#111827',  label: 'Couleur texte' },
      showDates:    { type: 'boolean', default: true,       label: 'Afficher dates' },
      showIcons:    { type: 'boolean', default: true,       label: 'Afficher icônes' },
      paddingTop:   { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:  { type: 'string', default: 'Notre histoire', label: 'Titre' },
      events: { type: 'array',  default: [],               label: 'Événements' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 14. ITEM
  // ════════════════════════════════════════════════════════════════════════════
  item: {
    label: 'Item (Produit / Service)',
    emoji: '🏷️',
    category: 'commerce',
    description: 'Carte individuelle pour un produit, service, plat, chambre...',
    variants: ['card', 'horizontal', 'minimal', 'featured', 'list-row'],
    defaultVariant: 'card',
    settings: {
      cardRadius:   { type: 'number',  default: 12, min: 0, max: 40,                         label: 'Arrondi carte (px)' },
      cardStyle:    { type: 'enum',    default: 'shadow', values: ['shadow', 'border', 'flat', 'glass'], label: 'Style carte' },
      imageRatio:   { type: 'enum',    default: 'square', values: ['square', 'portrait', 'landscape', 'auto'], label: 'Ratio image' },
      showPrice:    { type: 'boolean', default: true,                                         label: 'Afficher prix' },
      showRating:   { type: 'boolean', default: true,                                         label: 'Afficher note' },
      showBadges:   { type: 'boolean', default: true,                                         label: 'Afficher badges' },
      showCart:     { type: 'boolean', default: true,                                         label: 'Bouton ajouter' },
      currency:     { type: 'string',  default: 'XOF',                                       label: 'Devise' },
      hoverEffect:  { type: 'enum',    default: 'lift', values: ['none', 'lift', 'zoom', 'overlay'], label: 'Effet survol' },
    },
    content: {
      name:       { type: 'string',         default: '',   label: 'Nom' },
      description:{ type: 'string',         default: '',   label: 'Description' },
      price:      { type: 'number',         default: 0,    label: 'Prix' },
      image:      { type: 'cloudinary_url', default: null, label: 'Image' },
      category:   { type: 'string',         default: '',   label: 'Catégorie' },
      badges:     { type: 'array',          default: [],   label: 'Badges (Nouveau, Promo...)' },
      rating:     { type: 'number',         default: 0,    label: 'Note /5' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 15. COLLECTION
  // ════════════════════════════════════════════════════════════════════════════
  collection: {
    label: 'Collection',
    emoji: '🛍️',
    category: 'commerce',
    description: 'Grille de produits/services/plats en liste ou grille',
    variants: ['grid', 'list', 'featured', 'masonry', 'menu', 'carousel'],
    defaultVariant: 'grid',
    settings: {
      columns:      { type: 'enum',    default: '3',    values: ['1', '2', '3', '4'],                   label: 'Colonnes' },
      cardStyle:    { type: 'enum',    default: 'shadow', values: ['shadow', 'border', 'flat', 'glass'], label: 'Style carte' },
      cardRadius:   { type: 'number',  default: 12, min: 0, max: 40,                                    label: 'Arrondi cartes (px)' },
      imageRatio:   { type: 'enum',    default: 'square', values: ['square', 'portrait', 'landscape'],   label: 'Ratio image' },
      showPrice:    { type: 'boolean', default: true,                                                    label: 'Afficher prix' },
      currency:     { type: 'string',  default: 'XOF',                                                  label: 'Devise' },
      showRating:   { type: 'boolean', default: true,                                                    label: 'Afficher notes' },
      showBadges:   { type: 'boolean', default: true,                                                    label: 'Afficher badges' },
      showCart:     { type: 'boolean', default: true,                                                    label: 'Bouton panier' },
      showFilters:  { type: 'boolean', default: true,                                                    label: 'Filtres catégorie' },
      showSearch:   { type: 'boolean', default: false,                                                   label: 'Recherche inline' },
      limit:        { type: 'number',  default: 12, min: 1, max: 100,                                   label: 'Nombre d\'items' },
      hoverEffect:  { type: 'enum',    default: 'lift', values: ['none', 'lift', 'zoom', 'overlay'],     label: 'Effet survol' },
      bgColor:      { type: 'color',   default: '#f9fafb',                                               label: 'Fond section' },
      paddingTop:   { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:      { type: 'string', default: 'Notre Catalogue',        label: 'Titre' },
      subtitle:   { type: 'string', default: '',                       label: 'Sous-titre' },
      dataSource: { type: 'enum',   default: 'products', values: ['products', 'services', 'menu', 'portfolio', 'custom'], label: 'Source de données' },
      filterType: { type: 'string', default: 'all',                    label: 'Filtre actif par défaut' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 16. CATEGORY
  // ════════════════════════════════════════════════════════════════════════════
  category: {
    label: 'Catégories',
    emoji: '🗂️',
    category: 'commerce',
    description: 'Navigation visuelle par catégories',
    variants: ['grid', 'circular', 'horizontal-scroll', 'pills', 'cards'],
    defaultVariant: 'grid',
    settings: {
      columns:      { type: 'enum',    default: '4',    values: ['2', '3', '4', '5', '6'],  label: 'Colonnes' },
      imageStyle:   { type: 'enum',    default: 'cover', values: ['cover', 'contain', 'icon'], label: 'Style image' },
      cardRadius:   { type: 'number',  default: 12, min: 0, max: 100,                       label: 'Arrondi (px)' },
      showLabel:    { type: 'boolean', default: true,                                        label: 'Afficher libellé' },
      bgColor:      { type: 'color',   default: '#ffffff',                                   label: 'Fond section' },
      paddingTop:   { type: 'number',  default: 40, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 40, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:  { type: 'string', default: '', label: 'Titre (optionnel)' },
      items:  { type: 'array',  default: [], label: 'Catégories (auto si vide)' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 17. BRAND
  // ════════════════════════════════════════════════════════════════════════════
  brand: {
    label: 'Marques',
    emoji: '🏷️',
    category: 'commerce',
    description: 'Logos des marques partenaires ou fournisseurs',
    variants: ['scroll', 'grid', 'logos-only', 'with-names'],
    defaultVariant: 'scroll',
    settings: {
      grayscale:  { type: 'boolean', default: true,    label: 'Niveaux de gris' },
      animated:   { type: 'boolean', default: true,    label: 'Défilement auto' },
      bgColor:    { type: 'color',   default: '#f9fafb', label: 'Fond' },
      paddingTop: { type: 'number',  default: 40, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom: { type: 'number', default: 40, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:  { type: 'string', default: 'Nos marques', label: 'Titre (optionnel)' },
      brands: { type: 'array',  default: [],            label: 'Marques (logo + nom)' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 18. PRICE
  // ════════════════════════════════════════════════════════════════════════════
  price: {
    label: 'Prix / Tarifs',
    emoji: '💰',
    category: 'commerce',
    description: 'Affichage de prix, tarifs de prestations',
    variants: ['simple', 'with-comparison', 'highlighted', 'range'],
    defaultVariant: 'simple',
    settings: {
      currency:   { type: 'string',  default: 'XOF',    label: 'Devise' },
      showOld:    { type: 'boolean', default: false,     label: 'Afficher ancien prix' },
      accentColor:{ type: 'color',   default: '#6366f1', label: 'Couleur accent' },
      bgColor:    { type: 'color',   default: '#ffffff',  label: 'Fond' },
    },
    content: {
      price:    { type: 'number', default: 0,  label: 'Prix' },
      oldPrice: { type: 'number', default: 0,  label: 'Ancien prix' },
      unit:     { type: 'string', default: '', label: 'Unité (/ mois, / h...)' },
      note:     { type: 'string', default: '', label: 'Note sous le prix' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 19. OFFER
  // ════════════════════════════════════════════════════════════════════════════
  offer: {
    label: 'Offre / Promo',
    emoji: '🔥',
    category: 'marketing',
    description: 'Offre promotionnelle avec compte à rebours ou badge',
    variants: ['countdown', 'flash-band', 'card', 'popup'],
    defaultVariant: 'countdown',
    settings: {
      bgColor:      { type: 'color',   default: '#7c3aed',                         label: 'Fond' },
      textColor:    { type: 'color',   default: '#ffffff',                         label: 'Couleur texte' },
      digitBg:      { type: 'color',   default: 'rgba(255,255,255,0.15)',          label: 'Fond chiffres' },
      showDays:     { type: 'boolean', default: true,  label: 'Afficher jours' },
      showHours:    { type: 'boolean', default: true,  label: 'Afficher heures' },
      showMinutes:  { type: 'boolean', default: true,  label: 'Afficher minutes' },
      showSeconds:  { type: 'boolean', default: true,  label: 'Afficher secondes' },
      paddingTop:   { type: 'number',  default: 40, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 40, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:       { type: 'string', default: '⚡ Offre Flash',           label: 'Titre' },
      subtitle:    { type: 'string', default: '',                          label: 'Sous-titre' },
      ctaText:     { type: 'string', default: 'Profiter de l\'offre',     label: 'Texte CTA' },
      ctaLink:     { type: 'string', default: '#',                         label: 'Lien CTA' },
      targetDate:  { type: 'string', default: '',                          label: 'Date cible (ISO)' },
      expiredText: { type: 'string', default: 'L\'offre a expiré !',      label: 'Texte expiré' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 20. CART
  // ════════════════════════════════════════════════════════════════════════════
  cart: {
    label: 'Panier',
    emoji: '🛒',
    category: 'transact',
    description: 'Panier d\'achat (drawer ou page dédiée)',
    variants: ['drawer', 'page', 'mini', 'whatsapp'],
    defaultVariant: 'drawer',
    settings: {
      currency:   { type: 'string',  default: 'XOF',    label: 'Devise' },
      showImages: { type: 'boolean', default: true,     label: 'Images produits' },
      bgColor:    { type: 'color',   default: '#ffffff', label: 'Fond' },
    },
    content: {
      title:        { type: 'string', default: 'Mon Panier',          label: 'Titre' },
      emptyMessage: { type: 'string', default: 'Votre panier est vide', label: 'Message si vide' },
      ctaText:      { type: 'string', default: 'Commander',           label: 'Texte bouton commande' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 21. CHECKOUT
  // ════════════════════════════════════════════════════════════════════════════
  checkout: {
    label: 'Commande',
    emoji: '💳',
    category: 'transact',
    description: 'Formulaire de passage de commande',
    variants: ['whatsapp', 'form', 'multi-step'],
    defaultVariant: 'whatsapp',
    settings: {
      currency:   { type: 'string',  default: 'XOF',   label: 'Devise' },
      bgColor:    { type: 'color',   default: '#ffffff', label: 'Fond' },
      showMap:    { type: 'boolean', default: false,    label: 'Carte livraison' },
    },
    content: {
      title:      { type: 'string', default: 'Finaliser la commande', label: 'Titre' },
      whatsapp:   { type: 'string', default: '',                      label: 'Numéro WhatsApp' },
      confirmMsg: { type: 'string', default: 'Commande confirmée !',  label: 'Message confirmation' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 22. ORDER
  // ════════════════════════════════════════════════════════════════════════════
  order: {
    label: 'Suivi commande',
    emoji: '📦',
    category: 'transact',
    description: 'Suivi et récapitulatif d\'une commande',
    variants: ['status-steps', 'receipt', 'tracking-map'],
    defaultVariant: 'status-steps',
    settings: {
      accentColor: { type: 'color', default: '#059669', label: 'Couleur succès' },
      bgColor:     { type: 'color', default: '#ffffff',  label: 'Fond' },
    },
    content: {
      title: { type: 'string', default: 'Votre commande', label: 'Titre' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 23. BOOKING
  // ════════════════════════════════════════════════════════════════════════════
  booking: {
    label: 'Réservation',
    emoji: '📅',
    category: 'booking',
    description: 'Formulaire de réservation (table, RDV, séjour)',
    variants: ['whatsapp', 'calendar-form', 'simple-form', 'multi-step'],
    defaultVariant: 'whatsapp',
    settings: {
      bgColor:    { type: 'color',   default: '#f9fafb', label: 'Fond' },
      accentColor:{ type: 'color',   default: '#6366f1', label: 'Couleur accent' },
      showDate:   { type: 'boolean', default: true,     label: 'Champ date' },
      showTime:   { type: 'boolean', default: true,     label: 'Champ heure' },
      showGuests: { type: 'boolean', default: false,    label: 'Nombre de personnes' },
      paddingTop: { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom: { type: 'number', default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:    { type: 'string', default: 'Réserver',    label: 'Titre' },
      subtitle: { type: 'string', default: '',            label: 'Sous-titre' },
      whatsapp: { type: 'string', default: '',            label: 'Numéro WhatsApp' },
      ctaText:  { type: 'string', default: 'Réserver maintenant', label: 'Texte bouton' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 24. AVAILABILITY
  // ════════════════════════════════════════════════════════════════════════════
  availability: {
    label: 'Disponibilités',
    emoji: '🗓️',
    category: 'booking',
    description: 'Affichage des disponibilités (horaires, stocks)',
    variants: ['weekly-hours', 'live-status', 'calendar'],
    defaultVariant: 'weekly-hours',
    settings: {
      accentColor: { type: 'color', default: '#059669', label: 'Couleur disponible' },
      closedColor: { type: 'color', default: '#ef4444', label: 'Couleur fermé' },
      bgColor:     { type: 'color', default: '#ffffff',  label: 'Fond' },
    },
    content: {
      title:   { type: 'string', default: 'Nos horaires', label: 'Titre' },
      hours:   { type: 'array',  default: [],             label: 'Horaires par jour' },
      openMsg: { type: 'string', default: '✅ Ouvert maintenant', label: 'Message ouvert' },
      closeMsg:{ type: 'string', default: '🔒 Fermé',           label: 'Message fermé' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 25. PAYMENT
  // ════════════════════════════════════════════════════════════════════════════
  payment: {
    label: 'Paiement',
    emoji: '💳',
    category: 'transact',
    description: 'Méthodes de paiement acceptées',
    variants: ['icons-row', 'cards', 'details'],
    defaultVariant: 'icons-row',
    settings: {
      bgColor:  { type: 'color', default: '#ffffff', label: 'Fond' },
    },
    content: {
      title:   { type: 'string', default: 'Paiements acceptés', label: 'Titre' },
      methods: { type: 'array',  default: ['MTN Money', 'Orange Money', 'Wave', 'Espèces'], label: 'Méthodes' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 26. DELIVERY
  // ════════════════════════════════════════════════════════════════════════════
  delivery: {
    label: 'Livraison',
    emoji: '🚚',
    category: 'transact',
    description: 'Informations sur la livraison et les frais',
    variants: ['simple', 'zones-table', 'estimator'],
    defaultVariant: 'simple',
    settings: {
      accentColor: { type: 'color', default: '#059669', label: 'Couleur accent' },
      bgColor:     { type: 'color', default: '#f9fafb',  label: 'Fond' },
    },
    content: {
      title:   { type: 'string', default: 'Livraison',  label: 'Titre' },
      zones:   { type: 'array',  default: [],           label: 'Zones de livraison' },
      freeFrom:{ type: 'number', default: 0,            label: 'Gratuit dès (0 = jamais)' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 27. TRACKING
  // ════════════════════════════════════════════════════════════════════════════
  tracking: {
    label: 'Suivi colis',
    emoji: '📍',
    category: 'transact',
    description: 'Suivi en temps réel de la livraison',
    variants: ['status-bar', 'map', 'timeline'],
    defaultVariant: 'status-bar',
    settings: {
      accentColor: { type: 'color', default: '#2563eb', label: 'Couleur accent' },
      bgColor:     { type: 'color', default: '#ffffff',  label: 'Fond' },
    },
    content: {
      title: { type: 'string', default: 'Suivi de votre commande', label: 'Titre' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 28. PROFILE
  // ════════════════════════════════════════════════════════════════════════════
  profile: {
    label: 'Profil',
    emoji: '👤',
    category: 'identity',
    description: 'Présentation d\'une personne (freelance, fondateur, équipe)',
    variants: ['card', 'hero-personal', 'minimal', 'team-row'],
    defaultVariant: 'card',
    settings: {
      bgColor:    { type: 'color',   default: '#ffffff',  label: 'Fond' },
      accentColor:{ type: 'color',   default: '#6366f1',  label: 'Accent' },
      showSocials:{ type: 'boolean', default: true,       label: 'Liens sociaux' },
      showSkills: { type: 'boolean', default: false,      label: 'Compétences' },
      imageStyle: { type: 'enum',    default: 'circle', values: ['circle', 'rounded', 'square'], label: 'Style photo' },
      paddingTop: { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom: { type: 'number', default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      name:     { type: 'string',         default: '',   label: 'Nom' },
      role:     { type: 'string',         default: '',   label: 'Rôle / Poste' },
      bio:      { type: 'string',         default: '',   label: 'Bio' },
      photo:    { type: 'cloudinary_url', default: null, label: 'Photo' },
      skills:   { type: 'array',          default: [],   label: 'Compétences' },
      socials:  { type: 'object',         default: {},   label: 'Liens sociaux' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 29. STORE
  // ════════════════════════════════════════════════════════════════════════════
  store: {
    label: 'À propos de la boutique',
    emoji: '🏪',
    category: 'identity',
    description: 'Présentation de la boutique, ses valeurs, son histoire',
    variants: ['about-split', 'about-centered', 'values-grid', 'story'],
    defaultVariant: 'about-split',
    settings: {
      bgColor:    { type: 'color',   default: '#ffffff',  label: 'Fond' },
      textColor:  { type: 'color',   default: '#111827',  label: 'Couleur texte' },
      showValues: { type: 'boolean', default: true,       label: 'Afficher valeurs' },
      imagePosition:{ type: 'enum', default: 'right', values: ['left', 'right'], label: 'Position image' },
      paddingTop: { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom: { type: 'number', default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:    { type: 'string',         default: 'Notre histoire',             label: 'Titre' },
      subtitle: { type: 'string',         default: '',                           label: 'Sous-titre' },
      content:  { type: 'string',         default: '',                           label: 'Texte présentation' },
      image:    { type: 'cloudinary_url', default: null,                         label: 'Image' },
      values:   { type: 'array',          default: ['Excellence', 'Authenticité', 'Service'], label: 'Valeurs' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 30. CONTACT
  // ════════════════════════════════════════════════════════════════════════════
  contact: {
    label: 'Contact',
    emoji: '📬',
    category: 'identity',
    description: 'Coordonnées et formulaire de contact',
    variants: ['full', 'minimal', 'side-by-side', 'whatsapp-cta'],
    defaultVariant: 'full',
    settings: {
      showPhone:   { type: 'boolean', default: true,     label: 'Téléphone' },
      showEmail:   { type: 'boolean', default: true,     label: 'Email' },
      showAddress: { type: 'boolean', default: true,     label: 'Adresse' },
      showWhatsApp:{ type: 'boolean', default: true,     label: 'WhatsApp' },
      showMap:     { type: 'boolean', default: false,    label: 'Carte intégrée' },
      showForm:    { type: 'boolean', default: true,     label: 'Formulaire' },
      bgColor:     { type: 'color',   default: '#f9fafb', label: 'Fond' },
      paddingTop:  { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number', default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:      { type: 'string', default: 'Nous Contacter', label: 'Titre' },
      subtitle:   { type: 'string', default: '',               label: 'Sous-titre' },
      phone:      { type: 'string', default: '',               label: 'Téléphone' },
      email:      { type: 'string', default: '',               label: 'Email' },
      address:    { type: 'string', default: '',               label: 'Adresse' },
      whatsapp:   { type: 'string', default: '',               label: 'WhatsApp' },
      mapEmbedUrl:{ type: 'url',    default: '',               label: 'URL Google Maps embed' },
      confirmMsg: { type: 'string', default: 'Message envoyé ! Nous vous répondrons bientôt.', label: 'Confirmation' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 31. LOCATION
  // ════════════════════════════════════════════════════════════════════════════
  location: {
    label: 'Localisation',
    emoji: '📍',
    category: 'identity',
    description: 'Adresse et carte Google Maps',
    variants: ['map-full', 'map-card', 'address-only'],
    defaultVariant: 'map-card',
    settings: {
      mapHeight:  { type: 'number',  default: 400, min: 200, max: 800, label: 'Hauteur carte (px)' },
      borderRadius:{ type: 'number', default: 16, min: 0, max: 50,    label: 'Arrondi carte (px)' },
      bgColor:    { type: 'color',   default: '#ffffff',               label: 'Fond' },
    },
    content: {
      address:    { type: 'string', default: '', label: 'Adresse' },
      mapEmbedUrl:{ type: 'url',    default: '', label: 'URL embed' },
      city:       { type: 'string', default: '', label: 'Ville' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 32. HOURS
  // ════════════════════════════════════════════════════════════════════════════
  hours: {
    label: 'Horaires',
    emoji: '🕐',
    category: 'identity',
    description: 'Horaires d\'ouverture avec statut en temps réel',
    variants: ['table', 'list', 'compact'],
    defaultVariant: 'table',
    settings: {
      showLiveStatus: { type: 'boolean', default: true,    label: 'Statut en direct' },
      openColor:      { type: 'color',   default: '#059669', label: 'Couleur ouvert' },
      closedColor:    { type: 'color',   default: '#ef4444', label: 'Couleur fermé' },
      bgColor:        { type: 'color',   default: '#ffffff',  label: 'Fond' },
    },
    content: {
      title:   { type: 'string', default: 'Horaires d\'ouverture', label: 'Titre' },
      hours:   { type: 'array',  default: [],                      label: 'Horaires par jour' },
      timezone:{ type: 'string', default: 'Africa/Douala',         label: 'Fuseau horaire' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 33. SOCIAL
  // ════════════════════════════════════════════════════════════════════════════
  social: {
    label: 'Réseaux Sociaux',
    emoji: '🔗',
    category: 'social',
    description: 'Liens vers les réseaux sociaux',
    variants: ['icons-row', 'buttons', 'minimal', 'floating'],
    defaultVariant: 'icons-row',
    settings: {
      style:    { type: 'enum',    default: 'rounded', values: ['rounded', 'square', 'pill', 'minimal'], label: 'Style' },
      size:     { type: 'enum',    default: 'md',      values: ['sm', 'md', 'lg'],                       label: 'Taille' },
      bgColor:  { type: 'color',   default: '#ffffff',  label: 'Fond' },
      iconColor:{ type: 'color',   default: '#374151',  label: 'Couleur icônes' },
      paddingTop: { type: 'number', default: 40, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom: { type: 'number', default: 40, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:     { type: 'string', default: 'Suivez-nous', label: 'Titre' },
      instagram: { type: 'url',    default: '',            label: 'Instagram' },
      facebook:  { type: 'url',    default: '',            label: 'Facebook' },
      tiktok:    { type: 'url',    default: '',            label: 'TikTok' },
      whatsapp:  { type: 'string', default: '',            label: 'WhatsApp' },
      youtube:   { type: 'url',    default: '',            label: 'YouTube' },
      twitter:   { type: 'url',    default: '',            label: 'X / Twitter' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 34. REPUTATION
  // ════════════════════════════════════════════════════════════════════════════
  reputation: {
    label: 'Réputation',
    emoji: '⭐',
    category: 'social',
    description: 'Score global et badges de confiance',
    variants: ['stars-summary', 'badges', 'trust-bar'],
    defaultVariant: 'stars-summary',
    settings: {
      accentColor: { type: 'color', default: '#f59e0b', label: 'Couleur étoiles' },
      bgColor:     { type: 'color', default: '#ffffff',  label: 'Fond' },
    },
    content: {
      rating:       { type: 'number', default: 4.8,  label: 'Note /5' },
      reviewsCount: { type: 'number', default: 0,    label: 'Nombre d\'avis' },
      platform:     { type: 'string', default: '',   label: 'Plateforme (Google, FB...)' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 35. TEAM
  // ════════════════════════════════════════════════════════════════════════════
  team: {
    label: 'Équipe',
    emoji: '👥',
    category: 'identity',
    description: 'Présentation des membres de l\'équipe',
    variants: ['cards', 'list', 'minimal'],
    defaultVariant: 'cards',
    settings: {
      columns:    { type: 'enum',    default: '3', values: ['2', '3', '4'], label: 'Colonnes' },
      imageStyle: { type: 'enum',    default: 'circle', values: ['circle', 'rounded', 'square'], label: 'Style photo' },
      cardStyle:  { type: 'enum',    default: 'card', values: ['card', 'minimal', 'glass'], label: 'Style carte' },
      bgColor:    { type: 'color',   default: '#ffffff', label: 'Fond' },
      showSocials:{ type: 'boolean', default: false,    label: 'Liens sociaux' },
      paddingTop: { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom: { type: 'number', default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:   { type: 'string', default: 'Notre équipe', label: 'Titre' },
      members: { type: 'array',  default: [],             label: 'Membres' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 36. REVIEW
  // ════════════════════════════════════════════════════════════════════════════
  review: {
    label: 'Avis clients',
    emoji: '💬',
    category: 'social',
    description: 'Avis et évaluations clients',
    variants: ['slider', 'cards', 'masonry', 'wall', 'featured'],
    defaultVariant: 'slider',
    settings: {
      layout:       { type: 'enum',    default: 'slider', values: ['slider', 'cards', 'masonry'],  label: 'Disposition' },
      cardStyle:    { type: 'enum',    default: 'card',   values: ['card', 'quote', 'minimal', 'glass'], label: 'Style' },
      bgColor:      { type: 'color',   default: '#f9fafb', label: 'Fond section' },
      cardBg:       { type: 'color',   default: '#ffffff',  label: 'Fond carte' },
      starColor:    { type: 'color',   default: '#f59e0b',  label: 'Couleur étoiles' },
      textColor:    { type: 'color',   default: '#374151',  label: 'Couleur texte' },
      autoPlay:     { type: 'boolean', default: true,       label: 'Auto-scroll' },
      showRating:   { type: 'boolean', default: true,       label: 'Afficher notes' },
      showAvatar:   { type: 'boolean', default: true,       label: 'Afficher avatar' },
      paddingTop:   { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:        { type: 'string', default: 'Ce que disent nos clients', label: 'Titre' },
      subtitle:     { type: 'string', default: '',                          label: 'Sous-titre' },
      testimonials: { type: 'array',  default: [],                          label: 'Avis' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 37. TESTIMONIAL
  // ════════════════════════════════════════════════════════════════════════════
  testimonial: {
    label: 'Témoignage',
    emoji: '🗣️',
    category: 'social',
    description: 'Témoignage unique mis en avant',
    variants: ['quote', 'card', 'full-width', 'with-image'],
    defaultVariant: 'quote',
    settings: {
      bgColor:    { type: 'color',   default: '#1e1b4b',  label: 'Fond' },
      textColor:  { type: 'color',   default: '#ffffff',   label: 'Couleur texte' },
      accentColor:{ type: 'color',   default: '#a5b4fc',  label: 'Couleur accent' },
      showStars:  { type: 'boolean', default: true,        label: 'Étoiles' },
      paddingTop: { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom: { type: 'number', default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      quote:    { type: 'string',         default: '',   label: 'Citation' },
      author:   { type: 'string',         default: '',   label: 'Auteur' },
      role:     { type: 'string',         default: '',   label: 'Rôle / Entreprise' },
      photo:    { type: 'cloudinary_url', default: null, label: 'Photo auteur' },
      rating:   { type: 'number',         default: 5,    label: 'Note /5' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 38. BADGE
  // ════════════════════════════════════════════════════════════════════════════
  badge: {
    label: 'Badges de confiance',
    emoji: '🏅',
    category: 'marketing',
    description: 'Badges de réassurance et certifications',
    variants: ['row', 'grid', 'icons'],
    defaultVariant: 'row',
    settings: {
      bgColor: { type: 'color', default: '#ffffff', label: 'Fond' },
      layout:  { type: 'enum', default: 'row', values: ['row', 'grid'], label: 'Disposition' },
    },
    content: {
      title:  { type: 'string', default: '',  label: 'Titre (optionnel)' },
      badges: { type: 'array',  default: [
        { icon: '🛡️', text: 'Garanti 1 an' },
        { icon: '⚡',  text: 'Livraison rapide' },
        { icon: '🔒',  text: 'Paiement sécurisé' },
      ], label: 'Badges' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 39. CASESTUDY
  // ════════════════════════════════════════════════════════════════════════════
  caseStudy: {
    label: 'Étude de cas',
    emoji: '📋',
    category: 'content',
    description: 'Portfolio d\'un projet ou étude de cas client',
    variants: ['full', 'card', 'mini'],
    defaultVariant: 'card',
    settings: {
      bgColor:    { type: 'color', default: '#ffffff', label: 'Fond' },
      accentColor:{ type: 'color', default: '#6366f1', label: 'Accent' },
    },
    content: {
      title:    { type: 'string',         default: 'Études de cas',  label: 'Titre section' },
      projects: { type: 'array',          default: [],              label: 'Projets' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 40. CTA
  // ════════════════════════════════════════════════════════════════════════════
  cta: {
    label: 'Appel à l\'action',
    emoji: '🎯',
    category: 'marketing',
    description: 'Section d\'appel à l\'action avec bouton principal',
    variants: ['centered', 'banner', 'card', 'large', 'minimal', 'whatsapp'],
    defaultVariant: 'centered',
    settings: {
      bgType:     { type: 'enum',    default: 'gradient', values: ['gradient', 'solid', 'image'], label: 'Fond' },
      bgGradient: { type: 'gradient',default: '135deg,#6366f1 0%,#8b5cf6 100%',                  label: 'Dégradé' },
      bgColor:    { type: 'color',   default: '#6366f1',                                           label: 'Couleur fond' },
      textColor:  { type: 'color',   default: '#ffffff',                                           label: 'Couleur texte' },
      btnBg:      { type: 'color',   default: '#ffffff',                                           label: 'Fond bouton' },
      btnColor:   { type: 'color',   default: '#6366f1',                                           label: 'Texte bouton' },
      btnRadius:  { type: 'number',  default: 8, min: 0, max: 50,                                label: 'Arrondi bouton (px)' },
      paddingTop: { type: 'number',  default: 80, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',default: 80, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      eyebrow:  { type: 'string', default: '',                       label: 'Sur-titre' },
      title:    { type: 'string', default: 'Prêt à commencer ?',    label: 'Titre' },
      subtitle: { type: 'string', default: '',                       label: 'Sous-titre' },
      ctaText:  { type: 'string', default: 'Commencer maintenant',  label: 'Texte bouton principal' },
      ctaLink:  { type: 'string', default: '#',                      label: 'Lien' },
      ctaSecond:{ type: 'string', default: '',                       label: 'Texte bouton secondaire' },
      ctaSecondLink:{ type: 'string', default: '#',                  label: 'Lien secondaire' },
      whatsapp: { type: 'string', default: '',                       label: 'Numéro WhatsApp (variant whatsapp)' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 41. FORM
  // ════════════════════════════════════════════════════════════════════════════
  form: {
    label: 'Formulaire',
    emoji: '📋',
    category: 'utility',
    description: 'Formulaire personnalisable (contact, devis, inscription)',
    variants: ['contact', 'quote', 'subscribe', 'custom'],
    defaultVariant: 'contact',
    settings: {
      bgColor:    { type: 'color',   default: '#ffffff',  label: 'Fond' },
      accentColor:{ type: 'color',   default: '#6366f1',  label: 'Couleur accent' },
      borderRadius:{ type: 'number', default: 8, min: 0, max: 30, label: 'Arrondi champs (px)' },
      paddingTop: { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom: { type: 'number', default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:      { type: 'string', default: 'Contactez-nous',      label: 'Titre' },
      subtitle:   { type: 'string', default: '',                     label: 'Sous-titre' },
      fields:     { type: 'array',  default: [],                     label: 'Champs du formulaire' },
      submitText: { type: 'string', default: 'Envoyer',             label: 'Texte bouton' },
      successMsg: { type: 'string', default: 'Message envoyé !',    label: 'Message succès' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 42. NEWSLETTER
  // ════════════════════════════════════════════════════════════════════════════
  newsletter: {
    label: 'Newsletter',
    emoji: '📧',
    category: 'marketing',
    description: 'Capture d\'emails avec offre incitative',
    variants: ['centered', 'inline', 'split', 'minimal', 'popup'],
    defaultVariant: 'centered',
    settings: {
      bgColor:      { type: 'color',   default: '#1e1b4b',  label: 'Fond' },
      textColor:    { type: 'color',   default: '#ffffff',   label: 'Texte' },
      buttonBg:     { type: 'color',   default: '#6366f1',  label: 'Fond bouton' },
      buttonColor:  { type: 'color',   default: '#ffffff',   label: 'Texte bouton' },
      inputBg:      { type: 'color',   default: 'rgba(255,255,255,0.1)', label: 'Fond champ' },
      showIncentive:{ type: 'boolean', default: true,        label: 'Afficher incitation' },
      paddingTop:   { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:      { type: 'string', default: 'Restez informé(e) !',            label: 'Titre' },
      subtitle:   { type: 'string', default: 'Offres exclusives en avant-première', label: 'Sous-titre' },
      incentive:  { type: 'string', default: '-10% sur votre première commande', label: 'Incitation' },
      placeholder:{ type: 'string', default: 'Votre adresse email',            label: 'Placeholder' },
      buttonText: { type: 'string', default: "S'abonner",                      label: 'Texte bouton' },
      confirmMsg: { type: 'string', default: 'Merci ! Inscription confirmée.', label: 'Confirmation' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 43. PRICING
  // ════════════════════════════════════════════════════════════════════════════
  pricing: {
    label: 'Tableau de prix',
    emoji: '💎',
    category: 'commerce',
    description: 'Plans tarifaires comparatifs',
    variants: ['cards', 'table', 'minimal', 'highlighted'],
    defaultVariant: 'cards',
    settings: {
      columns:     { type: 'enum',    default: '3', values: ['2', '3', '4'],  label: 'Colonnes' },
      currency:    { type: 'string',  default: 'XOF',                         label: 'Devise' },
      accentColor: { type: 'color',   default: '#6366f1',                     label: 'Couleur accent' },
      bgColor:     { type: 'color',   default: '#ffffff',                      label: 'Fond' },
      showBillingToggle: { type: 'boolean', default: false, label: 'Bascule mensuel/annuel' },
      paddingTop:  { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom: { type: 'number', default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:  { type: 'string', default: 'Nos Tarifs', label: 'Titre' },
      plans:  { type: 'array',  default: [],           label: 'Plans' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 44. COMPARISON
  // ════════════════════════════════════════════════════════════════════════════
  comparison: {
    label: 'Comparatif',
    emoji: '⚖️',
    category: 'content',
    description: 'Tableau comparatif de produits ou plans',
    variants: ['table', 'cards', 'vs'],
    defaultVariant: 'table',
    settings: {
      bgColor:     { type: 'color', default: '#ffffff',  label: 'Fond' },
      accentColor: { type: 'color', default: '#6366f1',  label: 'Accent' },
      checkColor:  { type: 'color', default: '#059669',  label: 'Couleur ✓' },
      crossColor:  { type: 'color', default: '#ef4444',  label: 'Couleur ✗' },
    },
    content: {
      title:     { type: 'string', default: 'Comparatif', label: 'Titre' },
      items:     { type: 'array',  default: [],           label: 'Éléments à comparer' },
      criteria:  { type: 'array',  default: [],           label: 'Critères' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 45. FAQ
  // ════════════════════════════════════════════════════════════════════════════
  faq: {
    label: 'FAQ',
    emoji: '❓',
    category: 'content',
    description: 'Questions fréquentes en accordéon',
    variants: ['border', 'card', 'minimal', 'boxed'],
    defaultVariant: 'border',
    settings: {
      allowMultiple:{ type: 'boolean', default: false,    label: 'Plusieurs ouverts' },
      defaultOpen:  { type: 'number',  default: -1, min: -1, label: 'Ouvert par défaut' },
      bgColor:      { type: 'color',   default: '#ffffff', label: 'Fond section' },
      itemBg:       { type: 'color',   default: '#f9fafb', label: 'Fond item' },
      textColor:    { type: 'color',   default: '#111827', label: 'Couleur texte' },
      iconColor:    { type: 'color',   default: '#6366f1', label: 'Couleur icône' },
      paddingTop:   { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:    { type: 'string', default: 'Questions fréquentes', label: 'Titre' },
      subtitle: { type: 'string', default: '',                     label: 'Sous-titre' },
      items:    { type: 'array',  default: [
        { question: 'Quels sont vos délais de livraison ?', answer: 'Nous livrons en 2 à 5 jours ouvrables.' },
        { question: 'Comment suivre ma commande ?', answer: 'Un lien de suivi est envoyé par WhatsApp.' },
        { question: 'Puis-je retourner un article ?', answer: 'Oui, sous 14 jours.' },
      ], label: 'Questions / Réponses' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 46. GALLERY
  // ════════════════════════════════════════════════════════════════════════════
  gallery: {
    label: 'Galerie',
    emoji: '🖼️',
    category: 'media',
    description: 'Galerie de photos avec lightbox',
    variants: ['grid', 'masonry', 'carousel', 'fullwidth'],
    defaultVariant: 'masonry',
    settings: {
      columns:      { type: 'enum',    default: '3',  values: ['2', '3', '4', '5'],                    label: 'Colonnes' },
      gap:          { type: 'number',  default: 8, min: 0, max: 40,                                   label: 'Espacement (px)' },
      borderRadius: { type: 'number',  default: 8, min: 0, max: 40,                                   label: 'Arrondi (px)' },
      hoverEffect:  { type: 'enum',    default: 'zoom', values: ['none', 'zoom', 'overlay', 'lift'],   label: 'Effet survol' },
      openLightbox: { type: 'boolean', default: true,                                                  label: 'Lightbox au clic' },
      bgColor:      { type: 'color',   default: '#ffffff',                                              label: 'Fond' },
      paddingTop:   { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:  { type: 'string', default: 'Notre Galerie', label: 'Titre' },
      images: { type: 'array',  default: [],              label: 'Images' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 47. VIDEO
  // ════════════════════════════════════════════════════════════════════════════
  video: {
    label: 'Vidéo',
    emoji: '🎬',
    category: 'media',
    description: 'Vidéo YouTube, Vimeo ou MP4',
    variants: ['contained', 'full-width', 'floating', 'background'],
    defaultVariant: 'contained',
    settings: {
      autoPlay:     { type: 'boolean', default: false,                    label: 'Lecture auto' },
      muted:        { type: 'boolean', default: true,                     label: 'Muet' },
      showControls: { type: 'boolean', default: true,                     label: 'Contrôles' },
      borderRadius: { type: 'number',  default: 12, min: 0, max: 40,    label: 'Arrondi (px)' },
      maxWidth:     { type: 'enum',    default: '4xl', values: ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'full'], label: 'Largeur max' },
      bgColor:      { type: 'color',   default: '#111827',               label: 'Fond' },
      ratio:        { type: 'enum',    default: '16/9', values: ['16/9', '4/3', '1/1', '9/16'], label: 'Ratio' },
      paddingTop:   { type: 'number',  default: 60, min: 0, max: 200, label: 'Padding haut (px)' },
      paddingBottom:{ type: 'number',  default: 60, min: 0, max: 200, label: 'Padding bas (px)' },
    },
    content: {
      title:     { type: 'string',         default: '',    label: 'Titre (optionnel)' },
      videoUrl:  { type: 'url',            default: '',    label: 'URL (YouTube/Vimeo/MP4)' },
      thumbnail: { type: 'cloudinary_url', default: null,  label: 'Vignette' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 48. MAP
  // ════════════════════════════════════════════════════════════════════════════
  map: {
    label: 'Carte',
    emoji: '🗺️',
    category: 'identity',
    description: 'Carte Google Maps intégrée',
    variants: ['full-width', 'card', 'small'],
    defaultVariant: 'card',
    settings: {
      height:       { type: 'number',  default: 400, min: 200, max: 800, label: 'Hauteur (px)' },
      borderRadius: { type: 'number',  default: 16, min: 0, max: 50,    label: 'Arrondi (px)' },
      bgColor:      { type: 'color',   default: '#ffffff',               label: 'Fond section' },
    },
    content: {
      embedUrl: { type: 'url',    default: '', label: 'URL embed Google Maps' },
      address:  { type: 'string', default: '', label: 'Adresse (texte)' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 49. CHAT
  // ════════════════════════════════════════════════════════════════════════════
  chat: {
    label: 'Chat / WhatsApp',
    emoji: '💬',
    category: 'utility',
    description: 'Widget de chat ou bouton WhatsApp flottant',
    variants: ['whatsapp-floating', 'chat-bubble', 'ai-chat'],
    defaultVariant: 'whatsapp-floating',
    settings: {
      position:   { type: 'enum',    default: 'bottom-right', values: ['bottom-right', 'bottom-left'], label: 'Position' },
      bgColor:    { type: 'color',   default: '#25D366',     label: 'Couleur bouton' },
      size:       { type: 'enum',    default: 'md', values: ['sm', 'md', 'lg'],                       label: 'Taille' },
    },
    content: {
      whatsapp:    { type: 'string', default: '',                      label: 'Numéro WhatsApp' },
      greeting:    { type: 'string', default: 'Bonjour ! Comment puis-je vous aider ?', label: 'Message d\'accueil' },
      agentName:   { type: 'string', default: 'Service Client',        label: 'Nom agent' },
      agentAvatar: { type: 'cloudinary_url', default: null,            label: 'Photo agent' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 50. CALENDAR
  // ════════════════════════════════════════════════════════════════════════════
  calendar: {
    label: 'Calendrier',
    emoji: '📆',
    category: 'booking',
    description: 'Calendrier de disponibilités ou d\'événements',
    variants: ['monthly', 'weekly', 'events-list'],
    defaultVariant: 'monthly',
    settings: {
      accentColor: { type: 'color',   default: '#6366f1', label: 'Couleur accent' },
      bgColor:     { type: 'color',   default: '#ffffff',  label: 'Fond' },
      showNavigation:{ type: 'boolean', default: true,    label: 'Navigation mois' },
    },
    content: {
      title:  { type: 'string', default: 'Disponibilités', label: 'Titre' },
      events: { type: 'array',  default: [],               label: 'Événements' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 51. FILTER
  // ════════════════════════════════════════════════════════════════════════════
  filter: {
    label: 'Filtres',
    emoji: '🔧',
    category: 'utility',
    description: 'Filtres pour produits ou contenu',
    variants: ['tabs', 'pills', 'dropdown', 'sidebar'],
    defaultVariant: 'pills',
    settings: {
      accentColor: { type: 'color', default: '#6366f1', label: 'Couleur actif' },
      bgColor:     { type: 'color', default: '#ffffff',  label: 'Fond' },
      multiple:    { type: 'boolean', default: false,   label: 'Sélection multiple' },
    },
    content: {
      filters: { type: 'array', default: [], label: 'Options de filtres' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 52. SORT
  // ════════════════════════════════════════════════════════════════════════════
  sort: {
    label: 'Tri',
    emoji: '🔀',
    category: 'utility',
    description: 'Options de tri pour collections',
    variants: ['dropdown', 'buttons', 'inline'],
    defaultVariant: 'dropdown',
    settings: {
      bgColor:    { type: 'color', default: '#ffffff', label: 'Fond' },
    },
    content: {
      options: { type: 'array', default: [
        { value: 'popular',   label: 'Populaire' },
        { value: 'newest',    label: 'Nouveautés' },
        { value: 'price-asc', label: 'Prix croissant' },
        { value: 'price-desc',label: 'Prix décroissant' },
      ], label: 'Options de tri' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 53. NOTIFICATION
  // ════════════════════════════════════════════════════════════════════════════
  notification: {
    label: 'Notification',
    emoji: '🔔',
    category: 'marketing',
    description: 'Popup ou bannière de notification (vente en cours, stock faible)',
    variants: ['popup-corner', 'toast', 'banner'],
    defaultVariant: 'popup-corner',
    settings: {
      position:  { type: 'enum', default: 'bottom-left', values: ['bottom-left', 'bottom-right', 'top-right'], label: 'Position' },
      bgColor:   { type: 'color', default: '#1f2937', label: 'Fond' },
      textColor: { type: 'color', default: '#ffffff', label: 'Texte' },
      autoHide:  { type: 'boolean', default: true,   label: 'Auto-masquer' },
      delay:     { type: 'number',  default: 5, min: 0, max: 30, label: 'Délai (secondes)' },
    },
    content: {
      message:  { type: 'string', default: '🔥 Quelqu\'un vient d\'acheter !', label: 'Message' },
      image:    { type: 'cloudinary_url', default: null, label: 'Image' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 54. UPLOAD
  // ════════════════════════════════════════════════════════════════════════════
  upload: {
    label: 'Zone de téléchargement',
    emoji: '📤',
    category: 'utility',
    description: 'Zone d\'upload de fichiers ou images',
    variants: ['dropzone', 'button', 'camera'],
    defaultVariant: 'dropzone',
    settings: {
      accept:     { type: 'string',  default: 'image/*',  label: 'Types acceptés' },
      maxSize:    { type: 'number',  default: 5, min: 1, max: 50, label: 'Taille max (Mo)' },
      multiple:   { type: 'boolean', default: false,       label: 'Multiple' },
      bgColor:    { type: 'color',   default: '#f9fafb',   label: 'Fond' },
      accentColor:{ type: 'color',   default: '#6366f1',   label: 'Couleur accent' },
    },
    content: {
      label:      { type: 'string', default: 'Déposez vos fichiers ici', label: 'Libellé' },
      sublabel:   { type: 'string', default: 'ou cliquez pour sélectionner', label: 'Sous-libellé' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 55. MODAL
  // ════════════════════════════════════════════════════════════════════════════
  modal: {
    label: 'Modal / Popup',
    emoji: '🪟',
    category: 'utility',
    description: 'Modal ou popup contextuel',
    variants: ['center', 'side-drawer', 'bottom-sheet', 'fullscreen'],
    defaultVariant: 'center',
    settings: {
      bgColor:      { type: 'color',   default: '#ffffff', label: 'Fond' },
      overlayColor: { type: 'color',   default: 'rgba(0,0,0,0.5)', label: 'Voile' },
      borderRadius: { type: 'number',  default: 16, min: 0, max: 50, label: 'Arrondi (px)' },
      maxWidth:     { type: 'enum',    default: 'md', values: ['sm', 'md', 'lg', 'xl', 'full'], label: 'Largeur max' },
      closable:     { type: 'boolean', default: true,      label: 'Fermable' },
    },
    content: {
      title:   { type: 'string', default: '', label: 'Titre modal' },
      content: { type: 'string', default: '', label: 'Contenu' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 56. TABS
  // ════════════════════════════════════════════════════════════════════════════
  tabs: {
    label: 'Onglets',
    emoji: '📑',
    category: 'utility',
    description: 'Navigation par onglets',
    variants: ['underline', 'pills', 'bordered', 'vertical'],
    defaultVariant: 'underline',
    settings: {
      accentColor: { type: 'color', default: '#6366f1', label: 'Couleur active' },
      bgColor:     { type: 'color', default: '#ffffff',  label: 'Fond' },
      tabBg:       { type: 'color', default: '#f9fafb',  label: 'Fond onglets' },
    },
    content: {
      tabs: { type: 'array', default: [], label: 'Onglets' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 57. ACCORDION
  // ════════════════════════════════════════════════════════════════════════════
  accordion: {
    label: 'Accordéon',
    emoji: '📂',
    category: 'utility',
    description: 'Sections repliables en accordéon',
    variants: ['border', 'card', 'minimal', 'flush'],
    defaultVariant: 'border',
    settings: {
      allowMultiple: { type: 'boolean', default: false,    label: 'Plusieurs ouverts' },
      accentColor:   { type: 'color',   default: '#6366f1', label: 'Couleur accent' },
      bgColor:       { type: 'color',   default: '#ffffff',  label: 'Fond' },
    },
    content: {
      items: { type: 'array', default: [], label: 'Sections' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 58. ALERT
  // ════════════════════════════════════════════════════════════════════════════
  alert: {
    label: 'Alerte / Message',
    emoji: '⚠️',
    category: 'utility',
    description: 'Message d\'alerte, info, succès ou erreur',
    variants: ['info', 'success', 'warning', 'error', 'custom'],
    defaultVariant: 'info',
    settings: {
      type:       { type: 'enum',    default: 'info', values: ['info', 'success', 'warning', 'error'], label: 'Type' },
      dismissible:{ type: 'boolean', default: true,  label: 'Fermable' },
      icon:       { type: 'boolean', default: true,  label: 'Icône' },
      bgColor:    { type: 'color',   default: '#eff6ff', label: 'Fond' },
      textColor:  { type: 'color',   default: '#1e40af', label: 'Couleur texte' },
    },
    content: {
      title:   { type: 'string', default: '',   label: 'Titre (optionnel)' },
      message: { type: 'string', default: '',   label: 'Message' },
      ctaText: { type: 'string', default: '',   label: 'Texte bouton (optionnel)' },
      ctaLink: { type: 'string', default: '#',  label: 'Lien bouton' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 59. EMPTYSTATE
  // ════════════════════════════════════════════════════════════════════════════
  emptyState: {
    label: 'État vide',
    emoji: '📭',
    category: 'utility',
    description: 'Écran d\'état vide (aucun produit, résultat, etc.)',
    variants: ['with-illustration', 'minimal', 'with-action'],
    defaultVariant: 'with-action',
    settings: {
      bgColor:    { type: 'color', default: '#f9fafb', label: 'Fond' },
      textColor:  { type: 'color', default: '#6b7280', label: 'Couleur texte' },
    },
    content: {
      emoji:    { type: 'string', default: '📭',                    label: 'Emoji / Icône' },
      title:    { type: 'string', default: 'Rien ici pour l\'instant', label: 'Titre' },
      subtitle: { type: 'string', default: '',                      label: 'Sous-titre' },
      ctaText:  { type: 'string', default: '',                      label: 'Texte bouton' },
      ctaLink:  { type: 'string', default: '#',                     label: 'Lien bouton' },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 60. FOOTER
  // ════════════════════════════════════════════════════════════════════════════
  footer: {
    label: 'Pied de page',
    emoji: '📄',
    category: 'layout',
    description: 'Pied de page avec liens, infos légales et réseaux',
    variants: ['simple', 'columns', 'minimal', 'dark', 'branded'],
    defaultVariant: 'simple',
    settings: {
      bgColor:      { type: 'color',   default: '#111827',  label: 'Fond' },
      textColor:    { type: 'color',   default: '#9ca3af',  label: 'Couleur texte' },
      accentColor:  { type: 'color',   default: '#6366f1',  label: 'Couleur accent' },
      showSocials:  { type: 'boolean', default: true,       label: 'Réseaux sociaux' },
      showLegal:    { type: 'boolean', default: true,       label: 'Liens légaux' },
      showNewsletter:{ type: 'boolean',default: false,      label: 'Newsletter inline' },
    },
    content: {
      storeName:   { type: 'string', default: '',  label: 'Nom boutique' },
      logo:        { type: 'cloudinary_url', default: null, label: 'Logo' },
      description: { type: 'string', default: '',  label: 'Description courte' },
      links:       { type: 'array',  default: [],  label: 'Liens navigation' },
      legalLinks:  { type: 'array',  default: [
        { label: 'Mentions légales', href: '/mentions-legales' },
        { label: 'Politique de confidentialité', href: '#' },
      ], label: 'Liens légaux' },
      copyright:   { type: 'string', default: '© 2025 VesTyle. Tous droits réservés.', label: 'Copyright' },
      socials:     { type: 'object', default: {},  label: 'Réseaux sociaux' },
    },
  },

};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Retourne la liste des types de blocs disponibles
 */
export function getBlockTypes() {
  return Object.keys(BLOCK_REGISTRY);
}

/**
 * Retourne la définition d'un type de bloc
 */
export function getBlockDef(type) {
  return BLOCK_REGISTRY[type] || null;
}

/**
 * Retourne les variants disponibles d'un bloc
 */
export function getBlockVariants(type) {
  return BLOCK_REGISTRY[type]?.variants || [];
}

/**
 * Retourne la config par défaut d'un bloc (settings + content fusionnés)
 */
export function getDefaultBlockConfig(type) {
  const def = BLOCK_REGISTRY[type];
  if (!def) return {};

  const settings = Object.fromEntries(
    Object.entries(def.settings || {}).map(([k, v]) => [k, v.default])
  );
  const content = Object.fromEntries(
    Object.entries(def.content || {}).map(([k, v]) => [k, v.default])
  );

  return { settings, content };
}

/**
 * Crée un nouveau bloc avec toutes les valeurs par défaut
 */
export function createBlockInstance(type, overrides = {}) {
  const def = BLOCK_REGISTRY[type];
  if (!def) throw new Error(`[BlockRegistry] Type de bloc inconnu: "${type}"`);

  const defaults = getDefaultBlockConfig(type);

  return {
    id: `block_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    type,
    variant: overrides.variant || def.defaultVariant || (def.variants?.[0] ?? 'default'),
    enabled: true,
    position: 0,
    settings: { ...defaults.settings, ...(overrides.settings || {}) },
    content:  { ...defaults.content,  ...(overrides.content  || {}) },
    block_version: 1,
    created_at: new Date().toISOString(),
  };
}

/**
 * Valide qu'une valeur respecte son type de prop
 */
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
    case 'enum':    return propDef.values?.includes(value) ?? true;
    case 'color':   return typeof value === 'string' && (
      value.startsWith('#') || value.startsWith('rgb') ||
      value.startsWith('hsl') || value === 'transparent' || value.includes('rgba')
    );
    case 'gradient': return typeof value === 'string';
    case 'url': case 'cloudinary_url': return typeof value === 'string';
    case 'array':  return Array.isArray(value);
    case 'object': return typeof value === 'object' && !Array.isArray(value);
    default: return true;
  }
}

/**
 * Retourne le schéma compatible AI (Mistral/GPT) pour le prompt système
 */
export function getSchemaForAI() {
  return Object.entries(BLOCK_REGISTRY).map(([type, def]) => ({
    type,
    label: def.label,
    description: def.description,
    category: def.category,
    variants: def.variants,
    defaultVariant: def.defaultVariant,
    settingsKeys: Object.keys(def.settings || {}),
    contentKeys: Object.keys(def.content || {}),
  }));
}

/**
 * Retourne les blocs groupés par catégorie (pour l'UI du builder)
 */
export function getBlocksByCategory() {
  const grouped = {};
  Object.entries(BLOCK_REGISTRY).forEach(([type, def]) => {
    const cat = def.category || 'utility';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ type, ...def });
  });
  return grouped;
}

// Rétrocompatibilité avec l'ancien componentRegistry.js
export const COMPONENT_REGISTRY = Object.fromEntries(
  Object.entries(BLOCK_REGISTRY).map(([type, def]) => [
    type,
    {
      ...def,
      props: {
        ...(def.settings || {}),
        ...(def.content || {}),
      },
    },
  ])
);

export function getDefaultConfig(type) {
  const defaults = getDefaultBlockConfig(type);
  return { ...defaults.settings, ...defaults.content };
}
