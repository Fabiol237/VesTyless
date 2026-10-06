import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  NotificationEngine,
  notificationEngine,
  NOTIFICATION_EVENTS,
  formatWhatsAppPhone,
  buildWhatsAppActionUrl,
  formatNotificationMessage,
} from '../src/lib/notification-engine/NotificationEngine.js';

describe('VesTyle / Vestin — Étape 5.3 Notification & Alerting Engine', () => {

  beforeEach(() => {
    notificationEngine.clearDeduplicationCache();
  });

  // ── TEST 1 : ORDER_CREATED EVENT FORMATTING & DISPATCH ──────────────────────
  it('1. ORDER_CREATED — génère un formatage et un payload in-app valides', async () => {
    const payload = {
      storeId:       'store-uuid-123',
      userId:        'user-uuid-abc',
      orderId:       'order-uuid-987654',
      storeName:     'Boutique Élégance',
      currency:      'FCFA',
      totalAmount:   45000,
      customerName:  'Marc Dupont',
      customerPhone: '+237 674 15 17 28',
    };

    const formatted = formatNotificationMessage(NOTIFICATION_EVENTS.ORDER_CREATED, payload);
    assert.strictEqual(formatted.type, 'order_created');
    assert.ok(formatted.title.includes('987654'));
    assert.ok(formatted.message.includes('Marc Dupont'));
    assert.ok(formatted.message.includes('45\u202f000') || formatted.message.includes('45 000'));
    assert.ok(formatted.message.includes('FCFA'));
    assert.strictEqual(formatted.actionUrl, '/dashboard/orders?id=order-uuid-987654');

    // Test du dispatch avec skip DB réseau
    const engine = new NotificationEngine();
    const result = await engine.dispatch(NOTIFICATION_EVENTS.ORDER_CREATED, payload, { skipInApp: true, skipEmail: true, skipPush: true });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.event, NOTIFICATION_EVENTS.ORDER_CREATED);
    assert.ok(result.whatsappActionUrl);
  });

  // ── TEST 2 : ORDER_STATUS_CHANGED EVENT ─────────────────────────────────────
  it('2. ORDER_STATUS_CHANGED — formate correctement la mise à jour de statut', async () => {
    const payload = {
      storeId:       'store-uuid-123',
      orderId:       'ord-112233',
      statusLabel:   'Livrée',
      status:        'delivered',
      customerName:  'Alice',
      customerPhone: '690123456',
    };

    const formatted = formatNotificationMessage(NOTIFICATION_EVENTS.ORDER_STATUS_CHANGED, payload);
    assert.strictEqual(formatted.type, 'order_status');
    assert.ok(formatted.title.includes('112233'));
    assert.ok(formatted.message.includes('Livrée'));

    const waUrl = buildWhatsAppActionUrl(NOTIFICATION_EVENTS.ORDER_STATUS_CHANGED, payload);
    assert.ok(waUrl.includes('https://wa.me/237690123456'));
    assert.ok(waUrl.includes(encodeURIComponent('Livrée')));
  });

  // ── TEST 3 : LEAD_CREATED EVENT ─────────────────────────────────────────────
  it('3. LEAD_CREATED — formate la notification de demande client', async () => {
    const payload = {
      storeId:       'store-uuid-123',
      customerName:  'Jean Paul',
      customerPhone: '677889900',
      itemName:      'Robe de Soirée Satinée',
      message:       'Disponible en taille M ?',
    };

    const formatted = formatNotificationMessage(NOTIFICATION_EVENTS.LEAD_CREATED, payload);
    assert.strictEqual(formatted.type, 'lead');
    assert.ok(formatted.title.includes('Jean Paul'));
    assert.ok(formatted.message.includes('Robe de Soirée Satinée'));
    assert.strictEqual(formatted.actionUrl, '/dashboard?mode=leads');

    const waUrl = buildWhatsAppActionUrl(NOTIFICATION_EVENTS.LEAD_CREATED, payload);
    assert.ok(waUrl.includes('https://wa.me/237677889900'));
    assert.ok(decodeURIComponent(waUrl).includes('Robe de Soirée Satinée'));
  });

  // ── TEST 4 : STOCK_LOW EVENT ────────────────────────────────────────────────
  it('4. STOCK_LOW — formate l\'alerte inventaire', async () => {
    const payload = {
      storeId:      'store-uuid-123',
      productId:    'prod-uuid-456',
      productName:  'Costume Slim 3 Pièces',
      currentStock: 2,
    };

    const formatted = formatNotificationMessage(NOTIFICATION_EVENTS.STOCK_LOW, payload);
    assert.strictEqual(formatted.type, 'stock_low');
    assert.ok(formatted.title.includes('Costume Slim 3 Pièces'));
    assert.ok(formatted.message.includes('2 unité(s)'));
    assert.strictEqual(formatted.actionUrl, '/dashboard/products?id=prod-uuid-456');
  });

  // ── TEST 5 : MESSAGE FORMATTING RESILIENCE ───────────────────────────────────
  it('5. Message Formatting — résilience face aux données manquantes', () => {
    const fallback = formatNotificationMessage('UNKNOWN_EVENT', { title: 'Titre Custom', message: 'Corps Custom' });
    assert.strictEqual(fallback.title, 'Titre Custom');
    assert.strictEqual(fallback.message, 'Corps Custom');
    assert.strictEqual(fallback.type, 'general');

    const emptyOrder = formatNotificationMessage(NOTIFICATION_EVENTS.ORDER_CREATED, {});
    assert.ok(emptyOrder.title.includes('Nouvelle commande'));
    assert.ok(emptyOrder.message.includes('Client'));
  });

  // ── TEST 6 : WHATSAPP ACTION URL GENERATION ─────────────────────────────────
  it('6. WhatsApp Action URL — génération sécurisée wa.me sans API automatique', () => {
    // Numéro camerounais standard 9 chiffres
    const url1 = buildWhatsAppActionUrl(NOTIFICATION_EVENTS.ORDER_CREATED, {
      customerPhone: '674151728',
      customerName:  'Fabiol',
      orderId:       'order-abc-12345',
      storeName:     'VesTyle Store',
      totalAmount:   15000,
    });
    assert.ok(url1.startsWith('https://wa.me/237674151728?text='));
    assert.ok(url1.includes(encodeURIComponent('Fabiol')));
    assert.ok(url1.includes(encodeURIComponent('VesTyle Store')));

    // Numéro international avec indicatif
    const url2 = buildWhatsAppActionUrl(NOTIFICATION_EVENTS.LEAD_CREATED, {
      customerPhone: '+33 6 12 34 56 78',
      customerName:  'Sophie',
      itemName:      'Sneakers Pro',
    });
    assert.ok(url2.startsWith('https://wa.me/33612345678?text='));

    // Numéro absent -> doit retourner null sans erreur
    const urlNone = buildWhatsAppActionUrl(NOTIFICATION_EVENTS.ORDER_CREATED, { customerName: 'No Phone' });
    assert.strictEqual(urlNone, null);
  });

  // ── TEST 7 : IN-APP PAYLOAD INTEGRITY ────────────────────────────────────────
  it('7. In-App Payload — structure conforme au schéma DB notifications', () => {
    const event = NOTIFICATION_EVENTS.ORDER_CREATED;
    const data = {
      storeId:      'store-1',
      userId:       'owner-1',
      orderId:      'ord-1',
      customerName: 'Claire',
      totalAmount:  12000,
    };

    const formatted = formatNotificationMessage(event, data);
    assert.strictEqual(typeof formatted.title, 'string');
    assert.strictEqual(typeof formatted.message, 'string');
    assert.strictEqual(formatted.type, 'order_created');
  });

  // ── TEST 8 : STORE_ID ISOLATION ─────────────────────────────────────────────
  it('8. Store ID Isolation — rejet de notification In-App sans storeId', async () => {
    const engine = new NotificationEngine();
    const res = await engine.dispatch(NOTIFICATION_EVENTS.LEAD_CREATED, {
      // pas de storeId
      customerName: 'Anonyme',
    }, { skipEmail: true, skipPush: true });

    assert.strictEqual(res.channels.in_app.error, 'No storeId provided for in-app notification');
    assert.strictEqual(res.channels.in_app.success, false);
    assert.strictEqual(res.success, true); // Le dispatch global ne plante pas
  });

  // ── TEST 9 : MULTI-STORE BEHAVIOR ───────────────────────────────────────────
  it('9. Multi-Boutiques — chaque boutique conserve ses notifications étanches', async () => {
    const storeA = 'store-uuid-AAA';
    const storeB = 'store-uuid-BBB';

    const notifA = formatNotificationMessage(NOTIFICATION_EVENTS.ORDER_CREATED, {
      storeId: storeA,
      storeName: 'Boutique A',
      customerName: 'Client A',
      totalAmount: 10000,
    });

    const notifB = formatNotificationMessage(NOTIFICATION_EVENTS.ORDER_CREATED, {
      storeId: storeB,
      storeName: 'Boutique B',
      customerName: 'Client B',
      totalAmount: 20000,
    });

    assert.ok(notifA.message.includes('Client A'));
    assert.ok(notifB.message.includes('Client B'));
    assert.notStrictEqual(notifA.message, notifB.message);
  });

  // ── TEST 10 : SINGLE CHANNEL FAILURE RESILIENCE ─────────────────────────────
  it('10. Channel Failure Resilience — un échec Email/Push/InApp ne fait pas échouer la transaction', async () => {
    const engine = new NotificationEngine();
    // Dispatch avec email et push invalides
    const res = await engine.dispatch(NOTIFICATION_EVENTS.ORDER_CREATED, {
      storeId:        'store-uuid-123',
      orderId:        'order-123',
      recipientEmail: 'invalid-email-address',
      pushToken:      null,
    }, { skipInApp: true });

    // Doit réussir globalement sans exception
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.channels.email.success, false);
    assert.strictEqual(res.channels.push.success, false);
  });

  // ── TEST 11 : ABSENCE OF PUSH TOKEN ─────────────────────────────────────────
  it('11. Absence de Token Push — skip gracieux sans fausse erreur', async () => {
    const engine = new NotificationEngine();
    const res = await engine.dispatch(NOTIFICATION_EVENTS.LEAD_CREATED, {
      storeId: 'store-uuid-123',
      customerName: 'Paul',
      pushToken: null,
    }, { skipInApp: true, skipEmail: true });

    assert.strictEqual(res.channels.push.attempted, true);
    assert.strictEqual(res.channels.push.success, false);
    assert.ok(res.channels.push.error.includes('skipped'));
  });

  // ── TEST 12 : ABSENCE DE CONTACT RÉEL ───────────────────────────────────────
  it('12. Absence de Contact Réel — skip gracieux Email et WhatsApp', async () => {
    const payload = {
      storeId:      'store-uuid-123',
      productName:  'Chemise Coton',
      currentStock: 1,
      // aucun email, aucun phone
    };

    const waUrl = buildWhatsAppActionUrl(NOTIFICATION_EVENTS.STOCK_LOW, payload);
    assert.strictEqual(waUrl, null);

    const engine = new NotificationEngine();
    const res = await engine.dispatch(NOTIFICATION_EVENTS.STOCK_LOW, payload, { skipInApp: true, skipPush: true });
    assert.strictEqual(res.channels.email.success, false);
    assert.ok(res.channels.email.error.includes('No valid recipient email'));
  });

  // ── TEST 13 : STOCK_LOW ANTI-DUPLICATION ────────────────────────────────────
  it('13. Anti-Duplication STOCK_LOW — ignore les alertes répétitives sur le même produit', async () => {
    const engine = new NotificationEngine();
    const payload = {
      storeId:      'store-dup-1',
      productId:    'prod-dup-1',
      productName:  'Chaussures Cuir',
      currentStock: 1,
    };

    // 1er envoi : doit passer
    const firstDispatch = await engine.dispatch(NOTIFICATION_EVENTS.STOCK_LOW, payload, { skipInApp: true, skipEmail: true, skipPush: true });
    assert.strictEqual(firstDispatch.success, true);
    assert.strictEqual(firstDispatch.skipped, undefined);

    // 2ème envoi immédiat pour le même produit : doit être dédupliqué
    const secondDispatch = await engine.dispatch(NOTIFICATION_EVENTS.STOCK_LOW, payload, { skipInApp: true, skipEmail: true, skipPush: true });
    assert.strictEqual(secondDispatch.success, true);
    assert.strictEqual(secondDispatch.skipped, 'DEDUPLICATED');

    // Envoi pour un AUTRE produit : doit passer
    const otherProduct = await engine.dispatch(NOTIFICATION_EVENTS.STOCK_LOW, {
      storeId:      'store-dup-1',
      productId:    'prod-dup-2',
      productName:  'Ceinture Cuir',
      currentStock: 2,
    }, { skipInApp: true, skipEmail: true, skipPush: true });
    assert.strictEqual(otherProduct.success, true);
    assert.strictEqual(otherProduct.skipped, undefined);
  });

  // ── TEST 14 : ZERO FAKE DATA ────────────────────────────────────────────────
  it('14. Zero Fake Data — toutes les valeurs formatées proviennent du payload réel', () => {
    const rawData = {
      customerName: 'Benoit Nkomo',
      totalAmount:  98500,
      currency:     'FCFA',
      orderId:      'ORDER-REAL-2026',
    };

    const notif = formatNotificationMessage(NOTIFICATION_EVENTS.ORDER_CREATED, rawData);
    assert.ok(notif.message.includes('Benoit Nkomo'));
    assert.ok(notif.message.includes('98\u202f500') || notif.message.includes('98 500'));
    assert.ok(notif.title.includes('2026'));
  });

});
