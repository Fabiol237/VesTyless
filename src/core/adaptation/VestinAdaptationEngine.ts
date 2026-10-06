/**
 * VesTyle / Vestin — Adaptation Engine (v3.0)
 * ─────────────────────────────────────────────────────────────────────────────
 * Moteur d'adaptation déterministe au cœur de l'architecture unifiée.
 * Fusionne un DesignDefinition canonique avec les données réelles du marchand
 * et le copywriting contextuel Mistral pour produire un StorefrontConfig
 * prêt pour le rendu et la persistance.
 */

import type { DesignDefinition, SectionDefinition, ContentBindingRule2 } from '../contracts/designDefinition';
import type { BusinessType, StorefrontConfig, Section, StorefrontPage } from '@/types/storefront';
import { validateStorefrontConfig } from '@/types/storefront';

export interface MerchantAdaptationInput {
  businessProfile: {
    storeName: string;
    city?: string;
    whatsapp?: string;
    phone?: string;
    businessType?: BusinessType;
    description?: string;
    slogan?: string;
    address?: string;
  };
  sellerContent: {
    products?: Array<{
      id?: string;
      name: string;
      price: number;
      priceFormatted?: string;
      category?: string;
      image?: string;
      tag?: string;
      metaInfo?: string;
      description?: string;
    }>;
    logoUrl?: string;
    bannerUrl?: string;
  };
  aiCopywriting?: {
    heroTitle?: string;
    heroSubtitle?: string;
    heroBadge?: string;
    ctaText?: string;
    trustBadgeText?: string;
    whatsappOrderPrefix?: string;
  };
  preferences?: {
    customAccentColor?: string;
  };
}


export interface SiteDraftInput {
  name: string;
  city?: string;
  phone?: string;
  whatsapp?: string;
  description?: string;
  domain?: string;
  category?: string;
  designId?: string;
  designDefinition: DesignDefinition;
}

export class VestinAdaptationEngine {
  /**
   * Convenience wrapper: construit un StorefrontConfig de draft à partir
   * d'un objet plat issu du tunnel de création (creer-mon-site).
   */
  public static synthesizeSiteDraft(input: SiteDraftInput): StorefrontConfig {
    const { name, city, phone, whatsapp, description, designId, designDefinition } = input;
    return VestinAdaptationEngine.adapt(
      designDefinition,
      {
        businessProfile: {
          storeName: name,
          city: city || 'Douala',
          phone: phone || '',
          whatsapp: whatsapp || phone || '',
          description: description || '',
        },
        sellerContent: {},
      },
      designId || `draft_${Date.now()}`
    );
  }

  /**
   * Adapte déterministement un DesignDefinition aux données réelles d'un marchand.
   */
  public static adapt(
    design: DesignDefinition,
    input: MerchantAdaptationInput,
    storeId: string = `store_${Date.now()}`
  ): StorefrontConfig {
    const bp = input.businessProfile;
    const sc = input.sellerContent;
    const ai = input.aiCopywriting || {};
    const storeName = (bp.storeName || 'Boutique VesTyle').trim();
    const city = (bp.city || 'Douala').trim();
    const cleanWhatsApp = (bp.whatsapp || '237674151728').replace(/\D/g, '');
    const businessType = bp.businessType || 'PHYSICAL_PRODUCT';

    // ── 1. COMPILATION DES DESIGN TOKENS DU THÈME (StyleSystem) ──
    const isDark = design.styleSystem.palette.isDark;
    const primaryColor = design.styleSystem.palette.primary;
    // La couleur d'accent peut être ajustée si le niveau de liberté est CONTROLLED
    const accentColor = input.preferences?.customAccentColor || design.styleSystem.palette.accent;
    const bgColor = design.styleSystem.palette.background;
    const textColor = design.styleSystem.palette.textPrimary;
    const textMutedColor = design.styleSystem.palette.textMuted;
    const font = design.styleSystem.typography.fontFamilyBody;
    const headingFont = design.styleSystem.typography.fontFamilyHeading;
    const borderRadius = design.styleSystem.spatial.borderRadius.toLowerCase();

    // ── 2. COMPILATION ET RÉSOLUTION DES PAGES & SECTIONS ──
    const compiledPages: StorefrontPage[] = [];

    for (const [pageKey, pageDef] of Object.entries(design.pages)) {
      const compiledSections: Section[] = [];

      // Tri des sections par ordre
      const sortedSections = [...pageDef.sections].sort((a, b) => (a.order || 0) - (b.order || 0));

      for (const secDef of sortedSections) {
        const resolvedContent: Record<string, unknown> = { ...secDef.defaultContent };

        // Résolution de chaque règle de binding 2.0
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
              // Injection dans le content résolu selon le rôle sémantique
              this.injectResolvedValue(resolvedContent, rule.semanticRole, resolvedValue);
            }
          }
        }

