/**
 * VeStyle — Templates de boutiques complètes
 * Chaque template est une config JSON complète
 * prête à être appliquée en 1 clic.
 */
import { createBlock } from './blockPatcher';

export const STORE_TEMPLATES = [
  // ══ MODE / FASHION ═══════════════════════════════════════════════════════
  {
    id: 'fashion_luxe',
    name: 'Mode Luxe',
    emoji: '👗',
    description: 'Boutique de prêt-à-porter haut de gamme avec hero élégant et galerie lookbook',
    sector: 'fashion',
    preview: 'linear-gradient(135deg,#1a1a2e,#c9a96e)',
    tags: ['mode', 'luxe', 'fashion', 'vêtements'],
    theme: {
      primaryColor: '#c9a96e',
      secondaryColor: '#1a1a2e',
      accentColor: '#e8d5b7',
      fontFamily: 'Cormorant Garamond',
      mode: 'dark',
    },
    blocks: [
      {
        type: 'hero',
        config: {
          title: 'L\'Art du Vêtement',
          subtitle: 'Collection exclusive — Pièces uniques pour femmes et hommes d\'exception',
          backgroundGradient: '135deg,#1a1a2e 0%,#2d2d44 100%',
          titleGradient: '90deg,#c9a96e 0%,#e8d5b7 100%',
          ctaText: 'Voir la collection',
          ctaStyle: 'outline',
          ctaColor: '#c9a96e',
          height: 'screen',
          titleSize: '6xl',
          showScrollIndicator: true,
        },
      },
      { type: 'statsBar', config: { stats: [{ value: '500+', label: 'Pièces exclusives', icon: '👗' }, { value: '4.9★', label: 'Note clients', icon: '⭐' }, { value: '10+', label: 'Années d\'expérience', icon: '🏆' }, { value: '100%', label: 'Satisfaction', icon: '✅' }], bgColor: '#c9a96e', textColor: '#1a1a2e', valueColor: '#1a1a2e', showDivider: true } },
      { type: 'offeringGrid', config: { title: 'Nouvelle Collection', columns: '3', cardStyle: 'shadow', hoverEffect: 'lift', bgColor: '#f9f7f4' } },
      { type: 'imageGallery', config: { title: 'Lookbook', layout: 'masonry', columns: '3', hoverEffect: 'zoom', openLightbox: true } },
      { type: 'testimonialSlider', config: { title: 'Elles en parlent', layout: 'slider', cardStyle: 'glass', bgColor: '#1a1a2e', textColor: '#e8d5b7', starColor: '#c9a96e' } },
      { type: 'socialLinks', config: { title: 'Suivez notre univers', style: 'rounded', size: 'lg', bgColor: '#1a1a2e' } },
      { type: 'newsletterSignup', config: { title: 'Accès privilège', subtitle: 'Ventes privées, nouvelles collections en avant-première', incentive: '-15% sur votre première commande', bgColor: '#c9a96e', textColor: '#1a1a2e', buttonBg: '#1a1a2e', layout: 'centered' } },
    ],
  },

  // ══ RESTAURANT ════════════════════════════════════════════════════════════
  {
    id: 'restaurant_chic',
    name: 'Restaurant Chic',
    emoji: '🍽️',
    description: 'Restaurant gastronomique avec ambiance chaleureuse et menu en vedette',
    sector: 'restaurant',
    preview: 'linear-gradient(135deg,#7b2d00,#f4a261)',
    tags: ['restaurant', 'food', 'gastronomie', 'café'],
    theme: {
      primaryColor: '#e76f51',
      secondaryColor: '#fefae0',
      accentColor: '#f4a261',
      fontFamily: 'Playfair Display',
      mode: 'light',
    },
    blocks: [
      {
        type: 'hero',
        config: {
          title: 'Une Expérience Culinaire Unique',
          subtitle: 'Cuisine africaine & internationale — Fait maison, avec passion',
          backgroundGradient: '135deg,#7b2d00 0%,#e76f51 100%',
          titleColor: '#fefae0',
          ctaText: 'Réserver une table',
          ctaStyle: 'solid',
          ctaBg: '#fefae0',
          ctaColor: '#7b2d00',
          height: 'screen',
          badges: ['✅ Livraison disponible', '⭐ 4.9/5 sur Google', '🕐 Ouvert 7j/7'],
          showBadges: true,
        },
      },
      { type: 'richText', config: { title: 'Notre Histoire', content: '<p>Fondé avec passion, notre restaurant vous propose une immersion dans les saveurs authentiques d\'Afrique de l\'Ouest, revisitées avec une touche moderne. Chaque plat est préparé avec des ingrédients frais et locaux.</p>', bgColor: '#fefae0', titleColor: '#7b2d00', showDivider: true, dividerColor: '#e76f51' } },
      { type: 'statsBar', config: { stats: [{ value: '50+', label: 'Plats au menu', icon: '🍲' }, { value: '1 200+', label: 'Clients satisfaits', icon: '😊' }, { value: '4.9★', label: 'Note Google', icon: '⭐' }, { value: '7j/7', label: 'Ouvert', icon: '🕐' }], bgColor: '#e76f51', textColor: '#fff' } },
      { type: 'offeringGrid', config: { title: 'Notre Menu', columns: '3', cardStyle: 'shadow', bgColor: '#fefae0', imageRatio: 'landscape' } },
      { type: 'imageGallery', config: { title: 'Notre Cuisine', layout: 'grid', columns: '3', hoverEffect: 'zoom' } },
      { type: 'testimonialSlider', config: { title: 'Nos clients en parlent', layout: 'grid', cardStyle: 'card' } },
      { type: 'faqAccordion', config: { title: 'Informations pratiques', items: [{ question: 'Quels sont vos horaires ?', answer: 'Nous sommes ouverts tous les jours de 11h à 23h.' }, { question: 'Faites-vous la livraison ?', answer: 'Oui, nous livrons dans un rayon de 10 km. Minimum de commande : 5 000 FCFA.' }, { question: 'Peut-on réserver ?', answer: 'Oui, via WhatsApp ou par téléphone.' }] } },
      { type: 'contactForm', config: { title: 'Réservation & Contact', showWhatsApp: true, showPhone: true, showMap: false } },
    ],
  },

  // ══ E-COMMERCE GÉNÉRAL ════════════════════════════════════════════════════
  {
    id: 'ecommerce_moderne',
    name: 'E-Commerce Moderne',
    emoji: '🛒',
    description: 'Boutique en ligne moderne et complète avec toutes les sections essentielles',
    sector: 'ecommerce',
    preview: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    tags: ['ecommerce', 'boutique', 'vente', 'produits'],
    theme: {
      primaryColor: '#6366f1',
      secondaryColor: '#fafafa',
      accentColor: '#8b5cf6',
      fontFamily: 'Inter',
      mode: 'light',
    },
    blocks: [
      {
        type: 'hero',
        config: {
          title: 'Bienvenue dans notre boutique',
          subtitle: 'Découvrez notre sélection soigneusement choisie pour vous',
          backgroundGradient: '135deg,#6366f1 0%,#8b5cf6 100%',
          titleColor: '#ffffff',
          ctaText: 'Découvrir nos produits',
          height: 'tall',
          animation: 'fade-up',
        },
      },
      { type: 'statsBar', config: { stats: [{ value: '100+', label: 'Produits', icon: '📦' }, { value: '4.8★', label: 'Satisfaction', icon: '⭐' }, { value: '48h', label: 'Livraison', icon: '🚚' }, { value: '24/7', label: 'Support', icon: '💬' }] } },
      { type: 'offeringGrid', config: { title: 'Nos Produits', columns: '4', showFilters: true, hoverEffect: 'lift' } },
      { type: 'countdown', config: { title: '⚡ Offre Flash — Temps restant :', bgColor: '#6366f1' } },
      { type: 'testimonialSlider', config: { title: 'Ce que disent nos clients', layout: 'grid', cardStyle: 'card' } },
      { type: 'faqAccordion', config: { title: 'Questions fréquentes' } },
      { type: 'newsletterSignup', config: { title: 'Offres exclusives', incentive: '-10% dès maintenant', bgColor: '#1e1b4b' } },
      { type: 'socialLinks', config: { title: 'Suivez-nous', bgColor: '#f9fafb' } },
      { type: 'contactForm', config: { title: 'Nous contacter', showWhatsApp: true } },
    ],
  },

  // ══ SERVICES / COACH ══════════════════════════════════════════════════════
  {
    id: 'services_pro',
    name: 'Services Pro',
    emoji: '💼',
    description: 'Prestataire de services, coach ou consultant avec mise en valeur de l\'expertise',
    sector: 'services',
    preview: 'linear-gradient(135deg,#0ea5e9,#06b6d4)',
    tags: ['services', 'coach', 'consultant', 'freelance'],
    theme: {
      primaryColor: '#0ea5e9',
      secondaryColor: '#f0f9ff',
      accentColor: '#06b6d4',
      fontFamily: 'Space Grotesk',
      mode: 'light',
    },
    blocks: [
      {
        type: 'hero',
        config: {
          title: 'Votre Expert à Votre Service',
          subtitle: 'Solutions sur-mesure pour accompagner votre croissance professionnelle et personnelle',
          backgroundGradient: '135deg,#0f172a 0%,#0ea5e9 100%',
          titleGradient: '90deg,#38bdf8 0%,#e0f2fe 100%',
          ctaText: 'Prendre rendez-vous',
          height: 'screen',
          animation: 'fade-up',
        },
      },
      { type: 'statsBar', config: { stats: [{ value: '200+', label: 'Clients accompagnés', icon: '👥' }, { value: '5★', label: 'Note moyenne', icon: '⭐' }, { value: '8 ans', label: 'D\'expérience', icon: '🏆' }, { value: '98%', label: 'Satisfaction', icon: '✅' }], layout: 'cards', bgColor: '#f0f9ff' } },
      { type: 'richText', config: { title: 'Mon Approche', content: '<p>Forte de plusieurs années d\'expérience, j\'accompagne mes clients avec une méthode éprouvée, centrée sur leurs besoins réels et leurs objectifs concrets. Ensemble, nous construisons le chemin vers votre succès.</p>', bgColor: '#fff', showDivider: true, dividerColor: '#0ea5e9' } },
      { type: 'offeringGrid', config: { title: 'Mes Offres de Services', columns: '3', offerTypes: 'services', cardStyle: 'shadow' } },
      { type: 'videoEmbed', config: { title: 'Découvrez ma méthode', bgColor: '#0f172a' } },
      { type: 'testimonialSlider', config: { title: 'Ils m\'ont fait confiance', layout: 'slider', cardStyle: 'quote' } },
      { type: 'faqAccordion', config: { title: 'Questions fréquentes' } },
      { type: 'contactForm', config: { title: 'Prendre Rendez-Vous', subtitle: 'Première consultation offerte', showWhatsApp: true, showEmail: true } },
    ],
  },

  // ══ BEAUTÉ / BIEN-ÊTRE ════════════════════════════════════════════════════
  {
    id: 'beaute_feminine',
    name: 'Beauté & Bien-être',
    emoji: '💄',
    description: 'Institut de beauté, salon ou cosmétiques avec esthétique rose et élégante',
    sector: 'beauty',
    preview: 'linear-gradient(135deg,#ec4899,#f9a8d4)',
    tags: ['beauté', 'cosmétique', 'salon', 'bien-être'],
    theme: {
      primaryColor: '#ec4899',
      secondaryColor: '#fdf2f8',
      accentColor: '#f472b6',
      fontFamily: 'Raleway',
      mode: 'light',
    },
    blocks: [
      {
        type: 'hero',
        config: {
          title: 'Révélez Votre Beauté Naturelle',
          subtitle: 'Soins professionnels, produits cosmétiques premium et conseils personnalisés',
          backgroundGradient: '135deg,#be185d 0%,#ec4899 50%,#f9a8d4 100%',
          titleColor: '#fff',
          ctaText: 'Prendre soin de moi',
          ctaStyle: 'solid',
          ctaBg: '#fff',
          ctaColor: '#be185d',
          height: 'screen',
          badges: ['🌿 Produits naturels', '✨ Résultats garantis', '💆 Experts certifiés'],
          showBadges: true,
        },
      },
      { type: 'offeringGrid', config: { title: 'Nos Soins & Produits', columns: '3', hoverEffect: 'lift', bgColor: '#fdf2f8' } },
      { type: 'imageGallery', config: { title: 'Nos Réalisations', layout: 'masonry', columns: '3' } },
      { type: 'statsBar', config: { stats: [{ value: '500+', label: 'Clientes satisfaites', icon: '💄' }, { value: '100%', label: 'Produits naturels', icon: '🌿' }, { value: '4.9★', label: 'Note moyenne', icon: '⭐' }], bgColor: '#ec4899', textColor: '#fff' } },
      { type: 'testimonialSlider', config: { title: 'Elles adorent !', bgColor: '#fdf2f8', cardStyle: 'card', starColor: '#ec4899' } },
      { type: 'newsletterSignup', config: { title: '✨ Conseils beauté exclusifs', subtitle: 'Recevez nos astuces et offres réservées', buttonBg: '#ec4899', bgColor: '#be185d' } },
      { type: 'socialLinks', config: { title: 'Inspirations beauté', bgColor: '#fdf2f8' } },
      { type: 'contactForm', config: { title: 'Prendre Rendez-Vous', showWhatsApp: true } },
    ],
  },
];

// ─── Récupérer un template par ID ─────────────────────────────────────────────
export function getTemplate(id) {
  return STORE_TEMPLATES.find(t => t.id === id) || null;
}

// ─── Convertir un template en modules Supabase ────────────────────────────────
export function templateToModules(template, storeId) {
  return template.blocks.map((block, index) => {
    const id = `block_${block.type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${index}`;
    return {
      id,
      store_id:  storeId,
      type:      block.type,
      label:     block.type,
      position:  index,
      is_active: true,
      config:    block.config || {},
      block_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}
