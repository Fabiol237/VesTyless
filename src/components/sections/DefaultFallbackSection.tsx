import React from 'react';
import type { Section, StorefrontMetadata } from '@/types/storefront';

interface FallbackProps {
  section: Section;
  metadata?: StorefrontMetadata;
  isEditing?: boolean;
}

export const DefaultFallbackSection: React.FC<FallbackProps> = ({
  section,
  isEditing = false,
}) => {
  return (
    <section className="w-full my-4 p-6 border-2 border-dashed border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl text-center">
      <div className="max-w-md mx-auto space-y-2">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 font-mono text-sm font-bold">
          !
        </div>
        <h3 className="text-base font-semibold text-amber-900 dark:text-amber-200">
          Section non prise en charge
        </h3>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Type : <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">{section.type}</code> | 
          Variante : <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">{section.variant || 'default'}</code>
        </p>
        {isEditing && (
          <p className="text-[11px] text-amber-600 dark:text-amber-500 italic">
            (Ce bloc s'affiche car aucune implémentation n'a été trouvée dans le Registre de Sections)
          </p>
        )}
      </div>
    </section>
  );
};
