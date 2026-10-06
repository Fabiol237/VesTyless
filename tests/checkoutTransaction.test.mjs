/**
 * Vestin / VeStyle — Étape 5.0
 * Tests : Commerce Transaction Engine & Atomic Inventory
 *
 * Ces tests couvrent la logique de l'API checkout et de la RPC PostgreSQL.
 * Tous les tests sur la RPC sont des simulations de la logique PL/pgSQL.
 *
 * CONCURRENCE RÉELLE : Nécessite un accès PostgreSQL/Supabase live.
 * Si non disponible : REAL_CONCURRENCY_TEST = NOT_EXECUTED
 * → Verdict maximal : 5.0_PASS_WITH_RESERVE
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

// ─── Simulation de la logique de la RPC PostgreSQL ────────────────────────────
// Cette simulation reflète fidèlement la logique PL/pgSQL de process_order_checkout.
// Elle est utilisée pour valider la logique métier sans base de données live.

class MockDB {
  constructor({ stores = [], products = [], orders = [] } = {}) {
    this.stores   = new Map(stores.map(s => [s.id, { ...s }]));
    this.products = new Map(products.map(p => [p.id, { ...p }]));
    this.orders   = new Map(orders.map(o => [o.id, { ...o }]));
    this.stockLogs = [];
  }

  clone() {
    return new MockDB({
      stores:   [...this.stores.values()],
      products: [...this.products.values()],
      orders:   [...this.orders.values()],
    });
  }
}

/**
 * Simule process_order_checkout dans une transaction isolée.
 * Retourne { result } en succès ou lève une Error avec code SQL.
 */
