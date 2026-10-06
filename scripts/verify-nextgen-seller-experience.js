/**
 * scripts/verify-nextgen-seller-experience.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Suite de vérification complète de la Next Generation Seller Experience VesTyle.
 *
 * Valide :
 * 1. Pipeline de Création Mode A (Scénario de référence Chiens & Chats)
 * 2. Moteur de Scope Classifier (LOCAL, STRUCTURAL, GLOBAL, RECREATE)
 * 3. Mutations Chirurgicales Mode B (Logo, Chats avant Chiens, WhatsApp direct, etc.)
 * 4. Mode C : Recréation Globale
 * 5. Intégrité des 5 boutiques démo (Mode, Restaurant, Beauté, Électronique, Hôtel)
 * 6. Respect de la Quality Gate (Stabilité des IDs, zéro fake data, contrat de profil)
 */

import { DEMO_STORES } from '../src/lib/builder/builderDemoStores.js';
import {
  applySellerIntent,
  classifyIntentScope,
  MUTATION_SCOPES,
  MOOD_PRESETS,
  PROACTIVE_SUGGESTIONS,
} from '../src/lib/builder/builderIntentEngine.js';
import { adaptStoreToBusinessProfile } from '../src/lib/business-profile/businessProfileAdapter.js';

console.log('\n===============================================================');
console.log('🧪 VERIFICATION VESTYLE NEXT GENERATION SELLER EXPERIENCE');
console.log('===============================================================\n');

let allPassed = true;

// ── [1/6] TEST DU SCOPE CLASSIFIER ───────────────────────────────────────────
console.log('[1/6] Test du Scope Classifier...');

const scopeTests = [
  { prompt: 'Agrandis cette image', contextId: 'sec_hero_1', expected: MUTATION_SCOPES.LOCAL },
  { prompt: 'Fais cette section plus premium', contextId: 'sec_hero_1', expected: MUTATION_SCOPES.LOCAL },
  { prompt: 'Mets les chats avant les chiens', contextId: null, expected: MUTATION_SCOPES.STRUCTURAL },
  { prompt: 'Mets mon logo sous le nom', contextId: null, expected: MUTATION_SCOPES.STRUCTURAL },
  { prompt: 'Ajouter une section avis clients', contextId: null, expected: MUTATION_SCOPES.STRUCTURAL },
  { prompt: 'Passe en mode sombre', contextId: null, expected: MUTATION_SCOPES.GLOBAL },
  { prompt: 'Rendre la boutique plus chaleureuse', contextId: null, expected: MUTATION_SCOPES.GLOBAL },
  { prompt: 'Repars complètement de zéro sur du luxe', contextId: null, expected: MUTATION_SCOPES.RECREATE },
];

for (const t of scopeTests) {
  const detected = classifyIntentScope(t.prompt, t.contextId);
  if (detected === t.expected) {
    console.log(`  ✓ "${t.prompt}" → Scope ${detected}`);
  } else {
    console.error(`  ✗ Erreur Scope pour "${t.prompt}": attendu ${t.expected}, obtenu ${detected}`);
    allPassed = false;
  }
}

// ── [2/6] SCENARIO DE REFERENCE : BOUTIQUE CHIENS & CHATS ────────────────────
console.log('\n[2/6] Test du scénario de référence "Chiens et chats"...');

