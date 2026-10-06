/**
 * VesTyle — Onboarding Contract & Zod Schemas
 * ─────────────────────────────────────────────────────────────────────────────
 * Contrat de données TypeScript & Zod pour le tunnel d'Onboarding marchand.
 */

import { z } from 'zod';
import { BusinessTypeSchema, type BusinessType } from './storefront';

// ── 1. VILLES ET QUARTIERS PRINCIPAUX DU CAMEROUN ─────────────────────────────

export const CAMEROON_CITIES = [
  'Douala',
  'Yaoundé',
  'Bafoussam',
  'Bamenda',
  'Garoua',
  'Maroua',
  'Kribi',
  'Limbe',
  'Buea',
  'Ngaoundéré',
  'Bertoua',
  'Ebolowa',
  'Dschang',
  'Foumban',
  'Edéa',
] as const;

export const MAIN_QUARTERS_BY_CITY: Record<string, string[]> = {
  Douala: [
    'Akwa',
    'Bonanjo',
    'Bonapriso',
    'Deido',
    'Bali',
    'Makepe',
    'Bonamoussadi',
    'Kotto',
    'Logpom',
    'Yassa',
    'Ndokoti',
    'Bépanda',
    'Bonabéri',
    'Village',
    'Nyalla',
  ],
  Yaoundé: [
    'Bastos',
    'Centre-ville',
    'Omnisports',
    'Mvan',
    'Mendong',
    'Biyem-Assi',
    'Odza',
    'Essos',
    'Nlongkak',
    'Tsinga',
    'Ngousso',
    'Santa Barbara',
  ],
  Bafoussam: ['Djeleng', 'Tamdja', 'Kamkop', 'Famla', 'Toukouop'],
  Kribi: ['Centre', 'Grand Batanga', 'Mpalla', 'Mbeka\'a'],
};

// ── 2. VALIDEURS SPÉCIFIQUES ──────────────────────────────────────────────────

/**
 * Nettoie et formate un numéro WhatsApp/Téléphone
 * Supporte :
 *  - Format local : 6XXXXXXXX, 2XXXXXXXX
 *  - Format international : +2376XXXXXXXX, 002376XXXXXXXX, 2376XXXXXXXX
 */
export function sanitizePhoneNumber(input: string): string {
  if (!input) return '';
  // Supprime tous les caractères non numériques sauf le '+' initial
  let cleaned = input.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('00237')) {
    cleaned = '+237' + cleaned.slice(5);
  } else if (cleaned.startsWith('237') && !cleaned.startsWith('+237')) {
    cleaned = '+237' + cleaned.slice(3);
  } else if (!cleaned.startsWith('+') && (cleaned.startsWith('6') || cleaned.startsWith('2'))) {
    cleaned = '+237' + cleaned;
  }

  return cleaned;
}

export const WhatsAppNumberSchema = z
  .string()
  .min(8, 'Le numéro WhatsApp doit comporter au moins 8 chiffres')
  .max(20, 'Numéro trop long')
  .transform((val) => sanitizePhoneNumber(val))
  .refine(
    (val) => /^(\+237)?[26]\d{8}$/.test(val.replace(/\s+/g, '')) || /^\+\d{8,15}$/.test(val),
    { message: 'Format de numéro WhatsApp invalide (ex: +237 690 000 000 ou 690 000 000)' }
  );

// ── 3. SCHÉMA DE PREMIÈRE OFFRE / PRODUIT INITIAL (InitialItem) ───────────────

export const InitialItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Le nom de l\'article doit comporter au moins 2 caractères'),
  price: z.coerce.number().min(0, 'Le prix ne peut pas être négatif'),
  category: z.string().optional().default('Général'),
  description: z.string().optional().default(''),
  imageUrl: z.string().optional().default(''),
  badge: z.string().optional(),
  unit: z.string().optional().default('unité'),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export type InitialItem = z.infer<typeof InitialItemSchema>;

// ── 4. SCHÉMA GLOBAL DU PAYLOAD D'ONBOARDING ──────────────────────────────────

export const OnboardingPayloadSchema = z.object({
  /** Nom commercial de la boutique */
  storeName: z
    .string()
    .trim()
    .min(2, 'Le nom de la boutique doit comporter au moins 2 caractères')
    .max(100, 'Le nom de la boutique ne doit pas dépasser 100 caractères'),

  /** Archétype d'activité métier */
  businessType: BusinessTypeSchema.default('PHYSICAL_PRODUCT'),

  /** Numéro WhatsApp professionnel du vendeur */
  whatsapp: z.string().min(1, 'Le numéro WhatsApp est obligatoire'),

  /** Ville principale d'exercice */
  city: z.string().trim().min(2, 'Veuillez indiquer une ville').default('Douala'),

  /** Quartier ou repère géographique */
  quarter: z.string().optional().default(''),

  /** Description libre ou transcription vocale de l'activité */
  activityText: z.string().optional().default(''),

  /** Slogan court optionnel */
  slogan: z.string().optional().default(''),

  /** Blueprint maître sélectionné explicitement */
  selectedBlueprintId: z.enum(['BP01', 'BP02', 'BP03', 'BP04', 'BP05']).optional(),

  /** Signature visuelle / Graîne de thème sélectionnée */
  themeSeedCode: z.string().optional(),

  /** Moyens de paiement acceptés */
  paymentMethods: z.array(z.string()).default(['MTN MoMo', 'Orange Money', 'Paiement à la livraison']),

  /** Première sélection d'articles / services ajoutés par le marchand */
  initialItems: z.array(InitialItemSchema).max(10, 'Maximum 10 articles initiaux').default([]),

  /** Réponses aux éventuelles questions de clarification */
  clarifications: z.record(z.string(), z.string()).optional().default({}),
});

export type OnboardingPayload = z.infer<typeof OnboardingPayloadSchema>;

// ── 5. ÉTAPES DU TUNNEL D'ONBOARDING ──────────────────────────────────────────

export type OnboardingStep = 1 | 2 | 3 | 4;

export interface OnboardingStepInfo {
  step: OnboardingStep;
  title: string;
  subtitle: string;
  shortLabel: string;
  icon: string;
}

export const ONBOARDING_STEPS: OnboardingStepInfo[] = [
  {
    step: 1,
    title: 'Votre Métier & Identité',
    subtitle: 'Donnez un nom à votre vitrine et choisissez votre cœur d\'activité.',
    shortLabel: 'Activité',
    icon: 'Store',
  },
  {
    step: 2,
    title: 'Votre Première Offre',
    subtitle: 'Ajoutez un ou deux articles ou prestations phares pour amorcer le catalogue.',
    shortLabel: 'Catalogue',
    icon: 'Package',
  },
  {
    step: 3,
    title: 'Ancrage Local & WhatsApp',
    subtitle: 'Renseignez vos coordonnées pour que vos clients puissent commander directement.',
    shortLabel: 'Contact',
    icon: 'MapPin',
  },
  {
    step: 4,
    title: 'Aperçu & Lancement Instantané',
    subtitle: 'Vérifiez le rendu en direct de votre vitrine et personnalisez le style.',
    shortLabel: 'Lancement',
    icon: 'Sparkles',
  },
];
