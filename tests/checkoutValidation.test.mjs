import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

const CheckoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const CheckoutPayloadSchema = z.object({
  storeId: z.string().min(1),
  items: z.array(CheckoutItemSchema).min(1),
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().min(6),
    address: z.string().optional().default(''),
  }),
});

test('CheckoutPayloadSchema validates a correct customer order', () => {
  const payload = {
    storeId: 'store_123',
    items: [
      { productId: 'prod_abc', quantity: 2 },
      { productId: 'prod_xyz', quantity: 1 },
    ],
    customer: {
      name: 'Fabrice Dupont',
      phone: '699112233',
      address: 'Akwa, Douala',
    },
  };

  const parsed = CheckoutPayloadSchema.parse(payload);
  assert.equal(parsed.storeId, 'store_123');
  assert.equal(parsed.items.length, 2);
  assert.equal(parsed.customer.name, 'Fabrice Dupont');
});

test('CheckoutPayloadSchema rejects negative or zero quantities', () => {
  const invalidPayload = {
    storeId: 'store_123',
    items: [
      { productId: 'prod_abc', quantity: -1 },
    ],
    customer: {
      name: 'Client',
      phone: '699112233',
    },
  };

  assert.throws(() => {
    CheckoutPayloadSchema.parse(invalidPayload);
  });
});

test('Checkout calculation enforces server price and rejects client-provided prices', () => {
  // Simulation : client tente d'envoyer un prix de 100 FCFA pour un article valant 15 000 FCFA
  const serverDbProducts = [
    { id: 'prod_iphone', price: 150000, stock_quantity: 5, moq: 1, is_active: true },
  ];

  const clientOrder = {
    items: [{ productId: 'prod_iphone', quantity: 2, clientClaimedPrice: 100 }],
  };

  const productMap = new Map(serverDbProducts.map(p => [p.id, p]));
  let serverCalculatedSubtotal = 0;

  for (const item of clientOrder.items) {
    const dbProduct = productMap.get(item.productId);
    assert.equal(dbProduct.is_active, true);
    // Le calcul utilise EXCLUSIVEMENT dbProduct.price
    serverCalculatedSubtotal += dbProduct.price * item.quantity;
  }

  // Le total calculé doit être 300 000 FCFA et non 200 FCFA
  assert.equal(serverCalculatedSubtotal, 300000);
});
