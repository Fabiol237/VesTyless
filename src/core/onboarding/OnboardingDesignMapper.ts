/**
 * VesTyle / Vestin — Onboarding → Design Mapper (Phase 2C)
 * ─────────────────────────────────────────────────────────────────────────────
 * Couche de mapping déterministe entre les réponses du tunnel d'Onboarding
 * marchand et le pipeline canonique Vestin v3.0 :
 *
 *   OnboardingPayload
 *     → BusinessProfile canonique
 *     → DesignId sélectionné (via LocalDesignRegistry)
 *     → MerchantAdaptationInput complet
 *     → VestinAdaptationEngine.adapt()
 *     → StorefrontConfig v3.0.0
 *
 * RÈGLES ABSOLUES :
 *   - Aucun appel à blueprintInjector / masterBlueprints pour une nouvelle boutique.
 *   - Mapping explicite BusinessType → DesignId, jamais implicite.
 *   - Fallback canonique déterministe si secteur inconnu (jamais silencieux).
 *   - Mistral n'intervient pas dans la structure du design.
 */

import type { BusinessType } from '@/types/storefront';
import type { MerchantAdaptationInput } from '@/core/adaptation/VestinAdaptationEngine';
import type { OnboardingPayload } from '@/types/onboarding';
import type { InitialItem } from '@/types/onboarding';

// ── 1. TABLE DE MAPPING BUSINESS TYPE → DESIGN ID ────────────────────────────

/** Types canoniques valides selon le schéma BusinessTypeSchema. */
const VALID_BUSINESS_TYPES: ReadonlySet<string> = new Set([
  'PHYSICAL_PRODUCT',
  'SERVICE',
  'HYBRID',
  'LIVESTOCK_PRODUCT',
  'RESTAURANT',
  'ARTISAN',
]);

/**
 * Normalise un businessType vers un type valide canonique.
 * Si le type passé n'est pas dans le schéma, retourne PHYSICAL_PRODUCT.
 */
export function normalizeBusinessType(raw: string | undefined): BusinessType {
  if (!raw || !VALID_BUSINESS_TYPES.has(raw)) {
    return 'PHYSICAL_PRODUCT';
  }
  return raw as BusinessType;
}

/**
 * Table de sélection déterministe.
 * Chaque BusinessType est mappé vers un DesignId canonique.
 * La priorité de chaque entrée garantit un ordre de fallback explicite.
 */
export const BUSINESS_TYPE_TO_DESIGN_ID: Record<BusinessType, string> = {
  PHYSICAL_PRODUCT:  'vst_dsn_prestige_atelier_001',   // Mode, vêtements, cosmétiques, artisanat
  SERVICE:           'vst_dsn_services_vip_003',        // Prestations, formations, RDV, conseil
  LIVESTOCK_PRODUCT: 'vst_dsn_agro_elevage_004',        // Élevage, bétail, agropastoral
  RESTAURANT:        'vst_dsn_resto_terroir_002',        // Restaurant, snack, traiteur, alimentation
  ARTISAN:           'vst_dsn_prestige_atelier_001',    // Artisan → Atelier Prestige (identité partagée)
  HYBRID:            'vst_dsn_commerce_librairie_006',  // Commerce hybride → Commerce/Librairie
} as const;

/**
 * Fallback canonique : design utilisé si aucune correspondance exacte n'est trouvée.
 * Ne doit JAMAIS pointer vers masterBlueprints.
 */
export const CANONICAL_FALLBACK_DESIGN_ID = 'vst_dsn_prestige_atelier_001';

// ── 2. SÉLECTION DU DESIGN ID ─────────────────────────────────────────────────

/**
 * Retourne le DesignId canonique correspondant au businessType.
 * Si le type est inconnu, utilise le fallback explicite.
 */
export function selectDesignIdForBusinessType(businessType: BusinessType | string | undefined): string {
  if (!businessType) {
    console.warn('[OnboardingDesignMapper] businessType manquant, utilisation du fallback canonique.');
    return CANONICAL_FALLBACK_DESIGN_ID;
  }

  const designId = BUSINESS_TYPE_TO_DESIGN_ID[businessType as BusinessType];

  if (!designId) {
    console.warn(
      `[OnboardingDesignMapper] BusinessType inconnu '${businessType}', fallback canonique → '${CANONICAL_FALLBACK_DESIGN_ID}'.`
    );
    return CANONICAL_FALLBACK_DESIGN_ID;
  }

  return designId;
}

// ── 3. MAPPING ONBOARDING PAYLOAD → BUSINESS PROFILE ─────────────────────────

/**
 * Normalise le numéro WhatsApp pour l'adaptation engine.
 * Supprime tous les caractères non numériques.
 */
function normalizeWhatsApp(raw: string | undefined): string {
  if (!raw) return '';
  return raw.replace(/\D/g, '');
}

/**
 * Construit l'adresse complète à partir du quartier et de la ville.
 */
function buildAddress(quarter: string | undefined, city: string | undefined): string {
  const c = (city || 'Douala').trim();
  const q = (quarter || '').trim();
  return q ? `${q}, ${c}` : c;
}

/**
 * Convertit un InitialItem d'onboarding vers le format produit de MerchantAdaptationInput.
 */
function mapInitialItemToProduct(item: InitialItem, index: number) {
  return {
    id: item.id || `prod_onb_${index + 1}`,
    name: item.name,
    price: item.price,
    priceFormatted: `${item.price.toLocaleString('fr-FR')} FCFA`,
    category: item.category || 'Général',
    description: item.description || '',
    image: item.imageUrl || '',
    tag: item.badge || (index === 0 ? 'VEDETTE' : undefined),
    metaInfo: item.unit ? `Unité : ${item.unit}` : undefined,
  };
}

