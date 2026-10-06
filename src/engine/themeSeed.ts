/**
 * VesTyle — ThemeSeed Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Système de signature numérique visuelle pour les boutiques VesTyle.
 *
 * Un ThemeSeed est un code court et lisible (ex: VST-BP01-CLR04-F02-VA) qui
 * encode la recette visuelle exacte d'une boutique, permettant :
 *   - La reproduction instantanée d'un thème par un autre marchand
 *   - Le partage et la découverte de styles via catalogue
 *   - Le versionnage immuable de l'identité visuelle d'une boutique
 *
 * Architecture :
 *   generateSeed()  → Encode la recette → Seed Code string
 *   decodeSeed()    → Décode le Seed Code → ThemeSeedConfig
 */

import { z } from 'zod';
import type { Theme } from '@/types/storefront';

// ── 1. CATALOGUE DES PALETTES DE COULEURS ─────────────────────────────────────

export const COLOR_TOKEN_CATALOG: Record<string, {
  label: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  bgColorDark: string;
  textColor: string;
  textColorDark: string;
  borderColor: string;
  borderColorDark: string;
  textMutedColor: string;
}> = {
  CLR01: {
    label: 'Emerald Luxury',
    primaryColor: '#128C7E',
    accentColor: '#25D366',
    bgColor: '#FFFFFF',
    bgColorDark: '#0B0F19',
    textColor: '#0F172A',
    textColorDark: '#F8FAFC',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderColorDark: 'rgba(255, 255, 255, 0.09)',
    textMutedColor: '#64748B',
  },
  CLR02: {
    label: 'Gold Dark',
    primaryColor: '#C89B3C',
    accentColor: '#FFD700',
    bgColor: '#FAFAF7',
    bgColorDark: '#0A0A0A',
    textColor: '#1A0F00',
    textColorDark: '#F5F5DC',
    borderColor: 'rgba(200, 155, 60, 0.15)',
    borderColorDark: 'rgba(200, 155, 60, 0.20)',
    textMutedColor: '#8B7355',
  },
  CLR03: {
    label: 'Pink Glow',
    primaryColor: '#E91E8C',
    accentColor: '#FFD1E8',
    bgColor: '#FFF5F8',
    bgColorDark: '#2D0E1F',
    textColor: '#2D0E1F',
    textColorDark: '#FFE4F0',
    borderColor: 'rgba(233, 30, 140, 0.12)',
    borderColorDark: 'rgba(233, 30, 140, 0.25)',
    textMutedColor: '#9B5E7A',
  },
  CLR04: {
    label: 'Tech Violet',
    primaryColor: '#7C3AED',
    accentColor: '#A78BFA',
    bgColor: '#FAFAFA',
    bgColorDark: '#06020F',
    textColor: '#1E1B4B',
    textColorDark: '#E2D9F3',
    borderColor: 'rgba(124, 58, 237, 0.10)',
    borderColorDark: 'rgba(124, 58, 237, 0.20)',
    textMutedColor: '#6D28D9',
  },
  CLR05: {
    label: 'Terracotta Warm',
    primaryColor: '#E8421A',
    accentColor: '#FFB547',
    bgColor: '#FAFAF7',
    bgColorDark: '#1A0A00',
    textColor: '#1A0A00',
    textColorDark: '#FEF3E2',
    borderColor: 'rgba(232, 66, 26, 0.10)',
    borderColorDark: 'rgba(232, 66, 26, 0.20)',
    textMutedColor: '#92400E',
  },
  CLR06: {
    label: 'Clean Blue',
    primaryColor: '#2563EB',
    accentColor: '#38BDF8',
    bgColor: '#FFFFFF',
    bgColorDark: '#0F172A',
    textColor: '#0F172A',
    textColorDark: '#F1F5F9',
    borderColor: 'rgba(37, 99, 235, 0.10)',
    borderColorDark: 'rgba(37, 99, 235, 0.15)',
    textMutedColor: '#64748B',
  },
  CLR07: {
    label: 'Champagne Or',
    primaryColor: '#D4AF37',
    accentColor: '#F3E5AB',
    bgColor: '#FDFBF5',
    bgColorDark: '#0A0A0A',
    textColor: '#2D2416',
    textColorDark: '#FAF7F2',
    borderColor: 'rgba(212, 175, 55, 0.15)',
    borderColorDark: 'rgba(212, 175, 55, 0.20)',
    textMutedColor: '#A89F91',
  },
  CLR08: {
    label: 'Forest Green',
    primaryColor: '#16A34A',
    accentColor: '#4ADE80',
    bgColor: '#F0FDF4',
    bgColorDark: '#052E16',
    textColor: '#14532D',
    textColorDark: '#DCFCE7',
    borderColor: 'rgba(22, 163, 74, 0.12)',
    borderColorDark: 'rgba(22, 163, 74, 0.20)',
    textMutedColor: '#4B7A5E',
  },
};

// ── 2. CATALOGUE DES FAMILLES DE POLICES ──────────────────────────────────────

