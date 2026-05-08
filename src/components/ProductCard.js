'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Helper icons (Inlined for speed)
const MapPinIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
const SparklesIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3 1.91 5.81L19 12l-5.09 3.19L12 21l-1.91-5.81L5 12l5.09-3.19L12 3Z"/></svg>
);
const ZapIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);

export default function ProductCard({ item, idx, trackProductView, formatDistance }) {
  const [dataSaver, setDataSaver] = useState(false);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const checkDataSaver = () => {
      const saved = localStorage.getItem('vestyle_data_saver') === 'true';
      setDataSaver(saved);
      if (!saved) setShowImage(true);
    };
    checkDataSaver();
    window.addEventListener('storage', checkDataSaver);
    return () => window.removeEventListener('storage', checkDataSaver);
  }, []);

  if (!item) return <div className="w-full aspect-square bg-neutral-100 animate-pulse rounded-3xl" />;

  return (
    <Link
      href={`/produit/${item.id}`}
      onClick={() => trackProductView && trackProductView(item.id)}
      className="group relative flex flex-col bg-white rounded-3xl border border-neutral-100 overflow-hidden transition-all duration-300 hover:border-wa-teal animate-fade-in"
      style={{ animationDelay: `${(idx || 0) * 30}ms` }}
    >
      <div className="relative w-full aspect-square bg-neutral-100 overflow-hidden flex items-center justify-center">
        {/* CHARGEMENT CONDITIONNEL DES IMAGES */}
        {showImage ? (
          <img 
            src={item.image_url || '/placeholder-product.png'} 
            alt={item.name} 
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <button 
            onClick={(e) => { e.preventDefault(); setShowImage(true); }}
            className="flex flex-col items-center gap-2 p-4 text-neutral-400 hover:text-wa-teal transition-colors"
          >
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center">
              <ZapIcon size={18} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-center">Charger l'image<br/>(Éco DATA)</span>
          </button>
        )}
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.is_promo && (
            <div className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-lg">PROMO</div>
          )}
          {item.is_boosted && (
            <div className="bg-wa-teal text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-lg flex items-center gap-1">
              <SparklesIcon size={8} /> SPONSORISÉ
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-neutral-400 uppercase truncate flex-1">
            {item.stores?.name || item.store_name}
          </div>
          {formatDistance && item.stores?.latitude && (
            <div className="text-[10px] font-black text-wa-teal bg-wa-teal/5 px-2 rounded-md flex items-center gap-1">
              <MapPinIcon size={10} /> {formatDistance(item.stores.latitude, item.stores.longitude)}
            </div>
          )}
        </div>
        
        <h3 className="text-sm font-bold text-neutral-900 line-clamp-2 leading-snug mb-2">
          {item.name}
        </h3>
        
        <div className="mt-auto pt-3 border-t border-neutral-50 flex items-center justify-between">
          <span className="text-base font-black text-wa-teal">{Number(item.price).toLocaleString('fr-FR')} F</span>
          <ZapIcon size={14} className="text-orange-400 opacity-50" />
        </div>
      </div>
    </Link>
  );
}
