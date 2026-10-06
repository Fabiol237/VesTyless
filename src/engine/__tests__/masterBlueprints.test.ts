/**
 * VesTyle — Master Blueprint Registry & Selector — Suite de Tests Unitaires & Intégration
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Tests couverts :
 *   1. MasterBlueprintRegistry — Enregistrement et intégrité des 4 Master Blueprints
 *   2. MasterBlueprintRegistry — Récupération par ID court et par Code complet
 *   3. MasterBlueprintRegistry — Validation Zod de chaque Master Blueprint
 *   4. MasterBlueprintRegistry — Instanciation contextuelle des sections
 *   5. BlueprintSelector — Résolution déterministe pour chaque BusinessType
 *   6. BlueprintSelector — Analyse sémantique d'intention textuelle (mots-clés)
 *   7. BlueprintSelector — Détection multi-verticale et fallback intelligent vers BP03
 *   8. BlueprintInjector Pipeline — Intégration complète Master Blueprint + ThemeSeed ➔ StorefrontConfig
 *   9. BlueprintInjector Pipeline — Validation Zod stricte de chaque configuration générée
 *  10. BlueprintInjector Pipeline — Résilience totale aux données incomplètes / corrompues
 */

import { describe, it, expect, vi } from 'vitest';
import {
  MasterBlueprintRegistry,
  MASTER_BLUEPRINTS,
  BP01_RETAIL_ECOM,
  BP02_SERVICE_PRO,
  BP03_HYBRID_MARKET,
  BP04_LIVESTOCK_FARM,
  MasterBlueprintSchema,
  type MasterBlueprint,
} from '../masterBlueprints';

import {
  selectOptimalBlueprint,
  getBlueprintById,
  getAllBlueprints,
  findBlueprintsForBusinessType,
} from '../blueprintSelector';

import {
  inject,
  injectFromSeed,
  FALLBACK_STOREFRONT_CONFIG,
  type InjectionPayload,
} from '../blueprintInjector';

import {
  decodeSeed,
  seedToTheme,
} from '../themeSeed';

import { StorefrontConfigSchema, type BusinessType } from '@/types/storefront';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — MasterBlueprintRegistry & Intégrité des Blueprints
// ─────────────────────────────────────────────────────────────────────────────

