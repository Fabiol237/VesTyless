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
    meta.content = '#1e3a8a';
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

      {/* ── HALOS LUMINEUX AMBIANTS ORANGE & BLEU (hors bannière) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[40%] -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-400/25 via-orange-300/15 to-transparent blur-[130px]" />
        <div className="absolute top-[55%] -left-32 w-[500px] h-[500px] rounded-full bg-blue-500/15 blur-[140px]" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO BANNER PLEIN BORD AVEC FOND DE DIAPORAMA ANIME (3 IMAGES)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden w-full text-white"
        style={{
          background: 'linear-gradient(130deg, #1a3fc4 0%, #1e52d6 45%, #2d3fd6 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)',
          paddingBottom: '36px',
          paddingLeft: '20px',
          paddingRight: '20px',
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px',
        }}>

        {/* ── IMAGES EN FOND D'ÉCRAN ACCUEIL (COUVERTURE DE BANNIÈRE PLEINE VISIBILITÉ) ── */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.img
              key={HERO_VISUAL_SLIDES[currentSlide].image}
              src={HERO_VISUAL_SLIDES[currentSlide].image}
              alt="VeStyle Hero Background"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 0.65, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
              className="w-full h-full object-cover object-center"
            />
          </AnimatePresence>

          {/* Vignettage dégradé gauche pour garantir la lisibilité du texte tout en laissant l'image briller */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-blue-950/65 to-blue-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a3fc4] via-transparent to-slate-950/50" />
        </div>

        {/* ☀️ SUNBURST SOLAIRE HAUT-DROITE — pure CSS, zéro JS */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle at center, rgba(255,210,60,0.85) 0%, rgba(255,140,20,0.55) 35%, rgba(220,80,10,0.25) 60%, transparent 80%)', filter: 'blur(32px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '0px', right: '30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, rgba(255,255,220,0.95) 0%, rgba(255,220,80,0.6) 40%, transparent 70%)', filter: 'blur(18px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20px', right: '70px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,240,120,0.8) 50%, transparent 80%)', filter: 'blur(8px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', background: 'radial-gradient(ellipse at 85% 8%, rgba(253,224,71,0.45) 0%, rgba(249,115,22,0.20) 28%, transparent 65%)', pointerEvents: 'none' }} />
        {/* Étoiles décoratives */}
        <div style={{ position: 'absolute', top: '28px', right: '14px', pointerEvents: 'none', display: 'flex', gap: '4px', opacity: 0.95 }}>
          <span style={{ color: 'rgba(255,240,160,1)', fontSize: '11px' }}>✦</span>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '9px' }}>✨</span>
          <span style={{ color: 'rgba(255,220,100,1)', fontSize: '14px', fontWeight: 900 }}>✦</span>
          <span style={{ color: 'rgba(255,200,80,0.9)', fontSize: '9px' }}>✨</span>
        </div>
        <div style={{ position: 'absolute', top: '52px', right: '90px', pointerEvents: 'none', color: 'rgba(255,230,120,0.85)', fontSize: '9px' }}>✨</div>
        <div style={{ position: 'absolute', top: '72px', right: '50px', pointerEvents: 'none', color: 'rgba(255,220,100,0.75)', fontSize: '11px' }}>✦</div>

        {/* ── CONTENU HERO — PRÉSENCE FORTE & SHOWCASE VISUEL ── */}
        <div style={{ position: 'relative', zIndex: 10 }} className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* COLONNE GAUCHE (Texte & Recherche) */}
          <div className="lg:col-span-7 space-y-5 text-left">

            {/* Badge Prestige + Avatars Utilisateurs */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-300/40 bg-amber-400/10 text-amber-200 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse inline-block" />
                ✨ #1 Marketplace de Proximité au Cameroun
              </div>

              {/* Stack Avatars Homme, Femme, Robot */}
              <div className="flex items-center -space-x-2">
                <img src="/images/hero_woman.png" alt="Utilisatrice VeStyle" className="w-7 h-7 rounded-full border-2 border-white/80 object-cover shadow-sm" />
                <img src="/images/hero_man.png" alt="Acheteur VeStyle" className="w-7 h-7 rounded-full border-2 border-white/80 object-cover shadow-sm" />
                <img src="/images/hero_robot.png" alt="Logistique IA" className="w-7 h-7 rounded-full border-2 border-blue-600 object-cover shadow-sm" />
                <span className="pl-3 text-[10px] font-bold text-amber-300">Recherche visuelle & IA Live</span>
              </div>
            </div>

            {/* Titre MASSIF — dégradé blanc → ambre → orange, pure CSS */}
            <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] ${artFontClass}`}>
              <span className="text-white">Vise l&apos;objet,</span><br />
              <span style={{ background: 'linear-gradient(90deg, #ffffff 0%, #fcd34d 55%, #fb923c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                trouve la boutique
              </span>
            </h1>

            {/* Sous-titre */}
            <p className="text-blue-100/85 text-sm sm:text-base font-medium max-w-lg leading-relaxed">
              Les meilleures boutiques locales à <strong className="text-white font-extrabold">Douala</strong> & <strong className="text-white font-extrabold">Yaoundé</strong> — Recherche photo, deals exclusifs, logistique intelligente.
            </p>

            {/* BARRE DE RECHERCHE avec halo ambre — pure CSS */}
            <div className="max-w-lg">
              <div className="relative">
                <div style={{ position: 'absolute', inset: '-3px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(251,191,36,0.35) 0%, rgba(59,130,246,0.25) 100%)', filter: 'blur(6px)', pointerEvents: 'none' }} />
                <div className="relative flex items-center bg-white rounded-2xl p-1.5 pl-4 shadow-2xl border border-white/90 gap-2 focus-within:ring-2 focus-within:ring-amber-300/60 transition-all">
                  <button type="button" onClick={() => setVisualSearchOpen(true)} className="text-slate-400 hover:text-blue-600 transition-colors p-0.5 shrink-0" title="Recherche par image">
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
                    className="text-slate-400 hover:text-blue-600 p-1 shrink-0"
                  />
                  <button type="button" onClick={scrollToFeed} className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/40 shrink-0">
                    Chercher
                  </button>
                </div>
              </div>
            </div>

            {/* Pills de confiance — 100% statiques */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { icon: '📸', label: 'Recherche Image IA' },
                { icon: '🏪', label: '150+ Boutiques' },
                { icon: '🤖', label: 'Logistique Robotisée' },
                { icon: '📍', label: 'Douala & Yaoundé' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-bold">
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            {/* ── BARRE D'ACTIONS RAPIDES INTÉGRÉE dans le Hero ── */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/15 mt-2">
              {/* GPS */}
              <button
                type="button"
                onClick={() => { triggerFeedback?.('radar'); requestLocation(); scrollToFeed(); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all border ${userLocation
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                    : 'bg-white/15 hover:bg-white/25 text-white border-white/25'
                  }`}
              >
                <MapPinIcon size={13} className={isGpsLocating ? 'animate-bounce' : ''} />
                <span>{isGpsLocating ? 'Localisation...' : userLocation ? '📍 Localisé' : 'Autour de moi'}</span>
              </button>

              {/* Code Boutique */}
              <form onSubmit={handleCodeSearch} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/20 border border-white/25 rounded-xl px-3 py-2 transition-all">
                <HashIcon size={12} className="text-amber-300 shrink-0" />
                <input
                  type="text"
                  maxLength={5}
                  value={codeQuery}
                  onChange={e => { setCodeQuery(e.target.value.replace(/\D/g, '')); setCodeError(''); }}
                  placeholder="Code Boutique"
                  className="w-20 bg-transparent outline-none text-xs font-mono font-bold text-white uppercase tracking-widest placeholder:text-white/40"
                />
                <button
                  type="submit"
                  disabled={codeQuery.length !== 5 || codeLoading}
                  className="p-1 bg-amber-400/80 text-slate-900 rounded-lg disabled:opacity-40 hover:bg-amber-300 transition-all shrink-0"
                >
                  {codeLoading ? <LoaderIcon size={12} /> : <ArrowRightIcon size={11} />}
                </button>
              </form>

              {codeError && (
                <span className="text-xs font-bold text-red-300 bg-red-500/20 px-2.5 py-1 rounded-lg border border-red-400/30">
                  ⚠️ {codeError}
                </span>
              )}
            </div>

          </div>

          {/* COLONNE DROITE (CARROUSEL INTERACTIF ANIME — VISIBLE EGALEMENT SUR MOBILE) */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center mt-6 lg:mt-0 min-h-[320px] sm:min-h-[380px] lg:min-h-[420px]">

            {/* Halo lumineux central */}
            <div className="absolute w-72 sm:w-80 h-72 sm:h-80 rounded-full bg-gradient-to-tr from-amber-400/25 via-blue-500/20 to-indigo-600/25 blur-3xl pointer-events-none" />

            {/* CARROUSEL MAIN CONTAINER (Responsive Mobile & Desktop) */}
            <div className="relative w-full max-w-[310px] sm:max-w-[340px] bg-slate-950/60 backdrop-blur-2xl border border-white/20 rounded-3xl p-3.5 sm:p-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden">

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.96 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-3"
                >
                  {/* IMAGE SLIDE (Hauteur responsive h-48 mobile / h-64 desktop) */}
                  <div className="relative h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden border border-white/10 group">
                    <img
                      src={HERO_VISUAL_SLIDES[currentSlide].image}
                      alt={HERO_VISUAL_SLIDES[currentSlide].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                    {/* Badge top left */}
                    <span className={`absolute top-3 left-3 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg ${HERO_VISUAL_SLIDES[currentSlide].badgeBg}`}>
                      {HERO_VISUAL_SLIDES[currentSlide].badge}
                    </span>

                    {/* Stat top right */}
                    <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-amber-300 border border-white/15 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                      {HERO_VISUAL_SLIDES[currentSlide].stat}
                    </span>

                    {/* Overlay info bottom */}
                    <div className="absolute bottom-3 left-3 right-3 text-left">
                      <h3 className="text-white font-black text-lg leading-tight">
                        {HERO_VISUAL_SLIDES[currentSlide].title}
                      </h3>
                      <p className="text-blue-100/80 text-xs font-medium line-clamp-2 mt-0.5">
                        {HERO_VISUAL_SLIDES[currentSlide].desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* CARROUSEL CONTROLS (Pills + Flèches Prev/Next) */}
              <div className="flex items-center justify-between pt-2 px-1 border-t border-white/10">

                {/* Dots / Indicators */}
                <div className="flex items-center gap-1.5">
                  {HERO_VISUAL_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx
                          ? 'w-7 bg-amber-400'
                          : 'w-2 bg-white/30 hover:bg-white/50'
                        }`}
                      title={slide.title}
                    />
                  ))}
                </div>

                {/* Boutons Flèches Prev & Next */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_VISUAL_SLIDES.length) % HERO_VISUAL_SLIDES.length)}
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 border border-white/15 flex items-center justify-center text-white text-xs font-black transition-all"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_VISUAL_SLIDES.length)}
                    className="w-8 h-8 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-90 text-slate-950 text-xs font-black transition-all shadow-md"
                  >
                    ›
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>



      {/* ── CONTENU PRINCIPAL — directement après le hero ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 pb-24 pt-6">



        {/* ═══════════════════════════════════════════════════════════════════
            5. 🔥 TOP DEALS DU MOMENT (CARTES AIR-FLOATING)
        ════════════════════════════════════════════════════════════════════ */}
        {(dealsLoading || topDeals.length > 0) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className={`text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 ${artFontClass}`}>
                <span className="text-orange-500">🔥</span> Top deals du moment
              </h2>
              <button onClick={scrollToFeed} className="text-xs font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider">
                Voir tout →
              </button>
            </div>

            {dealsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-3xl p-4 border border-slate-100 animate-pulse space-y-3">
                    <div className="aspect-[4/3] rounded-2xl bg-slate-100" />
                    <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
                    <div className="h-3 bg-slate-50 rounded-lg w-1/2" />
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
                      className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-100/90 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.12)] hover:-translate-y-1.5 transition-all duration-300 relative flex flex-col group overflow-hidden"
                    >
                      {disc && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-md z-10">
                          {disc}
                        </div>
                      )}

                      <div className="w-full aspect-[4/3] sm:aspect-square rounded-2xl bg-slate-50 overflow-hidden mb-3.5 flex items-center justify-center relative">
                        {deal.image_url ? (
                          <img src={deal.image_url} alt={deal.name} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" />
                        ) : (
                          <span className="text-4xl opacity-30">🛍️</span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <div className="space-y-1 mt-auto">
                        <div className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{deal.name}</div>
                        {deal.stores?.name && (
                          <div className="text-[10px] font-semibold text-slate-400 truncate flex items-center gap-1">
                            <StoreIcon size={10} className="text-slate-400 shrink-0" />
                            <span>{deal.stores.name}</span>
                          </div>
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
              <h2 className={`text-lg font-black text-slate-900 tracking-tight ${artFontClass}`}>
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
                      <div className="w-10 h-10 rounded-xl bg-slate-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-3/4" />
                        <div className="h-2 bg-slate-50 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="aspect-[4/3] rounded-xl bg-slate-100" />
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
                            <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">🏪</div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900 line-clamp-1">{store.name}</div>
                          <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                            <MapPinIcon size={10} />
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
                          <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <StoreIcon size={40} className="text-slate-300" />
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
                          <HeartIcon size={13} className="text-rose-500" /> {store.daily_views || 0} vues
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
            7. 🔥 OFFRES & PRIX RÉDUITS (Produits réels en promotion)
        ════════════════════════════════════════════════════════════════════ */}
        {flashSales.length > 0 && (
          <section className="relative overflow-hidden rounded-[24px] p-5 sm:p-6 border border-orange-500/20 bg-slate-900 text-white shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.12),transparent_60%)] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className={`text-xl font-black text-white flex items-center gap-2 ${artFontClass}`}>
                    <span className="text-orange-500 text-2xl">🔥</span>
                    Offres & Prix Réduits
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">Sélection de produits en promotion directe enregistrés par nos marchands vérifiés.</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] text-orange-300 font-bold uppercase tracking-wider">🏷️ Remises Actives</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {flashSales.map(product => {
                  const disc = discountPct(product);
                  return (
                    <Link href={`/produit/${product.id}`} key={product.id} className="flex gap-3 items-center bg-white/5 border border-white/10 hover:border-orange-500/40 rounded-2xl p-4 transition-all group">
                      <div className="w-20 h-20 rounded-xl bg-slate-950/60 overflow-hidden relative shrink-0 border border-white/5">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-2xl">📦</div>
                        )}
                        {disc && (
                          <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg shadow-sm">
                            {disc}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-orange-400 transition-colors">{product.name}</h3>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{product.stores?.name} • {product.stores?.city}</p>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-base font-black text-orange-400 font-mono">{fmt(product.price)}</span>
                          {product.original_price > product.price && (
                            <span className="text-[11px] text-slate-500 line-through font-mono">{fmt(product.original_price)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
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
            hideSearchBar={true}
            externalCategory={activeCategory}
            onExternalCategoryChange={setActiveCategory}
          />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            9. FOOTER PREMIUM
        ════════════════════════════════════════════════════════════════════ */}
        <footer className="mt-16 pt-10 pb-4 border-t border-slate-200/60">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <img src="/vestyle-logo.png" className="w-10 h-10 rounded-xl shadow-sm object-cover" alt="VesTyle Logo" />
              <h2 className={`text-3xl sm:text-4xl font-black tracking-tight text-slate-900 ${artFontClass}`}>
                Ves<span className="text-orange-600">Tyle</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-medium">Marketplace social local — Douala & Yaoundé</p>
            <div className="flex flex-wrap justify-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <Link href="/login" className="hover:text-blue-600 transition-colors">Vendre sur VesTyle</Link>
              <Link href="/boutiques" className="hover:text-blue-600 transition-colors">Boutiques</Link>
              <Link href="/mes-commandes" className="hover:text-blue-600 transition-colors">Mes Commandes</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Aide</Link>
            </div>
            <div className="w-full max-w-xs mx-auto h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
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
