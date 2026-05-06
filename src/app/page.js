'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import VoiceSearchButton from '@/components/VoiceSearchButton';
import Link from 'next/link';
import { Search, MapPin, MessageCircle, ShoppingBag, ArrowRight, Hash, Loader2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useDistance } from '@/hooks/useDistance';

// ── Main Component ────────────────────────────────────────
export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [codeQuery, setCodeQuery] = useState('');
  const [codeResult, setCodeResult] = useState(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [featuredStores, setFeaturedStores] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [locationStatus, setLocationStatus] = useState('');
  const searchRef = useRef(null);
  const router = useRouter();
  const { requestLocation, userLocation, isLocating: isGpsLocating, getDistanceKm, formatDistance, error: gpsError } = useDistance();

  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const blurEffect = useTransform(scrollY, [0, 300], ["blur(0px)", "blur(6px)"]);

  useEffect(() => {
    setMounted(true);
    loadFeatured();
  }, []);

  async function loadFeatured() {
    const [{ data: stores }, { data: products }] = await Promise.all([
      supabase.from('stores')
        .select('id,name,slug,logo_url,city,store_code,latitude,longitude')
        .eq('is_active', true)
        .order('is_boosted', { ascending: false })
        .order('daily_views', { ascending: false })
        .limit(12),
      supabase.from('products')
        .select('id,name,price,image_url,store_id,stores(name,slug,latitude,longitude)')
        .eq('is_active', true)
        .order('is_boosted', { ascending: false })
        .order('daily_views', { ascending: false })
        .limit(20),
    ]);
    setFeaturedStores(stores || []);
    setFeaturedProducts(products || []);
  }

  async function handleCodeSearch(e) {
    e.preventDefault();
    const code = codeQuery.trim();
    if (code.length !== 5 || isNaN(code)) {
      setCodeError('Code invalide. 5 chiffres requis.');
      return;
    }
    setCodeLoading(true);
    setCodeError('');
    setCodeResult(null);
    const { data } = await supabase.from('stores').select('id,name,slug,logo_url,city,description,whatsapp_number,store_code').eq('store_code', code).eq('is_active', true).single();
    setCodeLoading(false);
    if (data) setCodeResult(data);
    else setCodeError('Aucune boutique avec ce code.');
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  useEffect(() => {
    if (userLocation && featuredStores.length > 0) {
      setLocationStatus('📍 À proximité');
      
      // Trier les boutiques par distance
      const sortedStores = [...featuredStores].sort((a, b) => {
        const dA = getDistanceKm(a.latitude, a.longitude) || Infinity;
        const dB = getDistanceKm(b.latitude, b.longitude) || Infinity;
        return dA - dB;
      });
      setFeaturedStores(sortedStores);

      // Trier les produits par distance de leur boutique
      const sortedProds = [...featuredProducts].sort((a, b) => {
        const dA = getDistanceKm(a.stores?.latitude, a.stores?.longitude) || Infinity;
        const dB = getDistanceKm(b.stores?.latitude, b.stores?.longitude) || Infinity;
        return dA - dB;
      });
      setFeaturedProducts(sortedProds);
    }
  }, [userLocation, getDistanceKm]);

  function handleLocateMe() {
    requestLocation();
  }

  if (!mounted) {
    return <div className="min-h-screen font-sans bg-[#FDFCFB]"></div>;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-slate-900 bg-[#FDFCFB]">
      
      {/* --- IMAGE DE FOND ANIMÉE (PARALLAX) --- */}
      <motion.div 
        style={{ 
          y: backgroundY,
          filter: blurEffect,
          backgroundImage: "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070')" 
        }}
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-emerald-950/40 to-[#FDFCFB]" />
      </motion.div>

      {/* --- CONTENU (Z-INDEX SUPÉRIEUR) --- */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* --- HERO SECTION --- */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-20 pb-10 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="bg-white/10 backdrop-blur-md p-8 md:p-14 rounded-[40px] md:rounded-[60px] border border-white/20 shadow-2xl mb-12 mt-10"
          >
            <h1 className="text-5xl md:text-8xl font-serif text-white mb-4 drop-shadow-lg">
              Ves<span className="text-emerald-400 italic">Tyle</span>
            </h1>
            <p className="text-emerald-50 tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm font-light">
              L'excellence à proximité
            </p>
          </motion.div>

          {/* SEARCH BAR INTÉGRÉE AU HERO */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="w-full max-w-3xl z-20"
          >
            <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-lg p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center border border-white/50">
              <div className="flex-1 flex items-center px-4 w-full border-b md:border-b-0 md:border-r border-gray-200 py-3 relative">
                <Search className="text-emerald-600 mr-3 w-5 h-5 flex-shrink-0" />
                <input 
                  ref={searchRef}
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={locationStatus || "Que recherchez-vous ?"} 
                  className="w-full outline-none text-slate-800 bg-transparent placeholder-slate-400 font-medium"
                />
                <button 
                  type="button"
                  onClick={handleLocateMe}
                  className="absolute right-12 p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors flex items-center gap-1"
                  title="Autour de moi"
                >
                  {isGpsLocating ? <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div> : <MapPin size={20} />}
                </button>
                <VoiceSearchButton 
                  onInterimResult={(text) => setSearchQuery(text)}
                  onResult={(text) => {
                    if (text.trim()) router.push(`/search?q=${encodeURIComponent(text.trim())}`);
                  }} 
                  className="absolute right-2 p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                />
              </div>
              
              <button type="submit" className="w-full md:w-auto bg-emerald-800 text-white px-10 py-4 rounded-xl font-bold hover:bg-emerald-900 transition-all shadow-md mt-2 md:mt-0 md:ml-2 active:scale-95">
                Explorer
              </button>
            </form>
          </motion.div>
          
          {/* Indicateur de scroll animé */}
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-8 w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1"
          >
            <div className="w-1 h-2 bg-emerald-400 rounded-full" />
          </motion.div>
        </section>

        {/* --- RESTE DU CONTENU --- */}
        <div className="bg-[#FDFCFB] rounded-t-[40px] md:rounded-t-[80px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] pt-24 pb-20 px-6 relative z-20">
          <div className="max-w-6xl mx-auto space-y-24">

            {/* ═══ DIRECT ACCESS CARD ════════════ */}
            <section className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-50 p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-40 -mr-20 -mt-20"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 shadow-inner">
                      <Hash size={24} />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-slate-900">Accès Direct VIP</h3>
                      <p className="text-sm text-slate-500 font-medium tracking-wide">Code boutique à 5 chiffres</p>
                    </div>
                  </div>

                  <form onSubmit={handleCodeSearch} className="flex flex-col sm:flex-row gap-4 mt-6">
                    <input
                      type="text"
                      maxLength={5}
                      value={codeQuery}
                      onChange={e => { setCodeQuery(e.target.value.replace(/\D/g, '')); setCodeError(''); setCodeResult(null); }}
                      placeholder="Ex: 12345"
                      className="flex-1 bg-white border border-emerald-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl px-6 py-4 text-3xl font-bold tracking-[0.25em] text-center sm:text-left outline-none transition-all text-slate-800 shadow-sm"
                    />
                    <button type="submit" disabled={codeLoading || codeQuery.length !== 5} className="py-4 px-8 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20">
                      {codeLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Accéder'}
                    </button>
                  </form>

                  {codeError && <p className="mt-4 text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{codeError}</p>}
                </div>

                {codeResult && (
                  <div className="w-full md:w-1/2 bg-white rounded-2xl p-6 shadow-lg border border-emerald-50 animate-fade-in flex items-center gap-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden flex-shrink-0 shadow-inner">
                      {codeResult.logo_url ? <img src={codeResult.logo_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-emerald-700 font-serif font-bold text-3xl">{codeResult.name[0]}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-slate-900 text-xl truncate">{codeResult.name}</p>
                      <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1 font-medium"><MapPin size={14}/> {codeResult.city}</p>
                    </div>
                    <Link href={`/boutique/${codeResult.slug}`} className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-transform flex-shrink-0">
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* ═══ REAL STORES AROUND ME (Auto-sorted if GPS on) ════════ */}
            <section>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h3 className="text-3xl font-serif mb-2 text-slate-900">Boutiques Recommandées</h3>
                  <p className="text-slate-500 font-medium">Découvrez les pépites de votre ville</p>
                </div>
                <Link href="/boutiques" className="text-emerald-600 font-bold border-b-2 border-emerald-600 pb-1 hover:text-emerald-800 hover:border-emerald-800 transition-colors hidden md:block">Explorer</Link>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
                {featuredStores.map((s) => (
                  <Link
                    key={s.id}
                    href={`/boutique/${s.slug}`}
                    className="flex-shrink-0 w-72 bg-white rounded-3xl p-6 shadow-lg border border-emerald-50 hover:shadow-2xl transition-all duration-500 group"
                  >
                    <div className="relative w-full aspect-video bg-slate-50 rounded-2xl overflow-hidden mb-6">
                      {s.logo_url ? <img src={s.logo_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" /> : <div className="w-full h-full flex items-center justify-center text-emerald-700 font-serif font-bold text-4xl">{s.name[0]}</div>}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-emerald-800 shadow-sm border border-white/50">
                        {s.city || 'DOUALA'}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-serif font-bold text-xl text-slate-900">{s.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           {userLocation && s.latitude && (
                             <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                               <MapPin size={10} /> {formatDistance(s.latitude, s.longitude)}
                             </span>
                           )}
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {s.store_code}</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* ═══ TABS & GRIDS ════════════════════════════════════ */}
            <section>
              <div className="flex justify-center mb-10">
                <div className="inline-flex bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-emerald-100/50 p-1.5">
                  {[
                    { key: 'products', label: 'Collections Récentes' },
                    { key: 'stores', label: 'Boutiques de Prestige' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-8 py-3 text-sm font-bold rounded-full transition-all duration-300 ${activeTab === tab.key ? 'bg-emerald-900 text-white shadow-md' : 'text-slate-600 hover:text-emerald-800 hover:bg-white/50'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'products' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                  {featuredProducts.length === 0 ? (
                    [...Array(8)].map((_, i) => (
                      <div key={i} className="bg-white border border-emerald-50 rounded-2xl overflow-hidden animate-pulse shadow-sm">
                        <div className="aspect-[4/5] bg-slate-100" />
                        <div className="p-5 space-y-3">
                          <div className="h-3 bg-slate-100 rounded w-1/3" />
                          <div className="h-4 bg-slate-200 rounded w-3/4" />
                          <div className="h-5 bg-slate-200 rounded w-1/2 mt-4" />
                        </div>
                      </div>
                    ))
                  ) : (
                    featuredProducts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/boutique/${p.stores?.slug}?product=${p.id}`}
                        className="bg-white border border-emerald-50 rounded-2xl overflow-hidden flex flex-col hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500 active:scale-[0.98] group"
                        prefetch
                      >
                        <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
                          {p.image_url
                            ? <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} loading="lazy" />
                            : <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag size={40} strokeWidth={1} /></div>
                          }
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between bg-white relative z-10">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest truncate">{p.stores?.name}</p>
                              {userLocation && p.stores?.latitude && (
                                <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <MapPin size={8} /> {formatDistance(p.stores.latitude, p.stores.longitude)}
                                </span>
                              )}
                            </div>
                            <h3 className="font-serif text-slate-900 text-lg leading-snug line-clamp-2">{p.name}</h3>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="font-bold text-emerald-900 text-lg">{Number(p.price).toLocaleString()} F</span>
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                              <MessageCircle size={14} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'stores' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredStores.length === 0 ? (
                    [...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white border border-emerald-50 rounded-2xl p-6 flex items-center gap-5 animate-pulse shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-full" />
                        <div className="flex-1 space-y-3">
                          <div className="h-5 bg-slate-200 rounded w-2/3" />
                          <div className="h-3 bg-slate-100 rounded w-1/3" />
                        </div>
                      </div>
                    ))
                  ) : (
                    featuredStores.map((s) => (
                      <Link
                        key={s.id}
                        href={`/boutique/${s.slug}`}
                        className="bg-white border border-emerald-50 rounded-2xl p-6 flex items-center gap-5 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 active:scale-[0.98] group"
                        prefetch
                      >
                        <div className="w-16 h-16 rounded-full border-2 border-emerald-50 overflow-hidden bg-slate-50 flex-shrink-0 group-hover:border-emerald-200 transition-colors">
                          {s.logo_url ? <img src={s.logo_url} className="w-full h-full object-cover" alt="" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-emerald-700 font-serif font-bold text-2xl">{s.name[0]}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif font-bold text-slate-900 text-lg truncate group-hover:text-emerald-700 transition-colors">{s.name}</h3>
                          <div className="flex items-center gap-1.5 text-slate-500 mt-1 font-medium">
                            <MapPin size={14} className="text-emerald-400" />
                            <span className="text-sm">{s.city || 'Cameroun'}</span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <ArrowRight size={16} />
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}

              <div className="text-center pt-10">
                <Link href={activeTab === 'products' ? '/search' : '/boutiques'} className="inline-flex items-center justify-center py-4 px-10 bg-white border border-emerald-100 text-emerald-800 font-bold rounded-full shadow-md hover:shadow-lg hover:border-emerald-200 active:scale-95 transition-all text-sm tracking-wide">
                  Explorer tout l'annuaire
                </Link>
              </div>
            </section>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <footer className="bg-emerald-950 text-white py-16 px-6 relative overflow-hidden z-20">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-20"></div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <h2 className="text-3xl font-serif font-bold mb-2">VesTyle</h2>
              <p className="text-emerald-400/80 text-sm tracking-wide">L'élégance du commerce de proximité.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-emerald-100/80">
              <a href="#" className="hover:text-white transition-colors">À propos</a>
              <a href="/login" className="hover:text-white transition-colors">Devenir Vendeur</a>
              <a href="#" className="hover:text-white transition-colors">Aide</a>
            </div>
          </div>
          <div className="text-center mt-16 text-emerald-800 text-xs uppercase tracking-widest font-bold">
            © {new Date().getFullYear()} VesTyle - Fait avec excellence au Cameroun
          </div>
        </footer>
      </div>
    </div>
  );
}
