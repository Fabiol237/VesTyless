'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import ClientDiscovery from '@/components/ClientDiscovery';
import VisualSearchModal from '@/components/VisualSearchModal';
import Link from 'next/link';
import InteractiveFluidBg from '@/components/InteractiveFluidBg';
import LiveShowcase from '@/components/LiveShowcase';
import { motion, useReducedMotion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useDistance } from '@/hooks/useDistance';
import { useOfflineData } from '@/hooks/useOfflineData';
import { Outfit } from 'next/font/google';
import { triggerFeedback } from '@/lib/haptic';

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

    const isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 0;
    if (isMobile) return; // Désactiver complètement sur mobile pour économiser la RAM et le CPU

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
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
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

  // ── HERO BANNER BACKGROUND SLIDER ──
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const heroSlides = [
    '/hero_slide_1.png',
    '/hero_slide_2.png',
    '/hero_slide_3.png'
  ];
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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

    // ── SON SIGNATURE VESTYLE AU CHARGEMENT ──
    import('@/lib/haptic').then(({ sayVestyle }) => {
      // Tenter une première fois directement
      sayVestyle();
      
      // Déclencheur de secours au tout premier tap si l'audio était bloqué
      const playOnFirstInteraction = () => {
        sayVestyle();
        document.removeEventListener('click', playOnFirstInteraction);
        document.removeEventListener('touchstart', playOnFirstInteraction);
      };
      document.addEventListener('click', playOnFirstInteraction);
      document.addEventListener('touchstart', playOnFirstInteraction);
    });
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
        {/* Background Image Slider */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHeroSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 bg-center bg-cover bg-no-repeat"
              style={{ backgroundImage: `url("${heroSlides[currentHeroSlide]}")` }}
            />
          </AnimatePresence>
        </div>
        {/* Lighter overlay to let the impressive image shine */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/45 via-[#0a1628]/15 to-[#0a1628]" />

        {/* Particle canvas */}
        <div className="absolute inset-0">
          <InteractiveFluidBg />
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] shadow-[0_0_15px_rgba(179,135,40,0.1)]"
            style={{ borderColor: 'rgba(179,135,40,0.3)', background: 'rgba(179,135,40,0.05)' }}
          >
            <span className="w-2 h-2 rounded-full bg-[#BF953F] animate-pulse" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728]">Marketplace N°1 du Cameroun</span>
          </motion.div>

          {/* Title with 3D Tilt Wow Effect */}
          <motion.div
            style={reduceMotion ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="will-change-transform flex flex-col items-center mt-[-40px]"
          >
            {/* OISEAU LOGISTIQUE STYLE ART AFRICAIN (SVG) */}
            <div className="mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] drop-shadow-[0_4px_12px_rgba(179,135,40,0.35)]">
              <svg width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Corps et ailes géométriques de l'oiseau en or métallique */}
                <path d="M50 12 L64 36 L92 36 L70 51 L78 78 L50 61 L22 78 L30 51 L8 36 L36 36 Z" fill="url(#goldGradient)" />
                
                {/* Lignes intérieures de gravure (art ethnique et plumes) */}
                <path d="M50 20 L57 36 L75 36 L61 47 L66 68 L50 56 L34 68 L39 47 L25 36 L43 36 Z" fill="#0a1628" />
                
                {/* Plumes et reflets internes en or fin */}
                <path d="M50 25 L54 35 L70 35 L57 44 L61 60 L50 50 L39 60 L43 44 L30 35 L46 35 Z" fill="url(#goldGradient)" />
                <circle cx="50" cy="30" r="1.5" fill="#0a1628" /> {/* Œil de l'oiseau */}
                
                {/* Bec et tête pointée vers l'avant (Logistique) */}
                <path d="M50 6 L53 14 L47 14 Z" fill="url(#goldGradient)" />
                
                {/* Lignes dynamiques de vol sous l'oiseau */}
                <path d="M35 83 L65 83" stroke="url(#goldGradient)" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 5" />
                <path d="M42 88 L58 88" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 4" />

                {/* Définition du dégradé d'or métallique */}
                <defs>
                  <linearGradient id="goldGradient" x1="12" y1="10" x2="88" y2="78" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#BF953F" />
                    <stop offset="50%" stopColor="#FCF6BA" />
                    <stop offset="100%" stopColor="#B38728" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <motion.h1 
              style={reduceMotion ? {} : { transform: 'translateZ(60px)' }} 
              className={`text-[80px] sm:text-[120px] tracking-tight leading-none font-black ${artFont.className} text-center relative group/title cursor-pointer select-none`}
            >
              {/* PHÉNIX / OISEAU DE FEU ANIMÉ (S'active au hover) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                {/* Le Phénix central */}
                <svg 
                  className="w-40 h-40 opacity-0 group-hover/title:opacity-100 group-hover/title:scale-150 group-hover/title:-translate-y-12 transition-all duration-700 ease-out filter drop-shadow-[0_0_25px_#FF4D00]" 
                  viewBox="0 0 100 100" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M50 50 C20 40 10 20 5 10 C15 30 35 45 50 50 Z" fill="url(#fireGradient)" className="animate-pulse" />
                  <path d="M50 50 C80 40 90 20 95 10 C85 30 65 45 50 50 Z" fill="url(#fireGradient)" className="animate-pulse" />
                  <path d="M50 20 L54 45 L50 65 L46 45 Z" fill="url(#goldGradient)" />
                  <path d="M50 65 L55 85 L50 95 L45 85 Z" fill="url(#fireGradient)" />
                  <path d="M50 65 L63 80 L62 90 L50 75 Z" fill="url(#fireGradient)" />
                  <path d="M50 65 L37 80 L38 90 L50 75 Z" fill="url(#fireGradient)" />
                  {/* Définitions des dégradés de feu et d'or */}
                  <defs>
                    <linearGradient id="fireGradient" x1="0" y1="0" x2="100" y2="100">
                      <stop offset="0%" stopColor="#FF4D00" />
                      <stop offset="50%" stopColor="#FF8700" />
                      <stop offset="100%" stopColor="#FFC107" />
                    </linearGradient>
                    <linearGradient id="goldGradient" x1="0" y1="20" x2="0" y2="65">
                      <stop offset="0%" stopColor="#FCF6BA" />
                      <stop offset="100%" stopColor="#BF953F" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Effet WOW : Ombre de lueur dorée diffuse derrière le nom */}
              <span className="absolute inset-0 blur-2xl opacity-20 group-hover/title:opacity-60 bg-gradient-to-r from-[#FF4D00] via-[#BF953F] to-[#FFC107] pointer-events-none select-none transition-opacity duration-500">VesTyle</span>
              
              {/* Le nom avec dégradé d'art africain texturé */}
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#C84B31] via-[#FCF6BA] to-[#2D4263] filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.7)] group-hover/title:brightness-125 transition-all duration-300" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>
                Ves
                {/* Lettre T en or pur texturé */}
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#FCF6BA] via-[#BF953F] to-[#B38728] font-black">T</span>
                yle
              </span>
            </motion.h1>
            
            <p className="mt-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728]">❖ Marketplace Ethno-Moderne ❖</span>
            </p>
          </motion.div>



          {/* ── HIGH-TECH INTERFACE (LAB STYLE) ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-4xl mt-6 flex flex-col gap-4 relative z-20"
          >
            {/* Module 1: The AI Search Bar - Futuristic Gold & Emerald Lab Style */}
            <div className="relative group w-full max-w-3xl mx-auto">
              {/* Outer multi-color neon glow border */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#BF953F] via-[#25D366] to-[#B38728] rounded-[2.5rem] blur-md opacity-25 group-hover:opacity-65 transition duration-500" />
              <div className="relative flex flex-col sm:flex-row items-center bg-[#0d1f37]/85 backdrop-blur-2xl border border-[#BF953F]/30 rounded-[2.2rem] shadow-[0_0_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 focus-within:border-[#BF953F] focus-within:shadow-[0_0_35px_rgba(179,135,40,0.2)]">
                <div className="flex-1 w-full flex items-center relative">
                  <span className="absolute left-6 pointer-events-none text-[#BF953F] drop-shadow-[0_0_8px_rgba(191,149,63,0.4)]">
                    <SearchIcon />
                  </span>
                  <SearchAutocomplete
                    value={searchQuery}
                    onChange={setSearchQuery}
                    suggestions={suggestions}
                    placeholder="Rechercher par mot-clé, produit, ou catégorie..."
                    className="w-full"
                    inputClassName="w-full outline-none bg-transparent font-mono py-5 pl-14 pr-6 text-sm sm:text-base text-[#FCF6BA] placeholder:text-[#BF953F]/40"
                  />
                </div>
                <button
                  type="button"
                  onClick={scrollToFeed}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-5 text-xs font-black uppercase tracking-[0.25em] text-slate-950 bg-gradient-to-r from-[#BF953F] to-[#B38728] transition-all duration-300 hover:from-[#FCF6BA] hover:to-[#BF953F] hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(179,135,40,0.25)]"
                >
                  Analyser <ArrowRightIcon />
                </button>
              </div>
            </div>

            {/* Unique Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2">
              
              {/* Unique Button: Visual Search (Round, Glowing) */}
              <motion.button
                type="button"
                onClick={() => setVisualSearchOpen(true)}
                whileHover={{ scale: 1.06, shadow: "0 0 25px rgba(179,135,40,0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-slate-950 font-black transition-all shadow-[0_0_20px_rgba(179,135,40,0.3)]"
              >
                <CameraIcon />
                <span className="uppercase tracking-widest text-xs font-mono">Scan Photo</span>
              </motion.button>

              {/* Unique Button: GPS Radar (Style iOS Activable) */}
              <motion.button
                type="button"
                onClick={() => {
                  triggerFeedback('radar');
                  requestLocation();
                  // Scroll vers les produits pour voir les badges distance clignoter
                  setTimeout(() => {
                    const section = document.getElementById('discovery-section');
                    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 300);
                }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-full border-2 transition-all duration-300 backdrop-blur-md relative ${
                  userLocation 
                    ? 'bg-[#BF953F]/10 border-[#BF953F] text-[#FCF6BA]' 
                    : 'bg-white/5 border-[#BF953F]/30 text-white'
                }`}
              >
                {/* Petit voyant vert style iOS si la localisation est active */}
                {userLocation && (
                  <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />
                )}
                {isGpsLocating ? <LoaderIcon /> : <MapPinIcon />}
                <span className="uppercase tracking-widest text-xs font-mono">
                  {isGpsLocating ? "Recherche..." : userLocation ? "Localisé" : "Autour de moi"}
                </span>
              </motion.button>

              {/* Unique Input: Code Vendeur (Glassmorphism et Or Massif) */}
              <div className="relative group/code">
                {/* Infobulle d'accueil aimable */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-[#BF953F]/40 text-[#FCF6BA] text-[10px] font-bold tracking-wider uppercase opacity-0 pointer-events-none group-hover/code:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg">
                  🏪 Entrez le code d'un vendeur !
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-[#BF953F]/40 rotate-45 -mt-1"></div>
                </div>

                <motion.form 
                  onSubmit={handleCodeSearch} 
                  whileHover={{ scale: 1.04 }}
                  className="flex items-center rounded-full bg-black/40 border border-[#BF953F]/30 focus-within:border-[#BF953F] transition-all duration-300 backdrop-blur-xl p-1 pr-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus-within:shadow-[0_0_15px_rgba(179,135,40,0.25)]"
                >
                  <div className="pl-4 pr-1 text-[#BF953F]">
                    <HashIcon />
                  </div>
                  <input
                    type="text"
                    maxLength={5}
                    value={codeQuery}
                    onChange={e => { setCodeQuery(e.target.value.replace(/\D/g, '')); setCodeError(''); }}
                    placeholder="CODE BOUTIQUE"
                    className="w-32 sm:w-40 bg-transparent border-none outline-none text-xs sm:text-sm font-mono font-bold text-[#FCF6BA] placeholder:text-[#BF953F]/40 tracking-[0.15em] py-2.5"
                  />
                  <motion.button
                    type="submit"
                    disabled={codeQuery.length !== 5 || codeLoading}
                    whileTap={{ scale: 0.9 }}
                    animate={codeQuery.length === 5 ? { scale: [1, 1.08, 1], boxShadow: ["0 0 5px rgba(179,135,40,0.3)", "0 0 15px rgba(179,135,40,0.8)", "0 0 5px rgba(179,135,40,0.3)"] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#BF953F] to-[#B38728] text-slate-950 flex items-center justify-center disabled:opacity-30 disabled:scale-95 hover:from-[#FCF6BA] hover:to-[#BF953F] transition-all shadow-[0_2px_5px_rgba(0,0,0,0.3)]"
                  >
                    {codeLoading ? <LoaderIcon /> : <ArrowRightIcon />}
                  </motion.button>
                </motion.form>
              </div>
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

      {/* ── COMMENT ÇA MARCHE + LIVE FEED ─────────────────────────────── */}
      <section className="py-24 sm:py-32 px-4 relative bg-[#0a1628] overflow-hidden">
        {/* Ambient background blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#25D366]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#128C7E]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#25D366]/20 bg-[#25D366]/5 text-[#25D366] text-[10px] font-black uppercase tracking-[0.3em] font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
              Plateforme e-commerce de proximité
            </div>
            <h2 className={`text-4xl sm:text-6xl font-black text-white mb-5 tracking-tight ${artFont.className}`}>
              Comment ça <span style={{ color: '#25D366' }}>marche ?</span>
            </h2>
            <p className="text-base sm:text-lg max-w-xl mx-auto font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
              En 3 étapes simples, accédez aux meilleures boutiques locales du Cameroun.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
            
            {/* LEFT — Steps */}
            <div className="flex flex-col gap-8 relative">
              {/* Animated vertical connector */}
              <div className="hidden lg:block absolute left-[28px] top-10 bottom-10 w-[2px]"
                style={{ background: 'linear-gradient(to bottom, #25D366, rgba(37,211,102,0.1), transparent)' }} />

              {[
                {
                  step: '01',
                  title: 'Explorez',
                  desc: 'Recherchez par photo, texte ou géolocalisation. Notre IA vous trouve la perle rare dans votre quartier en quelques secondes.',
                  color: '#25D366',
                },
                {
                  step: '02',
                  title: 'Commandez',
                  desc: 'Paiement sécurisé, échange direct avec nos marchands locaux certifiés. Aucune surprise, prix affichés en FCFA.',
                  color: '#25D366',
                },
                {
                  step: '03',
                  title: 'Recevez',
                  desc: 'Livraison ultra-rapide par coursier ou retrait express en boutique. Suivez votre commande en temps réel.',
                  color: '#25D366',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="flex items-start gap-6 group relative z-10 p-6 rounded-3xl glass-premium glass-glow-wa transition-all duration-300"
                >
                  {/* Glowing Step Badge */}
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-[#25D366]/20 rounded-2xl blur-lg group-hover:bg-[#25D366]/40 transition-all duration-500" />
                    <div className="relative w-14 h-14 bg-[#0d2137] border border-[#25D366]/20 rounded-2xl flex items-center justify-center group-hover:border-[#25D366]/60 transition-all duration-300 shadow-[0_0_20px_rgba(37,211,102,0.05)] group-hover:shadow-[0_0_30px_rgba(37,211,102,0.15)]">
                      <span className="text-2xl font-black font-mono" style={{ color: '#25D366' }}>{item.step}</span>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="pt-1 flex-1">
                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 group-hover:text-[#25D366] transition-colors duration-300 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed text-slate-300 group-hover:text-white transition-colors duration-300">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* RIGHT — Real-time Live Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative lg:self-start lg:sticky lg:top-32"
            >
              <LiveShowcase />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEED SECTION ──────────────────────────────────────────────────── */}
      <div
        id="discovery-section"
        className="relative min-h-screen pt-16 pb-24 px-4 scroll-mt-20 overflow-hidden"
        style={{ background: '#0a1628' }}
      >
        {/* Halos de lumière de fond */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-[#BF953F]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
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
        <section className="w-full py-16 px-4 relative overflow-hidden border-t border-b border-white/5" style={{ background: '#080f1c' }}>
          {/* Subtle glowing ambient red blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <span className="text-4xl text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">⚡</span> 
                  <span className="tracking-tight uppercase font-black">Ventes Flash</span>
                </h2>
                <p className="text-slate-400 mt-2 text-sm font-medium">Offres exclusives de proximité. Les prix remontent bientôt !</p>
              </div>
              <div className="mt-4 md:mt-0 bg-red-500/10 border border-red-500/30 backdrop-blur-md px-6 py-3.5 rounded-2xl flex items-center gap-3">
                <span className="text-[10px] text-red-400 uppercase tracking-widest font-black">Fin de l'offre :</span>
                <span className="text-xl font-mono font-black text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">{timeLeft || 'Calcul...'}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {flashSales.map(product => (
                <div key={product.id} className="glass-premium hover:border-red-500/30 rounded-3xl p-5 flex gap-4 items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(239,68,68,0.08)]">
                  <div className="w-24 h-24 rounded-2xl bg-slate-950/65 overflow-hidden relative flex-shrink-0 border border-white/5">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">📷</div>
                    )}
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black tracking-wider uppercase px-2 py-1 rounded-bl-xl shadow-md">
                      -15%
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-base line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{product.store?.name} • {product.store?.city}</p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-black text-red-500 font-mono">{product.price} FCFA</span>
                      {product.original_price && (
                        <span className="text-xs text-slate-500 line-through font-mono">{product.original_price} FCFA</span>
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
      <footer style={{ background: '#050a12', borderTop: '1px solid rgba(255,255,255,0.03)' }} className="py-16 px-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-[#25D366]/3 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-10 relative z-10">
          <h2 className={`text-5xl sm:text-[70px] tracking-tight text-white ${artFont.className} transition-all duration-300 hover:scale-105`}>
            Ves<span style={{ color: '#25D366' }} className="text-glow-wa">Tyle</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link href="/login" className="hover:text-[#25D366] transition-colors">Vendre sur Vestyle</Link>
            <Link href="/suivi" className="hover:text-[#25D366] transition-colors">Suivre une commande</Link>
            <Link href="/boutiques" className="hover:text-[#25D366] transition-colors">Boutiques</Link>
            <Link href="#" className="hover:text-[#25D366] transition-colors">Aide</Link>
          </div>
          <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="text-[9px] uppercase tracking-[0.4em] text-slate-600">
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
