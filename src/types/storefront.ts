import { z } from 'zod';

// ── 0. TYPES POLYMORPHES MÉTIER (DISCRIMINANT ENUM) ───────────────────────────

/**
 * FIX DT-05 — Enum strict des types d'activité métier VesTyle.
 * Utilisé comme discriminant pour le BlueprintInjector et la sélection
 * de séquences de sections adaptées à chaque vertical.
 */
export const BusinessTypeSchema = z.enum([
  'PHYSICAL_PRODUCT',  // Commerce de produits physiques (mode, électronique, artisanat…)
  'SERVICE',           // Prestation de services (coiffure, réparation, conseil…)
  'HYBRID',            // Mixte produits + services
  'LIVESTOCK_PRODUCT', // Élevage, vente de bétail et produits agropastoraux
  'RESTAURANT',        // Restauration, traiteur, snack, alimentation
  'ARTISAN',           // Artisanat, fabrication sur mesure, atelier
]);

export type BusinessType = z.infer<typeof BusinessTypeSchema>;

/**
 * Valeur par défaut sécurisée si businessType est absent ou invalide.
 * Compatible avec les anciens formats legacy (string libre).
 */
export const BUSINESS_TYPE_FALLBACK: BusinessType = 'PHYSICAL_PRODUCT';

/**
 * VesTyle Storefront Contract & Data Schema (v2.0)
 * ─────────────────────────────────────────────────────────────────────────────
 * Contrat de données TypeScript & Zod servant de fondation absolue pour :
 * - La Bibliothèque de Blueprints (Serveur & Ingestion IA)
 * - Le Compilateur & Composition Engine
 * - L'Éditeur Studio VesTyle (Panneau IA 1/3 & Canva 2/3)
 * - Le Renderer Universel Storefront
 */

// ── 1. SCHÉMA DU THÈME GLOBAL (CSS TOKENS) ───────────────────────────────────

export const ThemeSchema = z.object({
  mode: z.enum(['light', 'dark']).default('light'),
  isDark: z.boolean().default(false),
  primaryColor: z.string().default('#128C7E'),
  accentColor: z.string().default('#25D366'),
  bgColor: z.string().default('#FFFFFF'),
  textColor: z.string().default('#0F172A'),
  textMutedColor: z.string().optional().default('#64748B'),
  borderColor: z.string().optional().default('rgba(15, 23, 42, 0.08)'),
  font: z.string().default('Inter'),
  headingFont: z.string().optional().default('Inter'),
  borderRadius: z.union([
    z.enum(['sharp', 'smooth', 'full', 'pill']),
    z.string(),
  ]).default('smooth'),
  buttonRadius: z.union([z.string(), z.number()]).optional(),
  customCss: z.string().optional().default(''),
});

export type Theme = z.infer<typeof ThemeSchema>;

// ── 2. SCHÉMA DES STYLES LOCAUX DE SECTION ───────────────────────────────────

export const SectionStylesSchema = z.object({
  paddingTop: z.union([z.string(), z.number()]).optional(),
  paddingBottom: z.union([z.string(), z.number()]).optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  customClasses: z.string().optional(),
  customCss: z.string().optional(),
  fullWidth: z.boolean().optional(),
}).passthrough();

export type SectionStyles = z.infer<typeof SectionStylesSchema>;

// ── 3. SCHÉMA D'UNE SECTION DE VITRINE ────────────────────────────────────────

export const SectionSchema = z.object({
  id: z.string().min(1, 'Section id is required'),
  type: z.string().min(1, 'Section type is required'),
  variant: z.string().default('default'),
  visible: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
  styles: SectionStylesSchema.optional().default({}),
  content: z.record(z.string(), z.unknown()).default({}),
});

export type Section = z.infer<typeof SectionSchema>;

// ── 4. SCHÉMA DES MÉTADONNÉES DE LA BOUTIQUE ─────────────────────────────────

export const StorefrontMetadataSchema = z.object({
  city: z.string().optional().default('Douala'),
  sector: z.string().optional().default('general'),
  phone: z.string().optional().default(''),
  whatsapp: z.string().optional().default(''),
  email: z.string().optional().default(''),
  address: z.string().optional().default(''),
  currency: z.string().optional().default('FCFA'),
  currencySymbol: z.string().optional().default('FCFA'),
  slogan: z.string().optional().default(''),
  logoUrl: z.string().optional().default(''),
  coverUrl: z.string().optional().default(''),
  description: z.string().optional().default(''),
  businessType: BusinessTypeSchema.or(z.string()).optional().default('PHYSICAL_PRODUCT'),
  socialLinks: z.record(z.string(), z.string()).optional().default({}),
}).passthrough();

