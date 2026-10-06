/**
 * TEST SUITE : TemplateQualityGate (12 Dimensions)
 * ─────────────────────────────────────────────────────────────────────────────
 * Valide les 12 dimensions d'audit déterministe du Quality Gate :
 *  1. Structure
 *  2. Components
 *  3. Variants
 *  4. Contract JSON
 *  5. Security
 *  6. Responsive
 *  7. Mobile Quality
 *  8. Fake Data Policy
 *  9. Theme Consistency
 * 10. Canonical Renderer
 * 11. Business Type
 * 12. Composition Quality
 */

import { templateQualityGate } from '../src/lib/template-packages/TemplateQualityGate.js';

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

console.log('=== RUNNING TESTS: TemplateQualityGate ===\n');

// ── 1. AUDIT D'UN TEMPLATE VALIDE CONFORME ────────────────────────────────
const canonicalTemplate = {
  id: 'resto_gourmet_paris',
  name: 'Le Bistrot Gourmand',
  business_type: 'restaurant',
  sub_sector: 'gastronomie',
  style_tags: ['luxe', 'chaleureux'],
  version: '1.0.0',
  status: 'published',
  theme: {
    primaryColor: '#881337',
    secondaryColor: '#1c1917',
    accentColor: '#f59e0b',
    bgColor: '#fdfbf7',
    textColor: '#1c1917',
    font: 'Playfair Display',
  },
  sections: [
    { id: 'sec_header', type: 'HEADER', variant: 'header_001', order: 0, config: { isSticky: true } },
    { id: 'sec_hero', type: 'HERO', variant: 'hero_001', order: 1, config: { layout: 'fullscreen' } },
    { id: 'sec_categories', type: 'CATEGORY', variant: 'category_001', order: 2, config: { categories: ['Plats', 'Desserts', 'Boissons'] } },
    { id: 'sec_products', type: 'PRODUCT', variant: 'product_001', order: 3, config: { columns: 2 } },
    { id: 'sec_contact', type: 'CONTACT', variant: 'contact_001', order: 4, config: {} },
    { id: 'sec_footer', type: 'FOOTER', variant: 'footer_001', order: 5, config: {} },
  ],
};

const validReport = templateQualityGate.evaluateTemplate(canonicalTemplate);
assert(validReport.valid === true, 'Template valide passe le Quality Gate (valid = true)');
assert(validReport.score >= 80, `Score global élevé (${validReport.score} >= 80)`);
assert(validReport.criticalFailures.length === 0, 'Zéro échec critique');

// Vérification des 12 dimensions
const dims = validReport.dimensions;
assert(dims.structure === 100, `Dimension structure: ${dims.structure}`);
assert(dims.components === 100, `Dimension components: ${dims.components}`);
assert(dims.variants >= 70, `Dimension variants: ${dims.variants}`);
assert(dims.contractJson === 100, `Dimension contractJson: ${dims.contractJson}`);
assert(dims.security === 100, `Dimension security: ${dims.security}`);
assert(dims.responsive >= 80, `Dimension responsive: ${dims.responsive}`);
assert(dims.mobileQuality === 100, `Dimension mobileQuality: ${dims.mobileQuality}`);
assert(dims.fakeDataPolicy === 100, `Dimension fakeDataPolicy: ${dims.fakeDataPolicy}`);
assert(dims.themeConsistency === 100, `Dimension themeConsistency: ${dims.themeConsistency}`);
assert(dims.canonicalRenderer >= 60, `Dimension canonicalRenderer: ${dims.canonicalRenderer}`);
assert(dims.businessType === 100, `Dimension businessType: ${dims.businessType}`);
assert(dims.compositionQuality === 100, `Dimension compositionQuality: ${dims.compositionQuality}`);

// ── 2. DÉTECTION DE COMPOSANT INCONNU DANS COMPONENT REGISTRY ──────────────
const unknownCompTemplate = {
  ...canonicalTemplate,
  id: 'template_unknown_comp',
  sections: [
    { id: 'sec_1', type: 'NON_EXISTENT_FAMILY', variant: 'default', order: 0 },
  ],
};
const unknownReport = templateQualityGate.evaluateTemplate(unknownCompTemplate);
assert(unknownReport.valid === false, 'Template avec composant non répertorié échoue au Quality Gate');
assert(unknownReport.dimensions.components < 100, `Dimension components pénalisée (${unknownReport.dimensions.components})`);
assert(unknownReport.criticalFailures.some((f) => f.includes('NON_EXISTENT_FAMILY')), 'Échec critique signale le composant non enregistré');

// ── 3. DÉTECTION DE CODE EXÉCUTABLE / INJECTION ───────────────────────────
const maliciousTemplate = {
  ...canonicalTemplate,
  id: 'template_malicious',
  name: 'Attaque <script>window.pwned=true</script>',
};
const malReport = templateQualityGate.evaluateTemplate(maliciousTemplate);
assert(malReport.valid === false, 'Template malveillant échoue au Quality Gate');
assert(malReport.dimensions.security === 0, 'Dimension security = 0');
assert(malReport.score <= 45, `Score global plafonné à <= 45 (${malReport.score})`);

// ── 4. DÉTECTION DE FAUSSES DONNÉES COMMERCIALES ──────────────────────────
const fakeCommercialTemplate = {
  ...canonicalTemplate,
  id: 'template_fake_commercial',
  sections: [
    {
      id: 'sec_1',
      type: 'TESTIMONIAL',
      variant: 'default',
      order: 0,
      config: { reviewScore: '5 étoiles (124 avis)' },
    },
  ],
};
const fakeReport = templateQualityGate.evaluateTemplate(fakeCommercialTemplate);
assert(fakeReport.valid === false, 'Template avec fausses données commerciales échoue au Quality Gate');
assert(fakeReport.dimensions.fakeDataPolicy < 70, `Dimension fakeDataPolicy pénalisée (${fakeReport.dimensions.fakeDataPolicy})`);

// ── 5. DÉTECTION DE DOUBLONS DE COMPOSANTS SINGLETONS (HEADER) ────────────
const doubleHeaderTemplate = {
  ...canonicalTemplate,
  id: 'template_double_header',
  sections: [
    { id: 'sec_h1', type: 'HEADER', variant: 'header_001', order: 0 },
    { id: 'sec_h2', type: 'HEADER', variant: 'header_002', order: 1 },
    { id: 'sec_prod', type: 'PRODUCT', variant: 'product_001', order: 2 },
    { id: 'sec_f', type: 'FOOTER', variant: 'footer_001', order: 3 },
  ],
};
const doubleHeaderReport = templateQualityGate.evaluateTemplate(doubleHeaderTemplate);
assert(doubleHeaderReport.valid === false, 'Template avec double Header échoue au Quality Gate');
assert(doubleHeaderReport.dimensions.compositionQuality < 100, `Dimension compositionQuality pénalisée (${doubleHeaderReport.dimensions.compositionQuality})`);

// ── 6. AUDIT DE CATALOGUE COMPLET ─────────────────────────────────────────
const catalogueAudit = templateQualityGate.evaluateCatalogue([canonicalTemplate, unknownCompTemplate]);
assert(catalogueAudit.totalCount === 2, 'evaluateCatalogue audite 2 templates');
assert(catalogueAudit.passedCount === 1, 'evaluateCatalogue rapporte 1 succès et 1 échec');
assert(catalogueAudit.allPassed === false, 'allPassed est false car un template a échoué');

console.log(`\nResults: ${passed}/${total} tests passed.\n`);

if (passed !== total) {
  process.exit(1);
}
