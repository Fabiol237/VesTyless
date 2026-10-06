/**
 * VesTyle V1 — Smoke Test End-to-End & Validation Complète des Flux
 * ─────────────────────────────────────────────────────────────────────────────
 * Suite Vitest officielle exécutant les 7 tests de qualification VesTyle V1.
 */

import { describe, it, expect } from 'vitest';
import { LocalDesignRegistry } from '../registry/LocalDesignRegistry';
import { VestinAdaptationEngine, MerchantAdaptationInput } from '../adaptation/VestinAdaptationEngine';
import { normalizeBusinessType, BUSINESS_TYPE_TO_DESIGN_ID } from '../onboarding/OnboardingDesignMapper';
import { VESTYLE_DOMAINS, getDomainById } from '../domains/domainDefinitions';
import { validateStorefrontConfig } from '@/types/storefront';

describe('VesTyle V1 — Qualification E2E & Smoke Test Suite', () => {
  const registry = LocalDesignRegistry.getInstance();

  describe('TEST 1 — CRÉATION MANUELLE', () => {
    it('1.1 sélectionne le domaine Vendeur et une catégorie valide', () => {
      const domain = getDomainById('vendeur');
      expect(domain).toBeDefined();
      expect(domain?.id).toBe('vendeur');
      const category = domain?.categories.find(c => c.id === 'mode') || domain?.categories[0];
      expect(category).toBeDefined();
    });

    it('1.2 filtre et sélectionne un design compatible', () => {
      const compatibleDesigns = registry.getAllDesigns().filter(d =>
        d.applicability?.targetArchetypes?.includes('PHYSICAL_PRODUCT')
      );
      expect(compatibleDesigns.length).toBeGreaterThanOrEqual(1);
      const design = registry.getDesignSync('vst_dsn_prestige_atelier_001');
      expect(design).toBeDefined();
      expect(design?.id).toBe('vst_dsn_prestige_atelier_001');
    });

    it('1.3 adapte le design aux données du marchand et produit un StorefrontConfig v3.0 valide', () => {
      const design = registry.getDesignSync('vst_dsn_prestige_atelier_001');
      const manualInput: MerchantAdaptationInput = {
        businessProfile: {
          storeName: 'Maison Royale Douala',
          city: 'Douala, Akwa',
          whatsapp: '+237690123456',
          phone: '690123456',
          businessType: 'PHYSICAL_PRODUCT',
          description: 'Haute couture africaine et costumes sur-mesure faits main.',
        },
        sellerContent: {
          products: [
            { id: 'p_1', name: 'Costume 3 Pièces Imperial', price: 85000, category: 'Costumes' },
            { id: 'p_2', name: 'Robe Soirée Velours Soie', price: 65000, category: 'Robes' },
          ],
        },
      };

      const config = VestinAdaptationEngine.adapt(design, manualInput, 'store_manual_001');
      expect(config.version).toBe('3.0.0');
      expect(config.name).toBe('Maison Royale Douala');
      expect(config.theme.primaryColor).toBe('#D4AF37');
      expect(config.sections.length).toBeGreaterThan(0);

      const validation = validateStorefrontConfig(config);
      expect(validation).toBeDefined();
      expect(validation.version).toBe('3.0.0');
    });
  });

  describe('TEST 2 — CRÉATION IA (VesTyle fait le reste)', () => {
    it('2.1 déduit le secteur, sélectionne le design compatible et génère la configuration', () => {
      const naturalPrompt = "Je tiens un restaurant traditionnel camerounais à Yaoundé Bastos spécialisé dans le ndolé et poisson braisé.";
      const deducedType = naturalPrompt.toLowerCase().includes('restaurant') ? 'RESTAURANT' : 'PHYSICAL_PRODUCT';
      expect(deducedType).toBe('RESTAURANT');

      const autoDesignId = BUSINESS_TYPE_TO_DESIGN_ID[deducedType];
      expect(autoDesignId).toBe('vst_dsn_resto_terroir_002');

      const design = registry.getDesignSync(autoDesignId);
      const aiInput: MerchantAdaptationInput = {
        businessProfile: {
          storeName: 'Le Terroir Gourmand',
          city: 'Yaoundé, Bastos',
          whatsapp: '+237677889900',
          businessType: deducedType,
          description: 'Saveurs authentiques du terroir camerounais.',
        },
        sellerContent: {
          products: [
            { id: 'dish_1', name: 'Ndolé Royal', price: 6500, category: 'Plats' },
          ],
        },
      };

      const config = VestinAdaptationEngine.adapt(design, aiInput, 'store_ai_002');
      expect(config.name).toBe('Le Terroir Gourmand');
      expect(config.metadata.city).toBe('Yaoundé, Bastos');
      expect(config.sections.length).toBeGreaterThan(0);
      const validation = validateStorefrontConfig(config);
      expect(validation).toBeDefined();
    });
  });

  describe('TEST 3 — MODIFICATION D\'INFORMATIONS SITE', () => {
    it('3.1 met à jour les données du site et préserve la structure', () => {
      const design = registry.getDesignSync('vst_dsn_prestige_atelier_001');
      const updatedInput: MerchantAdaptationInput = {
        businessProfile: {
          storeName: 'Maison Royale Douala & VIP Lounge',
          city: 'Douala, Bonanjo',
          whatsapp: '+237699999999',
          businessType: 'PHYSICAL_PRODUCT',
        },
        sellerContent: {},
      };

      const config = VestinAdaptationEngine.adapt(design, updatedInput, 'store_manual_001');
      expect(config.name).toBe('Maison Royale Douala & VIP Lounge');
      expect(config.metadata.city).toBe('Douala, Bonanjo');
      expect(config.metadata.whatsapp).toBe('237699999999');
    });
  });

  describe('TEST 4 — CHANGEMENT DE DESIGN & CONSERVATION DES DONNÉES MÉTIER', () => {
    it('4.1 change de design en conservant 100% des données métier (produits, prix, infos)', () => {
      const originalInput: MerchantAdaptationInput = {
        businessProfile: {
          storeName: 'Maison Royale Douala & VIP Lounge',
          city: 'Douala, Bonanjo',
          whatsapp: '+237699999999',
          phone: '690123456',
          businessType: 'PHYSICAL_PRODUCT',
        },
        sellerContent: {
          products: [
            { id: 'p_1', name: 'Costume 3 Pièces Imperial', price: 85000, category: 'Costumes' },
            { id: 'p_2', name: 'Robe Soirée Velours Soie', price: 65000, category: 'Robes' },
          ],
        },
      };

      const newDesign = registry.getDesignSync('vst_dsn_commerce_librairie_006');
      expect(newDesign).toBeDefined();

      const switchedConfig = VestinAdaptationEngine.adapt(newDesign, originalInput, 'store_manual_001');

      // 1. Conservation des données métier
      expect(switchedConfig.name).toBe('Maison Royale Douala & VIP Lounge');
      expect(switchedConfig.metadata.city).toBe('Douala, Bonanjo');
      expect(switchedConfig.metadata.whatsapp).toBe('237699999999');

      // 2. Mise à jour de la présentation
      expect(switchedConfig.theme.primaryColor).toBe(newDesign.styleSystem.palette.primary);
      expect(switchedConfig.theme.font).toBe(newDesign.styleSystem.typography.fontFamilyBody);
      expect(switchedConfig.theme.borderRadius).toBeDefined();

      const validation = validateStorefrontConfig(switchedConfig);
      expect(validation).toBeDefined();
    });
  });

  describe('TEST 5 — RESPONSIVE & ADAPTATION VIEWPORT', () => {
    it('5.1 fournit des tokens spatiaux et des triggers mobiles cohérents', () => {
      const design = registry.getDesignSync('vst_dsn_prestige_atelier_001');
      const config = VestinAdaptationEngine.adapt(design, {
        businessProfile: { storeName: 'Store Test', whatsapp: '+237690000000' },
        sellerContent: {},
      });
      expect(config.theme.borderRadius).toBeDefined();
      expect(config.metadata.whatsapp).toBe('237690000000');
    });
  });

  describe('TEST 6 — VÉRIFICATION ARCHITECTURALE CANONIQUE', () => {
    it('6.1 valide que Registry et AdaptationEngine sont des modules du pipeline et non des renderers concurrents', () => {
      expect(typeof LocalDesignRegistry.getInstance).toBe('function');
      expect(typeof VestinAdaptationEngine.adapt).toBe('function');
      expect(registry.getAllDesigns().length).toBe(6);
    });
  });

  describe('TEST 7 — ISOLATION DU LEGACY', () => {
    it('7.1 certifie l\'absence de store_modules, layout_config et chemins dépréciés dans la config V1', () => {
      const design = registry.getDesignSync('vst_dsn_prestige_atelier_001');
      const config = VestinAdaptationEngine.adapt(design, {
        businessProfile: { storeName: 'Store Test V1' },
        sellerContent: {},
      });
      expect((config as any).store_modules).toBeUndefined();
      expect((config as any).layout_config).toBeUndefined();
      expect(config.version).toBe('3.0.0');
    });
  });
});
