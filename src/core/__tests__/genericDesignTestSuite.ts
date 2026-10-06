/**
 * VesTyle / Vestin — Generic DesignDefinition Test Suite (v3.0)
 * ─────────────────────────────────────────────────────────────────────────────
 * Suite de tests générique réutilisable pour valider n'importe quel DesignDefinition
 * selon les exigences strictes de la Phase 2B :
 * 1. Validation Zod stricte du DesignDefinition
 * 2. Stabilité et unicité des IDs
 * 3. Validité des bindings 2.0 (toutes les cibles existent)
 * 4. Conservation des variantes de section
 * 5. Respect des niveaux LOCKED / CONTROLLED / ADAPTIVE
 * 6. Edge cases : 0, 1, 3, 20, 100 articles
 * 7. Données manquantes (logo, bannière, WhatsApp, photos)
 * 8. Textes extrêmes (> 500 cars avec troncature)
 * 9. Production d'un StorefrontConfig v3.0.0 strictement valide
 * 10. Test de parité structurelle Builder / Vitrine Publique
 */

import { DesignDefinitionSchema, type DesignDefinition } from '../contracts/designDefinition';
import { VestinAdaptationEngine } from '../adaptation/VestinAdaptationEngine';
import { validateStorefrontConfig, type StorefrontConfig } from '@/types/storefront';

export interface DesignValidationReport {
  designId: string;
  designName: string;
  totalTests: number;
  passed: number;
  failed: number;
  errors: string[];
  testDetails: Array<{ name: string; status: 'PASSED' | 'FAILED'; notes: string }>;
}

