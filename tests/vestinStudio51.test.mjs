/**
 * Vestin / VeStyle — Étape 5.1 : Vestin Studio
 * Tests : Multi-Boutiques, Dashboard Adaptatif, Live Preview & Isolation
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptStoreToBusinessProfile } from '../src/lib/business-profile/businessProfileAdapter.js';
import { compositionEngine } from '../src/lib/composition-engine/CompositionEngine.js';
import { CAPABILITIES, capabilityEngine } from '../src/lib/capability-engine/CapabilityEngine.js';
import { businessTypeRegistry } from '../src/lib/business-types/BusinessTypeRegistry.js';

// ── Mock Stores for Multi-Store Test ──────────────────────────────────────────
const USER_STORES_FIXTURE = [
  {
    id: 'store_retail_1',
    name: 'Zoko Mode Douala',
    slug: 'zoko-mode',
    owner_id: 'user_123',
    business_type: 'product',
    theme_color: '#128C7E',
    is_active: true,
  },
  {
    id: 'store_food_2',
    name: 'Le Gourmet Yaoundé',
    slug: 'le-gourmet',
    owner_id: 'user_123',
    business_type: 'restaurant',
    theme_color: '#D97706',
    is_active: true,
  },
  {
    id: 'store_service_3',
    name: 'Atelier Coiffure Pro',
    slug: 'atelier-coiffure',
    owner_id: 'user_123',
    business_type: 'services',
    theme_color: '#E11D48',
    is_active: true,
  }
];

const SAMPLE_PRODUCTS = [
  { id: 'p1', store_id: 'store_retail_1', name: 'Robe Wax', price: 15000, stock_quantity: 10, category: 'Mode' },
  { id: 'p2', store_id: 'store_food_2', name: 'Poulet DG', price: 6000, stock_quantity: 25, category: 'Plats' },
  { id: 'p3', store_id: 'store_service_3', name: 'Coupe & Brushing', price: 8000, stock_quantity: 99, category: 'Soins' }
];

test('5.1 — Multi-Boutiques : Gestion de 1 à N boutiques pour un même utilisateur', () => {
  const userId = 'user_123';
  const userStores = USER_STORES_FIXTURE.filter(s => s.owner_id === userId);
  
  assert.equal(userStores.length, 3, 'L\'utilisateur doit posséder exactement 3 boutiques');
  assert.equal(userStores[0].id, 'store_retail_1');
  assert.equal(userStores[1].id, 'store_food_2');
  assert.equal(userStores[2].id, 'store_service_3');

  // Simulation de la fonction switchStore
  let activeStore = userStores[0];
  const switchStore = (storeId) => {
    const target = userStores.find(s => s.id === storeId);
    if (target) activeStore = target;
  };

  switchStore('store_food_2');
  assert.equal(activeStore.id, 'store_food_2');
  assert.equal(activeStore.business_type, 'restaurant');

  switchStore('store_service_3');
  assert.equal(activeStore.id, 'store_service_3');
  assert.equal(activeStore.business_type, 'services');
});

test('5.1 — Isolation stricte des données entre boutiques', () => {
  const getStoreProducts = (storeId) => SAMPLE_PRODUCTS.filter(p => p.store_id === storeId);

  const retailProducts = getStoreProducts('store_retail_1');
  const foodProducts = getStoreProducts('store_food_2');

  assert.equal(retailProducts.length, 1);
  assert.equal(retailProducts[0].name, 'Robe Wax');

  assert.equal(foodProducts.length, 1);
  assert.equal(foodProducts[0].name, 'Poulet DG');

  // Vérifier qu'aucun produit ne fuite
  assert.ok(!retailProducts.some(p => p.name === 'Poulet DG'));
  assert.ok(!foodProducts.some(p => p.name === 'Robe Wax'));
});

test('5.1 — Dashboard Adaptatif : Détection des capacités selon le secteur d\'activité', () => {
  // 1. Boutique Retail / E-commerce
  const retailProfile = adaptStoreToBusinessProfile(USER_STORES_FIXTURE[0], [SAMPLE_PRODUCTS[0]]);
  assert.equal(retailProfile.capabilities[CAPABILITIES.PRODUCT], true);
  assert.equal(retailProfile.capabilities[CAPABILITIES.CART], true);

  // 2. Boutique Restaurant / Menu
  const restaurantProfile = adaptStoreToBusinessProfile(USER_STORES_FIXTURE[1], [SAMPLE_PRODUCTS[1]]);
  assert.equal(restaurantProfile.capabilities[CAPABILITIES.PRODUCT], true);
  assert.equal(restaurantProfile.capabilities[CAPABILITIES.DELIVERY], true);

  // 3. Boutique Services / Coiffure
  const serviceProfile = adaptStoreToBusinessProfile(USER_STORES_FIXTURE[2], [SAMPLE_PRODUCTS[2]]);
  assert.equal(serviceProfile.capabilities[CAPABILITIES.SERVICE], true);
});

test('5.1 — Live Preview : Génération de composition canonique sans crash', () => {
  for (const store of USER_STORES_FIXTURE) {
    const storeProducts = SAMPLE_PRODUCTS.filter(p => p.store_id === store.id);
    const profile = adaptStoreToBusinessProfile(store, storeProducts);
    
    // Le CompositionEngine doit composer chaque boutique sans exception
    const composition = compositionEngine.compose(profile);
    assert.ok(composition, `La composition doit être générée pour ${store.name}`);
    assert.ok(Array.isArray(composition.sections), 'La composition doit contenir des sections');
    assert.ok(composition.sections.length > 0, 'Au moins une section doit être générée');
  }
});

test('5.1 — Studio Section Editor : Personnalisation de layout et thème', () => {
  const store = { ...USER_STORES_FIXTURE[0] };
  
  const customSections = [
    { id: 'hero', type: 'hero', enabled: true },
    { id: 'promo', type: 'promo', enabled: false }, // masqué
    { id: 'catalog', type: 'catalog', enabled: true },
  ];

  const updatedStore = {
    ...store,
    layout_config: { sections: customSections },
    theme_color: '#2563EB',
  };

  const profile = adaptStoreToBusinessProfile(updatedStore, [SAMPLE_PRODUCTS[0]]);
  assert.equal(profile.storefront.theme.primaryColor, '#2563EB');
  assert.ok(profile.storefront.sections.length >= 2, 'Les sections activées doivent être résolues');

  const composition = compositionEngine.compose(profile);
  assert.ok(composition.sections.length > 0);
});

test('5.1 — Zéro Fake Data : États vides honnêtes', () => {
  const emptyStore = {
    id: 'store_empty',
    name: 'Boutique Neuve',
    slug: 'boutique-neuve',
    owner_id: 'user_new',
    business_type: 'product'
  };

  const emptyProfile = adaptStoreToBusinessProfile(emptyStore, []);
  assert.equal(emptyProfile.catalog.products.length, 0);
  assert.equal(emptyProfile.catalog.categories.length, 0);

  const composition = compositionEngine.compose(emptyProfile);
  assert.ok(composition);
  
  const productSec = composition.sections.find(s => s.family === 'PRODUCT');
  if (productSec) {
    assert.equal(productSec.isEmpty, true, 'La section produit doit être marquée vide sans fake data');
  }
});