export const FONT_SET_CATALOG: Record<string, {
  label: string;
  font: string;
  headingFont: string;
}> = {
  F01: { label: 'Inter Modern',       font: 'Inter',           headingFont: 'Inter' },
  F02: { label: 'Playfair Elegance',  font: 'Inter',           headingFont: 'Playfair Display' },
  F03: { label: 'Poppins Clean',      font: 'Poppins',         headingFont: 'Poppins' },
  F04: { label: 'Montserrat Bold',    font: 'Montserrat',      headingFont: 'Montserrat' },
  F05: { label: 'Raleway Slim',       font: 'Raleway',         headingFont: 'Raleway' },
  F06: { label: 'Lato Natural',       font: 'Lato',            headingFont: 'Lato' },
  F07: { label: 'DM Sans Pro',        font: 'DM Sans',         headingFont: 'DM Sans' },
  F08: { label: 'Outfit Future',      font: 'Outfit',          headingFont: 'Outfit' },
};

// ── 3. CATALOGUE DES VARIANTES DE MISE EN PAGE ────────────────────────────────

export const LAYOUT_VARIANT_CATALOG: Record<string, {
  label: string;
  borderRadius: 'sharp' | 'smooth' | 'full' | 'pill';
  shadowStyle: string;
  cardStyle: string;
}> = {
  VA: { label: 'Sharp & Bold',      borderRadius: 'sharp',  shadowStyle: 'strong',  cardStyle: 'elevated' },
  VB: { label: 'Smooth & Modern',   borderRadius: 'smooth', shadowStyle: 'soft',    cardStyle: 'elevated' },
  VC: { label: 'Round & Friendly',  borderRadius: 'full',   shadowStyle: 'soft',    cardStyle: 'glassmorphism' },
  VD: { label: 'Pill & Playful',    borderRadius: 'pill',   shadowStyle: 'glow',    cardStyle: 'glassmorphism' },
  VE: { label: 'Flat & Minimal',    borderRadius: 'smooth', shadowStyle: 'none',    cardStyle: 'flat' },
  VF: { label: 'Bordered Classic',  borderRadius: 'smooth', shadowStyle: 'subtle',  cardStyle: 'bordered' },
};

// ── 4. SCHÉMA ZODE DE CONFIGURATION D'UN SEED ────────────────────────────────

export const ThemeSeedConfigSchema = z.object({
  seedCode: z.string().min(6),
  blueprintId: z.string().min(1),
  colorTokenId: z.string().regex(/^CLR\d{2}$/, 'Format CLRxx attendu'),
  fontSetId: z.string().regex(/^F\d{2}$/, 'Format Fxx attendu'),
  layoutVariant: z.string().regex(/^V[A-F]$/, 'Format V[A-F] attendu'),
  isDark: z.boolean().default(false),
  // Tokens résolus (calculés au décodage)
  resolvedTheme: z.object({
    primaryColor: z.string(),
    accentColor: z.string(),
    bgColor: z.string(),
    textColor: z.string(),
    textMutedColor: z.string(),
    borderColor: z.string(),
    font: z.string(),
    headingFont: z.string(),
    borderRadius: z.enum(['sharp', 'smooth', 'full', 'pill']),
  }),
});

export type ThemeSeedConfig = z.infer<typeof ThemeSeedConfigSchema>;

// ── 5. SEED FALLBACK PAR DÉFAUT ───────────────────────────────────────────────

export const FALLBACK_SEED_CONFIG: ThemeSeedConfig = {
  seedCode: 'VST-DEFAULT-CLR01-F01-VB',
  blueprintId: 'DEFAULT',
  colorTokenId: 'CLR01',
  fontSetId: 'F01',
  layoutVariant: 'VB',
  isDark: false,
  resolvedTheme: {
    primaryColor: '#128C7E',
    accentColor: '#25D366',
    bgColor: '#FFFFFF',
    textColor: '#0F172A',
    textMutedColor: '#64748B',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    font: 'Inter',
    headingFont: 'Inter',
    borderRadius: 'smooth',
  },
};

// ── 6. PARSEUR INTERNE DU CODE SEED ──────────────────────────────────────────

const SEED_REGEX = /^VST-([A-Z0-9]+)-(CLR\d{2})-(F\d{2})-(V[A-F])(?:-(DARK))?$/i;

// ── 7. generateSeed ───────────────────────────────────────────────────────────

/**
 * Génère un code Seed canonique lisible et unique.
 *
 * Format : VST-{BLUEPRINT_ID}-{COLOR_TOKEN_ID}-{FONT_SET_ID}-{LAYOUT_VARIANT}[-DARK]
 * Exemple : VST-BP01-CLR04-F02-VA
 *           VST-BP03-CLR07-F02-VB-DARK
 *
 * @param blueprintId   - ID du blueprint maître (ex: 'BP01', 'HYBRID_01')
 * @param colorTokenId  - ID de la palette (ex: 'CLR04')
 * @param fontSetId     - ID de la famille de polices (ex: 'F02')
 * @param layoutVariant - ID de la variante de mise en page (ex: 'VA')
 * @param isDark        - Mode sombre (suffix -DARK si true)
 * @returns             Seed code string canonique
 */
