/**
 * VesTyle / Vestin — ÉTAPE 4.10 : Intelligence de Composition Adaptative
 * ─────────────────────────────────────────────────────────────────────────────
 * Suite de tests unitaires et d'intégration validant les capacités 4.10 :
 * 1. Contraintes structurelles canoniques (anti-doublons, ancres fixes HEADER/FOOTER)
 * 2. Réordonnancement intelligent par intention utilisateur (INTENT_PRIORITY_MAP)
 * 3. Filtrage intelligent des sections optionnelles vides (filterEmptySections)
 * 4. Métadonnées responsives par section (mobilePriority, stackOnMobile)
 * 5. Résolution déterministe d'archétypes
 * 6. Méthode composeWithIntent
 * 7. Zéro Fake Data & Pureté JSON sérialisable
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  compositionEngine,
  CompositionEngine,
} from '../src/lib/composition-engine/CompositionEngine.js';

import {
  COMPOSITION_FAMILIES,
  DEFAULT_FAMILY_SEQUENCES,
  STRUCTURAL_CONSTRAINTS,
  FAMILY_RESPONSIVE_HINTS,
  INTENT_PRIORITY_MAP,
  applyStructuralConstraints,
  createIntentDescriptor,
  resolveCanonicalComponentId,
  filterFamiliesByCapabilities,
} from '../src/lib/composition-engine/compositionRules.js';

import { adaptStoreToBusinessProfile } from '../src/lib/business-profile/businessProfileAdapter.js';
import { CAPABILITIES } from '../src/lib/capability-engine/CapabilityEngine.js';

describe('VESTIN — ÉTAPE 4.10 : Intelligence de Composition Adaptative', () => {

  // ── 1. CONTRAINTES STRUCTURELLES : ANCRES FIXES ─────────────────────────────
  it('1. Ancres fixes : HEADER est toujours premier et FOOTER toujours dernier', () => {
    const chaoticSequence = [
      COMPOSITION_FAMILIES.FOOTER,
      COMPOSITION_FAMILIES.PRODUCT,
      COMPOSITION_FAMILIES.HERO,
      COMPOSITION_FAMILIES.HEADER,
      COMPOSITION_FAMILIES.CATEGORY,
    ];

    const structured = applyStructuralConstraints(chaoticSequence);

    assert.strictEqual(structured[0], COMPOSITION_FAMILIES.HEADER, 'HEADER doit être en première position');
    assert.strictEqual(structured[structured.length - 1], COMPOSITION_FAMILIES.FOOTER, 'FOOTER doit être en dernière position');
    assert.ok(structured.includes(COMPOSITION_FAMILIES.HERO));
    assert.ok(structured.includes(COMPOSITION_FAMILIES.PRODUCT));
    assert.ok(structured.includes(COMPOSITION_FAMILIES.CATEGORY));
  });

  // ── 2. CONTRAINTES STRUCTURELLES : ANTI-DOUBLONS ─────────────────────────────
  it('2. Anti-doublons : les familles uniques (HEADER, HERO, FOOTER) ne sont pas dupliquées', () => {
    const duplicatedSequence = [
      COMPOSITION_FAMILIES.HEADER,
      COMPOSITION_FAMILIES.HERO,
      COMPOSITION_FAMILIES.HEADER,
      COMPOSITION_FAMILIES.PRODUCT,
      COMPOSITION_FAMILIES.HERO,
      COMPOSITION_FAMILIES.FOOTER,
      COMPOSITION_FAMILIES.FOOTER,
    ];

    const structured = applyStructuralConstraints(duplicatedSequence);

    const countHeader = structured.filter(f => f === COMPOSITION_FAMILIES.HEADER).length;
    const countHero = structured.filter(f => f === COMPOSITION_FAMILIES.HERO).length;
    const countFooter = structured.filter(f => f === COMPOSITION_FAMILIES.FOOTER).length;

    assert.strictEqual(countHeader, 1, 'HEADER ne doit apparaître qu’une seule fois');
    assert.strictEqual(countHero, 1, 'HERO ne doit apparaître qu’une seule fois');
    assert.strictEqual(countFooter, 1, 'FOOTER ne doit apparaître qu’une seule fois');
  });

  // ── 3. INTENT DESCRIPTOR : NORMALISATION ────────────────────────────────────
  it('3. createIntentDescriptor : normalise l’intention et génère les capacités probables', () => {
    const intentFood = createIntentDescriptor({
      intent: 'sell_food',
      businessType: 'restaurant',
      prompt: 'Je veux vendre des plats à emporter avec livraison',
    });

    assert.strictEqual(intentFood.intent, 'SELL_FOOD');
    assert.strictEqual(intentFood.businessType, 'restaurant');
    assert.strictEqual(intentFood.preferredArchetype, 'split');
    assert.ok(intentFood.likelyCapabilities.includes(CAPABILITIES.PRODUCT));
    assert.ok(intentFood.likelyCapabilities.includes(CAPABILITIES.DELIVERY));
    assert.ok(Array.isArray(intentFood.suggestedFamilies));
  });

  // ── 4. RÉORDONNANCEMENT PAR INTENTION ────────────────────────────────────────
  it('4. Réordonnancement par intention : met en avant les familles prioritaires sans inventer de familles', () => {
    const baseRestaurant = DEFAULT_FAMILY_SEQUENCES.restaurant;
    // restaurant base : HEADER, HERO, CATEGORY, PRODUCT, TESTIMONIAL, CONTACT, FOOTER

    const intentDesc = createIntentDescriptor({
      intent: 'SELL_FOOD',
      businessType: 'restaurant',
    });

    const suggested = intentDesc.suggestedFamilies;
    assert.ok(suggested, 'suggestedFamilies doit être généré');
    assert.strictEqual(suggested[0], COMPOSITION_FAMILIES.HEADER);
    assert.strictEqual(suggested[suggested.length - 1], COMPOSITION_FAMILIES.FOOTER);

    // Dans SELL_FOOD : PRODUCT et CATEGORY sont prioritaires
    const prodIdx = suggested.indexOf(COMPOSITION_FAMILIES.PRODUCT);
    const testIdx = suggested.indexOf(COMPOSITION_FAMILIES.TESTIMONIAL);
    assert.ok(prodIdx < testIdx, 'PRODUCT doit apparaître avant TESTIMONIAL dans SELL_FOOD');
  });

  // ── 5. COMPOSE WITH INTENT ──────────────────────────────────────────────────
  it('5. composeWithIntent : produit une composition complète et cohérente à partir d’une intention textuelle', () => {
    const mockStore = {
      id: 'store_resto_intent',
      name: 'Chez Luigi Pizza',
      business_type: 'restaurant',
      phone: '+33612345678',
      city: 'Paris',
    };

    const profile = adaptStoreToBusinessProfile(mockStore, [
      { id: 'p1', name: 'Pizza Margherita', price: 12, category: 'Pizzas' },
    ]);

    const composition = compositionEngine.composeWithIntent(profile, 'SELL_FOOD');

    assert.strictEqual(composition.storeId, 'store_resto_intent');
    assert.strictEqual(composition.businessType, 'restaurant');
    assert.ok(Array.isArray(composition.sections));
    assert.ok(composition.sections.length >= 4);

    const header = composition.sections[0];
    const footer = composition.sections[composition.sections.length - 1];
    assert.strictEqual(header.family, 'HEADER');
    assert.strictEqual(footer.family, 'FOOTER');
  });

  // ── 6. FILTRAGE DES SECTIONS OPTIONNELLES VIDES PAR DÉFAUT ──────────────────
  it('6. filterEmptySections : omet GALLERY, FAQ, TESTIMONIAL, PROMOTION vides par défaut', () => {
    const mockStore = {
      id: 'store_minimal_clean',
      name: 'Minimal Store',
      business_type: 'beauty',
      gallery_urls: [], // Galerie vide
      reviews: [],       // Avis vides
    };

    const profile = adaptStoreToBusinessProfile(mockStore, [
      { id: 's1', name: 'Coupe Femme', price: 35 },
    ]);

    const composition = compositionEngine.compose(profile);

    const hasGallery = composition.sections.some(s => s.family === 'GALLERY');
    const hasReviews = composition.sections.some(s => s.family === 'TESTIMONIAL');
    const hasFaq = composition.sections.some(s => s.family === 'FAQ');
    const hasPromo = composition.sections.some(s => s.family === 'PROMOTION');

    assert.strictEqual(hasGallery, false, 'GALLERY vide doit être omise');
    assert.strictEqual(hasReviews, false, 'TESTIMONIAL vide doit être omis');
    assert.strictEqual(hasFaq, false, 'FAQ vide doit être omise');
    assert.strictEqual(hasPromo, false, 'PROMOTION vide doit être omise');
  });

  // ── 7. CONSERVATION DES SECTIONS VIDES SI filterEmptySections: false ────────
  it('7. filterEmptySections: false conserve les sections avec isEmpty: true et state: empty', () => {
    const mockStore = {
      id: 'store_editor_mode',
      name: 'Studio Preview',
      business_type: 'beauty',
      gallery_urls: [],
    };

    const profile = adaptStoreToBusinessProfile(mockStore, []);

    const composition = compositionEngine.compose(profile, { filterEmptySections: false });

    const gallerySec = composition.sections.find(s => s.family === 'GALLERY');
    assert.ok(gallerySec, 'GALLERY doit être présente quand filterEmptySections: false');
    assert.strictEqual(gallerySec.isEmpty, true);
    assert.strictEqual(gallerySec.state, 'empty');
    assert.strictEqual(gallerySec.config.images.length, 0);
  });

  // ── 8. SECTIONS CRITIQUES CONSERVÉES MÊME VIDES ─────────────────────────────
  it('8. Sections critiques (HEADER, HERO, PRODUCT/SERVICE, FOOTER) restent présentes', () => {
    const mockStore = {
      id: 'store_empty_catalog',
      name: 'Boutique Nouvelle',
      business_type: 'product',
    };

    const profile = adaptStoreToBusinessProfile(mockStore, []);
    const composition = compositionEngine.compose(profile);

    const families = composition.sections.map(s => s.family);
    assert.ok(families.includes('HEADER'), 'HEADER doit être présent');
    assert.ok(families.includes('HERO'), 'HERO doit être présent');
    assert.ok(families.includes('PRODUCT'), 'PRODUCT doit être présent même si catalogue vide');
    assert.ok(families.includes('FOOTER'), 'FOOTER doit être présent');

    const productSec = composition.sections.find(s => s.family === 'PRODUCT');
    assert.strictEqual(productSec.isEmpty, true);
    assert.strictEqual(productSec.state, 'empty');
  });

  // ── 9. HINTS RESPONSIVES PRÉSENTS DANS CHAQUE SECTION ───────────────────────
  it('9. Hints responsives : chaque section possède mobilePriority et stackOnMobile', () => {
    const mockStore = {
      id: 'store_responsive_test',
      name: 'Store Responsive',
      business_type: 'product',
      phone: '+33123456789',
    };

    const profile = adaptStoreToBusinessProfile(mockStore, [
      { id: 'p1', name: 'Article 1', price: 10 },
    ]);

    const composition = compositionEngine.compose(profile);

    composition.sections.forEach(sec => {
      assert.ok(sec.responsive, `Section ${sec.id} (${sec.family}) doit avoir un objet responsive`);
      assert.strictEqual(typeof sec.responsive.mobilePriority, 'number');
      assert.strictEqual(typeof sec.responsive.stackOnMobile, 'boolean');
    });

    const header = composition.sections.find(s => s.family === 'HEADER');
    const footer = composition.sections.find(s => s.family === 'FOOTER');
    assert.strictEqual(header.responsive.mobilePriority, 10, 'HEADER doit avoir mobilePriority = 10');
    assert.strictEqual(footer.responsive.mobilePriority, 1, 'FOOTER doit avoir mobilePriority = 1');
  });

  // ── 10. VALIDATION DÉCLARATIVE & STRICT SÉRIALISABILITÉ JSON ────────────────
  it('10. Validation déclarative : validateComposition confirme validité et pureté sérialisable', () => {
    const mockStore = {
      id: 'store_validation_test',
      name: 'Valid Store',
      business_type: 'service',
      phone: '+33600000000',
    };

    const profile = adaptStoreToBusinessProfile(mockStore, [
      { id: 's1', name: 'Consulting', price: 100 },
    ]);

    const composition = compositionEngine.compose(profile);
    const validation = compositionEngine.validateComposition(composition);

    assert.strictEqual(validation.valid, true, `Validation doit être true : ${validation.errors?.join(', ')}`);
    assert.strictEqual(validation.errors.length, 0);

    // Sérialisation JSON pure sans perte
    const jsonStr = JSON.stringify(composition);
    const parsed = JSON.parse(jsonStr);
    assert.deepStrictEqual(parsed, composition);
  });

  // ── 11. DÉTERMINISME PARFAIT ────────────────────────────────────────────────
  it('11. Déterminisme : deux exécutions avec les mêmes entrées produisent un résultat identique', () => {
    const mockStore = {
      id: 'store_determ',
      name: 'Boutique Déterministe',
      business_type: 'restaurant',
      phone: '+33611223344',
      city: 'Lyon',
    };

    const products = [
      { id: 'p1', name: 'Burger Maison', price: 15 },
      { id: 'p2', name: 'Frites Fraîches', price: 5 },
    ];

    const profile = adaptStoreToBusinessProfile(mockStore, products);

    const comp1 = compositionEngine.compose(profile);
    const comp2 = compositionEngine.compose(profile);

    // Comparer sans le metadata.generatedAt
    comp1.metadata.generatedAt = 'FIXED_TIME';
    comp2.metadata.generatedAt = 'FIXED_TIME';

    assert.deepStrictEqual(comp1, comp2, 'Les deux compositions doivent être rigoureusement identiques');
  });

  // ── 12. RÉSOLUTIONS D’ARCHÉTYPES PAR FAMILLE ────────────────────────────────
  it('12. resolveCanonicalComponentId : résout correctement les archetypes selon le métier', () => {
    // HERO
    assert.strictEqual(resolveCanonicalComponentId('HERO', 'restaurant', 'split'), 'hero_split');
    assert.strictEqual(resolveCanonicalComponentId('HERO', 'product', 'cinematic'), 'hero_cinematic');
    assert.strictEqual(resolveCanonicalComponentId('HERO', 'product', 'default'), 'hero_001');

    // PRODUCT
    assert.strictEqual(resolveCanonicalComponentId('PRODUCT', 'product', 'compact'), 'product_compact');
    assert.strictEqual(resolveCanonicalComponentId('PRODUCT', 'product', 'carousel'), 'product_carousel');
    assert.strictEqual(resolveCanonicalComponentId('PRODUCT', 'product', 'default'), 'product_001');

    // SERVICE
    assert.strictEqual(resolveCanonicalComponentId('SERVICE', 'service', 'featured'), 'service_featured');
    assert.strictEqual(resolveCanonicalComponentId('SERVICE', 'service', 'grid'), 'service_grid');
    assert.strictEqual(resolveCanonicalComponentId('SERVICE', 'service', 'default'), 'service_001');

    // GALLERY
    assert.strictEqual(resolveCanonicalComponentId('GALLERY', 'beauty', 'masonry'), 'gallery_masonry');
    assert.strictEqual(resolveCanonicalComponentId('GALLERY', 'beauty', 'default'), 'gallery_001');
  });
});
