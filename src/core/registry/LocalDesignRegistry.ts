/**
 * VesTyle V1 — Local Design Registry
 * ─────────────────────────────────────────────────────────────────────────────
 * Registre canonique des designs déclaratifs de VesTyle V1.
 * Mappe strictement chaque design à son Domaine, sa Catégorie et ses Capacités.
 */

import type { IDesignRegistry, DesignQueryFilter, DesignSummary } from './IDesignRegistry';
import { DesignDefinitionSchema, type DesignDefinition } from '../contracts/designDefinition';
import { VST_DSN_PRESTIGE_ATELIER_001 } from '../designs/vst_dsn_prestige_atelier_001';
import { VST_DSN_RESTO_TERROIR_002 } from '../designs/vst_dsn_resto_terroir_002';
import { VST_DSN_SERVICES_VIP_003 } from '../designs/vst_dsn_services_vip_003';
import { VST_DSN_AGRO_ELEVAGE_004 } from '../designs/vst_dsn_agro_elevage_004';
import { VST_DSN_LOCATION_STANDING_005 } from '../designs/vst_dsn_location_standing_005';
import { VST_DSN_COMMERCE_LIBRAIRIE_006 } from '../designs/vst_dsn_commerce_librairie_006';

// Métadonnées d'appartenance de domaine & catégorie pour les designs
export const DESIGN_TAXONOMY_MAP: Record<string, {
  domain: string;
  category: string;
  requiredCapabilities: string[];
  optionalCapabilities: string[];
}> = {
  vst_dsn_prestige_atelier_001: {
    domain: 'vendeur',
    category: 'mode',
    requiredCapabilities: ['PRODUCTS', 'ORDERS', 'WHATSAPP_COMMERCE'],
    optionalCapabilities: ['INVENTORY', 'REVIEWS', 'PROMOTIONS', 'STOCK_LOGS']
  },
  vst_dsn_resto_terroir_002: {
    domain: 'restauration',
    category: 'restaurant',
    requiredCapabilities: ['MENU', 'TABLES', 'RESERVATIONS'],
    optionalCapabilities: ['RESTAURANT_ORDERS', 'ALLERGENS', 'DELIVERY']
  },
  vst_dsn_services_vip_003: {
    domain: 'services',
    category: 'beaute_soin',
    requiredCapabilities: ['SERVICES', 'APPOINTMENTS', 'REQUESTS'],
    optionalCapabilities: ['STAFF', 'PORTFOLIO', 'REVIEWS']
  },
  vst_dsn_agro_elevage_004: {
    domain: 'vendeur',
    category: 'agriculture',
    requiredCapabilities: ['PRODUCTS', 'ORDERS', 'WHATSAPP_COMMERCE'],
    optionalCapabilities: ['INVENTORY', 'DELIVERY', 'STOCK_LOGS']
  },
  vst_dsn_location_standing_005: {
    domain: 'hebergement',
    category: 'residence',
    requiredCapabilities: ['ROOMS', 'AVAILABILITY', 'BOOKINGS'],
    optionalCapabilities: ['GUESTS', 'PRICING_SEASONS', 'AMENITIES']
  },
  vst_dsn_commerce_librairie_006: {
    domain: 'vendeur',
    category: 'technologie',
    requiredCapabilities: ['PRODUCTS', 'ORDERS', 'WHATSAPP_COMMERCE'],
    optionalCapabilities: ['INVENTORY', 'REVIEWS', 'STOCK_LOGS']
  },
};

export class LocalDesignRegistry implements IDesignRegistry {
  private static instance: LocalDesignRegistry;
  private designsMap: Map<string, DesignDefinition> = new Map();

  private constructor() {
    this.initializeDefaultDesigns();
  }

  public static getInstance(): LocalDesignRegistry {
    if (!LocalDesignRegistry.instance) {
      LocalDesignRegistry.instance = new LocalDesignRegistry();
    }
    return LocalDesignRegistry.instance;
  }

