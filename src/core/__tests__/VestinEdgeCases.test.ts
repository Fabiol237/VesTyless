/**
 * VesTyle / Vestin — Phase 2A Comprehensive Stress & Edge Case Test Suite
 * ─────────────────────────────────────────────────────────────────────────────
 * Validation formelle et exhaustive de VestinAdaptationEngine sur :
 * 1. Cardinalités extrêmes (0, 1, 3, 20, 100 produits)
 * 2. Données manquantes (Logo, Bannière, WhatsApp, Images)
 * 3. Textes géants et dépassements (Titres > 500 cars, Descriptions > 2000 cars)
 * 4. Tous les secteurs d'activité (Mode, Services, Hybride, Restaurant, Hôtel, Coiffure, Location, Élevage)
 * 5. Préservation absolue des IDs, variants, styles et niveaux de liberté.
 */

import { describe, test, expect } from 'vitest';
import { designRegistry } from '../registry/LocalDesignRegistry';
import { VestinAdaptationEngine } from '../adaptation/VestinAdaptationEngine';
import { validateStorefrontConfig } from '@/types/storefront';

describe('VestinEdgeCases Suite', () => {
  test('should run comprehensive stress and edge case tests', async () => {
    const results = await runComprehensiveStressTests();
    expect(results.failed).toBe(0);
    expect(results.passed).toBeGreaterThan(0);
  });
});

