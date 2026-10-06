'use client';
import { useState } from 'react';
import { Sparkles, ArrowRight, Check, X, Loader2, Wand2, RefreshCw } from 'lucide-react';
import { TEMPLATE_LIBRARY, buildStoreConfigFromTemplate } from '@/lib/template-library';

const QUICK_SUGGESTIONS = [
  '👗 Vente de vêtements et accessoires mode femme chic',
  '🥐 Boulangerie & Pâtisserie artisanale avec commandes',
  '📱 Téléphones, iPhones et accessoires tech à bon prix',
  '🍽️ Restaurant avec plats africains et livraison express',
  '💄 Produits de beauté, soins du visage et maquillage',
  '🏨 Résidence meublée et chambres d\'hôtes de standing',
  '✂️ Salon de coiffure homme et dame avec rendez-vous',
  '🛒 Épicerie et supermarché de quartier en ligne',
];

export function AITemplateMatcherModal({
  isOpen,
  onClose,
  storeData,
  onApplyTemplate,
}) {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [aiProvider, setAiProvider] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (textToSearch) => {
    const query = textToSearch || description;
    if (!query.trim()) return;

    setIsLoading(true);
    setMatches(null);

    try {
      const res = await fetch('/api/ai/match-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: query.trim(),
          storeId: storeData?.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.templates?.length > 0) {
        setMatches(data.templates);
        setSelectedTemplateId(data.templates[0].id);
        setAiProvider(data.aiProvider);
      } else {
        // Fallback direct sur toute la bibliothèque
        setMatches(TEMPLATE_LIBRARY.slice(0, 4));
        setSelectedTemplateId(TEMPLATE_LIBRARY[0]?.id);
      }
    } catch (err) {
      console.warn('Erreur AI match, fallback local:', err);
      setMatches(TEMPLATE_LIBRARY.slice(0, 4));
      setSelectedTemplateId(TEMPLATE_LIBRARY[0]?.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAndApply = (template) => {
    const newConfig = buildStoreConfigFromTemplate(template, storeData);
    onApplyTemplate(newConfig, template);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#111116] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#17171f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Assistant IA Vestin
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-semibold">
                  Jina AI + Mistral
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Dis-nous ce que tu vends, l&apos;IA choisit le meilleur design pour toi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body scrollable */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Saisie prompt */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Décris ton activité commerciale :
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Je vends des chaussures et sacs pour homme à Douala, style classe et prix abordables avec livraison..."
                rows={3}
                className="w-full bg-[#0a0a0d] border border-white/10 focus:border-purple-500 rounded-2xl p-3.5 text-sm text-white placeholder:text-slate-500 outline-none resize-none transition"
              />
              <button
                onClick={() => handleSearch()}
                disabled={isLoading || !description.trim()}
                className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Analyse IA...</span>
                  </>
                ) : (
                  <>
                    <span>Générer</span>
                    <Wand2 size={14} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Suggestions rapides */}
          {!matches && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Ou choisis un exemple rapide :
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDescription(item);
                      handleSearch(item);
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-purple-500/15 border border-white/5 hover:border-purple-500/30 text-slate-300 hover:text-purple-200 transition text-left"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Résultats templates proposés par l'IA */}
          {matches && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Templates recommandés</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono">
                    {matches.length} styles trouvés
                  </span>
                </div>
                <button
                  onClick={() => handleSearch()}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                >
                  <RefreshCw size={12} />
                  Relancer
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matches.map((tmpl) => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  const primary = tmpl.theme?.colors?.primary || '#7c3aed';

                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/20'
                          : 'bg-[#15151d] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div>
                        {/* Header card */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono">
                            {tmpl.sectorLabel || tmpl.sector}
                          </span>
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20"
                            style={{ backgroundColor: primary }}
                          />
                        </div>

                        <h4 className="text-sm font-bold text-white mb-1">
                          {tmpl.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {tmpl.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-[11px] text-slate-500">
                          {tmpl.sections?.length || 5} sections
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAndApply(tmpl);
                            onClose();
                          }}
                          className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                              : 'bg-white/10 hover:bg-white/20 text-slate-200'
                          }`}
                        >
                          <Check size={12} />
                          <span>Appliquer</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#14141c] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>
            💡 Tu pourras ensuite passer de template en template d&apos;un clic
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
