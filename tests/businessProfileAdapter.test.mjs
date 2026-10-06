import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptStoreToBusinessProfile } from '../src/lib/business-profile/businessProfileAdapter.js';

test('adaptStoreToBusinessProfile transforms a legacy store without type into BusinessProfile with "unspecified" type (zero silent product conversion)', () => {
  const legacyStore = {
    id: 'store_legacy_1',
    name: 'Boutique Cameroun',
    slug: 'boutique-cameroun',
    description: 'Vente en ligne de chaussures et sacs',
    theme_color: '#059669',
    currency: 'FCFA',
    is_active: true,
  };

  const profile = adaptStoreToBusinessProfile(legacyStore);

  assert.equal(profile.id, 'store_legacy_1');
  assert.equal(profile.identity.name, 'Boutique Cameroun');
  assert.equal(profile.identity.slug, 'boutique-cameroun');
  assert.equal(profile.storefront.theme.primaryColor, '#059669');
  assert.equal(profile.business.type, 'unspecified', 'Un store sans type ne doit pas devenir silencieusement "product"');
  assert.equal(profile.business.status, 'active');
  assert.equal(profile.capabilities.PRODUCT, true);
  assert.equal(profile.capabilities.ORDER, true);
  assert.equal(profile.metadata.source, 'supabase_legacy');
});

test('adaptStoreToBusinessProfile transforms a legacy store with explicit activity_type: "ecommerce" into "product"', () => {
  const legacyStore = {
    id: 'store_legacy_ecom',
    name: 'Boutique Ecom',
    slug: 'boutique-ecom',
    activity_type: 'ecommerce',
  };

  const profile = adaptStoreToBusinessProfile(legacyStore);
  assert.equal(profile.business.type, 'product');
});

test('adaptStoreToBusinessProfile transforms store + products + modules with proper normalization', () => {
  const legacyStore = {
    id: 'store_full_2',
    name: 'Restaurant La Marmite',
    slug: 'la-marmite',
    business_type: 'restaurant',
    phone: '690000000',
    whatsapp: '690000000',
    city: 'Yaoundé',
  };

  const products = [
    {
      id: 'prod_ndole',
      name: 'Ndolé Royal',
      price: 3500,
      stock_quantity: 15,
      category: 'Plats Chauds',
      image_url: 'https://images.unsplash.com/ndole.jpg',
    },
    {
      id: 'prod_poulet',
      name: 'Poulet DG',
      price: '5000',
      stock: 8,
      category: 'Plats Chauds',
    },
  ];

  const modules = [
    { id: 'mod_hero', type: 'hero', position: 0, is_active: true, config: { title: 'Bienvenue' } },
    { id: 'mod_cat', type: 'category', position: 1, is_active: true, config: {} },
  ];

  const profile = adaptStoreToBusinessProfile(legacyStore, products, modules);

  assert.equal(profile.id, 'store_full_2');
  assert.equal(profile.business.type, 'restaurant');
  assert.equal(profile.capabilities.TABLE_RESERVATION, true);
  assert.equal(profile.catalog.products.length, 2);
  assert.equal(profile.catalog.products[0].price, 3500);
  assert.equal(profile.catalog.products[1].price, 5000);
  assert.equal(profile.catalog.products[0].stock, 15);
  assert.equal(profile.catalog.categories.includes('Plats Chauds'), true);
  assert.equal(profile.storefront.sections.length, 2);
  assert.equal(profile.storefront.sections[0].type, 'hero');
});
