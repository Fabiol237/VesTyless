/**
 * VesTyle / Vestin — Master Design #001 : Prestige Atelier & Haute Couture
 * ─────────────────────────────────────────────────────────────────────────────
 * Premier design canonique complet unifié conforme au contrat DesignDefinition (v3.0).
 * Architecture multi-pages complète (Accueil, Catalogue, Histoire, Contact),
 * VisualNodeTree avec nœuds sémantiques, ContentBinding 2.0 et règles d'adaptation strictes.
 */

import type { DesignDefinition } from '../contracts/designDefinition';

export const VST_DSN_PRESTIGE_ATELIER_001: DesignDefinition = {
  id: 'vst_dsn_prestige_atelier_001',
  meta: {
    name: 'Atelier Prestige & Maison Haute Couture',
    version: '1.0.0',
    author: 'Vestin Master Studio',
    description: 'Typographie noble, grand hero immersif asymétrique, cartes à liseré doré et conversion WhatsApp directe optimisée pour l’Afrique.',
    preview: {
      desktopThumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      mobileThumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
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
      background: '#09090B', // Noir Profond
      surface: '#141418',    // Anthracite Satin
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
  nativeAssets: {
    asset_gold_border: {
      id: 'asset_gold_border',
      key: 'decorative_gold_filigree',
      role: 'DECORATIVE_BACKGROUND',
      ownership: 'DESIGN_NATIVE',
      isRequired: false,
      defaultUrl: 'https://res.cloudinary.com/da22qmu1g/image/upload/v1784057107/vestyle/assets/gold_filigree.png',
    },
    asset_momo_badge: {
      id: 'asset_momo_badge',
      key: 'payment_momo_badge',
      role: 'SYSTEM_ICON',
      ownership: 'DESIGN_NATIVE',
      isRequired: true,
      defaultUrl: 'https://res.cloudinary.com/da22qmu1g/image/upload/v1784057107/vestyle/assets/momo_om_shield.png',
    },
  },
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
        descriptionTemplate: 'Découvrez la sélection exclusive de {{store.name}} à {{store.city}}. Commandes directes sur WhatsApp.',
      },
      sections: [
        // ── 1. HEADER ──
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
        // ── 2. HERO IMMERSIF ──
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
              fallback: { action: 'USE_DESIGNER_PLACEHOLDER', placeholderValue: 'Découvrez notre collection raffinée d’articles confectionnés avec passion et disponibles immédiatement.' },
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
                placeholderValue: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
              },
            },
          ],
          defaultContent: {
            badgeText: '✨ CRÉATION & EXCELLENCE',
            title: 'Élégance & Savoir-Faire d’Exception',
            subtitle: 'Découvrez notre collection raffinée d’articles confectionnés avec passion et disponibles immédiatement.',
            ctaText: 'Commander sur WhatsApp',
            bannerUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
          },
        },
        // ── 3. GRILLE DES PRODUITS / SERVICES ──
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
              fallback: {
                action: 'TRIGGER_AI_FALLBACK',
                placeholderValue: [],
              },
            },
          ],
          defaultContent: {
            title: 'Nos Pièces & Prestations Phares',
            subtitle: 'Sélectionnées avec le plus grand soin',
          },
        },
        // ── 4. BANNIÈRE DE RÉASSURANCE CAMEROUNAISE ──
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
        // ── 5. FOOTER ──
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
    catalog: {
      id: 'catalog',
      title: 'Catalogue Complet',
      navLabel: 'Catalogue',
      slug: 'catalog',
      role: 'CATALOG',
      isRequired: true,
      navOrder: 1,
      navVisible: true,
      seo: {
        titleTemplate: 'Catalogue & Articles - {{store.name}}',
        descriptionTemplate: 'Consultez l’ensemble du catalogue {{store.name}} avec commande directe.',
      },
      sections: [
        {
          id: 'sec_cat_header',
          semanticRole: 'HEADER',
          variant: 'header_prestige_sticky_01',
          order: 0,
          behavior: { isCollapsible: false, isDeletable: false, isMovable: false, supportsDuplicate: false },
          layout: { containerWidth: 'FULL_BLEED', verticalPadding: 'COMPACT', backgroundMode: 'SOLID' },
          defaultContent: {},
        },
        {
          id: 'sec_cat_grid',
          semanticRole: 'PRODUCT_GRID',
          variant: 'product_grid_gold_cards_01',
          order: 1,
          behavior: { isCollapsible: false, isDeletable: false, isMovable: false, supportsDuplicate: false },
          layout: { containerWidth: 'STANDARD_CONTAINED', verticalPadding: 'GENEROUS', backgroundMode: 'SOLID' },
          defaultContent: {
            title: 'Catalogue Complet',
            subtitle: 'Tous nos articles et prestations disponibles',
          },
        },
        {
          id: 'sec_cat_footer',
          semanticRole: 'FOOTER',
          variant: 'footer_prestige_minimal_01',
          order: 2,
          behavior: { isCollapsible: false, isDeletable: false, isMovable: false, supportsDuplicate: false },
          layout: { containerWidth: 'FULL_BLEED', verticalPadding: 'COMPACT', backgroundMode: 'SOLID' },
          defaultContent: {},
        },
      ],
    },
    about: {
      id: 'about',
      title: 'Notre Savoir-Faire',
      navLabel: 'Histoire',
      slug: 'about',
      role: 'ABOUT',
      isRequired: false,
      navOrder: 2,
      navVisible: true,
      seo: {
        titleTemplate: 'À Propos de {{store.name}} - Notre Histoire',
        descriptionTemplate: 'Découvrez les valeurs et l’engagement qualité de {{store.name}}.',
      },
      sections: [
        {
          id: 'sec_about_header',
          semanticRole: 'HEADER',
          variant: 'header_prestige_sticky_01',
          order: 0,
          behavior: { isCollapsible: false, isDeletable: false, isMovable: false, supportsDuplicate: false },
          layout: { containerWidth: 'FULL_BLEED', verticalPadding: 'COMPACT', backgroundMode: 'SOLID' },
          defaultContent: {},
        },
        {
          id: 'sec_about_story',
          semanticRole: 'ABOUT_STORY',
          variant: 'about_editorial_prestige_01',
          order: 1,
          behavior: { isCollapsible: true, isDeletable: true, isMovable: true, supportsDuplicate: false },
          layout: { containerWidth: 'NARROW_READING', verticalPadding: 'EXPANSIVE', backgroundMode: 'SOLID' },
          bindings: [
            {
              bindingId: 'b_about_desc',
              semanticRole: 'ABOUT_PARAGRAPH',
              targetNodeId: 'node_about_text',
              source: { entity: 'BUSINESS_PROFILE', fieldPath: 'store.description' },
              contentType: 'TEXT_RICH',
              isRequired: true,
              fallback: {
                action: 'USE_DESIGNER_PLACEHOLDER',
                placeholderValue: 'Fondée sur l’exigence de la qualité et du respect des traditions, notre maison s’engage à vous fournir des créations exceptionnelles.',
              },
            },
          ],
          defaultContent: {
            title: 'Notre Savoir-Faire',
            subtitle: 'Excellence & Engagement',
          },
        },
        {
          id: 'sec_about_footer',
          semanticRole: 'FOOTER',
          variant: 'footer_prestige_minimal_01',
          order: 2,
          behavior: { isCollapsible: false, isDeletable: false, isMovable: false, supportsDuplicate: false },
          layout: { containerWidth: 'FULL_BLEED', verticalPadding: 'COMPACT', backgroundMode: 'SOLID' },
          defaultContent: {},
        },
      ],
    },
    contact: {
      id: 'contact',
      title: 'Contact & Accès',
      navLabel: 'Contact',
      slug: 'contact',
      role: 'CONTACT',
      isRequired: true,
      navOrder: 3,
      navVisible: true,
      seo: {
        titleTemplate: 'Nous Contacter - {{store.name}} à {{store.city}}',
        descriptionTemplate: 'Prenez contact directement sur WhatsApp ou visitez notre boutique à {{store.city}}.',
      },
      sections: [
        {
          id: 'sec_cnt_header',
          semanticRole: 'HEADER',
          variant: 'header_prestige_sticky_01',
          order: 0,
          behavior: { isCollapsible: false, isDeletable: false, isMovable: false, supportsDuplicate: false },
          layout: { containerWidth: 'FULL_BLEED', verticalPadding: 'COMPACT', backgroundMode: 'SOLID' },
          defaultContent: {},
        },
        {
          id: 'sec_cnt_block',
          semanticRole: 'CONTACT_BLOCK',
          variant: 'contact_prestige_cards_01',
          order: 1,
          behavior: { isCollapsible: false, isDeletable: false, isMovable: false, supportsDuplicate: false },
          layout: { containerWidth: 'NARROW_READING', verticalPadding: 'GENEROUS', backgroundMode: 'SOLID' },
          bindings: [
            {
              bindingId: 'b_cnt_phone',
              semanticRole: 'CONTACT_BLOCK',
              targetNodeId: 'node_cnt_phone',
              source: { entity: 'BUSINESS_PROFILE', fieldPath: 'store.whatsapp' },
              contentType: 'PHONE_WHATSAPP',
              isRequired: true,
              fallback: { action: 'USE_DESIGNER_PLACEHOLDER', placeholderValue: '237674151728' },
            },
            {
              bindingId: 'b_cnt_city',
              semanticRole: 'CONTACT_BLOCK',
              targetNodeId: 'node_cnt_city',
              source: { entity: 'BUSINESS_PROFILE', fieldPath: 'store.city' },
              contentType: 'STRING',
              isRequired: true,
              fallback: { action: 'USE_DESIGNER_PLACEHOLDER', placeholderValue: 'Douala, Cameroun' },
            },
          ],
          defaultContent: {
            title: 'Nous Contacter',
            subtitle: 'Notre équipe est à votre écoute sur WhatsApp',
          },
        },
        {
          id: 'sec_cnt_footer',
          semanticRole: 'FOOTER',
          variant: 'footer_prestige_minimal_01',
          order: 2,
          behavior: { isCollapsible: false, isDeletable: false, isMovable: false, supportsDuplicate: false },
          layout: { containerWidth: 'FULL_BLEED', verticalPadding: 'COMPACT', backgroundMode: 'SOLID' },
          defaultContent: {},
        },
      ],
    },
  },
};
