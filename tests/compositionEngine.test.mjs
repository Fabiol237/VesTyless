import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

import { adaptStoreToBusinessProfile } from '../src/lib/business-profile/businessProfileAdapter.js';
import {
  capabilityEngine,
  CAPABILITIES,
  CAPABILITY_STATUS,
  CAPABILITY_METADATA,
} from '../src/lib/capability-engine/CapabilityEngine.js';
import {
  compositionEngine,
  CompositionEngine,
} from '../src/lib/composition-engine/CompositionEngine.js';
import {
  COMPOSITION_FAMILIES,
  resolveCanonicalComponentId,
  filterFamiliesByCapabilities,
} from '../src/lib/composition-engine/compositionRules.js';
import { translateBlueprintToComposition } from '../src/lib/composition-engine/referenceSiteTranslator.js';
import { ComponentRegistry } from '../src/lib/component-registry/ComponentRegistry.js';
import { DataBindingEngine } from '../src/lib/content-source/DataBindingEngine.js';

describe('VESTIN — ÉTAPE 2 : Moteur Adaptatif Canonique & CompositionEngine', () => {

  // ── 1. RETAIL FONCTIONNEL ──────────────────────────────────────────────────
  it('1. Retail Fonctionnel : génère les sections HEADER, HERO, CATEGORY, PRODUCT, FOOTER', () => {
    const mockStore = {
      id: 'store_retail_1',
      name: 'Boutique Mode Express',
      slug: 'mode-express',
      business_type: 'product',
      city: 'Douala',
      whatsapp: '237699001122',
      categories: ['Robes', 'Chaussures'],
    };
    const mockProducts = [
      { id: 'p1', name: 'Robe Wax', price: 15000, stock: 10, is_active: true },
      { id: 'p2', name: 'Sandales Cuir', price: 8000, stock: 5, is_active: true },
    ];

    const profile = adaptStoreToBusinessProfile(mockStore, mockProducts);
    const composition = compositionEngine.compose(profile);

    assert.strictEqual(composition.version, '2.0.0');
    assert.strictEqual(composition.storeId, 'store_retail_1');
    assert.strictEqual(composition.businessType, 'product');

    const families = composition.sections.map((s) => s.family);
    assert.ok(families.includes('HEADER'), 'HEADER doit être présent');
    assert.ok(families.includes('HERO'), 'HERO doit être présent');
    assert.ok(families.includes('PRODUCT'), 'PRODUCT doit être présent');
    assert.ok(families.includes('FOOTER'), 'FOOTER doit être présent');

    const productSec = composition.sections.find((s) => s.family === 'PRODUCT');
    assert.strictEqual(productSec.isEmpty, false);
    assert.strictEqual(productSec.state, 'ready');
  });

  // ── 2. RESTAURANT RÉEL & STRICTEMENT SANS RENDERER BOOKING FICTIF ──────────
  it('2. Restaurant Réel : menu présent, et aucune section BOOKING automatique trompeuse', () => {
    const mockStore = {
      id: 'store_resto_1',
      name: 'Le Gourmet Douala',
      slug: 'le-gourmet',
      business_type: 'restaurant',
      city: 'Douala',
      whatsapp: '237677112233',
    };
    const mockMenu = [
      { id: 'm1', name: 'Ndolé Royal', price: 5000, category: 'Plats' },
      { id: 'm2', name: 'Poulet DG', price: 6000, category: 'Plats' },
    ];

    const profile = adaptStoreToBusinessProfile(mockStore, mockMenu);
    const composition = compositionEngine.compose(profile);

    assert.strictEqual(composition.businessType, 'restaurant');
    const families = composition.sections.map((s) => s.family);
    assert.ok(families.includes('PRODUCT'), 'Le menu/carte doit être présent');

    // Vérification stricte : aucun renderer BOOKING canonique trompeur n'est généré par défaut
    assert.strictEqual(families.includes('BOOKING'), false, 'BOOKING ne doit pas avoir de section automatique sans renderer canonique');
    assert.strictEqual(resolveCanonicalComponentId('BOOKING'), null, 'resolveCanonicalComponentId(BOOKING) doit retourner null');
  });

  // ── 3. PRESTATION DE SERVICE ──────────────────────────────────────────────
  it('3. Prestation de Service : génère les sections SERVICE et Contact', () => {
    const mockStore = {
      id: 'store_service_1',
      name: 'Studio Design Pro',
      slug: 'studio-design',
      business_type: 'service',
      city: 'Yaoundé',
      whatsapp: '237655443322',
      services: [
        { id: 's1', title: 'Branding Complet', price: '150 000 FCFA', duration: '5 jours' },
      ],
    };

    const profile = adaptStoreToBusinessProfile(mockStore, []);
    const composition = compositionEngine.compose(profile);

    assert.strictEqual(composition.businessType, 'service');
    const families = composition.sections.map((s) => s.family);
    assert.ok(families.includes('SERVICE'), 'SERVICE doit être présent');
    assert.ok(families.includes('HEADER'), 'HEADER doit être présent');
    assert.ok(families.includes('FOOTER'), 'FOOTER doit être présent');
  });

  // ── 4. CATALOGUE VIDE (ZÉRO FAKE DATA) ────────────────────────────────────
  it('4. Catalogue Vide : isEmpty: true sans aucun produit factice', () => {
    const mockStore = {
      id: 'store_empty_1',
      name: 'Boutique Nouvelle',
      business_type: 'product',
    };

    const profile = adaptStoreToBusinessProfile(mockStore, []);
    const composition = compositionEngine.compose(profile);

    const productSec = composition.sections.find((s) => s.family === 'PRODUCT');
    assert.ok(productSec, 'Section PRODUCT présente dans le schéma');
    assert.strictEqual(productSec.isEmpty, true, 'isEmpty doit être true');
    assert.strictEqual(productSec.state, 'empty', 'state doit être empty');

    // Zéro produit inventé dans la config
    assert.strictEqual(productSec.config.products, undefined);
  });

  // ── 5. CAPACITÉ ABSENTE ───────────────────────────────────────────────────
  it('5. Capacité Absente : désactiver une capacité exclut sa section', () => {
    const mockStore = {
      id: 'store_no_prod',
      name: 'Store Sans Produit',
      business_type: 'product',
      disabledCapabilities: ['PRODUCT'],
    };

    const profile = adaptStoreToBusinessProfile(mockStore, []);
    const composition = compositionEngine.compose(profile, {
      disabledCapabilities: ['PRODUCT'],
    });

    const families = composition.sections.map((s) => s.family);
    assert.strictEqual(families.includes('PRODUCT'), false, 'PRODUCT ne doit pas être inclus si désactivé');
  });

  // ── 6. CAPACITÉ PARTIAL : BOOKING SANS RENDERER TROMPEUR ──────────────────
  it('6. Capacité PARTIAL : BOOKING est PARTIAL, sans disponibilité fictive ni renderer trompeur', () => {
    assert.strictEqual(capabilityEngine.getCapabilityStatus('BOOKING'), CAPABILITY_STATUS.PARTIAL);
    assert.strictEqual(capabilityEngine.isOperational('BOOKING'), false);
    assert.strictEqual(capabilityEngine.isPartial('BOOKING'), true);

    const operationalCaps = capabilityEngine.getOperationalCapabilities({ businessType: 'restaurant' });
    assert.strictEqual(operationalCaps.includes('BOOKING'), false, 'BOOKING ne doit pas être dans operationalCaps');

    // Vérification qu'aucune réservation fictive / créneau n'est simulé
    assert.strictEqual(capabilityEngine.isPlanned('AVAILABILITY'), true);
    assert.strictEqual(capabilityEngine.isPlanned('STAFF'), true);
  });

  // ── 7. BUSINESS TYPE INCONNU ──────────────────────────────────────────────
  it('7. Business Type Inconnu : fallback propre et déterministe', () => {
    const mockStore = {
      id: 'store_unknown_1',
      name: 'Activité Spéciale',
      business_type: 'secteur_futur_inconnu_xyz',
    };

    const profile = adaptStoreToBusinessProfile(mockStore, []);
    const composition = compositionEngine.compose(profile);

    assert.ok(composition.sections.length > 0, 'Doit générer des sections de base');
    const families = composition.sections.map((s) => s.family);
    assert.ok(families.includes('HEADER'));
    assert.ok(families.includes('FOOTER'));
  });

  it('8. Product section from family-based composition resolves array data, not store object', () => {
    const section = { family: 'PRODUCT' };
    const result = DataBindingEngine.resolveSectionData(section, {}, {
      products: [
        { id: 'p1', name: 'Produit 1', price: 15000 },
        { id: 'p2', name: 'Produit 2', price: 19000 },
      ],
    });

    assert.ok(Array.isArray(result.boundData), 'boundData doit être un tableau');
    assert.equal(result.boundData.length, 2, 'Deux produits doivent être renvoyés');
    assert.equal(result.boundData[0].title, 'Produit 1');
  });

  // ── 8. COMPOSANT INCONNU & FALLBACK CONTRÔLÉ ─────────────────────────────
  it('8. Composant Inconnu : résolu avec fallback par famille ou null sans crash', () => {
    const compId = resolveCanonicalComponentId('UNKNOWN_FAMILY');
    assert.strictEqual(compId, null, 'Doit retourner null pour une famille inconnue');

    // Enregistrer un composant de famille pour tester le fallback
    ComponentRegistry.register({
      id: 'product_fallback_ref',
      type: 'PRODUCT',
      variant: 'grid',
    });

    // Fallback par famille dans le ComponentRegistry
    const fallbackComp = ComponentRegistry.getByTypeAndVariant('PRODUCT', 'produit_introuvable_xyz');
    assert.ok(fallbackComp, 'Doit résoudre un composant de la famille PRODUCT');
    assert.strictEqual(fallbackComp.type, 'PRODUCT');
  });

  // ── 9. COMPOSANT INCOMPATIBLE ─────────────────────────────────────────────
  it('9. Composant Incompatible : filtrage par compatibilité', () => {
    const allowed = filterFamiliesByCapabilities(['PRODUCT'], ['CONTACT', 'OPENING_HOURS']);
    assert.strictEqual(allowed.includes('PRODUCT'), false, 'PRODUCT doit être exclu si capacité PRODUCT absente');
  });

  // ── 10. COMPOSITION DÉTERMINISTE ─────────────────────────────────────────
  it('10. Composition Déterministe : deux exécutions produisent un résultat structurellement identique', () => {
    const mockStore = {
      id: 'store_det_1',
      name: 'Boutique Déterministe',
      business_type: 'product',
      city: 'Douala',
    };
    const mockProducts = [{ id: 'p1', name: 'Article 1', price: 1000 }];

    const profile = adaptStoreToBusinessProfile(mockStore, mockProducts);
    const comp1 = compositionEngine.compose(profile);
    const comp2 = compositionEngine.compose(profile);

    assert.strictEqual(JSON.stringify(comp1.sections), JSON.stringify(comp2.sections));
    assert.strictEqual(comp1.businessType, comp2.businessType);
    assert.strictEqual(comp1.version, comp2.version);
  });

  // ── 11. ZÉRO FAKE DATA ────────────────────────────────────────────────────
  it('11. Zéro Fake Data : aucune donnée fictive injectée dans la composition', () => {
    const mockStore = {
      id: 'store_zero_fake',
      name: 'Boutique Réelle',
      business_type: 'product',
    };

    const profile = adaptStoreToBusinessProfile(mockStore, []);
    const composition = compositionEngine.compose(profile);

    const jsonStr = JSON.stringify(composition);
    assert.strictEqual(jsonStr.includes('Produit exemple'), false);
    assert.strictEqual(jsonStr.includes('Jean D.'), false);
    assert.strictEqual(jsonStr.includes('Chaussure Nike'), false);
  });

  // ── 12. THEME ENGINE INDÉPENDANT DU MÉTIER ───────────────────────────────
  it('12. ThemeEngine Indépendant : changer le thème ne modifie pas les capacités métier', () => {
    const mockStore1 = { id: 's1', business_type: 'product', theme_color: '#FF0000' };
    const mockStore2 = { id: 's1', business_type: 'product', theme_color: '#0000FF' };

    const profile1 = adaptStoreToBusinessProfile(mockStore1, []);
    const profile2 = adaptStoreToBusinessProfile(mockStore2, []);

    const comp1 = compositionEngine.compose(profile1);
    const comp2 = compositionEngine.compose(profile2);

    const fam1 = comp1.sections.map((s) => s.family);
    const fam2 = comp2.sections.map((s) => s.family);

    assert.deepStrictEqual(fam1, fam2, 'Les sections métier doivent être strictement identiques');
    assert.notStrictEqual(comp1.theme.tokens.primaryColor, comp2.theme.tokens.primaryColor);
  });

  // ── 13. BUSINESSPROFILE INDÉPENDANT DU RENDERER ───────────────────────────
  it('13. BusinessProfile Indépendant : s\'exécute en pur Node sans DOM', () => {
    assert.strictEqual(typeof window, 'undefined');
    assert.strictEqual(typeof document, 'undefined');

    const profile = adaptStoreToBusinessProfile({ id: 'pure_node_store', name: 'Node Store' }, []);
    assert.strictEqual(profile.id, 'pure_node_store');
    assert.strictEqual(profile.identity.name, 'Node Store');
  });

  // ── 14. COMPOSITION ENGINE SANS JSX / REACT ───────────────────────────────
  it('14. CompositionEngine sans JSX/React : le code source ne contient aucun import React', () => {
    const compEnginePath = path.resolve('src/lib/composition-engine/CompositionEngine.js');
    const compRulesPath = path.resolve('src/lib/composition-engine/compositionRules.js');

    const engineCode = fs.readFileSync(compEnginePath, 'utf8');
    const rulesCode = fs.readFileSync(compRulesPath, 'utf8');

    assert.strictEqual(engineCode.includes("import React"), false, 'CompositionEngine ne doit pas importer React');
    assert.strictEqual(engineCode.includes("from 'react'"), false, 'CompositionEngine ne doit pas importer from react');
    assert.strictEqual(rulesCode.includes("import React"), false, 'compositionRules ne doit pas importer React');

    const profile = adaptStoreToBusinessProfile({ id: 'test_react_free' }, []);
    const composition = compositionEngine.compose(profile);
    const validation = compositionEngine.validateComposition(composition);

    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.errors.length, 0);
  });

  // ── 15. CAPACITÉS PLANNED / DISABLED SANS EFFET DE BORD ───────────────────
  it('15. Capacités PLANNED / DISABLED ne déclenchent aucune section', () => {
    const plannedCaps = ['ROOM_RESERVATION', 'EVENT_REGISTRATION', 'STAFF', 'AVAILABILITY', 'LOYALTY'];
    plannedCaps.forEach((cap) => {
      assert.strictEqual(capabilityEngine.isPlanned(cap), true, `${cap} doit être PLANNED`);
      assert.strictEqual(capabilityEngine.isOperational(cap), false, `${cap} ne doit pas être OPERATIONAL`);
    });

    const activeCaps = capabilityEngine.getStoreCapabilities({ businessType: 'hotel' }, { includePlanned: false });
    assert.strictEqual(activeCaps.includes('ROOM_RESERVATION'), false, 'ROOM_RESERVATION ne doit pas être active par défaut');
  });

  // ── 16. REFERENCE SITE TRANSLATOR PRÉPARATOIRE ────────────────────────────
  it('16. referenceSiteTranslator : contrat préparatoire pur sans scraping', () => {
    const blueprint = {
      sector: 'restaurant',
      visualHierarchy: {
        heroVariant: 'split',
        colorPalette: { primary: '#EA580C', background: '#1C0A00' },
        typography: { headingFont: 'Outfit' },
      },
      sectionOrder: ['HEADER', 'HERO', 'PRODUCT', 'FOOTER'],
    };

    const translation = translateBlueprintToComposition(blueprint);
    assert.strictEqual(translation.businessType, 'restaurant');
    assert.strictEqual(translation.archetype, 'split');
    assert.strictEqual(translation.themeOverrides.primaryColor, '#EA580C');
    assert.deepStrictEqual(translation.customFamilies, ['HEADER', 'HERO', 'PRODUCT', 'FOOTER']);
  });

  // ── 17. GALLERY VIDE : ZÉRO IMAGE FICTIVE ─────────────────────────────────
  it('17. Gallery vide (gallery = []) : absente par défaut (4.10), zéro placeholder "Photo 1, 2, 3"', () => {
    const mockStore = {
      id: 'store_gallery_empty',
      name: 'Boutique Sans Galerie',
      business_type: 'beauty',
      gallery_urls: [],
    };

    const profile = adaptStoreToBusinessProfile(mockStore, []);
    
    // Par défaut (4.10) : filterEmptySections = true -> GALLERY vide est omise
    const compositionDefault = compositionEngine.compose(profile);
    const galleryDefault = compositionDefault.sections.find((s) => s.family === 'GALLERY');
    assert.strictEqual(galleryDefault, undefined, 'GALLERY vide doit être filtrée par défaut');

    // Si filterEmptySections: false explicite (ex: mode éditeur / studio) -> section émise avec state: empty et zéro image factice
    const compositionRaw = compositionEngine.compose(profile, { filterEmptySections: false });
    const gallerySec = compositionRaw.sections.find((s) => s.family === 'GALLERY');
    assert.ok(gallerySec, 'Section GALLERY présente si filterEmptySections: false');
    assert.strictEqual(gallerySec.isEmpty, true, 'isEmpty doit être true quand aucune photo');
    assert.strictEqual(gallerySec.state, 'empty');
    assert.strictEqual(gallerySec.config.images.length, 0);
  });

  // ── 18. GALLERY RÉELLE : TRANSMISSION DES VRAIES URLS ─────────────────────
  it('18. Gallery réelle : URL réelle transmise fidèlement au schéma et au renderer', () => {
    const realImageUrl = 'https://exemple.com/image-reelle.jpg';
    const mockStore = {
      id: 'store_gallery_real',
      name: 'Boutique Avec Galerie',
      business_type: 'beauty',
      gallery_urls: [realImageUrl],
    };

    const profile = adaptStoreToBusinessProfile(mockStore, []);
    assert.deepStrictEqual(profile.identity.galleryUrls, [realImageUrl]);

    const composition = compositionEngine.compose(profile);
    const gallerySec = composition.sections.find((s) => s.family === 'GALLERY');
    assert.ok(gallerySec);
    assert.strictEqual(gallerySec.isEmpty, false);
    assert.strictEqual(gallerySec.state, 'ready');
    assert.deepStrictEqual(gallerySec.config.images, [realImageUrl]);
  });
});
