/**
 * Test Suite : Vérification de la fidélité de CompositionEngine
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

console.log('--- Démarrage des Tests de Fidélité CompositionEngine ---');

// 1. TEST 1 : Un ID personnalisé reste identique
{
  const inputStore = {
    id: 'store_test_1',
    name: 'Boutique Test',
    draft_config: {
      sections: [
        {
          id: 'sec_hero_k8s9d2a_3x91',
          type: 'HERO',
          variant: 'hero_002',
          config: { title: 'Titre Original' },
        },
      ],
    },
  };

  const composition = compositionEngine.compose(inputStore);
  assert(
    composition.sections[0]?.id === 'sec_hero_k8s9d2a_3x91',
    'TEST 1 : L\'ID personnalisé "sec_hero_k8s9d2a_3x91" reste strictement identique (reçu: ' + composition.sections[0]?.id + ')'
  );
}

// 2. TEST 2 : Une variante personnalisée reste identique
{
  const inputStore = {
    id: 'store_test_2',
    name: 'Boutique Test',
    draft_config: {
      sections: [
        {
          id: 'sec_hero_var',
          type: 'HERO',
          variant: 'hero_editorial',
          config: {},
        },
      ],
    },
  };

  const composition = compositionEngine.compose(inputStore);
  assert(
    composition.sections[0]?.variant === 'hero_editorial',
    'TEST 2 : La variante "hero_editorial" est conservée (reçu: ' + composition.sections[0]?.variant + ')'
  );
  assert(
    composition.sections[0]?.componentId === 'hero_editorial',
    'TEST 2b : componentId reflète la variante "hero_editorial" (reçu: ' + composition.sections[0]?.componentId + ')'
  );
}

// 3. TEST 3 : Une config personnalisée n\'est pas écrasée
{
  const inputStore = {
    id: 'store_test_3',
    name: 'Boutique Test',
    draft_config: {
      sections: [
        {
          id: 'sec_hero_config',
          type: 'HERO',
          config: {
            title: 'Titre Vendeur Spécial',
            ctaText: 'Acheter Tout De Suite',
            customProp: 42,
          },
        },
      ],
    },
  };

  const composition = compositionEngine.compose(inputStore);
  assert(
    composition.sections[0]?.config?.title === 'Titre Vendeur Spécial' &&
    composition.sections[0]?.config?.ctaText === 'Acheter Tout De Suite' &&
    composition.sections[0]?.config?.customProp === 42,
    'TEST 3 : La config personnalisée est préservée sans être écrasée par les valeurs par défaut'
  );
}

// 4. TEST 4 : Un content personnalisé n\'est pas écrasé
{
  const inputStore = {
    id: 'store_test_4',
    name: 'Boutique Test',
    draft_config: {
      sections: [
        {
          id: 'sec_hero_content',
          type: 'HERO',
          config: { title: 'Titre Config' },
          content: { title: 'Titre Content Prioritaire', subtitle: 'Sous-titre Content' },
        },
      ],
    },
  };

  const composition = compositionEngine.compose(inputStore);
  assert(
    composition.sections[0]?.config?.title === 'Titre Content Prioritaire' &&
    composition.sections[0]?.config?.subtitle === 'Sous-titre Content' &&
    composition.sections[0]?.content?.subtitle === 'Sous-titre Content',
    'TEST 4 : Le content personnalisé est prioritaire et conservé'
  );
}

// 5. TEST 5 : Les valeurs par défaut fonctionnent lorsqu\'une propriété est absente
{
  const inputStore = {
    id: 'store_test_5',
    name: 'Boutique Alpha',
    slogan: 'Le Meilleur Slogan',
    draft_config: {
      sections: [
        {
          id: 'sec_hero_default',
          type: 'HERO',
          config: { ctaText: 'Bouton Personnalisé' }, // title absent
        },
      ],
    },
  };

  const composition = compositionEngine.compose(inputStore);
  assert(
    composition.sections[0]?.config?.ctaText === 'Bouton Personnalisé' &&
    composition.sections[0]?.config?.title === 'Le Meilleur Slogan',
    'TEST 5 : La propriété absente reçoit la valeur par défaut du profil sans écraser les autres'
  );
}

// 6. TEST 6 : Une section sans produits ne disparaît pas du résultat de composition
{
  const inputStore = {
    id: 'store_test_6',
    name: 'Boutique Sans Produits',
    draft_config: {
      sections: [
        { id: 'sec_header_1', type: 'HEADER' },
        { id: 'sec_hero_1', type: 'HERO' },
        { id: 'sec_product_empty', type: 'PRODUCT' },
        { id: 'sec_footer_1', type: 'FOOTER' },
      ],
    },
  };

  const composition = compositionEngine.compose(inputStore, { products: [] });
  const prodSec = composition.sections.find(s => s.id === 'sec_product_empty');
  assert(
    Boolean(prodSec) && prodSec.isEmpty === true && prodSec.state === 'empty',
    'TEST 6 : La section PRODUCT vide est conservée et marquée isEmpty: true'
  );
}

// 7. TEST 7 : Plusieurs sections de même famille gardent leurs IDs respectifs
{
  const inputStore = {
    id: 'store_test_7',
    name: 'Boutique Multi Sections',
    draft_config: {
      sections: [
        { id: 'sec_hero_top', type: 'HERO', variant: 'hero_001', config: { title: 'Hero 1' } },
        { id: 'sec_hero_bottom', type: 'HERO', variant: 'hero_editorial', config: { title: 'Hero 2' } },
        { id: 'sec_prod_featured', type: 'PRODUCT', config: { title: 'Vedettes' } },
        { id: 'sec_prod_all', type: 'PRODUCT', config: { title: 'Tous les produits' } },
      ],
    },
  };

  const composition = compositionEngine.compose(inputStore);
  const ids = composition.sections.map(s => s.id);
  assert(
    ids.includes('sec_hero_top') &&
    ids.includes('sec_hero_bottom') &&
    ids.includes('sec_prod_featured') &&
    ids.includes('sec_prod_all') &&
    composition.sections.length === 4,
    'TEST 7 : Les 4 sections de même famille sont conservées avec leurs IDs distincts'
  );
}

// 8. TEST 8 : Une variante inexistante ne détruit pas toute la composition
{
  const inputStore = {
    id: 'store_test_8',
    name: 'Boutique Test',
    draft_config: {
      sections: [
        { id: 'sec_unknown', type: 'HERO', variant: 'hero_inexistant_999', config: { title: 'Test Fallback' } },
      ],
    },
  };

  const composition = compositionEngine.compose(inputStore);
  assert(
    composition.sections[0]?.id === 'sec_unknown' &&
    composition.sections[0]?.variant === 'hero_inexistant_999' &&
    composition.sections[0]?.config?.title === 'Test Fallback',
    'TEST 8 : La variante inexistante conserve sa définition sans crash'
  );
}

// 9. TEST 9 : Les appels existants sans sections explicites continuent de fonctionner
{
  const inputStore = {
    id: 'store_test_9',
    name: 'Boutique Automatique',
    business_type: 'product',
  };

  const composition = compositionEngine.compose(inputStore);
  assert(
    Array.isArray(composition.sections) && composition.sections.length > 0 &&
    composition.version === '2.0.0',
    'TEST 9 : Les appels existants sans draft_config génèrent la séquence par défaut'
  );
}

// 10. TEST 10 : Sérialisation JSON et structure complète
{
  const inputStore = {
    id: 'store_test_10',
    name: 'Boutique JSON',
    draft_config: {
      theme: { primaryColor: '#123456' },
      sections: [{ id: 'sec_1', type: 'HERO', config: { a: 1 } }],
    },
  };

  const composition = compositionEngine.compose(inputStore);
  const json = JSON.stringify(composition);
  const parsed = JSON.parse(json);
  assert(
    parsed.storeId === 'store_test_10' &&
    parsed.theme.tokens.primaryColor === '#123456' &&
    parsed.sections[0].id === 'sec_1',
    'TEST 10 : La composition est 100% sérialisable en JSON'
  );
}

console.log(`\n--- Résultat : ${passed} passés, ${failed} échoués ---`);
if (failed > 0) process.exit(1);