describe('MasterBlueprintRegistry', () => {

  it('contient au moins les 4 Master Blueprints de référence', () => {
    const all = MasterBlueprintRegistry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(4);

    const ids = all.map(bp => bp.id);
    expect(ids).toContain('BP01');
    expect(ids).toContain('BP02');
    expect(ids).toContain('BP03');
    expect(ids).toContain('BP04');
  });

  it('permet la récupération par ID court (BP01, BP02, BP03, BP04)', () => {
    expect(MasterBlueprintRegistry.get('BP01')?.code).toBe('BP01_RETAIL_ECOM');
    expect(MasterBlueprintRegistry.get('BP02')?.code).toBe('BP02_SERVICE_PRO');
    expect(MasterBlueprintRegistry.get('BP03')?.code).toBe('BP03_HYBRID_MARKET');
    expect(MasterBlueprintRegistry.get('BP04')?.code).toBe('BP04_LIVESTOCK_FARM');
  });

  it('permet la récupération par Code complet insensible à la casse', () => {
    expect(MasterBlueprintRegistry.get('bp01_retail_ecom')?.id).toBe('BP01');
    expect(MasterBlueprintRegistry.get('BP02_SERVICE_PRO')?.id).toBe('BP02');
    expect(MasterBlueprintRegistry.get('bp03_hybrid_market')?.id).toBe('BP03');
    expect(MasterBlueprintRegistry.get('BP04_LIVESTOCK_FARM')?.id).toBe('BP04');
  });

  it('retourne undefined pour un ID inexistant', () => {
    expect(MasterBlueprintRegistry.get('BP99_UNKNOWN')).toBeUndefined();
    expect(MasterBlueprintRegistry.get('')).toBeUndefined();
  });

  it('has() vérifie correctement l\'existence d\'un blueprint', () => {
    expect(MasterBlueprintRegistry.has('BP01')).toBe(true);
    expect(MasterBlueprintRegistry.has('BP99')).toBe(false);
  });

  it('chaque Master Blueprint de référence est 100% conforme à MasterBlueprintSchema', () => {
    MASTER_BLUEPRINTS.forEach(bp => {
      const validation = MasterBlueprintSchema.safeParse(bp);
      expect(validation.success, `Blueprint ${bp.id} non conforme Zod: ${JSON.stringify(validation.error)}`).toBe(true);
    });
  });

  it('chaque Master Blueprint a des sections canoniques avec ordre croissant', () => {
    MASTER_BLUEPRINTS.forEach(bp => {
      expect(bp.sections.length).toBeGreaterThanOrEqual(4);

      // Vérifie que HEADER, HERO, CONTACT, FOOTER sont toujours présents
      const types = bp.sections.map(s => s.type);
      expect(types).toContain('HEADER');
      expect(types).toContain('HERO');
      expect(types).toContain('CONTACT');
      expect(types).toContain('FOOTER');

      // Vérifie que les ordres sont croissants
      for (let i = 0; i < bp.sections.length - 1; i++) {
        expect(bp.sections[i].order).toBeLessThanOrEqual(bp.sections[i + 1].order);
      }
    });
  });

  it('chaque Master Blueprint a un recommendedThemeSeed valide et décodable sans erreur', () => {
    MASTER_BLUEPRINTS.forEach(bp => {
      expect(bp.recommendedThemeSeed).toMatch(/^VST-[A-Z0-9]+-CLR\d{2}-F\d{2}-V[A-F](-DARK)?$/);
      const decoded = decodeSeed(bp.recommendedThemeSeed);
      expect(decoded.resolvedTheme.primaryColor).toBeTruthy();
      expect(decoded.resolvedTheme.font).toBeTruthy();

      const theme = seedToTheme(decoded);
      expect(theme.primaryColor).toBeTruthy();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — Instanciation Contextuelle des Sections
// ─────────────────────────────────────────────────────────────────────────────

describe('MasterBlueprintRegistry.instantiateSections()', () => {

  it('injecte dynamiquement les métadonnées de l\'entreprise dans les sections', () => {
    const meta = {
      storeName: 'Atelier Belle Ébène',
      city: 'Yaoundé',
      slogan: 'L\'art du pagne moderne',
      description: 'Créations artisanales sur mesure.',
      whatsapp: '+237690112233',
      address: 'Marché Central, Allée B',
    };

    const sections = MasterBlueprintRegistry.instantiateSections(BP01_RETAIL_ECOM, meta);

    // Vérifie le Hero
    const hero = sections.find(s => s.type === 'HERO');
    expect(hero?.content.title).toBe(meta.slogan);
    expect(hero?.content.subtitle).toBe(meta.description);

    // Vérifie le Header
    const header = sections.find(s => s.type === 'HEADER');
    expect(header?.content.storeName).toBe(meta.storeName);
    expect(header?.content.city).toBe(meta.city);

    // Vérifie le Contact
    const contact = sections.find(s => s.type === 'CONTACT');
    expect(contact?.content.whatsapp).toBe(meta.whatsapp);
    expect(contact?.content.address).toBe(meta.address);
  });

  it('génère des identifiants de section uniques et bien formés', () => {
    const sections = MasterBlueprintRegistry.instantiateSections(BP04_LIVESTOCK_FARM, {
      storeName: 'Ferme Avicole Obala',
    });

    const ids = sections.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(sections.length);

    sections.forEach(s => {
      expect(s.id).toMatch(/^sec_[a-z]+_\d+$/);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — Intelligent Blueprint Selector
// ─────────────────────────────────────────────────────────────────────────────

describe('BlueprintSelector', () => {

  describe('Résolution déterministe par BusinessType', () => {
    it('PHYSICAL_PRODUCT ➔ BP01_RETAIL_ECOM', () => {
      const bp = selectOptimalBlueprint('PHYSICAL_PRODUCT');
      expect(bp.id).toBe('BP01');
      expect(bp.code).toBe('BP01_RETAIL_ECOM');
    });

    it('SERVICE ➔ BP02_SERVICE_PRO', () => {
      const bp = selectOptimalBlueprint('SERVICE');
      expect(bp.id).toBe('BP02');
      expect(bp.code).toBe('BP02_SERVICE_PRO');
    });

    it('HYBRID ➔ BP03_HYBRID_MARKET', () => {
      const bp = selectOptimalBlueprint('HYBRID');
      expect(bp.id).toBe('BP03');
      expect(bp.code).toBe('BP03_HYBRID_MARKET');
    });

    it('LIVESTOCK_PRODUCT ➔ BP04_LIVESTOCK_FARM', () => {
      const bp = selectOptimalBlueprint('LIVESTOCK_PRODUCT');
      expect(bp.id).toBe('BP04');
      expect(bp.code).toBe('BP04_LIVESTOCK_FARM');
    });

    it('ARTISAN ➔ BP01_RETAIL_ECOM (par défaut orienté produit)', () => {
      const bp = selectOptimalBlueprint('ARTISAN');
      expect(bp.id).toBe('BP01');
    });

    it('RESTAURANT ➔ BP05_RESTAURANT_FOOD', () => {
      const bp = selectOptimalBlueprint('RESTAURANT');
      expect(bp.id).toBe('BP05');
      expect(bp.code).toBe('BP05_RESTAURANT_FOOD');
    });

    it('Type inconnu ou indéterminé ➔ Fallback BP03_HYBRID_MARKET', () => {
      expect(selectOptimalBlueprint('UNKNOWN_TYPE').id).toBe('BP03');
      expect(selectOptimalBlueprint('').id).toBe('BP03');
      expect(selectOptimalBlueprint(undefined).id).toBe('BP03');
    });
  });

  describe('Analyse sémantique d\'intention textuelle (IntentData)', () => {
    it('détecte un élevage de poulets via les mots-clés ➔ BP04_LIVESTOCK_FARM', () => {
      const bp = selectOptimalBlueprint('PHYSICAL_PRODUCT', {
        storeName: 'Ferme des Bambous',
        description: 'Vente de poulets de chair bien nourris et porcelets sevrés.',
        sector: 'agriculture',
      });
      expect(bp.id).toBe('BP04');
    });

    it('détecte une activité de formation / cours ➔ BP02_SERVICE_PRO', () => {
      const bp = selectOptimalBlueprint('SERVICE', {
        storeName: 'Centre Excel Maths',
        description: 'Cours de soutien scolaire et formation professionnelle en bureautique.',
      });
      expect(bp.id).toBe('BP02');
    });

    it('détecte une activité hybride combinée (vêtements + cours) ➔ BP03_HYBRID_MARKET', () => {
      const bp = selectOptimalBlueprint(undefined, {
        storeName: 'Atelier Mode & Formation',
        description: 'Vente de vêtements traditionnels et cours de couture pour débutants.',
      });
      expect(bp.id).toBe('BP03');
    });

    it('détecte une boutique de mode ➔ BP01_RETAIL_ECOM', () => {
      const bp = selectOptimalBlueprint('PHYSICAL_PRODUCT', {
        storeName: 'Glamour Chic Douala',
        description: 'Boutique de robes de soirée, sacs à main et chaussures tendance.',
      });
      expect(bp.id).toBe('BP01');
    });
  });

  describe('Helpers utilitaires', () => {
    it('getBlueprintById() retourne le blueprint attendu', () => {
      expect(getBlueprintById('BP01')?.id).toBe('BP01');
      expect(getBlueprintById('bp02')?.id).toBe('BP02');
    });

    it('getAllBlueprints() retourne les 5 blueprints distincts', () => {
      const all = getAllBlueprints();
      expect(all.length).toBe(5);
    });

    it('findBlueprintsForBusinessType() filtre correctement', () => {
      const serviceBps = findBlueprintsForBusinessType('SERVICE');
      expect(serviceBps.some(bp => bp.id === 'BP02')).toBe(true);

      const livestockBps = findBlueprintsForBusinessType('LIVESTOCK_PRODUCT');
      expect(livestockBps.some(bp => bp.id === 'BP04')).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — Pipeline d'Intégration Global (Payload ➔ Config Zod ➔ Rendu)
// ─────────────────────────────────────────────────────────────────────────────

describe('Pipeline d\'Intégration Global BlueprintInjector', () => {

  it('injecte un commerce de détail physique avec BP01 et produit une config 100% valide Zod', () => {
    const config = inject({
      businessMeta: {
        storeName: 'Boutique Kribi Chic',
        businessType: 'PHYSICAL_PRODUCT',
        city: 'Kribi',
        sector: 'fashion',
        phone: '+237670001122',
        whatsapp: '+237670001122',
        slogan: 'Le meilleur de la mode balnéaire',
        description: 'Maillots, robes de plage et accessoires élégants.',
      },
      // themeSeed absent ➔ BlueprintInjector utilise recommendedThemeSeed de BP01
      // sections absent ➔ BlueprintInjector instancie les sections de BP01
    });

    expect(config.name).toBe('Boutique Kribi Chic');
    expect(config.metadata.city).toBe('Kribi');
    expect(config.metadata.businessType).toBe('PHYSICAL_PRODUCT');

    // Vérifie la présence des sections canoniques de BP01
    const types = config.sections.map(s => s.type);
    expect(types).toContain('HEADER');
    expect(types).toContain('HERO');
    expect(types).toContain('CATEGORY');
    expect(types).toContain('PRODUCT');
    expect(types).toContain('TESTIMONIAL');
    expect(types).toContain('CONTACT');
    expect(types).toContain('FOOTER');

    // Validation Zod absolue
    const parsed = StorefrontConfigSchema.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  it('injecte un prestataire de service avec BP02 et produit une config 100% valide Zod', () => {
    const config = inject({
      businessMeta: {
        storeName: 'Cabinet Fiscalité & Conseil Douala',
        businessType: 'SERVICE',
        city: 'Douala',
        sector: 'consulting',
        whatsapp: '+237699887766',
        slogan: 'Votre partenaire comptable de confiance',
        description: 'Assistance fiscale, tenue de livres et audit d\'entreprises.',
      },
    });

    expect(config.name).toBe('Cabinet Fiscalité & Conseil Douala');
    const types = config.sections.map(s => s.type);
    expect(types).toContain('SERVICES');
    expect(types).toContain('PRICING');
    expect(types).toContain('CONTACT');

    const parsed = StorefrontConfigSchema.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  it('injecte un commerce mixte avec BP03 et produit une config 100% valide Zod', () => {
    const config = inject({
      businessMeta: {
        storeName: 'Complexe Polyvalent Bafoussam',
        businessType: 'HYBRID',
        city: 'Bafoussam',
        sector: 'hybrid',
        whatsapp: '+237655443322',
        description: 'Vente d\'ordinateurs, réparation express et formation bureautique.',
      },
    });

    expect(config.name).toBe('Complexe Polyvalent Bafoussam');
    const types = config.sections.map(s => s.type);
    expect(types).toContain('SERVICES');
    expect(types).toContain('PRODUCT');
    expect(types).toContain('PRICING');

    const parsed = StorefrontConfigSchema.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  it('injecte une ferme agropastorale avec BP04 et produit une config 100% valide Zod', () => {
    const config = inject({
      businessMeta: {
        storeName: 'Élevage du Noun',
        businessType: 'LIVESTOCK_PRODUCT',
        city: 'Foumban',
        sector: 'livestock',
        whatsapp: '+237691234599',
        slogan: 'Volailles et porcs de race sélectionnée',
        description: 'Approvisionnement régulier pour grossistes et restaurateurs.',
      },
    });

    expect(config.name).toBe('Élevage du Noun');
    const types = config.sections.map(s => s.type);
    expect(types).toContain('CATEGORY');
    expect(types).toContain('PRODUCT');
    expect(types).toContain('SERVICES');

    const parsed = StorefrontConfigSchema.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  it('injectFromSeed avec BP04 génère une vitrine d\'élevage complète', () => {
    const config = injectFromSeed(
      {
        storeName: 'Agro Ferme Sanaga',
        businessType: 'LIVESTOCK_PRODUCT',
        city: 'Edéa',
        whatsapp: '+237677112233',
      },
      'BP04',
      'CLR08',
      'F07',
      'VA',
      false,
    );

    expect(config.name).toBe('Agro Ferme Sanaga');
    expect(config.theme.primaryColor).toBeTruthy();
    expect(config.sections.length).toBeGreaterThanOrEqual(6);

    const parsed = StorefrontConfigSchema.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  it('résilience : payload complètement vide retourne un fallback valide Zod sans exception', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // @ts-expect-error — test volontaire d'input corrompu
    const config = inject({});

    expect(config).toBeDefined();
    expect(config.id).toBe(FALLBACK_STOREFRONT_CONFIG.id);

    const parsed = StorefrontConfigSchema.safeParse(config);
    expect(parsed.success).toBe(true);
    consoleSpy.mockRestore();
  });
});