export function generateSeed(
  blueprintId: string,
  colorTokenId: string,
  fontSetId: string,
  layoutVariant: string,
  isDark: boolean = false,
): string {
  const bpClean = blueprintId.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 16);
  const clrId = colorTokenId.toUpperCase();
  const fId = fontSetId.toUpperCase();
  const vId = layoutVariant.toUpperCase();

  if (!COLOR_TOKEN_CATALOG[clrId]) {
    console.warn(`[ThemeSeed] colorTokenId "${clrId}" inconnu. CLR01 utilisé.`);
  }
  if (!FONT_SET_CATALOG[fId]) {
    console.warn(`[ThemeSeed] fontSetId "${fId}" inconnu. F01 utilisé.`);
  }
  if (!LAYOUT_VARIANT_CATALOG[vId]) {
    console.warn(`[ThemeSeed] layoutVariant "${vId}" inconnu. VB utilisé.`);
  }

  const parts = ['VST', bpClean, clrId, fId, vId];
  if (isDark) parts.push('DARK');
  return parts.join('-');
}

// ── 8. decodeSeed ─────────────────────────────────────────────────────────────

/**
 * Décode un code Seed en configuration de thème complète et validée.
 *
 * En cas de code malformé ou tronqué, retourne le FALLBACK_SEED_CONFIG
 * sans jamais lever d'exception, garantissant un rendu toujours disponible.
 *
 * @param seedCode - Le code Seed à décoder (ex: 'VST-BP01-CLR04-F02-VA')
 * @returns ThemeSeedConfig avec tokens résolus
 */
export function decodeSeed(seedCode: string): ThemeSeedConfig {
  if (!seedCode || typeof seedCode !== 'string') {
    console.warn('[ThemeSeed] decodeSeed : seedCode invalide. Fallback utilisé.');
    return { ...FALLBACK_SEED_CONFIG };
  }

  const match = seedCode.trim().toUpperCase().match(SEED_REGEX);
  if (!match) {
    console.warn(`[ThemeSeed] Format de seed non reconnu : "${seedCode}". Fallback utilisé.`);
    return { ...FALLBACK_SEED_CONFIG, seedCode };
  }

  const [, blueprintId, colorTokenId, fontSetId, layoutVariant, darkFlag] = match;
  const isDark = darkFlag === 'DARK';

  const colorDef = COLOR_TOKEN_CATALOG[colorTokenId] || COLOR_TOKEN_CATALOG['CLR01'];
  const fontDef  = FONT_SET_CATALOG[fontSetId]       || FONT_SET_CATALOG['F01'];
  const layoutDef = LAYOUT_VARIANT_CATALOG[layoutVariant] || LAYOUT_VARIANT_CATALOG['VB'];

  const rawConfig = {
    seedCode,
    blueprintId,
    colorTokenId: COLOR_TOKEN_CATALOG[colorTokenId] ? colorTokenId : 'CLR01',
    fontSetId: FONT_SET_CATALOG[fontSetId] ? fontSetId : 'F01',
    layoutVariant: LAYOUT_VARIANT_CATALOG[layoutVariant] ? layoutVariant : 'VB',
    isDark,
    resolvedTheme: {
      primaryColor:   colorDef.primaryColor,
      accentColor:    colorDef.accentColor,
      bgColor:        isDark ? colorDef.bgColorDark    : colorDef.bgColor,
      textColor:      isDark ? colorDef.textColorDark  : colorDef.textColor,
      textMutedColor: colorDef.textMutedColor,
      borderColor:    isDark ? colorDef.borderColorDark : colorDef.borderColor,
      font:           fontDef.font,
      headingFont:    fontDef.headingFont,
      borderRadius:   layoutDef.borderRadius,
    },
  };

  const parsed = ThemeSeedConfigSchema.safeParse(rawConfig);
  if (!parsed.success) {
    console.error('[ThemeSeed] Validation Zod échouée :', parsed.error.flatten());
    return { ...FALLBACK_SEED_CONFIG, seedCode };
  }

  return parsed.data;
}

// ── 9. toTheme ────────────────────────────────────────────────────────────────

/**
 * Convertit un ThemeSeedConfig en objet Theme complet consommable
 * directement par StorefrontConfigSchema et UniversalStorefrontRenderer.
 */
export function seedToTheme(seedConfig: ThemeSeedConfig): Theme {
  const rt = seedConfig.resolvedTheme;
  return {
    mode:           seedConfig.isDark ? 'dark' : 'light',
    isDark:         seedConfig.isDark,
    primaryColor:   rt.primaryColor,
    accentColor:    rt.accentColor,
    bgColor:        rt.bgColor,
    textColor:      rt.textColor,
    textMutedColor: rt.textMutedColor,
    borderColor:    rt.borderColor,
    font:           rt.font,
    headingFont:    rt.headingFont,
    borderRadius:   rt.borderRadius,
    customCss:      '',
  };
}

