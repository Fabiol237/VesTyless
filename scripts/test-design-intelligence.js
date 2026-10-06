/**
 * VesTyle Design Intelligence — Test de Validation Réelle (Phase 7)
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Crée 10 boutiques d'apprentissage couvrant plusieurs industries.
 * 2. Extrait et persiste les patterns dans le DesignKnowledgeStore.
 * 3. Teste le Retrieval et la Génération de DesignProfile sur 5 NOUVEAUX profils.
 * 4. Valide la différenciation réelle et l'absence de profils uniformisés.
 */

import {
  DesignPatternExtractor,
  designKnowledgeStore,
  designPatternRetriever,
  DesignProfileBuilder,
} from '../src/lib/design-intelligence/index.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failed++;
  }
}

console.log('================================================================');
console.log('TEST SUITE : BOUCLE D’INTELLIGENCE DESIGN VESTYLE (V1)');
console.log('================================================================\n');

// ── 1. JEU DE 10 BOUTIQUES D'APPRENTISSAGE ──────────────────────────────────
const TRAINING_STORES = [
  {
    id: 'learn_fashion_haute_couture',
    industry: 'fashion',
    businessType: 'product',
    positioning: 'luxury',
    audience: 'women',
    theme: { mode: 'light', font: 'Playfair Display', primaryColor: '#78350F', spatial: { cardRadius: 'sharp' } },
    sections: [
      { type: 'HEADER', variant: 'header_centered' },
      { type: 'HERO', variant: 'hero_editorial' },
      { type: 'CATEGORY', variant: 'category_cards' },
      { type: 'PRODUCT', variant: 'grid_2_card' },
      { type: 'PRODUCT', variant: 'product_featured' },
      { type: 'FOOTER', variant: 'footer_001' },
    ],
  },
  {
    id: 'learn_fashion_streetwear',
    industry: 'fashion',
    businessType: 'product',
    positioning: 'express',
    audience: 'youth',
    theme: { mode: 'dark', font: 'Outfit', primaryColor: '#E11D48', spatial: { cardRadius: 'smooth' } },
    sections: [
      { type: 'HEADER', variant: 'header_001' },
      { type: 'HERO', variant: 'hero_commerce' },
      { type: 'CATEGORY', variant: 'category_001' },
      { type: 'PRODUCT', variant: 'grid_2_card' },
      { type: 'PROMOTION', variant: 'promotion_card' },
      { type: 'FOOTER', variant: 'footer_001' },
    ],
  },
  {
    id: 'learn_restaurant_gourmet',
    industry: 'restaurant',
    businessType: 'restaurant',
    positioning: 'premium',
    audience: 'general',
    theme: { mode: 'dark', font: 'Outfit', primaryColor: '#EA580C', spatial: { cardRadius: 'pill' } },
    sections: [
      { type: 'HEADER', variant: 'header_001' },
      { type: 'PROMOTION', variant: 'promotion_001' },
      { type: 'HERO', variant: 'hero_commerce' },
      { type: 'CATEGORY', variant: 'category_001' },
      { type: 'PRODUCT', variant: 'grid_2_card' },
      { type: 'CONTACT', variant: 'contact_card' },
      { type: 'FOOTER', variant: 'footer_001' },
    ],
  },
  {
    id: 'learn_fastfood_snack',
    industry: 'restaurant',
    businessType: 'restaurant',
    positioning: 'budget',
    audience: 'youth',
    theme: { mode: 'light', font: 'Inter', primaryColor: '#DC2626', spatial: { cardRadius: 'pill' } },
    sections: [
      { type: 'HEADER', variant: 'header_001' },
      { type: 'HERO', variant: 'hero_commerce' },
      { type: 'PRODUCT', variant: 'grid_2_card' },
      { type: 'CONTACT', variant: 'contact_card' },
      { type: 'FOOTER', variant: 'footer_001' },
    ],
  },
  {
    id: 'learn_beauty_spa',
    industry: 'beauty',
    businessType: 'service',
    positioning: 'premium',
    audience: 'women',
    theme: { mode: 'light', font: 'Plus Jakarta Sans', primaryColor: '#C026D3', spatial: { cardRadius: 'smooth' } },
    sections: [
      { type: 'HEADER', variant: 'header_centered' },
      { type: 'HERO', variant: 'hero_split' },
      { type: 'SERVICE', variant: 'service_featured' },
      { type: 'SERVICE', variant: 'service_grid' },
      { type: 'GALLERY', variant: 'gallery_masonry' },
      { type: 'CONTACT', variant: 'contact_card' },
      { type: 'FOOTER', variant: 'footer_001' },
    ],
  },
  {
    id: 'learn_barbershop_grooming',
    industry: 'beauty',
    businessType: 'service',
    positioning: 'accessible',
    audience: 'men',
    theme: { mode: 'dark', font: 'Inter', primaryColor: '#D97706', spatial: { cardRadius: 'sharp' } },
    sections: [
      { type: 'HEADER', variant: 'header_001' },
      { type: 'HERO', variant: 'hero_split' },
      { type: 'SERVICE', variant: 'service_001' },
      { type: 'GALLERY', variant: 'gallery_masonry' },
      { type: 'CONTACT', variant: 'contact_card' },
      { type: 'FOOTER', variant: 'footer_001' },
    ],
  },
  {
    id: 'learn_electronics_hightech',
    industry: 'electronics',
    businessType: 'product',
    positioning: 'technical',
    audience: 'professionals',
    theme: { mode: 'dark', font: 'Inter', primaryColor: '#2563EB', spatial: { cardRadius: 'smooth' } },
    sections: [
      { type: 'HEADER', variant: 'header_001' },
      { type: 'HERO', variant: 'hero_split' },
      { type: 'CATEGORY', variant: 'category_grid' },
      { type: 'PRODUCT', variant: 'grid_2_card' },
      { type: 'PRODUCT', variant: 'product_compact' },
      { type: 'PROMOTION', variant: 'promotion_card' },
      { type: 'FOOTER', variant: 'footer_001' },
    ],
  },
  {
    id: 'learn_home_appliances',
    industry: 'electronics',
    businessType: 'product',
    positioning: 'accessible',
    audience: 'families',
    theme: { mode: 'light', font: 'Inter', primaryColor: '#0284C7', spatial: { cardRadius: 'smooth' } },
    sections: [
      { type: 'HEADER', variant: 'header_001' },
      { type: 'HERO', variant: 'hero_001' },
      { type: 'CATEGORY', variant: 'category_001' },
      { type: 'PRODUCT', variant: 'grid_2_card' },
      { type: 'CONTACT', variant: 'contact_card' },
      { type: 'FOOTER', variant: 'footer_001' },
    ],
  },
  {
    id: 'learn_hotel_resort_luxury',
    industry: 'hotel',
    businessType: 'hospitality',
    positioning: 'luxury',
    audience: 'general',
    theme: { mode: 'light', font: 'Playfair Display', primaryColor: '#059669', spatial: { cardRadius: 'pill' } },
    sections: [
      { type: 'HEADER', variant: 'header_centered' },
      { type: 'HERO', variant: 'hero_fullscreen' },
      { type: 'SERVICE', variant: 'service_featured' },
      { type: 'SERVICE', variant: 'service_001' },
      { type: 'GALLERY', variant: 'gallery_masonry' },
      { type: 'CONTACT', variant: 'contact_card' },
      { type: 'FOOTER', variant: 'footer_001' },
    ],
  },
  {
    id: 'learn_hotel_urban_boutique',
    industry: 'hotel',
    businessType: 'hospitality',
    positioning: 'premium',
    audience: 'professionals',
    theme: { mode: 'dark', font: 'Inter', primaryColor: '#4F46E5', spatial: { cardRadius: 'smooth' } },
    sections: [
      { type: 'HEADER', variant: 'header_centered' },
      { type: 'HERO', variant: 'hero_cinematic' },
      { type: 'SERVICE', variant: 'service_featured' },
      { type: 'GALLERY', variant: 'gallery_masonry' },
      { type: 'CONTACT', variant: 'contact_card' },
      { type: 'FOOTER', variant: 'footer_001' },
    ],
  },
];

