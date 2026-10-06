'use client';

/**
 * VesTyle — Live Preview Demo Page (Side-by-Side)
 * ─────────────────────────────────────────────────────────────────────────────
 * Page de démonstration interactive côte-à-côte :
 * - Barre supérieure : Sélecteur rapide de métier (Mode, Restauration, Élevage, Services, Hybride) + Device Switcher
 * - Colonne gauche : Éditeur moderne de boutique (StorefrontEditor)
 * - Colonne droite : Prévisualisation en direct (Live Preview) réactive aux modifications en temps réel
 */

import React, { useState, useMemo } from 'react';
import StorefrontEditor from '@/components/studio/StorefrontEditor';
import type { StorefrontConfig, BusinessType } from '@/types/storefront';
import { inject } from '@/engine/blueprintInjector';
import {
  ShoppingBag,
  Utensils,
  Activity,
  GraduationCap,
  LayoutGrid,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  Sparkles,
  Phone,
  Send,
  Package,
} from 'lucide-react';

// ── CONFIGURATIONS DÉMO PAR MÉTIER ───────────────────────────────────────────

const DEMO_PRESETS: Record<BusinessType, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  seed: string;
  config: StorefrontConfig;
  items: Array<{
    name: string;
    price: number;
    category: string;
    badge?: string;
    desc: string;
    extra?: Record<string, string | number | boolean>;
  }>;
}> = {
  PHYSICAL_PRODUCT: {
    label: 'Mode & Prêt-à-Porter',
    icon: ShoppingBag,
    seed: 'VST-BP01-CLR01-F01-VB',
    config: inject({
      businessMeta: {
        storeId: 'demo-mode-akwa',
        storeName: 'Maison Wax & Couture Royale',
        businessType: 'PHYSICAL_PRODUCT',
        city: 'Douala (Akwa)',
        phone: '+237699112233',
        whatsapp: '+237699112233',
        currency: 'FCFA',
        slogan: 'L’élégance africaine confectionnée à la main par nos maîtres tailleurs.',
        description: 'Vente de vêtements prêt-à-porter et confections sur-mesure en tissus wax authentiques, basin riche et lin.',
      },
      themeSeed: 'VST-BP01-CLR01-F01-VB',
    }),
    items: [
      {
        name: 'Robe Dashiki Reine d’Afrique',
        price: 35000,
        category: 'Robes & Tenues',
        badge: 'Bestseller',
        desc: 'Coupe évasée en coton 100% avec broderies dorées sur le col.',
        extra: { sizes: 'S, M, L, XL', colors: 'Noir & Or, Bordeaux' },
      },
      {
        name: 'Chemise Homme Lin Brodé',
        price: 22000,
        category: 'Chemises',
        badge: 'Nouveau',
        desc: 'Lin naturel respirant, finitions main à l’atelier de Douala.',
        extra: { sizes: 'M, L, XXL', colors: 'Blanc Ivoire, Bleu Nuit' },
      },
      {
        name: 'Ensemble Blazer & Pantalon Wax',
        price: 48000,
        category: 'Tailleur',
        badge: 'Édition Limitée',
        desc: 'Coupe ajustée moderne, doublure en satin de soie.',
        extra: { sizes: '38, 40, 42', colors: 'Motif Kente Royal' },
      },
    ],
  },

  RESTAURANT: {
    label: 'Restauration & Menu',
    icon: Utensils,
    seed: 'VST-BP05-CLR02-F02-VB-DARK',
    config: inject({
      businessMeta: {
        storeId: 'demo-restaurant-bonapriso',
        storeName: 'Le Balafon Gourmet & Grillades',
        businessType: 'RESTAURANT',
        city: 'Douala (Bonapriso)',
        phone: '+237698556677',
        whatsapp: '+237698556677',
        currency: 'FCFA',
        slogan: 'Spécialités camerounaises raffinées, poissons braisés du Wouri et carte du jour.',
        description: 'Restaurant gastronomique et service traiteur pour réceptions, mariages et déjeuners d’affaires.',
      },
      themeSeed: 'VST-BP05-CLR02-F02-VB-DARK',
    }),
    items: [
      {
        name: 'Ndolé Royal Crevettes & Viande Fumée',
        price: 6500,
        category: 'Plat Principal',
        badge: 'Plat du Jour ⭐',
        desc: 'Feuilles de Ndolé fraîches, crevettes tigrées, arachides et plantain mûr vapeur.',
        extra: { prepTime: '20 min', isSpecial: true },
      },
      {
        name: 'Bar Entier Braisé aux Épices Secrètes',
        price: 8000,
        category: 'Grillades',
        badge: 'Spécialité du Chef',
        desc: 'Bar frais du jour mariné aux épices du terroir (Pèbè, Djansan) avec frites de plantain.',
        extra: { prepTime: '30 min', isSpecial: true },
      },
      {
        name: 'Poulet DG Façon Balafon',
        price: 5500,
        category: 'Plat Principal',
        badge: 'Coup de Cœur',
        desc: 'Poulet fermier sauté aux légumes croquants et rondelles de plantain doré.',
        extra: { prepTime: '25 min', isSpecial: false },
      },
    ],
  },

  LIVESTOCK_PRODUCT: {
    label: 'Élevage & Cheptel',
    icon: Activity,
    seed: 'VST-BP04-CLR05-F01-VA',
    config: inject({
      businessMeta: {
        storeId: 'demo-elevage-littoral',
        storeName: 'Élevage Agro-Pastoral du Littoral',
        businessType: 'LIVESTOCK_PRODUCT',
        city: 'Dibombari & Yabassi',
        phone: '+237690223344',
        whatsapp: '+237690223344',
        currency: 'FCFA',
        slogan: 'Vente directe de bétail sélectionné, volailles fermières et suivi sanitaire certifié.',
        description: 'Ferme agro-pastorale moderne spécialisée dans l’élevage de bovins Goudali, porcins et volailles Goliath.',
      },
      themeSeed: 'VST-BP04-CLR05-F01-VA',
    }),
    items: [
      {
        name: 'Taureau Reproducteur Goudali Pur',
        price: 650000,
        category: 'Bovins de Race',
        badge: 'Vacciné & Certifié 🟢',
        desc: 'Sujet vigoureux nourri aux pâturages naturels, carnet sanitaire à jour.',
        extra: { weight: '520 kg', age: '3 ans et 2 mois', deposit: '150 000 FCFA' },
      },
      {
        name: 'Lot de 50 Poulets Goliath Fermiers',
        price: 175000,
        category: 'Volailles Fermières',
        badge: 'Vacciné 🟢',
        desc: 'Poulets fermiers élevés en plein air, poids moyen 2.8 kg à maturité.',
        extra: { weight: '2.8 kg / sujet', age: '4 mois', deposit: '50 000 FCFA' },
      },
      {
        name: 'Génisse Laitière Métisse',
        price: 450000,
        category: 'Bovins',
        badge: 'Certifié 🟢',
        desc: 'Excellente conformation, adaptée au climat tropical du Littoral.',
        extra: { weight: '380 kg', age: '2 ans', deposit: '100 000 FCFA' },
      },
    ],
  },

  SERVICE: {
    label: 'Services & Formations',
    icon: GraduationCap,
    seed: 'VST-BP02-CLR06-F01-VB',
    config: inject({
      businessMeta: {
        storeId: 'demo-polytech-prepa',
        storeName: 'Polytech Prépa & Coaching Excellence',
        businessType: 'SERVICE',
        city: 'Yaoundé (Ngoa-Ekélé)',
        phone: '+237675123456',
        whatsapp: '+237675123456',
        currency: 'FCFA',
        slogan: 'Préparation d’élite aux grands concours d’ingénieurs et soutien scolaire intensif.',
        description: 'Institut de formation dirigé par des ingénieurs diplômés avec un taux de réussite supérieur à 85%.',
      },
      themeSeed: 'VST-BP02-CLR06-F01-VB',
    }),
    items: [
      {
        name: 'Pack Prépa Mathématiques Spéciales',
        price: 65000,
        category: 'Concours Ingénieurs',
        badge: 'Programme Phare',
        desc: '30 heures intensives + annales corrigées et simulations d’épreuves orales.',
        extra: { target: 'Terminales C/D & Bac+1', duration: '6 semaines', format: 'Présentiel & Zoom' },
      },
      {
        name: 'Coaching Individuel Physique & Chimie',
        price: 45000,
        category: 'Soutien Personnalisé',
        badge: 'Sur-Mesure',
        desc: 'Remise à niveau personnalisée avec un professeur certifié.',
        extra: { target: 'Première & Terminale', duration: '10 séances de 1h30', format: 'À domicile' },
      },
      {
        name: 'Atelier Méthodologie & Rédaction Scientifique',
        price: 25000,
        category: 'Ateliers',
        badge: 'Module Court',
        desc: 'Techniques de résolution rapide et gestion du stress lors des examens.',
        extra: { target: 'Tous niveaux', duration: '1 Week-end', format: 'En ligne' },
      },
    ],
  },

  HYBRID: {
    label: 'Modèle Hybride',
    icon: LayoutGrid,
    seed: 'VST-BP03-CLR04-F02-VB',
    config: inject({
      businessMeta: {
        storeId: 'demo-hybrid-kdesign',
        storeName: 'Atelier K-Design & Fashion Academy',
        businessType: 'HYBRID',
        city: 'Douala (Deïdo)',
        phone: '+237699002244',
        whatsapp: '+237699002244',
        currency: 'FCFA',
        slogan: 'Création de tenues sur mesure et ateliers de formation au patronage professionnel.',
        description: 'Combinant la vente de collections prêt-à-porter exclusives et un centre de formation certifié en stylisme.',
      },
      themeSeed: 'VST-BP03-CLR04-F02-VB',
    }),
    items: [
      {
        name: 'Tailleur Dame Coupe Haute Couture',
        price: 45000,
        category: 'Produit Physique',
        badge: 'Collection 2026',
        desc: 'Tailleur haut de gamme confectionné sur mesure.',
        extra: { sizes: '38, 40, 42', type: 'PRODUIT' },
      },
      {
        name: 'Formation Masterclass Patronage & Finitions',
        price: 80000,
        category: 'Formation',
        badge: 'Certifiante',
        desc: '1 Mois de perfectionnement pour couturiers professionnels.',
        extra: { duration: '4 semaines', type: 'SERVICE' },
      },
    ],
  },

  ARTISAN: {
    label: 'Artisanat & Atelier',
    icon: LayoutGrid,
    seed: 'VST-BP01-CLR02-F02-VB',
    config: inject({
      businessMeta: {
        storeId: 'demo-artisan-foumban',
        storeName: 'Atelier d’Art Tribal & Sculpture',
        businessType: 'ARTISAN',
        city: 'Foumban & Douala',
        phone: '+237699331100',
        whatsapp: '+237699331100',
        currency: 'FCFA',
        slogan: 'Sculptures sur bois précieux, masques perlés et bronzes royaux.',
        description: 'Maîtres artisans transmettant l’artisanat traditionnel camerounais depuis 3 générations.',
      },
      themeSeed: 'VST-BP01-CLR02-F02-VB',
    }),
    items: [],
  },
};

