// ─── Système i18n léger — FR / EN / Wolof ────────────────────────────────────
// Sans dépendance externe, compatible Edge Runtime

export const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', label: 'English',  flag: '🇬🇧', dir: 'ltr' },
  { code: 'wo', label: 'Wolof',    flag: '🇸🇳', dir: 'ltr' },
];

// ─── Dictionnaire de traductions ─────────────────────────────────────────────
export const TRANSLATIONS = {
  // ── Navigation / Général ────────────────────────────────────────────────
  'nav.home': {
    fr: 'Accueil',
    en: 'Home',
    wo: 'Kanam',
  },
  'nav.products': {
    fr: 'Produits',
    en: 'Products',
    wo: 'Limm yi',
  },
  'nav.contact': {
    fr: 'Contact',
    en: 'Contact',
    wo: 'Jëfandikukat',
  },
  'nav.cart': {
    fr: 'Panier',
    en: 'Cart',
    wo: 'Mbir mu',
  },

  // ── Boutique publique ────────────────────────────────────────────────────
  'store.discover': {
    fr: 'Découvrir',
    en: 'Discover',
    wo: 'Xool',
  },
  'store.add_to_cart': {
    fr: 'Ajouter au panier',
    en: 'Add to cart',
    wo: 'Yokk ci mbir',
  },
  'store.out_of_stock': {
    fr: 'Rupture de stock',
    en: 'Out of stock',
    wo: 'Dafay bees',
  },
  'store.in_stock': {
    fr: 'En stock',
    en: 'In stock',
    wo: 'Am na',
  },
  'store.price': {
    fr: 'Prix',
    en: 'Price',
    wo: 'Jirim',
  },
  'store.see_all': {
    fr: 'Voir tout',
    en: 'See all',
    wo: 'Xool yépp',
  },
  'store.search': {
    fr: 'Rechercher...',
    en: 'Search...',
    wo: 'Seet...',
  },
  'store.filter': {
    fr: 'Filtrer',
    en: 'Filter',
    wo: 'Tànn',
  },
  'store.reviews': {
    fr: 'avis',
    en: 'reviews',
    wo: 'xam-xam yi',
  },
  'store.new': {
    fr: 'Nouveau',
    en: 'New',
    wo: 'Bees',
  },
  'store.featured': {
    fr: 'Vedette',
    en: 'Featured',
    wo: 'Xewaat',
  },
  'store.free_delivery': {
    fr: 'Livraison gratuite',
    en: 'Free delivery',
    wo: 'Jënd bu amul xaalis',
  },
  'store.contact_us': {
    fr: 'Nous contacter',
    en: 'Contact us',
    wo: 'Xam ñu',
  },
  'store.whatsapp': {
    fr: 'Commander via WhatsApp',
    en: 'Order via WhatsApp',
    wo: 'Jënd ci WhatsApp',
  },
  'store.follow_us': {
    fr: 'Suivez-nous',
    en: 'Follow us',
    wo: 'Séqël ñu',
  },
  'store.subscribe': {
    fr: 'S\'abonner',
    en: 'Subscribe',
    wo: 'Bindul sa réew',
  },
  'store.newsletter_placeholder': {
    fr: 'Votre email',
    en: 'Your email',
    wo: 'Sa email',
  },
  'store.thank_you': {
    fr: 'Merci !',
    en: 'Thank you!',
    wo: 'Jërejëf!',
  },

  // ── Chatbot ─────────────────────────────────────────────────────────────
  'chat.placeholder': {
    fr: 'Posez votre question...',
    en: 'Ask your question...',
    wo: 'Laaj sa laaj...',
  },
  'chat.title': {
    fr: 'Assistant boutique',
    en: 'Store assistant',
    wo: 'Dëkk bu jëfandiku',
  },
  'chat.greeting': {
    fr: 'Bonjour ! Comment puis-je vous aider ?',
    en: 'Hello! How can I help you?',
    wo: 'Salaam ! Lan laa xamal ngir jëfandiku?',
  },
  'chat.send': {
    fr: 'Envoyer',
    en: 'Send',
    wo: 'Yónni',
  },

  // ── Compte à rebours ─────────────────────────────────────────────────────
  'countdown.days': {
    fr: 'Jours',
    en: 'Days',
    wo: 'Bés yi',
  },
  'countdown.hours': {
    fr: 'Heures',
    en: 'Hours',
    wo: 'Waxtu yi',
  },
  'countdown.minutes': {
    fr: 'Minutes',
    en: 'Minutes',
    wo: 'Simili yi',
  },
  'countdown.seconds': {
    fr: 'Secondes',
    en: 'Seconds',
    wo: 'Gimbeel yi',
  },
  'countdown.expired': {
    fr: 'L\'offre a expiré',
    en: 'Offer has expired',
    wo: 'Njëfar bi jeex na',
  },

  // ── FAQ ──────────────────────────────────────────────────────────────────
  'faq.title': {
    fr: 'Questions fréquentes',
    en: 'FAQ',
    wo: 'Laajante yu dëkk yi',
  },
};

// ─── Hook / Fonction de traduction ────────────────────────────────────────────
export function t(key, lang = 'fr') {
  const entry = TRANSLATIONS[key];
  if (!entry) return key;
  return entry[lang] || entry['fr'] || key;
}

// ─── Détection de langue du navigateur ───────────────────────────────────────
export function detectBrowserLanguage() {
  if (typeof window === 'undefined') return 'fr';
  const nav = navigator.language || navigator.languages?.[0] || 'fr';
  const code = nav.slice(0, 2).toLowerCase();
  const supported = LANGUAGES.map(l => l.code);
  return supported.includes(code) ? code : 'fr';
}

// ─── Persistance dans localStorage ───────────────────────────────────────────
const LANG_KEY = 'vestyle_lang';

export function getSavedLanguage() {
  if (typeof window === 'undefined') return 'fr';
  return localStorage.getItem(LANG_KEY) || detectBrowserLanguage();
}

export function saveLanguage(lang) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANG_KEY, lang);
}