// ── 2. EXTRACTION ET PERSISTANCE DANS LE KNOWLEDGE STORE ────────────────────
console.log('--- Phase 1 & 2 : Extraction et Stockage des Patterns ---');
designKnowledgeStore.clear();

let totalExtracted = 0;
TRAINING_STORES.forEach((store) => {
  const result = DesignPatternExtractor.extractPatterns(store);
  result.patterns.forEach((p) => {
    designKnowledgeStore.savePattern(p);
    totalExtracted++;
  });
});

assert(totalExtracted >= 10, `${totalExtracted} patterns extraits avec succès`);
assert(designKnowledgeStore.count() > 0, `KnowledgeStore contient ${designKnowledgeStore.count()} patterns consolidés`);

// ── 3. TEST DE RETRIEVAL ET GÉNÉRATION SUR 5 PROFILS NOUVEAUX (INÉDITS) ─────
console.log('\n--- Phase 3, 4 & 5 : Retrieval & Génération pour 5 Profils Inédits ---');

const NEW_TEST_PROFILES = [
  {
    num: 1,
    title: 'Atelier Kente Couture',
    input: {
      industry: 'fashion',
      businessType: 'product',
      positioning: 'luxury',
      audience: 'women',
      name: 'Atelier Kente Couture',
      description: 'Haute couture africaine et tissages nobles sur mesure.',
    },
  },
  {
    num: 2,
    title: 'Bistrot Douala Grill & Tapas',
    input: {
      industry: 'restaurant',
      businessType: 'restaurant',
      positioning: 'premium',
      audience: 'general',
      name: 'Bistrot Douala Grill & Tapas',
      description: 'Grillades au feu de bois et tapas gourmets.',
    },
  },
  {
    num: 3,
    title: 'L’Institut Éclat & Bien-Être',
    input: {
      industry: 'beauty',
      businessType: 'service',
      positioning: 'premium',
      audience: 'women',
      name: 'L’Institut Éclat & Bien-Être',
      description: 'Soins du visage bio et massages relaxants aux huiles précieuses.',
    },
  },
  {
    num: 4,
    title: 'GamerHub Cameroun',
    input: {
      industry: 'electronics',
      businessType: 'product',
      positioning: 'technical',
      audience: 'youth',
      name: 'GamerHub Cameroun',
      description: 'PC Gaming sur-mesure, cartes graphiques et périphériques pro.',
    },
  },
  {
    num: 5,
    title: 'Éco-Lodge Mont Fébé',
    input: {
      industry: 'hotel',
      businessType: 'hospitality',
      positioning: 'luxury',
      audience: 'general',
      name: 'Éco-Lodge Mont Fébé',
      description: 'Suites en bois naturel nichées au cœur de la nature avec vue panoramique.',
    },
  },
];

