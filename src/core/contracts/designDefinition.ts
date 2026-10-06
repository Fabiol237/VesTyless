/**
 * VesTyle / Vestin — Unified Design Definition Contract & Schema (v3.0)
 * ─────────────────────────────────────────────────────────────────────────────
 * Contrat canonique de référence pour l'architecture unifiée de Vestin.
 * Définit la structure universelle d'un design (matière première graphique),
 * de son arbre visuel (VisualNodeTree), de son système de style et de ses
 * règles de binding & d'adaptation déterministes.
 */

import { z } from 'zod';
import {
  BusinessTypeSchema,
  ThemeSchema,
  SectionSchema,
  StorefrontConfigSchema,
  type BusinessType,
  type Theme,
  type Section,
  type StorefrontConfig,
} from '@/types/storefront';

// ── 1. STYLE SYSTEM SCHEMA ───────────────────────────────────────────────────

export const StylePaletteSchema = z.object({
  isDark: z.boolean().default(false),
  primary: z.string().min(4),
  primaryForeground: z.string().default('#FFFFFF'),
  accent: z.string().min(4),
  accentForeground: z.string().default('#FFFFFF'),
  background: z.string().min(4),
  surface: z.string().min(4),
  surfaceBorder: z.string().default('rgba(255,255,255,0.1)'),
  textPrimary: z.string().min(4),
  textMuted: z.string().default('#94A3B8'),
});

export type StylePalette = z.infer<typeof StylePaletteSchema>;

export const StyleTypographySchema = z.object({
  fontFamilyHeading: z.string().default('Inter, sans-serif'),
  fontFamilyBody: z.string().default('Inter, sans-serif'),
  baseSize: z.enum(['COMPACT', 'STANDARD', 'AIRY']).default('STANDARD'),
  headingWeight: z.enum(['LIGHT', 'MEDIUM', 'BOLD', 'BLACK']).default('BOLD'),
});

export type StyleTypography = z.infer<typeof StyleTypographySchema>;

export const StyleSpatialSchema = z.object({
  borderRadius: z.enum(['NONE', 'SUBTLE_SM', 'MODERN_MD', 'PILL_FULL']).default('MODERN_MD'),
  spacingDensity: z.enum(['TIGHT', 'COMFORTABLE', 'LUXURIOUS']).default('COMFORTABLE'),
  cardElevation: z.enum(['FLAT_BORDER', 'SOFT_SHADOW', 'GLASS_NEUMORPHISM']).default('SOFT_SHADOW'),
});

export type StyleSpatial = z.infer<typeof StyleSpatialSchema>;

export const StyleDefinitionSchema = z.object({
  palette: StylePaletteSchema,
  typography: StyleTypographySchema,
  spatial: StyleSpatialSchema,
});

export type StyleDefinition = z.infer<typeof StyleDefinitionSchema>;

// ── 2. NATIVE ASSET SCHEMA ───────────────────────────────────────────────────

export const AssetDefinitionSchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  role: z.enum(['BRAND_LOGO', 'HERO_COVER', 'PRODUCT_IMAGE', 'DECORATIVE_BACKGROUND', 'SYSTEM_ICON']),
  ownership: z.enum(['SELLER_SUPPLIED', 'DESIGN_NATIVE', 'DYNAMIC_FALLBACK']),
  isRequired: z.boolean().default(false),
  defaultUrl: z.string(),
  technicalSpecs: z.object({
    recommendedWidth: z.number().int().positive().optional(),
    recommendedHeight: z.number().int().positive().optional(),
    aspectRatio: z.enum(['1:1', '16:9', '4:3', '3:4', '21:9']).default('16:9'),
    maxWeightKb: z.number().int().positive().default(2048),
    allowCrop: z.boolean().default(true),
  }).optional(),
});

export type AssetDefinition = z.infer<typeof AssetDefinitionSchema>;

// ── 3. VISUAL NODE TREE SCHEMA ───────────────────────────────────────────────

export const SemanticRoleSchema = z.enum([
  'CONTAINER',
  'BRAND_LOGO',
  'HERO_TITLE',
  'HERO_SUBTITLE',
  'HERO_BADGE',
  'PRIMARY_CTA',
  'SECONDARY_CTA',
  'MEDIA_HERO_COVER',
  'PRODUCT_REPEATER',
  'PRODUCT_CARD',
  'CATEGORY_FILTER',
  'TRUST_BADGES_GROUP',
  'ABOUT_PARAGRAPH',
  'CONTACT_BLOCK',
  'DECORATIVE_ELEMENT',
]);

