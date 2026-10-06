/**
 * TEST SUITE : Template -> Renderer End-to-End Integration
 * ─────────────────────────────────────────────────────────────────────────────
 * Valide le pipeline complet de Master 2 :
 *   TEMPLATE DÉCLARATIF
 *          ↓
 *   TemplateContract (validation syntaxique et sécurité)
 *          ↓
 *   TemplateQualityGate (audit 12 dimensions)
 *          ↓
 *   TemplateLibraryService (conversion en draft_config conforme)
 *          ↓
 *   adaptStoreToBusinessProfile (adaptation canonique)
 *          ↓
 *   CompositionEngine (décision purement déclarative JSON)
 *          ↓
 *   ComponentRegistry (résolution des renderers réels pour Header, Hero, Product, Service, Gallery, Contact, Footer)
 *          ↓
 *   Validation de compatibilité UniversalStorefrontRenderer
 */

import { validateTemplateContract } from '../src/lib/template-library/TemplateContract.js';
import { templateQualityGate } from '../src/lib/template-packages/TemplateQualityGate.js';
import { templateLibraryService } from '../src/lib/template-library/TemplateLibraryService.js';
import { adaptStoreToBusinessProfile } from '../src/lib/business-profile/businessProfileAdapter.js';
import { compositionEngine } from '../src/lib/composition-engine/CompositionEngine.js';
import { ComponentRegistry, COMPONENT_FAMILIES } from '../src/lib/component-registry/ComponentRegistry.js';

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

console.log('=== RUNNING TESTS: Template -> UniversalStorefrontRenderer Integration ===\n');

// ── 0. ENREGISTREMENT DES COMPOSANTS CANONIQUES DANS LE REGISTRY ──────────
// Enregistre les 7 familles fondamentales pour l'environnement de test Node
const CANONICAL_TEST_COMPONENTS = [
  { id: 'header_001', type: 'HEADER', variant: 'header_001', renderer: (props) => ({ type: 'RENDERED_HEADER', props }) },
  { id: 'hero_001', type: 'HERO', variant: 'hero_001', renderer: (props) => ({ type: 'RENDERED_HERO', props }) },
  { id: 'product_001', type: 'PRODUCT', variant: 'product_001', renderer: (props) => ({ type: 'RENDERED_PRODUCT', props }) },
  { id: 'service_001', type: 'SERVICE', variant: 'service_001', renderer: (props) => ({ type: 'RENDERED_SERVICE', props }) },
  { id: 'gallery_001', type: 'GALLERY', variant: 'gallery_001', renderer: (props) => ({ type: 'RENDERED_GALLERY', props }) },
  { id: 'contact_001', type: 'CONTACT', variant: 'contact_001', renderer: (props) => ({ type: 'RENDERED_CONTACT', props }) },
  { id: 'footer_001', type: 'FOOTER', variant: 'footer_001', renderer: (props) => ({ type: 'RENDERED_FOOTER', props }) },
];

for (const comp of CANONICAL_TEST_COMPONENTS) {
  ComponentRegistry.register(comp);
}

// ── 1. DÉFINITION D'UN TEMPLATE MULTI-FAMILLES CANONIQUE ───────────────────
// Couvre : Header, Hero, Product, Service, Gallery, Contact, Footer
const multiFamilyTemplate = {
  id: 'template_multi_showcase',
  name: 'Showcase Universel Vestin',
  description: 'Template complet intégrant toutes les familles majeures',
  business_type: 'restaurant',
  sub_sector: 'gastronomie',
  style_tags: ['luxe', 'moderne', 'clean'],
  version: '1.0.0',
  status: 'published',
  theme: {
    primaryColor: '#0F766E',
    secondaryColor: '#134E4A',
    accentColor: '#14B8A6',
    bgColor: '#F0FDFA',
    textColor: '#134E4A',
    font: 'Outfit',
  },
  sections: [
    { id: 'sec_header', type: 'HEADER', variant: 'header_001', order: 0, config: { isSticky: true } },
    { id: 'sec_hero', type: 'HERO', variant: 'hero_001', order: 1, config: { layout: 'fullscreen', title: 'Bienvenue au Grand Palais' } },
    { id: 'sec_products', type: 'PRODUCT', variant: 'product_001', order: 2, config: { columns: 2, showPrices: true } },
    { id: 'sec_services', type: 'SERVICE', variant: 'service_001', order: 3, config: { showDuration: true } },
    { id: 'sec_gallery', type: 'GALLERY', variant: 'gallery_001', order: 4, config: { columns: 3 } },
    { id: 'sec_contact', type: 'CONTACT', variant: 'contact_001', order: 5, config: { showAddress: true, showPhone: true } },
    { id: 'sec_footer', type: 'FOOTER', variant: 'footer_001', order: 6, config: { showCopyright: true } },
  ],
};

