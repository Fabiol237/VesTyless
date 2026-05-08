'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import VoiceSearchButton from '@/components/VoiceSearchButton';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import ClientDiscovery from '@/components/ClientDiscovery';
import { normalizeStr } from '@/lib/searchUtils';
import Link from 'next/link';
import { Search, MapPin, MessageCircle, ShoppingBag, ArrowRight, Hash, Loader2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useDistance } from '@/hooks/useDistance';
import { useOfflineData } from '@/hooks/useOfflineData';
import { publicProductsIndex, publicStoresIndex } from '@/lib/meilisearch';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [codeQuery, setCodeQuery] = useState('');
  const [codeResult, setCodeResult] = useState(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const router = useRouter();
  const { requestLocation, userLocation, isLocating: isGpsLocating, formatDistance } = useDistance();
  
  const [suggestions, setSuggestions] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);

  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const blurEffect = useTransform(scrollY, [0, 300], ["blur(0px)", "blur(6px)"]);

  // Stratégie Offline-First pour les suggestions
  const { data: offlineSuggestions } = useOfflineData('home_suggestions', async () => {
    const [cats, strs, prods] = await Promise.all([
      supabase.from('categories').select('name').limit(10),
      supabase.from('stores').select('name, city').order('is_boosted', { ascending: false }).limit(10),
      supabase.from('products').select('name').eq('is_active', true).order('daily_views', { ascending: false }).limit(15)
    ]);

    const items = [];
    if (cats.data) cats.data.forEach(c => items.push({ label: c.name, value: c.name, type: 'Catégorie', emoji: '🏷️' }));
    if (strs.data) strs.data.forEach(s => items.push({ label: s.name, value: s.name, type: 'Boutique', emoji: '🏪', sublabel: s.city }));
    if (prods.data) prods.data.forEach(p => items.push({ label: p.name, value: p.name, type: 'Produit', emoji: '🛍️' }));
    
    return { data: items };
  });

  useEffect(() => {
    if (offlineSuggestions) {
      setSuggestions(offlineSuggestions);
      // Extraire les tags tendances
      const tags = [...new Set(offlineSuggestions.filter(i => i.type === 'Catégorie').map(i => i.label)), 'Nouveautés', 'Promos'].slice(0, 5);
      setTrendingTags(tags);
    }
  }, [offlineSuggestions]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id,name,slug,logo_url,city,description,whatsapp_number,store_code')
        .eq('store_code', code)
        .single();

      if (error) {
        setCodeError('Aucune boutique avec ce code.');
        return;
      }
      
      if (data) {
        setCodeResult(data);
        // Redirection automatique immédiate pour un accès VIP
        router.push(`/boutique/${data.slug}`);
      } else {
        setCodeError('Aucune boutique avec ce code.');
      }
    } catch (err) {
      console.error('Erreur recherche code:', err);
      setCodeError('Code introuvable.');
    } finally {
      setCodeLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    const query = searchQuery.trim();
    
    // Détection intelligente : si c'est un code à 5 chiffres, on traite comme un accès direct
    if (query.length === 5 && !isNaN(query)) {
      setCodeLoading(true);
      const { data } = await supabase.from('stores').select('slug').eq('store_code', query).single();
      if (data) {
        router.push(`/boutique/${data.slug}`);
        return;
      }
      setCodeLoading(false);
    }
    
    // Sinon, on laisse ClientDiscovery gérer la recherche classique
  }

  useEffect(() => {
    if (userLocation) {
      setLocationStatus('📍 À proximité');
    }
  }, [userLocation]);

  // RECHERCHE DYNAMIQUE POUR L'AUTOCOMPLÉTION
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions(offlineSuggestions || []);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        let items = [];
        
        // Tentative via Meilisearch (Ultra-rapide et flou)
        try {
          const [storeHits, productHits] = await Promise.all([
            publicStoresIndex.search(searchQuery, { limit: 5 }),
            publicProductsIndex.search(searchQuery, { limit: 10 })
          ]);

          if (storeHits.hits.length > 0) {
            storeHits.hits.forEach(s => items.push({ 
              label: s.name, value: s.name, type: 'Boutique', emoji: '🏪', sublabel: s.city 
            }));
          }
          if (productHits.hits.length > 0) {
            productHits.hits.forEach(p => items.push({ 
              label: p.name, value: p.name, type: 'Produit', emoji: '🛍️' 
            }));
          }
        } catch (meiliErr) {
          console.warn('Meilisearch non disponible, fallback SQL...');
          // Fallback SQL si Meili est down
          const [strs, prods] = await Promise.all([
            supabase.from('stores').select('name, city').ilike('name', `%${searchQuery}%`).limit(5),
            supabase.from('products').select('name').eq('is_active', true).ilike('name', `%${searchQuery}%`).limit(10)
          ]);
          if (strs.data) strs.data.forEach(s => items.push({ label: s.name, value: s.name, type: 'Boutique', emoji: '🏪', sublabel: s.city }));
          if (prods.data) prods.data.forEach(p => items.push({ label: p.name, value: p.name, type: 'Produit', emoji: '🛍️' }));
        }
        
        if (items.length > 0) setSuggestions(items);
      } catch (err) {
        console.error('Error fetching dynamic suggestions:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!mounted) {
    return <div className="min-h-screen font-sans bg-[#FDFCFB]"></div>;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-slate-900 bg-[#FDFCFB]">
      
      {/* --- FOND DYNAMIQUE ULTRA-LÉGER (0 Ko de Data) --- */}
      <div className="fixed inset-0 z-0 bg-[#FDFCFB]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-[#128C7E] opacity-95" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      </div>

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
            <div className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-6 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
              <img src="/icon-512.png" className="w-full h-full object-cover" alt="Vestyle" />
            </div>
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
            <form onSubmit={handleSearch} className="bg-white p-1.5 rounded-[22px] shadow-2xl flex flex-col md:flex-row items-center border border-white/50 w-full group focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                onSelect={(s) => setSearchQuery(s.value)}
                suggestions={suggestions} 
                placeholder={locationStatus || "Que recherchez-vous ?"}
                className="flex-1 w-full"
                inputClassName="w-full outline-none text-slate-800 bg-transparent placeholder-slate-400 font-semibold py-4 pl-12 pr-28 text-base"
                dropdownOffset="mt-4"
                leftIcon={<Search className="text-emerald-600 w-5 h-5 opacity-70" />}
              >
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center bg-slate-50/80 backdrop-blur-sm rounded-full p-1.5 border border-slate-100 z-30 shadow-sm">
                  <button 
                    type="button"
                    onClick={() => requestLocation()}
                    className="p-2 text-emerald-600 hover:bg-white hover:text-emerald-700 rounded-full transition-all active:scale-90 flex items-center justify-center"
                    title="Autour de moi"
                  >
                    {isGpsLocating ? <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div> : <MapPin size={22} />}
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1.5 opacity-60"></div>
                  <VoiceSearchButton 
                    onInterimResult={(text) => setSearchQuery(text)}
                    onResult={(text) => setSearchQuery(text)} 
                    className="p-2 text-emerald-600 hover:bg-white hover:text-emerald-700 rounded-full transition-all active:scale-90 flex items-center justify-center"
                  />
                </div>
              </SearchAutocomplete>
              <button type="submit" className="w-full md:w-auto bg-emerald-800 text-white px-10 py-4 rounded-[18px] font-black hover:bg-emerald-900 transition-all shadow-lg mt-2 md:mt-0 md:ml-2 active:scale-95 text-sm uppercase tracking-wider">
                Explorer
              </button>
            </form>

            {/* Trending Tags */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {trendingTags.map((tag, i) => (
                <button 
                  key={tag} 
                  onClick={() => setSearchQuery(tag)}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-xs text-white font-medium transition-all"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </motion.div>
          
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

            {/* ═══ REAL-TIME DISCOVERY ════════════════════════════════════ */}
            <ClientDiscovery 
              externalSearchQuery={searchQuery} 
              onExternalSearchChange={setSearchQuery} 
            />
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
