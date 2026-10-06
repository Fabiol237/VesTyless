import test from 'node:test';
import assert from 'node:assert/strict';
import { BusinessProfileSchema } from '../src/lib/business-profile/businessProfileSchema.js';

test('BusinessProfileSchema parses a valid complete profile', () => {
  const sampleProfile = {
    id: 'store_12345',
    ownerId: 'user_67890',
    identity: {
      name: 'Vestin Elegance',
      slug: 'vestin-elegance',
      description: 'Haute couture africaine et prêt-à-porter',
      slogan: 'L\'élégance au quotidien',
      logo: 'https://images.unsplash.com/photo-logo.jpg',
      coverImage: 'https://images.unsplash.com/photo-banner.jpg',
      phone: '+237699000000',
      whatsapp: '+237699000000',
      email: 'contact@vestin.cm',
      address: 'Boulevard de la Liberté, Akwa',
      city: 'Douala',
      country: 'Cameroun',
    },
    business: {
      type: 'product',
      category: 'Mode & Beauté',
      status: 'active',
    },
    capabilities: {
      PRODUCT: true,
      CART: true,
      DELIVERY: true,
      PAYMENT: true,
    },
    commerce: {
      currency: 'FCFA',
      minOrderAmount: 5000,
      paymentMethods: ['cash_on_delivery', 'orange_money', 'mtn_momo'],
    },
    catalog: {
      products: [
        {
          id: 'prod_1',
          name: 'Robe Wax Prestige',
          price: 25000,
          stock: 10,
          moq: 1,
          isActive: true,
        },
      ],
      categories: ['Robes', 'Wax'],
    },
    storefront: {
      templateId: 'boutique_pro',
      themeId: 'theme_00',
      theme: {
        primaryColor: '#128C7E',
        accentColor: '#25D366',
        bgColor: '#FFFFFF',
        textColor: '#0F172A',
        font: 'Inter',
      },
    },
    metadata: {
      source: 'vestin_v1',
      version: '1.0.0',
    },
  };

  const parsed = BusinessProfileSchema.parse(sampleProfile);
  assert.equal(parsed.id, 'store_12345');
  assert.equal(parsed.identity.name, 'Vestin Elegance');
  assert.equal(parsed.catalog.products.length, 1);
  assert.equal(parsed.catalog.products[0].price, 25000);
  assert.equal(parsed.capabilities.PRODUCT, true);
});

test('BusinessProfileSchema rejects an invalid profile missing identity name', () => {
  const invalidProfile = {
    id: 'store_err',
    identity: {
      name: '', // Invalide : vide
      slug: 'slug-ok',
    },
    business: {
      type: 'product',
    },
  };

  assert.throws(() => {
    BusinessProfileSchema.parse(invalidProfile);
  });
});

test('BusinessProfileSchema applies safe default values for missing optional fields', () => {
  const minimalProfile = {
    id: 'store_min',
    identity: {
      name: 'Boutique Express',
      slug: 'boutique-express',
    },
    business: {
      type: 'product',
    },
    commerce: {},
    storefront: {},
    metadata: {},
  };

  const parsed = BusinessProfileSchema.parse(minimalProfile);
  assert.equal(parsed.identity.city, 'Douala');
  assert.equal(parsed.identity.country, 'Cameroun');
  assert.equal(parsed.commerce.currency, 'FCFA');
  assert.equal(parsed.commerce.minOrderAmount, 0);
  assert.equal(parsed.business.status, 'active');
  assert.deepEqual(parsed.catalog.products, []);
});
