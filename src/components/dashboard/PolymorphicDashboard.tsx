'use client';

/**
 * VesTyle — Polymorphic Merchant Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * Tableau de bord marchand hautement modulaire et réactif s'adaptant
 * dynamiquement au vertical métier de la boutique (PHYSICAL_PRODUCT, SERVICE,
 * LIVESTOCK_PRODUCT, RESTAURANT, HYBRID).
 *
 * Architecture :
 * 1. En-tête Universel & Partage de Vitrine (URL copier/coller, KPIs express)
 * 2. Customisation Express ThemeSeed (Graines visuelles, palettes, mode sombre)
 * 3. CRM WhatsApp Leads (Suivi des prospects & déclencheur direct WhatsApp)
 * 4. Gestionnaire de Catalogue Polymorphe (Champs et vues adaptés au métier)
 * 5. Modal d'Ajout / Édition d'Articles Polymorphe
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Store,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Palette,
  Sun,
  Moon,
  RefreshCw,
  Save,
  MessageCircle,
  Send,
  Clock,
  User,
  Phone,
  Filter,
  Package,
  Layers,
  Tag,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Activity,
  HeartPulse,
  Utensils,
  ChefHat,
  Flame,
  Star,
  LayoutGrid,
  Search,
  CheckCircle2,
  X,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

import type { StorefrontConfig, BusinessType } from '@/types/storefront';
import {
  decodeSeed,
  generateSeed,
  seedToTheme,
  COLOR_TOKEN_CATALOG,
  LAYOUT_VARIANT_CATALOG,
  FONT_SET_CATALOG,
  type ThemeSeedConfig,
} from '@/engine/themeSeed';

// ── TYPES & INTERFACES ────────────────────────────────────────────────────────

export interface LeadItem {
  id: string;
  customerName: string;
  phone: string;
  createdAt: string;
  productInterest?: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CANCELLED';
  notes?: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  imageUrl?: string;
  inStock?: boolean;
  stockCount?: number;
  metadata?: {
    // Physical Product
    sizes?: string[];
    colors?: string[];
    sku?: string;
    // Service
    audienceLevel?: string; // ex: "Tous niveaux", "Concours", "Débutant"
    duration?: string;      // ex: "1h30", "Session mensuelle"
    format?: string;        // ex: "Présentiel", "En ligne", "Hybride"
    // Livestock
    breed?: string;         // ex: "Goudali", "Poulet Goliath", "Chèvre du Sahel"
    weight?: string;        // ex: "450 kg", "2.8 kg"
    age?: string;           // ex: "3 ans", "6 mois"
    isVaccinated?: boolean;
    vaccineDetails?: string;
    depositRequired?: number;
    // Restaurant
    isDailySpecial?: boolean; // Plat du jour
    dishCategory?: 'ENTREE' | 'PLAT' | 'BOISSON' | 'DESSERT' | 'SNACK';
    prepTimeMinutes?: number;
    ingredients?: string[];
    isSpicy?: boolean;
    // Hybrid / Generic
    itemType?: 'PRODUCT' | 'SERVICE';
    [key: string]: unknown;
  };
}

export interface PolymorphicDashboardProps {
  key?: React.Key;
  storeConfig: StorefrontConfig;
  items?: CatalogItem[];
  leads?: LeadItem[];
  onSaveConfig?: (updatedConfig: StorefrontConfig) => Promise<{ success: boolean; error?: string } | void> | { success: boolean; error?: string } | void;
  onAddItem?: (item: Omit<CatalogItem, 'id'>) => Promise<void> | void;
  onUpdateItem?: (item: CatalogItem) => Promise<void> | void;
  onDeleteItem?: (itemId: string) => Promise<void> | void;
}

// ── 1. EN-TÊTE UNIVERSEL & PARTAGE DE VITRINE ─────────────────────────────────

export function UniversalHeaderBlock({
  storeConfig,
  itemsCount,
  leadsCount,
}: {
  storeConfig: StorefrontConfig;
  itemsCount: number;
  leadsCount: number;
}) {
  const [copied, setCopied] = useState(false);
  const storeId = storeConfig.id || 'demo-store';
  const storeName = storeConfig.name || 'Ma Boutique VesTyle';
  const businessType = (storeConfig.metadata?.businessType as BusinessType) || 'PHYSICAL_PRODUCT';
  const city = storeConfig.metadata?.city || 'Cameroun';
  const currency = storeConfig.metadata?.currency || 'FCFA';

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/boutique/${storeId}`
    : `https://vestyle.app/boutique/${storeId}`;

  const handleCopyLink = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  }, [publicUrl]);

  const getVerticalBadge = (type: BusinessType) => {
    switch (type) {
      case 'PHYSICAL_PRODUCT':
        return { label: 'Commerce & Boutique', icon: Package, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'SERVICE':
        return { label: 'Prestations & Formations', icon: GraduationCap, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'LIVESTOCK_PRODUCT':
        return { label: 'Élevage & Agro-Pastoral', icon: Activity, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'RESTAURANT':
        return { label: 'Restauration & Menu', icon: Utensils, color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'HYBRID':
        return { label: 'Catalogue Hybride', icon: LayoutGrid, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      default:
        return { label: 'Artisanat & Atelier', icon: Store, color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' };
    }
  };

  const vertical = getVerticalBadge(businessType);
  const VerticalIcon = vertical.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 p-5 md:p-7 shadow-2xl backdrop-blur-xl">
      {/* Decorative Glow */}
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Store Info */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Store className="h-7 w-7 text-emerald-400" />
              {storeName}
            </h1>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              En ligne
            </div>
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${vertical.color}`}>
              <VerticalIcon className="h-3.5 w-3.5" />
              {vertical.label}
            </div>
          </div>

          <p className="text-sm text-slate-400">
            {storeConfig.metadata?.slogan || 'Vitrine active optimisée pour WhatsApp et Mobile Money.'} •{' '}
            <span className="text-slate-300 font-medium">{city}</span>
          </p>
        </div>

        {/* Quick Micro KPIs */}
        <div className="flex items-center gap-3">
          <div className="flex-1 md:flex-initial rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-center">
            <div className="text-xs text-slate-400 font-medium">Articles au catalogue</div>
            <div className="text-lg font-bold text-white">{itemsCount}</div>
          </div>
          <div className="flex-1 md:flex-initial rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-center">
            <div className="text-xs text-slate-400 font-medium">Leads WhatsApp</div>
            <div className="text-lg font-bold text-emerald-400">{leadsCount}</div>
          </div>
          <div className="flex-1 md:flex-initial rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-center">
            <div className="text-xs text-slate-400 font-medium">Devise</div>
            <div className="text-lg font-bold text-amber-400">{currency}</div>
          </div>
        </div>
      </div>

      {/* URL Share & Action Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-5 border-t border-white/5">
        <div className="relative flex-1">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 select-all pr-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            Lien public
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyLink}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all shadow-lg active:scale-95 ${
            copied
              ? 'bg-emerald-500 text-white shadow-emerald-500/25'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/30'
          }`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Lien copié !' : 'Copier le lien vitrine'}
        </button>

        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ExternalLink className="h-4 w-4 text-slate-400" />
          <span>Voir ma vitrine</span>
        </a>
      </div>
    </div>
  );
}

