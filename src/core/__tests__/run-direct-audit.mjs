import { z } from 'zod';

// ── SCHÉMAS ET TYPES ──
const BusinessTypeSchema = z.enum([
  'PHYSICAL_PRODUCT',
  'SERVICE',
  'HYBRID',
  'LIVESTOCK_PRODUCT',
  'RESTAURANT',
  'ARTISAN',
]);

const ThemeSchema = z.object({
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
  borderRadius: z.string().default('smooth'),
}).passthrough();

const SectionStylesSchema = z.object({
  paddingTop: z.union([z.string(), z.number()]).optional(),
  paddingBottom: z.union([z.string(), z.number()]).optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  customClasses: z.string().optional(),
  customCss: z.string().optional(),
  fullWidth: z.boolean().optional(),
}).passthrough();

const SectionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  variant: z.string().default('default'),
  visible: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
  styles: SectionStylesSchema.optional().default({}),
  content: z.record(z.string(), z.unknown()).default({}),
});

const StorefrontPageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().default(''),
  isHome: z.boolean().optional().default(false),
  sections: z.array(SectionSchema).default([]),
});

const StorefrontConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
  theme: ThemeSchema.default({}),
  sections: z.array(SectionSchema).default([]),
  pages: z.array(StorefrontPageSchema).optional().default([]),
  version: z.string().default('3.0.0'),
  updatedAt: z.string().optional(),
});

function validateStorefrontConfig(data) {
  return StorefrontConfigSchema.parse(data);
}