export type SemanticRole = z.infer<typeof SemanticRoleSchema>;

export const FreedomLevelSchema = z.enum(['LOCKED', 'CONTROLLED', 'ADAPTIVE']);
export type FreedomLevel = z.infer<typeof FreedomLevelSchema>;

export type VisualNode = {
  id: string;
  parentId: string | null;
  semanticRole: SemanticRole;
  nodeType: 'ELEMENT' | 'TEXT' | 'IMAGE' | 'BUTTON' | 'COLLECTION_REPEATER' | 'SVG';
  editableState: {
    isEditable: boolean;
    bindingKey?: string;
    allowedFieldTypes?: Array<'TEXT_SHORT' | 'TEXT_RICH' | 'IMAGE' | 'ACTION_URL' | 'COLOR'>;
    freedomLevel: FreedomLevel;
  };
  layoutAndStyle?: {
    cssClasses?: string;
    inlineStyleTokens?: Record<string, string>;
    aspectRatio?: '1:1' | '16:9' | '4:3' | '3:4' | '21:9';
    responsiveBehavior?: {
      hideOn?: Array<'mobile' | 'tablet' | 'desktop'>;
      mobileStackOrder?: number;
      gridSpan?: { mobile: number; tablet: number; desktop: number };
    };
  };
  children?: VisualNode[];
};

export const VisualNodeSchema: z.ZodType<VisualNode> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    parentId: z.string().nullable().default(null),
    semanticRole: SemanticRoleSchema,
    nodeType: z.enum(['ELEMENT', 'TEXT', 'IMAGE', 'BUTTON', 'COLLECTION_REPEATER', 'SVG']),
    editableState: z.object({
      isEditable: z.boolean().default(false),
      bindingKey: z.string().optional(),
      allowedFieldTypes: z.array(z.enum(['TEXT_SHORT', 'TEXT_RICH', 'IMAGE', 'ACTION_URL', 'COLOR'])).optional(),
      freedomLevel: FreedomLevelSchema.default('CONTROLLED'),
    }),
    layoutAndStyle: z.object({
      cssClasses: z.string().optional(),
      inlineStyleTokens: z.record(z.string(), z.string()).optional(),
      aspectRatio: z.enum(['1:1', '16:9', '4:3', '3:4', '21:9']).optional(),
      responsiveBehavior: z.object({
        hideOn: z.array(z.enum(['mobile', 'tablet', 'desktop'])).optional(),
        mobileStackOrder: z.number().int().optional(),
        gridSpan: z.object({
          mobile: z.number().int(),
          tablet: z.number().int(),
          desktop: z.number().int(),
        }).optional(),
      }).optional(),
    }).optional(),
    children: z.array(VisualNodeSchema).optional().default([]),
  })
);

// ── 4. CONTENT BINDING 2.0 SCHEMA ────────────────────────────────────────────

export const ContentBindingRule2Schema = z.object({
  bindingId: z.string().min(1),
  semanticRole: SemanticRoleSchema,
  targetNodeId: z.string().min(1),
  source: z.object({
    entity: z.enum(['BUSINESS_PROFILE', 'SELLER_CONTENT', 'AI_MISTRAL_GENERATED']),
    fieldPath: z.string().min(1),
  }),
  contentType: z.enum(['STRING', 'HTML', 'TEXT_RICH', 'IMAGE_URL', 'ARRAY_ITEMS', 'PHONE_WHATSAPP', 'MONEY_AMOUNT']),
  isRequired: z.boolean().default(false),
  cardinality: z.object({
    minItems: z.number().int().nonnegative().default(1),
    maxItems: z.number().int().positive().default(6),
    overflowStrategy: z.enum(['PAGINATE', 'TRUNCATE_WITH_VIEW_ALL_BUTTON', 'HORIZONTAL_SCROLL']).default('TRUNCATE_WITH_VIEW_ALL_BUTTON'),
  }).optional(),
  textLimits: z.object({
    maxCharacters: z.number().int().positive(),
    overflowBehavior: z.enum(['ELLIPSIS', 'SHRINK_FONT_SIZE', 'REGENERATE_SHORTER_AI']).default('ELLIPSIS'),
  }).optional(),
  transformationPipe: z.array(
    z.enum(['FORMAT_FCFA_CURRENCY', 'BUILD_WHATSAPP_ORDER_LINK', 'UPPERCASE_FIRST', 'NORMALIZE_CAMEROON_PHONE'])
  ).optional(),
  fallback: z.object({
    action: z.enum(['USE_DESIGNER_PLACEHOLDER', 'HIDE_NODE_COMPLETELY', 'TRIGGER_AI_FALLBACK']).default('USE_DESIGNER_PLACEHOLDER'),
    placeholderValue: z.unknown().optional(),
  }),
});