const generatedProfiles = [];

NEW_TEST_PROFILES.forEach(({ num, title, input }) => {
  const query = {
    industry: input.industry,
    businessType: input.businessType,
    positioning: input.positioning,
    audience: input.audience,
  };

  const retrieved = designPatternRetriever.retrievePatterns(query, { limit: 3 });
  assert(retrieved.length > 0, `Retrieval réussi pour "${title}" (${retrieved.length} patterns pertinents)`);
  assert(
    retrieved[0].pattern.industry === input.industry,
    `Top pattern correspond exactement à l'industrie "${input.industry}" (Score: ${retrieved[0].score})`
  );

  const designProfile = DesignProfileBuilder.buildDesignProfile(input, retrieved);
  generatedProfiles.push({ title, input, retrieved, designProfile });
});

// ── 4. VÉRIFICATION DE LA DIVERSITÉ DES PROFILS ─────────────────────────────
console.log('\n--- Phase 6 : Vérification de la Diversité des Directions ---');

const fonts = new Set(generatedProfiles.map((p) => p.designProfile.themeTokens.font));
const heroVariants = new Set(generatedProfiles.map((p) => p.designProfile.heroStrategy.variant));
const directions = new Set(generatedProfiles.map((p) => p.designProfile.designDirection));
const colors = new Set(generatedProfiles.map((p) => p.designProfile.themeTokens.primaryColor));