export default function SideBySideLiveDemoPage() {
  const [selectedVertical, setSelectedVertical] = useState<BusinessType>('PHYSICAL_PRODUCT');
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Active Preset Data
  const currentPreset = DEMO_PRESETS[selectedVertical] || DEMO_PRESETS.PHYSICAL_PRODUCT;

  // Live editable state
  const [liveConfig, setLiveConfig] = useState<StorefrontConfig>(currentPreset.config);

  // Switch vertical handler
  const handleSelectVertical = (type: BusinessType) => {
    setSelectedVertical(type);
    setLiveConfig(DEMO_PRESETS[type].config);
  };

  // Device width constraints for preview
  const getDeviceWidthClass = () => {
    switch (deviceView) {
      case 'mobile':
        return 'max-w-[390px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
      default:
        return 'max-w-full';
    }
  };

  const primaryColor = liveConfig.theme?.primaryColor || '#128C7E';
  const accentColor = liveConfig.theme?.accentColor || '#25D366';
  const isDark = liveConfig.theme?.isDark || false;

  const verticalButtons: { type: BusinessType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { type: 'PHYSICAL_PRODUCT', label: '🛍️ Mode & Prêt-à-Porter', icon: ShoppingBag },
    { type: 'RESTAURANT', label: '🍽️ Restauration & Menu', icon: Utensils },
    { type: 'LIVESTOCK_PRODUCT', label: '🐐 Élevage & Cheptel', icon: Activity },
    { type: 'SERVICE', label: '🎓 Services & Prestations', icon: GraduationCap },
    { type: 'HYBRID', label: '🔄 Modèle Hybride', icon: LayoutGrid },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ── 1. TOP HEADER & QUICK SELECTOR ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/95 backdrop-blur-xl px-4 py-3">
        <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          {/* Brand & Status */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black shadow-lg shadow-emerald-950/40">
              V
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                Studio VesTyle — Éditeur de Boutique & Live Preview
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Édition en temps réel et rendu instantané côte-à-côte pour tous les verticaux métiers.
              </p>
            </div>
          </div>

          {/* Quick Business Type Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
            {verticalButtons.map((btn) => {
              const isSelected = selectedVertical === btn.type;
              return (
                <button
                  key={btn.type}
                  type="button"
                  onClick={() => handleSelectVertical(btn.type)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30 scale-105'
                      : 'border border-white/5 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          {/* Device Preview Switcher */}
          <div className="flex items-center gap-1 border border-white/10 bg-slate-950/80 p-1 rounded-xl self-end xl:self-auto">
            <button
              type="button"
              onClick={() => setDeviceView('desktop')}
              title="Vue Ordinateur"
              className={`p-1.5 rounded-lg transition-colors ${
                deviceView === 'desktop' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceView('tablet')}
              title="Vue Tablette (768px)"
              className={`p-1.5 rounded-lg transition-colors ${
                deviceView === 'tablet' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceView('mobile')}
              title="Vue Mobile (390px)"
              className={`p-1.5 rounded-lg transition-colors ${
                deviceView === 'mobile' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. MAIN SIDE-BY-SIDE WORKSPACE ── */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLONNE GAUCHE : ÉDITEUR INTERACTIF (5 colonnes) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <StorefrontEditor
            value={liveConfig}
            onChange={setLiveConfig}
            onSave={(saved) => {
              console.log('Saved storefront config:', saved);
            }}
          />
        </div>

        {/* COLONNE DROITE : LIVE PREVIEW CANVAS (7 colonnes) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Rendu Vitrine en Direct (Live Canvas)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {deviceView === 'desktop' ? '100% Largeur' : deviceView === 'tablet' ? '768px' : '390px'}
            </div>
          </div>

          {/* Device Frame */}
          <div
            className={`w-full ${getDeviceWidthClass()} transition-all duration-300 rounded-2xl border border-white/10 shadow-2xl overflow-hidden`}
            style={{
              backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
              color: isDark ? '#F8FAFC' : '#0F172A',
            }}
          >
            {/* Live Storefront Hero Header */}
            <div
              className="relative overflow-hidden p-6 sm:p-8 text-white transition-colors"
              style={{
                backgroundColor: primaryColor,
              }}
            >
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-black/20 backdrop-blur-md px-3 py-1 text-xs font-semibold">
                    <MapPin className="h-3 w-3" />
                    <span>{liveConfig.metadata?.city || 'Cameroun'}</span>
                  </div>
                  <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded">
                    {liveConfig.metadata?.currency || 'FCFA'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {liveConfig.name || 'Ma Boutique'}
                </h2>

                <p className="text-sm opacity-90 max-w-lg leading-relaxed">
                  {liveConfig.metadata?.slogan || 'Vitrine optimisée pour les commandes WhatsApp rapides.'}
                </p>

                {/* WhatsApp Action CTA */}
                <div className="mt-2 flex items-center gap-3">
                  <a
                    href={`https://wa.me/${(liveConfig.metadata?.whatsapp || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-lg transition-transform active:scale-95"
                    style={{
                      backgroundColor: accentColor,
                      color: isDark ? '#020617' : '#020617',
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Commander sur WhatsApp</span>
                  </a>

                  {liveConfig.metadata?.phone && (
                    <a
                      href={`tel:${liveConfig.metadata.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-black/20 hover:bg-black/30 px-3 py-2 text-xs font-semibold text-white transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{liveConfig.metadata.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Live Catalog / Products Showcase */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
                    Nos Offres & Articles Vedettes
                  </h3>
                  <p className="text-xs opacity-60">Sélection du moment disponible immédiatement.</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                  {currentPreset.items.length} articles
                </span>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentPreset.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border p-4 flex flex-col justify-between transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    }}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-sm font-bold" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
                            {item.name}
                          </h4>
                          <span className="text-[11px] opacity-60">{item.category}</span>
                        </div>
                        <span
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${primaryColor}15`,
                            color: primaryColor,
                          }}
                        >
                          {item.price.toLocaleString('fr-FR')} {liveConfig.metadata?.currency || 'FCFA'}
                        </span>
                      </div>

                      <p className="text-xs opacity-75 line-clamp-2 mb-3">{item.desc}</p>

                      {/* Extra metadata chips */}
                      {item.badge && (
                        <div className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 mb-2">
                          {item.badge}
                        </div>
                      )}

                      {item.extra && (
                        <div className="text-[11px] opacity-70 space-y-0.5 pt-2 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                          {Object.entries(item.extra).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between">
                              <span className="capitalize">{k} :</span>
                              <span className="font-medium">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Send className="h-3 w-3" />
                      <span>Commander sur WhatsApp</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Sector Specific Footer Banner */}
              <div
                className="rounded-xl p-4 flex items-center gap-3 border"
                style={{
                  backgroundColor: `${primaryColor}08`,
                  borderColor: `${primaryColor}20`,
                }}
              >
                <ShieldCheck className="h-5 w-5 shrink-0" style={{ color: primaryColor }} />
                <div className="text-xs">
                  <div className="font-bold" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
                    {selectedVertical === 'LIVESTOCK_PRODUCT' && 'Garantie Vétérinaire & Suivi Sanitaire'}
                    {selectedVertical === 'RESTAURANT' && 'Plats Frais Préparés à la Commande'}
                    {selectedVertical === 'SERVICE' && 'Accompagnement Pédagogique Certifié'}
                    {selectedVertical === 'PHYSICAL_PRODUCT' && 'Paiement Sécurisé & Livraison Express'}
                    {selectedVertical === 'HYBRID' && 'Qualité & Confection Sur-Mesure'}
                  </div>
                  <div className="opacity-70">
                    Contact direct avec le marchand à {liveConfig.metadata?.city || 'Douala'}.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