        // Section canonique prête
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

    // Sections de la page d'accueil à la racine pour compatibilité ascendante
    const homePage = compiledPages.find((p) => p.isHome) || compiledPages[0];
    const rootSections = homePage ? homePage.sections : [];

    // ── 3. CONSTRUCTION DU STOREFRONT CONFIG CONFORME À 100% ──
    const rawConfig: StorefrontConfig = {
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

  /**
   * Résout la valeur brute d'un binding selon sa source et applique les transformations.
   */
  private static resolveBindingValue(
    rule: ContentBindingRule2,
    context: {
      storeName: string;
      city: string;
      whatsapp: string;
      businessType: string;
      description: string;
      slogan: string;
      products: any[];
      logoUrl: string;
      bannerUrl: string;
      ai: Record<string, any>;
    }
  ): unknown {
    let rawValue: unknown = undefined;

    // 1. Extraction selon la source
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
        if (rule.source.fieldPath === 'seller.products') {
          rawValue = context.products;
        } else if (rule.source.fieldPath === 'seller.logoUrl') {
          rawValue = context.logoUrl;
        } else if (rule.source.fieldPath === 'seller.bannerUrl') {
          rawValue = context.bannerUrl;
        }
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

    // 2. Fallback si valeur vide
    if (rawValue === undefined || rawValue === null || rawValue === '' || (Array.isArray(rawValue) && rawValue.length === 0)) {
      if (rule.fallback.action === 'USE_DESIGNER_PLACEHOLDER') {
        rawValue = rule.fallback.placeholderValue;
      } else if (rule.fallback.action === 'HIDE_NODE_COMPLETELY') {
        return null;
      }
    }

    // 3. Application des pipes de transformation
    if (rule.transformationPipe && typeof rawValue === 'string') {
      for (const pipe of rule.transformationPipe) {
        if (pipe === 'NORMALIZE_CAMEROON_PHONE') {
          rawValue = rawValue.replace(/\D/g, '');
        } else if (pipe === 'UPPERCASE_FIRST') {
          rawValue = rawValue.charAt(0).toUpperCase() + rawValue.slice(1);
        }
      }
    }

    // 4. Application des limites de texte
    if (rule.textLimits && typeof rawValue === 'string' && rawValue.length > rule.textLimits.maxCharacters) {
      if (rule.textLimits.overflowBehavior === 'ELLIPSIS') {
        rawValue = rawValue.slice(0, rule.textLimits.maxCharacters - 3) + '...';
      }
    }

    // 5. Application de la cardinalité sur les listes
    if (rule.cardinality && Array.isArray(rawValue)) {
      const max = rule.cardinality.maxItems;
      rawValue = rawValue.slice(0, max);
    }

    return rawValue;
  }

  /**
   * Injecte la valeur résolue dans le conteneur de contenu de la section.
   */
  private static injectResolvedValue(
    content: Record<string, unknown>,
    semanticRole: string,
    value: unknown
  ): void {
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
