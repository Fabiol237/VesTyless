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

const artFont = Outfit({ subsets: ['latin'], weight: ['800', '900'] });


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
const MessageCircleIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);
const ShareIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
  </svg>
);
const SlidersIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" />
    <line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" />
    <line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" />
    <line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" />
  </svg>
);
const ZapIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const XIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);
const StoreIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" />
  </svg>
);

// Format FCFA
const fmt = (v) => new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';



// Motif « doodle » façon fond WhatsApp
const doodle = { backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' };

const SectionHead = ({ title, children }) => (
  <div className="flex items-center justify-between px-1">
    <h2 className={`text-lg sm:text-xl font-black tracking-tight text-slate-900 ${artFont.className}`}>{title}</h2>
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
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Données carrousel visuel hero (3 images générées)
  const HERO_VISUAL_SLIDES = [
    {
      id: 'woman_search',
      badge: '📸 Recherche Visuelle IA',
      badgeBg: 'bg-amber-400 text-slate-950',
      title: 'Trouvez par photo',
      desc: 'Prenez une photo d\'un article pour trouver immédiatement sa boutique à Douala ou Yaoundé.',
      image: '/images/hero_woman.png',
      stat: '⚡ 0.4s Détection',
    },
    {
      id: 'man_shopping',
      badge: '🛍️ Achetez Localement',
      badgeBg: 'bg-emerald-500 text-white',
      title: 'Vente de Proximité',
      desc: 'Accédez aux offres exclusives de 150+ boutiques locales vérifiées avec contact WhatsApp.',
      image: '/images/hero_man.png',
      stat: '🏪 150+ Boutiques',
    },
    {
      id: 'robot_logistics',
      badge: '🤖 Logistique IA Express',
      badgeBg: 'bg-blue-600 text-white',
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

          // Offres Promo réelles configurées par les marchands
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

  // ── Audio signature Vestyle & Theme-Color Barre de Statut Mobile ──
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

  // Catégories réelles Supabase avec emojis dédiés
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
    <div className="min-h-screen text-slate-900 antialiased selection:bg-wa-green selection:text-white" style={{ background: '#EFEAE2' }}>
      <Navbar />

      {/* ═══ HERO — style WhatsApp (vert profond + motif doodle) ═══ */}
      <section
        className="relative z-20 text-white"
        style={{
          background: 'linear-gradient(160deg,#075E54 0%,#128C7E 62%,#1fa855 125%)',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 84px)',
          paddingBottom: '60px',
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
          <div className="absolute inset-0" style={doodle} />
          <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-wa-green/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Texte + recherche */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-100 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-wa-green animate-pulse" />
              #1 Marketplace de Proximité au Cameroun
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] ${artFont.className}`}>
              Vise l&apos;objet,<br />
              <span style={{ background: 'linear-gradient(90deg,#ffffff 0%,#b9f6ca 55%,#25D366 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                trouve la boutique
              </span>
            </h1>

            <p className="text-emerald-50/90 text-sm sm:text-base font-medium max-w-lg leading-relaxed">
              Les meilleures boutiques locales à <strong className="text-white font-extrabold">Douala</strong> &amp; <strong className="text-white font-extrabold">Yaoundé</strong> — Recherche photo, deals exclusifs, discussion directe sur WhatsApp.
            </p>

            {/* Barre de recherche façon Facebook (pilule) */}
            <div className="relative flex items-center bg-white rounded-full p-1.5 pl-4 shadow-2xl gap-2 max-w-xl text-slate-900 focus-within:ring-4 focus-within:ring-wa-green/40 transition-all">
              <button type="button" onClick={() => setVisualSearchOpen(true)} className="text-wa-teal hover:text-wa-teal-dark transition-colors p-0.5 shrink-0" title="Recherche par image">
                <CameraIcon size={20} />
              </button>
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
              <VoiceSearchButton
                onInterimResult={(t) => setSearchQuery(t)}
                onResult={(t) => { setSearchQuery(t); scrollToFeed(); }}
                className="text-slate-400 hover:text-wa-teal p-1 shrink-0"
              />
              <button type="button" onClick={scrollToFeed} className="bg-wa-teal hover:bg-wa-teal-dark active:scale-95 text-white font-extrabold text-xs px-5 py-3 rounded-full transition-all shadow-lg shrink-0">
                Chercher
              </button>
            </div>

            {/* Actions rapides : GPS + code boutique */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => { triggerFeedback?.('radar'); requestLocation(); scrollToFeed(); }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-xs transition-all border ${
                  userLocation ? 'bg-wa-green text-slate-950 border-wa-green shadow-md' : 'bg-white/15 hover:bg-white/25 text-white border-white/30'
                }`}
              >
                <MapPinIcon size={13} className={isGpsLocating ? 'animate-bounce' : ''} />
                <span>{isGpsLocating ? 'Localisation...' : userLocation ? '📍 Localisé' : 'Autour de moi'}</span>
              </button>

              <form onSubmit={handleCodeSearch} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/20 border border-white/30 rounded-full pl-3.5 pr-1.5 py-1.5 transition-all">
                <HashIcon size={12} className="text-emerald-200 shrink-0" />
                <input
                  type="text"
                  maxLength={5}
                  value={codeQuery}
                  onChange={e => { setCodeQuery(e.target.value.replace(/\D/g, '')); setCodeError(''); }}
                  placeholder="Code Boutique"
                  className="w-24 bg-transparent outline-none text-xs font-mono font-bold text-white uppercase tracking-widest placeholder:text-white/50"
                />
                <button
                  type="submit"
                  disabled={codeQuery.length !== 5 || codeLoading}
                  className="p-1.5 bg-wa-green text-slate-950 rounded-full disabled:opacity-40 hover:brightness-110 transition-all shrink-0"
                >
                  {codeLoading ? <LoaderIcon size={12} /> : <ArrowRightIcon size={12} />}
                </button>
              </form>

              {codeError && (
                <span className="text-xs font-bold text-red-100 bg-red-500/30 px-3 py-1.5 rounded-full border border-red-300/40">⚠️ {codeError}</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { icon: '📸', label: 'Recherche Image IA' },
                { icon: '🏪', label: '150+ Boutiques' },
                { icon: '🤖', label: 'Logistique Robotisée' },
                { icon: '📍', label: 'Douala & Yaoundé' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/15 border border-white/15 text-white text-[11px] font-bold">
                  <span>{s.icon}</span><span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fenêtre de discussion WhatsApp = carrousel */}
          <div className="lg:col-span-5 w-full max-w-[360px] mx-auto lg:mx-0 lg:ml-auto">
            <div className="rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-white/20 bg-[#ECE5DD] text-slate-900">
              <div className="flex items-center gap-3 bg-wa-teal-dark text-white px-4 py-3">
                <img src="/icon-512.png" alt="VesTyle" className="w-9 h-9 rounded-full object-cover bg-white" />
                <div className="min-w-0">
                  <div className="font-extrabold text-sm leading-tight">VesTyle</div>
                  <div className="text-[11px] text-emerald-200">en ligne · Douala &amp; Yaoundé</div>
                </div>
                <span className="ml-auto text-[10px] font-black px-2.5 py-1 rounded-full bg-black/25 text-amber-300 whitespace-nowrap">{slide.stat}</span>
              </div>

              <div className="p-3 min-h-[300px]" style={{ backgroundImage: 'radial-gradient(rgba(7,94,84,0.10) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="space-y-2"
                  >
                    <div className="bg-white rounded-2xl rounded-tl-sm p-1.5 shadow-sm max-w-[94%]">
                      <div className="relative h-44 rounded-xl overflow-hidden">
                        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                        <span className={`absolute top-2 left-2 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow ${slide.badgeBg}`}>{slide.badge}</span>
                      </div>
                      <div className="px-2 pt-2 pb-1">
                        <div className="font-black text-sm">{slide.title}</div>
                        <p className="text-xs text-slate-600 leading-snug mt-0.5">{slide.desc}</p>
                      </div>
                    </div>
                    <div className="ml-auto w-fit max-w-[70%] bg-wa-chat rounded-2xl rounded-tr-sm px-3 py-2 shadow-sm text-xs font-semibold">
                      Je veux ça ! <span className="text-sky-500">✓✓</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between bg-white px-4 py-2.5 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  {HERO_VISUAL_SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      title={s.title}
                      aria-label={s.title}
                      className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-7 bg-wa-green' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={goPrev} aria-label="Précédent" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-700 text-sm font-black transition-all">‹</button>
                  <button type="button" onClick={goNext} aria-label="Suivant" className="w-8 h-8 rounded-full bg-wa-green hover:brightness-110 active:scale-90 text-white text-sm font-black transition-all shadow-md">›</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATUTS / STORIES — boutiques populaires (style Facebook & WhatsApp) ═══ */}
      <div className="relative z-10 -mt-8 max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-lg border border-black/5 p-3.5 flex gap-4 overflow-x-auto no-scrollbar">
          <Link href="/login" className="flex flex-col items-center gap-1.5 shrink-0 w-16">
            <span className="w-14 h-14 rounded-full bg-wa-green text-white flex items-center justify-center text-3xl font-black shadow-md">+</span>
            <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">Vendre</span>
          </Link>
          {dealsLoading && [1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 w-16 animate-pulse">
              <span className="w-14 h-14 rounded-full bg-slate-100" />
              <span className="h-2 w-10 rounded bg-slate-100" />
            </div>
          ))}
          {popularStores.map(s => (
            <Link key={s.id} href={`/boutique/${s.slug}`} className="flex flex-col items-center gap-1.5 shrink-0 w-16">
              <span className="w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-tr from-wa-green via-emerald-400 to-wa-teal">
                <span className="block w-full h-full rounded-full bg-white p-[2px]">
                  {s.logo_url ? (
                    <img src={s.logo_url} alt={s.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-xl">🏪</span>
                  )}
                </span>
              </span>
              <span className="text-[10px] font-bold text-slate-600 text-center line-clamp-1 w-full">{s.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 pb-28 pt-5">

        {/* Catégories (auparavant masquées sur l'accueil) */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {CATEGORY_PILLS.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => pickCategory(c.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                activeCategory === c.id
                  ? 'bg-wa-teal text-white border-wa-teal shadow-md'
                  : 'bg-white text-slate-700 border-black/10 hover:border-wa-teal hover:text-wa-teal'
              }`}
            >
              <span>{c.emoji}</span>{c.label}
            </button>
          ))}
        </div>

        {/* Bandeau vendeur — style Shopify */}
        <section className="relative overflow-hidden rounded-3xl bg-wa-teal-dark text-white p-5 sm:p-7 shadow-xl">
          <div className="absolute inset-0 pointer-events-none" style={doodle} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-[11px] font-black uppercase tracking-widest text-wa-green">Pour les vendeurs</div>
              <h2 className={`text-xl sm:text-2xl font-black leading-tight ${artFont.className}`}>Ouvre ta boutique en ligne sur VesTyle</h2>
              <p className="text-sm text-emerald-100/85 max-w-xl">Éditeur de boutique, assistant IA, commandes et livraison suivie — avec contact WhatsApp direct pour tes clients.</p>
            </div>
            <Link href="/login" className="shrink-0 inline-flex items-center justify-center gap-2 bg-wa-green hover:brightness-110 active:scale-95 text-slate-950 font-black text-sm px-6 py-3.5 rounded-full shadow-lg transition-all">
              Vendre sur VesTyle <ArrowRightIcon size={16} />
            </Link>
          </div>
        </section>

        {/* Top deals — cartes produit façon Shopify */}
        {(dealsLoading || topDeals.length > 0) && (
          <section className="space-y-3">
            <SectionHead title="🔥 Top deals du moment">
              <button type="button" onClick={scrollToFeed} className="text-xs font-black text-wa-teal hover:text-wa-teal-dark uppercase tracking-wider">Voir tout →</button>
            </SectionHead>
            {dealsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-3 animate-pulse space-y-3">
                    <div className="aspect-square rounded-xl bg-slate-100" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-50 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {topDeals.slice(0, 6).map(deal => {
                  const disc = discountPct(deal);
                  return (
                    <Link
                      key={deal.id}
                      href={deal.stores?.slug ? `/boutique/${deal.stores.slug}` : '#'}
                      className="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                      <div className="relative aspect-square bg-slate-100 overflow-hidden flex items-center justify-center">
                        {deal.image_url ? (
                          <img src={deal.image_url} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <span className="text-4xl opacity-30">🛍️</span>
                        )}
                        {disc && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow">{disc}</span>}
                      </div>
                      <div className="p-3 space-y-1 flex-1 flex flex-col">
                        <div className="text-xs font-bold text-slate-800 line-clamp-1">{deal.name}</div>
                        {deal.stores?.name && (
                          <div className="text-[10px] font-semibold text-slate-400 truncate flex items-center gap-1">
                            <StoreIcon size={10} className="shrink-0" /><span>{deal.stores.name}</span>
                          </div>
                        )}
                        <div className="flex items-baseline gap-1.5 pt-0.5">
                          <span className="text-sm font-black text-slate-900">{fmt(deal.price)}</span>
                          {deal.original_price && deal.original_price > deal.price && (
                            <span className="text-[10px] font-bold text-slate-400 line-through">{fmt(deal.original_price)}</span>
                          )}
                        </div>
                        <span className="mt-auto block text-center text-[11px] font-extrabold text-wa-teal bg-wa-teal/10 group-hover:bg-wa-teal group-hover:text-white rounded-full py-2 transition-colors">
                          Voir la boutique
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Boutiques populaires — publications façon Facebook */}
        {(dealsLoading || popularStores.length > 0) && (
          <section className="space-y-3">
            <SectionHead title="Populaire près de vous">
              <Link href="/boutiques" className="text-xs font-bold text-wa-teal hover:text-wa-teal-dark">Toutes les boutiques →</Link>
            </SectionHead>
            {dealsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100" />
                      <div className="flex-1 space-y-2"><div className="h-3 bg-slate-100 rounded w-3/4" /><div className="h-2 bg-slate-50 rounded w-1/2" /></div>
                    </div>
                    <div className="aspect-[4/3] rounded-xl bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {popularStores.slice(0, 4).map((store, idx) => (
                  <article key={store.id} className="bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                    <div className="flex items-center justify-between p-3.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 ring-2 ring-wa-green/60 shrink-0">
                          {store.logo_url ? (
                            <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">🏪</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-extrabold text-slate-900 line-clamp-1">{store.name}</div>
                          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1"><MapPinIcon size={10} />{store.city || 'Douala'}</div>
                        </div>
                      </div>
                      {store.is_boosted && <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-wa-green text-slate-950 rounded-full shrink-0">LIVE</span>}
                    </div>

                    <Link href={`/boutique/${store.slug}`} className="block">
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                        {store.logo_url ? (
                          <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><StoreIcon size={40} className="text-slate-300" /></div>
                        )}
                        <div className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-sm flex items-center gap-1 ${idx % 2 === 0 ? 'bg-red-500' : 'bg-amber-500'}`}>
                          <span>{idx % 2 === 0 ? '🔥' : '⭐'}</span><span>{idx % 2 === 0 ? 'Flash' : 'Top'}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-white text-[11px] font-black uppercase tracking-wider">Visiter →</span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center justify-between p-3.5 border-t border-slate-100">
                      <span className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold" title="Vues de la boutique">
                        <HeartIcon size={14} className="text-rose-500" /> {store.daily_views || 0} vues
                      </span>
                      {store.phone_whatsapp ? (
                        <a
                          href={`https://wa.me/${store.phone_whatsapp}?text=Bonjour%20!%20J'ai%20vu%20votre%20boutique%20sur%20VesTyle.`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 bg-wa-green hover:brightness-110 active:scale-95 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-full transition-all shadow-sm"
                        >
                          <span>🟢</span><span>Discuter</span>
                        </a>
                      ) : (
                        <Link href={`/boutique/${store.slug}`} className="flex items-center gap-1.5 bg-[#1877F2] hover:brightness-110 active:scale-95 text-white font-extrabold text-xs px-4 py-2 rounded-full transition-all shadow-sm">
                          <span>→</span><span>Voir</span>
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Offres & prix réduits */}
        {flashSales.length > 0 && (
          <section className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-wa-teal-dark text-white shadow-xl">
            <div className="absolute inset-0 pointer-events-none" style={doodle} />
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className={`text-xl font-black flex items-center gap-2 ${artFont.className}`}><span className="text-2xl">🔥</span> Offres &amp; Prix Réduits</h2>
                  <p className="text-emerald-100/70 text-xs mt-0.5">Sélection de produits en promotion directe enregistrés par nos marchands vérifiés.</p>
                </div>
                <div className="bg-black/20 border border-white/15 px-3.5 py-1.5 rounded-full flex items-center gap-2 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-wa-green animate-ping" />
                  <span className="text-[11px] text-emerald-100 font-bold uppercase tracking-wider">🏷️ Remises Actives</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {flashSales.map(product => {
                  const disc = discountPct(product);
                  return (
                    <Link href={`/produit/${product.id}`} key={product.id} className="flex gap-3 items-center bg-white/10 hover:bg-white/15 border border-white/10 hover:border-wa-green/60 rounded-2xl p-3.5 transition-all group">
                      <div className="w-20 h-20 rounded-xl bg-black/20 overflow-hidden relative shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                        {disc && <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg">{disc}</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm line-clamp-1 group-hover:text-wa-green transition-colors">{product.name}</h3>
                        <p className="text-[11px] text-emerald-100/70 line-clamp-1 mt-0.5">{product.stores?.name} • {product.stores?.city}</p>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-base font-black text-wa-green font-mono">{fmt(product.price)}</span>
                          {product.original_price > product.price && <span className="text-[11px] text-emerald-100/50 line-through font-mono">{fmt(product.original_price)}</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Catalogue complet & fil interactif */}
        <section id="discovery-feed-section" className="pt-2">
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

        {/* Pied de page */}
        <footer className="mt-12 pt-10 pb-4 border-t border-black/10">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <img src="/icon-512.png" className="w-10 h-10 rounded-xl shadow-sm object-cover" alt="VesTyle Logo" />
              <h2 className={`text-3xl sm:text-4xl font-black tracking-tight text-slate-900 ${artFont.className}`}>
                Ves<span className="text-wa-teal">Tyle</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">Marketplace social local — Douala &amp; Yaoundé</p>
            <div className="flex flex-wrap justify-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <Link href="/login" className="hover:text-wa-teal transition-colors">Vendre sur VesTyle</Link>
              <Link href="/boutiques" className="hover:text-wa-teal transition-colors">Boutiques</Link>
              <Link href="/mes-commandes" className="hover:text-wa-teal transition-colors">Mes Commandes</Link>
              <Link href="#" className="hover:text-wa-teal transition-colors">Aide</Link>
            </div>
            <div className="w-full max-w-xs mx-auto h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Cameroun Excellence • {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>

      {/* Bouton flottant WhatsApp : recherche par photo */}
      <button
        type="button"
        onClick={() => setVisualSearchOpen(true)}
        title="Recherche par image"
        aria-label="Recherche par image"
        className="fixed right-4 bottom-5 z-40 w-14 h-14 rounded-full bg-wa-green text-white shadow-[0_10px_30px_rgba(37,211,102,0.55)] flex items-center justify-center active:scale-90 hover:brightness-110 transition-all"
      >
        <CameraIcon size={24} />
      </button>

      {/* Modal recherche visuelle (IA) */}
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
