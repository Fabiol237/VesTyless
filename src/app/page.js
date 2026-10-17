'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

const artFontClass = 'font-black tracking-tight';

// ── SVG Icons ────────────────────────────────────────────────────────────────
const SearchIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const CameraIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
  </svg>
);
const MapPinIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
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
const HeartIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);
const StoreIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" />
  </svg>
);
const SparklesIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
  </svg>
);

// Format FCFA
const fmt = (v) => new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';

// Motif « doodle » façon fond WhatsApp
const doodle = { backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' };

const SectionHead = ({ title, subtitle, children }) => (
  <div className="flex items-end justify-between px-1 mb-4">
    <div>
      <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white ${artFontClass}`}>{title}</h2>
      {subtitle && <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [codeQuery, setCodeQuery] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);
  const [visualResults, setVisualResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Données carrousel visuel hero (3 images)
  const HERO_VISUAL_SLIDES = [
    {
      id: 'woman_search',
      badge: '📸 Recherche Visuelle IA',
      badgeBg: 'bg-amber-400 text-slate-950 font-bold',
      title: 'Trouvez par photo',
      desc: 'Prenez une photo d\'un article pour trouver immédiatement sa boutique à Douala ou Yaoundé.',
      image: '/images/hero_woman.png',
      stat: '⚡ 0.4s Détection',
    },
    {
      id: 'man_shopping',
      badge: '🛍️ Achetez Localement',
      badgeBg: 'bg-emerald-500 text-white font-bold',
      title: 'Vente de Proximité',
      desc: 'Accédez aux offres exclusives de 150+ boutiques locales vérifiées avec contact WhatsApp.',
      image: '/images/hero_man.png',
      stat: '🏪 150+ Boutiques',
    },
    {
      id: 'robot_logistics',
      badge: '🤖 Logistique IA Express',
      badgeBg: 'bg-blue-600 text-white font-bold',
      title: 'Expédition Intelligente',
      desc: 'Système automatisé de suivi et gestion de colis pour des livraisons ultra-rapides.',
      image: '/images/hero_robot.png',
      stat: '🚀 Livré < 2h',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_VISUAL_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [HERO_VISUAL_SLIDES.length]);

  // Données réelles Supabase
  const [realCategories, setRealCategories] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [popularStores, setPopularStores] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);

  const router = useRouter();
  const { requestLocation, userLocation, isLocating: isGpsLocating } = useDistance();

  // ── Autocomplétion depuis Supabase (offline-first) ──
  const { data: offlineSuggestions } = useOfflineData('home_suggestions_v3', async () => {
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

  // ── Charger les vraies données de la page d'accueil ──
  useEffect(() => {
    async function loadHomeData() {
      setDealsLoading(true);
      try {
        const [catsRes, dealsRes, storesRes, flashRes] = await Promise.all([
          supabase.from('global_categories').select('id, name, icon').limit(8),
          supabase
            .from('products')
            .select('id, name, price, original_price, image_url, is_promo, stores(name, slug, city, phone_whatsapp, latitude, longitude, logo_url)')
            .eq('is_active', true)
            .eq('is_promo', true)
            .order('daily_views', { ascending: false })
            .limit(6),
          supabase
            .from('stores')
            .select('id, name, slug, logo_url, city, is_boosted, daily_views, phone_whatsapp, latitude, longitude')
            .order('is_boosted', { ascending: false })
            .order('daily_views', { ascending: false })
            .limit(6),
          supabase
            .from('products')
            .select('id, name, price, original_price, is_promo, image_url, stores(name, city)')
            .eq('is_active', true)
            .or('is_promo.eq.true,original_price.gt.price')
            .order('created_at', { ascending: false })
            .limit(6),
        ]);

        if (catsRes.data) setRealCategories(catsRes.data);
        if (dealsRes.data) setTopDeals(dealsRes.data);
        if (storesRes.data) setPopularStores(storesRes.data);
        if (flashRes.data) setFlashSales(flashRes.data.filter(p => p.is_promo || (p.original_price && p.original_price > p.price)));
      } catch (err) {
        console.error('[Home] Erreur chargement données:', err);
      } finally {
        setDealsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  // ── Audio signature Vestyle & Theme-Color ──
  useEffect(() => {
    import('@/lib/haptic').then(({ sayVestyle }) => sayVestyle?.());
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = '#075E54';
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

  const discountPct = (p) => {
    if (!p.original_price || p.original_price <= p.price) return null;
    return `-${Math.round((1 - p.price / p.original_price) * 100)}%`;
  };

  const CATEGORY_EMOJIS = {
    'Mode & Beauté': '👗',
    'Alimentation & Supermarché': '🛒',
    'Électronique & High-Tech': '📱',
    'Maison & Électroménager': '🏠',
    'Santé & Bien-être': '💖',
    'Services & Loisirs': '⭐',
    'Divers': '📦',
  };

  const CATEGORY_PILLS = [
    { id: 'all', label: 'Toutes les catégories', emoji: '✨' },
    ...realCategories.map(c => ({
      id: c.name,
      label: c.name,
      emoji: CATEGORY_EMOJIS[c.name] || '🏷️',
    }))
  ];

  const slide = HERO_VISUAL_SLIDES[currentSlide];
  const goPrev = () => setCurrentSlide(p => (p - 1 + HERO_VISUAL_SLIDES.length) % HERO_VISUAL_SLIDES.length);
  const goNext = () => setCurrentSlide(p => (p + 1) % HERO_VISUAL_SLIDES.length);
  const pickCategory = (id) => { setActiveCategory(id); scrollToFeed(); };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white bg-[#F8FAFC] dark:bg-slate-950">
      <Navbar />

      {/* ═══ HERO — Glassmorphic Design Lumineux & Élégant ═══ */}
      <section
        className="relative z-20 text-white overflow-hidden shadow-2xl"
        style={{
          background: 'radial-gradient(circle at 50% 0%, #128C7E 0%, #075E54 50%, #043832 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 90px)',
          paddingBottom: '70px',
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      >
        {/* Glow ambient shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-15" style={doodle} />
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-emerald-400/25 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-teal-300/20 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Hero Header */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-bold uppercase tracking-wider shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Marketplace Sociale #1 au Cameroun</span>
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] ${artFontClass}`}>
              Vise l&apos;objet, <br />
              <span className="bg-gradient-to-r from-emerald-200 via-teal-100 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
                trouve la boutique
              </span>
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
              Découvrez les commerçants d&apos;exception de <strong className="text-white font-extrabold">Douala</strong> &amp; <strong className="text-white font-extrabold">Yaoundé</strong>. Recherche IA par photo, négociation WhatsApp et livraison express.
            </p>

            {/* Futuristic Search Box */}
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-full p-2 pl-4 shadow-2xl gap-2 max-w-2xl text-slate-900 border border-white/20 focus-within:ring-4 focus-within:ring-emerald-400/50 transition-all">
              <button
                type="button"
                onClick={() => setVisualSearchOpen(true)}
                className="text-emerald-600 dark:text-emerald-400 hover:scale-110 active:scale-95 transition-all p-1.5 shrink-0 bg-emerald-50 dark:bg-emerald-950/60 rounded-full"
                title="Recherche par photo"
              >
                <CameraIcon size={22} />
              </button>
              <div className="flex-1 min-w-0">
                <SearchAutocomplete
                  value={searchQuery}
                  onChange={setSearchQuery}
                  suggestions={suggestions}
                  placeholder="Rechercher un vêtement, une boutique..."
                  className="w-full"
                  inputClassName="w-full outline-none bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 font-bold text-xs sm:text-sm py-2"
                />
              </div>
              <VoiceSearchButton
                onInterimResult={(t) => setSearchQuery(t)}
                onResult={(t) => { setSearchQuery(t); scrollToFeed(); }}
                className="text-slate-400 hover:text-emerald-600 p-1 shrink-0"
              />
              <button
                type="button"
                onClick={scrollToFeed}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-full transition-all shadow-lg shrink-0"
              >
                Chercher
              </button>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => { triggerFeedback?.('radar'); requestLocation(); scrollToFeed(); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all border shadow-sm ${
                  userLocation
                    ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                    : 'bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-md'
                }`}
              >
                <MapPinIcon size={14} className={isGpsLocating ? 'animate-bounce' : ''} />
                <span>{isGpsLocating ? 'Localisation...' : userLocation ? '📍 Proximité activée' : 'Autour de moi'}</span>
              </button>

              <form onSubmit={handleCodeSearch} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 rounded-full pl-4 pr-1.5 py-1.5 transition-all">
                <HashIcon size={14} className="text-emerald-200 shrink-0" />
                <input
                  type="text"
                  maxLength={5}
                  value={codeQuery}
                  onChange={e => { setCodeQuery(e.target.value.replace(/\D/g, '')); setCodeError(''); }}
                  placeholder="Code Boutique"
                  className="w-24 bg-transparent outline-none text-xs font-mono font-bold text-white uppercase tracking-wider placeholder:text-white/60"
                />
                <button
                  type="submit"
                  disabled={codeQuery.length !== 5 || codeLoading}
                  className="p-1.5 bg-emerald-400 text-slate-950 rounded-full disabled:opacity-40 hover:scale-105 transition-all shrink-0"
                >
                  {codeLoading ? <LoaderIcon size={14} /> : <ArrowRightIcon size={14} />}
                </button>
              </form>

              {codeError && (
                <span className="text-xs font-bold text-red-200 bg-red-500/40 px-3 py-1.5 rounded-full border border-red-400/40">⚠️ {codeError}</span>
              )}
            </div>

            {/* Direct Link to Experience Page */}
            <div className="pt-2">
              <Link
                href="/decouvrir"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/60 hover:bg-emerald-900/90 text-emerald-200 text-xs font-extrabold border border-emerald-400/30 backdrop-blur-md transition-all shadow-md group"
              >
                <SparklesIcon size={14} className="text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>Découvrir l&apos;expérience VesTyle en 3D</span>
                <ArrowRightIcon size={12} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Interactive Phone Frame Slide Preview */}
          <div className="lg:col-span-5 w-full max-w-[360px] mx-auto lg:mx-0 lg:ml-auto">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-900 text-white">
              <div className="flex items-center gap-3 bg-slate-950 px-4 py-3 border-b border-slate-800">
                <img src="/vestyle-logo.png" alt="VesTyle" className="w-9 h-9 rounded-xl object-contain bg-slate-800 p-1" />
                <div className="min-w-0">
                  <div className="font-extrabold text-sm leading-tight text-white">VesTyle Live</div>
                  <div className="text-[11px] text-emerald-400 font-medium">Boutiques Douala &amp; Yaoundé</div>
                </div>
                <span className="ml-auto text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">{slide.stat}</span>
              </div>

              <div className="p-4 bg-slate-900 min-h-[310px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="space-y-3"
                  >
                    <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
                      <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                      <span className={`absolute top-2 left-2 text-[10px] font-black px-3 py-1 rounded-full shadow-lg ${slide.badgeBg}`}>{slide.badge}</span>
                    </div>
                    <div className="px-1">
                      <div className="font-extrabold text-base text-white">{slide.title}</div>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">{slide.desc}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between bg-slate-950 px-4 py-3 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  {HERO_VISUAL_SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      title={s.title}
                      aria-label={s.title}
                      className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={goPrev} aria-label="Précédent" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition-all">‹</button>
                  <button type="button" onClick={goNext} aria-label="Suivant" className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-all shadow-md">›</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STORIES / BOUTIQUES POPULAIRES ═══ */}
      <div className="relative z-10 -mt-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-4 flex gap-4 overflow-x-auto no-scrollbar">
          <Link href="/login" className="flex flex-col items-center gap-1.5 shrink-0 w-16 group">
            <span className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-2xl font-black shadow-md group-hover:scale-105 transition-transform">+</span>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">Vendre</span>
          </Link>
          {dealsLoading && [1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 w-16 animate-pulse">
              <span className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800" />
              <span className="h-2 w-10 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
          {popularStores.map(s => (
            <Link key={s.id} href={`/boutique/${s.slug}`} className="flex flex-col items-center gap-1.5 shrink-0 w-16 group">
              <span className="w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-tr from-emerald-400 via-teal-500 to-amber-400 group-hover:scale-105 transition-transform">
                <span className="block w-full h-full rounded-full bg-white dark:bg-slate-900 p-[2px]">
                  {s.logo_url ? (
                    <img src={s.logo_url} alt={s.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">🏪</span>
                  )}
                </span>
              </span>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center line-clamp-1 w-full">{s.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-28 pt-8">

        {/* Navigation par Catégories */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-2">
          {CATEGORY_PILLS.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => pickCategory(c.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                activeCategory === c.id
                  ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 border-slate-900 dark:border-emerald-400 shadow-lg'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
              }`}
            >
              <span>{c.emoji}</span>{c.label}
            </button>
          ))}
        </div>

        {/* Card Promotionnelle pour Marchands */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-400">
                <SparklesIcon size={14} /> Pour les Commerçants &amp; Créateurs
              </div>
              <h2 className={`text-2xl sm:text-3xl font-black leading-tight ${artFontClass}`}>Créez votre boutique officielle VesTyle</h2>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">Assistance IA pour catalogues, fiches produits automatiques, commandes suivies et liens WhatsApp directs.</p>
            </div>
            <Link
              href="/login"
              className="shrink-0 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-black text-sm px-6 py-4 rounded-full shadow-xl transition-all hover:scale-105"
            >
              <span>Ouvrir ma boutique</span> <ArrowRightIcon size={16} />
            </Link>
          </div>
        </section>

        {/* Offres de la semaine (Top Deals) */}
        {(dealsLoading || topDeals.length > 0) && (
          <section className="space-y-4">
            <SectionHead title="🔥 Offres Incontournables" subtitle="Les pépites les plus recherchées de la région">
              <button type="button" onClick={scrollToFeed} className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline">Voir tout →</button>
            </SectionHead>
            {dealsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-3 animate-pulse space-y-3">
                    <div className="aspect-square rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {topDeals.slice(0, 6).map(deal => {
                  const disc = discountPct(deal);
                  return (
                    <Link
                      key={deal.id}
                      href={deal.stores?.slug ? `/boutique/${deal.stores.slug}` : '#'}
                      className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                        {deal.image_url ? (
                          <img src={deal.image_url} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <span className="text-4xl opacity-30">🛍️</span>
                        )}
                        {disc && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">{disc}</span>}
                      </div>
                      <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{deal.name}</div>
                          {deal.stores?.name && (
                            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                              <StoreIcon size={10} className="shrink-0" /><span>{deal.stores.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="pt-1">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{fmt(deal.price)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Boutiques Populaires Grid */}
        {(dealsLoading || popularStores.length > 0) && (
          <section className="space-y-4">
            <SectionHead title="🏪 Boutiques en vedette" subtitle="Commerces certifiés proches de chez vous">
              <Link href="/boutiques" className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline">Toutes les boutiques →</Link>
            </SectionHead>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {popularStores.slice(0, 6).map((store, idx) => (
                <article key={store.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all overflow-hidden group flex flex-col justify-between">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 ring-2 ring-emerald-500/50 shrink-0">
                        {store.logo_url ? (
                          <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🏪</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">{store.name}</div>
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1"><MapPinIcon size={11} />{store.city || 'Douala'}</div>
                      </div>
                    </div>
                    {store.is_boosted && <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-500 text-slate-950 rounded-full shrink-0">Sponsorisé</span>}
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <HeartIcon size={12} className="text-rose-500" /> {store.daily_views || 0} visiteurs
                    </span>
                    <Link
                      href={`/boutique/${store.slug}`}
                      className="inline-flex items-center gap-1 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs px-4 py-2 rounded-full hover:opacity-90 transition-all"
                    >
                      <span>Visiter</span> <ArrowRightIcon size={12} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Discovery Feed */}
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

        {/* Footer */}
        <footer className="mt-16 pt-12 pb-6 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <img src="/vestyle-logo.png" className="w-10 h-10 rounded-xl shadow-sm object-contain bg-slate-900 p-1" alt="VesTyle Logo" onError={(e) => { e.currentTarget.src = '/icon-512.png'; }} />
              <h2 className={`text-3xl font-black tracking-tight text-slate-900 dark:text-white ${artFontClass}`}>
                Ves<span className="text-emerald-500">Tyle</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">L&apos;expérience commerce locale de nouvelle génération — Douala &amp; Yaoundé</p>
            <div className="flex flex-wrap justify-center gap-6 text-[11px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-400">
              <Link href="/decouvrir" className="hover:text-emerald-500 transition-colors">Découvrir en 3D</Link>
              <Link href="/login" className="hover:text-emerald-500 transition-colors">Vendre sur VesTyle</Link>
              <Link href="/boutiques" className="hover:text-emerald-500 transition-colors">Boutiques</Link>
              <Link href="/mes-commandes" className="hover:text-emerald-500 transition-colors">Mes Commandes</Link>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 pt-2">© {new Date().getFullYear()} VesTyle. Tous droits réservés.</p>
          </div>
        </footer>
      </div>

      {/* Floating Camera Search Button */}
      <button
        type="button"
        onClick={() => setVisualSearchOpen(true)}
        title="Recherche visuelle par photo"
        aria-label="Recherche visuelle par photo"
        className="fixed right-5 bottom-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-white/40"
      >
        <CameraIcon size={26} />
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
