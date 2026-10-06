'use client';

import React, { useState } from 'react';
import {
  Layers, Eye, EyeOff, ArrowUp, ArrowDown, Palette,
  Save, Check, Sparkles, RefreshCw, Sliders, Type
} from 'lucide-react';

const THEME_PRESETS = [
  { name: 'Émeraude (Classique)', color: '#128C7E' },
  { name: 'Vert WhatsApp', color: '#25D366' },
  { name: 'Bleu Royal', color: '#2563EB' },
  { name: 'Rose Fushia', color: '#E11D48' },
  { name: 'Ambre Chaud', color: '#D97706' },
  { name: 'Violet Luxe', color: '#7C3AED' },
  { name: 'Noir Carbone', color: '#0F172A' },
];

export default function StudioSectionEditor({
  store,
  onStoreChange,
  onSave,
  saving = false,
}) {
  const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'style'
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialisation des blocs depuis layout_config ou par défaut
  const layoutConfig = store?.layout_config || {};
  const currentSections = Array.isArray(layoutConfig.sections) && layoutConfig.sections.length > 0
    ? layoutConfig.sections
    : [
        { id: 'hero', type: 'hero', label: 'En-tête & Bannière Principale', enabled: true },
        { id: 'catalog', type: 'catalog', label: 'Catalogue & Produits Phares', enabled: true },
        { id: 'categories', type: 'categories', label: 'Navigation par Catégories', enabled: true },
        { id: 'promo', type: 'promo', label: 'Bannière Promotionnelle', enabled: true },
        { id: 'contact', type: 'contact', label: 'Informations & Contact Direct', enabled: true },
      ];

  const handleToggleSection = (index) => {
    const next = currentSections.map((s, i) =>
      i === index ? { ...s, enabled: !s.enabled } : s
    );
    const updatedStore = {
      ...store,
      layout_config: { ...layoutConfig, sections: next },
    };
    onStoreChange(updatedStore);
  };

  const handleMove = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= currentSections.length) return;
    const next = [...currentSections];
    const item = next.splice(index, 1)[0];
    next.splice(targetIdx, 0, item);

    const updatedStore = {
      ...store,
      layout_config: { ...layoutConfig, sections: next },
    };
    onStoreChange(updatedStore);
  };

  const handleColorSelect = (color) => {
    const updatedStore = {
      ...store,
      theme_color: color,
    };
    onStoreChange(updatedStore);
  };

  const handleFieldChange = (field, value) => {
    const updatedStore = {
      ...store,
      [field]: value,
    };
    onStoreChange(updatedStore);
  };

  const handleSaveClick = async () => {
    if (onSave) {
      await onSave(store);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-slate-200">
      {/* ── Entête Tabs & Bouton Enregistrer ──────────────────────────── */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('sections')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'sections'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sections</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('style')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'style'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Style & Thème</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSaveClick}
          disabled={saving}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-semibold text-xs transition shadow-sm ${
            saveSuccess
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50'
          }`}
        >
          {saving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{saveSuccess ? 'Enregistré !' : saving ? 'Sauvegarde...' : 'Enregistrer'}</span>
        </button>
      </div>

      {/* ── Contenu de l'éditeur ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'sections' ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Ordre et Visibilité des Sections
              </span>
              <span className="text-[11px] text-slate-500">Aperçu direct à droite</span>
            </div>

            {currentSections.map((sec, idx) => (
              <div
                key={sec.id || idx}
                className={`flex items-center justify-between p-3 rounded-xl border transition ${
                  sec.enabled !== false
                    ? 'bg-slate-800/80 border-slate-700 text-white'
                    : 'bg-slate-950/60 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                    sec.enabled !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-xs font-medium truncate">{sec.label || sec.type}</span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white disabled:opacity-30 transition"
                    title="Monter"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === currentSections.length - 1}
                    className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white disabled:opacity-30 transition"
                    title="Descendre"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSection(idx)}
                    className={`p-1 rounded transition ${
                      sec.enabled !== false
                        ? 'text-emerald-400 hover:bg-emerald-950/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={sec.enabled !== false ? 'Masquer la section' : 'Afficher la section'}
                  >
                    {sec.enabled !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Palette de couleurs */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Couleur Principale de la Marque
              </label>
              <div className="grid grid-cols-2 gap-2">
                {THEME_PRESETS.map((preset) => {
                  const isSelected = (store?.theme_color || '#128C7E') === preset.color;
                  return (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => handleColorSelect(preset.color)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slogan & Description */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nom d'affichage
                </label>
                <input
                  type="text"
                  value={store?.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  placeholder="Nom de votre boutique"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Slogan / Accroche
                </label>
                <input
                  type="text"
                  value={store?.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  placeholder="Ex: Les meilleures créations artisanales de Douala"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Numéro WhatsApp de commande
                </label>
                <input
                  type="tel"
                  value={store?.whatsapp_number || store?.phone || ''}
                  onChange={(e) => handleFieldChange('whatsapp_number', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  placeholder="Ex: 237690000000"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
