'use client';
import { useState, useEffect } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Icons
const HistoryIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);
const HeartIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);
const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);
const TrashIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const SparklesIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.91 5.81L19 12l-5.09 3.19L12 21l-1.91-5.81L5 12l5.09-3.19L12 3Z"/></svg>
);

export default function ProfilePage() {
  const { history, favorites, searches, clearAll } = useUserPreferences();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <main className="min-h-screen bg-[#FDFCFB] font-sans">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl">
          <div className="absolute top-20 left-10 w-64 h-64 bg-wa-teal/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-wa-green/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-neutral-100 text-wa-teal text-xs font-black uppercase tracking-widest"
          >
            <SparklesIcon size={14} /> Votre Espace Privé
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight"
          >
            Heureux de vous <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-wa-teal to-emerald-500 italic">revoir.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 font-medium text-lg max-w-2xl mx-auto"
          >
            Retrouvez vos boutiques coup de cœur et les produits qui vous ont fait craquer. Tout est là, rien que pour vous.
          </motion.p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-32 space-y-24">
        
        {/* --- RECENTLY VIEWED (GRID) --- */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <HistoryIcon className="text-wa-teal" /> Produits Récents
              </h2>
              <p className="text-sm font-bold text-slate-400">Ceux que vous avez consulté dernièrement</p>
            </div>
            {history.length > 0 && (
              <button 
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-xs font-black hover:bg-rose-500 hover:text-white transition-all group"
              >
                <TrashIcon size={14} className="group-hover:rotate-12 transition-transform" /> Effacer tout
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {history.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link 
                    href={`/produit/${item.id}`}
                    className="group flex flex-col space-y-4"
                  >
                    <div className="aspect-[4/5] bg-white rounded-[32px] overflow-hidden border border-neutral-100 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-500 p-2">
                      <div className="w-full h-full rounded-[24px] overflow-hidden">
                        <img src={item.image_url || '/placeholder-product.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm truncate">{item.name}</h3>
                      <p className="text-wa-teal font-bold text-xs">{Number(item.price).toLocaleString('fr-FR')} F</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-[40px] border-4 border-dashed border-slate-50 flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <HistoryIcon size={40} />
              </div>
              <div className="space-y-1">
                <p className="font-black text-xl text-slate-900">Aucun historique pour le moment</p>
                <p className="text-slate-400 font-bold text-sm">Explorez le marché pour remplir cet espace !</p>
              </div>
              <Link href="/" className="px-8 py-3 bg-wa-teal text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-wa-teal/20 hover:scale-105 active:scale-95 transition-all">Découvrir</Link>
            </div>
          )}
        </div>

        {/* --- FAVORITE STORES (PREMIUM LIST) --- */}
        <div className="space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <HeartIcon className="text-rose-500 fill-rose-500" /> Vos Boutiques
            </h2>
            <p className="text-sm font-bold text-slate-400">Celles que vous suivez de près</p>
          </div>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {favorites.map((store, idx) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    href={`/boutique/${store.slug}`}
                    className="flex items-center gap-6 p-6 bg-white rounded-[32px] border border-neutral-100 shadow-sm hover:shadow-2xl hover:border-wa-teal/20 transition-all duration-500 group"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-slate-50 group-hover:border-wa-teal/10 transition-colors p-1">
                      <img src={store.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover rounded-full" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-900 text-lg truncate group-hover:text-wa-teal transition-colors">{store.name}</h3>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{store.city || 'Douala'}</p>
                      <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-wa-teal bg-wa-teal/5 px-2 py-1 rounded-lg">
                        OUVERT MAINTENANT
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-[40px] border border-slate-100 flex flex-col items-center gap-4 shadow-sm">
               <HeartIcon size={32} className="text-slate-200" />
               <p className="text-slate-400 font-bold">Vous n'avez pas encore de favoris.</p>
            </div>
          )}
        </div>

        {/* --- SEARCH HISTORY & STATS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 border-t border-slate-100">
          
          {/* Recent Searches */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recherches Récentes</h3>
            {searches.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {searches.map((q, idx) => (
                  <Link 
                    key={idx} 
                    href={`/search?q=${encodeURIComponent(q)}`}
                    className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-wa-teal hover:text-white hover:border-wa-teal transition-all shadow-sm"
                  >
                    {q}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm font-bold text-slate-300">Rien à afficher ici.</p>
            )}
          </div>

          {/* Stats / Info */}
          <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-wa-teal/20 blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10 space-y-6">
              <h3 className="text-xs font-black text-wa-teal uppercase tracking-[0.2em]">Votre Expérience</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-4xl font-black">{history.length}</p>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Vues de produits</p>
                </div>
                <div>
                  <p className="text-4xl font-black">{favorites.length}</p>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Favoris suivis</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-xs font-medium text-white/60 leading-relaxed italic">
                  "Ces données sont stockées localement sur votre appareil. Seul vous pouvez y accéder. C'est notre engagement pour votre vie privée."
                </p>
              </div>
            </div>
          </div>

        </div>

      </section>

      <Footer />
    </main>
  );
}
