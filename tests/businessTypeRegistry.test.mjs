/**
 * VesTyle / Vestin — Test Suite : BusinessTypeRegistry & Unification Métier
 * ─────────────────────────────────────────────────────────────────────────────
 * ÉTAPE 4.3.1-CLOSURE : Validation stricte UNKNOWN / AMBIGUOUS / MISSING
 * ZÉRO conversion silencieuse vers 'product'.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  businessTypeRegistry,
  BusinessTypeRegistry,
  EXPLICIT_LEGACY_ALIASES,
  AMBIGUOUS_LEGACY_ALIASES,
} from '../src/lib/business-types/BusinessTypeRegistry.js';
import { BUSINESS_TYPE_DEFINITIONS } from '../src/lib/business-types/businessTypeDefinitions.js';
import { adaptStoreToBusinessProfile } from '../src/lib/business-profile/businessProfileAdapter.js';
import { capabilityEngine, CAPABILITIES, CAPABILITY_STATUS } from '../src/lib/capability-engine/CapabilityEngine.js';
import { compositionEngine } from '../src/lib/composition-engine/CompositionEngine.js';
import { COMPOSITION_FAMILIES } from '../src/lib/composition-engine/compositionRules.js';
import { ComponentRegistry } from '../src/lib/component-registry/ComponentRegistry.js';

const EXPECTED_19_IDS = [
  'product',
  'service',
  'hybrid',
  'restaurant',
  'hotel',
  'beauty',
  'hair_salon',
  'fitness',
  'professional',
  'education',
  'photography',
  'automotive',
  'real_estate',
  'artisan',
  'event',
  'business',
  'wholesale',
  'digital_service',
  'home_service',
];

// ═══════════════════════════════════════════════════════════════════════════
// 1. REGISTRY VALIDATION (19 TYPES CANONIQUES)
// ═══════════════════════════════════════════════════════════════════════════

test('1.1 - Le registre contient exactement les 19 types métiers canoniques', () => {
  const allTypes = businessTypeRegistry.getAll();
  assert.equal(allTypes.length, 19, 'Doit contenir exactement 19 types fondamentaux');

  const registeredIds = allTypes.map((t) => t.id);
  for (const expectedId of EXPECTED_19_IDS) {
    assert.ok(registeredIds.includes(expectedId), `Le type "${expectedId}" doit être enregistré`);
    assert.ok(businessTypeRegistry.has(expectedId), `has("${expectedId}") doit retourner true`);
  }
});

test('1.2 - Chaque définition possède toutes les propriétés obligatoires et une terminologie valide', () => {
  const allTypes = businessTypeRegistry.getAll();
  const seenIds = new Set();

  for (const def of allTypes) {
    // Unicité
    assert.ok(!seenIds.has(def.id), `ID dupliqué détecté : ${def.id}`);
    seenIds.add(def.id);

    // Propriétés de base
    assert.ok(typeof def.id === 'string' && def.id.length > 0, `ID requis pour ${def.id}`);
    assert.ok(typeof def.label === 'string' && def.label.length > 0, `Label requis pour ${def.id}`);
    assert.ok(typeof def.category === 'string', `Category requise pour ${def.id}`);
    assert.ok(typeof def.emoji === 'string', `Emoji requis pour ${def.id}`);
    assert.ok(typeof def.description === 'string', `Description requise pour ${def.id}`);

    // Capabilities
    assert.ok(typeof def.capabilities === 'object' && def.capabilities !== null, `Capabilities requises pour ${def.id}`);
    assert.ok(typeof def.capabilities.hasProducts === 'boolean', `hasProducts boolean requis pour ${def.id}`);
    assert.ok(typeof def.capabilities.hasServices === 'boolean', `hasServices boolean requis pour ${def.id}`);

    // Composants recommandés
    assert.ok(Array.isArray(def.recommendedComponents) && def.recommendedComponents.length > 0, `Recommandations requises pour ${def.id}`);

    // Terminologie déclarative
    assert.ok(typeof def.terminology === 'object' && def.terminology !== null, `Terminology requise pour ${def.id}`);
    assert.ok(typeof def.terminology.cartTitle === 'string', `terminology.cartTitle requis pour ${def.id}`);
    assert.ok(typeof def.terminology.orderButton === 'string', `terminology.orderButton requis pour ${def.id}`);
    assert.ok(typeof def.terminology.bookingTitle === 'string', `terminology.bookingTitle requis pour ${def.id}`);
    assert.ok(typeof def.terminology.catalogTab === 'string', `terminology.catalogTab requis pour ${def.id}`);
  }
});

test('1.3 - getOnboardingChoices() dérive fidèlement les 19 choix sans duplication de données', () => {
  const choices = businessTypeRegistry.getOnboardingChoices();
  assert.equal(choices.length, 19, 'getOnboardingChoices doit retourner les 19 options');

  for (const choice of choices) {
    assert.ok(EXPECTED_19_IDS.includes(choice.id), `ID valide pour ${choice.id}`);
    assert.ok(choice.label && choice.emoji && choice.description, `Métadonnées complètes pour ${choice.id}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. NORMALIZATION & DIAGNOSTIC ANALYZE (CONTRAT CLOSURE 4.3.1)
// ═══════════════════════════════════════════════════════════════════════════

test('TEST 1 & 2 - Normalisation canonique et alias legacy explicite', () => {
  // TEST 1 : normalize('restaurant') -> 'restaurant'
  assert.equal(businessTypeRegistry.normalize('restaurant'), 'restaurant');
  assert.equal(businessTypeRegistry.normalize('HOTEL'), 'hotel');
  assert.equal(businessTypeRegistry.normalize('  hair_salon  '), 'hair_salon');
  assert.equal(businessTypeRegistry.normalize('digital_service'), 'digital_service');

  // TEST 2 : normalize('ecommerce') -> 'product'
  assert.equal(businessTypeRegistry.normalize('ecommerce'), 'product');
  assert.equal(businessTypeRegistry.normalize('products'), 'product');
  assert.equal(businessTypeRegistry.normalize('boutique'), 'product');
  assert.equal(businessTypeRegistry.normalize('gastronomie'), 'restaurant');
  assert.equal(businessTypeRegistry.normalize('services'), 'service');
  assert.equal(businessTypeRegistry.normalize('coiffure'), 'hair_salon');
});

test('TEST 3 - analyze("creative") -> AMBIGUOUS (aucun choix silencieux)', () => {
  const creativeAnalysis = businessTypeRegistry.analyze('creative');
  assert.equal(creativeAnalysis.status, 'AMBIGUOUS');
  assert.equal(creativeAnalysis.isAmbiguous, true);
  assert.equal(creativeAnalysis.canonicalId, null, 'Le canonicalId doit être null pour un terme ambigu');
  assert.ok(creativeAnalysis.candidates.includes('photography'));
  assert.ok(creativeAnalysis.candidates.includes('digital_service'));
  assert.ok(creativeAnalysis.candidates.includes('artisan'));

  const wellnessAnalysis = businessTypeRegistry.analyze('wellness');
  assert.equal(wellnessAnalysis.status, 'AMBIGUOUS');
  assert.equal(wellnessAnalysis.isAmbiguous, true);
  assert.equal(wellnessAnalysis.canonicalId, null);
  assert.ok(wellnessAnalysis.candidates.includes('beauty'));
  assert.ok(wellnessAnalysis.candidates.includes('fitness'));
});

test('TEST 4 - analyze("inconnu") -> UNKNOWN (aucun mapping vers product)', () => {
  const unknownAnalysis = businessTypeRegistry.analyze('inconnu');
  assert.equal(unknownAnalysis.status, 'UNKNOWN');
  assert.equal(unknownAnalysis.isUnknown, true);
  assert.equal(unknownAnalysis.canonicalId, null, 'Un type inconnu ne doit JAMAIS avoir product comme canonicalId');
  assert.equal(unknownAnalysis.isCanonical, false);
});

test('TEST 5, 6, 7 - analyze(null | undefined | "") -> MISSING', () => {
  // TEST 5 : null
  const nullAnalysis = businessTypeRegistry.analyze(null);
  assert.equal(nullAnalysis.status, 'MISSING');
  assert.equal(nullAnalysis.isMissing, true);
  assert.equal(nullAnalysis.canonicalId, null);

  // TEST 6 : undefined
  const undefinedAnalysis = businessTypeRegistry.analyze(undefined);
  assert.equal(undefinedAnalysis.status, 'MISSING');
  assert.equal(undefinedAnalysis.isMissing, true);
  assert.equal(undefinedAnalysis.canonicalId, null);

  // TEST 7 : '' et '   '
  const emptyAnalysis = businessTypeRegistry.analyze('');
  assert.equal(emptyAnalysis.status, 'MISSING');
  assert.equal(emptyAnalysis.isMissing, true);
  assert.equal(emptyAnalysis.canonicalId, null);

  const spacesAnalysis = businessTypeRegistry.analyze('   ');
  assert.equal(spacesAnalysis.status, 'MISSING');
  assert.equal(spacesAnalysis.isMissing, true);
  assert.equal(spacesAnalysis.canonicalId, null);
});

test('TEST 8 - normalize("inconnu") !== "product" (returns null)', () => {
  const res = businessTypeRegistry.normalize('inconnu');
  assert.notEqual(res, 'product', 'normalize("inconnu") ne doit pas retourner product');
  assert.equal(res, null);

  const foobarRes = businessTypeRegistry.normalize('foobar_business_xyz');
  assert.notEqual(foobarRes, 'product');
  assert.equal(foobarRes, null);
});

test('TEST 9 - normalize(null) !== "product" (returns null)', () => {
  const resNull = businessTypeRegistry.normalize(null);
  assert.notEqual(resNull, 'product', 'normalize(null) ne doit pas retourner product');
  assert.equal(resNull, null);

  const resUndefined = businessTypeRegistry.normalize(undefined);
  assert.notEqual(resUndefined, 'product');
  assert.equal(resUndefined, null);

  const resEmpty = businessTypeRegistry.normalize('');
  assert.notEqual(resEmpty, 'product');
  assert.equal(resEmpty, null);
});

test('TEST 10 - normalize("creative") !== "photography" && normalize("creative") !== "product"', () => {
  const resCreative = businessTypeRegistry.normalize('creative');
  assert.notEqual(resCreative, 'photography', 'creative ne doit pas devenir silencieusement photography');
  assert.notEqual(resCreative, 'product', 'creative ne doit pas devenir silencieusement product');
  assert.notEqual(resCreative, 'digital_service', 'creative ne doit pas devenir silencieusement digital_service');
  assert.equal(resCreative, null);

  const resWellness = businessTypeRegistry.normalize('wellness');
  assert.notEqual(resWellness, 'beauty');
  assert.notEqual(resWellness, 'product');
  assert.equal(resWellness, null);
});

test('TEST 10.bis - normalize(..., { strict: true }) lève une exception claire pour UNKNOWN/AMBIGUOUS/MISSING', () => {
  assert.throws(() => businessTypeRegistry.normalize('inconnu_xyz', { strict: true }), /non résolu/);
  assert.throws(() => businessTypeRegistry.normalize('creative', { strict: true }), /non résolu/);
  assert.throws(() => businessTypeRegistry.normalize(null, { strict: true }), /non résolu/);
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. TERMINOLOGY DÉCLARATIVE
// ═══════════════════════════════════════════════════════════════════════════

test('3.1 - Terminologie spécifique résolue sans conditionnel hardcodé', () => {
  const restoTerm = businessTypeRegistry.getTerminology('restaurant');
  assert.equal(restoTerm.bookingTitle, 'Réserver une Table');
  assert.equal(restoTerm.orderButton, 'Commander le Menu sur WhatsApp');
  assert.equal(restoTerm.catalogTab, 'La Carte du Chef');

  const serviceTerm = businessTypeRegistry.getTerminology('service');
  assert.equal(serviceTerm.bookingTitle, 'Prendre Rendez-vous');
  assert.equal(serviceTerm.orderButton, 'Prendre Rendez-vous');

  const hotelTerm = businessTypeRegistry.getTerminology('hotel');
  assert.equal(hotelTerm.bookingTitle, 'Réserver un Séjour');
  assert.equal(hotelTerm.catalogTab, 'Nos Chambres & Suites');

  const beautyTerm = businessTypeRegistry.getTerminology('beauty');
  assert.equal(beautyTerm.bookingTitle, 'Réserver un Soin');

  // Terminologie neutre pour type non résolu
  const neutralTerm = businessTypeRegistry.getTerminology('unknown_sector');
  assert.equal(neutralTerm.cartTitle, 'Mon Panier');
  assert.equal(neutralTerm.ctaText, 'Découvrir');
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. INTÉGRATION BUSINESSPROFILE & ADAPTER
// ═══════════════════════════════════════════════════════════════════════════

test('TEST 12 - adaptStoreToBusinessProfile avec ancien activity_type valide normalise vers type canonique', () => {
  // Cas direct canonique
  const p1 = adaptStoreToBusinessProfile({ id: 's1', name: 'Resto Test', business_type: 'restaurant' });
  assert.equal(p1.business.type, 'restaurant');
  assert.equal(p1.capabilities[CAPABILITIES.TABLE_RESERVATION], true);

  // Cas alias legacy activity_type
  const p2 = adaptStoreToBusinessProfile({ id: 's2', name: 'Shop Test', activity_type: 'ecommerce' });
  assert.equal(p2.business.type, 'product');

  const p3 = adaptStoreToBusinessProfile({ id: 's3', name: 'Gastro Test', activity_type: 'gastronomie' });
  assert.equal(p3.business.type, 'restaurant');
});

test('TEST 13 - adaptStoreToBusinessProfile avec activity_type inconnu ou ambigu ne produit PAS "product"', () => {
  // Cas inconnu : statut UNKNOWN
  const pUnknown = adaptStoreToBusinessProfile({ id: 's4', name: 'Alien Store', business_type: 'inconnu_xyz' });
  assert.notEqual(pUnknown.business.type, 'product', 'Un type inconnu ne doit pas devenir product');
  assert.equal(pUnknown.business.type, 'unknown');

  // Cas ambigu : statut AMBIGUOUS
  const pAmbiguous = adaptStoreToBusinessProfile({ id: 's5', name: 'Creative Studio', activity_type: 'creative' });
  assert.notEqual(pAmbiguous.business.type, 'product');
  assert.notEqual(pAmbiguous.business.type, 'photography');
  assert.equal(pAmbiguous.business.type, 'ambiguous');

  // Cas manquant : statut MISSING
  const pMissing = adaptStoreToBusinessProfile({ id: 's6', name: 'Empty Store' });
  assert.notEqual(pMissing.business.type, 'product');
  assert.equal(pMissing.business.type, 'unspecified');
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. INTÉGRATION CAPABILITY ENGINE
// ═══════════════════════════════════════════════════════════════════════════

test('5.1 - CapabilityEngine active les capacités appropriées selon le businessType canonique', () => {
  const capsProduct = capabilityEngine.getStoreCapabilities({ businessType: 'product' });
  assert.ok(capsProduct.includes(CAPABILITIES.PRODUCT));
  assert.ok(capsProduct.includes(CAPABILITIES.CART));
  assert.ok(!capsProduct.includes(CAPABILITIES.TABLE_RESERVATION));

  const capsResto = capabilityEngine.getStoreCapabilities({ businessType: 'restaurant' });
  assert.ok(capsResto.includes(CAPABILITIES.TABLE_RESERVATION));
  assert.ok(capsResto.includes(CAPABILITIES.BOOKING));

  const capsHotel = capabilityEngine.getStoreCapabilities({ businessType: 'hotel' });
  assert.ok(capsHotel.includes(CAPABILITIES.BOOKING));
  assert.ok(capsHotel.includes(CAPABILITIES.GALLERY));
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. INTÉGRATION COMPOSITION ENGINE & TERMINOLOGY
// ═══════════════════════════════════════════════════════════════════════════

test('6.1 - CompositionEngine utilise la terminologie déclarative du registre pour la section BOOKING', () => {
  // Restaurant
  const compResto = compositionEngine.compose(
    { id: 's_resto', name: 'Le Bistrot', business_type: 'restaurant' },
    { customFamilies: ['HEADER', 'BOOKING', 'FOOTER'], enabledCapabilities: [CAPABILITIES.BOOKING] }
  );
  const bookingSecResto = compResto.sections.find((s) => s.family === COMPOSITION_FAMILIES.BOOKING);
  if (bookingSecResto) {
    assert.equal(bookingSecResto.config.title, 'Réserver une Table');
    assert.equal(bookingSecResto.config.ctaText, 'Réserver une Table');
  }

  // Service standard
  const compService = compositionEngine.compose(
    { id: 's_srv', name: 'Cabinet Conseil', business_type: 'service' },
    { customFamilies: ['HEADER', 'BOOKING', 'FOOTER'], enabledCapabilities: [CAPABILITIES.BOOKING] }
  );
  const bookingSecService = compService.sections.find((s) => s.family === COMPOSITION_FAMILIES.BOOKING);
  if (bookingSecService) {
    assert.equal(bookingSecService.config.title, 'Prendre Rendez-vous');
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. TEST 14 — SÉCURITÉ DES DONNÉES VENDEUR LORS D'UN CHANGEMENT DE TYPE
// ═══════════════════════════════════════════════════════════════════════════

test('TEST 14 - Un changement de businessType conserve l’intégralité des produits, services et configuration', () => {
  const storeData = {
    id: 'store_123',
    name: 'Boutique Polyvalente',
    business_type: 'restaurant',
    theme_color: '#EA580C',
    services: [{ id: 'srv_1', name: 'Traiteur Événementiel', price: 50000 }],
  };

  const sampleProducts = [
    { id: 'p1', name: 'Plat Signature', price: 5000, category: 'Plats' },
    { id: 'p2', name: 'Boisson Locale', price: 1000, category: 'Boissons' },
  ];

  const profileBefore = adaptStoreToBusinessProfile(storeData, sampleProducts);
  assert.equal(profileBefore.business.type, 'restaurant');
  assert.equal(profileBefore.catalog.products.length, 2);
  assert.equal(profileBefore.catalog.services.length, 1);

  // Simulation changement de type métier par le vendeur vers 'product'
  const updatedStoreData = { ...storeData, business_type: 'product' };
  const profileAfter = adaptStoreToBusinessProfile(updatedStoreData, sampleProducts);

  assert.equal(profileAfter.business.type, 'product');
  assert.equal(profileAfter.catalog.products.length, 2, 'Aucun produit ne doit être perdu');
  assert.equal(profileAfter.catalog.services.length, 1, 'Aucun service ne doit être perdu');
  assert.equal(profileAfter.catalog.products[0].name, 'Plat Signature');
  assert.equal(profileAfter.catalog.services[0].name, 'Traiteur Événementiel');
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. AUDIT DES RENDERERS CANONIQUES (ZÉRO CONDITIONNEL SECTORIEL)
// ═══════════════════════════════════════════════════════════════════════════

test('8.1 - Aucun renderer canonique ne contient de test conditionnel sur businessType', () => {
  const canonicalDir = join(process.cwd(), 'src', 'lib', 'component-registry', 'canonical');
  const baseCompPath = join(process.cwd(), 'src', 'lib', 'component-registry', 'baseComponents.jsx');

  const filesToCheck = [
    baseCompPath,
    join(canonicalDir, 'headerComponents.jsx'),
    join(canonicalDir, 'heroComponents.jsx'),
    join(canonicalDir, 'productComponents.jsx'),
    join(canonicalDir, 'categoryComponents.jsx'),
    join(canonicalDir, 'serviceComponents.jsx'),
    join(canonicalDir, 'contactComponents.jsx'),
    join(canonicalDir, 'galleryComponents.jsx'),
  ];

  for (const filePath of filesToCheck) {
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      const hasBusinessTypeBranching = /businessType\s*===/i.test(content);
      assert.ok(
        !hasBusinessTypeBranching,
        `Violation détectée dans ${filePath} : branchement direct sur businessType interdit dans un renderer canonique`
      );
    }
  }
});