  private initializeDefaultDesigns(): void {
    const defaultDesigns: DesignDefinition[] = [
      VST_DSN_PRESTIGE_ATELIER_001,
      VST_DSN_RESTO_TERROIR_002,
      VST_DSN_SERVICES_VIP_003,
      VST_DSN_AGRO_ELEVAGE_004,
      VST_DSN_LOCATION_STANDING_005,
      VST_DSN_COMMERCE_LIBRAIRIE_006,
    ];

    for (const d of defaultDesigns) {
      try {
        const validated = DesignDefinitionSchema.parse(d);
        this.designsMap.set(validated.id, validated);
      } catch (err) {
        console.error(`[LocalDesignRegistry] Erreur validation design '${d?.id}' :`, err);
      }
    }
  }

  public getDesignSync(id: string): DesignDefinition {
    const design = this.designsMap.get(id);
    if (!design) {
      const firstDesign = Array.from(this.designsMap.values())[0];
      if (firstDesign) {
        return firstDesign;
      }
      return VST_DSN_PRESTIGE_ATELIER_001;
    }
    return design;
  }

  public getAllDesigns(): DesignDefinition[] {
    return Array.from(this.designsMap.values());
  }

  public getAllDesignsSync(): DesignDefinition[] {
    return this.getAllDesigns();
  }

  public getDesignsByDomainSync(domain: string): DesignDefinition[] {
    const all = this.getAllDesigns();
    const filtered = all.filter((d) => {
      const tax = DESIGN_TAXONOMY_MAP[d.id];
      return tax ? tax.domain === domain : true;
    });
    if (filtered.length > 0) return filtered;
    return all;
  }

  public async getDesign(id: string): Promise<DesignDefinition> {
    return this.getDesignSync(id);
  }

  public async getAll(): Promise<DesignSummary[]> {
    return Array.from(this.designsMap.values()).map((d) => {
      const tax = DESIGN_TAXONOMY_MAP[d.id] || {
        domain: 'vendeur',
        category: 'autres',
        requiredCapabilities: ['PRODUCTS', 'ORDERS'],
        optionalCapabilities: []
      };

      return {
        id: d.id,
        name: d.meta.name,
        description: d.meta.description,
        author: d.meta.author,
        version: d.meta.version,
        domain: tax.domain,
        category: tax.category,
        previewThumbnails: {
          desktop: d.meta.preview.desktopThumbnailUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
          mobile: d.meta.preview.mobileThumbnailUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
        },
        requiredCapabilities: tax.requiredCapabilities,
        optionalCapabilities: tax.optionalCapabilities,
        positioning: d.applicability.positioning,
        conversionMode: d.applicability.conversionMode,
        primaryColor: d.styleSystem.palette.primary,
        accentColor: d.styleSystem.palette.accent,
        isDark: d.styleSystem.palette.isDark,
        tags: d.meta.tags || [],
      };
    });
  }

  public async getDesignsByDomain(domain: string): Promise<DesignSummary[]> {
    const all = await this.getAll();
    const filtered = all.filter(d => d.domain === domain);
    if (filtered.length > 0) return filtered;
    // Si aucun design exclusif n'est encore dédié à ce domaine, proposer les designs adaptables
    return all;
  }

  public async getDesignsByCategory(domain: string, category: string): Promise<DesignSummary[]> {
    const domainDesigns = await this.getDesignsByDomain(domain);
    const categoryMatches = domainDesigns.filter(d => d.category === category);
    if (categoryMatches.length > 0) return categoryMatches;
    return domainDesigns;
  }

  public async queryDesigns(filter: DesignQueryFilter): Promise<DesignSummary[]> {
    let results = await this.getAll();

    if (filter.domain) {
      results = results.filter(d => d.domain === filter.domain);
    }
    if (filter.category) {
      const catMatches = results.filter(d => d.category === filter.category);
      if (catMatches.length > 0) results = catMatches;
    }
    if (filter.positioning) {
      results = results.filter(d => d.positioning === filter.positioning);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      results = results.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filter.requiredCapabilities && filter.requiredCapabilities.length > 0) {
      results = results.filter(d =>
        filter.requiredCapabilities!.every(req =>
          d.requiredCapabilities.includes(req) || d.optionalCapabilities.includes(req)
        )
      );
    }

    return results;
  }

  public async registerDesign(design: DesignDefinition): Promise<void> {
    const validated = DesignDefinitionSchema.parse(design);
    this.designsMap.set(validated.id, validated);
  }
}

export const designRegistry = LocalDesignRegistry.getInstance();