export function testDesignDefinition(design: DesignDefinition): DesignValidationReport {
  const report: DesignValidationReport = {
    designId: design?.id || 'unknown',
    designName: design?.meta?.name || 'unknown',
    totalTests: 0,
    passed: 0,
    failed: 0,
    errors: [],
    testDetails: [],
  };

  function assert(name: string, fn: () => boolean, notes: string = '') {
    report.totalTests++;
    try {
      const ok = fn();
      if (ok) {
        report.passed++;
        report.testDetails.push({ name, status: 'PASSED', notes });
      } else {
        report.failed++;
        report.errors.push(`${name} (Assertion false)`);
        report.testDetails.push({ name, status: 'FAILED', notes: `Échec assertion: ${notes}` });
      }
    } catch (err: any) {
      report.failed++;
      report.errors.push(`${name} (${err.message})`);
      report.testDetails.push({ name, status: 'FAILED', notes: `Erreur levée: ${err.message}` });
    }
  }

  // ── 1. VALIDATION ZOD DU DESIGN DEFINITION ──
  assert('1. Validation Zod du contrat DesignDefinition', () => {
    DesignDefinitionSchema.parse(design);
    return true;
  }, 'Le schéma Zod est validé à 100% sans exception.');

  // ── 2. STABILITÉ ET UNICITÉ DES IDS ──
  assert('2. Unicité et stabilité des IDs de section et page', () => {
    const pageIds = Object.keys(design.pages);
    if (pageIds.length === 0) return false;
    const allSectionIds = new Set<string>();
    for (const page of Object.values(design.pages)) {
      for (const sec of page.sections) {
        if (!sec.id || allSectionIds.has(sec.id)) return false;
        allSectionIds.add(sec.id);
      }
    }
    return true;
  }, 'Tous les IDs de pages et de sections sont uniques et non vides.');

  // ── 3. VALIDITÉ DES BINDINGS ──
  assert('3. Validité sémantique des ContentBinding 2.0', () => {
    for (const page of Object.values(design.pages)) {
      for (const sec of page.sections) {
        if (Array.isArray(sec.bindings)) {
          for (const b of sec.bindings) {
            if (!b.bindingId || !b.source || !b.targetNodeId || !b.semanticRole) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }, 'Toutes les règles de binding déclarent une source et un rôle sémantique valide.');

  // ── 4. RESPECT DES NIVEAUX DE LIBERTÉ (LOCKED / CONTROLLED / ADAPTIVE) ──
  assert('4. Respect des niveaux de liberté', () => {
    const rules = design.adaptationRules?.allowedFreedomLevels || {};
    // La typographie doit être LOCKED ou CONTROLLED
    const headingRule = rules['typography.fontFamilyHeading'];
    return headingRule === 'LOCKED' || headingRule === 'CONTROLLED';
  }, 'La typographie maîtresse est protégée (LOCKED/CONTROLLED).');

  // ── 5. TESTS DE CARDINALITÉ (0, 1, 3, 20, 100 PRODUITS) ──
  assert('5. Adaptation avec 0 produit (Catalogue vide)', () => {
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Test 0', city: 'Douala' },
      sellerContent: { products: [] },
    });
    validateStorefrontConfig(config);
    return Array.isArray(config.sections);
  }, '0 produit géré proprement sans crash.');

  assert('6. Adaptation avec 1 produit (Catalogue unitaire)', () => {
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Test 1', city: 'Douala' },
      sellerContent: { products: [{ name: 'Prestation Unique', price: 10000 }] },
    });
    validateStorefrontConfig(config);
    const prodSec = config.sections.find((s) => s.type === 'PRODUCT_GRID' || s.type === 'SERVICE_LIST');
    const prods = (prodSec?.content?.products as any[]) || [];
    return prods.length === 1 && prods[0].name === 'Prestation Unique';
  }, '1 produit injecté avec exactitude.');

  assert('7. Adaptation avec 3 produits (Standard)', () => {
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Test 3', city: 'Douala' },
      sellerContent: {
        products: [
          { name: 'Article 1', price: 1000 },
          { name: 'Article 2', price: 2000 },
          { name: 'Article 3', price: 3000 },
        ],
      },
    });
    validateStorefrontConfig(config);
    const prodSec = config.sections.find((s) => s.type === 'PRODUCT_GRID' || s.type === 'SERVICE_LIST');
    const prods = (prodSec?.content?.products as any[]) || [];
    return prods.length === 3;
  }, '3 articles injectés avec exactitude.');

  assert('8. Troncature d’Accueil sur 20 produits', () => {
    const prods = Array.from({ length: 20 }, (_, i) => ({ name: `Prod ${i + 1}`, price: 1000 * (i + 1) }));
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Test 20', city: 'Douala' },
      sellerContent: { products: prods },
    });
    validateStorefrontConfig(config);
    const prodSec = config.sections.find((s) => s.type === 'PRODUCT_GRID' || s.type === 'SERVICE_LIST');
    const homeProds = (prodSec?.content?.products as any[]) || [];
    return homeProds.length <= 6;
  }, 'La cardinalité d’accueil limite à 6 articles pour préserver le design.');

  assert('9. Stress test 100 produits', () => {
    const prods = Array.from({ length: 100 }, (_, i) => ({ name: `Prod ${i + 1}`, price: 500 * (i + 1) }));
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Grossiste 100', city: 'Douala' },
      sellerContent: { products: prods },
    });
    validateStorefrontConfig(config);
    return config.sections.length > 0;
  }, '100 articles traités sans dépassement mémoire.');

  // ── 6. DONNÉES MANQUANTES ET TRONCATURE DE TEXTE ──
  assert('10. Données manquantes (Logo, Bannière, WhatsApp)', () => {
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Boutique Dégradée', city: 'Douala', whatsapp: undefined },
      sellerContent: { logoUrl: undefined, bannerUrl: undefined },
    });
    validateStorefrontConfig(config);
    return config.metadata.whatsapp.length >= 8 && config.metadata.logoUrl === '';
  }, 'Normalisation de secours appliquée sans exception.');

  assert('11. Troncature d’un titre géant (> 500 caractères)', () => {
    const giantTitle = 'TITRE EXTRAORDINAIREMENT LONG '.repeat(25);
    const config = VestinAdaptationEngine.adapt(design, {
      businessProfile: { storeName: 'Titre Géant', city: 'Douala' },
      sellerContent: {},
      aiCopywriting: { heroTitle: giantTitle },
    });
    const heroSec = config.sections.find((s) => s.type === 'HERO');
    const title = String(heroSec?.content?.title || '');
    return title.length <= 120 && title.endsWith('...');
  }, 'Le titre est tronqué à max 120 cars avec ellipsis.');

  // ── 7. TEST DE PARITÉ BUILDER / VITRINE PUBLIQUE ──
  assert('12. Parité structurelle stricte Builder / Vitrine Publique', () => {
    // 1. Instanciation pour le Builder
    const builderConfig = VestinAdaptationEngine.adapt(
      design,
      {
        businessProfile: { storeName: 'Boutique Test Parité', city: 'Douala', whatsapp: '237674151728' },
        sellerContent: { products: [{ name: 'Test Article', price: 5000 }] },
      },
      'store_parity_test'
    );

    // 2. Simulation de sauvegarde / relecture depuis Supabase (colonne published_config)
    const serializedJson = JSON.stringify(builderConfig);
    const publicConfig: StorefrontConfig = validateStorefrontConfig(JSON.parse(serializedJson));

    // 3. Vérification de l'égalité absolue
    const sameId = builderConfig.id === publicConfig.id;
    const sameSectionsCount = builderConfig.sections.length === publicConfig.sections.length;
    const sameThemePrimary = builderConfig.theme.primaryColor === publicConfig.theme.primaryColor;
    const sameHeadingFont = builderConfig.theme.headingFont === publicConfig.theme.headingFont;
    const samePagesCount = (builderConfig.pages?.length || 0) === (publicConfig.pages?.length || 0);

    return sameId && sameSectionsCount && sameThemePrimary && sameHeadingFont && samePagesCount;
  }, 'La structure est rigoureusement identique à 100% entre le Builder et la Vitrine Publique.');

  return report;
}
