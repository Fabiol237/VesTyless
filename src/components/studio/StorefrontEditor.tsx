'use client';

/**
 * VesTyle — Modern Storefront Editor (StorefrontEditor)
 * ─────────────────────────────────────────────────────────────────────────────
 * Éditeur moderne de boutique style Vercel / Stripe avec Lucide React.
 *
 * Architecture par Onglets :
 * 1. Identité & Infos : Nom, Slogan, Ville, Contact WhatsApp, Devise
 * 2. Thème & Couleurs : Color Pickers Primary/Accent avec hex en temps réel, Mode Sombre/Clair, Typographie, Rayon des angles
 * 3. Champs Polymorphes Métier : Adaptation dynamique selon la catégorie (Mode, Restauration, Élevage, Services, Hybride)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Store,
  Sparkles,
  Palette,
  Layers,
  MapPin,
  Phone,
  Coins,
  FileText,
  Sun,
  Moon,
  Type,
  Square,
  Check,
  RefreshCw,
  Save,
  ShoppingBag,
  Utensils,
  Activity,
  GraduationCap,
  LayoutGrid,
  ShieldCheck,
  Clock,
  Truck,
  DollarSign,
  ChefHat,
  Award,
  SlidersHorizontal,
  ChevronRight,
  Info,
} from 'lucide-react';
import type { StorefrontConfig, BusinessType, Theme } from '@/types/storefront';
import {
  COLOR_TOKEN_CATALOG,
  FONT_SET_CATALOG,
  LAYOUT_VARIANT_CATALOG,
} from '@/engine/themeSeed';

export interface StorefrontEditorProps {
  value: StorefrontConfig;
  onChange: (updated: StorefrontConfig) => void;
  onSave?: (updated: StorefrontConfig) => Promise<void> | void;
  className?: string;
}

type EditorTab = 'identity' | 'theme' | 'polymorphic';

export function StorefrontEditor({
  value,
  onChange,
  onSave,
  className = '',
}: StorefrontEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('identity');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Business Type resolver
  const businessType = (value.metadata?.businessType as BusinessType) || 'PHYSICAL_PRODUCT';

  // Helper to update metadata fields
  const updateMetadata = useCallback(
    (key: string, val: unknown) => {
      const updated: StorefrontConfig = {
        ...value,
        metadata: {
          ...value.metadata,
          [key]: val,
        },
        updatedAt: new Date().toISOString(),
      };
      onChange(updated);
    },
    [value, onChange]
  );

  // Helper to update theme fields
  const updateTheme = useCallback(
    (key: keyof Theme, val: unknown) => {
      const updated: StorefrontConfig = {
        ...value,
        theme: {
          ...value.theme,
          [key]: val,
        },
        updatedAt: new Date().toISOString(),
      };
      onChange(updated);
    },
    [value, onChange]
  );

  // Quick Preset Theme applicator
  const applyColorPreset = (presetKey: string) => {
    const preset = COLOR_TOKEN_CATALOG[presetKey];
    if (!preset) return;

    const isDark = value.theme?.isDark || false;
    const updated: StorefrontConfig = {
      ...value,
      theme: {
        ...value.theme,
        primaryColor: preset.primaryColor,
        accentColor: preset.accentColor,
        bgColor: isDark ? preset.bgColorDark : preset.bgColor,
        textColor: isDark ? preset.textColorDark : preset.textColor,
        borderColor: isDark ? preset.borderColorDark : preset.borderColor,
        textMutedColor: preset.textMutedColor,
      },
      updatedAt: new Date().toISOString(),
    };
    onChange(updated);
  };

  // Save handler
  const handleSave = async () => {
    if (onSave) {
      setSaveStatus('saving');
      try {
        await onSave(value);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch {
        setSaveStatus('idle');
      }
    } else {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Get Business type label & icon
  const getBusinessInfo = (type: BusinessType) => {
    switch (type) {
      case 'SERVICE':
        return { label: 'Services & Formations', icon: GraduationCap, color: 'text-blue-400' };
      case 'LIVESTOCK_PRODUCT':
        return { label: 'Élevage & Agro-Pastoral', icon: Activity, color: 'text-amber-400' };
      case 'RESTAURANT':
        return { label: 'Restauration & Carte', icon: Utensils, color: 'text-rose-400' };
      case 'HYBRID':
        return { label: 'Modèle Hybride', icon: LayoutGrid, color: 'text-purple-400' };
      case 'PHYSICAL_PRODUCT':
      default:
        return { label: 'Commerce & Mode', icon: ShoppingBag, color: 'text-emerald-400' };
    }
  };

  const currentBusiness = getBusinessInfo(businessType);
  const BusinessIcon = currentBusiness.icon;

  return (
    <div
      className={`flex flex-col rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden ${className}`}
    >
      {/* Editor Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 bg-slate-950/60 p-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Studio VesTyle Editor
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                v2.0
              </span>
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <BusinessIcon className={`h-3 w-3 ${currentBusiness.color}`} />
              <span>{currentBusiness.label}</span>
            </div>
          </div>
        </div>

        {/* Save Action */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-lg transition-all active:scale-95 ${
            saveStatus === 'saved'
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40'
          }`}
        >
          {saveStatus === 'saving' ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : saveStatus === 'saved' ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          <span>{saveStatus === 'saving' ? 'Enregistrement...' : saveStatus === 'saved' ? 'Enregistré !' : 'Enregistrer'}</span>
        </button>
      </div>

      {/* Modern Tab Bar (Vercel / Stripe Style) */}
      <div className="flex border-b border-white/5 bg-slate-950/40 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'identity'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Store className="h-3.5 w-3.5" />
          <span>1. Identité & Infos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'theme'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="h-3.5 w-3.5" />
          <span>2. Thème & Couleurs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('polymorphic')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'polymorphic'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>3. Métadonnées Métier</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-220px)]">
        {/* ── ONGLET 1 : IDENTITÉ & INFOS ── */}
        {activeTab === 'identity' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Store Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-emerald-400" />
                Nom de la Boutique *
              </label>
              <input
                type="text"
                value={value.name || ''}
                onChange={(e) => {
                  onChange({ ...value, name: e.target.value });
                }}
                placeholder="Ex: Maison Wax & Couture"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* Slogan */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Slogan & Proposition de Valeur
              </label>
              <input
                type="text"
                value={value.metadata?.slogan || ''}
                onChange={(e) => updateMetadata('slogan', e.target.value)}
                placeholder="Ex: Confection sur-mesure et prêt-à-porter haut de gamme à Douala."
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* City & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  Ville & Quartier
                </label>
                <input
                  type="text"
                  value={value.metadata?.city || ''}
                  onChange={(e) => updateMetadata('city', e.target.value)}
                  placeholder="Ex: Douala (Akwa)"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  Devise
                </label>
                <select
                  value={value.metadata?.currency || 'FCFA'}
                  onChange={(e) => updateMetadata('currency', e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="FCFA">FCFA (Franc CFA Cameroun)</option>
                  <option value="XOF">XOF (Franc CFA UEMOA)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="USD">USD ($ Dollar)</option>
                </select>
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  Numéro WhatsApp (Commandes) *
                </label>
                <input
                  type="text"
                  value={value.metadata?.whatsapp || ''}
                  onChange={(e) => updateMetadata('whatsapp', e.target.value)}
                  placeholder="+237699001122"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm font-mono text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-blue-400" />
                  Téléphone d'Appel Direct
                </label>
                <input
                  type="text"
                  value={value.metadata?.phone || ''}
                  onChange={(e) => updateMetadata('phone', e.target.value)}
                  placeholder="+237677001122"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                Description de la Boutique
              </label>
              <textarea
                rows={3}
                value={value.metadata?.description || ''}
                onChange={(e) => updateMetadata('description', e.target.value)}
                placeholder="Présentez votre histoire, votre savoir-faire et vos engagements clients..."
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        )}

        {/* ── ONGLET 2 : THÈME & COULEURS ── */}
        {activeTab === 'theme' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Quick Palettes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                Préréglages de Palettes Harmonieuses
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(COLOR_TOKEN_CATALOG).map(([pKey, pVal]) => (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => applyColorPreset(pKey)}
                    className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-950/60 p-2.5 text-left hover:border-white/20 transition-all group"
                  >
                    <div
                      className="h-6 w-6 rounded-full border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: pVal.primaryColor }}
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-white truncate">{pVal.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{pKey}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers with Hex input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
              {/* Primary Color */}
              <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Couleur Primaire</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Boutons & Accents</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={value.theme?.primaryColor || '#128C7E'}
                    onChange={(e) => updateTheme('primaryColor', e.target.value)}
                    className="h-10 w-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    type="text"
                    value={value.theme?.primaryColor || '#128C7E'}
                    onChange={(e) => updateTheme('primaryColor', e.target.value)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Couleur Secondaire (Accent)</span>
                  <span className="text-[10px] text-amber-400 font-mono">Badges & Surlignages</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={value.theme?.accentColor || '#25D366'}
                    onChange={(e) => updateTheme('accentColor', e.target.value)}
                    className="h-10 w-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    type="text"
                    value={value.theme?.accentColor || '#25D366'}
                    onChange={(e) => updateTheme('accentColor', e.target.value)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Dark mode & Typography */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mode Sombre / Clair */}
              <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 flex flex-col justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Ambiance Visuelle
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateTheme('isDark', false);
                      updateTheme('mode', 'light');
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      !value.theme?.isDark
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-white/5 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    <span>Mode Clair</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateTheme('isDark', true);
                      updateTheme('mode', 'dark');
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      value.theme?.isDark
                        ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                        : 'border-white/5 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    <span>Mode Sombre</span>
                  </button>
                </div>
              </div>

              {/* Border Radius Geometry */}
              <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Square className="h-3.5 w-3.5 text-slate-400" />
                  Style des Angles (Bordures)
                </label>
                <select
                  value={value.theme?.borderRadius || 'smooth'}
                  onChange={(e) => updateTheme('borderRadius', e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="sharp">Sharp & Carré (0px - 2px)</option>
                  <option value="smooth">Smooth & Moderne (12px)</option>
                  <option value="full">Full & Arrondi (20px)</option>
                  <option value="pill">Pill & Gélule (Plein)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── ONGLET 3 : CHAMPS POLYMORPHES MÉTIER ── */}
        {activeTab === 'polymorphic' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-start gap-3">
              <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                Ces paramètres sectoriels enrichissent la fiche de votre boutique et s'adaptent automatiquement à votre modèle d'activité ({currentBusiness.label}).
              </div>
            </div>

            {/* Vertical A : MODE & COMMERCE PHYSIQUE */}
            {businessType === 'PHYSICAL_PRODUCT' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-emerald-400" />
                    Politique d'Essayage & Livraison
                  </label>
                  <input
                    type="text"
                    value={(value.metadata?.fittingPolicy as string) || ''}
                    onChange={(e) => updateMetadata('fittingPolicy', e.target.value)}
                    placeholder="Ex: Essayage gratuit possible à la livraison sur Douala & Yaoundé."
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Délai de Livraison Standard
                    </label>
                    <input
                      type="text"
                      value={(value.metadata?.deliveryDelay as string) || ''}
                      onChange={(e) => updateMetadata('deliveryDelay', e.target.value)}
                      placeholder="Ex: 2h à 24h"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Garantie d'Échange
                    </label>
                    <input
                      type="text"
                      value={(value.metadata?.returnWindow as string) || ''}
                      onChange={(e) => updateMetadata('returnWindow', e.target.value)}
                      placeholder="Ex: 7 jours pour échange"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Vertical B : RESTAURATION & MENU */}
            {businessType === 'RESTAURANT' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-rose-400" />
                      Temps Moyen de Préparation
                    </label>
                    <input
                      type="text"
                      value={(value.metadata?.averagePrepTime as string) || ''}
                      onChange={(e) => updateMetadata('averagePrepTime', e.target.value)}
                      placeholder="Ex: 20 à 35 minutes"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                      Montant Commande Minimum
                    </label>
                    <input
                      type="text"
                      value={(value.metadata?.minOrderAmount as string) || ''}
                      onChange={(e) => updateMetadata('minOrderAmount', e.target.value)}
                      placeholder="Ex: 3 000 FCFA"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ChefHat className="h-3.5 w-3.5 text-rose-400" />
                    Spécialité Signée du Chef
                  </label>
                  <input
                    type="text"
                    value={(value.metadata?.chefSpecialty as string) || ''}
                    onChange={(e) => updateMetadata('chefSpecialty', e.target.value)}
                    placeholder="Ex: Ndolé Royal aux Crevettes & Bar Braisé aux Épices"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Vertical C : ÉLEVAGE & AGRO-PASTORAL */}
            {businessType === 'LIVESTOCK_PRODUCT' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Engagements Sanitaires & Vétérinaires
                  </label>
                  <input
                    type="text"
                    value={(value.metadata?.veterinaryOversight as string) || ''}
                    onChange={(e) => updateMetadata('veterinaryOversight', e.target.value)}
                    placeholder="Ex: Carnet vaccinal à jour fourni + Suivi par le Dr. Vétérinaire Assermenté."
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Acompte Réservation Bétail
                    </label>
                    <input
                      type="text"
                      value={(value.metadata?.depositPercentage as string) || ''}
                      onChange={(e) => updateMetadata('depositPercentage', e.target.value)}
                      placeholder="Ex: 25% à la réservation"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Zones d'Acheminement Bétail
                    </label>
                    <input
                      type="text"
                      value={(value.metadata?.shippingZones as string) || ''}
                      onChange={(e) => updateMetadata('shippingZones', e.target.value)}
                      placeholder="Ex: Littoral, Centre, Ouest"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Vertical D : SERVICES & FORMATIONS */}
            {businessType === 'SERVICE' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                    Public Cible & Formats d'Enseignement
                  </label>
                  <input
                    type="text"
                    value={(value.metadata?.targetAudience as string) || ''}
                    onChange={(e) => updateMetadata('targetAudience', e.target.value)}
                    placeholder="Ex: Élèves Terminale C/D, Candidats concours Polytechnique & ENAM"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Modalités de Réservation
                    </label>
                    <input
                      type="text"
                      value={(value.metadata?.bookingMode as string) || ''}
                      onChange={(e) => updateMetadata('bookingMode', e.target.value)}
                      placeholder="Ex: Sur rendez-vous / Test de niveau"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Supports Pédagogiques
                    </label>
                    <input
                      type="text"
                      value={(value.metadata?.learningMaterials as string) || ''}
                      onChange={(e) => updateMetadata('learningMaterials', e.target.value)}
                      placeholder="Ex: Fiches PDF & Annales incluses"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Vertical E : HYBRID / ARTISAN */}
            {(businessType === 'HYBRID' || businessType === 'ARTISAN') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-purple-400" />
                    Délai de Confection & Options Personnalisées
                  </label>
                  <input
                    type="text"
                    value={(value.metadata?.craftDelay as string) || ''}
                    onChange={(e) => updateMetadata('craftDelay', e.target.value)}
                    placeholder="Ex: 5 à 10 jours ouvrés pour création sur-mesure."
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StorefrontEditor;
