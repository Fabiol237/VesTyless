import test from 'node:test';
import assert from 'node:assert/strict';
import { deliveryEngine, estimateDelivery, NEIGHBORHOODS_DOUALA, NEIGHBORHOODS_YAOUNDE } from '../src/lib/delivery-engine/DeliveryEngine.js';

test('estimateDelivery returns correct neighborhood fee for Douala', () => {
  const result = estimateDelivery('Douala', 'dla_bonapriso');
  assert.equal(result.fee, 1000);
  assert.equal(result.name, 'Bonapriso');
  assert.equal(result.formattedFee, '1\u202F000 FCFA' || result.formattedFee.includes('1'));
});

test('estimateDelivery returns correct neighborhood fee for Yaounde', () => {
  const result = estimateDelivery('Yaoundé', 'yde_bastos');
  assert.equal(result.fee, 1000);
  assert.equal(result.name, 'Bastos');
});

test('estimateDelivery falls back safely for unknown neighborhood', () => {
  const result = estimateDelivery('Douala', 'quartier_inconnu');
  assert.equal(result.fee, 1500);
  assert.equal(result.name, 'Autre Quartier');
});

test('calculateDeliveryFee handles freeDeliveryThreshold and isPickup', () => {
  const storeConfig = {
    businessSpecificConfig: {
      freeDeliveryThreshold: 20000,
    },
  };

  // 1. Commande avec montant >= seuil -> Livraison gratuite
  const freeRes = deliveryEngine.calculateDeliveryFee(storeConfig, {
    city: 'Douala',
    orderTotal: 25000,
    isPickup: false,
  });
  assert.equal(freeRes.fee, 0);
  assert.equal(freeRes.isFree, true);

  // 2. Retrait en boutique -> Frais 0
  const pickupRes = deliveryEngine.calculateDeliveryFee(storeConfig, {
    city: 'Douala',
    orderTotal: 5000,
    isPickup: true,
  });
  assert.equal(pickupRes.fee, 0);
  assert.equal(pickupRes.isPickup, true);

  // 3. Commande sous le seuil -> Frais standard
  const standardRes = deliveryEngine.calculateDeliveryFee(storeConfig, {
    city: 'Douala',
    orderTotal: 10000,
    isPickup: false,
  });
  assert.equal(standardRes.fee > 0, true);
});
