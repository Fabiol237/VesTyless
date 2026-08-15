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
import { Outfit } from 'next/font/google';
import { triggerFeedback } from '@/lib/haptic';
import Navbar from '@/components/Navbar';
import dynamic from 'next/dynamic';

const LiveShowcase = dynamic(() => import('@/components/LiveShowcase'), { ssr: false });

const artFont = Outfit({ subsets: ['latin'], weight: ['800', '900'] });

// ── SVG Icons ────────────────────────────────────────────────────────────────
const SearchIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
const CameraIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
  </svg>
);
const MapPinIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const HashIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/>
    <line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>
  </svg>
);
const ArrowRightIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
const LoaderIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
const HeartIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);
const MessageCircleIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
  </svg>
);
const ShareIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
  </svg>
);
const SlidersIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/>
    <line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/>
    <line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/>
    <line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>
  </svg>
);
const ZapIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const XIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
const StoreIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/>
  </svg>
);

// Format FCFA
const fmt = (v) => new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';

// Flash countdown helper
function useCountdown(targetHour = 23) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(targetHour, 59, 59, 0);
      if (end < now) end.setDate(end.getDate() + 1);
      const diff = Math.max(0, end - now);
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetHour]);
  return timeLeft;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [codeQuery, setCodeQuery] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);
  const [visualResults, setVisualResults] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Données réelles Supabase
  const [realCategories, setRealCategories] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [popularStores, setPopularStores] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);

  const timeLeft = useCountdown(23);
  const router = useRouter();
  const { requestLocation, userLocation, isLocating: isGpsLocating } = useDistance();

  // ── Autocomplétion depuis Supabase (offline-first) ──
  const { data: offlineSuggestions } = useOfflineData('home_suggestions_v2', async () => {
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
          // Catégories réelles
          supabase.from('global_categories').select('id, name, icon').limit(8),

          // Top deals : produits en promo triés par remise
          supabase
            .from('products')
            .select('id, name, price, original_price, image_url, is_promo, stores(name, slug, city, phone_whatsapp, latitude, longitude, logo_url)')
            .eq('is_active', true)
            .eq('is_promo', true)
            .order('daily_views', { ascending: false })
            .limit(6),

          // Boutiques populaires (les plus boostées / vues)
          supabase
            .from('stores')
            .select('id, name, slug, logo_url, city, is_boosted, daily_views, phone_whatsapp, latitude, longitude')
            .order('is_boosted', { ascending: false })
            .order('daily_views', { ascending: false })
            .limit(6),

          // Ventes Flash : produits avec prix original (= remise)
          supabase
            .from('products')
            .select('id, name, price, original_price, image_url, stores(name, city)')
            .eq('is_active', true)
            .not('original_price', 'is', null)
            .order('created_at', { ascending: false })
            .limit(3),
        ]);

        if (catsRes.data) setRealCategories(catsRes.data);
        if (dealsRes.data) setTopDeals(dealsRes.data);
        if (storesRes.data) setPopularStores(storesRes.data);
        if (flashRes.data) setFlashSales(flashRes.data.filter(p => p.original_price > p.price));
      } catch (err) {
        console.error('[Home] Erreur chargement données:', err);
      } finally {
        setDealsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  // ── Audio signature Vestyle ──
  useEffect(() => {
    import('@/lib/haptic').then(({ sayVestyle }) => sayVestyle?.());
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

  // Catégories réelles Supabase avec emojis dédiés
  const CATEGORY_PILLS = [
    { id: 'all', label: 'Toutes les catégories', emoji: '✨' },
    ...realCategories.map(c => ({
      id: c.name,
      label: c.name,
      emoji: CATEGORY_EMOJIS[c.name] || '🏷️',
    }))
  ];

  return (
    <div className="min-h-screen text-slate-900 font-sans antialiased selection:bg-blue-500 selection:text-white"
         style={{ background: '#F2F5FB' }}>

      {/* ── NAVBAR GLOBALE ── */}
      <Navbar />

      {/* ── HALOS LUMINEUX FIXES ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-500/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-orange-400/10 blur-[130px]" />
        <div className="absolute bottom-20 left-1/4 w-[600px] h-[400px] rounded-full bg-teal-400/10 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 space-y-8 sm:space-y-12 pb-24">

        {/* ═══════════════════════════════════════════════════════════════════
            HERO BANNER BLEU COSMIQUE (COUVRANCE TOTALE SOUS LE NAVBAR)
        ════════════════════════════════════════════════════════════════════ */}
        <section className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-16 sm:-mt-24 rounded-b-[32px] sm:rounded-b-[44px] relative overflow-hidden p-6 sm:p-12 pt-28 sm:pt-36 pb-8 sm:pb-12 text-white shadow-2xl shadow-blue-600/25"
          style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)' }}>



          {/* Fond radial & particules */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none"/>
          <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-indigo-400/25 blur-3xl pointer-events-none"/>
          <div className="absolute top-3 right-6 text-white/20 text-xs select-none">✦ ✨ ✦</div>

          <div className="relative z-10 space-y-4">
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white ${artFont.className}`}>
              Vise l&apos;objet,<br/>trouve la boutique
            </h1>
            <p className="text-blue-100/85 text-xs sm:text-sm font-medium max-w-xs sm:max-w-md leading-relaxed">
              Découvre les meilleures boutiques locales à Douala & Yaoundé.<br className="hidden sm:block"/> Deals exclusifs, livraison rapide.
            </p>

            {/* BARRE DE RECHERCHE BLANCHE PILL */}
            <div className="pt-1">
              <div className="flex items-center bg-white/97 backdrop-blur-md rounded-2xl p-1.5 pl-4 shadow-xl border border-white/60 gap-2 focus-within:ring-2 focus-within:ring-white/70 transition-all">

                {/* Caméra → recherche visuelle */}
                <button
                  type="button"
                  onClick={() => setVisualSearchOpen(true)}
                  className="text-slate-400 hover:text-blue-600 transition-colors p-0.5 shrink-0"
                  title="Recherche par image"
                >
                  <CameraIcon size={20}/>
                </button>

                {/* Autocomplete */}
                <div className="flex-1 min-w-0">
                  <SearchAutocomplete
                    value={searchQuery}
                    onChange={setSearchQuery}
                    suggestions={suggestions}
                    placeholder="Rechercher un article, une boutique..."
                    className="w-full"
                    inputClassName="w-full outline-none bg-transparent text-slate-900 placeholder:text-slate-400 font-semibold text-xs sm:text-sm py-2"
                  />
                </div>

                {/* Micro (recherche vocale) */}
                <VoiceSearchButton
                  onInterimResult={(t) => setSearchQuery(t)}
                  onResult={(t) => { setSearchQuery(t); scrollToFeed(); }}
                  className="text-slate-400 hover:text-blue-600 p-1 shrink-0"
                />

                {/* Bouton Chercher */}
                <button
                  type="button"
                  onClick={scrollToFeed}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md shrink-0"
                >
                  Chercher
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            3. ACTIONS RAPIDES (GPS, Code boutique, Carte, Filtres)
        ════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/70 rounded-2xl p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">

            {/* Autour de moi */}
            <button
              type="button"
              onClick={() => { triggerFeedback?.('radar'); requestLocation(); scrollToFeed(); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                userLocation
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <MapPinIcon size={15} className={isGpsLocating ? 'animate-bounce text-blue-600' : userLocation ? 'text-emerald-600' : 'text-blue-600'}/>
              <span>{isGpsLocating ? 'Localisation...' : userLocation ? '📍 Localisé' : 'Autour de moi'}</span>
            </button>

            {/* Afficher la carte */}
            <button
              type="button"
              onClick={() => setShowMap(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                showMap
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'
              }`}
            >
              <MapPinIcon size={15}/>
              <span>Carte</span>
            </button>

            {/* Filtres */}
            <button
              type="button"
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                showFilters
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <SlidersIcon size={14}/>
              <span>Filtres</span>
            </button>

            {/* Séparateur */}
            <div className="flex-1"/>

            {/* Code Boutique */}
            <form onSubmit={handleCodeSearch} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <HashIcon size={14} className="text-amber-500"/>
              <input
                type="text"
                maxLength={5}
                value={codeQuery}
                onChange={e => { setCodeQuery(e.target.value.replace(/\D/g, '')); setCodeError(''); }}
                placeholder="Code Boutique"
                className="w-24 bg-transparent outline-none text-xs font-mono font-bold text-slate-800 uppercase tracking-widest placeholder:text-amber-400"
              />
              <button
                type="submit"
                disabled={codeQuery.length !== 5 || codeLoading}
                className="p-1.5 bg-amber-500 text-white rounded-lg disabled:opacity-40 hover:bg-amber-600 transition-all"
              >
                {codeLoading ? <LoaderIcon size={14}/> : <ArrowRightIcon size={13}/>}
              </button>
            </form>
          </div>

          {/* Erreur code */}
          <AnimatePresence>
            {codeError && (
              <motion.p
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-2 text-xs font-bold text-rose-500 bg-rose-50 px-3 py-2 rounded-xl border border-rose-100 text-center"
              >
                ⚠️ {codeError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Panel Filtres */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-slate-100 overflow-hidden"
              >
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Trier le feed par</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'boost', label: '⭐ Suggérés' },
                    { id: 'distance', label: '📍 Proximité' },
                    { id: 'newest', label: '🆕 Nouveautés' },
                    { id: 'price_asc', label: '⬆️ Prix croissant' },
                    { id: 'price_desc', label: '⬇️ Prix décroissant' },
                  ].map(opt => (
                    <button key={opt.id}
                      onClick={() => scrollToFeed()}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all"
                    >{opt.label}</button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            4. PILLS CATÉGORIES RÉELLES (Vraies catégories BDD avec emojis)
        ════════════════════════════════════════════════════════════════════ */}
        {CATEGORY_PILLS.length > 1 && (
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            {CATEGORY_PILLS.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setActiveCategory(cat.id); scrollToFeed(); }}
                  className={`flex items-center gap-2 px-4.5 py-3 rounded-2xl text-xs font-black transition-all duration-200 shrink-0 border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.02]'
                      : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 shadow-xs'
                  }`}
                >
                  <span className="text-sm">{cat.emoji}</span>
                  <span className="whitespace-nowrap">{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}


        {/* ═══════════════════════════════════════════════════════════════════
            5. 🔥 TOP DEALS DU MOMENT (données réelles Supabase)
        ════════════════════════════════════════════════════════════════════ */}
        {(dealsLoading || topDeals.length > 0) && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className={`text-lg font-black text-slate-900 tracking-tight ${artFont.className}`}>
                🔥 Top deals du moment
              </h2>
              <button onClick={scrollToFeed} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Voir tout →
              </button>
            </div>

            {dealsLoading ? (
              // Skeleton loader
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-3xl p-4 border border-slate-100 animate-pulse space-y-3">
                    <div className="aspect-[4/3] rounded-2xl bg-slate-100"/>
                    <div className="h-4 bg-slate-100 rounded-lg w-3/4"/>
                    <div className="h-3 bg-slate-50 rounded-lg w-1/2"/>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {topDeals.slice(0, 6).map(deal => {
                  const disc = discountPct(deal);
                  return (
                    <Link
                      key={deal.id}
                      href={deal.stores?.slug ? `/boutique/${deal.stores.slug}` : '#'}
                      className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-100 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col group overflow-hidden"
                    >
                      {disc && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-md z-10">
                          {disc}
                        </div>
                      )}

                      <div className="w-full aspect-[4/3] sm:aspect-square rounded-2xl bg-slate-50 overflow-hidden mb-3.5 flex items-center justify-center relative">
                        {deal.image_url ? (
                          <img src={deal.image_url} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        ) : (
                          <span className="text-4xl opacity-30">🛍️</span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div className="space-y-1 mt-auto">
                        <div className="text-xs font-bold text-slate-700 line-clamp-1 group-hover:text-blue-600 transition-colors">{deal.name}</div>
                        {deal.stores?.name && (
                          <div className="text-[10px] font-medium text-slate-400 truncate">{deal.stores.name}</div>
                        )}
                        <div className="flex items-baseline gap-1.5 pt-1">
                          <span className="text-sm sm:text-base font-black text-slate-900">{fmt(deal.price)}</span>
                          {deal.original_price && deal.original_price > deal.price && (
                            <span className="text-[10px] font-bold text-slate-400 line-through">{fmt(deal.original_price)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            6. POPULAIRE PRÈS DE VOUS (boutiques réelles Supabase)
        ════════════════════════════════════════════════════════════════════ */}
        {(dealsLoading || popularStores.length > 0) && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className={`text-lg font-black text-slate-900 tracking-tight ${artFont.className}`}>
                Populaire près de vous
              </h2>
              <Link href="/boutiques" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Toutes les boutiques →
              </Link>
            </div>

            {dealsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100"/>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-3/4"/>
                        <div className="h-2 bg-slate-50 rounded w-1/2"/>
                      </div>
                    </div>
                    <div className="aspect-[4/3] rounded-xl bg-slate-100"/>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {popularStores.slice(0, 4).map((store, idx) => (
                  <div key={store.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-3 group">

                    {/* En-tête boutique */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
                          {store.logo_url ? (
                            <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover"/>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">🏪</div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900 line-clamp-1">{store.name}</div>
                          <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                            <MapPinIcon size={10}/>
                            {store.city || 'Douala'}
                          </div>
                        </div>
                      </div>
                      {store.is_boosted && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-orange-500 text-white rounded-full">LIVE</span>
                      )}
                    </div>

                    {/* Image vitrine boutique */}
                    <Link href={`/boutique/${store.slug}`}>
                      <div className="relative aspect-[4/3] rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                        {store.logo_url ? (
                          <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <StoreIcon size={40} className="text-slate-300"/>
                          </div>
                        )}
                        {/* Badge top / flash */}
                        <div className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-black text-white shadow-sm flex items-center gap-1 ${idx % 2 === 0 ? 'bg-red-500' : 'bg-amber-500'}`}>
                          <span>{idx % 2 === 0 ? '🔥' : '⭐'}</span>
                          <span>{idx % 2 === 0 ? 'Flash' : 'Top'}</span>
                        </div>
                        {/* Overlay lien visite */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-white text-[11px] font-black uppercase tracking-wider">Visiter →</span>
                        </div>
                      </div>
                    </Link>

                    {/* Actions sociales + bouton WhatsApp */}
                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center gap-2.5 text-slate-400 text-xs font-bold">
                        <span className="flex items-center gap-1 text-slate-500 font-semibold" title="Vues de la boutique">
                          <HeartIcon size={13} className="text-rose-500"/> {store.daily_views || 0} vues
                        </span>
                      </div>


                      {store.phone_whatsapp ? (
                        <a
                          href={`https://wa.me/${store.phone_whatsapp}?text=Bonjour%20!%20J'ai%20vu%20votre%20boutique%20sur%20VesTyle.`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
                        >
                          <span>🟢</span><span>Discuter</span>
                        </a>
                      ) : (
                        <Link
                          href={`/boutique/${store.slug}`}
                          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
                        >
                          <span>→</span><span>Voir</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            7. ⚡ VENTES FLASH (timer + produits réels en promo)
        ════════════════════════════════════════════════════════════════════ */}
        {flashSales.length > 0 && (
          <section className="relative overflow-hidden rounded-[24px] p-5 sm:p-6 border border-red-500/20"
            style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 100%)' }}>

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.08),transparent_70%)] pointer-events-none"/>

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className={`text-xl font-black text-white flex items-center gap-2 ${artFont.className}`}>
                    <span className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse text-2xl">⚡</span>
                    Ventes Flash
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">Offres exclusives — les prix remontent bientôt !</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 backdrop-blur-md px-4 py-2.5 rounded-xl flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[10px] text-red-400 uppercase tracking-widest font-black">Fin dans :</span>
                  <span className="text-lg font-mono font-black text-red-400">{timeLeft}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {flashSales.map(product => {
                  const disc = discountPct(product);
                  return (
                    <div key={product.id} className="flex gap-3 items-center bg-white/5 border border-white/8 rounded-2xl p-4 hover:border-red-500/30 transition-all">
                      <div className="w-20 h-20 rounded-xl bg-slate-950/60 overflow-hidden relative shrink-0 border border-white/5">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-2xl">📦</div>
                        )}
                        {disc && (
                          <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg">
                            {disc}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm line-clamp-1">{product.name}</h3>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{product.stores?.name} • {product.stores?.city}</p>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-base font-black text-red-400 font-mono">{fmt(product.price)}</span>
                          {product.original_price > product.price && (
                            <span className="text-[11px] text-slate-500 line-through font-mono">{fmt(product.original_price)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            8. CATALOGUE COMPLET & FEED INTERACTIF (ClientDiscovery)
        ════════════════════════════════════════════════════════════════════ */}
        <section id="discovery-feed-section" className="pt-2">
          <ClientDiscovery
            externalSearchQuery={searchQuery}
            onExternalSearchChange={setSearchQuery}
            overrideProducts={visualResults}
            onClearVisualSearch={() => setVisualResults(null)}
            initialProximity={!!userLocation}
          />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            9. FOOTER PREMIUM
        ════════════════════════════════════════════════════════════════════ */}
        <footer className="mt-16 pt-10 pb-4 border-t border-slate-200/60">
          <div className="text-center space-y-4">
            <h2 className={`text-4xl sm:text-5xl font-black tracking-tight text-slate-900 ${artFont.className}`}>
              Ves<span className="text-orange-600">Tyle</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">Marketplace social local — Douala & Yaoundé</p>
            <div className="flex flex-wrap justify-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <Link href="/login" className="hover:text-blue-600 transition-colors">Vendre sur VesTyle</Link>
              <Link href="/boutiques" className="hover:text-blue-600 transition-colors">Boutiques</Link>
              <Link href="/mes-commandes" className="hover:text-blue-600 transition-colors">Mes Commandes</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Aide</Link>
            </div>
            <div className="w-full max-w-xs mx-auto h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"/>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Cameroun Excellence • {new Date().getFullYear()}
            </p>
          </div>
        </footer>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL RECHERCHE VISUELLE (IA)
      ════════════════════════════════════════════════════════════════════ */}
      {visualSearchOpen && (
        <VisualSearchModal
          onClose={() => setVisualSearchOpen(false)}
          onResultsFound={(results) => {
            setVisualResults(results);
            setVisualSearchOpen(false);
            scrollToFeed();
          }}
        />
      )}
    </div>
  );
}
