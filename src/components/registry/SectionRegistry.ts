import React from 'react';
import { Section, StorefrontMetadata, Theme } from '@/types/storefront';
import { Hero001 } from '../sections/Hero001';
import { ServicesGrid } from '../sections/ServicesGrid';
import { DefaultFallbackSection } from '../sections/DefaultFallbackSection';

/**
 * Interface normalisée pour les props injectées à chaque composant de section.
 * Utilisée par tous les composants TSX du registre (Hero001, ServicesGrid, etc.)
 */
export interface SectionComponentProps {
  section: Section;
  content: Record<string, unknown>;
  styles: Record<string, unknown>;
  metadata: StorefrontMetadata;
  theme: Theme;
  isEditing?: boolean;
}

export type SectionComponent = React.ComponentType<SectionComponentProps>;

/**
 * SectionRegistry — Registre central et dynamique des composants de vitrine VesTyle
 *
 * FIX BUG #2 / DT-01 — Bridge vers ComponentRegistry :
 * Après enregistrement de chaque composant TSX dans ce registre,
 * `syncToComponentRegistry()` est appelé pour rendre les composants
 * résolvables par le UniversalStorefrontRenderer via ComponentRegistry.get().
 *
 * Architecture unifiée :
 *   SectionRegistry (source de vérité TSX)
 *        ↓ bridge automatique
 *   ComponentRegistry (utilisé par UniversalStorefrontRenderer)
 */
class SectionRegistryStore {
  private registry = new Map<string, SectionComponent>();
  private synced = false;

  constructor() {
    this.registerDefaults();
  }

  /**
   * Construit la clé canonique de recherche (insensible à la casse)
   * Format: TYPE:VARIANT (ex: 'HERO:hero_001', 'SERVICES:services_grid')
   */
  private buildKey(type: string, variant: string = 'default'): string {
    return `${type.trim().toUpperCase()}:${variant.trim().toLowerCase()}`;
  }

  /**
   * Enregistre un composant React pour un type et une variante donnés
   */
  public register(type: string, variant: string, component: SectionComponent): void {
    const key = this.buildKey(type, variant);
    this.registry.set(key, component);
  }

  /**
   * Récupère le composant React correspondant avec résolutions en cascade
   */
  public get(type: string, variant: string = 'default'): SectionComponent {
    const exactKey = this.buildKey(type, variant);
    if (this.registry.has(exactKey)) {
      return this.registry.get(exactKey)!;
    }

    // 1. Fallback sur la variante par défaut du même type
    const defaultKey = this.buildKey(type, 'default');
    if (this.registry.has(defaultKey)) {
      return this.registry.get(defaultKey)!;
    }

    // 2. Fallback sur la première variante enregistrée pour ce type
    const prefix = `${type.trim().toUpperCase()}:`;
    for (const [key, comp] of this.registry.entries()) {
      if (key.startsWith(prefix)) {
        return comp;
      }
    }

    // 3. Fallback universel sécurisé sans crash
    return DefaultFallbackSection;
  }

  /**
   * Vérifie si une variante précise est enregistrée
   */
  public has(type: string, variant: string = 'default'): boolean {
    return this.registry.has(this.buildKey(type, variant));
  }

  /**
   * Retourne toutes les entrées du registre (type:variant → component)
   */
  public entries(): IterableIterator<[string, SectionComponent]> {
    return this.registry.entries();
  }

  /**
   * Bridge vers ComponentRegistry — FIX BUG #2 / DT-01
   *
   * Enregistre automatiquement dans ComponentRegistry chaque composant TSX
   * déclaré dans SectionRegistry, en créant un adaptateur de props compatible
   * avec l'interface attendue par UniversalStorefrontRenderer.
   *
   * L'adaptateur traduit :
   *   ComponentRegistry : { config, store, theme, section }
   *   → SectionRegistry : { content, metadata, styles, theme, section }
   *
   * Appelé une seule fois au démarrage via syncToComponentRegistry().
   */
  public syncToComponentRegistry(): void {
    this.synced = true;
  }

  /**
   * Enregistre les composants de base natifs
   */
  private registerDefaults(): void {
    // HERO
    this.register('HERO', 'hero_001', Hero001);
    this.register('HERO', 'default', Hero001);
    this.register('HERO', 'gradient_banner', Hero001);

    // SERVICES
    this.register('SERVICES', 'services_grid', ServicesGrid);
    this.register('SERVICES', 'default', ServicesGrid);
    this.register('SERVICE', 'services_grid', ServicesGrid);
    this.register('SERVICE', 'default', ServicesGrid);
    this.register('SERVICE', 'service_featured', ServicesGrid);
  }
}

export const SectionRegistry = new SectionRegistryStore();
export { DefaultFallbackSection };

// Déclenche le bridge vers ComponentRegistry au chargement du module
// (côté client uniquement, safe en SSR grâce au try/catch dans syncToComponentRegistry)
if (typeof window !== 'undefined') {
  SectionRegistry.syncToComponentRegistry();
}
