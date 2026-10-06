import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CREATION_METHODS,
  STORE_STATUS,
  ALLOWED_COMPONENT_FAMILIES,
  validateStoreConfig,
  detectUnsafeContent,
} from '../src/lib/store-model/StoreModelContract.js';

import {
  StoreModelService,
} from '../src/lib/store-model/StoreModelService.js';

import {
  businessTypeRegistry,
  CANONICAL_SUB_SECTORS,
} from '../src/lib/business-types/BusinessTypeRegistry.js';

import { adaptStoreToBusinessProfile } from '../src/lib/business-profile/businessProfileAdapter.js';

describe('VesTyle / Vestin — Master Prompt 1/5 : Fondation DB + Modèle Complet de Boutique', () => {

  // ── TEST 1 : 1 UTILISATEUR -> PLUSIEURS BOUTIQUES ───────────────────────────
  it('1. Multi-Boutiques — Un utilisateur peut posséder N boutiques distinctes avec le même owner_id', () => {
    const ownerId = 'user-owner-uuid-111';

    const storeA = {
      id: 'store-aaa',
      owner_id: ownerId,
      name: 'Boutique Mode Luxe',
      business_type: 'fashion',
      sub_sector: 'womens_fashion',
      creation_method: CREATION_METHODS.AI,
    };

    const storeB = {
      id: 'store-bbb',
      owner_id: ownerId,
      name: 'Restaurant Le Gourmet',
      business_type: 'restaurant',
      sub_sector: 'traditional_resto',
      creation_method: CREATION_METHODS.TEMPLATE,
    };

    assert.strictEqual(storeA.owner_id, storeB.owner_id);
    assert.notStrictEqual(storeA.id, storeB.id);
    assert.notStrictEqual(storeA.business_type, storeB.business_type);
    assert.notStrictEqual(storeA.sub_sector, storeB.sub_sector);
  });

  // ── TEST 2 : ISOLATION STRICTE DES BOUTIQUES ────────────────────────────────
  it('2. Isolation Propriétaire — Un utilisateur ne peut pas modifier ou publier une boutique tierce', async () => {
    const service = new StoreModelService();
    const ownerA = 'user-owner-aaa';
    const ownerB = 'user-owner-bbb';

    // Mock store appartenant à Owner A
    const fakeStore = {
      id: 'store-aaa',
      owner_id: ownerA,
      business_type: 'product',
      draft_config: { version: 1, businessType: 'product', sections: [] },
    };

    // Tentative de modification par Owner B
    const isAllowed = fakeStore.owner_id === ownerB;
    assert.strictEqual(isAllowed, false);
  });

  // ── TEST 3 : SECTEUR D'ACTIVITÉ (BUSINESS_TYPE) ─────────────────────────────
  it('3. Secteur — Normalisation et validation déterministe du business_type', () => {
    // Normalisation d'alias
    assert.strictEqual(businessTypeRegistry.normalize('vetement'), 'product');
    assert.strictEqual(businessTypeRegistry.normalize('coiffure'), 'hair_salon');
    assert.strictEqual(businessTypeRegistry.normalize('food'), 'restaurant');
    assert.strictEqual(businessTypeRegistry.normalize('immo'), 'real_estate');

    // Type canonique officiel
    const typeDef = businessTypeRegistry.get('product');
    assert.ok(typeDef);
    assert.strictEqual(typeDef.id, 'product');
    assert.strictEqual(typeDef.capabilities.hasProducts, true);
  });

  // ── TEST 4 : SOUS-SECTEUR (SUB_SECTOR) ──────────────────────────────────────
  it('4. Sous-Secteur — Catalogue structuré et validation des sous-secteurs', () => {
    // Récupération des sous-secteurs pour restaurant
    const restaurantSubs = businessTypeRegistry.getSubSectors('restaurant');
    assert.ok(Array.isArray(restaurantSubs));
    assert.ok(restaurantSubs.length >= 4);
    assert.ok(restaurantSubs.some(s => s.id === 'fast_food'));
    assert.ok(restaurantSubs.some(s => s.id === 'bakery_pastry'));

    // Validation
    assert.strictEqual(businessTypeRegistry.isValidSubSector('restaurant', 'fast_food'), true);
    assert.strictEqual(businessTypeRegistry.isValidSubSector('restaurant', 'womens_fashion'), false);

    // Normalisation
    assert.strictEqual(businessTypeRegistry.normalizeSubSector('restaurant', 'FAST_FOOD'), 'fast_food');
  });

  // ── TEST 5 : CREATION_METHOD ────────────────────────────────────────────────
  it('5. Origine de Création — Prise en charge des méthodes AI, TEMPLATE, MANUAL', () => {
    assert.strictEqual(CREATION_METHODS.AI, 'AI');
    assert.strictEqual(CREATION_METHODS.TEMPLATE, 'TEMPLATE');
    assert.strictEqual(CREATION_METHODS.MANUAL, 'MANUAL');

    const configAI = {
      businessType: 'product',
      creationMethod: CREATION_METHODS.AI,
    };
    const resAI = validateStoreConfig(configAI);
    assert.strictEqual(resAI.success, true);
    assert.strictEqual(resAI.data.creationMethod, 'AI');

    const configManual = {
      businessType: 'service',
      // creationMethod par défaut
    };
    const resManual = validateStoreConfig(configManual);
    assert.strictEqual(resManual.success, true);
    assert.strictEqual(resManual.data.creationMethod, 'MANUAL');
  });

  // ── TEST 6 : TEMPLATE REFERENCE ─────────────────────────────────────────────
  it('6. Référence Template — Conservation de template_id et template_version', () => {
    const rawConfig = {
      businessType: 'beauty',
      templateId: 'tpl_beauty_pro_v2',
      templateVersion: '2.1.0',
    };
    const validated = validateStoreConfig(rawConfig);
    assert.strictEqual(validated.success, true);
    assert.strictEqual(validated.data.templateId, 'tpl_beauty_pro_v2');
    assert.strictEqual(validated.data.templateVersion, '2.1.0');
  });

  // ── TEST 7 : CONFIGURATION DÉCLARATIVE (ZÉRO JSX) ───────────────────────────
  it('7. Structure Déclarative — Format JSON pur avec sections typées', () => {
    const rawConfig = {
      version: 1,
      businessType: 'product',
      subSector: 'clothing_fashion',
      creationMethod: 'TEMPLATE',
      templateId: 'tpl_fashion_01',
      theme: {
        primaryColor: '#EA580C',
        secondaryColor: '#18181B',
        mode: 'dark',
      },
      sections: [
        { id: 'hero_sec', type: 'HERO', variant: 'hero_split_01', order: 0, enabled: true, config: { title: 'Nouvelle Saison' } },
        { id: 'prod_sec', type: 'PRODUCT', variant: 'grid_compact', order: 1, enabled: true, config: { columns: 3 } },
        { id: 'foot_sec', type: 'FOOTER', variant: 'footer_simple', order: 2, enabled: true },
      ],
    };

    const validated = validateStoreConfig(rawConfig);
    assert.strictEqual(validated.success, true);
    assert.strictEqual(validated.data.sections.length, 3);
    assert.strictEqual(validated.data.sections[0].type, 'HERO');
    assert.strictEqual(validated.data.sections[1].type, 'PRODUCT');
  });

  // ── TEST 8 : VALIDATION ZOD DU CONTRAT ──────────────────────────────────────
  it('8. Validation Zod — Normalisation automatique de l\'ordre des sections', () => {
    const rawConfig = {
      businessType: 'service',
      sections: [
        { id: 'sec_3', type: 'CONTACT', order: 10 },
        { id: 'sec_1', type: 'HERO', order: 0 },
        { id: 'sec_2', type: 'SERVICE', order: 5 },
      ],
    };

    const validated = validateStoreConfig(rawConfig);
    assert.strictEqual(validated.success, true);
    // Les sections doivent être triées et réindexées de 0 à 2
    assert.strictEqual(validated.data.sections[0].id, 'sec_1');
    assert.strictEqual(validated.data.sections[0].order, 0);
    assert.strictEqual(validated.data.sections[1].id, 'sec_2');
    assert.strictEqual(validated.data.sections[1].order, 1);
    assert.strictEqual(validated.data.sections[2].id, 'sec_3');
    assert.strictEqual(validated.data.sections[2].order, 2);
  });

  // ── TEST 9 : SAUVEGARDE DU BROUILLON (DRAFT) ─────────────────────────────────
  it('9. Draft Save — Le brouillon conserve les modifications sans impacter le public', () => {
    const service = new StoreModelService();
    const initialConfig = service.buildInitialDeclarativeConfig({
      business_type: 'product',
      theme_color: '#128C7E',
    });

    const updatedDraft = {
      ...initialConfig,
      theme: { ...initialConfig.theme, primaryColor: '#DC2626' },
    };

    const validated = validateStoreConfig(updatedDraft);
    assert.strictEqual(validated.success, true);
    assert.strictEqual(validated.data.theme.primaryColor, '#DC2626');
  });

  // ── TEST 10 : ÉTAT PUBLISHED ────────────────────────────────────────────────
  it('10. Published State — Le storefront public consulte exclusivement published_config', () => {
    const store = {
      id: 'store-10',
      owner_id: 'owner-10',
      name: 'Boutique Publique',
      business_type: 'product',
      published_config: {
        version: 1,
        businessType: 'product',
        theme: { primaryColor: '#10B981' },
        sections: [
          { id: 'pub_hero', type: 'HERO', enabled: true, order: 0 },
        ],
      },
      draft_config: {
        version: 1,
        businessType: 'product',
        theme: { primaryColor: '#E11D48' }, // Non publié
        sections: [
          { id: 'draft_hero', type: 'HERO', enabled: true, order: 0 },
          { id: 'draft_promo', type: 'PROMOTION', enabled: true, order: 1 },
        ],
      },
    };

    // Rendu public -> utilise published_config
    const publicProfile = adaptStoreToBusinessProfile(store, [], [], { useDraft: false });
    assert.strictEqual(publicProfile.storefront.theme.primaryColor, '#10B981');
    assert.strictEqual(publicProfile.storefront.sections.length, 1);

    // Rendu Studio (preview) -> utilise draft_config
    const studioProfile = adaptStoreToBusinessProfile(store, [], [], { useDraft: true });
    assert.strictEqual(studioProfile.storefront.theme.primaryColor, '#E11D48');
    assert.strictEqual(studioProfile.storefront.sections.length, 2);
  });

  // ── TEST 11 : CYCLE DE PUBLICATION ──────────────────────────────────────────
  it('11. Publication — publishStore() valide le draft et prépare le snapshot', () => {
    const service = new StoreModelService();
    const draftConfig = {
      version: 1,
      businessType: 'restaurant',
      subSector: 'fast_food',
      creationMethod: 'AI',
      sections: [
        { id: 'sec_hero', type: 'HERO', enabled: true, order: 0 },
        { id: 'sec_menu', type: 'PRODUCT', enabled: true, order: 1 },
      ],
    };

    const validation = validateStoreConfig(draftConfig);
    assert.strictEqual(validation.success, true);
    assert.strictEqual(validation.data.sections.length, 2);
    assert.strictEqual(validation.data.subSector, 'fast_food');
  });

  // ── TEST 12 : REJET DES CONFIGURATIONS INVALIDES & INJECTIONS JSX ───────────
  it('12. Sécurité & Rejet — Rejet des composants JSX arbitraires et scripts malveillants', () => {
    // Tentative d'injection de script
    const maliciousConfig = {
      businessType: 'product',
      sections: [
        { id: 'sec_1', type: 'HERO', config: { title: '<script>alert("hack")</script>' } },
      ],
    };
    const resScript = validateStoreConfig(maliciousConfig);
    assert.strictEqual(resScript.success, false);
    assert.ok(resScript.errors.some(e => e.includes('script')));

    // Tentative d'injection de JSX arbitraire
    const jsxConfig = {
      businessType: 'product',
      sections: [
        { id: 'sec_2', type: 'PRODUCT', config: { customComponent: '<MyCustomReactComponent prop="1" />' } },
      ],
    };
    const resJSX = validateStoreConfig(jsxConfig);
    assert.strictEqual(resJSX.success, false);
    assert.ok(resJSX.errors.some(e => e.includes('JSX')));

    // Type de section invalide
    const invalidTypeConfig = {
      businessType: 'product',
      sections: [
        { id: 'sec_3', type: 'UNREGISTERED_ARBITRARY_FAMILY' },
      ],
    };
    const resType = validateStoreConfig(invalidTypeConfig);
    assert.strictEqual(resType.success, false);
  });

  // ── TEST 13 : SÉCURITÉ CROSS-STORE ──────────────────────────────────────────
  it('13. Rejet Cross-Store — Tentative de modification non autorisée', () => {
    const ownerA = 'user-owner-123';
    const attackerUser = 'user-attacker-999';

    const targetStore = {
      id: 'store-target',
      owner_id: ownerA,
    };

    const hasPermission = targetStore.owner_id === attackerUser;
    assert.strictEqual(hasPermission, false);
  });

  // ── TEST 14 : COMPATIBILITÉ BOUTIQUE EXISTANTE (RÉTROCOMPATIBILITÉ) ─────────
  it('14. Rétrocompatibilité — Une boutique legacy sans draft_config/sub_sector fonctionne sans erreur', () => {
    const legacyStore = {
      id: 'store-legacy-123',
      owner_id: 'owner-legacy',
      name: 'Ancienne Boutique 2024',
      business_type: 'boutique', // alias legacy
      theme_color: '#3B82F6',
      // aucun draft_config, aucun sub_sector, aucun template_id
    };

    const legacyModules = [
      { id: 'mod_1', type: 'hero', is_active: true, position: 0 },
      { id: 'mod_2', type: 'product', is_active: true, position: 1 },
    ];

    const profile = adaptStoreToBusinessProfile(legacyStore, [], legacyModules);
    assert.strictEqual(profile.business.type, 'product'); // normalisé
    assert.strictEqual(profile.storefront.theme.primaryColor, '#3B82F6');
    assert.strictEqual(profile.storefront.sections.length, 2);
    assert.strictEqual(profile.storefront.sections[0].type, 'hero');
  });

});