assert(fonts.size >= 3, `Diversité typographique constatée : ${fonts.size} polices distinctes (${Array.from(fonts).join(', ')})`);
assert(heroVariants.size >= 3, `Diversité des variantes Hero constatée : ${heroVariants.size} variantes (${Array.from(heroVariants).join(', ')})`);
assert(directions.size === 5, `Chaque boutique a une direction design unique (5/5) : ${Array.from(directions).join(', ')}`);
assert(colors.size === 5, `Chaque boutique possède une couleur primaire distincte (5/5)`);

// ── 5. RAPPORT DÉTAILLÉ DES 5 EXEMPLES ───────────────────────────────────────
console.log('\n================================================================');
console.log('5 EXEMPLES DÉTAILLÉS : INPUT → RETRIEVAL → DESIGN PROFILE → SECTIONS');
console.log('================================================================\n');

generatedProfiles.forEach(({ title, input, retrieved, designProfile }) => {
  console.log('────────────────────────────────────────────────────────────────');
  console.log(`📌 EXEMPLE : ${title.toUpperCase()}`);
  console.log('1. INPUT VENDEUR :');
  console.log(`   • Industrie    : ${input.industry}`);
  console.log(`   • Type Métier  : ${input.businessType}`);
  console.log(`   • Segment      : ${input.positioning}`);
  console.log(`   • Audience     : ${input.audience}`);
  console.log(`   • Description  : ${input.description}`);

  console.log('\n2. PATTERNS RÉCUPÉRÉS :');
  retrieved.forEach((r, idx) => {
    console.log(`   [${idx + 1}] ID: "${r.pattern.id}" | Score: ${r.score} | Raison: ${r.matchReasons.join(', ')}`);
  });

  console.log('\n3. DESIGN PROFILE GÉNÉRÉ :');
  console.log(`   • Direction     : ${designProfile.designDirection}`);
  console.log(`   • Mode Thème    : ${designProfile.themeTokens.mode.toUpperCase()}`);
  console.log(`   • Couleur Prim. : ${designProfile.themeTokens.primaryColor}`);
  console.log(`   • Typographie   : ${designProfile.themeTokens.font}`);
  console.log(`   • Spacing       : ${designProfile.themeTokens.spacing}`);
  console.log(`   • Border Radius : ${designProfile.themeTokens.cardRadius}`);
  console.log(`   • Image Ratio   : ${designProfile.productStrategy.imageRatio}`);
  console.log(`   • Hero Strategy : variante "${designProfile.heroStrategy.variant}" (scale: ${designProfile.heroStrategy.headlineScale})`);

  console.log('\n4. SECTION ORDERING :');
  const sectionStr = designProfile.sectionOrdering
    .map((s, i) => `${i + 1}. ${s.family} (${s.variant})`)
    .join('  →  ');
  console.log(`   ${sectionStr}`);
  console.log('\n');
});

console.log('================================================================');
console.log('BILAN QUALITÉ DESIGN INTELLIGENCE V1 :');
console.log(`• Tests Réussis : ${passed}`);
console.log(`• Tests Échoués : ${failed}`);
console.log('================================================================');

process.exit(failed > 0 ? 1 : 0);
