/**
 * VesTyle — Blueprint Injector Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Module d'injection déterministe : transforme un payload IA brut (métadonnées
 * métier + seed thème + sections contenu) en un StorefrontConfig complet,
 * validé par Zod et directement consommable par UniversalStorefrontRenderer.
 *
 * Architecture :
 *   inject(payload)  → Résout le seed → Assemble le config → Valide Zod → StorefrontConfig
 *   Si la validation échoue : retourne FALLBACK_STOREFRONT_CONFIG (jamais d'écran blanc)
 *
 * Intégration :
 *   - Consomme : ThemeSeed engine (decodeSeed, seedToTheme)
 *   - Produit  : StorefrontConfig → UniversalStorefrontRenderer + SectionRegistry
 */

import {
  StorefrontConfigSchema,
  StorefrontMetadataSchema,
  SectionSchema,
  BusinessTypeSchema,
  type StorefrontConfig,
  type StorefrontMetadata,
  type Section,
  type Theme,
  BUSINESS_TYPE_FALLBACK,
} from '@/types/storefront';

import {
  decodeSeed,
  seedToTheme,
  generateSeed,
  FALLBACK_SEED_CONFIG,
  type ThemeSeedConfig,
} from './themeSeed';

import {
  MasterBlueprintRegistry,
  type MasterBlueprint,
} from './masterBlueprints';

import {
  selectOptimalBlueprint,
} from './blueprintSelector';

// ── 1. TYPES DU PAYLOAD D'INJECTION ───────────────────────────────────────────

/**
 * Métadonnées métier passées au BlueprintInjector.
 * Compatible avec les formats IA, legacy et saisis manuellement.
 */
export interface BusinessMeta {
  /** Identifiant unique du store (généré si absent) */
  storeId?: string;
  /** Nom commercial de la boutique */
  storeName: string;
  /** Type d'activité — utilisé pour sélectionner les sections appropriées */
  businessType?: string;
  /** Ville (par défaut: Douala) */
  city?: string;
  /** Secteur d'activité (ex: 'fashion', 'livestock', 'services') */
  sector?: string;
  /** Slogan court */
  slogan?: string;
  /** Numéro WhatsApp */
  whatsapp?: string;
  /** Téléphone */
  phone?: string;
  /** Email */
  email?: string;
  /** Adresse physique */
  address?: string;
  /** Description de la boutique */
  description?: string;
  /** URL du logo */
  logoUrl?: string;
  /** URL de la cover */
  coverUrl?: string;
  /** Devise (par défaut: FCFA) */
  currency?: string;
  /** Liens réseaux sociaux */
  socialLinks?: Record<string, string>;
  /** Données additionnelles */
  [key: string]: unknown;
}

/**
 * Définition d'une section de contenu dans le payload IA.
 * Format permissif pour absorber les outputs IA variés.
 */
export interface SectionPayload {
  /** Identifiant de la section (généré si absent) */
  id?: string;
  /** Type de section : HERO, SERVICES, PRODUCT, CONTACT, etc. */
  type: string;
  /** Variante de rendu (ex: 'hero_001', 'services_grid') */
  variant?: string;
  /** Ordre d'affichage */
  order?: number;
  /** Contenu libre de la section (textes, offres, produits...) */
  content?: Record<string, unknown>;
  /** Styles locaux optionnels */
  styles?: Record<string, unknown>;
  /** Si false, la section est cachée */
  visible?: boolean;
}

/**
 * Payload complet fourni au BlueprintInjector par l'IA ou le Studio.
 */
export interface InjectionPayload {
  /** Métadonnées de l'entreprise */
  businessMeta: BusinessMeta;
  /**
   * Source du thème : soit un seedCode string (ex: 'VST-BP01-CLR04-F02-VA'),
   * soit un ThemeSeedConfig déjà résolu.
   * Si absent, le thème FALLBACK est utilisé.
   */
  themeSeed?: string | ThemeSeedConfig;
  /** Sections de contenu à injecter dans la vitrine */
  sections?: SectionPayload[];
  /** Version du payload (pour migration future) */
  version?: string;
}