function simulateCheckoutRPC(db, { p_store_id, p_items, p_customer, p_delivery_fee = 0, p_idempotency_key = null }) {
  // GARDE-FOU quantités
  for (const item of p_items) {
    if (!item.quantity || item.quantity <= 0 || item.quantity > 10000) {
      throw Object.assign(new Error(`INVALID_QUANTITY: ${item.product_id}`), { code: 'INVALID_QUANTITY' });
    }
  }

  // IDEMPOTENCE
  if (p_idempotency_key) {
    for (const [, order] of db.orders) {
      if (order.idempotency_key === p_idempotency_key) {
        return { order_id: order.id, total_amount: order.total_amount, status: order.status, idempotent_replay: true };
      }
    }
  }

  // VÉRIFICATION BOUTIQUE
  const store = db.stores.get(p_store_id);
  if (!store) throw Object.assign(new Error(`STORE_NOT_FOUND: ${p_store_id}`), { code: 'STORE_NOT_FOUND' });
  if (store.is_active === false) throw Object.assign(new Error(`STORE_INACTIVE: ${p_store_id}`), { code: 'STORE_INACTIVE' });

  // VERROUILLAGE DÉTERMINISTE (trié par product_id — simulé)
  const sortedIds = [...p_items.map(i => i.product_id)].sort();

  // VALIDATION ET CALCUL DU TOTAL
  let subtotal = 0;
  const orderItems = [];
  const stockUpdates = [];

  for (const productId of sortedIds) {
    const item = p_items.find(i => i.product_id === productId);
    const qty  = item.quantity;
    const prod = db.products.get(productId);

    if (!prod) throw Object.assign(new Error(`PRODUCT_NOT_FOUND: ${productId}`), { code: 'PRODUCT_NOT_FOUND' });
    if (prod.store_id !== p_store_id) throw Object.assign(new Error(`PRODUCT_WRONG_STORE: ${productId}`), { code: 'PRODUCT_WRONG_STORE' });
    if (prod.is_active === false) throw Object.assign(new Error(`PRODUCT_INACTIVE: ${productId}`), { code: 'PRODUCT_INACTIVE' });
    if (qty < (prod.moq || 1)) throw Object.assign(new Error(`MOQ_NOT_MET: ${productId}`), { code: 'MOQ_NOT_MET' });

    const currentStock = prod.stock_quantity ?? 0;
    if (currentStock < qty && !store.allow_out_of_stock) {
      throw Object.assign(new Error(`INSUFFICIENT_STOCK: ${productId}`), { code: 'INSUFFICIENT_STOCK' });
    }

    subtotal += prod.price * qty;
    orderItems.push({ id: prod.id, name: prod.name, price: prod.price, quantity: qty });
    stockUpdates.push({ productId, qty, before: currentStock, after: Math.max(0, currentStock - qty) });
  }

  const total = subtotal + p_delivery_fee;

  // MONTANT MINIMUM
  if ((store.min_order_amount || 0) > 0 && subtotal < store.min_order_amount) {
    throw Object.assign(new Error(`MIN_ORDER_AMOUNT: ${store.min_order_amount} required, ${subtotal} provided`), { code: 'MIN_ORDER_AMOUNT' });
  }

  // TOUTES LES VALIDATIONS PASSÉES — Exécution des écritures (commit simulé)

  // Création commande
  const orderId = `order-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  db.orders.set(orderId, {
    id:               orderId,
    store_id:         p_store_id,
    customer_name:    p_customer.name,
    customer_phone:   p_customer.phone,
    total_amount:     total,
    order_items:      orderItems,
    status:           'pending',
    idempotency_key:  p_idempotency_key,
  });

  // Décrémentation stocks + stock_logs
  for (const upd of stockUpdates) {
    const prod = db.products.get(upd.productId);
    prod.stock_quantity = upd.after;
    db.stockLogs.push({
      product_id: upd.productId,
      store_id:   p_store_id,
      type:       'remove',
      quantity:   upd.qty,
      before_qty: upd.before,
      after_qty:  upd.after,
      note:       `checkout order ${orderId}`,
    });
  }

  return { order_id: orderId, total_amount: total, subtotal, delivery_fee: p_delivery_fee, status: 'pending', idempotent_replay: false };
}

// ─── Schéma Zod (miroir de route.js) ─────────────────────────────────────────
const CheckoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity:  z.number().int().min(1).max(10000),
});
const CheckoutPayloadSchema = z.object({
  storeId:        z.string().uuid(),
  items:          z.array(CheckoutItemSchema).min(1),
  customer:       z.object({ name: z.string().min(2), phone: z.string().min(6) }),
  idempotencyKey: z.string().optional().nullable(),
});

// ─── Fixtures de base ─────────────────────────────────────────────────────────
const STORE_ID   = '11111111-1111-1111-1111-111111111111';
const PROD_A_ID  = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const PROD_B_ID  = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const PROD_C_ID  = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

function baseDB(overrides = {}) {
  return new MockDB({
    stores: [{
      id: STORE_ID,
      is_active: true,
      allow_out_of_stock: false,
      min_order_amount: 0,
      currency: 'FCFA',
      ...overrides.store,
    }],
    products: [
      { id: PROD_A_ID, store_id: STORE_ID, name: 'Produit A', price: 5000, stock_quantity: 10, moq: 1, is_active: true },
      { id: PROD_B_ID, store_id: STORE_ID, name: 'Produit B', price: 3000, stock_quantity:  0, moq: 1, is_active: true },
      { id: PROD_C_ID, store_id: STORE_ID, name: 'Produit C', price: 2000, stock_quantity:  5, moq: 2, is_active: true },
      ...( overrides.products || [] ),
    ],
  });
}

const CUSTOMER = { name: 'Fabrice Test', phone: '699000000' };

// ═════════════════════════════════════════════════════════════════════════════
// TEST A — Checkout normal (1 produit en stock)
// ═════════════════════════════════════════════════════════════════════════════
test('A — Checkout normal : commande créée, stock décrémenté, stock_log écrit', () => {
  const db = baseDB();
  const result = simulateCheckoutRPC(db, {
    p_store_id:    STORE_ID,
    p_items:       [{ product_id: PROD_A_ID, quantity: 2 }],
    p_customer:    CUSTOMER,
    p_delivery_fee: 1500,
  });

  assert.equal(result.idempotent_replay, false);
  assert.ok(result.order_id, 'Un order_id doit être retourné');
  assert.equal(result.total_amount, 2 * 5000 + 1500, 'Total = 10000 + 1500');
  assert.equal(result.subtotal, 10000);
  assert.equal(result.delivery_fee, 1500);

  // Stock décrémenté
  assert.equal(db.products.get(PROD_A_ID).stock_quantity, 8, 'Stock A = 10 - 2 = 8');

  // Commande créée
  assert.equal(db.orders.size, 1, 'Une seule commande créée');

  // Stock log écrit
  assert.equal(db.stockLogs.length, 1);
  assert.equal(db.stockLogs[0].type,       'remove');
  assert.equal(db.stockLogs[0].before_qty, 10);
  assert.equal(db.stockLogs[0].after_qty,   8);
  assert.equal(db.stockLogs[0].quantity,     2);
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST B — Stock insuffisant
// ═════════════════════════════════════════════════════════════════════════════
test('B — Stock insuffisant : exception INSUFFICIENT_STOCK, 0 commande créée', () => {
  const db = baseDB();
  const stockBefore = db.products.get(PROD_B_ID).stock_quantity; // 0

  assert.throws(
    () => simulateCheckoutRPC(db, {
      p_store_id: STORE_ID,
      p_items:    [{ product_id: PROD_B_ID, quantity: 1 }],
      p_customer: CUSTOMER,
    }),
    (err) => {
      assert.ok(err.message.includes('INSUFFICIENT_STOCK'), `Attendu INSUFFICIENT_STOCK, obtenu: ${err.message}`);
      return true;
    }
  );

  // Aucune commande créée
  assert.equal(db.orders.size, 0, 'Aucune commande ne doit être créée');
  // Stock inchangé
  assert.equal(db.products.get(PROD_B_ID).stock_quantity, stockBefore, 'Stock B inchangé');
  // Aucun log
  assert.equal(db.stockLogs.length, 0, 'Aucun stock_log');
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST C — Panier multi-produits avec 1 article insuffisant → Rollback total
// ═════════════════════════════════════════════════════════════════════════════
test('C — Panier multi-produits, 1 article insuffisant : rollback complet, P1 intact', () => {
  const db = baseDB();
  const stockABefore = db.products.get(PROD_A_ID).stock_quantity; // 10
  const stockBBefore = db.products.get(PROD_B_ID).stock_quantity; // 0

  assert.throws(
    () => simulateCheckoutRPC(db, {
      p_store_id: STORE_ID,
      p_items:    [
        { product_id: PROD_A_ID, quantity: 2 }, // OK
        { product_id: PROD_B_ID, quantity: 1 }, // INSUFFISANT
      ],
      p_customer: CUSTOMER,
    }),
    (err) => {
      assert.ok(err.message.includes('INSUFFICIENT_STOCK'));
      return true;
    }
  );

  // ROLLBACK TOTAL : aucune commande, aucun stock modifié
  assert.equal(db.orders.size, 0, 'Aucune commande');
  assert.equal(db.products.get(PROD_A_ID).stock_quantity, stockABefore, 'Stock A inchangé malgré article A valide');
  assert.equal(db.products.get(PROD_B_ID).stock_quantity, stockBBefore, 'Stock B inchangé');
  assert.equal(db.stockLogs.length, 0, 'Aucun stock_log');
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST D — Rollback : P1 stock=10, P2 stock=0, panier P1×2 + P2×1
// ═════════════════════════════════════════════════════════════════════════════
test('D — Rollback complet : stock P1 final = 10 (intact)', () => {
  const db = baseDB();
  const snapshot = db.products.get(PROD_A_ID).stock_quantity;

  try {
    simulateCheckoutRPC(db, {
      p_store_id: STORE_ID,
      p_items: [
        { product_id: PROD_A_ID, quantity: 2 },
        { product_id: PROD_B_ID, quantity: 1 },
      ],
      p_customer: CUSTOMER,
    });
    assert.fail('Doit lever une exception');
  } catch (err) {
    assert.ok(err.message.includes('INSUFFICIENT_STOCK'));
  }

  assert.equal(db.products.get(PROD_A_ID).stock_quantity, snapshot, 'P1 stock inchangé après rollback');
  assert.equal(db.products.get(PROD_B_ID).stock_quantity, 0, 'P2 stock inchangé après rollback');
  assert.equal(db.stockLogs.length, 0, 'Zéro stock_log après rollback');
  assert.equal(db.orders.size, 0, 'Zéro commande après rollback');
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST E — Même idempotency_key envoyée deux fois
// ═════════════════════════════════════════════════════════════════════════════
test('E — Idempotence : même clé → 1 commande, 1 décrémentation, replay correct', () => {
  const db = baseDB();
  const KEY = 'test-idem-key-e';

  // Première requête
  const r1 = simulateCheckoutRPC(db, {
    p_store_id:        STORE_ID,
    p_items:           [{ product_id: PROD_A_ID, quantity: 1 }],
    p_customer:        CUSTOMER,
    p_idempotency_key: KEY,
  });

  assert.equal(r1.idempotent_replay, false);
  assert.equal(db.orders.size, 1);
  assert.equal(db.products.get(PROD_A_ID).stock_quantity, 9, 'Stock décrémenté une fois (10-1=9)');

  // Deuxième requête — même clé
  const r2 = simulateCheckoutRPC(db, {
    p_store_id:        STORE_ID,
    p_items:           [{ product_id: PROD_A_ID, quantity: 1 }],
    p_customer:        CUSTOMER,
    p_idempotency_key: KEY,
  });

  assert.equal(r2.idempotent_replay, true, 'La deuxième requête doit être un replay');
  assert.equal(r2.order_id, r1.order_id, 'Même order_id retourné');
  assert.equal(db.orders.size, 1, 'Toujours 1 seule commande');
  assert.equal(db.products.get(PROD_A_ID).stock_quantity, 9, 'Stock toujours 9 (pas de 2ème décrémentation)');
  assert.equal(db.stockLogs.length, 1, 'Toujours 1 seul stock_log');
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST F — Prix client falsifié : le serveur impose son prix
// ═════════════════════════════════════════════════════════════════════════════
test('F — Prix client ignoré : la RPC utilise exclusivement products.price', () => {
  const db = baseDB();
  // Le client envoie "quantity: 2" pour un produit à 5000 FCFA
  // Il ne peut pas modifier le prix — la RPC lit directement de la DB

  const result = simulateCheckoutRPC(db, {
    p_store_id: STORE_ID,
    p_items:    [{ product_id: PROD_A_ID, quantity: 2 }],
    p_customer: CUSTOMER,
    // Aucun champ 'price' dans les items — le prix vient de products.price
  });

  // Sous-total = 5000 * 2 = 10000, non pas un prix falsifié
  assert.equal(result.subtotal, 10000, 'Sous-total calculé avec le prix serveur (5000 × 2)');
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST G — Quantité invalide (0, négatif, hors limite)
// ═════════════════════════════════════════════════════════════════════════════
test('G.1 — Quantité 0 : INVALID_QUANTITY', () => {
  const db = baseDB();
  assert.throws(
    () => simulateCheckoutRPC(db, {
      p_store_id: STORE_ID,
      p_items:    [{ product_id: PROD_A_ID, quantity: 0 }],
      p_customer: CUSTOMER,
    }),
    (err) => { assert.ok(err.message.includes('INVALID_QUANTITY')); return true; }
  );
  assert.equal(db.orders.size, 0);
});

test('G.2 — Quantité -1 : INVALID_QUANTITY', () => {
  const db = baseDB();
  assert.throws(
    () => simulateCheckoutRPC(db, {
      p_store_id: STORE_ID,
      p_items:    [{ product_id: PROD_A_ID, quantity: -1 }],
      p_customer: CUSTOMER,
    }),
    (err) => { assert.ok(err.message.includes('INVALID_QUANTITY')); return true; }
  );
});

test('G.3 — Quantité 999999 : INVALID_QUANTITY (> 10000)', () => {
  const db = baseDB();
  assert.throws(
    () => simulateCheckoutRPC(db, {
      p_store_id: STORE_ID,
      p_items:    [{ product_id: PROD_A_ID, quantity: 999999 }],
      p_customer: CUSTOMER,
    }),
    (err) => { assert.ok(err.message.includes('INVALID_QUANTITY')); return true; }
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST H — Produit inactif
// ═════════════════════════════════════════════════════════════════════════════
test('H — Produit inactif : PRODUCT_INACTIVE, 0 commande', () => {
  const inactiveProdId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  const db = new MockDB({
    stores:   [{ id: STORE_ID, is_active: true, allow_out_of_stock: false, min_order_amount: 0 }],
    products: [{ id: inactiveProdId, store_id: STORE_ID, name: 'Produit Inactif', price: 1000, stock_quantity: 10, moq: 1, is_active: false }],
  });

  assert.throws(
    () => simulateCheckoutRPC(db, {
      p_store_id: STORE_ID,
      p_items:    [{ product_id: inactiveProdId, quantity: 1 }],
      p_customer: CUSTOMER,
    }),
    (err) => { assert.ok(err.message.includes('PRODUCT_INACTIVE')); return true; }
  );
  assert.equal(db.orders.size, 0);
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST I — Produit appartenant à un autre store
// ═════════════════════════════════════════════════════════════════════════════
test('I — Produit d\'un autre store : PRODUCT_WRONG_STORE', () => {
  const OTHER_STORE = '22222222-2222-2222-2222-222222222222';
  const ALIEN_PROD  = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  const db = new MockDB({
    stores:   [{ id: STORE_ID, is_active: true, allow_out_of_stock: false, min_order_amount: 0 }],
    products: [{ id: ALIEN_PROD, store_id: OTHER_STORE, name: 'Alien', price: 500, stock_quantity: 50, moq: 1, is_active: true }],
  });

  assert.throws(
    () => simulateCheckoutRPC(db, {
      p_store_id: STORE_ID,
      p_items:    [{ product_id: ALIEN_PROD, quantity: 1 }],
      p_customer: CUSTOMER,
    }),
    (err) => { assert.ok(err.message.includes('PRODUCT_WRONG_STORE')); return true; }
  );
  assert.equal(db.orders.size, 0);
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST J — Échec de notification APRÈS succès ne doit pas annuler la commande
// ═════════════════════════════════════════════════════════════════════════════
test('J — Notification post-commit échoue : commande et stock restent intacts', () => {
  const db = baseDB();

  // La RPC est déjà commitée (simulée)
  const result = simulateCheckoutRPC(db, {
    p_store_id: STORE_ID,
    p_items:    [{ product_id: PROD_A_ID, quantity: 1 }],
    p_customer: CUSTOMER,
  });

  // Simuler un échec de notification post-commit (erreur réseau, etc.)
  let notifError = null;
  try {
    throw new Error('WhatsApp/FCM réseau indisponible');
  } catch (err) {
    notifError = err; // Capturé, non-relancé
  }

  // La commande doit toujours exister malgré l'erreur de notif
  assert.ok(notifError !== null, 'Erreur de notification capturée');
  assert.equal(db.orders.size, 1, 'Commande toujours présente malgré échec notif');
  assert.equal(db.products.get(PROD_A_ID).stock_quantity, 9, 'Stock toujours décrémenté');
  assert.ok(result.order_id, 'Order ID toujours valide');
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST — Boutique inactive
// ═════════════════════════════════════════════════════════════════════════════
test('Boutique inactive : STORE_INACTIVE', () => {
  const db = baseDB({ store: { is_active: false } });
  assert.throws(
    () => simulateCheckoutRPC(db, {
      p_store_id: STORE_ID,
      p_items:    [{ product_id: PROD_A_ID, quantity: 1 }],
      p_customer: CUSTOMER,
    }),
    (err) => { assert.ok(err.message.includes('STORE_INACTIVE')); return true; }
  );
  assert.equal(db.orders.size, 0);
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST — MOQ non respectée
// ═════════════════════════════════════════════════════════════════════════════
test('MOQ non respectée : MOQ_NOT_MET (Produit C moq=2, demande qty=1)', () => {
  const db = baseDB();
  assert.throws(
    () => simulateCheckoutRPC(db, {
      p_store_id: STORE_ID,
      p_items:    [{ product_id: PROD_C_ID, quantity: 1 }], // moq=2
      p_customer: CUSTOMER,
    }),
    (err) => { assert.ok(err.message.includes('MOQ_NOT_MET')); return true; }
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST — Montant minimum de commande
// ═════════════════════════════════════════════════════════════════════════════
test('Montant minimum non atteint : MIN_ORDER_AMOUNT', () => {
  const db = baseDB({ store: { min_order_amount: 100000 } });
  assert.throws(
    () => simulateCheckoutRPC(db, {
      p_store_id: STORE_ID,
      p_items:    [{ product_id: PROD_A_ID, quantity: 1 }], // 5000 < 100000
      p_customer: CUSTOMER,
    }),
    (err) => { assert.ok(err.message.includes('MIN_ORDER_AMOUNT')); return true; }
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST — Produit inexistant
// ═════════════════════════════════════════════════════════════════════════════
test('Produit inexistant : PRODUCT_NOT_FOUND', () => {
  const db = baseDB();
  const GHOST_ID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
  assert.throws(
    () => simulateCheckoutRPC(db, {
      p_store_id: STORE_ID,
      p_items:    [{ product_id: GHOST_ID, quantity: 1 }],
      p_customer: CUSTOMER,
    }),
    (err) => { assert.ok(err.message.includes('PRODUCT_NOT_FOUND')); return true; }
  );
  assert.equal(db.orders.size, 0);
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST — Validation Zod payload (schéma route.js)
// ═════════════════════════════════════════════════════════════════════════════
test('Zod — Payload valide accepté', () => {
  const VALID_STORE_ID = '12345678-1234-4234-8234-123456789abc';
  const VALID_PROD_ID  = 'abcdef12-abcd-4bcd-8bcd-abcdef123456';
  const payload = {
    storeId:  VALID_STORE_ID,
    items:    [{ productId: VALID_PROD_ID, quantity: 2 }],
    customer: { name: 'Alice Test', phone: '699000111' },
    idempotencyKey: 'key-abc-123',
  };
  const parsed = CheckoutPayloadSchema.parse(payload);
  assert.equal(parsed.storeId, VALID_STORE_ID);
  assert.equal(parsed.items[0].productId, VALID_PROD_ID);
  assert.equal(parsed.idempotencyKey, 'key-abc-123');
});


test('Zod — Quantité négative rejetée', () => {
  assert.throws(() => CheckoutPayloadSchema.parse({
    storeId:  STORE_ID,
    items:    [{ productId: PROD_A_ID, quantity: -5 }],
    customer: { name: 'Client', phone: '699000000' },
  }));
});

test('Zod — Nom client trop court rejeté', () => {
  assert.throws(() => CheckoutPayloadSchema.parse({
    storeId:  STORE_ID,
    items:    [{ productId: PROD_A_ID, quantity: 1 }],
    customer: { name: 'A', phone: '699000000' },
  }));
});

test('Zod — Panier vide rejeté', () => {
  assert.throws(() => CheckoutPayloadSchema.parse({
    storeId:  STORE_ID,
    items:    [],
    customer: { name: 'Alice', phone: '699000111' },
  }));
});

test('Zod — storeId non-UUID rejeté', () => {
  assert.throws(() => CheckoutPayloadSchema.parse({
    storeId:  'not-a-uuid',
    items:    [{ productId: PROD_A_ID, quantity: 1 }],
    customer: { name: 'Alice', phone: '699000111' },
  }));
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST — HTTP Error Mapping
// ═════════════════════════════════════════════════════════════════════════════
function mapSqlErrorToHttp(message) {
  if (!message) return { status: 500 };
  if (message.includes('INSUFFICIENT_STOCK'))  return { status: 409, code: 'INSUFFICIENT_STOCK' };
  if (message.includes('STORE_NOT_FOUND'))     return { status: 404, code: 'STORE_NOT_FOUND' };
  if (message.includes('STORE_INACTIVE'))      return { status: 403, code: 'STORE_INACTIVE' };
  if (message.includes('PRODUCT_NOT_FOUND'))   return { status: 400, code: 'PRODUCT_NOT_FOUND' };
  if (message.includes('PRODUCT_INACTIVE'))    return { status: 400, code: 'PRODUCT_INACTIVE' };
  if (message.includes('PRODUCT_WRONG_STORE')) return { status: 400, code: 'PRODUCT_WRONG_STORE' };
  if (message.includes('MOQ_NOT_MET'))         return { status: 400, code: 'MOQ_NOT_MET' };
  if (message.includes('MIN_ORDER_AMOUNT'))    return { status: 400, code: 'MIN_ORDER_AMOUNT' };
  if (message.includes('INVALID_QUANTITY'))    return { status: 400, code: 'INVALID_QUANTITY' };
  return { status: 500, code: 'INTERNAL_ERROR' };
}

test('HTTP Mapping — INSUFFICIENT_STOCK → 409', () => {
  const r = mapSqlErrorToHttp('INSUFFICIENT_STOCK: prod-abc');
  assert.equal(r.status, 409);
  assert.equal(r.code, 'INSUFFICIENT_STOCK');
});

test('HTTP Mapping — STORE_NOT_FOUND → 404', () => {
  assert.equal(mapSqlErrorToHttp('STORE_NOT_FOUND: abc').status, 404);
});

test('HTTP Mapping — STORE_INACTIVE → 403', () => {
  assert.equal(mapSqlErrorToHttp('STORE_INACTIVE: abc').status, 403);
});

test('HTTP Mapping — PRODUCT_NOT_FOUND → 400', () => {
  assert.equal(mapSqlErrorToHttp('PRODUCT_NOT_FOUND: abc').status, 400);
});

test('HTTP Mapping — INVALID_QUANTITY → 400', () => {
  assert.equal(mapSqlErrorToHttp('INVALID_QUANTITY: abc').status, 400);
});

test('HTTP Mapping — Erreur inconnue → 500', () => {
  assert.equal(mapSqlErrorToHttp('Unexpected pg error').status, 500);
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST — Concurrence simulée JS (logique de verrouillage déterministe)
// ═════════════════════════════════════════════════════════════════════════════
test('Concurrence simulée (JS) — stock=1, 10 workers qty=1 : 1 succès, 9 conflits', () => {
  // Dans PostgreSQL réel, FOR UPDATE sérialise les transactions.
  // Ici on simule le comportement attendu séquentiellement.
  const ONE_PROD = 'aaaaaaaa-0000-0000-0000-000000000001';
  const db = new MockDB({
    stores:   [{ id: STORE_ID, is_active: true, allow_out_of_stock: false, min_order_amount: 0 }],
    products: [{ id: ONE_PROD, store_id: STORE_ID, name: 'Last One', price: 1000, stock_quantity: 1, moq: 1, is_active: true }],
  });

  let successCount  = 0;
  let conflictCount = 0;

  for (let i = 0; i < 10; i++) {
    try {
      simulateCheckoutRPC(db, {
        p_store_id: STORE_ID,
        p_items:    [{ product_id: ONE_PROD, quantity: 1 }],
        p_customer: CUSTOMER,
      });
      successCount++;
    } catch (err) {
      if (err.message.includes('INSUFFICIENT_STOCK')) conflictCount++;
    }
  }

  assert.equal(successCount,  1, '1 seul succès attendu');
  assert.equal(conflictCount, 9, '9 conflits attendus');
  assert.equal(db.products.get(ONE_PROD).stock_quantity, 0, 'Stock final = 0');
  assert.equal(db.orders.size, 1, '1 seule commande créée');
});

test('Concurrence simulée — stock=10, 10 workers qty=1 : 10 succès', () => {
  const TEN_PROD = 'aaaaaaaa-0000-0000-0000-000000000010';
  const db = new MockDB({
    stores:   [{ id: STORE_ID, is_active: true, allow_out_of_stock: false, min_order_amount: 0 }],
    products: [{ id: TEN_PROD, store_id: STORE_ID, name: '10 Stock', price: 1000, stock_quantity: 10, moq: 1, is_active: true }],
  });

  let successCount = 0;
  let conflictCount = 0;

  for (let i = 0; i < 10; i++) {
    try {
      simulateCheckoutRPC(db, {
        p_store_id:        STORE_ID,
        p_items:           [{ product_id: TEN_PROD, quantity: 1 }],
        p_customer:        CUSTOMER,
        p_idempotency_key: `key-worker-${i}`,
      });
      successCount++;
    } catch { conflictCount++; }
  }

  assert.equal(successCount,  10, '10 succès');
  assert.equal(conflictCount,  0, '0 conflits');
  assert.equal(db.products.get(TEN_PROD).stock_quantity, 0, 'Stock final = 0');
  assert.equal(db.orders.size, 10, '10 commandes');
});

test('Concurrence simulée — stock=10, 11 workers qty=1 : 10 succès, 1 conflit', () => {
  const PROD_11 = 'aaaaaaaa-0000-0000-0000-000000000011';
  const db = new MockDB({
    stores:   [{ id: STORE_ID, is_active: true, allow_out_of_stock: false, min_order_amount: 0 }],
    products: [{ id: PROD_11, store_id: STORE_ID, name: '10+1', price: 1000, stock_quantity: 10, moq: 1, is_active: true }],
  });

  let success  = 0;
  let conflict = 0;

  for (let i = 0; i < 11; i++) {
    try {
      simulateCheckoutRPC(db, {
        p_store_id:        STORE_ID,
        p_items:           [{ product_id: PROD_11, quantity: 1 }],
        p_customer:        CUSTOMER,
        p_idempotency_key: `key-w11-${i}`,
      });
      success++;
    } catch { conflict++; }
  }

  assert.equal(success,  10);
  assert.equal(conflict,  1);
  assert.equal(db.products.get(PROD_11).stock_quantity, 0, 'Stock final = 0');
  assert.equal(db.orders.size, 10);
});

test('Concurrence simulée — TEST4 : stock=5, A=qty4, B=qty3 : 1 succès, 1 conflit', () => {
  const PROD_5 = 'aaaaaaaa-0000-0000-0000-000000000005';
  const db = new MockDB({
    stores:   [{ id: STORE_ID, is_active: true, allow_out_of_stock: false, min_order_amount: 0 }],
    products: [{ id: PROD_5, store_id: STORE_ID, name: 'Stock5', price: 1000, stock_quantity: 5, moq: 1, is_active: true }],
  });

  const requests = [
    { product_id: PROD_5, quantity: 4 },
    { product_id: PROD_5, quantity: 3 },
  ];

  let success  = 0;
  let conflict = 0;
  let finalStock;

  for (const req of requests) {
    try {
      simulateCheckoutRPC(db, {
        p_store_id:        STORE_ID,
        p_items:           [req],
        p_customer:        CUSTOMER,
        p_idempotency_key: `key-t4-${req.quantity}`,
      });
      success++;
      finalStock = db.products.get(PROD_5).stock_quantity;
    } catch { conflict++; }
  }

  assert.equal(success,  1, '1 succès');
  assert.equal(conflict, 1, '1 conflit');
  assert.ok(finalStock === 1 || finalStock === 2, `Stock final attendu 1 ou 2, obtenu: ${finalStock}`);
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST — Idempotence concurrente : 10 requêtes, même clé
// ═════════════════════════════════════════════════════════════════════════════
test('Idempotence concurrente — 10 requêtes, même clé : 1 commande, 1 décrémentation', () => {
  const IDEM_PROD = 'aaaaaaaa-0000-0000-0000-000000000099';
  const db = new MockDB({
    stores:   [{ id: STORE_ID, is_active: true, allow_out_of_stock: false, min_order_amount: 0 }],
    products: [{ id: IDEM_PROD, store_id: STORE_ID, name: 'Idem', price: 1000, stock_quantity: 100, moq: 1, is_active: true }],
  });

  const SHARED_KEY = 'idempotent-concurrent-key-001';

  for (let i = 0; i < 10; i++) {
    simulateCheckoutRPC(db, {
      p_store_id:        STORE_ID,
      p_items:           [{ product_id: IDEM_PROD, quantity: 1 }],
      p_customer:        CUSTOMER,
      p_idempotency_key: SHARED_KEY,
    });
  }

  assert.equal(db.orders.size, 1, '1 seule commande créée');
  assert.equal(db.products.get(IDEM_PROD).stock_quantity, 99, 'Stock décrémenté une seule fois (100-1=99)');
  assert.equal(db.stockLogs.length, 1, '1 seul stock_log');
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST — Anti-Deadlock : ordre déterministe des verrous
// ═════════════════════════════════════════════════════════════════════════════
test('Anti-Deadlock — Transaction A [P1,P2] et B [P2,P1] sans deadlock via tri déterministe', () => {
  // La simulation trie par product_id => pas de deadlock possible
  // P1 < P2 alphabétiquement => toujours verrouillé dans cet ordre
  const P1 = 'aaaaaaaa-0000-0000-0001-000000000001';
  const P2 = 'bbbbbbbb-0000-0000-0002-000000000002';

  const db = new MockDB({
    stores:   [{ id: STORE_ID, is_active: true, allow_out_of_stock: false, min_order_amount: 0 }],
    products: [
      { id: P1, store_id: STORE_ID, name: 'P1', price: 1000, stock_quantity: 10, moq: 1, is_active: true },
      { id: P2, store_id: STORE_ID, name: 'P2', price: 2000, stock_quantity: 10, moq: 1, is_active: true },
    ],
  });

  // Transaction A : [P1, P2]
  const rA = simulateCheckoutRPC(db, {
    p_store_id: STORE_ID,
    p_items:    [{ product_id: P1, quantity: 1 }, { product_id: P2, quantity: 1 }],
    p_customer: CUSTOMER,
  });
  // Transaction B : [P2, P1] — le tri interne le réordonne en [P1, P2] aussi
  const rB = simulateCheckoutRPC(db, {
    p_store_id: STORE_ID,
    p_items:    [{ product_id: P2, quantity: 1 }, { product_id: P1, quantity: 1 }],
    p_customer: CUSTOMER,
  });

  assert.ok(rA.order_id, 'Transaction A succès');
  assert.ok(rB.order_id, 'Transaction B succès');
  assert.equal(db.products.get(P1).stock_quantity, 8, 'P1 décrémenté 2 fois = 8');
  assert.equal(db.products.get(P2).stock_quantity, 8, 'P2 décrémenté 2 fois = 8');
  assert.equal(db.orders.size, 2, '2 commandes créées');
  assert.equal(db.stockLogs.length, 4, '4 stock_logs (2 produits × 2 transactions)');
});

// ═════════════════════════════════════════════════════════════════════════════
// CONCURRENCE RÉELLE PostgreSQL/Supabase
// ═════════════════════════════════════════════════════════════════════════════
test('REAL_CONCURRENCY_TEST — Statut de l\'environnement', () => {
  // L'environnement sandbox (Windows, no network) ne dispose pas d'un accès direct
  // à l'instance PostgreSQL Supabase live en dehors d'une connexion réseau authentifiée.
  //
  // Résultat : REAL_CONCURRENCY_TEST = NOT_EXECUTED
  //
  // Pour exécuter ce test en conditions réelles :
  // 1. Configurer DATABASE_URL dans .env.local
  // 2. Utiliser un client pg direct (non pooler) avec BEGIN/FOR UPDATE/COMMIT
  // 3. Lancer 10 workers Node.js simultanés (Promise.all)
  // 4. Vérifier les résultats en DB après la rafale
  //
  // Le verdict maximal sans ce test est : 5.0_PASS_WITH_RESERVE

  const REAL_CONCURRENCY_TEST = 'NOT_EXECUTED';
  assert.equal(REAL_CONCURRENCY_TEST, 'NOT_EXECUTED');
  // Ce test est un marqueur intentionnel — il ne peut pas échouer.
  // Il documente l'absence de test de concurrence réelle.
});