export type StorefrontMetadata = z.infer<typeof StorefrontMetadataSchema> & Record<string, unknown>;

// ── 5. SCHÉMA D'UNE PAGE MULTI-PAGES ──────────────────────────────────────────

export const StorefrontPageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().default(''),
  isHome: z.boolean().optional().default(false),
  sections: z.array(SectionSchema).default([]),
});

export type StorefrontPage = z.infer<typeof StorefrontPageSchema>;

// ── 6. SCHÉMA CENTRAL DU STOREFRONT CONFIG ───────────────────────────────────

export const StorefrontConfigSchema = z.object({
  id: z.string().min(1, 'Store ID is required'),
  name: z.string().min(1, 'Store Name is required'),
  metadata: StorefrontMetadataSchema.default({}),
  theme: ThemeSchema.default({}),
  sections: z.array(SectionSchema).default([]),
  pages: z.array(StorefrontPageSchema).optional().default([]),
  version: z.string().default('2.0.0'),
  updatedAt: z.string().optional(),
});

export type StorefrontConfig = z.infer<typeof StorefrontConfigSchema>;

// ── 7. SCHÉMA D'UN BLUEPRINT SERVEUR (MODÈLE NEUTRE VESTYLE) ──────────────────

export const ContentSlotBlueprintSchema = z.object({
  slot_key: z.string().min(1),
  type: z.enum(['text', 'image', 'url', 'number', 'list', 'boolean']).default('text'),
  label: z.string().min(1),
  placeholder: z.string().min(1), // Ex: {{HERO_TITLE}}
  default_value: z.unknown().optional(),
});

export type ContentSlotBlueprint = z.infer<typeof ContentSlotBlueprintSchema>;

export const BlueprintSectionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  variant: z.string().default('default'),
  order: z.number().int().nonnegative().default(0),
  styles: SectionStylesSchema.optional().default({}),
  content_slots: z.record(z.string(), z.unknown()).default({}), // Map avec valeurs ou {{SLOT_NAME}}
});

export type BlueprintSection = z.infer<typeof BlueprintSectionSchema>;

export const BlueprintSchema = z.object({
  blueprint_id: z.string().min(1, 'Blueprint ID is required'),
  name: z.string().min(1, 'Blueprint Name is required'),
  category: z.string().min(1, 'Category is required'),
  tags_functional: z.array(z.string()).default([]), // Mots-clés sémantiques pour matching IA / Jina AI
  theme_preset: ThemeSchema.default({}),
  sections: z.array(BlueprintSectionSchema).default([]),
  preview_image_url: z.string().optional(),
  created_at: z.string().optional(),
});

export type Blueprint = z.infer<typeof BlueprintSchema>;

// ── 8. FONCTION UTILITAIRE DE NETTOYAGE & VALIDATION STRICTE ──────────────────

/**
 * Nettoie, normalise et valide toute configuration entrante en StorefrontConfig strict.
 * Accepte les formats legacy ou partiels et garantit une sortie conforme à 100%.
 */
