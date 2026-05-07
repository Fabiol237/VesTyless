'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUserPreferences } from '@/hooks/useUserPreferences';

// Icons
const UserIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const XIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const TrashIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const HistoryIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);
const HeartIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);

export default function UserPanel({ isOpen, onClose }) {
  const { history, favorites, searches, clearAll } = useUserPreferences();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-wa-teal text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg">Mon Profil</h3>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Client VesTyle</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <XIcon size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
              
              {/* Recently Viewed */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <HistoryIcon size={14} /> Récemment vus
                  </h4>
                  {history.length > 0 && (
                    <button onClick={clearAll} className="text-[10px] font-bold text-red-500 hover:underline">Effacer</button>
                  )}
                </div>
                {history.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {history.map((item) => (
                      <Link 
                        key={item.id} 
                        href={`/produit/${item.id}`}
                        onClick={onClose}
                        className="flex items-center gap-4 p-2 rounded-2xl hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-100 group"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                          <img src={item.image_url || '/placeholder-product.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-neutral-900 truncate">{item.name}</p>
                          <p className="text-xs font-bold text-wa-teal">{Number(item.price).toLocaleString('fr-FR')} F</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-100">
                    <p className="text-xs font-bold text-neutral-400">Aucun historique pour l'instant.</p>
                  </div>
                )}
              </section>

              {/* Favorite Stores */}
              <section className="space-y-4">
                <h4 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <HeartIcon size={14} className="text-rose-500 fill-rose-500" /> Boutiques favorites
                </h4>
                {favorites.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {favorites.map((store) => (
                      <Link 
                        key={store.id} 
                        href={`/boutique/${store.slug}`}
                        onClick={onClose}
                        className="flex-shrink-0 flex flex-col items-center w-16 group"
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-100 group-hover:border-wa-teal transition-all p-1">
                          <img src={store.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover rounded-full" alt="" />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-800 mt-2 truncate w-full text-center">{store.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-100">
                    <p className="text-xs font-bold text-neutral-400">Ajoutez des boutiques en favoris !</p>
                  </div>
                )}
              </section>

              {/* Recent Searches */}
              <section className="space-y-4">
                <h4 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em]">Recherches récentes</h4>
                {searches.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {searches.map((q, idx) => (
                      <Link 
                        key={idx} 
                        href={`/search?q=${encodeURIComponent(q)}`}
                        onClick={onClose}
                        className="px-4 py-2 bg-neutral-100 rounded-full text-xs font-bold text-neutral-600 hover:bg-wa-teal/10 hover:text-wa-teal transition-all"
                      >
                        {q}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-neutral-300">Pas de recherches récentes.</p>
                )}
              </section>

            </div>

            {/* Footer */}
            <div className="p-6 bg-neutral-50 border-t border-neutral-100 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-500 px-2">
                <span>Mode Sombre</span>
                <div className="w-10 h-5 bg-neutral-200 rounded-full relative p-1 cursor-not-allowed opacity-50">
                  <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <p className="text-[10px] text-neutral-400 text-center font-medium leading-relaxed italic px-4">
                "Vos données sont stockées localement dans votre navigateur pour une confidentialité totale."
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