// ── MASTER DESIGN #001 CANONIQUE ──
const VST_DSN_PRESTIGE_ATELIER_001 = {
  id: 'vst_dsn_prestige_atelier_001',
  meta: {
    name: 'Atelier Prestige & Maison Haute Couture',
    version: '1.0.0',
    author: 'Vestin Master Studio',
    description: 'Typographie noble, grand hero immersif asymétrique, cartes à liseré doré et conversion WhatsApp directe.',
    preview: {
      desktopThumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
      mobileThumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
    },
    tags: ['luxe', 'mode', 'prestige', 'noir-dore', 'artisanat', 'afrique', 'whatsapp'],
    createdAt: '2026-09-23T09:00:00.000Z',
  },
  applicability: {
    targetArchetypes: ['PHYSICAL_PRODUCT', 'SERVICE', 'ARTISAN', 'RESTAURANT', 'LIVESTOCK_PRODUCT', 'HYBRID'],
    positioning: 'LUXURY',
    conversionMode: 'WHATSAPP_DIRECT',
  },
  styleSystem: {
    palette: {
      isDark: true,
      primary: '#D4AF37', // Or Champagne
      primaryForeground: '#09090B',
      accent: '#F59E0B',  // Ambre Doré
      accentForeground: '#FFFFFF',
      background: '#09090B',
      surface: '#141418',
      surfaceBorder: 'rgba(212, 175, 55, 0.25)',
      textPrimary: '#FAF7F2',
      textMuted: '#A1A1AA',
    },
    typography: {
      fontFamilyHeading: 'Playfair Display, Georgia, serif',
      fontFamilyBody: 'Plus Jakarta Sans, system-ui, sans-serif',
      baseSize: 'STANDARD',
      headingWeight: 'BOLD',
    },
    spatial: {
      borderRadius: 'MODERN_MD',
      spacingDensity: 'COMFORTABLE',
      cardElevation: 'SOFT_SHADOW',
    },
  },
  nativeAssets: {},
  adaptationRules: {
    allowedFreedomLevels: {
      'typography.fontFamilyHeading': 'LOCKED',
      'typography.fontFamilyBody': 'LOCKED',
      'styleSystem.palette.background': 'LOCKED',
      'styleSystem.palette.surface': 'LOCKED',
      'styleSystem.palette.primary': 'CONTROLLED',
      'styleSystem.palette.accent': 'CONTROLLED',
      'content.titles': 'ADAPTIVE',
      'content.subtitles': 'ADAPTIVE',
      'content.products': 'ADAPTIVE',
      'content.contact': 'ADAPTIVE',
    },
    industrySectionOverrides: {
      LIVESTOCK_PRODUCT: {
        requiredSections: ['sec_header', 'sec_hero', 'sec_products', 'sec_trust_badges', 'sec_contact', 'sec_footer'],
      },
      RESTAURANT: {
        requiredSections: ['sec_header', 'sec_hero', 'sec_products', 'sec_about', 'sec_contact', 'sec_footer'],
      },
    },
    minProductsRequired: 1,
  },
  pages: {
    home: {
      id: 'home',
      title: 'Accueil',
      navLabel: 'Accueil',
      slug: '',
      role: 'HOME',
      isRequired: true,
      navOrder: 0,
      navVisible: true,
      seo: {
        titleTemplate: '{{store.name}} - Boutique Officielle à {{store.city}}',
        descriptionTemplate: 'Découvrez {{store.name}} à {{store.city}}.',
      },
      sections: [
        {
          id: 'sec_header',
          semanticRole: 'HEADER',
          variant: 'header_prestige_sticky_01',
          order: 0,
          behavior: { isCollapsible: false, isDeletable: false, isMovable: false, supportsDuplicate: false },
          layout: { containerWidth: 'FULL_BLEED', verticalPadding: 'COMPACT', backgroundMode: 'SOLID' },
          bindings: [
            {
              bindingId: 'b_hdr_store_name',
              semanticRole: 'BRAND_LOGO',
              targetNodeId: 'node_hdr_brand',
              source: { entity: 'BUSINESS_PROFILE', fieldPath: 'store.name' },
              contentType: 'STRING',
              isRequired: true,
              fallback: { action: 'USE_DESIGNER_PLACEHOLDER', placeholderValue: 'Maison VesTyle' },
            },
            {
              bindingId: 'b_hdr_city',
              semanticRole: 'CONTACT_BLOCK',
              targetNodeId: 'node_hdr_city',
              source: { entity: 'BUSINESS_PROFILE', fieldPath: 'store.city' },
              contentType: 'STRING',
              isRequired: false,
              fallback: { action: 'USE_DESIGNER_PLACEHOLDER', placeholderValue: 'Douala, Cameroun' },
            },
            {
              bindingId: 'b_hdr_wa',
              semanticRole: 'PRIMARY_CTA',
              targetNodeId: 'node_hdr_wa_btn',
              source: { entity: 'BUSINESS_PROFILE', fieldPath: 'store.whatsapp' },
              contentType: 'PHONE_WHATSAPP',
              isRequired: true,
              transformationPipe: ['BUILD_WHATSAPP_ORDER_LINK'],
              fallback: { action: 'USE_DESIGNER_PLACEHOLDER', placeholderValue: '237674151728' },
            },
          ],
          defaultContent: {
            brandName: 'Maison VesTyle',
            cityText: 'Douala, Cameroun',
            whatsappNumber: '237674151728',
          },
        },
        {
          id: 'sec_hero',
          semanticRole: 'HERO',
          variant: 'hero_asymmetric_gold_01',
          order: 1,
          behavior: { isCollapsible: false, isDeletable: false, isMovable: true, supportsDuplicate: false },
          layout: { containerWidth: 'STANDARD_CONTAINED', verticalPadding: 'EXPANSIVE', backgroundMode: 'IMAGE_OVERLAY' },
          bindings: [
            {
              bindingId: 'b_hero_badge',
              semanticRole: 'HERO_BADGE',
              targetNodeId: 'node_hero_badge',
              source: { entity: 'AI_MISTRAL_GENERATED', fieldPath: 'ai.heroBadge' },
              contentType: 'STRING',
              isRequired: false,
              textLimits: { maxCharacters: 60, overflowBehavior: 'ELLIPSIS' },
              fallback: { action: 'USE_DESIGNER_PLACEHOLDER', placeholderValue: '✨ CRÉATION & EXCELLENCE' },
            },
            {
              bindingId: 'b_hero_title',
              semanticRole: 'HERO_TITLE',
              targetNodeId: 'node_hero_title',
              source: { entity: 'AI_MISTRAL_GENERATED', fieldPath: 'ai.heroTitle' },
              contentType: 'STRING',
              isRequired: true,
              textLimits: { maxCharacters: 120, overflowBehavior: 'ELLIPSIS' },
              fallback: { action: 'USE_DESIGNER_PLACEHOLDER', placeholderValue: 'Élégance & Savoir-Faire d’Exception' },
            },
            {
              bindingId: 'b_hero_subtitle',
              semanticRole: 'HERO_SUBTITLE',
              targetNodeId: 'node_hero_sub',
              source: { entity: 'AI_MISTRAL_GENERATED', fieldPath: 'ai.heroSubtitle' },
              contentType: 'STRING',
              isRequired: true,
              textLimits: { maxCharacters: 250, overflowBehavior: 'ELLIPSIS' },
              fallback: { action: 'USE_DESIGNER_PLACEHOLDER', placeholderValue: 'Découvrez notre collection raffinée.' },
            },
            {
              bindingId: 'b_hero_cta',
              semanticRole: 'PRIMARY_CTA',
              targetNodeId: 'node_hero_cta_btn',
              source: { entity: 'AI_MISTRAL_GENERATED', fieldPath: 'ai.ctaText' },
              contentType: 'STRING',
              isRequired: true,
              fallback: { action: 'USE_DESIGNER_PLACEHOLDER', placeholderValue: 'Commander sur WhatsApp' },
            },
            {
              bindingId: 'b_hero_cover',
              semanticRole: 'MEDIA_HERO_COVER',
              targetNodeId: 'node_hero_image',
              source: { entity: 'SELLER_CONTENT', fieldPath: 'seller.bannerUrl' },
              contentType: 'IMAGE_URL',
              isRequired: false,
              fallback: {
                action: 'USE_DESIGNER_PLACEHOLDER',
                placeholderValue: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200',
              },
            },
          ],
          defaultContent: {
            badgeText: '✨ CRÉATION & EXCELLENCE',
            title: 'Élégance & Savoir-Faire d’Exception',
            subtitle: 'Découvrez notre collection raffinée.',
            ctaText: 'Commander sur WhatsApp',
            bannerUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200',
          },
        },
        {
          id: 'sec_products',
          semanticRole: 'PRODUCT_GRID',
          variant: 'product_grid_gold_cards_01',
          order: 2,
          behavior: { isCollapsible: false, isDeletable: false, isMovable: true, supportsDuplicate: false },
          layout: { containerWidth: 'STANDARD_CONTAINED', verticalPadding: 'GENEROUS', backgroundMode: 'SOLID' },
          bindings: [
            {
              bindingId: 'b_prod_list',
              semanticRole: 'PRODUCT_REPEATER',
              targetNodeId: 'node_prod_repeater',
              source: { entity: 'SELLER_CONTENT', fieldPath: 'seller.products' },
              contentType: 'ARRAY_ITEMS',
              isRequired: true,
              cardinality: { minItems: 1, maxItems: 6, overflowStrategy: 'TRUNCATE_WITH_VIEW_ALL_BUTTON' },
              fallback: { action: 'TRIGGER_AI_FALLBACK', placeholderValue: [] },
            },
          ],
          defaultContent: {
            title: 'Nos Pièces Phares',
            subtitle: 'Sélectionnées avec soin',
          },
        },
        {
          id: 'sec_trust_badges',
          semanticRole: 'TRUST_BADGES_GROUP',
          variant: 'trust_badges_momo_gold_01',
          order: 3,
          behavior: { isCollapsible: true, isDeletable: true, isMovable: true, supportsDuplicate: false },
          layout: { containerWidth: 'STANDARD_CONTAINED', verticalPadding: 'COMPACT', backgroundMode: 'SURFACE_ALT' },
          bindings: [
            {
              bindingId: 'b_trust_badge_text',
              semanticRole: 'HERO_BADGE',
              targetNodeId: 'node_trust_title',
              source: { entity: 'AI_MISTRAL_GENERATED', fieldPath: 'ai.trustBadgeText' },
              contentType: 'STRING',
              isRequired: false,
              fallback: { action: 'USE_DESIGNER_PLACEHOLDER', placeholderValue: 'Paiement MTN MoMo / Orange Money & Livraison Douala Express' },
            },
          ],
          defaultContent: {
            trustTitle: 'Paiements Sécurisés & Livraison Express',
            trustSubtitle: 'Confirmation immédiate sur WhatsApp',
          },
        },
        {
          id: 'sec_footer',
          semanticRole: 'FOOTER',
          variant: 'footer_prestige_minimal_01',
          order: 4,
          behavior: { isCollapsible: false, isDeletable: false, isMovable: false, supportsDuplicate: false },
          layout: { containerWidth: 'FULL_BLEED', verticalPadding: 'COMPACT', backgroundMode: 'SOLID' },
          bindings: [
            {
              bindingId: 'b_ftr_store_name',
              semanticRole: 'BRAND_LOGO',
              targetNodeId: 'node_ftr_brand',
              source: { entity: 'BUSINESS_PROFILE', fieldPath: 'store.name' },
              contentType: 'STRING',
              isRequired: true,
              fallback: { action: 'USE_DESIGNER_PLACEHOLDER', placeholderValue: 'Maison VesTyle' },
            },
          ],
          defaultContent: {
            copyrightText: '© 2026 VesTyle Pro. Tous droits réservés.',
          },
        },
      ],
    },
  },
};

