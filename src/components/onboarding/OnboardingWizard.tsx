'use client';

/**
 * VesTyle — Onboarding Wizard Component (v3.1 — Phase 2C)
 * ─────────────────────────────────────────────────────────────────────────────
 * Tunnel d'onboarding mobile-first ultra-fluide pour les marchands africains.
 *
 * Phase 2C : L'étape 4 utilise le StorefrontConfig généré par le noyau
 * canonique Vestin (DesignRegistry + VestinAdaptationEngine). Aucun appel
 * à BlueprintInjector ou MasterBlueprints dans ce chemin.
 *
 * Découpage en 4 Étapes :
 *   1. Métier & Boutique (Nom, Slogan, Archétype métier polymorphe)
 *   2. Première Offre (Ajout dynamique adapté selon le vertical métier)
 *   3. Ancrage Local & WhatsApp (Numéro WhatsApp +237, Ville/Quartier, Paiements)
 *   4. Aperçu Instantané (Génération via noyau canonique Vestin v3.0, Lancement)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  ShoppingBag,
  Briefcase,
  Layers,
  Utensils,
  MapPin,
  Phone,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  Smartphone,
  Monitor,
  RefreshCw,
  Palette,
  Eye,
  CreditCard,
  Building2,
  ShieldCheck,
  AlertCircle,
  Tag,
} from 'lucide-react';

import { useOnboarding } from '@/context/OnboardingContext';
import {
  CAMEROON_CITIES,
  MAIN_QUARTERS_BY_CITY,
  ONBOARDING_STEPS,
  type InitialItem,
  type OnboardingStep,
} from '@/types/onboarding';
import type { BusinessType } from '@/types/storefront';
import { StorefrontRenderer } from '@/components/renderer/StorefrontRenderer';
import { COLOR_TOKEN_CATALOG } from '@/engine/themeSeed';
// Note : MASTER_BLUEPRINTS supprimé du chemin d'onboarding (Phase 2C).
// import { MASTER_BLUEPRINTS } from '@/engine/masterBlueprints';

// ── CARTES DES ARCHÉTYPES MÉTIER ──────────────────────────────────────────────

const BUSINESS_TYPE_CARDS: Array<{
  id: BusinessType;
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  color: string;
  exampleItems: string[];
}> = [
  {
    id: 'PHYSICAL_PRODUCT',
    title: 'Vente de Produits Physiques',
    subtitle: 'Mode, chaussures, téléphones, cosmétiques & artisanat',
    badge: 'E-commerce & WhatsApp',
    icon: ShoppingBag,
    color: '#10B981',
    exampleItems: ['Robe Soirée Ébène', 'Sneakers Urban', 'Huile Capillaire Bio'],
  },
  {
    id: 'SERVICE',
    title: 'Prestations de Services & Cours',
    subtitle: 'Formations, coiffure, réparation, consultation & agences',
    badge: 'Prise de RDV & Devis',
    icon: Briefcase,
    color: '#8B5CF6',
    exampleItems: ['Cours Maths Terminale', 'Diagnostic Juridique', 'Coiffure Tresses X'],
  },
  {
    id: 'LIVESTOCK_PRODUCT',
    title: 'Élevage, Bétail & Agropastoral',
    subtitle: 'Volailles de chair, porcs, bétail, aliments & fermes',
    badge: 'Suivi Vétérinaire & Acompte',
    icon: Layers,
    color: '#16A34A',
    exampleItems: ['Lot 20 Poulets Goliath', 'Porcelets Sevrés', 'Aliments Ponte 50kg'],
  },
  {
    id: 'RESTAURANT',
    title: 'Restauration, Snack & Traiteur',
    subtitle: 'Plats cuisinés, grillades, poisson braisé & livraison',
    badge: 'Menu & Livraison Express',
    icon: Utensils,
    color: '#F97316',
    exampleItems: ['Plat Ndolè Crevettes', 'Poisson Braisé Akwa', 'Jus de Bissap Frais'],
  },
  {
    id: 'HYBRID',
    title: 'Commerce Hybride & Mixte',
    subtitle: 'Multi-activités : Vente de vêtements + Cours, Ferme + Matériel',
    badge: 'Catalogue Tout-en-un',
    icon: Store,
    color: '#D97706',
    exampleItems: ['Tissus Pagne + Ateliers', 'Matériel Informatique + Réparation'],
  },
];

export function OnboardingWizard() {
  const router = useRouter();
  const {
    step,
    payload,
    generatedConfig,
    isGenerating,
    activeDesignId,
    error: storeError,
    setStep,
    updatePayload,
    addItem,
    removeItem,
    generateStorefront,
    setThemeSeed,
  } = useOnboarding();

  // ── États locaux de formulaire ───────────────────────────────────────────────
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // État local de saisie de l'offre (Étape 2)
  const [itemForm, setItemForm] = useState<Partial<InitialItem>>({
    name: '',
    price: 5000,
    category: '',
    description: '',
    badge: '',
    unit: 'unité',
    metadata: {},
  });

  // ── Auto-génération au passage à l'étape 4 ───────────────────────────────────
  useEffect(() => {
    if (step === 4 && !generatedConfig && !isGenerating) {
      generateStorefront().catch((err) => {
        console.error('[OnboardingWizard] Erreur auto-génération:', err);
      });
    }
  }, [step, generatedConfig, isGenerating, generateStorefront]);

  // ── Quartiers disponibles selon la ville choisie ────────────────────────────
  const availableQuarters = useMemo(() => {
    const currentCity = payload.city || 'Douala';
    return MAIN_QUARTERS_BY_CITY[currentCity] || [];
  }, [payload.city]);

  // ── Validation et Transition d'Étapes ────────────────────────────────────────

  const handleNextStep = async () => {
    setLocalError(null);

    // Validation Étape 1
    if (step === 1) {
      if (!payload.storeName || payload.storeName.trim().length < 2) {
        setLocalError('Veuillez entrer un nom commercial valide (au moins 2 caractères).');
        return;
      }
      setStep(2);
      return;
    }

    // Validation Étape 2 (Ajout optionnel de l'item en cours de saisie s'il a un nom)
    if (step === 2) {
      if (itemForm.name && itemForm.name.trim().length >= 2) {
        addItem({
          name: itemForm.name.trim(),
          price: Number(itemForm.price) || 0,
          category: itemForm.category || 'Général',
          description: itemForm.description || '',
          badge: itemForm.badge,
          unit: itemForm.unit || 'unité',
          metadata: itemForm.metadata || {},
        });
        setItemForm({ name: '', price: 5000, category: '', description: '', badge: '' });
      }
      setStep(3);
      return;
    }

    // Validation Étape 3
    if (step === 3) {
      const cleanPhone = (payload.whatsapp || '').replace(/[^\d+]/g, '');
      if (!cleanPhone || cleanPhone.length < 8) {
        setLocalError('Veuillez renseigner un numéro WhatsApp valide (ex: +237 690 000 000).');
        return;
      }
      setStep(4);
      return;
    }

    // Étape 4 : Lancement et Enregistrement Réel
    if (step === 4) {
      handleFinalLaunch();
    }
  };

  const handlePrevStep = () => {
    setLocalError(null);
    if (step > 1) {
      setStep((step - 1) as OnboardingStep);
    }
  };

  // ── Ajout manuel d'un article à l'étape 2 ───────────────────────────────────
  const handleAddNewItem = () => {
    if (!itemForm.name || itemForm.name.trim().length < 2) {
      setLocalError('Veuillez donner un nom à votre article avant de l\'ajouter.');
      return;
    }

    addItem({
      name: itemForm.name.trim(),
      price: Number(itemForm.price) || 0,
      category: itemForm.category || 'Général',
      description: itemForm.description || '',
      badge: itemForm.badge,
      unit: itemForm.unit || 'unité',
      metadata: itemForm.metadata || {},
    });

    setItemForm({
      name: '',
      price: 5000,
      category: '',
      description: '',
      badge: '',
      unit: 'unité',
      metadata: {},
    });
    setLocalError(null);
  };

  // ── Lancement Final (Appel API de création) ──────────────────────────────────
  const handleFinalLaunch = async () => {
    setIsSubmitting(true);
    setLocalError(null);

    try {
      const storeConfig = generatedConfig || (await generateStorefront());

      const response = await fetch('/api/store/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.storeName,
          businessType: payload.businessType,
          description: payload.activityText,
          method: 'AI',
          storeData: {
            city: payload.city,
            whatsapp: payload.whatsapp,
            phone: payload.whatsapp,
            draft_config: storeConfig,
            published_config: storeConfig,
          },
        }),
      });

      const resData = await response.json();

      if (resData.success && resData.store) {
        // Redirection vers le dashboard marchand
        router.push(`/dashboard?storeId=${resData.store.id}&created=true`);
      } else {
        // En cas de non-connecté ou mode invité, redirection vers dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.warn('[OnboardingWizard] Erreur réseau ou mode déconnecté :', err);
      // Fallback gracieux
      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-white">
      {/* ── HEADER & STEPPER PROGRESS ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-emerald-400 flex items-center justify-center font-black text-white text-base shadow-lg shadow-violet-500/20">
            V
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              VesTyle
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
              Générateur Express
            </span>
          </div>
        </div>

        {/* Indicateurs d'Étapes */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {ONBOARDING_STEPS.map((s) => {
            const isDone = s.step < step;
            const isCurrent = s.step === step;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => isDone && setStep(s.step)}
                disabled={!isDone}
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-sm'
                    : isDone
                    ? 'text-emerald-400 cursor-pointer hover:bg-white/[0.04]'
                    : 'text-slate-500 opacity-50 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-violet-500 text-white'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {isDone ? '✓' : s.step}
                </span>
                <span className="hidden md:inline">{s.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ── CORPS DU WIZARD ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6 sm:py-10 max-w-4xl w-full mx-auto">
        {/* Messages d'erreurs éventuels */}
        {(localError || storeError) && (
          <div className="w-full mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-3 text-rose-300 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{localError || storeError}</span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            ÉTAPE 1 : MÉTIER & NOM DE LA BOUTIQUE
           ══════════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Quel est le cœur de votre activité ?
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                VesTyle sélectionne automatiquement la meilleure architecture de vitrine et les sections adaptées à vos clients.
              </p>
            </div>

            {/* Saisie du Nom & Slogan */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-xl space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Nom Commercial de votre Boutique <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={payload.storeName || ''}
                    onChange={(e) => updatePayload({ storeName: e.target.value })}
                    placeholder="Ex : Maison Élégance, Agro Ferme Obala, Cabinet Conseil Akwa..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                  <Store size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Slogan ou phrase d'accroche <span className="text-slate-500 font-normal lowercase">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={payload.slogan || ''}
                  onChange={(e) => updatePayload({ slogan: e.target.value })}
                  placeholder="Ex : L'élégance africaine contemporaine / Volailles saines à Douala"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            {/* Grille de sélection des Business Types */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Sélectionnez votre type de commerce
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {BUSINESS_TYPE_CARDS.map((card) => {
                  const isSelected = payload.businessType === card.id;
                  const Icon = card.icon;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => updatePayload({ businessType: card.id })}
                      className={`relative p-4 rounded-2xl text-left border transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-violet-600/10 border-violet-500 ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/10'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                          style={{
                            background: isSelected ? card.color : 'rgba(255,255,255,0.05)',
                            color: isSelected ? '#FFFFFF' : card.color,
                          }}
                        >
                          <Icon size={20} />
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isSelected
                              ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                              : 'bg-white/5 text-slate-400 border-white/10'
                          }`}
                        >
                          {card.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white mb-0.5">{card.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{card.subtitle}</p>
                      </div>

                      {/* Exemples typiques */}
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-white/[0.04]">
                        {card.exampleItems.slice(0, 2).map((ex, i) => (
                          <span key={i} className="text-[10px] text-slate-400 bg-black/40 px-1.5 py-0.5 rounded">
                            {ex}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            ÉTAPE 2 : PREMIÈRE OFFRE (PRODUITS / PRESTATIONS / CHEPTEL)
           ══════════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Ajoutons votre première offre
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                {payload.businessType === 'LIVESTOCK_PRODUCT'
                  ? 'Ajoutez un premier sujet ou lot d\'élevage (espèce, poids, prix).'
                  : payload.businessType === 'SERVICE'
                  ? 'Ajoutez une première prestation ou formule d\'accompagnement.'
                  : payload.businessType === 'RESTAURANT'
                  ? 'Ajoutez un plat phare ou plat du jour à votre carte.'
                  : 'Ajoutez un premier article pour amorcer immédiatement votre catalogue.'}
              </p>
            </div>

            {/* Formulaire Dynamique d'Article */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Titre de l'article / prestation <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={itemForm.name || ''}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder={
                      payload.businessType === 'LIVESTOCK_PRODUCT'
                        ? 'Ex : Lot de 50 Poulets Goliath (2.5 kg)'
                        : payload.businessType === 'SERVICE'
                        ? 'Ex : Forfait Soutien Scolaire Maths & Physique'
                        : payload.businessType === 'RESTAURANT'
                        ? 'Ex : Poisson Braisé Bar Entier + Miondo'
                        : 'Ex : Robe de Soirée Satin Émeraude'
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Prix (FCFA) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={itemForm.price || ''}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="15000"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm font-semibold text-emerald-400 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Champs Spécifiques Métier */}
              {payload.businessType === 'LIVESTOCK_PRODUCT' && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1">Âge / Poids moyen</label>
                    <input
                      type="text"
                      placeholder="Ex: 45 jours / 2.8 kg"
                      onChange={(e) =>
                        setItemForm((prev) => ({
                          ...prev,
                          metadata: { ...prev.metadata, weight: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1">Vaccination</label>
                    <input
                      type="text"
                      placeholder="Ex: Vacciné Gumboro + Newcastle"
                      onChange={(e) =>
                        setItemForm((prev) => ({
                          ...prev,
                          metadata: { ...prev.metadata, vaccine: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              )}

              {payload.businessType === 'SERVICE' && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
                  <div>
                    <label className="block text-[11px] font-bold text-violet-300 mb-1">Durée estimée</label>
                    <input
                      type="text"
                      placeholder="Ex: 1h30 / 1 Mois"
                      onChange={(e) =>
                        setItemForm((prev) => ({
                          ...prev,
                          metadata: { ...prev.metadata, duration: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-violet-300 mb-1">Niveau / Cible</label>
                    <input
                      type="text"
                      placeholder="Ex: Lycée / Tout public"
                      onChange={(e) =>
                        setItemForm((prev) => ({
                          ...prev,
                          metadata: { ...prev.metadata, level: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Brève description
                </label>
                <textarea
                  rows={2}
                  value={itemForm.description || ''}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Détails, composition, modalités de livraison ou conditions..."
                  className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddNewItem}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/20 active:scale-95"
                >
                  <Plus size={14} />
                  <span>Ajouter cet article à la vitrine</span>
                </button>
              </div>
            </div>

            {/* Liste des Articles Déjà Ajoutés */}
            {payload.initialItems && payload.initialItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Articles ajoutés ({payload.initialItems.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {payload.initialItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white truncate">{item.name}</span>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                          {item.price.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            ÉTAPE 3 : ANCRAGE LOCAL & WHATSAPP
           ══════════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Coordonnées & Réception des Commandes
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Vos clients camerounais commanderont directement en un clic via WhatsApp ou Mobile Money.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-xl space-y-5">
              {/* 1. Numéro WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Numéro WhatsApp Professionnel <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={payload.whatsapp || ''}
                    onChange={(e) => updatePayload({ whatsapp: e.target.value })}
                    placeholder="+237 690 000 000"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm font-semibold tracking-wide placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Format local (6XXXXXXXX) ou international (+2376XXXXXXXX).
                </p>
              </div>

              {/* 2. Ville & Quartier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Ville Principale <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={payload.city || 'Douala'}
                    onChange={(e) => updatePayload({ city: e.target.value, quarter: '' })}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
                  >
                    {CAMEROON_CITIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Quartier / Repère
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={payload.quarter || ''}
                      onChange={(e) => updatePayload({ quarter: e.target.value })}
                      placeholder="Akwa, Bastos, Yassa..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                    />
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Suggestions de Quartiers */}
              {availableQuarters.length > 0 && (
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1.5">Quartiers populaires à {payload.city} :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableQuarters.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => updatePayload({ quarter: q })}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          payload.quarter === q
                            ? 'bg-violet-600/30 text-violet-300 border-violet-500/40'
                            : 'bg-white/[0.03] text-slate-400 border-white/5 hover:border-white/15'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Moyens de Paiement */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Moyens de Paiement Acceptés
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {['MTN MoMo', 'Orange Money', 'Paiement à la livraison'].map((method) => {
                    const activeMethods = payload.paymentMethods || [];
                    const isChecked = activeMethods.includes(method);

                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => {
                          const updated = isChecked
                            ? activeMethods.filter((m) => m !== method)
                            : [...activeMethods, method];
                          updatePayload({ paymentMethods: updated });
                        }}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.04]'
                        }`}
                      >
                        <span>{method}</span>
                        {isChecked && <Check size={14} className="text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            ÉTAPE 4 : APERÇU LIVE & PERSONNALISATION DE STYLE
           ══════════════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-1">
                <Sparkles size={13} />
                <span>Vitrine Générée — Design Canonique Vestin v3.0</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Votre boutique est prête !
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Prévisualisez le rendu en direct et personnalisez la palette visuelle d'un simple clic.
              </p>
            </div>

            {/* Sélecteur de Palette de Couleurs & Thèmes */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Palette size={16} className="text-violet-400" />
                <span className="text-xs font-bold text-slate-200">Styles & Palettes :</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(COLOR_TOKEN_CATALOG).map(([clrId, tokenDef]) => {
                  const currentSeed = payload.themeSeedCode || '';
                  const isCurrentColor = currentSeed.includes(clrId);

                  return (
                    <button
                      key={clrId}
                      type="button"
                      onClick={async () => {
                        // Phase 2C : on stocke le seed dans le payload, puis on regénère
                        // via le noyau canonique (setThemeSeed invalide generatedConfig,
                        // puis generateStorefront est rappelé automatiquement par l'effet de step=4)
                        setThemeSeed(clrId);
                        try {
                          await generateStorefront();
                        } catch (e) {
                          console.error('[OnboardingWizard] Erreur re-génération palette:', e);
                        }
                      }}
                      className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-all ${
                        isCurrentColor
                          ? 'bg-white/10 border-white/40 ring-1 ring-white/30 text-white'
                          : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/30"
                        style={{ backgroundColor: tokenDef.primaryColor }}
                      />
                      <span className="text-[11px] font-medium">{tokenDef.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Indicateur Design Actif — Phase 2C */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400 font-medium">
                Design appliqué : <span className="font-bold text-violet-300">{activeDesignId ? activeDesignId.replace('vst_dsn_', '').replace(/_\d+$/, '').replace(/_/g, ' ') : 'Auto'}</span>
              </div>

              <div className="flex items-center p-1 rounded-xl bg-black/60 border border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    previewDevice === 'mobile' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone size={14} />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    previewDevice === 'desktop' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor size={14} />
                  <span>Desktop</span>
                </button>
              </div>
            </div>

            {/* Conteneur de Prévisualisation WYSIWYG Réelle */}
            <div className="w-full flex justify-center py-2">
              <div
                className={`transition-all duration-300 rounded-3xl border border-white/15 overflow-hidden shadow-2xl bg-white ${
                  previewDevice === 'mobile' ? 'w-[375px] max-w-full min-h-[580px]' : 'w-full min-h-[600px]'
                }`}
              >
                {isGenerating ? (
                  <div className="h-96 flex flex-col items-center justify-center gap-3 bg-slate-950 text-white">
                    <RefreshCw size={24} className="animate-spin text-violet-400" />
                    <span className="text-xs font-semibold text-slate-400">Génération déterministe en cours...</span>
                  </div>
                ) : generatedConfig ? (
                  <StorefrontRenderer config={generatedConfig} />
                ) : (
                  <div className="h-96 flex items-center justify-center bg-slate-950 text-white text-xs">
                    Chargement de l'aperçu...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── BARRE DE NAVIGATION INFÉRIEURE (FIXED MOBILE / INTEGRATED DESKTOP) ── */}
        <div className="sticky bottom-0 w-full mt-8 pt-4 pb-4 bg-[#07090E]/95 backdrop-blur-md border-t border-white/[0.08] flex items-center justify-between gap-4 z-30">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition-all"
            >
              <ArrowLeft size={14} />
              <span>Précédent</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNextStep}
            disabled={isSubmitting || isGenerating}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-xl active:scale-95 ${
              step === 4
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-violet-600/25'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Création de votre boutique...</span>
              </>
            ) : step === 4 ? (
              <>
                <Sparkles size={16} />
                <span>Lancer ma boutique en ligne</span>
              </>
            ) : (
              <>
                <span>Continuer</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
