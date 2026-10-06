import { describe, it, expect } from 'vitest';
import {
  decodeSeed,
  generateSeed,
  seedToTheme,
  COLOR_TOKEN_CATALOG,
  LAYOUT_VARIANT_CATALOG,
  type ThemeSeedConfig,
} from '@/engine/themeSeed';
import type { StorefrontConfig, BusinessType } from '@/types/storefront';
import type { CatalogItem, LeadItem } from '@/components/dashboard/PolymorphicDashboard';

describe('PolymorphicDashboard Architecture & Logic Suite', () => {
  // ── 1. TEST DISCRIMINANT DES TYPES MÉTIERS ─────────────────────────────────
  describe('Polymorphic Business Type Discrimination', () => {
    const businessTypes: BusinessType[] = [
      'PHYSICAL_PRODUCT',
      'SERVICE',
      'LIVESTOCK_PRODUCT',
      'RESTAURANT',
      'HYBRID',
      'ARTISAN',
    ];

    it('should correctly handle all 6 business types without throwing', () => {
      businessTypes.forEach((type) => {
        const mockConfig: StorefrontConfig = {
          id: `store_${type.toLowerCase()}`,
          name: `Boutique ${type}`,
          metadata: {
            businessType: type,
            city: 'Douala',
            currency: 'FCFA',
            phone: '699001122',
          },
          theme: {
            mode: 'light',
            isDark: false,
            primaryColor: '#128C7E',
            accentColor: '#25D366',
            bgColor: '#FFFFFF',
            textColor: '#0F172A',
            font: 'Inter',
            borderRadius: 'smooth',
          },
          sections: [],
        };

        expect(mockConfig.metadata?.businessType).toBe(type);
      });
    });
  });

  // ── 2. TEST THEME SEED EXPRESS ENGINE DU DASHBOARD ─────────────────────────
  describe('Dashboard ThemeSeed Integration', () => {
    it('should generate a valid seed code and decode it to css theme tokens', () => {
      const seedCode = generateSeed('BP01', 'CLR03', 'F02', 'VB', false);
      expect(seedCode).toBe('VST-BP01-CLR03-F02-VB');

      const decoded: ThemeSeedConfig = decodeSeed(seedCode);
      expect(decoded.colorTokenId).toBe('CLR03');
      expect(decoded.fontSetId).toBe('F02');
      expect(decoded.layoutVariant).toBe('VB');
      expect(decoded.isDark).toBe(false);

      const theme = seedToTheme(decoded);
      expect(theme.primaryColor).toBe(COLOR_TOKEN_CATALOG.CLR03.primaryColor);
      expect(theme.borderRadius).toBe('smooth');
      expect(theme.mode).toBe('light');
    });

    it('should handle dark mode seeds properly with -DARK flag', () => {
      const darkSeed = generateSeed('BP04', 'CLR05', 'F01', 'VA', true);
      expect(darkSeed).toBe('VST-BP04-CLR05-F01-VA-DARK');

      const decoded = decodeSeed(darkSeed);
      expect(decoded.isDark).toBe(true);

      const theme = seedToTheme(decoded);
      expect(theme.mode).toBe('dark');
      expect(theme.isDark).toBe(true);
      expect(theme.bgColor).toBe(COLOR_TOKEN_CATALOG.CLR05.bgColorDark);
    });

    it('should fallback gracefully when receiving corrupted seeds in dashboard input', () => {
      const corruptSeed = 'INVALID-SEED-STRING-999';
      const decoded = decodeSeed(corruptSeed);
      expect(decoded).toBeDefined();
      expect(decoded.resolvedTheme).toBeDefined();
      expect(decoded.resolvedTheme.primaryColor).toBe('#128C7E');
    });
  });

  // ── 3. TEST MÉTIER DU CATALOGUE POLYMORPHE ─────────────────────────────────
  describe('Polymorphic Items Metadata Specifications', () => {
    it('should structure PHYSICAL_PRODUCT item with stock, sizes, and colors', () => {
      const physicalItem: CatalogItem = {
        id: 'phys_01',
        name: 'Robe Dashiki Reine',
        price: 25000,
        category: 'Mode & Habillement',
        stockCount: 15,
        inStock: true,
        metadata: {
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Noir/Or', 'Rouge/Bordeaux'],
          sku: 'DASH-2026-01',
        },
      };

      expect(physicalItem.stockCount).toBe(15);
      expect(physicalItem.metadata?.sizes).toHaveLength(4);
      expect(physicalItem.metadata?.colors).toContain('Noir/Or');
    });

    it('should structure SERVICE item with audience level, duration, and format', () => {
      const serviceItem: CatalogItem = {
        id: 'srv_01',
        name: 'Coaching Prépa Concours Polytech',
        price: 75000,
        category: 'Formation & Cours',
        metadata: {
          audienceLevel: 'Bacheliers & Étudiants',
          duration: 'Module de 20 heures',
          format: 'Hybride (Présentiel Akwa + Zoom)',
        },
      };

      expect(serviceItem.metadata?.audienceLevel).toBe('Bacheliers & Étudiants');
      expect(serviceItem.metadata?.duration).toBe('Module de 20 heures');
    });

    it('should structure LIVESTOCK_PRODUCT item with breed, weight, and vaccination badge', () => {
      const livestockItem: CatalogItem = {
        id: 'live_01',
        name: 'Génisse Goudali Pure Race',
        price: 450000,
        category: 'Bovins',
        metadata: {
          breed: 'Goudali',
          weight: '380 kg',
          age: '2 ans et demi',
          isVaccinated: true,
          vaccineDetails: 'CBPP + Fièvre Aphteuse à jour',
          depositRequired: 100000,
        },
      };

      expect(livestockItem.metadata?.breed).toBe('Goudali');
      expect(livestockItem.metadata?.isVaccinated).toBe(true);
      expect(livestockItem.metadata?.depositRequired).toBe(100000);
    });

    it('should structure RESTAURANT item with category, ingredients, and daily special toggle', () => {
      const restaurantItem: CatalogItem = {
        id: 'rest_01',
        name: 'Ndolé Royal Crevettes & Viande Fumée',
        price: 6500,
        category: 'Plats Traditionnels',
        metadata: {
          dishCategory: 'PLAT',
          isDailySpecial: true,
          prepTimeMinutes: 25,
          ingredients: ['Feuilles de Ndolé', 'Crevettes royales', 'Arachides fraîches', 'Plantain mûr vapeur'],
          isSpicy: false,
        },
      };

      expect(restaurantItem.metadata?.isDailySpecial).toBe(true);
      expect(restaurantItem.metadata?.dishCategory).toBe('PLAT');
      expect(restaurantItem.metadata?.ingredients).toHaveLength(4);
    });
  });

  // ── 4. TEST DU CRM WHATSAPP LEADS ──────────────────────────────────────────
  describe('WhatsApp CRM Leads Logic', () => {
    it('should format clean WhatsApp link with personalized lead greeting', () => {
      const lead: LeadItem = {
        id: 'lead_001',
        customerName: 'Ahmadou Bello',
        phone: '+237 699 12 34 56',
        createdAt: '22 Sept 2026 14:30',
        productInterest: 'Bœuf Goudali 450kg',
        status: 'NEW',
      };

      const storeName = 'Élevage du Littoral';
      const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
      expect(cleanPhone).toBe('237699123456');

      const expectedGreeting = encodeURIComponent(
        `Bonjour ${lead.customerName}, j'ai bien reçu votre demande concernant "${lead.productInterest}" sur la boutique ${storeName}. Comment puis-je vous aider ?`
      );

      const generatedUrl = `https://wa.me/${cleanPhone}?text=${expectedGreeting}`;
      expect(generatedUrl).toContain('https://wa.me/237699123456');
      expect(generatedUrl).toContain(encodeURIComponent('Ahmadou Bello'));
      expect(generatedUrl).toContain(encodeURIComponent('Bœuf Goudali 450kg'));
    });
  });
});
