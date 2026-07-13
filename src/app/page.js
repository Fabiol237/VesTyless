'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import ClientDiscovery from '@/components/ClientDiscovery';
import VisualSearchModal from '@/components/VisualSearchModal';
import Link from 'next/link';
import { motion, useReducedMotion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useDistance } from '@/hooks/useDistance';
import { useOfflineData } from '@/hooks/useOfflineData';
import { Outfit } from 'next/font/google';

const artFont = Outfit({ subsets: ['latin'], weight: ['900'] });

// ── Inline SVG Icons ──────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
const HashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/>
    <line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>
  </svg>
);
const LoaderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

// ── Icons for How it works ────────────────────────────────────────────────────
const DiscoverIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  </svg>
);
const OrderIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const RelaxIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

// ── Animated Particle Background ─────────────────────────────────────────────
function ParticleBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: 0.15 + Math.random() * 0.35,
      color: Math.random() > 0.6 ? '#25D366' : Math.random() > 0.5 ? '#128C7E' : '#ffffff',
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      // Draw connections
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(18,140,126,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ── Stats flottants ───────────────────────────────────────────────────────────
const STATS = [
  { value: '10K+', label: 'Produits' },
  { value: '500+', label: 'Boutiques' },
  { value: '24/7', label: 'Disponible' },
];

// ── Badges animés ─────────────────────────────────────────────────────────────
const BADGES = ['Mode', 'High-Tech', 'Alimentaire', 'Beauté', 'Maison', 'Loisirs'];

// ── Animated Product Showcase ────────────────────────────────────────────────
const ANIMATED_PRODUCTS = [
  { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', name: 'Sneakers Pro X', price: '45,000 FCFA' },
  { img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', name: 'Casque Audio BT', price: '25,000 FCFA' },
  { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', name: 'Montre Connectée', price: '30,000 FCFA' },
  { img: 'https://images.unsplash.com/photo-1528701800487-ba01fea498c0?auto=format&fit=crop&w=600&q=80', name: 'Parfum Élégance', price: '15,000 FCFA' },
];

const AnimatedProductShowcase = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % ANIMATED_PRODUCTS.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#25D366]/20 to-transparent rounded-[3rem] blur-3xl opacity-40" />
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="relative z-10 bg-white border border-[#25D366]/20 rounded-[2rem] p-4 shadow-2xl w-64 sm:w-80"
        >
          <img 
            src={ANIMATED_PRODUCTS[index].img} 
            alt={ANIMATED_PRODUCTS[index].name}
            className="w-full h-64 sm:h-80 object-cover rounded-xl shadow-inner"
          />
          <div className="mt-4 flex flex-col items-center text-center">
            <span className="text-gray-900 font-black text-xl">{ANIMATED_PRODUCTS[index].name}</span>
            <span className="text-[#25D366] font-mono font-bold mt-1 bg-[#25D366]/10 px-3 py-1 rounded-full text-sm">{ANIMATED_PRODUCTS[index].price}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [codeQuery, setCodeQuery] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const router = useRouter();
  const { requestLocation, userLocation, isLocating: isGpsLocating } = useDistance();
  const [suggestions, setSuggestions] = useState([]);
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);
  const [visualResults, setVisualResults] = useState(null);
  const [stats, setStats] = useState([
    { value: '10K+', label: 'Produits' },
    { value: '500+', label: 'Boutiques' },
    { value: '24/7', label: 'Disponible' },
  ]);
  const [flashSales, setFlashSales] = useState([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  // ── WOW EFFECT: 3D Mouse Tracking ──
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };
  const rotateX = useSpring(useTransform(mouseY, [-500, 500], [15, -15]), { damping: 30, stiffness: 100 });
  const rotateY = useSpring(useTransform(mouseX, [-500, 500], [-15, 15]), { damping: 30, stiffness: 100 });

  const { data: offlineSuggestions } = useOfflineData('home_suggestions', async () => {
    const [cats, strs, prods] = await Promise.all([
      supabase.from('global_categories').select('name').limit(8),
      supabase.from('stores').select('name, city').order('is_boosted', { ascending: false }).limit(8),
      supabase.from('products').select('name').eq('is_active', true).order('daily_views', { ascending: false }).limit(10)
    ]);
    const items = [];
    if (cats.data) cats.data.forEach(c => items.push({ label: c.name, value: c.name, type: 'Catégorie', emoji: '🏷️' }));
    if (strs.data) strs.data.forEach(s => items.push({ label: s.name, value: s.name, type: 'Boutique', emoji: '🏪', sublabel: s.city }));
    if (prods.data) prods.data.forEach(p => items.push({ label: p.name, value: p.name, type: 'Produit', emoji: '🛍️' }));
    return { data: items };
  });

  useEffect(() => { if (offlineSuggestions) setSuggestions(offlineSuggestions); }, [offlineSuggestions]);
  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Stats
      const [{ count: productsCount }, { count: storesCount }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('stores').select('*', { count: 'exact', head: true })
      ]);
      if (productsCount !== null && storesCount !== null) {
        setStats([
          { value: productsCount > 1000 ? (productsCount/1000).toFixed(1) + 'K+' : productsCount.toString(), label: 'Produits' },
          { value: storesCount.toString(), label: 'Boutiques' },
          { value: '24/7', label: 'Disponible' },
        ]);
      }
      
      // 2. Fetch Flash Sales
      const { data: sales } = await supabase
        .from('products')
        .select('*, store:store_id(name, city)')
        .not('flash_sale_end', 'is', null)
        .limit(3);
      
      if (sales && sales.length > 0) {
        setFlashSales(sales);
      }
    }
    fetchData();
    setMounted(true);
  }, []);

  // Update Countdown Timer
  useEffect(() => {
    if (flashSales.length === 0) return;
    const interval = setInterval(() => {
      const end = new Date(flashSales[0].flash_sale_end).getTime();
      const now = new Date().getTime();
      const distance = end - now;
      if (distance < 0) {
        setTimeLeft('Terminé');
        clearInterval(interval);
        return;
      }
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [flashSales]);

  const handleCodeSearch = async (e) => {
    e.preventDefault();
    const code = codeQuery.trim();
    if (code.length !== 5) return;
    setCodeLoading(true);
    const { data } = await supabase.from('stores').select('slug').eq('store_code', code).single();
    if (data) { router.push(`/boutique/${data.slug}`); setShowCodeModal(false); }
    else setCodeError('Code inconnu. Vérifiez avec votre vendeur.');
    setCodeLoading(false);
  };

  const scrollToFeed = () => {
    document.getElementById('discovery-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Avoid rendering dynamic animations or components that require client-side APIs before mount if needed, but render the shell immediately.

  return (
    <div className="relative min-h-screen w-full font-sans" style={{ background: '#0a1628' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
        className="relative min-h-[100svh] flex flex-col justify-center items-center overflow-hidden bg-[#0a1628]"
        style={{ perspective: 1200 }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-100" 
          style={{ backgroundImage: 'url("/hero_image.png")' }} 
        />
        {/* Lighter overlay to let the impressive image shine */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/40 via-[#0a1628]/10 to-[#0a1628]" />

        {/* Particle canvas */}
        <div className="absolute inset-0">
          <ParticleBackground />
        </div>

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #25D366, transparent)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #128C7E, transparent)' }} />

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center flex flex-col items-center gap-8 pt-24 pb-20">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black uppercase tracking-widest"
            style={{ borderColor: 'rgba(37,211,102,0.3)', background: 'rgba(37,211,102,0.08)', color: '#25D366' }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Marketplace N°1 du Cameroun
          </motion.div>

          {/* Title with 3D Tilt Wow Effect */}
          <motion.div
            style={reduceMotion ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="will-change-transform flex flex-col items-center mt-[-40px]"
          >
            <motion.h1 
              style={reduceMotion ? {} : { transform: 'translateZ(60px)' }} 
              className={`text-[80px] sm:text-[130px] tracking-tighter leading-none font-black ${artFont.className}`}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-[#e6fff0] to-[#25D366] drop-shadow-[0_0_30px_rgba(37,211,102,0.6)]">
                Ves
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-bl from-white via-[#e0f7f4] to-[#128C7E] drop-shadow-[0_0_30px_rgba(18,140,126,0.6)]">
                Tyle
              </span>
            </motion.h1>
            <p className="mt-6 text-[10px] sm:text-xs font-mono uppercase tracking-[0.4em] text-[#25D366] flex items-center gap-4">
              <span className="w-8 sm:w-16 h-[2px] bg-gradient-to-r from-transparent to-[#25D366]/50"></span>
              Plateforme E-Commerce Algorithmique
              <span className="w-8 sm:w-16 h-[2px] bg-gradient-to-l from-transparent to-[#25D366]/50"></span>
            </p>
          </motion.div>



          {/* ── HIGH-TECH INTERFACE (LAB STYLE) ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-4xl mt-6 flex flex-col gap-4 relative z-20"
          >
            {/* Module 1: The AI Search Bar */}
            <div className="relative group w-full max-w-3xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#25D366] via-transparent to-[#128C7E] rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex flex-col sm:flex-row items-center bg-black/60 backdrop-blur-xl border border-white/20 rounded-[2rem] sm:rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="flex-1 w-full flex items-center relative">
                  <span className="absolute left-6 pointer-events-none" style={{ color: '#25D366' }}>
                    <SearchIcon />
                  </span>
                  <SearchAutocomplete
                    value={searchQuery}
                    onChange={setSearchQuery}
                    suggestions={suggestions}
                    placeholder="Rechercher par mot-clé, produit, ou catégorie..."
                    className="w-full"
                    inputClassName="w-full outline-none bg-transparent font-mono py-5 pl-14 pr-6 text-sm sm:text-base text-white placeholder:text-white/50"
                  >
                  </SearchAutocomplete>
                </div>
                <button
                  type="button"
                  onClick={scrollToFeed}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-5 text-sm font-black uppercase tracking-[0.2em] text-[#0a1628] bg-[#25D366] transition-all hover:bg-[#1ebd5a]"
                >
                  Analyser <ArrowRightIcon />
                </button>
              </div>
            </div>

            {/* Unique Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2">
              
              {/* Unique Button: Visual Search (Round, Glowing) */}
              <button
                type="button"
                onClick={() => setVisualSearchOpen(true)}
                className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white font-black transition-all shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-105 hover:shadow-[0_0_30px_rgba(37,211,102,0.6)]"
              >
                <CameraIcon />
                <span className="uppercase tracking-widest text-xs font-mono">Scan Photo</span>
              </button>

              {/* Unique Button: GPS Radar (Pill, High-Tech Outline) */}
              <button
                type="button"
                onClick={requestLocation}
                className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-white/10 border-2 border-white/30 text-white font-bold transition-all hover:bg-white/20 hover:border-white hover:scale-105 backdrop-blur-md"
              >
                {isGpsLocating ? <LoaderIcon /> : <MapPinIcon />}
                <span className="uppercase tracking-widest text-xs font-mono">{isGpsLocating ? "Recherche..." : "Autour de moi"}</span>
              </button>

              {/* Unique Input: Code Vendeur (Glassmorphism minimalist) */}
              <form onSubmit={handleCodeSearch} className="flex items-center rounded-full bg-black/50 border border-[#25D366]/40 focus-within:border-[#25D366] transition-all backdrop-blur-xl p-1 pr-2 shadow-inner">
                <div className="pl-4 pr-2 text-[#25D366]/80">
                  <HashIcon />
                </div>
                <input
                  type="text"
                  maxLength={5}
                  value={codeQuery}
                  onChange={e => { setCodeQuery(e.target.value.replace(/\D/g, '')); setCodeError(''); }}
                  placeholder="CODE BOUTIQUE"
                  className="w-32 sm:w-40 bg-transparent border-none outline-none text-xs sm:text-sm font-mono font-bold text-white placeholder:text-white/40 tracking-[0.1em] py-2.5"
                />
                <button
                  type="submit"
                  disabled={codeQuery.length !== 5 || codeLoading}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] disabled:opacity-30 disabled:scale-95 hover:bg-[#25D366] hover:text-[#0a1628] transition-all"
                >
                  {codeLoading ? <LoaderIcon /> : <ArrowRightIcon />}
                </button>
              </form>
            </div>
            
            <AnimatePresence>
              {codeError && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[#ff6b6b] text-xs font-mono text-center">
                  [ERREUR] : {codeError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Lab Telemetry Stats */}
            <div className="flex items-center justify-center gap-8 sm:gap-16 mt-2">
              {stats.map((s, i) => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <span className="text-xl sm:text-3xl font-mono font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {s.value}
                  </span>
                  <span className="text-[9px] sm:text-[11px] font-mono uppercase tracking-[0.25em]" style={{ color: '#25D366' }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.button
          onClick={scrollToFeed}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 transition-all hover:opacity-80"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          animate={reduceMotion ? {} : { y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">Découvrir</span>
          <ChevronDownIcon />
        </motion.button>
      </section>

      {/* ── COMMENT ÇA MARCHE ─────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-4 relative bg-[#0a1628] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className={`text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight ${artFont.className}`}>
              Comment ça <span style={{ color: '#25D366' }}>marche ?</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Une expérience fluide, pensée pour vous simplifier la vie.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center relative">
            
            {/* Ligne connectrice verticale animée */}
            <div className="hidden lg:block absolute left-[45px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-[#25D366] to-transparent opacity-30 z-0" />

            <div className="flex flex-col gap-10 sm:gap-12 relative z-10">
              {[
                {
                  step: "01",
                  title: "Explorez",
                  desc: "Recherche intelligente par photo, texte ou géolocalisation pour trouver la perle rare autour de vous."
                },
                {
                  step: "02",
                  title: "Commandez",
                  desc: "Paiement sécurisé et échange direct avec nos marchands locaux certifiés."
                },
                {
                  step: "03",
                  title: "Recevez",
                  desc: "Livraison ultra-rapide par nos coursiers tout-terrain ou retrait express en boutique."
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-6 sm:gap-8 group">
                  <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-[#0d2137] rounded-[2rem] border border-white/5 flex items-center justify-center shadow-[0_0_30px_rgba(37,211,102,0.1)] group-hover:scale-105 group-hover:border-[#25D366]/50 transition-all duration-300 relative z-10">
                    <span className="text-4xl font-black" style={{ color: '#25D366' }}>
                      {item.step}
                    </span>
                  </div>
                  <div className="pt-2 sm:pt-4">
                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 group-hover:text-[#25D366] transition-colors">{item.title}</h3>
                    <p className="text-base sm:text-lg leading-relaxed max-w-md" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center lg:justify-end mt-12 lg:mt-0">
              <AnimatedProductShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEED SECTION ──────────────────────────────────────────────────── */}
      <div
        id="discovery-section"
        className="relative min-h-screen pt-8 pb-24 px-4 scroll-mt-20"
        style={{ background: '#F8F9FA' }}
      >
        <div className="max-w-6xl mx-auto">
          <ClientDiscovery
            externalSearchQuery={searchQuery}
            onExternalSearchChange={setSearchQuery}
            overrideProducts={visualResults}
            onClearVisualSearch={() => setVisualResults(null)}
          />
        </div>
      </div>

      {/* ── SECTION PROMO ÉCLAIR (FOMO) ─────────────────────────────────────────────────────────── */}
      {flashSales.length > 0 && (
        <section className="w-full bg-gradient-to-r from-red-600 to-orange-500 py-12 px-4 relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-2">
                  <span className="text-4xl">⚡</span> VENTES FLASH
                </h2>
                <p className="text-red-100 mt-1 font-medium">Les prix remontent bientôt, dépêchez-vous !</p>
              </div>
              <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30">
                <span className="text-sm text-red-100 uppercase tracking-widest font-bold mr-3">Fin dans</span>
                <span className="text-2xl font-mono font-black text-white">{timeLeft || 'Calcul...'}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {flashSales.map(product => (
                <div key={product.id} className="bg-white rounded-3xl p-4 shadow-xl flex gap-4 items-center transform transition-transform hover:-translate-y-1">
                  <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden relative flex-shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">📷</div>
                    )}
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-xl">
                      -15%
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{product.store?.name} • {product.store?.city}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-black text-red-600">{product.price} FCFA</span>
                      {product.original_price && (
                        <span className="text-xs text-gray-400 line-through">{product.original_price} FCFA</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#070f1c', color: 'rgba(255,255,255,0.5)' }} className="py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
          <h2 className={`text-5xl sm:text-[70px] tracking-tight text-white ${artFont.className}`}>
            Ves<span style={{ color: '#25D366' }}>Tyle</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-widest">
            <Link href="/login" className="hover:text-white transition-colors">Vendre sur Vestyle</Link>
            <Link href="/suivi" className="hover:text-white transition-colors">Suivre une commande</Link>
            <Link href="/boutiques" className="hover:text-white transition-colors">Boutiques</Link>
            <Link href="#" className="hover:text-white transition-colors">Aide</Link>
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Cameroun Excellence • {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* ── CODE MODAL (REMOVED: Form is now directly inline in the hero) ── */}


      {/* ── VISUAL SEARCH MODAL ─────────────────────────────────────────────── */}
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
