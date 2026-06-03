'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import ClientDiscovery from '@/components/ClientDiscovery';
import VisualSearchModal from '@/components/VisualSearchModal';
import Link from 'next/link';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useDistance } from '@/hooks/useDistance';
import { useOfflineData } from '@/hooks/useOfflineData';

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
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

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
  useEffect(() => { setMounted(true); }, []);

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

  if (!mounted) return <div className="min-h-screen" style={{ background: '#0a1628' }} />;

  return (
    <div className="relative min-h-screen w-full font-sans" style={{ background: '#0a1628' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[100svh] flex flex-col justify-center items-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 40%, #0a2e20 100%)',
        }}
      >
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

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          >
            <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-none text-white">
              Ves<span style={{ color: '#25D366' }}>Tyle</span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Découvrez, achetez et vendez en proximité.
            </p>
          </motion.div>



          {/* ── SEARCH BAR ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="w-full max-w-2xl"
          >
            <div
              className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl shadow-2xl"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex-1 w-full relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#25D366' }}>
                  <SearchIcon />
                </span>
                <SearchAutocomplete
                  value={searchQuery}
                  onChange={setSearchQuery}
                  suggestions={suggestions}
                  placeholder={userLocation ? 'Prêt à explorer...' : 'Que cherchez-vous ?'}
                  className="w-full"
                  inputClassName="w-full outline-none bg-transparent font-semibold py-4 pl-12 pr-4 text-sm sm:text-base text-white placeholder:text-white/40"
                >
                  {/* children slot vide */}
                </SearchAutocomplete>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto px-1 pb-1 sm:pb-0 sm:pr-1">
                <button
                  type="button"
                  onClick={() => setVisualSearchOpen(true)}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex-1 sm:flex-none justify-center"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                  title="Recherche par photo"
                >
                  <CameraIcon /> <span className="sm:hidden">Photo</span>
                </button>
                <button
                  type="button"
                  onClick={requestLocation}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex-1 sm:flex-none justify-center"
                  style={{ background: 'rgba(255,255,255,0.08)', color: isGpsLocating ? '#25D366' : 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                  title="Activer ma position"
                >
                  {isGpsLocating ? <LoaderIcon /> : <MapPinIcon />} <span className="sm:hidden">GPS</span>
                </button>
                <button
                  type="button"
                  onClick={scrollToFeed}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-black transition-all hover:scale-105 active:scale-95 flex-1 sm:flex-none justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff' }}
                >
                  <span className="hidden sm:inline">Explorer</span>
                  <span className="sm:hidden">Go</span>
                  <ArrowRightIcon />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex items-center gap-8 sm:gap-12"
          >
            {STATS.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="text-2xl sm:text-3xl font-black text-white">{s.value}</span>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Code boutique - Recommandé */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
            onClick={() => setShowCodeModal(true)}
            className="relative flex items-center gap-3 px-6 py-3 rounded-2xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95 group overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              border: '1px solid rgba(37,211,102,0.5)',
              color: '#fff',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#25D366]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366] text-white shadow-[0_0_15px_rgba(37,211,102,0.5)]">
              <HashIcon />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm tracking-wide">Accéder à une boutique par code</span>
              <span className="text-[10px] uppercase tracking-widest text-[#25D366] font-bold mt-0.5">✨ Recommandé</span>
            </div>
          </motion.button>
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

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#070f1c', color: 'rgba(255,255,255,0.5)' }} className="py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
          <h2 className="text-4xl font-black tracking-tighter text-white">
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

      {/* ── CODE MODAL ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCodeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
            onClick={() => setShowCodeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-2xl font-black text-slate-900 mb-2">Accès boutique</h3>
              <p className="text-sm text-slate-500 mb-6">Entrez le code à 5 chiffres de votre vendeur.</p>
              <form onSubmit={handleCodeSearch} className="flex gap-3">
                <input
                  type="text"
                  maxLength={5}
                  value={codeQuery}
                  onChange={e => { setCodeQuery(e.target.value.replace(/\D/g, '')); setCodeError(''); }}
                  placeholder="00000"
                  className="flex-1 border-2 border-slate-200 focus:border-emerald-500 rounded-2xl px-4 py-4 text-3xl font-black text-center outline-none transition-colors"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={codeQuery.length !== 5 || codeLoading}
                  className="bg-slate-900 text-white px-5 rounded-2xl hover:bg-emerald-600 transition-all disabled:opacity-40 flex items-center justify-center"
                >
                  {codeLoading ? <LoaderIcon /> : <ArrowRightIcon />}
                </button>
              </form>
              {codeError && <p className="mt-3 text-rose-500 text-xs font-bold">{codeError}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
