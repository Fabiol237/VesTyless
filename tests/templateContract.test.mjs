/**
 * TEST SUITE : TemplateContract
 * ─────────────────────────────────────────────────────────────────────────────
 * Valide le respect du TemplateContract Vestin v2.0 :
 *  1. Template valide -> PASS
 *  2. Type inconnu / non enregistré -> FAIL
 *  3. Code exécutable (<script>, eval, function, =>, etc.) -> FAIL
 *  4. Éléments React/JSX arbitraires -> FAIL
 *  5. Injection CSS/Style et Handlers -> FAIL
 *  6. Fausses données commerciales (faux avis, faux prix) -> FAIL
 *  7. Thème incomplet (primary ou background manquant) -> FAIL
 */

import {
  validateTemplateContract,
  scanSecurityViolations,
  scanFakeDataViolations,
  validateTheme,
  validateSection,
  ALLOWED_COMPONENT_FAMILIES,
} from '../src/lib/template-library/TemplateContract.js';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('=== RUNNING TESTS: TemplateContract ===\n');

// ── 1. TEMPLATE VALIDE ────────────────────────────────────────────────────
const validTemplate = {
  id: 'resto_gastro_001',
  name: 'Gastronomique Moderne',
  description: 'Template pour restaurant étoilé ou bistronomie',
  business_type: 'restaurant',
  sub_sector: 'gastronomie',
  style_tags: ['minimal', 'luxe', 'chaleureux'],
  version: '1.0.0',
  status: 'published',
  theme: {
    colors: {
      primary: '#1c1c1e',
      secondary: '#a3855c',
      background: '#f9f6f0',
      text: '#1c1c1e',
    },
    typography: { fontFamily: 'Playfair Display' },
    spatial: { cardRadius: 'soft' },
  },
  sections: [
    { id: 'sec_header', type: 'HEADER', variant: 'header_001', order: 0, config: { isSticky: true } },
    { id: 'sec_hero', type: 'HERO', variant: 'hero_001', order: 1, config: { layout: 'fullscreen' } },
    { id: 'sec_products', type: 'PRODUCT', variant: 'product_001', order: 2, config: { columns: 2 } },
    { id: 'sec_footer', type: 'FOOTER', variant: 'footer_001', order: 3, config: {} },
  ],
};

const resValid = validateTemplateContract(validTemplate);
assert(resValid.valid === true, 'Template valide retourne valid = true');
assert(resValid.errors.length === 0, 'Template valide a 0 erreurs');
assert(resValid.security.safe === true, 'Template valide a un scan de sécurité sûr');

// ── 2. TYPE DE COMPOSANT INCONNU ──────────────────────────────────────────
const invalidTypeTemplate = {
  ...validTemplate,
  id: 'invalid_type_template',
  sections: [
    { id: 'sec_1', type: 'CRYPTO_MINER_BLOCK', variant: 'v1', order: 0 },
  ],
};
const resInvalidType = validateTemplateContract(invalidTypeTemplate);
assert(resInvalidType.valid === false, 'Template avec type de section inconnu retourne valid = false');
assert(resInvalidType.errors.some((e) => e.includes('CRYPTO_MINER_BLOCK')), 'Erreur mentionne le type non enregistré');

// ── 3. CODE EXÉCUTABLE (<script>, eval, function) ─────────────────────────
const scriptTemplate = {
  ...validTemplate,
  id: 'script_injection_template',
  name: '<script>alert("hacked")</script>',
};
const resScript = validateTemplateContract(scriptTemplate);
assert(resScript.valid === false, 'Template avec <script> retourne valid = false');
assert(resScript.security.safe === false, 'Sécurité détecte violation <script>');

const evalTemplate = {
  ...validTemplate,
  id: 'eval_injection_template',
  theme: {
    ...validTemplate.theme,
    colors: {
      ...validTemplate.theme.colors,
      primary: 'eval("window.stolen=1")',
    },
  },
};
const resEval = validateTemplateContract(evalTemplate);
assert(resEval.valid === false, 'Template avec eval() retourne valid = false');

// ── 4. CODE JSX ARBITRAIRE ────────────────────────────────────────────────
const jsxTemplate = {
  ...validTemplate,
  id: 'jsx_template',
  sections: [
    {
      id: 'sec_jsx',
      type: 'HERO',
      variant: 'default',
      order: 0,
      config: {
        customRender: '<CustomHeroComponent prop="danger" />',
      },
    },
  ],
};
const resJsx = validateTemplateContract(jsxTemplate);
assert(resJsx.valid === false, 'Template avec JSX arbitraire retourne valid = false');

// ── 5. EVENT HANDLERS ET INJECTION D'ATTRIBUTS ────────────────────────────
const onclickTemplate = {
  ...validTemplate,
  id: 'event_handler_template',
  sections: [
    {
      id: 'sec_hero',
      type: 'HERO',
      variant: 'default',
      order: 0,
      config: {
        onclick: 'alert(1)',
      },
    },
  ],
};
const resOnclick = validateTemplateContract(onclickTemplate);
assert(resOnclick.valid === false, 'Template avec event handler onclick retourne valid = false');

// ── 6. FAUSSES DONNÉES COMMERCIALES ───────────────────────────────────────
const fakeDataTemplate = {
  ...validTemplate,
  id: 'fake_data_template',
  sections: [
    {
      id: 'sec_reviews',
      type: 'TESTIMONIAL',
      variant: 'default',
      order: 0,
      config: {
        fakeRating: '5 étoiles (124 avis)',
      },
    },
  ],
};
const resFakeData = validateTemplateContract(fakeDataTemplate);
assert(resFakeData.valid === false, 'Template avec faux avis commercial retourne valid = false');
assert(resFakeData.fakeData.clean === false, 'Scan fakeData détecte violation');

// ── 7. THÈME INCOMPLET ────────────────────────────────────────────────────
const incompleteThemeTemplate = {
  ...validTemplate,
  id: 'incomplete_theme_template',
  theme: {
    colors: { primary: '#000000' }, // background manquant
  },
};
const resIncompleteTheme = validateTemplateContract(incompleteThemeTemplate);
assert(resIncompleteTheme.valid === false, 'Template sans couleur de fond retourne valid = false');

console.log(`\nResults: ${passed}/${total} tests passed.\n`);

if (passed !== total) {
  process.exit(1);
}