export type ContentBindingRule2 = z.infer<typeof ContentBindingRule2Schema>;

// ── 5. SECTION & PAGE DEFINITIONS ───────────────────────────────────────────

export const SectionDefinitionSchema = z.object({
  id: z.string().min(1),
  semanticRole: z.enum([
    'HEADER',
    'HERO',
    'CATEGORY_SHOWCASE',
    'PRODUCT_GRID',
    'SERVICE_LIST',
    'FEATURED_OFFER',
    'ABOUT_STORY',
    'VALUE_PROPOSITIONS',
    'TRUST_BADGES_GROUP',
    'TESTIMONIALS',
    'GALLERY_FEED',
    'LOCATION_HOURS',
    'CONTACT_BLOCK',
    'FAQ',
    'CTA_BANNER',
    'FOOTER',
    'CUSTOM_DYNAMIC',
  ]),
  variant: z.string().default('default'),
  order: z.number().int().nonnegative().default(0),
  behavior: z.object({
    isCollapsible: z.boolean().default(false),
    isDeletable: z.boolean().default(true),
    isMovable: z.boolean().default(true),
    supportsDuplicate: z.boolean().default(false),
  }).default({}),
  layout: z.object({
    containerWidth: z.enum(['FULL_BLEED', 'STANDARD_CONTAINED', 'NARROW_READING']).default('STANDARD_CONTAINED'),
    verticalPadding: z.enum(['NONE', 'COMPACT', 'GENEROUS', 'EXPANSIVE']).default('GENEROUS'),
    backgroundMode: z.enum(['SOLID', 'SURFACE_ALT', 'IMAGE_OVERLAY', 'GRADIENT_ACCENT']).default('SOLID'),
  }).default({}),
  visualTree: VisualNodeSchema.optional(),
  bindings: z.array(ContentBindingRule2Schema).optional().default([]),
  defaultContent: z.record(z.string(), z.unknown()).default({}),
});

export type SectionDefinition = z.infer<typeof SectionDefinitionSchema>;

export const PageDefinitionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  navLabel: z.string().min(1),
  slug: z.string().default(''),
  role: z.enum(['HOME', 'CATALOG', 'DETAIL', 'ABOUT', 'SERVICES', 'CONTACT', 'GALLERY', 'CUSTOM']).default('HOME'),
  isRequired: z.boolean().default(false),
  navOrder: z.number().int().nonnegative().default(0),
  navVisible: z.boolean().default(true),
  sections: z.array(SectionDefinitionSchema).default([]),
  seo: z.object({
    titleTemplate: z.string().default('{{store.name}} - Accueil Officiel'),
    descriptionTemplate: z.string().default('Découvrez {{store.name}} à {{store.city}}.'),
  }).default({}),
});

export type PageDefinition = z.infer<typeof PageDefinitionSchema>;

// ── 6. ADAPTATION RULES SCHEMA ───────────────────────────────────────────────

export const AdaptationRuleSetSchema = z.object({
  allowedFreedomLevels: z.record(z.string(), FreedomLevelSchema).default({}),
  industrySectionOverrides: z.record(
    z.string(),
    z.object({
      requiredSections: z.array(z.string()).optional(),
      optionalSections: z.array(z.string()).optional(),
      hiddenSections: z.array(z.string()).optional(),
    })
  ).default({}),
  minProductsRequired: z.number().int().nonnegative().default(1),
});

export type AdaptationRuleSet = z.infer<typeof AdaptationRuleSetSchema>;

// ── 7. UNIFIED DESIGN DEFINITION SCHEMA (CŒUR VESTIN) ───────────────────────

