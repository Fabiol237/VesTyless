'use client';
import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, SlidersHorizontal, LayoutGrid, Check } from 'lucide-react';
import { TEMPLATE_LIBRARY, buildStoreConfigFromTemplate } from '@/lib/template-library';

export function TemplateSwitchBar({
  storeData,
  onApplyTemplate,
  onOpenAIModal,
  onOpenQuickInfo,
  onOpenAllTemplates,
}) {
  const currentTemplateId = storeData?.templateId || storeData?.store_template || TEMPLATE_LIBRARY[0].id;

  const { currentIndex, currentTemplate, totalTemplates } = useMemo(() => {
    const idx = TEMPLATE_LIBRARY.findIndex((t) => t.id === currentTemplateId);
    const validIdx = idx >= 0 ? idx : 0;
    return {
      currentIndex: validIdx,
      currentTemplate: TEMPLATE_LIBRARY[validIdx] || TEMPLATE_LIBRARY[0],
      totalTemplates: TEMPLATE_LIBRARY.length,
    };
  }, [currentTemplateId]);

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + totalTemplates) % totalTemplates;
    const prevTmpl = TEMPLATE_LIBRARY[prevIdx];
    const newConfig = buildStoreConfigFromTemplate(prevTmpl, storeData);
    onApplyTemplate(newConfig, prevTmpl);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % totalTemplates;
    const nextTmpl = TEMPLATE_LIBRARY[nextIdx];
    const newConfig = buildStoreConfigFromTemplate(nextTmpl, storeData);
    onApplyTemplate(newConfig, nextTmpl);
  };

  return (
    <div className="z-40 px-3 py-2 flex items-center justify-between gap-2 bg-[#0c0c10]/95 backdrop-blur-md border-b border-white/10 shadow-lg text-white font-sans select-none">
      
      {/* Sélecteur de templates rapide (Précédent / Suivant) */}
      <div className="flex items-center gap-1.5 min-w-0">
        <button
          onClick={handlePrev}
          className="h-8 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-1 text-xs font-semibold border border-white/5 transition active:scale-95"
          title="Template précédent"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        <div className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono font-bold text-purple-300 shrink-0">
            {currentIndex + 1}/{totalTemplates}
          </span>
          <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[220px]">
            {currentTemplate.name}
          </span>
          <span className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-mono">
            {currentTemplate.sectorLabel || currentTemplate.sector}
          </span>
        </div>

        <button
          onClick={handleNext}
          className="h-8 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-1 text-xs font-semibold border border-white/5 transition active:scale-95"
          title="Template suivant"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Actions vendeur simples */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* IA Matcher Button */}
        <button
          onClick={onOpenAIModal}
          className="h-8 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center gap-1.5 text-xs font-bold shadow-md shadow-purple-600/30 transition active:scale-95"
        >
          <Sparkles size={13} className="text-yellow-300" />
          <span className="hidden xs:inline">Demander à l&apos;IA</span>
          <span className="xs:hidden">IA</span>
        </button>

        {/* Formulaire rapide infos */}
        <button
          onClick={onOpenQuickInfo}
          className="h-8 px-2.5 sm:px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 flex items-center gap-1.5 text-xs font-semibold border border-white/10 transition active:scale-95"
        >
          <SlidersHorizontal size={13} />
          <span className="hidden sm:inline">Mes Infos</span>
        </button>

        {/* Tous les templates */}
        <button
          onClick={onOpenAllTemplates}
          className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center border border-white/5 transition"
          title="Voir la bibliothèque complète"
        >
          <LayoutGrid size={14} />
        </button>
      </div>

    </div>
  );
}
