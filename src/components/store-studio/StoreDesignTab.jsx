'use client';
import { useState } from 'react';
import { Palette, Type, Check, Sparkles, Layout, Wand2 } from 'lucide-react';
import { STORE_TEMPLATES, SECTORS, getTemplateById, getTemplatesBySector } from '@/lib/storeTemplates';

const COLOR_PRESETS = [
  { name: 'Émeraude VeStyle', primary: '#128C7E', secondary: '#F3F4F6', label: 'E-Commerce & Pro' },
  { name: 'Noir & Or Luxe', primary: '#D4AF37', secondary: '#1A1814', label: 'Haute Couture' },
  { name: 'Bleu Cyber Tech', primary: '#2563EB', secondary: '#0F172A', label: 'Tech & Gadgets' },
  { name: 'Terre & Épices', primary: '#EA580C', secondary: '#1C0A00', label: 'Resto & Food' },
  { name: 'Vert Pharmacie', primary: '#10B981', secondary: '#F8FAFC', label: 'Santé & Soins' },
  { name: 'Frais & Express', primary: '#059669', secondary: '#FFFFFF', label: 'Supermarché' },
  { name: 'Rose Poudré Spa', primary: '#E11D48', secondary: '#FFF1F2', label: 'Beauté & Coiffure' },
  { name: 'Violet Agence B2B', primary: '#6366F1', secondary: '#0F172A', label: 'Services & Agence' },
];

const FONT_OPTIONS = [
  { id: 'Inter', name: 'Inter', desc: 'Sleek, moderne et ultra-lisible (Tech, Commerce, Pharma)' },
  { id: "'Outfit', sans-serif", name: 'Outfit', desc: 'Élégant, chaleureux et percutant (Resto, Beauté, Services)' },
  { id: "'Playfair Display', serif", name: 'Playfair Display', desc: 'Raffiné, éditorial et haute couture (Luxe, Mode, Bijoux)' },
  { id: "'Montserrat', sans-serif", name: 'Montserrat', desc: 'Moderne, direct et énergique (Sport, Auto, Supermarché)' },
];

export default function StoreDesignTab({ formData, onChange, onTemplateSelect }) {
  const [selectedSectorFilter, setSelectedSectorFilter] = useState('all');
  const currentTemplateId = formData.store_template || formData.shop_theme || 'boutique_pro';
  const currentTemplate = getTemplateById(currentTemplateId);

  const filteredTemplates = getTemplatesBySector(selectedSectorFilter);

  // 🪄 Application Magique 1-Clic de l'Identité Complète du Métier
  const handleApplyPersona = (tmpl) => {
    onTemplateSelect(tmpl.id);
    if (tmpl.theme) {
      onChange({ target: { name: 'theme_color', value: tmpl.theme.primaryColor } });
      onChange({ target: { name: 'secondary_color', value: tmpl.theme.secondaryColor } });
      onChange({ target: { name: 'font_family', value: tmpl.theme.fontFamily } });
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* 1. Sélecteur de Métiers & Templates Dédiés */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-2xl text-[#059669]">
              <Layout size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Secteur & Expérience Métier</h3>
              <p className="text-xs text-gray-400 font-medium">Chaque modèle est sculpté sur-mesure pour votre activité.</p>
            </div>
          </div>
        </div>

        {/* Filtres par Catégorie de Métier */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {SECTORS.map((sec) => {
            const isFilterActive = selectedSectorFilter === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSectorFilter(sec.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  isFilterActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-gray-50 text-slate-600 hover:bg-gray-100 hover:text-slate-900'
                }`}
              >
                <span>{sec.emoji}</span>
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grille des Templates Métiers avec Aperçu & Badge Spécifique */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredTemplates.map((tmpl) => {
            const isSelected = currentTemplateId === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => handleApplyPersona(tmpl)}
                className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between gap-4 relative group ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-md shadow-emerald-500/10'
                    : 'border-gray-100 hover:border-gray-300 bg-gray-50/40 hover:bg-gray-50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white shadow-xs"
                      style={{ backgroundColor: tmpl.badgeColor }}
                    >
                      {tmpl.emoji} {tmpl.badge}
                    </span>
                    {isSelected ? (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold">
                        <Check size={12} strokeWidth={3} />
                        Actif
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <Wand2 size={12} />
                        Appliquer
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 mt-1">{tmpl.name}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">{tmpl.description}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                    <span>✨ Micro-animation :</span>
                    <span className="text-slate-700 font-black">{tmpl.animationClass.replace('animate-', '')}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {tmpl.supports?.slice(0, 3).map((feat, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-gray-100 text-[9px] font-bold text-gray-600">
                        ✓ {feat.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Palettes de Couleurs 1-Clic & Ajustements */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-500">
            <Palette size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Harmonies Chromatiques Métiers</h3>
            <p className="text-xs text-gray-400 font-medium">Palettes étalonnées pour susciter l'achat et la confiance.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COLOR_PRESETS.map((preset, idx) => {
            const isActive = formData.theme_color?.toLowerCase() === preset.primary.toLowerCase();
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange({ target: { name: 'theme_color', value: preset.primary } });
                  onChange({ target: { name: 'secondary_color', value: preset.secondary } });
                }}
                className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 relative ${
                  isActive ? 'border-emerald-500 bg-emerald-50/10 shadow-xs' : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: preset.primary }} />
                  <div className="w-4 h-4 rounded-full border border-black/10 shadow-inner -ml-2" style={{ backgroundColor: preset.secondary }} />
                  <span className="text-xs font-bold text-gray-800 ml-auto truncate">{preset.name}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-semibold">{preset.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50/60 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-gray-900">Couleur Principale</p>
              <p className="text-[11px] text-gray-400 font-bold uppercase">{formData.theme_color}</p>
            </div>
            <input
              type="color"
              name="theme_color"
              value={formData.theme_color}
              onChange={onChange}
              className="w-10 h-10 rounded-xl cursor-pointer border-2 border-white shadow-md"
            />
          </div>

          <div className="p-4 bg-gray-50/60 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-gray-900">Fond & Teinte de Contraste</p>
              <p className="text-[11px] text-gray-400 font-bold uppercase">{formData.secondary_color}</p>
            </div>
            <input
              type="color"
              name="secondary_color"
              value={formData.secondary_color}
              onChange={onChange}
              className="w-10 h-10 rounded-xl cursor-pointer border-2 border-white shadow-md"
            />
          </div>
        </div>
      </div>

      {/* 3. Typographies Spécifiques */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600">
            <Type size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Typographie & Caractère de Marque</h3>
            <p className="text-xs text-gray-400 font-medium">Une police adaptée renforce la crédibilité de votre métier.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {FONT_OPTIONS.map((f) => {
            const isSelected = formData.font_family === f.id;
            return (
              <div
                key={f.id}
                onClick={() => onChange({ target: { name: 'font_family', value: f.id } })}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                  isSelected ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                }`}
              >
                <div>
                  <p className="text-sm font-black text-gray-900" style={{ fontFamily: f.id }}>{f.name}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{f.desc}</p>
                </div>
                {isSelected && <Check size={16} className="text-emerald-600" strokeWidth={3} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
