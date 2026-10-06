/**
 * Test Suite Phase 2 : Validation Visuelle & Composition
 * ───────────────────────────────────────────────────────
 * Vérifie :
 * 1. Composition en mode Light Theme (mode='light', isDark=false, bgColor='#FFFFFF')
 * 2. Composition en mode Dark Theme (mode='dark', isDark=true, bgColor='#0B0F19')
 * 3. Composition multi-variantes (Hero Editorial, Split, Cinematic, Commerce)
 * 4. Gestion des sections vides (0 produits, 0 services)
 * 5. Préservation des tokens de design et polices personnalisées
 */

import { compositionEngine } from '../src/lib/composition-engine/CompositionEngine.js';

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

console.log('--- Démarrage des Tests de Composition Visuelle Phase 2 ---');

// 1. TEST 1 : Boutique Thème Clair
{
  const lightStore = {
    id: 'store_light_mode',
    name: 'Maison Blanche Couture',
    storefront: {
      theme: {
        mode: 'light',
        primaryColor: '#059669',
        accentColor: '#10B981',
        bgColor: '#FFFFFF',
        textColor: '#0F172A',
        font: 'Outfit',
      },
    },
    draft_config: {
      sections: [
        { id: 'h1', type: 'HEADER', variant: 'standard_nav' },
        { id: 'hero1', type: 'HERO', variant: 'hero_editorial', config: { title: 'L’Art de l’Élégance' } },
        { id: 'p1', type: 'PRODUCT', variant: 'grid_2_card' },
      ],
    },
  };

  const comp = compositionEngine.compose(lightStore);
  assert(comp.theme.mode === 'light', `Le mode du thème est bien "light" (reçu: ${comp.theme.mode})`);
  assert(comp.theme.tokens.bgColor === '#FFFFFF', `Le bgColor est "#FFFFFF" (reçu: ${comp.theme.tokens.bgColor})`);
  assert(comp.theme.tokens.textColor === '#0F172A', `Le textColor est "#0F172A" (reçu: ${comp.theme.tokens.textColor})`);
  assert(comp.theme.tokens.primaryColor === '#059669', `Le primaryColor est "#059669" (reçu: ${comp.theme.tokens.primaryColor})`);
  assert(comp.theme.tokens.font === 'Outfit', `La police personnalisée "Outfit" est transmise (reçu: ${comp.theme.tokens.font})`);
  assert(comp.sections[1].variant === 'hero_editorial', `La variante hero_editorial est bien préservée`);
}

// 2. TEST 2 : Boutique Thème Sombre
{
  const darkStore = {
    id: 'store_dark_mode',
    name: 'Midnight Studio',
    storefront: {
      theme: {
        mode: 'dark',
        primaryColor: '#8B5CF6',
        accentColor: '#A78BFA',
        bgColor: '#0B0F19',
        textColor: '#F8FAFC',
      },
    },
    draft_config: {
      sections: [
        { id: 'h1', type: 'HEADER', variant: 'header_centered' },
        { id: 'hero1', type: 'HERO', variant: 'hero_cinematic' },
        { id: 'p1', type: 'PRODUCT', variant: 'product_featured' },
      ],
    },
  };

  const comp = compositionEngine.compose(darkStore);
  assert(comp.theme.mode === 'dark', `Le mode du thème est bien "dark" (reçu: ${comp.theme.mode})`);
  assert(comp.theme.tokens.bgColor === '#0B0F19', `Le bgColor est "#0B0F19" (reçu: ${comp.theme.tokens.bgColor})`);
  assert(comp.theme.tokens.textColor === '#F8FAFC', `Le textColor est "#F8FAFC" (reçu: ${comp.theme.tokens.textColor})`);
  assert(comp.sections[1].variant === 'hero_cinematic', `La variante hero_cinematic est préservée`);
  assert(comp.sections[2].variant === 'product_featured', `La variante product_featured est préservée`);
}

// 3. TEST 3 : Diversité des variantes de Hero
{
  const heroVariants = ['hero_001', 'hero_editorial', 'hero_split', 'hero_cinematic', 'hero_commerce', 'hero_fullscreen', 'hero_media_left'];
  const testStore = {
    id: 'store_hero_variants',
    draft_config: {
      sections: heroVariants.map((v, i) => ({
        id: `hero_${i}`,
        type: 'HERO',
        variant: v,
        componentId: v,
        config: { title: `Titre ${v}` },
      })),
    },
  };

  const comp = compositionEngine.compose(testStore);
  assert(comp.sections.length === heroVariants.length, `Les ${heroVariants.length} variantes de Hero sont toutes composées`);
  heroVariants.forEach((v, i) => {
    assert(comp.sections[i].variant === v, `Section index ${i} a conservé la variante "${v}"`);
    assert(comp.sections[i].componentId === v, `Section index ${i} a componentId "${v}"`);
  });
}

// 4. TEST 4 : Empty states détection
{
  const emptyStore = {
    id: 'store_empty_catalogs',
    catalog: { products: [], services: [], categories: [] },
    draft_config: {
      sections: [
        { id: 'sec_p', type: 'PRODUCT', variant: 'grid_2_card' },
        { id: 'sec_s', type: 'SERVICE', variant: 'service_grid' },
        { id: 'sec_c', type: 'CATEGORY', variant: 'category_grid' },
      ],
    },
  };

  const comp = compositionEngine.compose(emptyStore);
  assert(comp.sections[0].isEmpty === true, `La section PRODUCT avec 0 articles est marquée isEmpty: true`);
  assert(comp.sections[1].isEmpty === true, `La section SERVICE avec 0 services est marquée isEmpty: true`);
  assert(comp.sections[2].isEmpty === true, `La section CATEGORY avec 0 catégories est marquée isEmpty: true`);
}

console.log(`\n--- Résultat Phase 2 : ${passed} passés, ${failed} échoués ---`);
process.exit(failed > 0 ? 1 : 0);