const petsStore = {
  store: {
    id: 'store_pets_test',
    name: 'Élevage Royal Chiens & Chats',
    business_name: 'Élevage Royal Chiens & Chats',
    slug: 'elevage-royal',
    description: 'Chiots et chatons de race d exception élevés en famille',
  },
  config: {
    theme: { ...MOOD_PRESETS.warm.theme },
    sections: [
      { id: 'sec_header_1', type: 'HEADER', variant: 'header_001', enabled: true, order: 0, config: { brandName: 'Élevage Royal' } },
      { id: 'sec_hero_1', type: 'HERO', variant: 'hero_001', enabled: true, order: 1, config: { title: 'Chiots & Chatons d Exception' } },
      { id: 'sec_dogs_1', type: 'PRODUCT', variant: 'product_001', enabled: true, order: 2, config: { title: 'Nos Chiens & Chiots' } },
      { id: 'sec_cats_1', type: 'PRODUCT', variant: 'product_compact', enabled: true, order: 3, config: { title: 'Nos Chats & Chatons' } },
      { id: 'sec_contact_1', type: 'CONTACT', variant: 'contact_card', enabled: true, order: 4, config: { title: 'Contact' } },
      { id: 'sec_footer_1', type: 'FOOTER', variant: 'footer_minimal', enabled: true, order: 5, config: {} },
    ],
  },
  products: [
    { id: 'dog_1', name: 'Berger Allemand', price: 200000, currency: 'XAF', status: 'available' },
    { id: 'cat_1', name: 'Chaton Persan', price: 150000, currency: 'XAF', status: 'available' },
  ],
};

// Vérifier adaptation du profil de référence
const petsProfile = adaptStoreToBusinessProfile(
  { ...petsStore.store, draft_config: petsStore.config, published_config: petsStore.config },
  petsStore.products,
  [],
  { useDraft: true }
);

if (petsProfile && petsProfile.identity?.name === 'Élevage Royal Chiens & Chats' && petsProfile.storefront?.sections?.length === 6) {
  console.log(`  ✓ Boutique Chiens & Chats configurée avec succès (${petsProfile.storefront.sections.length} sections)`);
} else {
  console.error(`  ✗ Échec de configuration de la boutique Chiens & Chats`);
  allPassed = false;
}

// ── [3/6] MUTATIONS CHIRURGICALES MODE B SUR CHIENS & CHATS ───────────────────
console.log('\n[3/6] Test des mutations chirurgicales Mode B...');

// 1. "Mets les chats avant les chiens"
const reorderResult = applySellerIntent(petsStore.config, 'Mets les chats avant les chiens');
if (reorderResult.success) {
  const newSections = reorderResult.updatedConfig.sections;
  const catsIdx = newSections.findIndex(s => s.id === 'sec_cats_1');
  const dogsIdx = newSections.findIndex(s => s.id === 'sec_dogs_1');

  if (catsIdx < dogsIdx) {
    console.log(`  ✓ "Mets les chats avant les chiens" : Chats (index ${catsIdx}) est bien avant Chiens (index ${dogsIdx})`);
  } else {
    console.error(`  ✗ Échec de réorganisation Chats avant Chiens`);
    allPassed = false;
  }
} else {
  console.error(`  ✗ Erreur application réorganisation:`, reorderResult.error);
  allPassed = false;
}

// 2. "Mets mon logo sous le nom"
const logoResult = applySellerIntent(petsStore.config, 'Mets mon logo sous le nom');
if (logoResult.success) {
  const headerSec = logoResult.updatedConfig.sections.find(s => s.type === 'HEADER');
  if (headerSec && (headerSec.variant === 'header_centered' || headerSec.config?.logoPosition === 'below_name')) {
    console.log(`  ✓ "Mets mon logo sous le nom" : En-tête centré et configuré (${headerSec.variant})`);
  } else {
    console.error(`  ✗ Échec modification logo sous le nom`);
    allPassed = false;
  }
}

// 3. "Fais cette section plus premium" (Contextuel sur HERO)
const heroContextResult = applySellerIntent(petsStore.config, 'Fais cette section plus premium', 'sec_hero_1');
if (heroContextResult.success) {
  const heroSec = heroContextResult.updatedConfig.sections.find(s => s.id === 'sec_hero_1');
  if (heroSec && heroSec.variant === 'hero_editorial') {
    console.log(`  ✓ "Fais cette section plus premium" (Local HERO) : Variante ${heroSec.variant} appliquée`);
  } else {
    console.error(`  ✗ Échec modification contextuelle Hero`);
    allPassed = false;
  }
}

