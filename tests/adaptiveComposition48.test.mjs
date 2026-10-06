/**
 * VesTyle / Vestin — Test Suite : Adaptive Composition Engine (ÉTAPE 4.8)
 * ─────────────────────────────────────────────────────────────────────────────
 * Validation exhaustive du moteur de composition adaptative et déclarative.
 * 
 * VÉRIFICATIONS :
 * - TEST A : Cas Taro Sauce Jaune (Alimentation/Restauration avec produits réels)
 * - TEST B : Cas Coiffure à Domicile (Prestation de services)
 * - TEST C : Cas Vente de Chaussures (Commerce produit et catalogue)
 * - TEST D : Données Absentes (Galerie vide -> hidden / empty state sans fake data)
 * - TEST E : Capability Absente (Booking non opérationnel -> exclu)
 * - TEST F : Aucune Donnée Fake (Scanner la composition pour détecter tout texte/prix/avis inventé)
 * - TEST G : Même BusinessType, Compositions Différentes (Diversité par les données et préférences)
 * - TEST H : BusinessTypes Différents, Même Structure (Invariance des composants canoniques)
 * - TEST I : Déterminisme (Même entrée -> Sortie strictement identique)
 * - TEST J : Registry Integrity (Tous les componentId sont résolubles dans le ComponentRegistry)
 * - TEST K : Candidate Isolation (Aucune CandidateSpecification injectée)
 * - TEST L : Unknown Capability (Résilience face aux capacités inconnues)
 * - TEST M : Empty Business (Profil minimal -> Composition sûre et stable)
 * - TEST N : No Fake Contact (Aucune coordonnée ou localisation inventée)
 * - TEST O : No BusinessType Renderer Branching (Zéro couplage businessType dans les renderers)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  compositionEngine,
  CompositionEngine,
} from '../src/lib/composition-engine/CompositionEngine.js';

import {
  COMPOSITION_FAMILIES,
  resolveCanonicalComponentId,
  filterFamiliesByCapabilities,
  createIntentDescriptor,
} from '../src/lib/composition-engine/compositionRules.js';

import {
  CAPABILITIES,
  CAPABILITY_STATUS,
  capabilityEngine,
} from '../src/lib/capability-engine/CapabilityEngine.js';

import { adaptStoreToBusinessProfile } from '../src/lib/business-profile/businessProfileAdapter.js';
import { BusinessProfileSchema } from '../src/lib/business-profile/businessProfileSchema.js';
import { ComponentRegistry } from '../src/lib/component-registry/ComponentRegistry.js';

// ═══════════════════════════════════════════════════════════════════════════
// TEST A : Cas Taro Sauce Jaune (Alimentation/Restauration avec produits réels)
// ═══════════════════════════════════════════════════════════════════════════
test('TEST A — Cas Taro Sauce Jaune (Commerce alimentaire avec produits réels)', () => {
  const taroStore = {
    id: 'store_taro_yaounde',
    name: 'Délices de l\'Ouest — Taro Sauce Jaune',
    slug: 'delices-taro-sauce-jaune',
    business_type: 'restaurant',
    city: 'Yaoundé',
    whatsapp: '237699112233',
    description: 'Le véritable taro sauce jaune traditionnel de Bafoussam préparé chaque matin.',
    categories: ['Plats Traditionnels', 'Compléments', 'Boissons'],
  };

  const taroProducts = [
    { id: 'p_taro_1', name: 'Plat de Taro Sauce Jaune Royal', price: 4500, stock: 20, is_active: true },
    { id: 'p_taro_2', name: 'Portion Supplémentaire Peau de Bœuf (Kanda)', price: 1500, stock: 15, is_active: true },
  ];

  const profile = adaptStoreToBusinessProfile(taroStore, taroProducts);
  const intent = createIntentDescriptor({
    intent: 'SELL_FOOD',
    businessType: 'restaurant',
    productType: 'prepared_food',
    userPrompt: 'Je veux vendre mon taro sauce jaune',
  });

  const composition = compositionEngine.composeWithIntent(profile, intent);

  assert.equal(composition.businessType, 'restaurant');
  assert.ok(Array.isArray(composition.sections), 'sections doit être un tableau');

  const families = composition.sections.map((s) => s.family);
  assert.ok(families.includes('HEADER'), 'HEADER présent');
  assert.ok(families.includes('HERO'), 'HERO présent');
  assert.ok(families.includes('PRODUCT'), 'PRODUCT / Menu présent');
  assert.ok(families.includes('CONTACT'), 'CONTACT présent');
  assert.ok(families.includes('FOOTER'), 'FOOTER présent');

  // Vérifier la configuration et le composant HERO résolu
  const heroSec = composition.sections.find((s) => s.family === 'HERO');
  assert.equal(heroSec.componentId, 'hero_split');
  assert.equal(heroSec.config.title, 'Délices de l\'Ouest — Taro Sauce Jaune');

  // Vérifier les produits
  const productSec = composition.sections.find((s) => s.family === 'PRODUCT');
  assert.equal(productSec.isEmpty, false);
  assert.equal(productSec.state, 'ready');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST B : Cas Coiffure à Domicile (Prestation de services)
// ═══════════════════════════════════════════════════════════════════════════
test('TEST B — Cas Coiffure à Domicile (Prestation de services)', () => {
  const hairStore = {
    id: 'store_hair_beauty',
    name: 'Nathalie Coiffure Afro',
    slug: 'nathalie-coiffure-afro',
    business_type: 'service',
    city: 'Douala',
    whatsapp: '237677889900',
    description: 'Tresses africaines, locks, nattes et soins capillaires à domicile.',
    services: [
      { id: 's1', title: 'Tresses Knotless Braids', price: 15000, duration: '3h30' },
      { id: 's2', title: 'Pose et Entretien Locks', price: 20000, duration: '2h00' },
    ],
  };

  const profile = adaptStoreToBusinessProfile(hairStore);
  const intent = createIntentDescriptor({
    intent: 'HOME_HAIRDRESSING',
    businessType: 'service',
    productType: 'services',
    userPrompt: 'Je fais des coiffures à domicile',
  });

  const composition = compositionEngine.composeWithIntent(profile, intent);

  assert.equal(composition.businessType, 'service');
  const families = composition.sections.map((s) => s.family);

  assert.ok(families.includes('HEADER'), 'HEADER présent');
  assert.ok(families.includes('HERO'), 'HERO présent');
  assert.ok(families.includes('SERVICE'), 'SERVICE présent');
  assert.ok(families.includes('CONTACT'), 'CONTACT présent');
  assert.ok(families.includes('FOOTER'), 'FOOTER présent');

  // Vérifier qu'aucun module product n'est forcé si aucun produit n'existe
  const productSec = composition.sections.find((s) => s.family === 'PRODUCT');
  assert.equal(productSec, undefined, 'Pas de section PRODUCT pour un profil purement service');

  const serviceSec = composition.sections.find((s) => s.family === 'SERVICE');
  assert.equal(serviceSec.isEmpty, false);
  assert.equal(serviceSec.state, 'ready');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST C : Cas Vente de Chaussures (Commerce produit et catalogue)
// ═══════════════════════════════════════════════════════════════════════════
test('TEST C — Cas Vente de Chaussures (Commerce produit et catalogue)', () => {
  const shoeStore = {
    id: 'store_shoes_yaounde',
    name: 'Kicks & Sneakers 237',
    slug: 'kicks-sneakers-237',
    business_type: 'product',
    city: 'Yaoundé',
    whatsapp: '237655001122',
    categories: ['Baskets', 'Mocassins', 'Sandales'],
  };

  const shoes = [
    { id: 'sh1', name: 'Sneakers Air Pulse', price: 35000, stock: 8, is_active: true },
    { id: 'sh2', name: 'Mocassins Cuir Italien', price: 45000, stock: 4, is_active: true },
  ];

  const profile = adaptStoreToBusinessProfile(shoeStore, shoes);
  const composition = compositionEngine.compose(profile, {
    archetype: 'commerce',
  });

  assert.equal(composition.businessType, 'product');
  const families = composition.sections.map((s) => s.family);

  assert.ok(families.includes('HEADER'), 'HEADER présent');
  assert.ok(families.includes('HERO'), 'HERO présent');
  assert.ok(families.includes('CATEGORY'), 'CATEGORY présent');
  assert.ok(families.includes('PRODUCT'), 'PRODUCT présent');
  assert.ok(families.includes('FOOTER'), 'FOOTER présent');

  const heroSec = composition.sections.find((s) => s.family === 'HERO');
  assert.equal(heroSec.componentId, 'hero_commerce');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST D : Données Absentes (Galerie vide -> hidden / empty state)
// ═══════════════════════════════════════════════════════════════════════════
test('TEST D — Données Absentes (Galerie vide -> exclusion / empty state sans fake images)', () => {
  const storeWithoutGallery = {
    id: 'store_no_gal',
    name: 'Boutique Sans Galerie',
    slug: 'boutique-sans-galerie',
    business_type: 'product',
    city: 'Douala',
  };

  const profile = adaptStoreToBusinessProfile(storeWithoutGallery);
  
  // 1. En mode standard avec filterEmptySections = true
  const filteredComposition = compositionEngine.compose(profile, {
    customFamilies: ['HEADER', 'HERO', 'GALLERY', 'FOOTER'],
    enabledCapabilities: [CAPABILITIES.CONTACT, CAPABILITIES.GALLERY],
    filterEmptySections: true,
  });

  const filteredFamilies = filteredComposition.sections.map((s) => s.family);
  assert.equal(filteredFamilies.includes('GALLERY'), false, 'GALLERY vide doit être exclue avec filterEmptySections: true');

  // 2. En mode explicite sans filtre
  const rawComposition = compositionEngine.compose(profile, {
    customFamilies: ['HEADER', 'HERO', 'GALLERY', 'FOOTER'],
    enabledCapabilities: [CAPABILITIES.CONTACT, CAPABILITIES.GALLERY],
    filterEmptySections: false,
  });

  const galSec = rawComposition.sections.find((s) => s.family === 'GALLERY');
  assert.ok(galSec, 'Section GALLERY présente dans la composition brute');
  assert.equal(galSec.isEmpty, true, 'isEmpty doit être true');
  assert.equal(galSec.state, 'empty', 'state doit être empty');
  assert.deepEqual(galSec.config.images, [], 'Aucune image fictive injectée');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST E : Capability Absente (Booking non opérationnel -> exclu)
// ═══════════════════════════════════════════════════════════════════════════
test('TEST E — Capability Absente (Booking non opérationnel -> exclu de la composition)', () => {
  const store = {
    id: 'store_no_booking',
    name: 'Salon Coiffure Sans Booking',
    slug: 'salon-sans-booking',
    business_type: 'service',
  };

  const profile = adaptStoreToBusinessProfile(store);
  const composition = compositionEngine.compose(profile, {
    disabledCapabilities: [CAPABILITIES.BOOKING],
  });

  const families = composition.sections.map((s) => s.family);
  assert.equal(families.includes('BOOKING'), false, 'BOOKING doit être exclu');
  assert.equal(resolveCanonicalComponentId('BOOKING'), null, 'Aucun renderer BOOKING fictif');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST F : Aucune Donnée Fake (Scan de toute la composition)
// ═══════════════════════════════════════════════════════════════════════════
test('TEST F — Aucune Donnée Fake (Zéro claim commercial inventé, zéro produit/avis fictif)', () => {
  const minimalStore = {
    id: 'store_clean',
    name: 'Store Réel',
    slug: 'store-reel',
    business_type: 'product',
  };

  const profile = adaptStoreToBusinessProfile(minimalStore);
  const composition = compositionEngine.compose(profile);

  const jsonString = JSON.stringify(composition);

  const forbiddenMocks = [
    'Slide 1',
    'Produit #1',
    'Nouveauté #1',
    'Avis fictif',
    'Livraison express sécurisée',
    'Produits 100% conformes',
    'Clients satisfaits',
    'Service premium',
    'Meilleur prix garanti',
  ];

  for (const mock of forbiddenMocks) {
    assert.equal(
      jsonString.includes(mock),
      false,
      `La composition contient un texte fictif interdit : "${mock}"`
    );
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST G : Même BusinessType, Compositions Différentes
// ═══════════════════════════════════════════════════════════════════════════
test('TEST G — Même BusinessType, Compositions Différentes (Variations fondées sur les données)', () => {
  // Restaurant A : Vendeur rapide de rue (Hero split, menu rapide, contact)
  const restoA = {
    id: 'resto_street',
    name: 'Fast Taro Street',
    slug: 'fast-taro',
    business_type: 'restaurant',
  };
  const profileA = adaptStoreToBusinessProfile(restoA, [{ id: '1', name: 'Taro' }]);
  const compA = compositionEngine.compose(profileA, { archetype: 'split' });

  // Restaurant B : Établissement gastronomique avec galerie photos et avis
  const restoB = {
    id: 'resto_gastro',
    name: 'Le Grand Palais Gastronomique',
    slug: 'grand-palais',
    business_type: 'restaurant',
    gallery: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  };
  const profileB = adaptStoreToBusinessProfile(restoB, [{ id: '1', name: 'Menu Dégustation' }]);
  profileB.identity.galleryUrls = restoB.gallery;
  profileB.reviews = [{ author: 'Paul', rating: 5, comment: 'Excellent' }];

  const compB = compositionEngine.compose(profileB, {
    customFamilies: ['HEADER', 'HERO', 'CATEGORY', 'PRODUCT', 'GALLERY', 'TESTIMONIAL', 'CONTACT', 'FOOTER'],
    enabledCapabilities: [CAPABILITIES.PRODUCT, CAPABILITIES.CONTACT, CAPABILITIES.GALLERY, CAPABILITIES.REVIEWS],
    archetype: 'cinematic',
  });

  // Les 2 restaurants ont le même businessType mais des compositions structurellement distinctes
  assert.equal(compA.businessType, compB.businessType);
  assert.notEqual(compA.sections.length, compB.sections.length, 'Nombre de sections différent');
  assert.notEqual(compA.sections[1].componentId, compB.sections[1].componentId, 'Hero componentId différent');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST H : BusinessTypes Différents, Même Structure
// ═══════════════════════════════════════════════════════════════════════════
test('TEST H — BusinessTypes Différents, Même Structure (Invariance des composants canoniques)', () => {
  // Une boutique de mode et une librairie demandent la même séquence canonique
  const seq = ['HEADER', 'HERO', 'CATEGORY', 'PRODUCT', 'FOOTER'];

  const compFashion = compositionEngine.compose(
    adaptStoreToBusinessProfile({ id: 's1', business_type: 'product' }, [{ id: '1', name: 'Robe' }]),
    { customFamilies: seq, archetype: 'default' }
  );

  const compBooks = compositionEngine.compose(
    adaptStoreToBusinessProfile({ id: 's2', business_type: 'wholesale' }, [{ id: '2', name: 'Livre' }]),
    { customFamilies: seq, archetype: 'default' }
  );

  assert.equal(compFashion.sections.length, compBooks.sections.length);
  for (let i = 0; i < compFashion.sections.length; i++) {
    assert.equal(
      compFashion.sections[i].componentId,
      compBooks.sections[i].componentId,
      `Section #${i} doit utiliser le même composant canonique`
    );
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST I : Déterminisme
// ═══════════════════════════════════════════════════════════════════════════
test('TEST I — Déterminisme (Même entrée -> Sortie strictement identique)', () => {
  const store = {
    id: 'store_determ',
    name: 'Boutique Déterministe',
    slug: 'boutique-determ',
    business_type: 'product',
  };

  const profile = adaptStoreToBusinessProfile(store, [{ id: 'p1', name: 'Item 1' }]);

  const comp1 = compositionEngine.compose(profile);
  const comp2 = compositionEngine.compose(profile);

  // Exclure le timestamp de génération des métadonnées pour la comparaison
  const clean1 = { ...comp1, metadata: { ...comp1.metadata, generatedAt: null } };
  const clean2 = { ...comp2, metadata: { ...comp2.metadata, generatedAt: null } };

  assert.deepEqual(clean1, clean2, 'Les compositions doivent être rigoureusement identiques');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST J : Registry Integrity
// ═══════════════════════════════════════════════════════════════════════════
test('TEST J — Registry Integrity (Tous les componentId produits sont résolubles dans ComponentRegistry)', () => {
  const CANONICAL_29_IDS = [
    'header_001', 'hero_001', 'hero_editorial', 'hero_split', 'hero_cinematic', 'hero_commerce',
    'category_001', 'product_001', 'product_carousel', 'product_list',
    'service_001', 'service_grid', 'promotion_001', 'promotion_card',
    'testimonial_001', 'testimonial_grid', 'faq_001', 'gallery_001', 'footer_001',
    'header_centered', 'hero_fullscreen', 'hero_media_left', 'category_grid', 'category_cards',
    'product_featured', 'product_compact', 'service_featured', 'gallery_masonry', 'contact_card',
    'carousel_001'
  ];
  const allArchetypes = ['default', 'editorial', 'split', 'cinematic', 'commerce', 'fullscreen', 'media_left', 'grid', 'cards', 'featured', 'compact', 'carousel', 'list', 'masonry'];
  const allFamilies = Object.values(COMPOSITION_FAMILIES);

  for (const fam of allFamilies) {
    for (const arch of allArchetypes) {
      const compId = resolveCanonicalComponentId(fam, 'product', arch);
      if (compId) {
        assert.ok(
          CANONICAL_29_IDS.includes(compId),
          `Le composant ${compId} doit être un identifiant canonique valide du catalogue`
        );
      }
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST K : Candidate Isolation
// ═══════════════════════════════════════════════════════════════════════════
test('TEST K — Candidate Isolation (Aucune CandidateSpecification générée à la volée)', () => {
  const store = {
    id: 'store_cand_iso',
    name: 'Test Isolation',
    slug: 'test-isolation',
    business_type: 'restaurant',
  };

  const profile = adaptStoreToBusinessProfile(store);
  const comp = compositionEngine.compose(profile);

  for (const sec of comp.sections) {
    assert.ok(
      !sec.componentId.startsWith('candidate_'),
      `La section ${sec.id} ne doit pas utiliser d'identifiant candidat non certifié: ${sec.componentId}`
    );
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST L : Unknown Capability
// ═══════════════════════════════════════════════════════════════════════════
test('TEST L — Unknown Capability (Une capacité inconnue est ignorée sans exception)', () => {
  const store = {
    id: 'store_unknown_cap',
    name: 'Store Cap Inconnue',
    slug: 'store-cap-inconnue',
    business_type: 'product',
  };

  const profile = adaptStoreToBusinessProfile(store);
  const comp = compositionEngine.compose(profile, {
    enabledCapabilities: ['TELEPORTATION_QUANTIQUE_V9', CAPABILITIES.PRODUCT],
  });

  assert.ok(comp, 'Composition générée avec succès');
  assert.equal(comp.businessType, 'product');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST M : Empty Business
// ═══════════════════════════════════════════════════════════════════════════
test('TEST M — Empty Business (Profil minimal -> Composition sûre et stable)', () => {
  const minimalStore = {
    id: 'store_min_pure',
  };

  const profile = adaptStoreToBusinessProfile(minimalStore);
  const comp = compositionEngine.compose(profile);

  assert.ok(comp, 'Composition produite sans crash');
  assert.ok(comp.sections.length >= 2, 'Au moins HEADER et FOOTER présents');
  assert.equal(compositionEngine.validateComposition(comp).valid, true, 'Composition déclarative valide');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST N : No Fake Contact
// ═══════════════════════════════════════════════════════════════════════════
test('TEST N — No Fake Contact (Aucune coordonnée ou localisation inventée)', () => {
  const storeWithoutContact = {
    id: 'store_no_contact',
    name: 'Boutique Anonyme',
    slug: 'boutique-anonyme',
    address: '',
    phone: '',
    whatsapp: '',
    city: '',
  };

  const profile = adaptStoreToBusinessProfile(storeWithoutContact);
  profile.identity.address = '';
  profile.identity.city = '';
  profile.identity.phone = '';
  profile.identity.whatsapp = '';

  const comp = compositionEngine.compose(profile, {
    customFamilies: ['HEADER', 'CONTACT', 'FOOTER'],
  });

  const contactSec = comp.sections.find((s) => s.family === 'CONTACT');
  assert.ok(contactSec, 'Section CONTACT présente');
  assert.equal(contactSec.config.phone, '', 'phone vide');
  assert.equal(contactSec.config.address, '', 'address vide');
  assert.equal(contactSec.config.showAddress, false, 'showAddress false');
  assert.equal(contactSec.config.showPhone, false, 'showPhone false');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST O : No BusinessType Renderer Branching
// ═══════════════════════════════════════════════════════════════════════════
test('TEST O — No BusinessType Renderer Branching (Zéro couplage businessType dans les renderers)', () => {
  const CANONICAL_DIR = path.resolve('src/lib/component-registry/canonical');
  const files = fs.readdirSync(CANONICAL_DIR).filter((f) => f.endsWith('.jsx'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(CANONICAL_DIR, file), 'utf8');
    assert.equal(
      /businessType\s*===/i.test(content),
      false,
      `Le fichier ${file} ne doit pas contenir de branching businessType === ...`
    );
  }
});