// ── VESTIN ADAPTATION ENGINE ──
class VestinAdaptationEngine {
  static adapt(design, input, storeId = `store_${Date.now()}`) {
    const bp = input.businessProfile || {};
    const sc = input.sellerContent || {};
    const ai = input.aiCopywriting || {};
    const storeName = (bp.storeName || 'Boutique VesTyle').trim();
    const city = (bp.city || 'Douala').trim();
    const cleanWhatsApp = (bp.whatsapp || '237674151728').replace(/\D/g, '');
    const businessType = bp.businessType || 'PHYSICAL_PRODUCT';

    const isDark = design.styleSystem.palette.isDark;
    const primaryColor = design.styleSystem.palette.primary;
    const accentColor = input.preferences?.customAccentColor || design.styleSystem.palette.accent;
    const bgColor = design.styleSystem.palette.background;
    const textColor = design.styleSystem.palette.textPrimary;
    const textMutedColor = design.styleSystem.palette.textMuted;
    const font = design.styleSystem.typography.fontFamilyBody;
    const headingFont = design.styleSystem.typography.fontFamilyHeading;
    const borderRadius = design.styleSystem.spatial.borderRadius.toLowerCase();

    const compiledPages = [];

    for (const [pageKey, pageDef] of Object.entries(design.pages)) {
      const compiledSections = [];
      const sortedSections = [...pageDef.sections].sort((a, b) => (a.order || 0) - (b.order || 0));

      for (const secDef of sortedSections) {
        const resolvedContent = { ...secDef.defaultContent };

        if (Array.isArray(secDef.bindings)) {
          for (const rule of secDef.bindings) {
            const resolvedValue = this.resolveBindingValue(rule, {
              storeName,
              city,
              whatsapp: cleanWhatsApp,
              businessType,
              description: bp.description || '',
              slogan: bp.slogan || '',
              products: sc.products || [],
              logoUrl: sc.logoUrl || '',
              bannerUrl: sc.bannerUrl || '',
              ai,
            });

            if (resolvedValue !== undefined && resolvedValue !== null) {
              this.injectResolvedValue(resolvedContent, rule.semanticRole, resolvedValue);
            }
          }
        }

        compiledSections.push({
          id: secDef.id,
          type: secDef.semanticRole,
          variant: secDef.variant,
          visible: true,
          order: secDef.order,
          styles: {
            paddingTop: secDef.layout.verticalPadding === 'EXPANSIVE' ? '80px' : '48px',
            paddingBottom: secDef.layout.verticalPadding === 'EXPANSIVE' ? '80px' : '48px',
          },
          content: resolvedContent,
        });
      }

      compiledPages.push({
        id: pageDef.id,
        name: pageDef.title,
        slug: pageDef.slug,
        isHome: pageDef.role === 'HOME',
        sections: compiledSections,
      });
    }

    const homePage = compiledPages.find((p) => p.isHome) || compiledPages[0];
    const rootSections = homePage ? homePage.sections : [];

    const rawConfig = {
      id: storeId,
      name: storeName,
      metadata: {
        city,
        sector: businessType.toLowerCase(),
        whatsapp: cleanWhatsApp,
        phone: cleanWhatsApp,
        slogan: bp.slogan || ai.heroSubtitle || 'Votre boutique de référence',
        description: bp.description || `Boutique officielle ${storeName} à ${city}.`,
        logoUrl: sc.logoUrl || '',
        coverUrl: sc.bannerUrl || '',
        currency: 'FCFA',
        currencySymbol: 'FCFA',
        businessType,
      },
      theme: {
        mode: isDark ? 'dark' : 'light',
        isDark,
        primaryColor,
        accentColor,
        bgColor,
        textColor,
        textMutedColor,
        font,
        headingFont,
        borderRadius,
      },
      sections: rootSections,
      pages: compiledPages,
      version: '3.0.0',
    };

    return validateStorefrontConfig(rawConfig);
  }