export const DesignDefinitionSchema = z.object({
  id: z.string().min(1),
  meta: z.object({
    name: z.string().min(1),
    version: z.string().default('1.0.0'),
    author: z.string().default('Vestin Studio'),
    description: z.string().default(''),
    preview: z.object({
      desktopThumbnailUrl: z.string().default(''),
      mobileThumbnailUrl: z.string().default(''),
    }).default({}),
    tags: z.array(z.string()).default([]),
    createdAt: z.string().default(() => new Date().toISOString()),
  }),
  applicability: z.object({
    targetArchetypes: z.array(BusinessTypeSchema).default(['PHYSICAL_PRODUCT']),
    positioning: z.enum(['LUXURY', 'PREMIUM', 'POPULAR', 'RUSTIC', 'MINIMAL', 'HIGH_TECH']).default('PREMIUM'),
    conversionMode: z.enum(['WHATSAPP_DIRECT', 'CATALOG_BROWSING', 'BOOKING_FIRST', 'QUOTE_REQUEST']).default('WHATSAPP_DIRECT'),
  }),
  pages: z.record(z.string(), PageDefinitionSchema),
  styleSystem: StyleDefinitionSchema,
  nativeAssets: z.record(z.string(), AssetDefinitionSchema).default({}),
  adaptationRules: AdaptationRuleSetSchema.default({}),
});

export type DesignDefinition = z.infer<typeof DesignDefinitionSchema>;

// ── 8. STOREFRONT INSTANCE (DOCUMENT PERSISTÉ) ───────────────────────────────

export const StorefrontInstanceSchema = StorefrontConfigSchema.extend({
  sourceDesignId: z.string().min(1),
  designVersion: z.string().default('1.0.0'),
  adaptationTimestamp: z.string().default(() => new Date().toISOString()),
  appliedFreedomLevels: z.record(z.string(), FreedomLevelSchema).optional(),
});

export type StorefrontInstance = z.infer<typeof StorefrontInstanceSchema>;

// ── 9. DESIGN DEFINITION → STOREFRONT CONFIG ADAPTER ─────────────────────────
// Conversion utilitaire utilisée par le Canonical Renderer pour hydrater une
// StorefrontConfig à partir d'une DesignDefinition complète.

export function designDefinitionToStorefrontConfig(
  design: DesignDefinition,
  overrides?: {
    storeName?: string;
    currency?: string;
    city?: string;
    phone?: string;
    whatsapp?: string;
    logoUrl?: string;
    bannerUrl?: string;
    tagline?: string;
  }
): StorefrontConfig {
  const style = design.styleSystem;
  const firstPage = Object.values(design.pages)[0];
  const sections = firstPage?.sections
    ? Object.values(firstPage.sections).map((sec, idx) => ({
        id: sec.id || `sec_${idx}`,
        type: sec.type || 'GENERIC',
        variant: sec.variant,
        visible: true,
        content: (sec as any).defaultContent || {},
        styles: {},
      }))
    : [];

  return {
    version: design.meta.version || '3.0.0',
    businessType: design.applicability?.targetArchetypes?.[0] || 'PHYSICAL_PRODUCT',
    metadata: {
      storeName: overrides?.storeName || design.meta.name,
      tagline: overrides?.tagline || design.meta.description || '',
      currency: overrides?.currency || 'FCFA',
      locale: 'fr-FR',
      primaryCity: overrides?.city || 'Douala',
      contactPhone: overrides?.phone || '',
      whatsappNumber: overrides?.whatsapp || overrides?.phone || '',
      logoUrl: overrides?.logoUrl || '',
      bannerUrl: overrides?.bannerUrl || '',
    },
    theme: {
      colorScheme: style.palette.isDark ? 'dark' : 'light',
      palette: {
        primary: style.palette.primary,
        accent: style.palette.accent,
        background: style.palette.background,
        surface: style.palette.surface,
        surfaceBorder: style.palette.surfaceBorder,
        textPrimary: style.palette.textPrimary,
        textMuted: style.palette.textMuted,
      },
      typography: {
        fontFamilyHeading: style.typography.fontFamilyHeading,
        fontFamilyBody: style.typography.fontFamilyBody,
        baseSize: style.typography.baseSize,
        headingWeight: style.typography.headingWeight,
      },
      spatial: {
        borderRadius: style.spatial.borderRadius,
        spacingDensity: style.spatial.spacingDensity,
        cardElevation: style.spatial.cardElevation,
      },
    },
    sections,
  } as unknown as StorefrontConfig;
}

