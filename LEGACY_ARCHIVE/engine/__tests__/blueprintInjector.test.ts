/**
 * VesTyle — Blueprint Injector & ThemeSeed Engine — Suite de Tests Unitaires
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Tests couverts :
 *   1. ThemeSeed — Génération de seedCode (generateSeed)
 *   2. ThemeSeed — Décodage sans perte (decodeSeed round-trip)
 *   3. ThemeSeed — Fallback sur seed malformé
 *   4. BlueprintInjector — Injection réussie payload PHYSICAL_PRODUCT
 *   5. BlueprintInjector — Injection payload hybride (Vêtements + Cours + Élevage)
 *   6. BlueprintInjector — Sections par défaut selon businessType
 *   7. BlueprintInjector — Payload IA corrompu → fallback sécurisé
 *   8. BlueprintInjector — Payload null → fallback sécurisé
 *   9. BlueprintInjector — injectFromSeed helper
 *  10. BlueprintInjector — Validation Zod de la config produite
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  generateSeed,
  decodeSeed,
  seedToTheme,
  FALLBACK_SEED_CONFIG,
  COLOR_TOKEN_CATALOG,
  FONT_SET_CATALOG,
  LAYOUT_VARIANT_CATALOG,
  type ThemeSeedConfig,
} from '../themeSeed';

import {
  inject,
  injectFromSeed,
  FALLBACK_STOREFRONT_CONFIG,
  type InjectionPayload,
  type BusinessMeta,
  type SectionPayload,
} from '../blueprintInjector';

import { StorefrontConfigSchema } from '@/types/storefront';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — ThemeSeed Engine
// ─────────────────────────────────────────────────────────────────────────────

describe('ThemeSeed Engine', () => {

  describe('generateSeed()', () => {
    it('génère un seedCode au format VST-{BP}-{CLR}-{F}-{V}', () => {
      const seed = generateSeed('BP01', 'CLR04', 'F02', 'VA');
      expect(seed).toMatch(/^VST-BP01-CLR04-F02-VA$/);
    });

    it('ajoute le suffixe DARK en mode sombre', () => {
      const seed = generateSeed('BP01', 'CLR01', 'F01', 'VB', true);
      expect(seed).toMatch(/^VST-BP01-CLR01-F01-VB-DARK$/);
    });

    it('normalise blueprintId en majuscules et strip les caractères interdits', () => {
      const seed = generateSeed('bp-01', 'CLR01', 'F01', 'VA');
      // Les tirets et la casse sont nettoyés
      expect(seed).not.toContain('bp-01');
      expect(seed.startsWith('VST-')).toBe(true);
    });

    it('utilise CLR01 et F01 comme fallback si token inconnu', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const seed = generateSeed('BP01', 'CLR99', 'F99', 'VA');
      // Le seed est toujours généré (pas d'exception)
      expect(seed).toBeTruthy();
      expect(typeof seed).toBe('string');
      consoleSpy.mockRestore();
    });
  });

  describe('decodeSeed() — round-trip sans perte', () => {
    it('décode correctement un seed valide — CLR04 Tech Violet', () => {
      const seed = generateSeed('BP01', 'CLR04', 'F02', 'VA');
      const config = decodeSeed(seed);

      expect(config.seedCode).toBe(seed);
      expect(config.blueprintId).toBe('BP01');
      expect(config.colorTokenId).toBe('CLR04');
      expect(config.fontSetId).toBe('F02');
      expect(config.layoutVariant).toBe('VA');
      expect(config.isDark).toBe(false);
    });

    it('décode correctement un seed DARK', () => {
      const seed = generateSeed('BP02', 'CLR02', 'F03', 'VB', true);
      const config = decodeSeed(seed);

      expect(config.isDark).toBe(true);
      expect(config.colorTokenId).toBe('CLR02');
    });

    it('round-trip : encode → décode → ré-encode → identique', () => {
      const original = generateSeed('BP01', 'CLR03', 'F04', 'VC');
      const decoded  = decodeSeed(original);
      const reencoded = generateSeed(
        decoded.blueprintId,
        decoded.colorTokenId,
        decoded.fontSetId,
        decoded.layoutVariant,
        decoded.isDark,
      );
      expect(reencoded).toBe(original);
    });

    it('résout les tokens de couleur corrects (CLR01 = Emerald Luxury)', () => {
      const seed = generateSeed('BP01', 'CLR01', 'F01', 'VA');
      const config = decodeSeed(seed);

      expect(config.resolvedTheme.primaryColor).toBe(COLOR_TOKEN_CATALOG['CLR01'].primaryColor);
      expect(config.resolvedTheme.accentColor).toBe(COLOR_TOKEN_CATALOG['CLR01'].accentColor);
    });

    it('résout la police correctement (F01)', () => {
      const seed = generateSeed('BP01', 'CLR01', 'F01', 'VA');
      const config = decodeSeed(seed);

      expect(config.resolvedTheme.font).toBe(FONT_SET_CATALOG['F01'].font);
    });

    it('résout le borderRadius selon la variante de layout', () => {
      const seed = generateSeed('BP01', 'CLR01', 'F01', 'VC');
      const config = decodeSeed(seed);

      expect(config.resolvedTheme.borderRadius).toBe(LAYOUT_VARIANT_CATALOG['VC'].borderRadius);
    });
  });

  describe('decodeSeed() — fallback sur seed invalide', () => {
    it('retourne FALLBACK_SEED_CONFIG si seedCode est null/undefined', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const config = decodeSeed(null as unknown as string);
      expect(config.seedCode).toBe(FALLBACK_SEED_CONFIG.seedCode);
      consoleSpy.mockRestore();
    });

    it('retourne FALLBACK_SEED_CONFIG si seedCode est une chaine vide', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const config = decodeSeed('');
      expect(config.seedCode).toBe(FALLBACK_SEED_CONFIG.seedCode);
      consoleSpy.mockRestore();
    });

    it('retourne FALLBACK_SEED_CONFIG si le format est non reconnu', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const config = decodeSeed('INVALID-SEED-FORMAT');
      expect(config.blueprintId).toBe(FALLBACK_SEED_CONFIG.blueprintId);
      consoleSpy.mockRestore();
    });

    it('ne lève jamais d\'exception sur un seed corrompu', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(() => decodeSeed('###CORRUPTED###')).not.toThrow();
      expect(() => decodeSeed('VST-')).not.toThrow();
      expect(() => decodeSeed('a'.repeat(500))).not.toThrow();
      consoleSpy.mockRestore();
    });
  });

  describe('seedToTheme()', () => {
    it('convertit un ThemeSeedConfig en Theme valide (mode light)', () => {
      const seed = generateSeed('BP01', 'CLR01', 'F01', 'VA');
      const config = decodeSeed(seed);
      const theme = seedToTheme(config);

      expect(theme.mode).toBe('light');
      expect(theme.isDark).toBe(false);
      expect(theme.primaryColor).toBe(config.resolvedTheme.primaryColor);
      expect(theme.font).toBe(config.resolvedTheme.font);
    });

    it('convertit en Theme mode dark correctement', () => {
      const seed = generateSeed('BP01', 'CLR01', 'F01', 'VA', true);
      const config = decodeSeed(seed);
      const theme = seedToTheme(config);

      expect(theme.mode).toBe('dark');
      expect(theme.isDark).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — Blueprint Injector
// ─────────────────────────────────────────────────────────────────────────────

describe('BlueprintInjector', () => {

  // ── Helper pour créer un payload de test standard ─────────────────────────

  function makePayload(overrides?: Partial<InjectionPayload>): InjectionPayload {
    return {
      businessMeta: {
        storeName: 'Maison Ebene Couture',
        businessType: 'PHYSICAL_PRODUCT',
        city: 'Douala',
        sector: 'fashion',
        phone: '+237690000000',
        whatsapp: '+237690000000',
        slogan: "L'élégance africaine contemporaine",
        description: 'Atelier premium de mode camerounaise.',
      },
      themeSeed: generateSeed('BP01', 'CLR02', 'F03', 'VA'),
      ...overrides,
    };
  }

  // ── Test 4 — Injection PHYSICAL_PRODUCT standard ──────────────────────────

  describe('inject() — Payload valide PHYSICAL_PRODUCT', () => {
    it('retourne un StorefrontConfig avec id et name corrects', () => {
      const config = inject(makePayload());

      expect(config.name).toBe('Maison Ebene Couture');
      expect(config.id).toBeTruthy();
      expect(config.version).toBe('2.0.0');
    });

    it('metadata contient les données métier injectées', () => {
      const config = inject(makePayload());

      expect(config.metadata.city).toBe('Douala');
      expect(config.metadata.sector).toBe('fashion');
      expect(config.metadata.whatsapp).toBe('+237690000000');
      expect(config.metadata.businessType).toBe('PHYSICAL_PRODUCT');
    });

    it('le thème est résolu depuis le seedCode fourni', () => {
      const seedCode = generateSeed('BP01', 'CLR02', 'F03', 'VA');
      const config = inject(makePayload({ themeSeed: seedCode }));
      const expected = seedToTheme(decodeSeed(seedCode));

      expect(config.theme.primaryColor).toBe(expected.primaryColor);
      expect(config.theme.font).toBe(expected.font);
    });

    it('la config est valide selon StorefrontConfigSchema', () => {
      const config = inject(makePayload());
      const validation = StorefrontConfigSchema.safeParse(config);

      expect(validation.success).toBe(true);
    });

    it('sections incluses dans la config', () => {
      const config = inject(makePayload({
        sections: [
          { type: 'HERO', variant: 'hero_001', order: 0, content: { title: 'Ma Boutique' } },
          { type: 'PRODUCT', variant: 'product_grid', order: 1, content: { columns: 2 } },
        ],
      }));

      expect(config.sections).toHaveLength(2);
      expect(config.sections[0].type).toBe('HERO');
      expect(config.sections[1].type).toBe('PRODUCT');
    });
  });

  // ── Test 5 — Payload hybride (Vêtements + Cours + Élevage) ───────────────

  describe('inject() — Payload hybride multi-vertical', () => {
    it('injecte correctement un payload HYBRID avec sections variées', () => {
      const hybridPayload: InjectionPayload = {
        businessMeta: {
          storeName: 'Multi-Services Kamga',
          businessType: 'HYBRID',
          city: 'Douala',
          sector: 'hybrid',
          whatsapp: '+237691234567',
          description: 'Vente de vêtements + cours de soutien + élevage de poulets.',
        },
        themeSeed: generateSeed('BP02', 'CLR04', 'F02', 'VB'),
        sections: [
          // Vêtements
          { type: 'HERO', variant: 'hero_001', order: 0, content: { title: 'Multi-Services Kamga', subtitle: 'Mode, Éducation & Élevage' } },
          { type: 'PRODUCT', variant: 'product_grid', order: 1, content: { title: 'Collection Vêtements', columns: 2 } },
          // Cours de soutien
          { type: 'SERVICES', variant: 'services_grid', order: 2, content: { title: 'Cours de Soutien Scolaire', items: ['Maths', 'Physique', 'Français'] } },
          { type: 'PRICING', variant: 'pricing_cards', order: 3, content: { title: 'Tarifs des Cours' } },
          // Élevage
          { type: 'CATEGORY', variant: 'category_pills', order: 4, content: { title: 'Nos Espèces', categories: ['Poulets', 'Canards', 'Chèvres'] } },
          { type: 'PRODUCT', id: 'sec_livestock', variant: 'product_grid', order: 5, content: { title: 'Notre Cheptel', showPrice: true } },
          // Contact & Footer
          { type: 'CONTACT', variant: 'contact_card', order: 6, content: { showWhatsapp: true } },
          { type: 'FOOTER', variant: 'footer_minimal', order: 7, content: { showCopyright: true } },
        ],
      };

      const config = inject(hybridPayload);

      expect(config.name).toBe('Multi-Services Kamga');
      expect(config.sections).toHaveLength(8);
      expect(config.metadata.businessType).toBe('HYBRID');

      // Vérifie que les 3 verticals sont présents
      const types = config.sections.map(s => s.type);
      expect(types).toContain('PRODUCT');
      expect(types).toContain('SERVICES');
      expect(types).toContain('CATEGORY');

      // Validation Zod
      const validation = StorefrontConfigSchema.safeParse(config);
      expect(validation.success).toBe(true);
    });

    it('préserve le contenu custom (title, items, etc.) des sections', () => {
      const config = inject({
        businessMeta: { storeName: 'Test', businessType: 'HYBRID' },
        sections: [
          { type: 'SERVICES', content: { title: 'Cours Maths', items: ['Lycée', 'Université'] }, order: 0 },
        ],
      });

      const serviceSection = config.sections.find(s => s.type === 'SERVICES');
      expect(serviceSection).toBeDefined();
      expect(serviceSection?.content.title).toBe('Cours Maths');
      expect(serviceSection?.content.items).toEqual(['Lycée', 'Université']);
    });
  });

  // ── Test 6 — Sections par défaut selon businessType ───────────────────────

  describe('inject() — Sections par défaut selon businessType', () => {
    const testCases: Array<{ type: string; expectedSectionTypes: string[] }> = [
      { type: 'PHYSICAL_PRODUCT', expectedSectionTypes: ['HEADER', 'HERO', 'CATEGORY', 'PRODUCT', 'TESTIMONIAL', 'CONTACT', 'FOOTER'] },
      { type: 'SERVICE',          expectedSectionTypes: ['HEADER', 'HERO', 'SERVICES', 'PRICING', 'TESTIMONIAL', 'CONTACT', 'FOOTER'] },
      { type: 'HYBRID',           expectedSectionTypes: ['HEADER', 'HERO', 'SERVICES', 'PRODUCT', 'PRICING', 'TESTIMONIAL', 'CONTACT', 'FOOTER'] },
      { type: 'LIVESTOCK_PRODUCT',expectedSectionTypes: ['HEADER', 'HERO', 'CATEGORY', 'PRODUCT', 'SERVICES', 'CONTACT', 'FOOTER'] },
      { type: 'RESTAURANT',       expectedSectionTypes: ['HEADER', 'HERO', 'CATEGORY', 'PRODUCT', 'GALLERY', 'CONTACT', 'FOOTER'] },
    ];

    testCases.forEach(({ type, expectedSectionTypes }) => {
      it(`génère les bonnes sections par défaut pour ${type}`, () => {
        const config = inject({
          businessMeta: { storeName: `Boutique ${type}`, businessType: type },
          // Pas de sections fournies → sections par défaut
        });

        const types = config.sections.map(s => s.type);
        expectedSectionTypes.forEach(expected => {
          expect(types).toContain(expected);
        });
      });
    });
  });

  // ── Test 7 — Payload IA corrompu → fallback sécurisé ─────────────────────

  describe('inject() — Payload IA corrompu', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('retourne FALLBACK si businessMeta.storeName est manquant', () => {
      const config = inject({
        // @ts-expect-error — test volontaire
        businessMeta: { businessType: 'SERVICE' },
      });

      // Doit toujours retourner un config valide (avec nom par défaut)
      expect(config).toBeDefined();
      expect(typeof config.name).toBe('string');
      expect(config.sections.length).toBeGreaterThan(0);
    });

    it('retourne FALLBACK_STOREFRONT_CONFIG si payload est null', () => {
      const config = inject(null as unknown as InjectionPayload);

      expect(config.id).toBe(FALLBACK_STOREFRONT_CONFIG.id);
      expect(config.name).toBe(FALLBACK_STOREFRONT_CONFIG.name);
    });

    it('retourne FALLBACK_STOREFRONT_CONFIG si businessMeta est absent', () => {
      const config = inject({ themeSeed: 'VST-BP01-CLR01-F01-VA' } as unknown as InjectionPayload);

      expect(config.id).toBe(FALLBACK_STOREFRONT_CONFIG.id);
    });

    it('ne plante jamais avec un payload entièrement corrompu (string aléatoire)', () => {
      expect(() => inject('CORRUPTED_STRING' as unknown as InjectionPayload)).not.toThrow();
    });

    it('ne plante jamais avec sections corrompues', () => {
      const config = inject({
        businessMeta: { storeName: 'Test Corrompu', businessType: 'SERVICE' },
        sections: [
          { type: null as unknown as string },
          { type: 123 as unknown as string },
          null as unknown as SectionPayload,
          undefined as unknown as SectionPayload,
        ],
      });

      // L'injection doit toujours retourner un config valide
      expect(config).toBeDefined();
      expect(config.name).toBeTruthy();
    });

    it('utilise le thème FALLBACK si seedCode est invalide', () => {
      const config = inject({
        businessMeta: { storeName: 'Test', businessType: 'SERVICE' },
        themeSeed: 'SEED-INVALIDE-TOTAL',
      });

      // Le thème fallback doit être appliqué silencieusement
      expect(config.theme).toBeDefined();
      expect(config.theme.primaryColor).toBeTruthy();
    });

    it('la config produite même en cas de corruption partielle est valide Zod', () => {
      const config = inject({
        businessMeta: { storeName: 'Boutique Test Robustesse', businessType: 'RESTAURANT' },
        themeSeed: '###BAD###',
        sections: [
          { type: 'HERO', content: { title: 'Test' }, order: 0 },
        ],
      });

      const validation = StorefrontConfigSchema.safeParse(config);
      expect(validation.success).toBe(true);
    });
  });

  // ── Test 9 — injectFromSeed helper ────────────────────────────────────────

  describe('injectFromSeed()', () => {
    it('génère et injecte correctement depuis des IDs de tokens', () => {
      const config = injectFromSeed(
        { storeName: 'Atelier Bello', businessType: 'ARTISAN', city: 'Douala' },
        'BP01', 'CLR03', 'F05', 'VC',
      );

      expect(config.name).toBe('Atelier Bello');
      expect(config.metadata.city).toBe('Douala');

      // Le thème doit correspondre au token CLR03 (Pink Glow)
      expect(config.theme.primaryColor).toBe(COLOR_TOKEN_CATALOG['CLR03'].primaryColor);
    });

    it('injectFromSeed avec isDark=true → thème sombre', () => {
      const config = injectFromSeed(
        { storeName: 'Dark Mode Store', businessType: 'SERVICE' },
        'BP01', 'CLR04', 'F01', 'VA',
        true, // isDark
      );

      expect(config.theme.isDark).toBe(true);
      expect(config.theme.mode).toBe('dark');
    });

    it('injectFromSeed produit une config valide Zod', () => {
      const config = injectFromSeed(
        { storeName: 'Élevage Mbango', businessType: 'LIVESTOCK_PRODUCT', whatsapp: '+237690123456' },
        'BP02', 'CLR05', 'F02', 'VB',
      );

      const validation = StorefrontConfigSchema.safeParse(config);
      expect(validation.success).toBe(true);
    });
  });

  // ── Test 10 — Validation Zod globale ─────────────────────────────────────

  describe('Validation Zod globale de la config produite', () => {
    it('chaque businessType produit une config valide Zod', () => {
      const types = ['PHYSICAL_PRODUCT', 'SERVICE', 'HYBRID', 'LIVESTOCK_PRODUCT', 'RESTAURANT', 'ARTISAN'];

      types.forEach(bt => {
        const config = inject({
          businessMeta: { storeName: `Store ${bt}`, businessType: bt },
          themeSeed: generateSeed('BP01', 'CLR01', 'F01', 'VA'),
        });

        const validation = StorefrontConfigSchema.safeParse(config);
        expect(validation.success, `Validation échouée pour businessType=${bt}`).toBe(true);
      });
    });

    it('FALLBACK_STOREFRONT_CONFIG est lui-même valide Zod', () => {
      const validation = StorefrontConfigSchema.safeParse(FALLBACK_STOREFRONT_CONFIG);
      expect(validation.success).toBe(true);
    });
  });
});