  static resolveBindingValue(rule, context) {
    let rawValue = undefined;

    switch (rule.source.entity) {
      case 'BUSINESS_PROFILE': {
        if (rule.source.fieldPath === 'store.name') rawValue = context.storeName;
        else if (rule.source.fieldPath === 'store.city') rawValue = context.city;
        else if (rule.source.fieldPath === 'store.whatsapp') rawValue = context.whatsapp;
        else if (rule.source.fieldPath === 'store.description') rawValue = context.description;
        else if (rule.source.fieldPath === 'store.slogan') rawValue = context.slogan;
        break;
      }
      case 'SELLER_CONTENT': {
        if (rule.source.fieldPath === 'seller.products') rawValue = context.products;
        else if (rule.source.fieldPath === 'seller.logoUrl') rawValue = context.logoUrl;
        else if (rule.source.fieldPath === 'seller.bannerUrl') rawValue = context.bannerUrl;
        break;
      }
      case 'AI_MISTRAL_GENERATED': {
        if (rule.source.fieldPath === 'ai.heroTitle') rawValue = context.ai.heroTitle;
        else if (rule.source.fieldPath === 'ai.heroSubtitle') rawValue = context.ai.heroSubtitle;
        else if (rule.source.fieldPath === 'ai.heroBadge') rawValue = context.ai.heroBadge;
        else if (rule.source.fieldPath === 'ai.ctaText') rawValue = context.ai.ctaText;
        else if (rule.source.fieldPath === 'ai.trustBadgeText') rawValue = context.ai.trustBadgeText;
        break;
      }
    }

    if (rawValue === undefined || rawValue === null || rawValue === '' || (Array.isArray(rawValue) && rawValue.length === 0)) {
      if (rule.fallback.action === 'USE_DESIGNER_PLACEHOLDER') {
        rawValue = rule.fallback.placeholderValue;
      } else if (rule.fallback.action === 'HIDE_NODE_COMPLETELY') {
        return null;
      }
    }

    if (rule.transformationPipe && typeof rawValue === 'string') {
      for (const pipe of rule.transformationPipe) {
        if (pipe === 'NORMALIZE_CAMEROON_PHONE') {
          rawValue = rawValue.replace(/\D/g, '');
        } else if (pipe === 'UPPERCASE_FIRST') {
          rawValue = rawValue.charAt(0).toUpperCase() + rawValue.slice(1);
        }
      }
    }

    if (rule.textLimits && typeof rawValue === 'string' && rawValue.length > rule.textLimits.maxCharacters) {
      if (rule.textLimits.overflowBehavior === 'ELLIPSIS') {
        rawValue = rawValue.slice(0, rule.textLimits.maxCharacters - 3) + '...';
      }
    }

    if (rule.cardinality && Array.isArray(rawValue)) {
      const max = rule.cardinality.maxItems;
      rawValue = rawValue.slice(0, max);
    }

    return rawValue;
  }