// ── 2. CONSTANTES FALLBACK ─────────────────────────────────────────────────────

/**
 * Configuration de vitrine de secours : rendu toujours garanti,
 * même si le payload est entièrement corrompu.
 */
export const FALLBACK_STOREFRONT_CONFIG: StorefrontConfig = {
  id: 'store_fallback_vestyle',
  name: 'Boutique VesTyle',
  version: '2.0.0',
  metadata: {
    city: 'Douala',
    sector: 'general',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    currency: 'FCFA',
    currencySymbol: 'FCFA',
    slogan: 'Votre boutique en ligne',
    logoUrl: '',
    coverUrl: '',
    description: 'Boutique créée avec VesTyle.',
    businessType: 'PHYSICAL_PRODUCT',
    socialLinks: {},
  },
  theme: seedToTheme(FALLBACK_SEED_CONFIG),
  sections: [
    {
      id: 'fallback_hero_01',
      type: 'HERO',
      variant: 'hero_001',
      visible: true,
      order: 0,
      styles: {},
      content: {
        title: 'Bienvenue dans notre boutique',
        subtitle: 'Découvrez nos produits et services à Douala.',
        ctaText: 'Contactez-nous sur WhatsApp',
      },
    },
    {
      id: 'fallback_contact_01',
      type: 'CONTACT',
      variant: 'contact_card',
      visible: true,
      order: 1,
      styles: {},
      content: {
        title: 'Nous contacter',
        showWhatsapp: true,
      },
    },
    {
      id: 'fallback_footer_01',
      type: 'FOOTER',
      variant: 'footer_minimal',
      visible: true,
      order: 2,
      styles: {},
      content: { showCopyright: true },
    },
  ],
  pages: [],
};

// ── 3. SECTIONS PAR DÉFAUT PAR MASTER BLUEPRINT ───────────────────────────────

/**
 * Génère la séquence de sections canoniques adaptée au type d'activité
 * en instanciant le Master Blueprint optimal correspondant.
 */
function getDefaultSections(
  businessType: string,
  businessMeta?: BusinessMeta,
  seedBlueprintId?: string,
): SectionPayload[] {
  // 1. Si un ID de blueprint explicite est fourni (ex: depuis ThemeSeed), l'utiliser en priorité
  let blueprint: MasterBlueprint | undefined;
  if (seedBlueprintId) {
    blueprint = MasterBlueprintRegistry.get(seedBlueprintId);
  }

  // 2. Sinon, résolution intelligente via blueprintSelector
  if (!blueprint) {
    blueprint = selectOptimalBlueprint(businessType, businessMeta);
  }

  // 3. Instanciation des sections canoniques avec injection du contexte métier
  if (blueprint) {
    return MasterBlueprintRegistry.instantiateSections(
      blueprint,
      businessMeta || { storeName: 'Boutique VesTyle', businessType },
    );
  }

  // 4. Fallback ultime
  return [
    { type: 'HEADER', variant: 'header_001', order: 0, visible: true, content: { isSticky: true } },
    { type: 'HERO', variant: 'hero_001', order: 1, visible: true, content: { title: 'Bienvenue', ctaText: 'Commander sur WhatsApp' } },
    { type: 'CONTACT', variant: 'contact_card', order: 2, visible: true, content: { showWhatsapp: true } },
    { type: 'FOOTER', variant: 'footer_minimal', order: 3, visible: true, content: { showCopyright: true } },
  ];
}

// ── 4. RÉSOLUTION DU THÈME ─────────────────────────────────────────────────────

/**
 * Résout le thème depuis un seedCode string, un ThemeSeedConfig ou un Master Blueprint.
 * Retourne le thème du FALLBACK_SEED_CONFIG si tout échoue.
 */