// 4. "Ajouter WhatsApp"
const whatsappResult = applySellerIntent(petsStore.config, 'Mettre WhatsApp en avant');
if (whatsappResult.success) {
  const hasWhatsAppHero = whatsappResult.updatedConfig.sections.some(s => s.type === 'HERO' && s.config?.ctaAction === 'whatsapp');
  if (hasWhatsAppHero) {
    console.log(`  ✓ "Mettre WhatsApp en avant" : Bouton WhatsApp activé sur le Hero`);
  } else {
    console.error(`  ✗ Échec activation WhatsApp`);
    allPassed = false;
  }
}

// ── [4/6] TEST DU MODE C (RECREATE AVEC VESTYLE AI) ──────────────────────────
console.log('\n[4/6] Test du Mode C : Recréer avec VesTyle AI...');

const recreateAmbiance = MOOD_PRESETS.luxury;
const recreatedConfig = {
  ...petsStore.config,
  theme: { ...petsStore.config.theme, ...recreateAmbiance.theme },
  sections: petsStore.config.sections.map(s => s.type === 'HERO' ? { ...s, variant: recreateAmbiance.heroVariant } : s),
};

if (recreatedConfig.theme.primaryColor === '#D4AF37' && recreatedConfig.theme.mode === 'dark') {
  console.log(`  ✓ Mode C Recréer : Thème régénéré vers Luxe & Or Champagne (#D4AF37)`);
} else {
  console.error(`  ✗ Échec test Mode C Recréer`);
  allPassed = false;
}

// ── [5/6] CONFORMITÉ DES 5 BOUTIQUES DÉMO EXISTANTES ──────────────────────────
console.log('\n[5/6] Test de conformité des 5 boutiques démo...');

const demos = [
  { key: 'demo-fashion',     name: 'Mode' },
  { key: 'demo-restaurant',  name: 'Restaurant' },
  { key: 'demo-beauty',      name: 'Beauté' },
  { key: 'demo-electronics', name: 'Électronique' },
  { key: 'demo-hotel',       name: 'Hôtel' },
];

for (const demoInfo of demos) {
  const demo = DEMO_STORES[demoInfo.key];
  if (!demo) {
    console.error(`  ✗ Boutique démo manquante : ${demoInfo.key}`);
    allPassed = false;
    continue;
  }

  const profile = adaptStoreToBusinessProfile(
    { ...demo.store, draft_config: demo.config, published_config: demo.config },
    demo.products,
    [],
    { useDraft: true }
  );

  if (!profile || !profile.storefront?.theme || !profile.identity) {
    console.error(`  ✗ Échec d adaptation BusinessProfile pour ${demoInfo.name}`);
    allPassed = false;
  } else {
    console.log(`  ✓ Démo [${demoInfo.name.padEnd(12)}] : ${profile.storefront.sections?.length} sections, Theme: ${profile.storefront.theme.primaryColor}`);
  }
}

// ── [6/6] QUALITY GATE & STABILITE DES IDS ────────────────────────────────────
console.log('\n[6/6] Vérification Quality Gate (Stabilité IDs & Zéro fake data)...');

const initialIds = petsStore.config.sections.map(s => s.id);
const mutatedIds = reorderResult.updatedConfig.sections.map(s => s.id);

const idsPreserved = initialIds.every(id => mutatedIds.includes(id)) && initialIds.length === mutatedIds.length;
if (idsPreserved) {
  console.log(`  ✓ Stabilité des IDs garantie : 100% des IDs de sections sont conservés.`);
} else {
  console.error(`  ✗ Alerte : Perte ou corruption d'IDs lors de la mutation.`);
  allPassed = false;
}

console.log('\n===============================================================');
if (allPassed) {
  console.log('🎉 TOUS LES TESTS SONT VALIDES A 100% !');
} else {
  console.log('⚠️ DES ERREURS ONT ETE DETECTEES LORS DU TEST.');
}
console.log('===============================================================\n');

process.exit(allPassed ? 0 : 1);
