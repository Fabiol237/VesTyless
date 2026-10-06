'use client';
import React, { useMemo } from 'react';
import { StorefrontConfig, Section } from '@/types/storefront';
import { ThemeProvider } from './ThemeProvider';
import { SectionRegistry } from '../registry/SectionRegistry';

export interface StorefrontRendererProps {
  config: StorefrontConfig;
  isEditing?: boolean;
  activePageId?: string;
  className?: string;
  onNavigatePage?: (pageId: string) => void;
}

export function StorefrontRenderer({
  config,
  isEditing = false,
  activePageId = 'page_home',
  className = '',
  onNavigatePage,
}: StorefrontRendererProps) {
  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
        <p className="text-sm font-semibold opacity-70">Configuration de boutique indisponible.</p>
      </div>
    );
  }

  // 1. Résolution des sections de la page active ou de la racine
  const activeSections = useMemo<Section[]>(() => {
    // Si la boutique est en architecture multi-pages
    if (Array.isArray(config.pages) && config.pages.length > 0) {
      const page = config.pages.find(p => p.id === activePageId || (activePageId === 'page_home' && p.isHome))
        || config.pages[0];

      if (page && Array.isArray(page.sections) && page.sections.length > 0) {
        return page.sections;
      }
    }

    // Sinon, utiliser la liste ordonnée des sections racine
    return Array.isArray(config.sections) ? config.sections : [];
  }, [config.pages, config.sections, activePageId]);

  // 2. Tri par ordre et filtrage de visibilité
  const displaySections = useMemo(() => {
    const sorted = [...activeSections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (isEditing) {
      return sorted; // En mode édition, conserver toutes les sections (avec indicateur si masquée)
    }

    return sorted.filter(s => s.visible !== false);
  }, [activeSections, isEditing]);

  return (
    <ThemeProvider theme={config.theme} className={className}>
      <main className="w-full flex flex-col relative @container">
        {displaySections.length === 0 ? (
          <div className="py-24 text-center px-4">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="text-lg font-bold mb-1">Aucune section active sur cette page</h3>
            <p className="text-sm opacity-60">Ajoutez des sections ou générez une composition avec l'IA.</p>
          </div>
        ) : (
          displaySections.map((section) => {
            // Résolution du composant React via le SectionRegistry
            const SectionComponent = SectionRegistry.get(section.type, section.variant);
            const isHiddenInEdit = isEditing && section.visible === false;

            return (
              <div
                key={section.id}
                id={section.id}
                className="w-full relative transition-opacity"
                style={{
                  opacity: isHiddenInEdit ? 0.45 : 1,
                }}
              >
                {/* Indicateur discret si section masquée en mode édition */}
                {isHiddenInEdit && (
                  <div className="absolute top-2 right-4 z-20 px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700 text-[10px] font-bold text-amber-300">
                    👁️ Section Masquée aux visiteurs
                  </div>
                )}

                <SectionComponent
                  section={section}
                  content={section.content || {}}
                  styles={section.styles || {}}
                  metadata={config.metadata}
                  theme={config.theme}
                  isEditing={isEditing}
                />
              </div>
            );
          })
        )}
      </main>
    </ThemeProvider>
  );
}

export default StorefrontRenderer;