// ── 4. CONSTRUCTEUR DE L'INPUT D'ADAPTATION ───────────────────────────────────

/**
 * Transforme le payload complet de l'onboarding en MerchantAdaptationInput
 * prêt pour VestinAdaptationEngine.adapt().
 *
 * MAPPING EXPLICITE :
 *   payload.storeName    → businessProfile.storeName
 *   payload.city         → businessProfile.city
 *   payload.whatsapp     → businessProfile.whatsapp / phone
 *   payload.businessType → businessProfile.businessType
 *   payload.activityText → businessProfile.description
 *   payload.slogan       → businessProfile.slogan
 *   payload.quarter      → businessProfile.address (combiné avec city)
 *   payload.initialItems → sellerContent.products
 *   (assets not yet collected in onboarding → logoUrl/bannerUrl laissés vides)
 */
export function buildMerchantAdaptationInput(
  payload: Partial<OnboardingPayload>
): MerchantAdaptationInput {
  const storeName    = (payload.storeName || '').trim() || 'Boutique VesTyle';
  const city         = (payload.city || 'Douala').trim();
  const whatsapp     = normalizeWhatsApp(payload.whatsapp);
  // Normalisation stricte : type inconnu → PHYSICAL_PRODUCT (jamais de valeur hors-schéma)
  const businessType = normalizeBusinessType(payload.businessType as string | undefined);
  const description  = (payload.activityText || '').trim() || `Boutique officielle ${storeName} à ${city}.`;
  const slogan       = (payload.slogan || '').trim() || buildDefaultSlogan(businessType, storeName);
  const address      = buildAddress(payload.quarter, city);

  const products = (payload.initialItems || []).map((item, i) =>
    mapInitialItemToProduct(item, i)
  );

  return {
    businessProfile: {
      storeName,
      city,
      whatsapp,
      phone: whatsapp,
      businessType,
      description,
      slogan,
      address,
    },
    sellerContent: {
      products,
      logoUrl:   '',  // Non collecté à l'onboarding v1
      bannerUrl: '',  // Non collecté à l'onboarding v1
    },
    aiCopywriting: {
      // Copie déterministe contextuelle — pas de LLM dans ce chemin
      heroTitle:    storeName,
      heroSubtitle: slogan,
      heroBadge:    buildHeroBadge(businessType),
      ctaText:      'Commander sur WhatsApp',
    },
    preferences: {
      customAccentColor: undefined, // Sera appliqué via setAccentColor si le marchand choisit une palette
    },
  };
}

// ── 5. HELPERS CONTEXTUELS ────────────────────────────────────────────────────

/**
 * Génère un slogan par défaut contextuel selon le type d'activité.
 * Utilisé uniquement si le vendeur n'en a pas saisi un.
 */
function buildDefaultSlogan(businessType: BusinessType, storeName: string): string {
  const slogans: Record<BusinessType, string> = {
    PHYSICAL_PRODUCT:  `Découvrez la collection ${storeName}`,
    SERVICE:           `Services professionnels d'excellence`,
    LIVESTOCK_PRODUCT: 'Élevage de qualité, garanti sur pied',
    RESTAURANT:        'La saveur africaine à votre table',
    ARTISAN:           `L'artisanat fait main par ${storeName}`,
    HYBRID:            'Votre boutique tout-en-un',
  };
  return slogans[businessType] ?? `Bienvenue chez ${storeName}`;
}

/**
 * Badge héro contextuel selon le secteur.
 */
function buildHeroBadge(businessType: BusinessType): string {
  const badges: Record<BusinessType, string> = {
    PHYSICAL_PRODUCT:  '🛍️ Livraison Douala & Yaoundé',
    SERVICE:           '📅 RDV & Devis Gratuits',
    LIVESTOCK_PRODUCT: '🐔 Élevage Certifié',
    RESTAURANT:        '🍽️ Livraison Express',
    ARTISAN:           '🎨 Fait Main & Sur Mesure',
    HYBRID:            '✨ Catalogue Complet',
  };
  return badges[businessType] ?? '⭐ Service de Qualité';
}

// ── 6. EXPORT DU RÉSULTAT COMPLET ─────────────────────────────────────────────

/**
 * Résultat complet du mapping onboarding.
 * Permet de tracer et auditer chaque décision de sélection.
 */
export interface OnboardingMappingResult {
  /** DesignId sélectionné de façon déterministe */
  designId: string;
  /** Input complet prêt pour VestinAdaptationEngine */
  adaptationInput: MerchantAdaptationInput;
  /** true si un fallback canonique a été utilisé */
  usedFallback: boolean;
  /** Raison du fallback si applicable */
  fallbackReason?: string;
}

/**
 * Point d'entrée unique du mapping Phase 2C.
 * Produit le designId et l'input d'adaptation à partir du payload d'onboarding.
 */
export function mapOnboardingToCanonicalDesign(
  payload: Partial<OnboardingPayload>
): OnboardingMappingResult {
  const businessType = payload.businessType;
  const knownTypes = Object.keys(BUSINESS_TYPE_TO_DESIGN_ID) as BusinessType[];
  const isKnown = !!businessType && knownTypes.includes(businessType as BusinessType);

  const designId = selectDesignIdForBusinessType(businessType);
  const adaptationInput = buildMerchantAdaptationInput(payload);

  return {
    designId,
    adaptationInput,
    usedFallback: !isKnown,
    fallbackReason: !isKnown
      ? `BusinessType '${businessType ?? 'undefined'}' non reconnu → fallback vers '${designId}'.`
      : undefined,
  };
}