function resolveTheme(
  themeSeed?: string | ThemeSeedConfig,
  optimalBlueprint?: MasterBlueprint,
): Theme {
  if (!themeSeed) {
    const defaultSeed = optimalBlueprint?.recommendedThemeSeed || FALLBACK_SEED_CONFIG.seedCode;
    const decoded = decodeSeed(defaultSeed);
    return seedToTheme(decoded);
  }

  if (typeof themeSeed === 'string') {
    const decoded = decodeSeed(themeSeed);
    return seedToTheme(decoded);
  }

  if (typeof themeSeed === 'object' && 'resolvedTheme' in themeSeed) {
    return seedToTheme(themeSeed as ThemeSeedConfig);
  }

  console.warn('[BlueprintInjector] themeSeed non reconnu. Thème fallback utilisé.');
  return seedToTheme(FALLBACK_SEED_CONFIG);
}

// ── 5. NORMALISATION DES MÉTADONNÉES ──────────────────────────────────────────

function normalizeMetadata(
  meta: BusinessMeta,
): StorefrontMetadata {
  const btResult = BusinessTypeSchema.safeParse(
    (meta.businessType || '').toUpperCase(),
  );
  const businessType = btResult.success ? btResult.data : BUSINESS_TYPE_FALLBACK;

  return StorefrontMetadataSchema.parse({
    city:           meta.city?.trim() || 'Douala',
    sector:         meta.sector?.trim().toLowerCase() || 'general',
    phone:          meta.phone?.trim() || '',
    whatsapp:       meta.whatsapp?.trim() || meta.phone?.trim() || '',
    email:          meta.email?.trim() || '',
    address:        meta.address?.trim() || '',
    currency:       'FCFA',
    currencySymbol: 'FCFA',
    slogan:         meta.slogan?.trim() || '',
    logoUrl:        meta.logoUrl?.trim() || '',
    coverUrl:       meta.coverUrl?.trim() || '',
    description:    meta.description?.trim() || '',
    businessType,
    socialLinks:    meta.socialLinks || {},
  });
}

// ── 6. NORMALISATION DES SECTIONS ─────────────────────────────────────────────

function normalizeSections(
  rawSections: SectionPayload[],
  storeId: string,
): Section[] {
  return rawSections.map((s, idx) => {
    const type = (s?.type || 'HERO').toUpperCase();
    const id   = s?.id?.trim() || `${storeId}_sec_${type.toLowerCase()}_${idx + 1}`;

    const parsed = SectionSchema.safeParse({
      id,
      type,
      variant: s?.variant || 'default',
      visible: s?.visible !== false,
      order:   typeof s?.order === 'number' ? s.order : idx,
      styles:  s?.styles || {},
      content: s?.content || {},
    });

    if (parsed.success) return parsed.data;

    console.warn(`[BlueprintInjector] Section malformée idx=${idx} (type=${type}). Minimale utilisée.`, parsed.error.flatten());
    return {
      id,
      type,
      variant: 'default',
      visible: true,
      order: idx,
      styles: {},
      content: s?.content || {},
    } satisfies Section;
  });
}

// ── 7. INJECT — FONCTION PRINCIPALE ───────────────────────────────────────────

/**
 * Injecte un payload IA/Studio et retourne un StorefrontConfig complet et validé.
 *
 * Pipeline :
 *  1. Génération de l'ID unique
 *  2. Résolution du Master Blueprint optimal selon le BusinessType & Intent
 *  3. Résolution du thème (seed fourni OU recommendedThemeSeed du Blueprint)
 *  4. Normalisation des métadonnées métier
 *  5. Instanciation des sections (payload fourni OU sections canoniques du Blueprint)
 *  6. Assemblage du StorefrontConfig candidat
 *  7. Validation Zod stricte (safeParse)
 *  8. Si succès → retourne le config validé
 *  9. Si échec → log l'erreur + retourne FALLBACK_STOREFRONT_CONFIG (jamais d'écran blanc)
 *
 * @param payload - Payload d'injection fourni par l'IA ou le Studio VesTyle
 * @returns StorefrontConfig validé et prêt pour UniversalStorefrontRenderer
 */