// ── ÉTAPE 1 : TEMPLATE CONTRACT ───────────────────────────────────────────
console.log('--- Étape 1 : Validation TemplateContract ---');
const contractResult = validateTemplateContract(multiFamilyTemplate);
assert(contractResult.valid === true, 'Le template respecte le TemplateContract');
assert(contractResult.errors.length === 0, 'Zéro erreur de contrat');
assert(contractResult.security.safe === true, 'Zéro code exécutable ou injection');
assert(contractResult.fakeData.clean === true, 'Zéro fausse donnée commerciale');

// ── ÉTAPE 2 : TEMPLATE QUALITY GATE ───────────────────────────────────────
console.log('\n--- Étape 2 : Évaluation TemplateQualityGate ---');
const qualityReport = templateQualityGate.evaluateTemplate(multiFamilyTemplate);
assert(qualityReport.valid === true, 'Le template est validé par le Quality Gate');
assert(qualityReport.score >= 80, `Score global Quality Gate élevé : ${qualityReport.score}/100`);
assert(qualityReport.criticalFailures.length === 0, 'Aucun échec critique signalé par le Quality Gate');

// ── ÉTAPE 3 : CONVERSION EN DRAFT_CONFIG ──────────────────────────────────
console.log('\n--- Étape 3 : Conversion en draft_config Store Model ---');
const storeVendeur = {
  id: 'store_douala_palais_01',
  name: 'Le Grand Palais Douala',
  city: 'Douala',
  phone: '+237670000000',
  whatsapp: '+237670000000',
  address: 'Boulevard de la Liberté, Akwa',
  theme_color: '#0F766E',
  products: [
    { id: 'p1', name: 'Menu Dégustation 5 Services', price: 25000, category: 'Menu' },
    { id: 'p2', name: 'Filet de Capitaine Braisé', price: 12000, category: 'Plats' },
  ],
  services: [
    { id: 's1', name: 'Privatisation Salon VIP', price: 150000, duration: '4h' },
  ],
  gallery: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c',
  ],
};

const conversionResult = templateLibraryService.convertTemplateToDraftConfig(multiFamilyTemplate, storeVendeur);
assert(conversionResult.success === true, 'Conversion en draft_config réussie');
const draftConfig = conversionResult.draftConfig;
assert(draftConfig.creationMethod === 'TEMPLATE', 'creationMethod est bien "TEMPLATE"');
assert(draftConfig.templateId === 'template_multi_showcase', 'templateId correspond au template sélectionné');

// ── ÉTAPE 4 : ADAPTATION EN BUSINESS PROFILE ──────────────────────────────
console.log('\n--- Étape 4 : Adaptation BusinessProfile ---');
const rawStoreObject = {
  ...storeVendeur,
  draft_config: draftConfig,
  business_type: 'restaurant',
};
const profile = adaptStoreToBusinessProfile(rawStoreObject, storeVendeur.products, []);
assert(profile !== null, 'BusinessProfile généré avec succès');
assert(profile.identity.name === 'Le Grand Palais Douala', 'Identité réelle du magasin préservée');
assert(profile.catalog.products.length === 2, 'Vrais produits du magasin transmis au profil');

// ── ÉTAPE 5 : COMPOSITION ENGINE ──────────────────────────────────────────
console.log('\n--- Étape 5 : Exécution CompositionEngine ---');
const composition = compositionEngine.compose(profile);
assert(composition !== null, 'CompositionEngine a produit une composition');
assert(Array.isArray(composition.sections) && composition.sections.length > 0, `Composition contient ${composition.sections.length} sections`);

// ── ÉTAPE 6 : RÉSOLUTION DANS COMPONENT REGISTRY (RENDERER COMPATIBILITY) ──
console.log('\n--- Étape 6 : Résolution Canonique des Composants ---');
const testedFamilies = ['HEADER', 'HERO', 'PRODUCT', 'SERVICE', 'GALLERY', 'CONTACT', 'FOOTER'];

for (const fam of testedFamilies) {
  const compDef = ComponentRegistry.getByTypeAndVariant(fam);
  assert(compDef !== null, `Composant canonique disponible pour famille "${fam}"`);
  assert(typeof compDef.renderer === 'function', `Renderer fonctionnel disponible pour famille "${fam}" (id: ${compDef?.id})`);
}

// Vérifier que chaque section produite par la composition peut être résolue par le ComponentRegistry
let resolvedAll = true;
for (const section of composition.sections) {
  const comp = ComponentRegistry.get(section.componentId) || ComponentRegistry.getByTypeAndVariant(section.family);
  if (!comp || !comp.renderer) {
    resolvedAll = false;
    console.error(`  ✗ Impossible de résoudre renderer pour section ${section.id} (famille: ${section.family})`);
  }
}
assert(resolvedAll === true, '100% des sections de la composition sont résolubles par UniversalStorefrontRenderer');

console.log(`\nResults: ${passed}/${total} tests passed.\n`);

if (passed !== total) {
  process.exit(1);
}
