/**
 * VesTyle V1 — Design Registry Interface
 * ─────────────────────────────────────────────────────────────────────────────
 * Interface canonique pour la découverte, le filtrage et le chargement des designs.
 * RÈGLE 6 : Un Design appartient à un Domaine et une Catégorie.
 * RÈGLE 7 : Un Design incompatible ne doit jamais être proposé.
 */

import type { DesignDefinition } from '../contracts/designDefinition';

export interface DesignQueryFilter {
  domain?: string;
  category?: string;
  positioning?: 'LUXURY' | 'PREMIUM' | 'POPULAR' | 'RUSTIC' | 'MINIMAL' | 'HIGH_TECH';
  conversionMode?: 'WHATSAPP_DIRECT' | 'CATALOG_BROWSING' | 'BOOKING_FIRST' | 'QUOTE_REQUEST';
  tags?: string[];
  search?: string;
  requiredCapabilities?: string[];
}

export interface DesignSummary {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  domain: string;
  category: string;
  previewThumbnails: {
    desktop: string;
    mobile: string;
  };
  requiredCapabilities: string[];
  optionalCapabilities: string[];
  positioning: string;
  conversionMode: string;
  primaryColor: string;
  accentColor: string;
  isDark: boolean;
  tags: string[];
}

export interface IDesignRegistry {
  getDesign(id: string): Promise<DesignDefinition>;
  getDesignSync?(id: string): DesignDefinition;
  getAllDesigns?(): DesignDefinition[];
  getAllDesignsSync?(): DesignDefinition[];
  getDesignsByDomainSync?(domain: string): DesignDefinition[];
  getAll(): Promise<DesignSummary[]>;
  getDesignsByDomain(domain: string): Promise<DesignSummary[]>;
  getDesignsByCategory(domain: string, category: string): Promise<DesignSummary[]>;
  queryDesigns(filter: DesignQueryFilter): Promise<DesignSummary[]>;
  registerDesign(design: DesignDefinition): Promise<void>;
}
