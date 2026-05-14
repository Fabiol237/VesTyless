'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import VoiceSearchButton from '@/components/VoiceSearchButton';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import ClientDiscovery from '@/components/ClientDiscovery';
import VisualSearchModal from '@/components/VisualSearchModal';
import VestyleLens from '@/components/VestyleLens';
import Link from 'next/link';
import { Search, MapPin, ShoppingBag, ArrowRight, Hash, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDistance } from '@/hooks/useDistance';
import { useOfflineData } from '@/hooks/useOfflineData';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [codeQuery, setCodeQuery] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const router = useRouter();
  const { requestLocation, userLocation, isLocating: isGpsLocating } = useDistance();

  const [suggestions, setSuggestions] = useState([]);
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);
  const [visualResults, setVisualResults] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Cache-First Suggestions
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

  useEffect(() => {
    if (offlineSuggestions) setSuggestions(offlineSuggestions);
  }, [offlineSuggestions]);

  useEffect(() => { setMounted(true); }, []);

  const handleCodeSearch = async (e) => {
    e.preventDefault();
    const code = codeQuery.trim();
    if (code.length !== 5) return;
    setCodeLoading(true);
    const { data } = await supabase.from('stores').select('slug').eq('store_code', code).single();
    if (data) router.push(`/boutique/${data.slug}`);
    else setCodeError('Code inconnu.');
    setCodeLoading(false);
  };

  if (!mounted) return <div className="min-h-screen bg-slate-900" />;

  return (
    <div className="relative min-h-screen w-full font-sans text-slate-900 bg-white">
      {/* Static Background for Performance */}
      <div className="fixed inset-0 z-0 bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-wa-teal opacity-90" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* HERO SECTION - Simplified for speed */}
        <section className="min-h-[90vh] flex flex-col justify-center items-center text-center px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-xl p-10 rounded-[50px] border border-white/10 shadow-2xl mb-10"
          >
            <img src="/icon-192.png" className="w-20 h-20 mx-auto mb-6 rounded-3xl shadow-xl" alt="Vestyle" />
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-2">Ves<span className="text-wa-teal">Tyle</span></h1>
            <p className="text-emerald-100/60 font-black text-[10px] uppercase tracking-[0.4em]">Le Commerce de Proximité</p>
          </motion.div>

          <div className="w-full max-w-2xl px-2">
            <form onSubmit={(e) => e.preventDefault()} className="bg-white p-2 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center border border-white/20 w-full group">
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                suggestions={suggestions}
                placeholder={userLocation ? "Prêt à explorer..." : "Que cherchez-vous ?"}
                className="flex-1 w-full"
                inputClassName="w-full outline-none text-slate-800 bg-transparent font-bold py-4 pl-12 pr-28 text-base"
                leftIcon={<Search className="text-wa-teal w-5 h-5" />}
              >
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center bg-slate-50 rounded-2xl p-1">
                  <button type="button" onClick={() => setVisualSearchOpen(true)} className="p-2.5 text-slate-400 hover:text-wa-teal transition-colors">
                    <Camera size={22} />
                  </button>
                  <button type="button" onClick={() => requestLocation()} className="p-2.5 text-wa-teal">
                    {isGpsLocating ? <div className="w-5 h-5 border-2 border-wa-teal border-t-transparent rounded-full animate-spin" /> : <MapPin size={22} />}
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  <VoiceSearchButton onResult={setSearchQuery} className="p-2.5 text-wa-teal" />
                </div>
              </SearchAutocomplete>
            </form>
          </div>
        </section>

        {/* FEED SECTION */}
        <div className="bg-white rounded-t-[40px] md:rounded-t-[80px] shadow-2xl pt-16 pb-20 px-4 relative z-20">
          <div className="max-w-6xl mx-auto space-y-20">
            
            {/* VIP Code Access */}
            <section className="bg-slate-50 rounded-[40px] p-8 md:p-12 border border-slate-100 flex flex-col lg:flex-row items-center gap-10">
               <div className="flex-1 text-center lg:text-left space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-wa-teal bg-wa-teal/10 px-3 py-1 rounded-full">Accès Privé</span>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Accédez à une boutique</h3>
                  <p className="text-slate-500 font-bold text-sm">Entrez le code à 5 chiffres de votre vendeur.</p>
                  <form onSubmit={handleCodeSearch} className="flex gap-3 max-w-sm mx-auto lg:mx-0">
                    <input
                      type="text"
                      maxLength={5}
                      value={codeQuery}
                      onChange={e => setCodeQuery(e.target.value.replace(/\D/g, ''))}
                      placeholder="00000"
                      className="w-full bg-white border-2 border-transparent focus:border-wa-teal rounded-2xl px-6 py-4 text-3xl font-black text-center outline-none shadow-sm"
                    />
                    <button type="submit" disabled={codeQuery.length !== 5 || codeLoading} className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-wa-teal transition-all disabled:opacity-50">
                      {codeLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                    </button>
                  </form>
                  {codeError && <p className="text-rose-500 text-[10px] font-black uppercase">{codeError}</p>}
               </div>
               <div className="hidden lg:block w-px h-32 bg-slate-200" />
               <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                     <div className="w-12 h-12 bg-wa-teal/10 text-wa-teal rounded-2xl flex items-center justify-center">
                        <ShoppingBag size={24} />
                     </div>
                     <div>
                        <h4 className="font-black text-slate-900">VesTyle Pro</h4>
                        <p className="text-xs text-slate-400 font-bold">Commerce de proximité</p>
                     </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">Découvrez les meilleures boutiques de votre ville et commandez en un clic avec suivi en temps réel.</p>
               </div>
            </section>

            {/* Main Discovery Feed */}
            <div id="discovery-section" className="scroll-mt-20">
               <ClientDiscovery
                 externalSearchQuery={searchQuery}
                 onExternalSearchChange={setSearchQuery}
                 overrideProducts={visualResults}
                 onClearVisualSearch={() => setVisualResults(null)}
               />
            </div>
          </div>
        </div>

        <footer className="bg-slate-900 text-white py-20 px-6">
          <div className="max-w-6xl mx-auto flex flex-col items-center gap-10">
            <h2 className="text-4xl font-black tracking-tighter">Ves<span className="text-wa-teal">Tyle</span></h2>
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-500">
               <Link href="/login" className="hover:text-wa-teal">Vendre sur Vestyle</Link>
               <Link href="/suivi" className="hover:text-wa-teal">Suivre une commande</Link>
               <Link href="#" className="hover:text-wa-teal">Aide</Link>
            </div>
            <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.5em]">Cameroun Excellence • {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>

      {visualSearchOpen && <VisualSearchModal onClose={() => setVisualSearchOpen(false)} onResultsFound={setVisualResults} />}
    </div>
  );
}