export function inject(payload: InjectionPayload): StorefrontConfig {
  try {
    if (!payload || typeof payload !== 'object') {
      console.error('[BlueprintInjector] Payload null ou invalide. Fallback retourné.');
      return { ...FALLBACK_STOREFRONT_CONFIG };
    }

    const { businessMeta, themeSeed, sections: rawSections, version } = payload;

    if (!businessMeta || typeof businessMeta !== 'object') {
      console.error('[BlueprintInjector] businessMeta manquant. Fallback retourné.');
      return { ...FALLBACK_STOREFRONT_CONFIG };
    }

    // ── B. Génération de l'ID unique ──────────────────────────────────────────
    const storeName = (businessMeta.storeName || '').trim() || 'Boutique VesTyle';
    const storeId   = businessMeta.storeId?.trim()
      || `vst_${storeName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24)}_${Date.now().toString(36)}`;

    // ── C. Normalisation des métadonnées métier ──────────────────────────────
    const metadata = normalizeMetadata(businessMeta);

    // ── D. Résolution du Master Blueprint optimal ─────────────────────────────
    const optimalBlueprint = selectOptimalBlueprint(metadata.businessType, businessMeta);

    // Extraction éventuelle du blueprintId présent dans le seed
    let seedBlueprintId: string | undefined;
    if (typeof themeSeed === 'string') {
      const decoded = decodeSeed(themeSeed);
      if (decoded.blueprintId && decoded.blueprintId !== 'DEFAULT') {
        seedBlueprintId = decoded.blueprintId;
      }
    }

    // ── E. Résolution du thème ────────────────────────────────────────────────
    const theme = resolveTheme(themeSeed, optimalBlueprint);

    // ── F. Sections : payload fourni OU sections du Master Blueprint ──────────
    const sourceSections: SectionPayload[] =
      Array.isArray(rawSections) && rawSections.length > 0
        ? rawSections
        : getDefaultSections(metadata.businessType as string, businessMeta, seedBlueprintId);

    const sections = normalizeSections(sourceSections, storeId);

    // ── G. Assemblage du StorefrontConfig candidat ────────────────────────────
    const candidate = {
      id:        storeId,
      name:      storeName,
      metadata,
      theme,
      sections,
      pages:     [],
      version:   version || '2.0.0',
      updatedAt: new Date().toISOString(),
    };

    // ── H. Validation Zod stricte ─────────────────────────────────────────────
    const result = StorefrontConfigSchema.safeParse(candidate);

    if (result.success) {
      return result.data;
    }

    // ── I. Fallback sécurisé — jamais d'écran blanc ───────────────────────────
    console.error(
      '[BlueprintInjector] Validation Zod échouée. Erreurs :',
      result.error.flatten(),
    );

    return {
      ...FALLBACK_STOREFRONT_CONFIG,
      id:   storeId,
      name: storeName,
    };

  } catch (err) {
    console.error('[BlueprintInjector] Exception inattendue :', err);
    return { ...FALLBACK_STOREFRONT_CONFIG };
  }
}

// ── 8. HELPER — INJECT DEPUIS SEED CODE STRING ────────────────────────────────

/**
 * Raccourci : génère un seed et injecte directement depuis des IDs de tokens.
 *
 * @example
 * const config = injectFromSeed(
 *   { storeName: 'Maison Ebene', businessType: 'PHYSICAL_PRODUCT' },
 *   'BP01', 'CLR02', 'F03', 'VA'
 * );
 */
export function injectFromSeed(
  businessMeta: BusinessMeta,
  blueprintId: string,
  colorTokenId: string,
  fontSetId: string,
  layoutVariant: string,
  isDark = false,
  sections?: SectionPayload[],
): StorefrontConfig {
  const seedCode = generateSeed(blueprintId, colorTokenId, fontSetId, layoutVariant, isDark);
  return inject({ businessMeta, themeSeed: seedCode, sections });
}

