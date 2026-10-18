'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import ClientDiscovery from '@/components/ClientDiscovery';
import VoiceSearchButton from '@/components/VoiceSearchButton';
import VisualSearchModal from '@/components/VisualSearchModal';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useDistance } from '@/hooks/useDistance';
import { useOfflineData } from '@/hooks/useOfflineData';
import { triggerFeedback } from '@/lib/haptic';
import Navbar from '@/components/Navbar';

// ── Icons SVG Élégants & Épurés ─────────────────────────────────────────────
const CameraIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);
const MapPinIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const HashIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" x2="20" y1="9" y2="9" /><line x1="4" x2="20" y1="15" y2="15" />
    <line x1="10" x2="8" y1="3" y2="21" /><line x1="16" x2="14" y1="3" y2="21" />
  </svg>
);
const ArrowRightIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);
const LoaderIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const SparklesIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
  </svg>
);

const fmt = (v) => new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [codeQuery, setCodeQuery] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);
  const [visualResults, setVisualResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Slides de démonstration interactive
  const HERO_SLIDES = [
    {
      id: 1,
      badge: '✨ Recherche par Photo IA',
      title: 'Scanne et Trouve Instantanément',
      subtitle: 'Retrouve n’importe quelle tenue en photo chez les meilleurs vendeurs locaux.',
      img: '/images/hero_woman.png',
      tag: '0.3s Détection',
    },
    {
      id: 2,
      badge: '🏪 Commerces Vérifiés',
      title: 'Des Boutiques d’Exception',
      subtitle: 'Plus de 150 boutiques locales à Douala & Yaoundé avec contact WhatsApp.',
      img: '/images/hero_man.png',
      tag: '150+ Boutiques',
    },
    {
      id: 3,
      badge: '🚀 Livraison Express',
      title: 'Expédition Rapide & Suivie',
      subtitle: 'Colis livrés directement chez toi avec suivi de position en temps réel.',
      img: '/images/hero_robot.png',
      tag: 'Livré < 2h',
    },
  ];

  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [HERO_SLIDES.length]);

  const [realCategories, setRealCategories] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [popularStores, setPopularStores] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);

  const router = useRouter();
  const { requestLocation, userLocation, isLocating: isGpsLocating } = useDistance();

  const { data: offlineSuggestions } = useOfflineData('home_suggestions_v4', async () => {
    const [cats, strs, prods] = await Promise.all([
      supabase.from('global_categories').select('name').limit(10),
      supabase.from('stores').select('name, city').order('is_boosted', { ascending: false }).limit(8),
      supabase.from('products').select('name').eq('is_active', true).order('daily_views', { ascending: false }).limit(12)
    ]);
    const items = [];
    if (cats.data) cats.data.forEach(c => items.push({ label: c.name, value: c.name, type: 'Catégorie', emoji: '🏷️' }));
    if (strs.data) strs.data.forEach(s => items.push({ label: s.name, value: s.name, type: 'Boutique', emoji: '🏪', sublabel: s.city }));
    if (prods.data) prods.data.forEach(p => items.push({ label: p.name, value: p.name, type: 'Produit', emoji: '🛍️' }));
    return { data: items };
  });

  useEffect(() => {
    if (offlineSuggestions) setSuggestions(offlineSuggestions);
  }, [offlineSuggestions]);

  useEffect(() => {
    async function loadData() {
      setDealsLoading(true);
      try {
        const [catsRes, dealsRes, storesRes] = await Promise.all([
          supabase.from('global_categories').select('id, name, icon').limit(8),
          supabase
            .from('products')
            .select('id, name, price, original_price, image_url, is_promo, stores(name, slug, city)')
            .eq('is_active', true)
            .order('daily_views', { ascending: false })
            .limit(6),
          supabase
            .from('stores')
            .select('id, name, slug, logo_url, city, is_boosted, daily_views')
            .order('is_boosted', { ascending: false })
            .limit(6),
        ]);

        if (catsRes.data) setRealCategories(catsRes.data);
        if (dealsRes.data) setTopDeals(dealsRes.data);
        if (storesRes.data) setPopularStores(storesRes.data);
      } catch (err) {
        console.error('[Home] Erreur chargement:', err);
      } finally {
        setDealsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCodeSearch = async (e) => {
    e.preventDefault();
    const code = codeQuery.trim();
    if (code.length !== 5) return;
    setCodeLoading(true);
    const { data } = await supabase.from('stores').select('slug').eq('store_code', code).single();
    if (data) {
      router.push(`/boutique/${data.slug}`);
    } else {
      setCodeError('Code inconnu. Vérifiez avec votre vendeur.');
    }
    setCodeLoading(false);
  };

  const scrollToFeed = useCallback(() => {
    document.getElementById('discovery-feed-section')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const currentSlide = HERO_SLIDES[slideIdx];

  const CATEGORY_PILLS = [
    { id: 'all', label: 'Toutes les catégories', emoji: '✨' },
    ...realCategories.map((c) => ({ id: c.name, label: c.name, emoji: '🛍️' })),
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden">
      <Navbar />

      {/* ═══ LUXURY ULTRA-HERO SECTION ═══ */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden border-b border-slate-800/80">
        {/* Glow ambient background lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/10 to-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column Text & Controls */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-xl shadow-2xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cameroun • L’Expérience Commerce Nouvelle Génération</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
              Vise l’objet, <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                trouve la boutique
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              Découvrez les produits d’exception de Douala &amp; Yaoundé. Recherche par photo intelligente, contact direct WhatsApp et livraison rapide.
            </p>

            {/* Glass Search Field */}
            <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500/50 rounded-full p-2 pl-5 shadow-2xl backdrop-blur-2xl transition-all focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/20 max-w-2xl">
              <button
                type="button"
                onClick={() => setVisualSearchOpen(true)}
                className="text-emerald-400 hover:scale-110 active:scale-95 transition-all p-2 rounded-full bg-emerald-950/80 border border-emerald-500/30 shrink-0 mr-2"
                title="Scanner une photo"
              >
                <CameraIcon size={20} />
              </button>

              <div className="flex-1 min-w-0">
                <SearchAutocomplete
                  value={searchQuery}
                  onChange={setSearchQuery}
                  suggestions={suggestions}
                  placeholder="Rechercher une tenue, un sac, une boutique..."
                  className="w-full"
                  inputClassName="w-full bg-transparent outline-none text-white placeholder:text-slate-500 text-sm font-medium py-1.5"
                />
              </div>

              <VoiceSearchButton
                onInterimResult={(t) => setSearchQuery(t)}
                onResult={(t) => { setSearchQuery(t); scrollToFeed(); }}
                className="text-slate-400 hover:text-emerald-400 p-2 shrink-0"
              />

              <button
                type="button"
                onClick={scrollToFeed}
                className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-extrabold text-sm px-6 py-3 rounded-full transition-all shadow-lg shrink-0"
              >
                Chercher
              </button>
            </div>

            {/* Direct Action Chips */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => { triggerFeedback?.('radar'); requestLocation(); scrollToFeed(); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold border transition-all ${
                  userLocation
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <MapPinIcon size={14} className={isGpsLocating ? 'animate-bounce' : ''} />
                <span>{isGpsLocating ? 'Géolocalisation...' : userLocation ? '📍 Proximité activée' : 'Autour de moi'}</span>
              </button>

              <form onSubmit={handleCodeSearch} className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full pl-4 pr-1.5 py-1.5">
                <HashIcon size={14} className="text-emerald-400" />
                <input
                  type="text"
                  maxLength={5}
                  value={codeQuery}
                  onChange={(e) => { setCodeQuery(e.target.value.replace(/\D/g, '')); setCodeError(''); }}
                  placeholder="Code Vendeur"
                  className="w-24 bg-transparent text-xs font-mono font-bold text-white uppercase outline-none placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  disabled={codeQuery.length !== 5 || codeLoading}
                  className="p-1.5 bg-emerald-500 text-slate-950 rounded-full hover:scale-105 disabled:opacity-30 transition-all"
                >
                  {codeLoading ? <LoaderIcon size={12} /> : <ArrowRightIcon size={12} />}
                </button>
              </form>

              <Link
                href="/decouvrir"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-slate-800 transition-all"
              >
                <SparklesIcon size={14} className="text-amber-300" />
                <span>Expérience 3D</span>
              </Link>
            </div>

            {codeError && <p className="text-xs text-red-400 font-semibold">⚠️ {codeError}</p>}
          </div>

          {/* Right Column Showcase Card */}
          <div className="lg:col-span-5 w-full max-w-[380px] mx-auto lg:mx-0 lg:ml-auto">
            <div className="relative rounded-3xl p-1 bg-gradient-to-b from-emerald-500/30 via-slate-800/40 to-slate-900/80 border border-slate-700/50 shadow-2xl backdrop-blur-xl">
              <div className="bg-slate-950 rounded-[22px] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <img src="/vestyle-logo.png" alt="VesTyle Logo" className="w-8 h-8 rounded-xl object-contain bg-slate-900 p-1" />
                    <span className="font-bold text-sm text-white">VesTyle Live</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {currentSlide.tag}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={slideIdx}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <div className="relative h-52 rounded-2xl overflow-hidden border border-slate-800">
                      <img src={currentSlide.img} alt={currentSlide.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                        {currentSlide.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-white">{currentSlide.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{currentSlide.subtitle}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex gap-1.5">
                    {HERO_SLIDES.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSlideIdx(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === slideIdx ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-800'}`}
                      />
                    ))}
                  </div>

                  <Link
                    href="/decouvrir"
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>Explorer</span> <ArrowRightIcon size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══ BOUTIQUES VEDETTES (STORIES BAR) ═══ */}
      <section className="py-8 border-b border-slate-800/80 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Boutiques Populaires</h2>
            <Link href="/boutiques" className="text-xs font-bold text-emerald-400 hover:underline">Voir tout →</Link>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
            <Link href="/login" className="flex flex-col items-center gap-2 shrink-0 w-16 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center text-xl font-black shadow-lg group-hover:scale-105 transition-transform">
                +
              </div>
              <span className="text-[10px] font-semibold text-slate-400 text-center">Vendre</span>
            </Link>

            {dealsLoading && [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0 w-16 animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800" />
                <div className="h-2 w-10 bg-slate-900 rounded" />
              </div>
            ))}

            {popularStores.map((store) => (
              <Link key={store.id} href={`/boutique/${store.slug}`} className="flex flex-col items-center gap-2 shrink-0 w-16 group">
                <div className="w-14 h-14 rounded-2xl p-[2px] bg-gradient-to-tr from-emerald-400 to-teal-500 group-hover:scale-105 transition-transform shadow-md">
                  <div className="w-full h-full rounded-[14px] bg-slate-950 p-[2px] overflow-hidden">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover rounded-[12px]" />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-lg">🏪</div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-300 text-center line-clamp-1 w-full">{store.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MAIN CONTENT GRID ═══ */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-12 space-y-16">

        {/* Categories Bar */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
          {CATEGORY_PILLS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setActiveCategory(c.id); scrollToFeed(); }}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-all ${
                activeCategory === c.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>

        {/* Seller Banner */}
        <section className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 shadow-2xl overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <SparklesIcon size={14} /> Espaces Marchands &amp; Créateurs
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Lance ta boutique officielle sur VesTyle</h2>
              <p className="text-slate-300 text-sm max-w-xl">Assistant IA, catalogues automatiques, gestion de stocks et commandes via WhatsApp.</p>
            </div>

            <Link
              href="/login"
              className="shrink-0 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm px-6 py-3.5 rounded-full transition-all shadow-xl hover:scale-105"
            >
              <span>Ouvrir ma boutique</span> <ArrowRightIcon size={16} />
            </Link>
          </div>
        </section>

        {/* Top Deals Section */}
        {(dealsLoading || topDeals.length > 0) && (
          <section className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">🔥 Sélection Vedette</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Les produits les plus recherchés actuellement</p>
              </div>
              <button type="button" onClick={scrollToFeed} className="text-xs font-bold text-emerald-400 hover:underline">
                Tout explorer →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {dealsLoading
                ? [1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800 animate-pulse space-y-3">
                      <div className="aspect-square rounded-xl bg-slate-800" />
                      <div className="h-3 bg-slate-800 rounded w-3/4" />
                    </div>
                  ))
                : topDeals.map((deal) => (
                    <Link
                      key={deal.id}
                      href={deal.stores?.slug ? `/boutique/${deal.stores.slug}` : '#'}
                      className="group bg-slate-900/60 hover:bg-slate-900 rounded-2xl p-3 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-800 relative">
                        {deal.image_url ? (
                          <img src={deal.image_url} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">🛍️</div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white line-clamp-1">{deal.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{deal.stores?.name}</p>
                        <p className="text-xs font-black text-emerald-400 pt-1">{fmt(deal.price)}</p>
                      </div>
                    </Link>
                  ))}
            </div>
          </section>
        )}

        {/* Discovery Catalogue Feed */}
        <section id="discovery-feed-section" className="pt-4">
          <ClientDiscovery
            externalSearchQuery={searchQuery}
            onExternalSearchChange={setSearchQuery}
            overrideProducts={visualResults}
            onClearVisualSearch={() => setVisualResults(null)}
            initialProximity={!!userLocation}
            hideSearchBar={true}
            externalCategory={activeCategory}
            onExternalCategoryChange={setActiveCategory}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2.5">
            <img src="/vestyle-logo.png" alt="VesTyle Logo" className="w-8 h-8 rounded-xl object-contain bg-slate-900 p-1" />
            <span className="font-black text-2xl text-white tracking-tight">
              Ves<span className="text-emerald-400">Tyle</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">Plateforme Commerce &amp; Marketplace Locale — Douala &amp; Yaoundé</p>
          <div className="flex flex-wrap justify-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
            <Link href="/decouvrir" className="hover:text-emerald-400 transition-colors">Découvrir en 3D</Link>
            <Link href="/login" className="hover:text-emerald-400 transition-colors">Vendre</Link>
            <Link href="/boutiques" className="hover:text-emerald-400 transition-colors">Boutiques</Link>
            <Link href="/mes-commandes" className="hover:text-emerald-400 transition-colors">Commandes</Link>
          </div>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest pt-2">© {new Date().getFullYear()} VesTyle. Tous droits réservés.</p>
        </div>
      </footer>

      {/* Floating Action Button Camera Search */}
      <button
        type="button"
        onClick={() => setVisualSearchOpen(true)}
        title="Recherche par photo"
        aria-label="Recherche par photo"
        className="fixed right-5 bottom-6 z-40 w-14 h-14 rounded-full bg-emerald-500 text-slate-950 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-emerald-300"
      >
        <CameraIcon size={24} />
      </button>

      {/* Visual Search Modal */}
      {visualSearchOpen && (
        <VisualSearchModal
          onClose={() => setVisualSearchOpen(false)}
          onResults={(results) => {
            setVisualResults(results);
            scrollToFeed();
          }}
        />
      )}
    </div>
  );
}
