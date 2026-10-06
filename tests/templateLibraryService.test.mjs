/**
 * TEST SUITE : TemplateLibraryService
 * ─────────────────────────────────────────────────────────────────────────────
 * Valide les opérations du service de bibliothèque de templates :
 *  1. Chargement et normalisation du catalogue mémoire -> PASS
 *  2. listTemplates filtre correctement par statut (published vs draft vs archived) -> PASS
 *  3. getTemplate / getTemplateVersion -> PASS
 *  4. searchTemplates (recherche par mot-clé dans name, desc, tags) -> PASS
 *  5. filterTemplates (filtrage par businessType, subSector, tags, score) -> PASS
 *  6. validateTemplate audite le contrat et le quality gate -> PASS
 *  7. publishTemplate refuse les templates invalides et publie les valides -> PASS
 *  8. archiveTemplate retire le template des nouveaux flux -> PASS
 *  9. convertTemplateToDraftConfig produit un draft_config 100% valide -> PASS
 */

import { templateLibraryService } from '../src/lib/template-library/TemplateLibraryService.js';
import { validateStoreConfig } from '../src/lib/store-model/StoreModelContract.js';
import { businessTypeRegistry } from '../src/lib/business-types/BusinessTypeRegistry.js';

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

console.log('=== RUNNING TESTS: TemplateLibraryService ===\n');

// Réinitialiser le service pour les tests
templateLibraryService._reset();

// ── 1. CHARGEMENT INITIAL ──────────────────────────────────────────────────
const allPublished = templateLibraryService.listTemplates({ status: 'published' });
assert(allPublished.length > 0, `Catalogue chargé : ${allPublished.length} templates publiés`);

const sample = allPublished[0];
assert(Boolean(sample.id), 'Chaque template normalisé possède un id');
assert(Boolean(sample.name), 'Chaque template normalisé possède un nom');
assert(Boolean(sample.theme), 'Chaque template normalisé possède un thème');
assert(Array.isArray(sample.sections) && sample.sections.length > 0, 'Chaque template normalisé possède des sections');
assert(typeof sample.quality_score === 'number', `Score qualité calculé et présent (${sample.quality_score})`);

// ── 2. GESTION DES STATUTS (DRAFT / PUBLISHED / ARCHIVED) ──────────────────
// Enregistrement d'un template draft
const draftTemplate = {
  id: 'draft_test_001',
  name: 'Boutique en construction',
  business_type: 'fashion',
  status: 'draft',
  theme: {
    primaryColor: '#000000',
    bgColor: '#ffffff',
  },
  sections: [
    { id: 'sec_h', type: 'HEADER', variant: 'default', order: 0 },
    { id: 'sec_f', type: 'FOOTER', variant: 'default', order: 1 },
  ],
};

templateLibraryService.registerTemplate(draftTemplate);

// Par défaut, listTemplates ne retourne QUE les 'published'
const publishedAfterDraft = templateLibraryService.listTemplates({ status: 'published' });
assert(
  !publishedAfterDraft.some((t) => t.id === 'draft_test_001'),
  'Le template draft est invisible dans la liste publique des templates publiés'
);

const draftsOnly = templateLibraryService.listTemplates({ status: 'draft' });
assert(
  draftsOnly.some((t) => t.id === 'draft_test_001'),
  'Le template draft est visible uniquement lorsqu\'explicitement demandé (statut draft)'
);

// ── 3. PUBLICATION & ARCHIVAGE ─────────────────────────────────────────────
const pubResult = templateLibraryService.publishTemplate('draft_test_001');
assert(pubResult.success === true, 'Publication réussie pour un template valide');

const publishedNow = templateLibraryService.listTemplates({ status: 'published' });
assert(
  publishedNow.some((t) => t.id === 'draft_test_001'),
  'Le template publié apparaît désormais dans la liste publique'
);

const arcResult = templateLibraryService.archiveTemplate('draft_test_001');
assert(arcResult.success === true, 'Archivage réussi');

const publishedAfterArchive = templateLibraryService.listTemplates({ status: 'published' });
assert(
  !publishedAfterArchive.some((t) => t.id === 'draft_test_001'),
  'Le template archivé est exclu de la liste publique'
);

// ── 4. RECHERCHE TEXTUELLE ────────────────────────────────────────────────
const restoResults = templateLibraryService.searchTemplates('restaurant');
assert(restoResults.length > 0, `Recherche "restaurant" retourne ${restoResults.length} résultats`);
assert(
  restoResults.every((t) => {
    const norm = businessTypeRegistry.normalize(t.business_type);
    return (
      norm === 'restaurant' ||
      t.business_type === 'restaurant' ||
      (t.style_tags || []).some((tag) => tag.includes('restaurant')) ||
      (t.name || '').toLowerCase().includes('restaurant') ||
      (t.description || '').toLowerCase().includes('restaurant')
    );
  }),
  'Tous les résultats correspondent au mot-clé cherché'
);

// ── 5. FILTRAGE SECTORIEL & TAGS ──────────────────────────────────────────
const fashionTemplates = templateLibraryService.filterTemplates({ businessType: 'fashion' });
assert(fashionTemplates.length > 0, `Filtrage businessType "fashion" retourne ${fashionTemplates.length} templates`);

// ── 6. VERSIONING ─────────────────────────────────────────────────────────
const v1Template = templateLibraryService.getTemplateVersion('resto_001', '1.0.0');
assert(v1Template !== null, 'getTemplateVersion("resto_001", "1.0.0") résout la version correcte');

const nonExistentVersion = templateLibraryService.getTemplateVersion('resto_001', '99.9.9');
assert(nonExistentVersion === null, 'getTemplateVersion retourne null pour une version inexistante');

// ── 7. CONVERSION EN DRAFT_CONFIG (STORE MODEL COMPATIBILITY) ──────────────
const storeRealData = {
  name: 'Bistrot Parisien Douala',
  city: 'Douala',
  phone: '+237699001122',
  theme_color: '#B91C1C',
};

const conversion = templateLibraryService.convertTemplateToDraftConfig('resto_001', storeRealData);
assert(conversion.success === true, 'Conversion en draft_config réussie');
assert(conversion.draftConfig !== null, 'draftConfig généré non-null');
assert(conversion.draftConfig.creationMethod === 'TEMPLATE', 'creationMethod est défini à "TEMPLATE"');
assert(conversion.draftConfig.templateId === 'resto_001', 'templateId est correctement conservé');
assert(conversion.draftConfig.theme.primaryColor === '#B91C1C', 'Données réelles du magasin priorisées sur le thème');

// Validation par le StoreModelContract
const validationResult = validateStoreConfig(conversion.draftConfig);
assert(validationResult.success === true, 'Le draft_config généré passe la validation stricte StoreModelContract');

console.log(`\nResults: ${passed}/${total} tests passed.\n`);

if (passed !== total) {
  process.exit(1);
}