// ── 2. CUSTOMISATION EXPRESS (THEME SEED ENGINE) ──────────────────────────────

export function ThemeSeedExpressCustomizer({
  storeConfig,
  onSaveTheme,
}: {
  storeConfig: StorefrontConfig;
  onSaveTheme: (newSeedCode: string, resolvedTheme: ThemeSeedConfig) => Promise<void>;
}) {
  // Initial seed from storeConfig or generate default
  const defaultBlueprint = (storeConfig.metadata?.businessType as string) || 'BP01';
  const initialSeed = useMemo(() => {
    return generateSeed(
      defaultBlueprint.slice(0, 4),
      'CLR01',
      'F01',
      'VB',
      storeConfig.theme?.isDark || false
    );
  }, [defaultBlueprint, storeConfig.theme?.isDark]);

  const [seedInput, setSeedInput] = useState<string>(initialSeed);
  const [activePalette, setActivePalette] = useState<string>('CLR01');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storeConfig.theme?.isDark || false);
  const [selectedLayout, setSelectedLayout] = useState<string>('VB');
  const [saving, setSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Decode live seed
  const decodedConfig = useMemo(() => {
    return decodeSeed(seedInput);
  }, [seedInput]);

  // Sync controls when seed input changes manually
  const handleSeedInputChange = (value: string) => {
    setSeedInput(value);
    const decoded = decodeSeed(value);
    setActivePalette(decoded.colorTokenId);
    setIsDarkMode(decoded.isDark);
    setSelectedLayout(decoded.layoutVariant);
    setSaveStatus('idle');
  };

  // Click quick color swatch
  const handleSelectPalette = (paletteId: string) => {
    setActivePalette(paletteId);
    const updated = generateSeed(
      decodedConfig.blueprintId,
      paletteId,
      decodedConfig.fontSetId,
      selectedLayout,
      isDarkMode
    );
    setSeedInput(updated);
    setSaveStatus('idle');
  };

  // Toggle Dark Mode
  const handleToggleDark = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    const updated = generateSeed(
      decodedConfig.blueprintId,
      activePalette,
      decodedConfig.fontSetId,
      selectedLayout,
      nextDark
    );
    setSeedInput(updated);
    setSaveStatus('idle');
  };

  // Change Layout Variant
  const handleLayoutChange = (layoutKey: string) => {
    setSelectedLayout(layoutKey);
    const updated = generateSeed(
      decodedConfig.blueprintId,
      activePalette,
      decodedConfig.fontSetId,
      layoutKey,
      isDarkMode
    );
    setSeedInput(updated);
    setSaveStatus('idle');
  };

  // Save changes
  const handleSave = async () => {
    try {
      setSaving(true);
      await onSaveTheme(seedInput, decodedConfig);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const palettesList = Object.entries(COLOR_TOKEN_CATALOG);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 md:p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Customisation Express
              <span className="text-xs font-normal text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                ThemeSeed Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Changez l'apparence instantanément en modifiant le code de thème ou en sélectionnant une palette.
            </p>
          </div>
        </div>

        {/* Dark mode switch */}
        <button
          type="button"
          onClick={handleToggleDark}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
        >
          {isDarkMode ? (
            <>
              <Moon className="h-4 w-4 text-purple-400" />
              <span>Mode Sombre</span>
            </>
          ) : (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span>Mode Clair</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Seed Input & Decoded Preview */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Signature Visuelle (Code ThemeSeed)
            </label>
            <div className="relative">
              <input
                type="text"
                value={seedInput}
                onChange={(e) => handleSeedInputChange(e.target.value)}
                placeholder="Ex: VST-BP01-CLR03-F02-VB"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/90 px-4 py-2.5 text-sm font-mono text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                Graine v2
              </span>
            </div>
          </div>

          {/* Live Decoded Badge */}
          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3.5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Palette :</span>
              <div
                className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: decodedConfig.resolvedTheme.primaryColor }}
              />
              <span className="text-xs font-medium text-slate-200">
                {COLOR_TOKEN_CATALOG[decodedConfig.colorTokenId]?.label || decodedConfig.colorTokenId}
              </span>
            </div>

            <div className="h-3 w-px bg-white/10" />

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Police :</span>
              <span className="text-xs font-medium text-slate-200">
                {decodedConfig.resolvedTheme.font}
              </span>
            </div>

            <div className="h-3 w-px bg-white/10" />

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Forme :</span>
              <span className="text-xs font-medium text-purple-300">
                {decodedConfig.resolvedTheme.borderRadius}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Color Swatches & Layout Selector */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Palettes de Couleurs Recommandées
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {palettesList.map(([key, pal]) => {
                const isSelected = activePalette === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectPalette(key)}
                    title={pal.label}
                    className={`group relative flex flex-col items-center gap-1 rounded-xl p-2 border transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10 shadow-md shadow-purple-500/10 scale-105'
                        : 'border-white/5 bg-slate-950/40 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="h-5 w-5 rounded-full border border-white/10 shadow-sm transition-transform group-hover:scale-110"
                      style={{ backgroundColor: pal.primaryColor }}
                    />
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-200">
                      {key}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Layout Geometry */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Style des Angles & Cartes
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(LAYOUT_VARIANT_CATALOG).slice(0, 3).map(([vKey, vVal]) => {
                const isSelected = selectedLayout === vKey;
                return (
                  <button
                    key={vKey}
                    type="button"
                    onClick={() => handleLayoutChange(vKey)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border text-center transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                        : 'border-white/5 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {vVal.label.split('&')[0]} ({vKey})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button & Feedback */}
      <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs">
          {saveStatus === 'success' && (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Thème enregistré avec succès !
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-rose-400 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Erreur lors de l'enregistrement.
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all active:scale-95"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{saving ? 'Sauvegarde...' : 'Appliquer & Sauvegarder le thème'}</span>
        </button>
      </div>
    </div>
  );
}

// ── 3. CRM WHATSAPP LEADS MANAGER ─────────────────────────────────────────────

export function WhatsAppLeadsManager({
  leads = [],
  storeName,
}: {
  leads: LeadItem[];
  storeName: string;
}) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = filterStatus === 'ALL' || lead.status === filterStatus;
      const matchesSearch =
        lead.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        (lead.productInterest && lead.productInterest.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [leads, filterStatus, searchQuery]);

  const handleLaunchWhatsApp = (lead: LeadItem) => {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const greeting = encodeURIComponent(
      `Bonjour ${lead.customerName}, j'ai bien reçu votre demande concernant "${lead.productInterest || 'nos articles'}" sur la boutique ${storeName}. Comment puis-je vous aider ?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${greeting}`, '_blank');
  };

  const getStatusBadge = (status: LeadItem['status']) => {
    switch (status) {
      case 'NEW':
        return { label: 'Nouveau', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'CONTACTED':
        return { label: 'Contacté', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'CONVERTED':
        return { label: 'Converti', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      default:
        return { label: 'Fermé', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 md:p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              CRM WhatsApp & Contacts
              <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {leads.length} leads
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Clients ayant initié une commande ou une prise de contact depuis votre vitrine.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un prospect..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950/80 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="NEW">Nouveaux</option>
            <option value="CONTACTED">Contactés</option>
            <option value="CONVERTED">Convertis</option>
          </select>
        </div>
      </div>

      {/* Leads List / Table */}
      {filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-950/30 p-8 text-center">
          <MessageCircle className="h-10 w-10 text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-300">Aucun contact trouvé</p>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Dès que des visiteurs cliqueront sur vos boutons de commande WhatsApp, leurs coordonnées apparaîtront automatiquement ici.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Prospect</th>
                <th className="pb-3">Intérêt / Produit</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map((lead) => {
                const badge = getStatusBadge(lead.status);
                return (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-bold text-xs">
                          {lead.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{lead.customerName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{lead.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-300 font-medium">
                      {lead.productInterest || 'Visite générale'}
                    </td>
                    <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                      {lead.createdAt}
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <button
                        type="button"
                        onClick={() => handleLaunchWhatsApp(lead)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow transition-all active:scale-95"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Répondre</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── 4. SOUS-VUES DE CATALOGUE POLYMORPHE ──────────────────────────────────────

// A. Vue Physical Product
export function PhysicalCatalogView({
  items,
  onEdit,
  onDelete,
  currency,
}: {
  items: CatalogItem[];
  onEdit: (item: CatalogItem) => void;
  onDelete: (id: string) => void;
  currency: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-white/5 bg-slate-950/60 p-4 flex flex-col justify-between hover:border-white/15 transition-all group"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {item.name}
                </h3>
                <span className="text-[11px] text-slate-400">{item.category || 'Article'}</span>
              </div>
              <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20 font-mono">
                {item.price.toLocaleString('fr-FR')} {currency}
              </span>
            </div>

            {item.description && (
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">{item.description}</p>
            )}

            {/* Stock & Variants */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                (item.stockCount ?? 1) > 0 ? 'bg-slate-800 text-slate-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                <Package className="h-3 w-3" />
                Stock: {item.stockCount ?? 'En stock'}
              </span>

              {item.metadata?.sizes && item.metadata.sizes.length > 0 && (
                <span className="text-[10px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded">
                  Tailles: {item.metadata.sizes.join(', ')}
                </span>
              )}

              {item.metadata?.colors && item.metadata.colors.length > 0 && (
                <span className="text-[10px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded">
                  Couleurs: {item.metadata.colors.join(', ')}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
              title="Modifier"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// B. Vue Service
export function ServiceCatalogView({
  items,
  onEdit,
  onDelete,
  currency,
}: {
  items: CatalogItem[];
  onEdit: (item: CatalogItem) => void;
  onDelete: (id: string) => void;
  currency: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-white/5 bg-slate-950/60 p-4 flex flex-col justify-between hover:border-white/15 transition-all group"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  {item.name}
                </h3>
                <span className="text-[11px] text-slate-400">{item.category || 'Prestation'}</span>
              </div>
              <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/20 font-mono">
                {item.price.toLocaleString('fr-FR')} {currency}
              </span>
            </div>

            {item.description && (
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">{item.description}</p>
            )}

            <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-slate-400">Public :</span>
                <span className="font-medium text-slate-200">{item.metadata?.audienceLevel || 'Tous niveaux'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-slate-400">Durée / Format :</span>
                <span className="font-medium text-slate-200">{item.metadata?.duration || '1 heure'} • {item.metadata?.format || 'Présentiel / En ligne'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
              title="Modifier"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// C. Vue Livestock / Cheptel
export function LivestockCatalogView({
  items,
  onEdit,
  onDelete,
  currency,
}: {
  items: CatalogItem[];
  onEdit: (item: CatalogItem) => void;
  onDelete: (id: string) => void;
  currency: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const isVaccinated = item.metadata?.isVaccinated ?? true;
        return (
          <div
            key={item.id}
            className="rounded-xl border border-white/5 bg-slate-950/60 p-4 flex flex-col justify-between hover:border-white/15 transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-amber-400" />
                    {item.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">Race: {item.metadata?.breed || item.category || 'Bétail'}</span>
                </div>
                <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/20 font-mono">
                  {item.price.toLocaleString('fr-FR')} {currency}
                </span>
              </div>

              {item.description && (
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{item.description}</p>
              )}

              {/* Health & Specs */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Poids & Âge :</span>
                  <span className="font-medium text-slate-200 font-mono">
                    {item.metadata?.weight || '350 kg'} • {item.metadata?.age || '2 ans'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Statut Vaccinal :</span>
                  {isVaccinated ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      Vacciné & Certifié
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                      <AlertTriangle className="h-3 w-3" />
                      En attente / Non vacciné
                    </span>
                  )}
                </div>

                {item.metadata?.depositRequired ? (
                  <div className="text-[10px] text-amber-300/80 bg-amber-500/5 p-1.5 rounded border border-amber-500/10">
                    Acompte requis : {Number(item.metadata.depositRequired).toLocaleString('fr-FR')} {currency}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                title="Modifier"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// D. Vue Restaurant / Menu
export function RestaurantCatalogView({
  items,
  onEdit,
  onDelete,
  onToggleDailySpecial,
  currency,
}: {
  items: CatalogItem[];
  onEdit: (item: CatalogItem) => void;
  onDelete: (id: string) => void;
  onToggleDailySpecial: (item: CatalogItem) => void;
  currency: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const isDailySpecial = item.metadata?.isDailySpecial ?? false;
        return (
          <div
            key={item.id}
            className={`rounded-xl border p-4 flex flex-col justify-between transition-all group ${
              isDailySpecial
                ? 'border-amber-500/40 bg-amber-950/20 shadow-lg shadow-amber-900/10'
                : 'border-white/5 bg-slate-950/60 hover:border-white/15'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                      {item.name}
                    </h3>
                    {isDailySpecial && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <Star className="h-2.5 w-2.5 fill-amber-300" />
                        Plat du jour
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{item.metadata?.dishCategory || item.category || 'Plat principal'}</span>
                </div>
                <span className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-400 border border-rose-500/20 font-mono">
                  {item.price.toLocaleString('fr-FR')} {currency}
                </span>
              </div>

              {item.description && (
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{item.description}</p>
              )}

              {/* Ingredients & Prep */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5 text-xs text-slate-300">
                {item.metadata?.ingredients && item.metadata.ingredients.length > 0 && (
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500">Ingrédients : </span>
                    {item.metadata.ingredients.join(', ')}
                  </div>
                )}
                {item.metadata?.prepTimeMinutes && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-rose-400" />
                    <span>Préparation : {item.metadata.prepTimeMinutes} min</span>
                  </div>
                )}
              </div>
            </div>

            {/* Toggle Daily Special & Actions */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => onToggleDailySpecial(item)}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                  isDailySpecial
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Star className={`h-3 w-3 ${isDailySpecial ? 'fill-amber-300' : ''}`} />
                <span>{isDailySpecial ? 'Plat du jour actif' : 'Mettre en vedette'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// E. Vue Hybrid
export function HybridCatalogView({
  items,
  onEdit,
  onDelete,
  currency,
}: {
  items: CatalogItem[];
  onEdit: (item: CatalogItem) => void;
  onDelete: (id: string) => void;
  currency: string;
}) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PRODUCTS' | 'SERVICES'>('ALL');

  const filtered = useMemo(() => {
    if (activeTab === 'PRODUCTS') {
      return items.filter((i) => i.metadata?.itemType === 'PRODUCT' || (!i.metadata?.itemType && (i.stockCount !== undefined || i.metadata?.sizes)));
    }
    if (activeTab === 'SERVICES') {
      return items.filter((i) => i.metadata?.itemType === 'SERVICE' || i.metadata?.duration || i.metadata?.audienceLevel);
    }
    return items;
  }, [items, activeTab]);

  return (
    <div className="flex flex-col gap-4">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'ALL'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tous les articles ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PRODUCTS')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'PRODUCTS'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Produits physiques
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SERVICES')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'SERVICES'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Prestations & Formations
        </button>
      </div>

      <PhysicalCatalogView
        items={filtered}
        onEdit={onEdit}
        onDelete={onDelete}
        currency={currency}
      />
    </div>
  );
}

// ── 5. GESTIONNAIRE DE CATALOGUE POLYMORPHE (SWITCH PRINCIPAL) ────────────────

export function PolymorphicCatalogManager({
  storeConfig,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleDailySpecial,
}: {
  storeConfig: StorefrontConfig;
  items: CatalogItem[];
  onAddItem: () => void;
  onEditItem: (item: CatalogItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleDailySpecial: (item: CatalogItem) => void;
}) {
  const businessType = (storeConfig.metadata?.businessType as BusinessType) || 'PHYSICAL_PRODUCT';
  const currency = storeConfig.metadata?.currency || 'FCFA';

  const renderCatalogView = () => {
    switch (businessType) {
      case 'SERVICE':
        return (
          <ServiceCatalogView
            items={items}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            currency={currency}
          />
        );
      case 'LIVESTOCK_PRODUCT':
        return (
          <LivestockCatalogView
            items={items}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            currency={currency}
          />
        );
      case 'RESTAURANT':
        return (
          <RestaurantCatalogView
            items={items}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            onToggleDailySpecial={onToggleDailySpecial}
            currency={currency}
          />
        );
      case 'HYBRID':
        return (
          <HybridCatalogView
            items={items}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            currency={currency}
          />
        );
      case 'PHYSICAL_PRODUCT':
      default:
        return (
          <PhysicalCatalogView
            items={items}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            currency={currency}
          />
        );
    }
  };

  const getAddButtonText = (type: BusinessType) => {
    switch (type) {
      case 'SERVICE':
        return 'Ajouter une prestation';
      case 'LIVESTOCK_PRODUCT':
        return 'Ajouter une bête / lot';
      case 'RESTAURANT':
        return 'Ajouter un plat au menu';
      case 'HYBRID':
        return 'Ajouter un article';
      default:
        return 'Ajouter un produit';
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 md:p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Gestion du Catalogue
            <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-white/5">
              {items.length} articles
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Catalogue dynamique adapté à votre modèle métier ({businessType}).
          </p>
        </div>

        <button
          type="button"
          onClick={onAddItem}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{getAddButtonText(businessType)}</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-950/30 p-8 text-center">
          <Package className="h-10 w-10 text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-300">Catalogue vide pour le moment</p>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            Commencez par ajouter votre premier article pour alimenter votre vitrine.
          </p>
          <button
            type="button"
            onClick={onAddItem}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{getAddButtonText(businessType)}</span>
          </button>
        </div>
      ) : (
        renderCatalogView()
      )}
    </div>
  );
}

// ── 6. MODAL POLYMORPHE D'AJOUT & ÉDITION D'ARTICLE ──────────────────────────

export function AddEditItemModal({
  isOpen,
  onClose,
  onSave,
  businessType,
  initialItem,
  currency,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<CatalogItem, 'id'> | CatalogItem) => void;
  businessType: BusinessType;
  initialItem?: CatalogItem | null;
  currency: string;
}) {
  const [name, setName] = useState<string>(initialItem?.name || '');
  const [price, setPrice] = useState<number | ''>(initialItem?.price ?? '');
  const [category, setCategory] = useState<string>(initialItem?.category || '');
  const [description, setDescription] = useState<string>(initialItem?.description || '');

  // Specific state based on business type
  const [stockCount, setStockCount] = useState<number | ''>(initialItem?.stockCount ?? 10);
  const [sizesInput, setSizesInput] = useState<string>(initialItem?.metadata?.sizes?.join(', ') || '');
  const [audienceLevel, setAudienceLevel] = useState<string>(initialItem?.metadata?.audienceLevel || 'Tous niveaux');
  const [duration, setDuration] = useState<string>(initialItem?.metadata?.duration || '1h');
  const [breed, setBreed] = useState<string>(initialItem?.metadata?.breed || '');
  const [weight, setWeight] = useState<string>(initialItem?.metadata?.weight || '');
  const [isVaccinated, setIsVaccinated] = useState<boolean>(initialItem?.metadata?.isVaccinated ?? true);
  const [dishCategory, setDishCategory] = useState<string>(initialItem?.metadata?.dishCategory || 'PLAT');
  const [isDailySpecial, setIsDailySpecial] = useState<boolean>(initialItem?.metadata?.isDailySpecial ?? false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price === '') return;

    const basePayload: any = {
      name,
      price: Number(price),
      category: category || undefined,
      description: description || undefined,
      metadata: {},
    };

    if (initialItem?.id) {
      basePayload.id = initialItem.id;
    }

    // Inject specific metadata
    switch (businessType) {
      case 'SERVICE':
        basePayload.metadata = {
          audienceLevel,
          duration,
          format: 'Présentiel / En ligne',
        };
        break;
      case 'LIVESTOCK_PRODUCT':
        basePayload.metadata = {
          breed: breed || name,
          weight: weight || '400 kg',
          isVaccinated,
        };
        break;
      case 'RESTAURANT':
        basePayload.metadata = {
          dishCategory,
          isDailySpecial,
        };
        break;
      case 'PHYSICAL_PRODUCT':
      default:
        basePayload.stockCount = stockCount === '' ? 0 : Number(stockCount);
        basePayload.metadata = {
          sizes: sizesInput ? sizesInput.split(',').map((s) => s.trim()).filter(Boolean) : [],
        };
        break;
    }

    onSave(basePayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">
            {initialItem ? 'Modifier l’article' : 'Ajouter un nouvel article'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nom de l'article / Intitulé *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Robe de Soirée, Bœuf Goudali, Cours de Maths..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Prix ({currency}) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="25000"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Catégorie
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Vêtements, Bovins, Menu..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Vertical Specific Fields */}
          {businessType === 'PHYSICAL_PRODUCT' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Quantité en Stock
                </label>
                <input
                  type="number"
                  min={0}
                  value={stockCount}
                  onChange={(e) => setStockCount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tailles (séparées par virgule)
                </label>
                <input
                  type="text"
                  value={sizesInput}
                  onChange={(e) => setSizesInput(e.target.value)}
                  placeholder="S, M, L, XL"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          )}

          {businessType === 'SERVICE' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Public Cible / Niveau
                </label>
                <input
                  type="text"
                  value={audienceLevel}
                  onChange={(e) => setAudienceLevel(e.target.value)}
                  placeholder="Tous niveaux, Terminale, Débutants"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Durée
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="1h30, Forfait 5 cours"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          )}

          {businessType === 'LIVESTOCK_PRODUCT' && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Race / Espèce
                  </label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="Goudali, Goliath, Porc Landrace"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Poids / Âge
                  </label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="450 kg - 3 ans"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modalVaccinated"
                  checked={isVaccinated}
                  onChange={(e) => setIsVaccinated(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="modalVaccinated" className="text-xs text-slate-300 font-medium">
                  Sujet vacciné & suivi vétérinaire à jour (Badge vert)
                </label>
              </div>
            </div>
          )}

          {businessType === 'RESTAURANT' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Type de Plat
                </label>
                <select
                  value={dishCategory}
                  onChange={(e) => setDishCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="ENTREE">Entrée / Apéritif</option>
                  <option value="PLAT">Plat Principal</option>
                  <option value="BOISSON">Boisson / Cocktail</option>
                  <option value="DESSERT">Dessert</option>
                  <option value="SNACK">Grillade / Snack</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modalDailySpecial"
                  checked={isDailySpecial}
                  onChange={(e) => setIsDailySpecial(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="modalDailySpecial" className="text-xs text-slate-300 font-medium">
                  Définir comme « Plat du Jour » ⭐ (Mise en avant sur la vitrine)
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description (optionnel)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails, ingrédients ou caractéristiques..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
            >
              {initialItem ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 7. COMPOSANT RACINE DU DASHBOARD POLYMORPHE ───────────────────────────────

export default function PolymorphicDashboard({
  storeConfig,
  items: initialItems = [],
  leads: initialLeads = [],
  onSaveConfig,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: PolymorphicDashboardProps) {
  const [items, setItems] = useState<CatalogItem[]>(initialItems);
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  const businessType = (storeConfig.metadata?.businessType as BusinessType) || 'PHYSICAL_PRODUCT';
  const currency = storeConfig.metadata?.currency || 'FCFA';

  // Handle Theme Seed Save
  const handleSaveThemeSeed = useCallback(
    async (seedCode: string, decodedSeed: ThemeSeedConfig) => {
      const updatedTheme = seedToTheme(decodedSeed);
      const updatedConfig: StorefrontConfig = {
        ...storeConfig,
        theme: updatedTheme,
        updatedAt: new Date().toISOString(),
      };

      if (onSaveConfig) {
        await onSaveConfig(updatedConfig);
        return;
      }

      // Default API call if no handler passed
      try {
        const res = await fetch('/api/store/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId: storeConfig.id,
            draftConfig: updatedConfig,
          }),
        });

        if (!res.ok) {
          throw new Error('Erreur lors de la sauvegarde du thème.');
        }
      } catch (err) {
        console.error('[Dashboard] Erreur sauvegarde config:', err);
        throw err;
      }
    },
    [storeConfig, onSaveConfig]
  );

  // Handle Add / Edit Item
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSaveModalItem = (itemData: any) => {
    if (itemData.id) {
      // Update
      setItems((prev) => prev.map((i) => (i.id === itemData.id ? itemData : i)));
      if (onUpdateItem) onUpdateItem(itemData);
    } else {
      // Create new
      const newItem: CatalogItem = {
        ...itemData,
        id: `item_${Date.now()}`,
      };
      setItems((prev) => [newItem, ...prev]);
      if (onAddItem) onAddItem(itemData);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    if (onDeleteItem) onDeleteItem(itemId);
  };

  const handleToggleDailySpecial = (item: CatalogItem) => {
    const updated: CatalogItem = {
      ...item,
      metadata: {
        ...item.metadata,
        isDailySpecial: !item.metadata?.isDailySpecial,
      },
    };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    if (onUpdateItem) onUpdateItem(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Bloc Universel : En-tête & URL */}
      <UniversalHeaderBlock
        storeConfig={storeConfig}
        itemsCount={items.length}
        leadsCount={leads.length}
      />

      {/* 2. Bloc Universel : Customisation Express ThemeSeed */}
      <ThemeSeedExpressCustomizer
        storeConfig={storeConfig}
        onSaveTheme={handleSaveThemeSeed}
      />

      {/* 3. Bloc Polymorphe : Gestionnaire de Catalogue */}
      <PolymorphicCatalogManager
        storeConfig={storeConfig}
        items={items}
        onAddItem={handleOpenAddModal}
        onEditItem={handleOpenEditModal}
        onDeleteItem={handleDeleteItem}
        onToggleDailySpecial={handleToggleDailySpecial}
      />

      {/* 4. Bloc Universel : CRM WhatsApp Leads */}
      <WhatsAppLeadsManager
        leads={leads}
        storeName={storeConfig.name}
      />

      {/* Modal Polymorphe */}
      <AddEditItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveModalItem}
        businessType={businessType}
        initialItem={editingItem}
        currency={currency}
      />
    </div>
  );
}