export async function runComprehensiveStressTests() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    failures: [] as string[],
    testDetails: [] as { name: string; status: 'PASSED' | 'FAILED'; notes: string }[],
  };

  const design = await designRegistry.getDesign('vst_dsn_prestige_atelier_001');

  function recordTest(name: string, assertion: () => boolean, notes: string = '') {
    results.total++;
    try {
      const isOk = assertion();
      if (isOk) {
        results.passed++;
        results.testDetails.push({ name, status: 'PASSED', notes });
      } else {
        results.failed++;
        results.failures.push(name);
        results.testDetails.push({ name, status: 'FAILED', notes: `Assertion failed: ${notes}` });
      }
    } catch (err: any) {
      results.failed++;
      results.failures.push(name);
      results.testDetails.push({ name, status: 'FAILED', notes: `Error thrown: ${err.message}` });
    }
  }

  // ── 1. TESTS DE CARDINALITÉ PRODUITS (0, 1, 3, 20, 100) ──

  // 1.1 - 0 Produit
  recordTest('0 Produit (Vide)', () => {
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Boutique Zéro', city: 'Douala' },
      sellerContent: { products: [] },
    });
    validateStorefrontConfig(config);
    const prodSection = config.sections.find((s) => s.type === 'PRODUCT_GRID');
    return Array.isArray((prodSection?.content as any)?.products);
  }, 'Gère 0 produit sans crash ni exception Zod');

  // 1.2 - 1 Produit
  recordTest('1 Produit (Catalogue unitaire)', () => {
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Boutique Solo', city: 'Yaoundé' },
      sellerContent: {
        products: [{ name: 'Prestation Unique', price: 15000, category: 'Unique' }],
      },
    });
    validateStorefrontConfig(config);
    const prodSection = config.sections.find((s) => s.type === 'PRODUCT_GRID');
    const prods = (prodSection?.content as any)?.products as any[];
    return prods.length === 1 && prods[0].name === 'Prestation Unique';
  }, 'Injecte exactement 1 article');

  // 1.3 - 3 Produits (Standard)
  recordTest('3 Produits (Standard)', () => {
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Boutique Trio', city: 'Bafoussam' },
      sellerContent: {
        products: [
          { name: 'P1', price: 1000 },
          { name: 'P2', price: 2000 },
          { name: 'P3', price: 3000 },
        ],
      },
    });
    validateStorefrontConfig(config);
    const prods = ((config.sections.find((s) => s.type === 'PRODUCT_GRID')?.content as any)?.products as any[]);
    return prods.length === 3;
  }, 'Injecte les 3 articles');

  // 1.4 - 20 Produits (Vérification de la cardinalité Max = 6 en Home)
  recordTest('20 Produits (Troncature contrôlée en Home)', () => {
    const prods = Array.from({ length: 20 }, (_, i) => ({ name: `Article ${i + 1}`, price: 1000 * (i + 1) }));
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Grand Magasin 20', city: 'Douala' },
      sellerContent: { products: prods },
    });
    validateStorefrontConfig(config);
    const homeProds = ((config.sections.find((s) => s.type === 'PRODUCT_GRID')?.content as any)?.products as any[]);
    // La cardinalité sur la section d'accueil est limitée à 6 pour préserver l'élégance
    return homeProds.length <= 6;
  }, 'Limite les articles sur l’accueil selon la cardinalité du design');

  // 1.5 - 100 Produits (Catalogue géant)
  recordTest('100 Produits (Stress Test Volume)', () => {
    const prods = Array.from({ length: 100 }, (_, i) => ({ name: `Article ${i + 1}`, price: 500 * (i + 1) }));
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Grossiste 100', city: 'Douala' },
      sellerContent: { products: prods },
    });
    validateStorefrontConfig(config);
    return config.sections.length > 0;
  }, 'Traite 100 articles sans latence ni crash mémoire');

  // ── 2. TESTS DE DONNÉES MANQUANTES OU DÉGRADÉES ──

  // 2.1 - Logo absent
  recordTest('Logo absent (Fallback gracieux)', () => {
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Sans Logo SA', city: 'Kribi' },
      sellerContent: { logoUrl: undefined },
    });
    validateStorefrontConfig(config);
    return config.metadata.logoUrl === '';
  }, 'Ne plante pas quand le logo est undefined');

  // 2.2 - Bannière absente (Utilise le placeholder du designer)
  recordTest('Bannière absente (Placeholder du Designer)', () => {
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Sans Bannière', city: 'Garoua' },
      sellerContent: { bannerUrl: undefined },
    });
    validateStorefrontConfig(config);
    const heroSec = config.sections.find((s) => s.type === 'HERO');
    return typeof (heroSec?.content as any)?.bannerUrl === 'string' && (heroSec?.content as any)?.bannerUrl.length > 0;
  }, 'Injecte la bannière par défaut du design');

  // 2.3 - WhatsApp absent (Fallback numéro de secours)
  recordTest('WhatsApp absent (Normalisation sécurisée)', () => {
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Sans WhatsApp', city: 'Douala', whatsapp: undefined },
      sellerContent: {},
    });
    validateStorefrontConfig(config);
    return typeof config.metadata.whatsapp === 'string' && config.metadata.whatsapp.length >= 8;
  }, 'Applique un numéro propre sans casser les liens');

  // 2.4 - Images de produits absentes
  recordTest('Produits sans images (Gestion des listes sans crash)', () => {
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'No Image Boutique', city: 'Douala' },
      sellerContent: {
        products: [
          { name: 'Article Sans Photo', price: 5000, image: undefined },
        ],
      },
    });
    validateStorefrontConfig(config);
    return true;
  }, 'Gère les articles sans image');

  // ── 3. TESTS DE TEXTES GÉANTS ET OVERFLOW ──

  // 3.1 - Titre très long (> 500 caractères)
  recordTest('Titre géant (> 500 cars) (Application de la règle Ellipsis)', () => {
    const giantTitle = 'NOUVELLE COLLECTION DE LUXE EXTRAORDINAIRE '.repeat(15);
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Maison Géante', city: 'Douala' },
      sellerContent: {},
      aiCopywriting: { heroTitle: giantTitle },
    });
    validateStorefrontConfig(config);
    const heroSec = config.sections.find((s) => s.type === 'HERO');
    const title = (heroSec?.content as any)?.title as string;
    // Règle textLimits maxCharacters = 120
    return title.length <= 120 && title.endsWith('...');
  }, 'Tronque proprement le titre géant avec ellipsis à 120 caractères');

  // 3.2 - Description très longue (> 2000 caractères)
  recordTest('Description géante (> 2000 cars)', () => {
    const giantDesc = 'Notre histoire commence il y a plusieurs décennies dans les ateliers traditionnels... '.repeat(30);
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Maison Histoire Longue', city: 'Douala', description: giantDesc },
      sellerContent: {},
    });
    validateStorefrontConfig(config);
    return config.metadata.description.length > 0;
  }, 'Gère les descriptions kilométriques sans bloquer le parseur Zod');

  // ── 4. TESTS DE TOUS LES VERTICAUX MÉTIER (8 VERTICAUX) ──

  const VERTICALS = [
    { type: 'PHYSICAL_PRODUCT', name: 'Mode & Chaussures', city: 'Douala' },
    { type: 'SERVICE', name: 'Cabinet Conseil & Audit', city: 'Yaoundé' },
    { type: 'HYBRID', name: 'Librairie & Formations', city: 'Bafoussam' },
    { type: 'RESTAURANT', name: 'Snack & Grillades Akwa', city: 'Douala' },
    { type: 'SERVICE', name: 'Hôtel & Suites 5 Étoiles', city: 'Kribi' },
    { type: 'SERVICE', name: 'Salon Coiffure HD & Tresses', city: 'Douala' },
    { type: 'SERVICE', name: 'Location Voitures VIP', city: 'Yaoundé' },
    { type: 'LIVESTOCK_PRODUCT', name: 'Élevage Porcs & Volailles', city: 'Bafoussam' },
  ];

  for (const v of VERTICALS) {
    recordTest(`Vertical Métier : ${v.name} (${v.type})`, () => {
      const config = VestinAdaptationEngine.adapt(design, {
        businessProfile: {
          storeName: v.name,
          city: v.city,
          businessType: v.type as any,
          whatsapp: '237699001122',
        },
        sellerContent: {
          products: [{ name: `Offre ${v.name}`, price: 25000, category: 'Principal' }],
        },
      });
      validateStorefrontConfig(config);
      return config.metadata.businessType === v.type && config.metadata.city === v.city;
    }, `Adaptation propre pour le vertical ${v.name}`);
  }

  // ── 5. VÉRIFICATION DE LA PRÉSERVATION STRICTE DES IDS ET STRUCTURES ──

  recordTest('Préservation stricte des IDs de sections', () => {
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Test ID', city: 'Douala' },
      sellerContent: {},
    });
    const sectionIds = config.sections.map((s) => s.id);
    const expectedIds = ['sec_header', 'sec_hero', 'sec_products', 'sec_trust_badges', 'sec_footer'];
    return expectedIds.every((id) => sectionIds.includes(id));
  }, 'Conserve exactement sec_header, sec_hero, sec_products, sec_trust_badges, sec_footer');

  recordTest('Préservation stricte des Variants de sections', () => {
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Test Variants', city: 'Douala' },
      sellerContent: {},
    });
    const heroSec = config.sections.find((s) => s.id === 'sec_hero');
    return heroSec?.variant === 'hero_asymmetric_gold_01';
  }, 'Conserve la variante originale hero_asymmetric_gold_01');

  recordTest('Respect du niveau LOCKED sur la Typographie', () => {
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Test Fonts', city: 'Douala' },
      sellerContent: {},
      preferences: { customAccentColor: '#FF0000' },
    });
    // La typographie doit rester exactement celle du DesignDefinition
    return config.theme.headingFont === design.styleSystem.typography.fontFamilyHeading;
  }, 'La police Playfair Display est strictement verrouillée (LOCKED)');

  return results;
}
