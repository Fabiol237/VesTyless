import { z } from 'zod';

/**
 * VesTyle / Vestin — Schéma Canonique BusinessProfile
 * ─────────────────────────────────────────────────────────────────────────────
 * Contrat de données universel représentant l'état d'un commerce / vendeur.
 * Validable de façon déterministe avec BusinessProfileSchema.parse(profile).
 */

export const ProductItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Le nom du produit est requis'),
  slug: z.string().optional(),
  price: z.number().nonnegative('Le prix doit être positif ou nul'),
  originalPrice: z.number().nonnegative().optional().nullable(),
  description: z.string().default(''),
  category: z.string().default('Général'),
  categoryId: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
  image: z.string().default(''),
  stock: z.number().int().default(0),
  isActive: z.boolean().default(true),
  moq: z.number().int().positive().default(1),
  variants: z.array(z.any()).default([]),
  specifications: z.record(z.any()).default({}),
  badge: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CategoryItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  productCount: z.number().int().default(0),
});

export const SectionBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  variant: z.string().optional(),
  label: z.string().optional(),
  position: z.number().int().default(0),
  isActive: z.boolean().default(true),
  config: z.record(z.any()).default({}),
  content: z.record(z.any()).default({}),
});

export const ThemeTokensSchema = z.object({
  primaryColor: z.string().default('#128C7E'),
  accentColor: z.string().default('#25D366'),
  secondaryColor: z.string().default('#0F172A'),
  bgColor: z.string().default('#FFFFFF'),
  textColor: z.string().default('#0F172A'),
  textMutedColor: z.string().default('#64748B'),
  borderColor: z.string().default('rgba(0,0,0,0.08)'),
  font: z.string().default('Inter'),
  headingFont: z.string().default('Inter'),
  isDark: z.boolean().default(false),
  mode: z.enum(['light', 'dark', 'auto']).default('light'),
});

export const BusinessIdentitySchema = z.object({
  name: z.string().min(1, 'Le nom commercial est obligatoire'),
  slug: z.string().min(1, 'Le slug est obligatoire'),
  description: z.string().default(''),
  slogan: z.string().default(''),
  logo: z.string().default(''),
  coverImage: z.string().default(''),
  phone: z.string().default(''),
  whatsapp: z.string().default(''),
  email: z.string().default(''),
  address: z.string().default(''),
  city: z.string().default('Douala'),
  country: z.string().default('Cameroun'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  website: z.string().default(''),
  socialLinks: z.record(z.string()).default({}),
  galleryUrls: z.array(z.string()).default([]),
  gallery: z.array(z.string()).default([]),
});

export const BusinessTypeSchema = z.object({
  type: z.string().default('product'), // 'product' | 'service' | 'hybrid' | 'restaurant' | 'prestataire' | etc.
  category: z.string().default('Général'),
  subcategory: z.string().default(''),
  status: z.enum(['active', 'draft', 'suspended', 'archived']).default('active'),
  tags: z.array(z.string()).default([]),
});

export const CommerceConfigSchema = z.object({
  currency: z.string().default('FCFA'),
  currencySymbol: z.string().default('FCFA'),
  minOrderAmount: z.number().nonnegative().default(0),
  allowOutOfStockOrders: z.boolean().default(false),
  paymentMethods: z.array(z.string()).default(['cash_on_delivery', 'orange_money', 'mtn_momo']),
  deliveryZones: z.array(z.any()).default([]),
  freeDeliveryThreshold: z.number().nonnegative().nullable().optional(),
  taxesIncluded: z.boolean().default(true),
});

export const StorefrontConfigSchema = z.object({
  templateId: z.string().default('boutique_pro'),
  themeId: z.string().default('theme_00'),
  theme: ThemeTokensSchema.default({}),
  layout: z.record(z.any()).default({}),
  sections: z.array(SectionBlockSchema).default([]),
  pages: z.array(z.any()).default([]),
  headerId: z.string().optional(),
  footerId: z.string().optional(),
  customCss: z.string().default(''),
});

export const BusinessMetadataSchema = z.object({
  source: z.string().default('supabase_legacy'),
  version: z.string().default('1.0.0'),
  createdAt: z.string().optional(),
  updatedAt: z.string().default(() => new Date().toISOString()),
  isVerified: z.boolean().default(false),
  isBoosted: z.boolean().default(false),
  viewCount: z.number().int().default(0),
  rating: z.number().min(0).max(5).default(5.0),
  reviewCount: z.number().int().default(0),
});

export const BusinessProfileSchema = z.object({
  id: z.string(),
  ownerId: z.string().nullable().optional(),
  identity: BusinessIdentitySchema,
  business: BusinessTypeSchema,
  capabilities: z.record(z.boolean()).default({}),
  commerce: CommerceConfigSchema,
  catalog: z.object({
    products: z.array(ProductItemSchema).default([]),
    categories: z.array(z.union([z.string(), CategoryItemSchema])).default([]),
    services: z.array(z.any()).default([]),
  }).default({ products: [], categories: [], services: [] }),
  storefront: StorefrontConfigSchema,
  metadata: BusinessMetadataSchema,
});
