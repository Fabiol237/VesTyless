/**
 * VesTyle — Onboarding Schema & Contract Unit Tests
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Tests couverts :
 *   1. SanitizePhoneNumber & WhatsAppNumberSchema — Formatage et validation +237
 *   2. InitialItemSchema — Validation des offres initiales (produits, services, élevage)
 *   3. OnboardingPayloadSchema — Validation complète du payload du formulaire
 *   4. Intégration Onboarding ➔ BlueprintInjector — Génération de configuration valide Zod
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizePhoneNumber,
  WhatsAppNumberSchema,
  InitialItemSchema,
  OnboardingPayloadSchema,
  type OnboardingPayload,
  type InitialItem,
} from '@/types/onboarding';

import { inject } from '@/engine/blueprintInjector';
import { StorefrontConfigSchema } from '@/types/storefront';

describe('Onboarding Contract & Schemas', () => {

  // ── 1. Numéro WhatsApp & Formatage Téléphonique ──────────────────────────────

  describe('sanitizePhoneNumber & WhatsAppNumberSchema', () => {
    it('formate un numéro local 9 chiffres (6XXXXXXXX) en international (+2376XXXXXXXX)', () => {
      expect(sanitizePhoneNumber('690123456')).toBe('+237690123456');
      expect(sanitizePhoneNumber('233421122')).toBe('+237233421122');
    });

    it('formate un numéro commençant par 237 sans le +', () => {
      expect(sanitizePhoneNumber('237690123456')).toBe('+237690123456');
    });

    it('formate un numéro commençant par 00237', () => {
      expect(sanitizePhoneNumber('00237690123456')).toBe('+237690123456');
    });

    it('nettoie les espaces, tirets et parenthèses', () => {
      expect(sanitizePhoneNumber('+237 6 90 12 34 56')).toBe('+237690123456');
      expect(sanitizePhoneNumber('(237) 670-11-22-33')).toBe('+237670112233');
    });

    it('WhatsAppNumberSchema valide avec succès un numéro camerounais valide', () => {
      const parsed = WhatsAppNumberSchema.safeParse('690123456');
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data).toBe('+237690123456');
      }
    });

    it('WhatsAppNumberSchema rejette un numéro trop court', () => {
      const parsed = WhatsAppNumberSchema.safeParse('1234');
      expect(parsed.success).toBe(false);
    });
  });

  // ── 2. InitialItemSchema ──────────────────────────────────────────────────

  describe('InitialItemSchema', () => {
    it('valide un produit physique standard', () => {
      const item: InitialItem = {
        name: 'Robe de soirée Satin',
        price: 25000,
        category: 'Mode Femme',
        description: 'Coupe sirène tissu noble.',
      };

      const parsed = InitialItemSchema.safeParse(item);
      expect(parsed.success).toBe(true);
    });

    it('valide un sujet d\'élevage avec métadonnées spécifiques (vaccin, poids)', () => {
      const item = {
        name: 'Lot de 20 Poulets Goliath',
        price: 70000,
        category: 'Volailles',
        metadata: {
          weight: '2.8 kg',
          age: '45 jours',
          vaccine: 'Gumboro + Newcastle à jour',
        },
      };

      const parsed = InitialItemSchema.safeParse(item);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.metadata?.weight).toBe('2.8 kg');
      }
    });

    it('valide une prestation de service avec niveau et durée', () => {
      const item = {
        name: 'Coaching Mathématiques Bac C',
        price: 35000,
        category: 'Éducation',
        metadata: {
          duration: '1 Mois (8 séances)',
          level: 'Terminale C/D',
        },
      };

      const parsed = InitialItemSchema.safeParse(item);
      expect(parsed.success).toBe(true);
    });

    it('rejette un prix négatif', () => {
      const item = {
        name: 'Article Invalide',
        price: -500,
      };

      const parsed = InitialItemSchema.safeParse(item);
      expect(parsed.success).toBe(false);
    });
  });

  // ── 3. OnboardingPayloadSchema ────────────────────────────────────────────

  describe('OnboardingPayloadSchema', () => {
    it('valide un formulaire d\'onboarding complet pour boutique physique', () => {
      const payload: OnboardingPayload = {
        storeName: 'Maison Ebene Douala',
        businessType: 'PHYSICAL_PRODUCT',
        whatsapp: '+237690001122',
        city: 'Douala',
        quarter: 'Akwa',
        activityText: 'Boutique de prêt-à-porter moderne et accessoires.',
        slogan: 'L\'élégance au quotidien',
        selectedBlueprintId: 'BP01',
        themeSeedCode: 'VST-BP01-CLR01-F01-VB',
        paymentMethods: ['MTN MoMo', 'Orange Money'],
        initialItems: [
          { name: 'Robe Blanche', price: 15000, category: 'Robes' },
          { name: 'Chaussure Escarpin', price: 20000, category: 'Chaussures' },
        ],
      };

      const parsed = OnboardingPayloadSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    });

    it('applique la ville Douala et les moyens de paiement par défaut si omis', () => {
      const payload = {
        storeName: 'Snack Le Délice',
        businessType: 'RESTAURANT',
        whatsapp: '+237655112233',
      };

      const parsed = OnboardingPayloadSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.city).toBe('Douala');
        expect(parsed.data.paymentMethods).toContain('MTN MoMo');
        expect(parsed.data.initialItems).toEqual([]);
      }
    });

    it('rejette un nom de boutique trop court (< 2 caractères)', () => {
      const payload = {
        storeName: 'A',
        businessType: 'SERVICE',
        whatsapp: '+237690001122',
      };

      const parsed = OnboardingPayloadSchema.safeParse(payload);
      expect(parsed.success).toBe(false);
    });
  });

  // ── 4. Intégration Onboarding ➔ BlueprintInjector ──────────────────────────

  describe('Intégration Onboarding ➔ BlueprintInjector', () => {
    it('un payload d\'onboarding validé génère une configuration Storefront 100% conforme Zod', () => {
      const onboardingData: OnboardingPayload = {
        storeName: 'Ferme Agro Élite',
        businessType: 'LIVESTOCK_PRODUCT',
        whatsapp: '+237677889900',
        city: 'Yaoundé',
        quarter: 'Bastos',
        activityText: 'Élevage avicole moderne et approvisionnement des restaurants.',
        paymentMethods: ['MTN MoMo', 'Orange Money', 'Paiement à la livraison'],
        initialItems: [
          {
            name: 'Poulet de chair 2.5kg',
            price: 3500,
            category: 'Poulets',
            description: 'Prêt pour consommation ou abattage.',
          },
        ],
      };

      const storefrontConfig = inject({
        businessMeta: {
          storeName: onboardingData.storeName,
          businessType: onboardingData.businessType,
          city: onboardingData.city,
          whatsapp: onboardingData.whatsapp,
          phone: onboardingData.whatsapp,
          address: `${onboardingData.quarter}, ${onboardingData.city}`,
          description: onboardingData.activityText,
        },
      });

      expect(storefrontConfig.name).toBe('Ferme Agro Élite');
      expect(storefrontConfig.metadata.businessType).toBe('LIVESTOCK_PRODUCT');
      expect(storefrontConfig.metadata.city).toBe('Yaoundé');

      // Validation Zod absolue
      const validation = StorefrontConfigSchema.safeParse(storefrontConfig);
      expect(validation.success).toBe(true);
    });
  });
});
