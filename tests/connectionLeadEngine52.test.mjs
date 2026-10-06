/**
 * Vestin / VeStyle — Étape 5.2 : Connection & Lead Engine
 * Tests : Actions client contextuelles, Modèle Lead, WhatsApp, Devis & Isolation
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { connectionEngine, ACTION_TYPES } from '../src/lib/connection-engine/ConnectionEngine.js';
import { leadEngine, LEAD_STATUS, LEAD_REQUEST_TYPES } from '../src/lib/lead-engine/LeadEngine.js';
import { CAPABILITIES } from '../src/lib/capability-engine/CapabilityEngine.js';

// ── Mock Profiles for Testing ────────────────────────────────────────────────
const PROFILE_WITH_WHATSAPP = {
  id: 'store_fashion_1',
  identity: {
    name: 'Zoko Mode Douala',
    slug: 'zoko-mode',
    phone: '+237690123456',
    whatsapp: '237690123456',
  },
  capabilities: {
    [CAPABILITIES.PRODUCT]: true,
    [CAPABILITIES.QUOTE]: false,
    [CAPABILITIES.SERVICE]: false,
  },
};

const PROFILE_WITH_PHONE_ONLY = {
  id: 'store_artisan_2',
  identity: {
    name: 'Atelier Menuiserie Pro',
    slug: 'atelier-menuiserie',
    phone: '677998877',
    whatsapp: '',
  },
  capabilities: {
    [CAPABILITIES.PRODUCT]: true,
    [CAPABILITIES.QUOTE]: true,
    [CAPABILITIES.SERVICE]: true,
  },
};

const PROFILE_WITHOUT_CONTACTS = {
  id: 'store_empty_3',
  identity: {
    name: 'Boutique Sans Coordonnées',
    slug: 'sans-coords',
    phone: '',
    whatsapp: '',
  },
  capabilities: {
    [CAPABILITIES.PRODUCT]: true,
    [CAPABILITIES.QUOTE]: false,
    [CAPABILITIES.SERVICE]: false,
  },
};

test('5.2 — ConnectionEngine : WhatsApp disponible vs absent', () => {
  // 1. WhatsApp présent -> action WhatsApp générée et prioritaire
  const actionsWithWa = connectionEngine.getAvailableActions(PROFILE_WITH_WHATSAPP);
  const waAction = actionsWithWa.find(a => a.type === ACTION_TYPES.WHATSAPP);
  assert.ok(waAction, 'Action WhatsApp doit être présente');
  assert.equal(waAction.primary, true);
  assert.ok(waAction.url.includes('wa.me/237690123456'));

  // 2. WhatsApp absent mais téléphone présent -> pas de WhatsApp, appel direct prioritaire
  const actionsPhoneOnly = connectionEngine.getAvailableActions(PROFILE_WITH_PHONE_ONLY);
  const waActionAbsent = actionsPhoneOnly.find(a => a.type === ACTION_TYPES.WHATSAPP);
  const callAction = actionsPhoneOnly.find(a => a.type === ACTION_TYPES.CALL);
  assert.equal(waActionAbsent, undefined, 'Action WhatsApp ne doit pas exister si aucun numéro WhatsApp');
  assert.ok(callAction, 'Action Appel doit être présente');
  assert.equal(callAction.primary, true);

  // 3. Aucun contact -> ni WhatsApp ni Appel généré (zéro fake contact)
  const actionsNoContact = connectionEngine.getAvailableActions(PROFILE_WITHOUT_CONTACTS);
  assert.equal(actionsNoContact.find(a => a.type === ACTION_TYPES.WHATSAPP), undefined);
  assert.equal(actionsNoContact.find(a => a.type === ACTION_TYPES.CALL), undefined);
});

test('5.2 — ConnectionEngine : Messages contextualisés Produit & Service', () => {
  const itemProduct = { id: 'p1', name: 'Robe Wax Royale', price: 25000 };
  const msgProd = connectionEngine.buildContextualMessage(PROFILE_WITH_WHATSAPP, {
    item: itemProduct,
    itemType: 'product',
  });
  assert.ok(msgProd.includes('Robe Wax Royale'));
  assert.ok(msgProd.includes('FCFA'));

  const itemService = { id: 's1', name: 'Coiffure Mariage', price: 50000 };
  const msgServ = connectionEngine.buildContextualMessage(PROFILE_WITH_WHATSAPP, {
    item: itemService,
    itemType: 'service',
  });
  assert.ok(msgServ.includes('Coiffure Mariage'));
  assert.ok(msgServ.includes('disponibilités'));
});

test('5.2 — LeadEngine : Création et validation stricte de demande (Lead)', () => {
  const leadData = {
    storeId: 'store_fashion_1',
    customerName: 'Aline Bella',
    customerPhone: '699112233',
    requestType: LEAD_REQUEST_TYPES.PRODUCT_INQUIRY,
    itemId: 'p1',
    itemName: 'Robe Wax Royale',
    message: 'Taille M disponible ?',
  };

  const lead = leadEngine.createLeadRecord(leadData);
  assert.ok(lead.id.startsWith('lead_'));
  assert.equal(lead.customer_name, 'Aline Bella');
  assert.equal(lead.customer_phone, '699112233');
  assert.equal(lead.status, LEAD_STATUS.NEW);
  assert.equal(lead.item_name, 'Robe Wax Royale');

  // Rejet si nom ou téléphone manquant
  assert.throws(() => {
    leadEngine.createLeadRecord({ storeId: 'store_fashion_1', customerName: 'A', customerPhone: '' });
  });
});

test('5.2 — LeadEngine : Cycle de vie et transitions de statut', () => {
  const lead = leadEngine.createLeadRecord({
    storeId: 'store_fashion_1',
    customerName: 'Jean Dupont',
    customerPhone: '690000000',
  });

  assert.equal(lead.status, LEAD_STATUS.NEW);

  // Transition vers CONTACTED
  const contactedLead = leadEngine.updateStatus(lead, LEAD_STATUS.CONTACTED);
  assert.equal(contactedLead.status, LEAD_STATUS.CONTACTED);
  assert.ok(contactedLead.updated_at >= lead.created_at);

  // Transition vers CONVERTED
  const convertedLead = leadEngine.updateStatus(contactedLead, LEAD_STATUS.CONVERTED);
  assert.equal(convertedLead.status, LEAD_STATUS.CONVERTED);

  // Rejet de statut invalide
  assert.throws(() => {
    leadEngine.updateStatus(lead, 'INVALID_STATUS');
  });
});

test('5.2 — Isolation stricte des leads entre boutiques', () => {
  const allLeads = [
    { id: 'l1', store_id: 'store_A', customer_name: 'Client A1' },
    { id: 'l2', store_id: 'store_B', customer_name: 'Client B1' },
    { id: 'l3', store_id: 'store_A', customer_name: 'Client A2' },
  ];

  const leadsA = leadEngine.filterByStore(allLeads, 'store_A');
  assert.equal(leadsA.length, 2);
  assert.ok(leadsA.every(l => l.store_id === 'store_A'));

  const leadsB = leadEngine.filterByStore(allLeads, 'store_B');
  assert.equal(leadsB.length, 1);
  assert.equal(leadsB[0].customer_name, 'Client B1');
});

test('5.2 — URL de suivi WhatsApp Vendeur vers Client', () => {
  const lead = {
    customer_name: 'Marie Claire',
    customer_phone: '691234567',
    item_name: 'Gâteau d\'anniversaire',
  };

  const followupUrl = leadEngine.buildFollowupWhatsAppUrl(lead, 'Pâtisserie Douala');
  assert.ok(followupUrl.includes('wa.me/237691234567'));
  assert.ok(decodeURIComponent(followupUrl).includes('Marie Claire'));
  assert.ok(decodeURIComponent(followupUrl).includes('Gâteau d\'anniversaire'));
});