export function validateStorefrontConfig(data: unknown): StorefrontConfig {
  if (!data || typeof data !== 'object') {
    throw new Error('[validateStorefrontConfig] Les données d’entrée doivent être un objet valide.');
  }

  const raw = data as Record<string, unknown>;

  // 1. Normalisation de l'identité et métadonnées
  const id = String(raw.id || raw.storeId || raw.store_id || `store_${Date.now()}`);
  const name = String(raw.name || raw.storeName || raw.businessName || 'Boutique VesTyle').trim();

  const rawMeta = (raw.metadata || raw.identity || {}) as Record<string, unknown>;
  const metadata: StorefrontMetadata = {
    city: String(rawMeta.city || raw.city || 'Douala').trim(),
    sector: String(rawMeta.sector || raw.sectorHint || raw.industry || 'general').trim().toLowerCase(),
    phone: String(rawMeta.phone || raw.phone || '').trim(),
    whatsapp: String(rawMeta.whatsapp || raw.whatsapp || raw.phone || '').trim(),
    email: String(rawMeta.email || raw.email || '').trim(),
    address: String(rawMeta.address || raw.address || '').trim(),
    currency: String(rawMeta.currency || raw.currency || 'FCFA').trim(),
    currencySymbol: String(rawMeta.currencySymbol || raw.currency || 'FCFA').trim(),
    slogan: String(rawMeta.slogan || raw.slogan || '').trim(),
    logoUrl: String(rawMeta.logoUrl || raw.logo_url || raw.logo || '').trim(),
    coverUrl: String(rawMeta.coverUrl || raw.banner_url || raw.coverImage || '').trim(),
    description: String(rawMeta.description || raw.description || '').trim(),
    businessType: String(rawMeta.businessType || raw.business_type || 'product').trim(),
    socialLinks: (rawMeta.socialLinks || raw.social_links || {}) as Record<string, string>,
  };

  // 2. Normalisation du Thème
  const rawTheme = (raw.theme || {}) as Record<string, unknown>;
  const isDark = rawTheme.isDark !== undefined
    ? Boolean(rawTheme.isDark)
    : rawTheme.mode === 'dark';

  const theme: Theme = {
    mode: isDark ? 'dark' : 'light',
    isDark,
    primaryColor: String(rawTheme.primaryColor || rawTheme.primary || '#128C7E'),
    accentColor: String(rawTheme.accentColor || rawTheme.accent || '#25D366'),
    bgColor: String(rawTheme.bgColor || (isDark ? '#0B0F19' : '#FFFFFF')),
    textColor: String(rawTheme.textColor || (isDark ? '#F8FAFC' : '#0F172A')),
    textMutedColor: String(rawTheme.textMutedColor || (isDark ? '#94A3B8' : '#64748B')),
    borderColor: String(rawTheme.borderColor || (isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(15, 23, 42, 0.08)')),
    font: String(rawTheme.font || rawTheme.fontFamily || 'Inter'),
    headingFont: String(rawTheme.headingFont || rawTheme.font || 'Inter'),
    borderRadius: (rawTheme.borderRadius as string | 'sharp' | 'smooth' | 'full' | 'pill') || 'smooth',
    buttonRadius: rawTheme.buttonRadius !== undefined ? (rawTheme.buttonRadius as string | number) : undefined,
    customCss: String(rawTheme.customCss || ''),
  };

  // 3. Normalisation des Sections
  const rawSections = Array.isArray(raw.sections) ? raw.sections : [];
  const sections: Section[] = rawSections.map((s, idx) => {
    const secObj = (s && typeof s === 'object') ? (s as Record<string, unknown>) : {};
    const secType = String(secObj.type || secObj.family || 'HERO').toUpperCase();
    const secId = String(secObj.id || `sec_${secType.toLowerCase()}_${idx + 1}`);
    const visible = secObj.visible !== undefined
      ? Boolean(secObj.visible)
      : (secObj.enabled !== false && secObj.isActive !== false);

    return {
      id: secId,
      type: secType,
      variant: String(secObj.variant || secObj.componentId || 'default'),
      visible,
      order: typeof secObj.order === 'number' ? secObj.order : idx,
      styles: (secObj.styles || {}) as SectionStyles,
      content: (secObj.content || secObj.config || {}) as Record<string, unknown>,
    };
  });

  // 4. Normalisation des Pages (Optionnelle)
  let pages: StorefrontPage[] = [];
  if (Array.isArray(raw.pages) && raw.pages.length > 0) {
    pages = raw.pages.map((p, pIdx) => {
      const pObj = (p && typeof p === 'object') ? (p as Record<string, unknown>) : {};
      const pId = String(pObj.id || `page_${pIdx}`);
      const pName = String(pObj.name || `Page ${pIdx + 1}`);
      const pSlug = String(pObj.slug !== undefined ? pObj.slug : (pIdx === 0 ? '' : pName.toLowerCase().replace(/\s+/g, '-')));
      const isHome = Boolean(pObj.isHome || pIdx === 0 || pSlug === '');

      const pRawSecs = Array.isArray(pObj.sections) ? pObj.sections : [];
      const pSections: Section[] = pRawSecs.map((s, idx) => {
        const secObj = (s && typeof s === 'object') ? (s as Record<string, unknown>) : {};
        const secType = String(secObj.type || secObj.family || 'HERO').toUpperCase();
        return {
          id: String(secObj.id || `${pId}_sec_${secType.toLowerCase()}_${idx + 1}`),
          type: secType,
          variant: String(secObj.variant || 'default'),
          visible: secObj.visible !== false && secObj.enabled !== false,
          order: typeof secObj.order === 'number' ? secObj.order : idx,
          styles: (secObj.styles || {}) as SectionStyles,
          content: (secObj.content || secObj.config || {}) as Record<string, unknown>,
        };
      });

      return {
        id: pId,
        name: pName,
        slug: pSlug,
        isHome,
        sections: pSections,
      };
    });
  }

  // 5. Validation finale stricte Zod
  const rawCleaned = {
    id,
    name,
    metadata,
    theme,
    sections,
    pages,
    version: String(raw.version || '2.0.0'),
    updatedAt: new Date().toISOString(),
  };

  return StorefrontConfigSchema.parse(rawCleaned);
}

// ── 9. EXEMPLE MOCK VALIDE CONFORME AU SCHÉMA ─────────────────────────────────

export const mockStorefrontConfig: StorefrontConfig = {
  id: 'store_douala_mode_01',
  name: 'Maison Ébène Couture',
  version: '2.0.0',
  metadata: {
    city: 'Douala',
    sector: 'fashion',
    phone: '+237690000000',
    whatsapp: '+237690000000',
    email: 'contact@maisonebene.cm',
    address: 'Akwa, Boulevard de la Liberté',
    currency: 'FCFA',
    currencySymbol: 'FCFA',
    slogan: 'L’élégance africaine contemporaine sur mesure',
    description: 'Atelier de haute confection prêt-à-porter et tenues traditionnelles premium.',
    businessType: 'product',
  },
  theme: {
    mode: 'dark',
    isDark: true,
    primaryColor: '#D4AF37', // Or Champagne
    accentColor: '#F3E5AB',
    bgColor: '#0A0A0A',
    textColor: '#FAF7F2',
    textMutedColor: '#A89F91',
    borderColor: 'rgba(212, 175, 55, 0.15)',
    font: 'Playfair Display',
    headingFont: 'Playfair Display',
    borderRadius: 'smooth',
    customCss: '',
  },
  sections: [
    {
      id: 'sec_header_01',
      type: 'HEADER',
      variant: 'header_001',
      visible: true,
      order: 0,
      styles: {},
      content: {
        isSticky: true,
        showCity: true,
      },
    },
    {
      id: 'sec_hero_01',
      type: 'HERO',
      variant: 'hero_001',
      visible: true,
      order: 1,
      styles: {},
      content: {
        title: 'Collection Royale 2026',
        subtitle: 'Des coupes d’exception confectionnées à la main dans notre atelier de Douala.',
        ctaText: 'Commander sur WhatsApp',
        badgeText: '✨ Nouvelle Collection',
      },
    },
    {
      id: 'sec_categories_01',
      type: 'CATEGORY',
      variant: 'category_pills',
      visible: true,
      order: 2,
      styles: {},
      content: {
        title: 'Nos Univers',
      },
    },
    {
      id: 'sec_products_01',
      type: 'PRODUCT',
      variant: 'product_grid',
      visible: true,
      order: 3,
      styles: {},
      content: {
        title: 'Créations Phares',
        columns: 2,
        showPrice: true,
      },
    },
    {
      id: 'sec_contact_01',
      type: 'CONTACT',
      variant: 'contact_card',
      visible: true,
      order: 4,
      styles: {},
      content: {
        title: 'Visiter notre Atelier',
        showAddress: true,
        showWhatsapp: true,
      },
    },
    {
      id: 'sec_footer_01',
      type: 'FOOTER',
      variant: 'footer_minimal',
      visible: true,
      order: 5,
      styles: {},
      content: {
        showCopyright: true,
      },
    },
  ],
  pages: [
    {
      id: 'page_home',
      name: 'Accueil',
      slug: '',
      isHome: true,
      sections: [
        {
          id: 'page_home_sec_hero_01',
          type: 'HERO',
          variant: 'hero_001',
          visible: true,
          order: 0,
          styles: {},
          content: {
            title: 'Collection Royale 2026',
            subtitle: 'Des coupes d’exception confectionnées à la main à Douala.',
            ctaText: 'Commander sur WhatsApp',
          },
        },
      ],
    },
    {
      id: 'page_catalogue',
      name: 'Catalogue',
      slug: 'catalogue',
      isHome: false,
      sections: [
        {
          id: 'page_cat_sec_products_01',
          type: 'PRODUCT',
          variant: 'product_grid',
          visible: true,
          order: 0,
          styles: {},
          content: {
            title: 'Catalogue Complet',
          },
        },
      ],
    },
  ],
};
