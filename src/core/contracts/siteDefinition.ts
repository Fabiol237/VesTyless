/**
 * VesTyle V1 — Unified Site Definition Contract & Schema
 * ─────────────────────────────────────────────────────────────────────────────
 * Contrat canonique pour la représentation d'un Site dans VesTyle V1.
 * Un Compte possède plusieurs Sites. Chaque Site appartient à un Domaine et une Catégorie.
 */

import { z } from 'zod';

export const SiteHealthStatusSchema = z.enum(['green', 'yellow', 'red']);
export type SiteHealthStatus = z.infer<typeof SiteHealthStatusSchema>;

export const SiteSetupProgressSchema = z.object({
  infoCompleted: z.boolean().default(false),
  designSelected: z.boolean().default(false),
  contentAdded: z.boolean().default(false),
  contactConfigured: z.boolean().default(false),
  seoConfigured: z.boolean().default(false),
  published: z.boolean().default(false),
  completionPercentage: z.number().min(0).max(100).default(0),
});
export type SiteSetupProgress = z.infer<typeof SiteSetupProgressSchema>;

export const SiteDefinitionSchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  domain: z.enum([
    'vendeur',
    'hebergement',
    'restauration',
    'services',
    'education',
    'sante',
    'immobilier_transport',
    'creation_medias',
    'organisations'
  ]).default('vendeur'),
  category: z.string().default('autres'),
  subSector: z.string().optional().nullable(),
  designId: z.string().default('vst_dsn_prestige_atelier_001'),
  description: z.string().default(''),
  city: z.string().default('Douala'),
  phone: z.string().default(''),
  whatsapp: z.string().default(''),
  logoUrl: z.string().default(''),
  bannerUrl: z.string().default(''),
  storeCode: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
  
  // Configuration déclarative Presentation vs Données Métier
  draftConfig: z.record(z.string(), z.unknown()).default({}),
  publishedConfig: z.record(z.string(), z.unknown()).default({}),
  
  // Capacités activées
  capabilities: z.record(z.string(), z.boolean()).default({}),
  
  // Métriques de santé et de complétion
  health: z.object({
    status: SiteHealthStatusSchema.default('yellow'),
    score: z.number().min(0).max(100).default(50),
    issues: z.array(z.string()).default([]),
    warnings: z.array(z.string()).default([]),
  }).default({}),
  
  setupProgress: SiteSetupProgressSchema.default({}),
  
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type SiteDefinition = z.infer<typeof SiteDefinitionSchema>;

/**
 * Calcule l'état de santé et la progression d'un site.
 */
export function calculateSiteHealth(site: Partial<SiteDefinition>, itemsCount = 0): {
  health: { status: SiteHealthStatus; score: number; issues: string[]; warnings: string[] };
  setupProgress: SiteSetupProgress;
} {
  const issues: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  const infoCompleted = Boolean(site.name && site.city && (site.phone || site.whatsapp));
  const designSelected = Boolean(site.designId);
  const contentAdded = itemsCount > 0;
  const contactConfigured = Boolean(site.whatsapp || site.phone);
  const seoConfigured = Boolean(site.description && site.description.length > 20);
  const published = Boolean(site.isPublished || (site.publishedConfig && Object.keys(site.publishedConfig).length > 0));

  if (!site.name) {
    issues.push('Nom du site manquant');
    score -= 30;
  }
  if (!contactConfigured) {
    issues.push('Numéro de contact / WhatsApp non configuré');
    score -= 25;
  }
  if (!contentAdded) {
    warnings.push('Aucun article ou prestation dans le catalogue');
    score -= 20;
  }
  if (!seoConfigured) {
    warnings.push('Description SEO courte ou incomplète');
    score -= 10;
  }
  if (!published) {
    warnings.push('Modifications en attente de publication');
    score -= 15;
  }

  score = Math.max(0, Math.min(100, score));
  const status: SiteHealthStatus = score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'red';

  const completedCount = [infoCompleted, designSelected, contentAdded, contactConfigured, seoConfigured, published].filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / 6) * 100);

  return {
    health: { status, score, issues, warnings },
    setupProgress: {
      infoCompleted,
      designSelected,
      contentAdded,
      contactConfigured,
      seoConfigured,
      published,
      completionPercentage,
    }
  };
}