  static injectResolvedValue(content, semanticRole, value) {
    switch (semanticRole) {
      case 'HERO_TITLE':
        content.title = value;
        break;
      case 'HERO_SUBTITLE':
        content.subtitle = value;
        break;
      case 'HERO_BADGE':
        content.badgeText = value;
        break;
      case 'PRIMARY_CTA':
        content.ctaText = value;
        break;
      case 'MEDIA_HERO_COVER':
        content.bannerUrl = value;
        break;
      case 'PRODUCT_REPEATER':
        content.products = value;
        break;
      case 'BRAND_LOGO':
        content.brandName = value;
        break;
      case 'ABOUT_PARAGRAPH':
        content.aboutText = value;
        break;
      case 'CONTACT_BLOCK':
        content.contactText = value;
        break;
    }
  }
}

// ── EXÉCUTION COMPLÈTE DE LA BATTERIE DE TESTS (PHASE 2A) ──
async function runPhase2AAudit() {
  console.log('═════════════════════════════════════════════════════════════════');
  console.log('🔬 AUDIT DE DURCISSEMENT TECHNIQUE & STRESS TESTS VESTIN (PHASE 2A)');
  console.log('═════════════════════════════════════════════════════════════════\n');

  const tests = [
    // 1. Cardinalités
    {
      name: '1. Test 0 Produit (Catalogue vide)',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Test 0', city: 'Douala' },
          sellerContent: { products: [] },
        });
        const pSec = res.sections.find((s) => s.type === 'PRODUCT_GRID');
        return Array.isArray(pSec?.content?.products);
      },
    },
    {
      name: '2. Test 1 Produit (Catalogue unitaire)',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Test 1', city: 'Douala' },
          sellerContent: { products: [{ name: 'Solo Prod', price: 1000 }] },
        });
        const pSec = res.sections.find((s) => s.type === 'PRODUCT_GRID');
        return pSec?.content?.products?.length === 1;
      },
    },
    {
      name: '3. Test 3 Produits (Standard)',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Test 3', city: 'Douala' },
          sellerContent: {
            products: [
              { name: 'P1', price: 1000 },
              { name: 'P2', price: 2000 },
              { name: 'P3', price: 3000 },
            ],
          },
        });
        const pSec = res.sections.find((s) => s.type === 'PRODUCT_GRID');
        return pSec?.content?.products?.length === 3;
      },
    },
    {
      name: '4. Test 20 Produits (Troncature maîtrisée à max 6 sur Accueil)',
      fn: () => {
        const prods = Array.from({ length: 20 }, (_, i) => ({ name: `Prod ${i + 1}`, price: 1000 * (i + 1) }));
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Test 20', city: 'Douala' },
          sellerContent: { products: prods },
        });
        const pSec = res.sections.find((s) => s.type === 'PRODUCT_GRID');
        return pSec?.content?.products?.length <= 6;
      },
    },
    {
      name: '5. Test 100 Produits (Stress test volume géant)',
      fn: () => {
        const prods = Array.from({ length: 100 }, (_, i) => ({ name: `Prod ${i + 1}`, price: 500 * (i + 1) }));
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Test 100', city: 'Douala' },
          sellerContent: { products: prods },
        });
        return res.id.length > 0 && res.sections.length > 0;
      },
    },
    // 2. Données Manquantes
    {
      name: '6. Test Logo absent (Gestion sans crash)',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'No Logo', city: 'Douala' },
          sellerContent: { logoUrl: undefined },
        });
        return res.metadata.logoUrl === '';
      },
    },
    {
      name: '7. Test Bannière absente (Placeholder designer injecté)',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'No Banner', city: 'Douala' },
          sellerContent: { bannerUrl: undefined },
        });
        const hSec = res.sections.find((s) => s.type === 'HERO');
        return typeof hSec?.content?.bannerUrl === 'string' && hSec.content.bannerUrl.length > 0;
      },
    },
    {
      name: '8. Test WhatsApp absent (Normalisation de sécurité)',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'No WA', city: 'Douala', whatsapp: undefined },
          sellerContent: {},
        });
        return typeof res.metadata.whatsapp === 'string' && res.metadata.whatsapp.length >= 8;
      },
    },
    {
      name: '9. Test Images produits absentes',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'No Img Prods', city: 'Douala' },
          sellerContent: { products: [{ name: 'Sans Image', price: 5000, image: undefined }] },
        });
        const pSec = res.sections.find((s) => s.type === 'PRODUCT_GRID');
        return pSec?.content?.products?.[0]?.name === 'Sans Image';
      },
    },
    // 3. Overflow & Textes Géants
    {
      name: '10. Test Titre très long (> 500 cars) (Application Ellipsis à 120 cars)',
      fn: () => {
        const longTitle = 'PROMOTION EXCEPTIONNELLE HAUTE COUTURE '.repeat(20);
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Titre Long', city: 'Douala' },
          sellerContent: {},
          aiCopywriting: { heroTitle: longTitle },
        });
        const hSec = res.sections.find((s) => s.type === 'HERO');
        const title = hSec?.content?.title;
        return title.length <= 120 && title.endsWith('...');
      },
    },
    {
      name: '11. Test Description très longue (> 2000 cars)',
      fn: () => {
        const longDesc = 'Description kilométrique du savoir-faire... '.repeat(50);
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Desc Longue', city: 'Douala', description: longDesc },
          sellerContent: {},
        });
        return res.metadata.description.length > 500;
      },
    },
    // 4. Tous les Verticaux
    {
      name: '12. Vertical : Produits Physiques (Mode)',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Mode Paris', city: 'Douala', businessType: 'PHYSICAL_PRODUCT' },
          sellerContent: { products: [{ name: 'Robe Chic', price: 35000 }] },
        });
        return res.metadata.businessType === 'PHYSICAL_PRODUCT';
      },
    },
    {
      name: '13. Vertical : Prestation de Services (Conseil/Audit)',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Cabinet Audit Pro', city: 'Yaoundé', businessType: 'SERVICE' },
          sellerContent: { products: [{ name: 'Consultation 1h', price: 25000 }] },
        });
        return res.metadata.businessType === 'SERVICE';
      },
    },
    {
      name: '14. Vertical : Commerce Hybride (Boutique + Cours)',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Atelier Couture & Cours', city: 'Bafoussam', businessType: 'HYBRID' },
          sellerContent: { products: [{ name: 'Machine à Coudre + Formation', price: 150000 }] },
        });
        return res.metadata.businessType === 'HYBRID';
      },
    },
    {
      name: '15. Vertical : Restaurant & Grillades',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Grillades du Terroir', city: 'Douala', businessType: 'RESTAURANT' },
          sellerContent: { products: [{ name: 'Poisson Braisé Royal', price: 10000 }] },
        });
        return res.metadata.businessType === 'RESTAURANT';
      },
    },
    {
      name: '16. Vertical : Hôtel & Résidences Standing',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Palace Les Palmiers', city: 'Kribi', businessType: 'SERVICE' },
          sellerContent: { products: [{ name: 'Suite Océane Nuitée', price: 85000 }] },
        });
        return res.metadata.businessType === 'SERVICE';
      },
    },
    {
      name: '17. Vertical : Salon de Coiffure & Beauté VIP',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Studio Coiffure HD', city: 'Douala', businessType: 'SERVICE' },
          sellerContent: { products: [{ name: 'Pose Perruque HD', price: 20000 }] },
        });
        return res.metadata.businessType === 'SERVICE';
      },
    },
    {
      name: '18. Vertical : Location Voitures & Meublés',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'VIP Car Rental', city: 'Yaoundé', businessType: 'SERVICE' },
          sellerContent: { products: [{ name: 'Toyota Prado / Jour', price: 60000 }] },
        });
        return res.metadata.businessType === 'SERVICE';
      },
    },
    {
      name: '19. Vertical : Élevage & Agropastoral (Chiens/Chats/Bétail)',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Ferme Goliath Bio', city: 'Bafoussam', businessType: 'LIVESTOCK_PRODUCT' },
          sellerContent: { products: [{ name: 'Lot 20 Poulets Goliath', price: 90000 }] },
        });
        return res.metadata.businessType === 'LIVESTOCK_PRODUCT';
      },
    },
    // 5. Préservation des Identifiants & Niveaux de Liberté
    {
      name: '20. Préservation stricte des IDs de section',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Test IDs', city: 'Douala' },
          sellerContent: {},
        });
        const ids = res.sections.map((s) => s.id);
        return ids.includes('sec_header') && ids.includes('sec_hero') && ids.includes('sec_products') && ids.includes('sec_trust_badges') && ids.includes('sec_footer');
      },
    },
    {
      name: '21. Préservation stricte des Variants de section',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Test Variants', city: 'Douala' },
          sellerContent: {},
        });
        const hSec = res.sections.find((s) => s.id === 'sec_hero');
        return hSec?.variant === 'hero_asymmetric_gold_01';
      },
    },
    {
      name: '22. Respect absolu du niveau LOCKED sur la Typographie',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Test Font Locked', city: 'Douala' },
          sellerContent: {},
          preferences: { customAccentColor: '#FF0000' },
        });
        return res.theme.headingFont === 'Playfair Display, Georgia, serif';
      },
    },
    {
      name: '23. Validation Zod stricte du StorefrontConfig résultant',
      fn: () => {
        const res = VestinAdaptationEngine.adapt(VST_DSN_PRESTIGE_ATELIER_001, {
          businessProfile: { storeName: 'Zod Strict Validation', city: 'Douala' },
          sellerContent: {},
        });
        const parsed = validateStorefrontConfig(res);
        return parsed.version === '3.0.0';
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      const ok = t.fn();
      if (ok) {
        passed++;
        console.log(`✅ [SUCCÈS] ${t.name}`);
      } else {
        failed++;
        console.error(`❌ [ÉCHEC]  ${t.name} (Assertion false)`);
      }
    } catch (e) {
      failed++;
      console.error(`❌ [ERREUR] ${t.name} : ${e.message}`);
    }
  }

  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log(`📊 BILAN COMPLET : ${passed}/${tests.length} TESTS RÉUSSIS (${failed} ÉCHECS)`);
  console.log('═════════════════════════════════════════════════════════════════');
  
  return { passed, failed, total: tests.length };
}

runPhase2AAudit().catch(console.error);
