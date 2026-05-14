'use client';
import { useState, useEffect, memo } from 'react';
import Link from 'next/link';

// Essential UI Icons (Optimized SVGs)
const MapPinIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const SparklesIcon = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.91 5.81L19 12l-5.09 3.19L12 21l-1.91-5.81L5 12l5.09-3.19L12 3Z" /></svg>
);
const ShoppingBagIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
);

const ProductCard = memo(({ item, idx, trackProductView, formatDistance }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!item) return <div className="w-full aspect-square bg-slate-100 animate-pulse rounded-3xl" />;

  const imageUrl = (item.images && item.images.length > 0) ? item.images[0] : (item.image_url || '/placeholder-product.png');

  return (
    <Link
      href={`/produit/${item.id}`}
      onClick={() => trackProductView && trackProductView(item.id, item.category_id)}
      className="group relative flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden transition-transform duration-300 active:scale-[0.98] will-change-transform"
    >
      {/* IMAGE CONTAINER */}
      <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
        <img
          src={imageUrl}
          alt={item.name}
          loading={idx < 4 ? "eager" : "lazy"}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {!imgLoaded && <div className="absolute inset-0 bg-slate-50 animate-pulse" />}

        {/* PROMO / BOOST BADGE */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {item.is_promo && (
            <div className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-lg shadow-sm">PROMO</div>
          )}
          {item.is_boosted && (
            <div className="bg-wa-teal text-white text-[8px] font-black px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
              <SparklesIcon /> BOOST
            </div>
          )}
        </div>
      </div>

      {/* TEXT CONTENT */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <div className="w-4 h-4 rounded-md overflow-hidden bg-slate-100 border border-slate-50 flex-shrink-0">
               <img src={item.stores?.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover" alt="" />
            </div>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate">{item.stores?.name}</span>
          </div>
          {formatDistance && item.stores?.latitude && (
            <div className="text-[8px] font-black text-wa-teal flex items-center gap-1 px-1.5 py-0.5 bg-wa-teal/5 rounded-md">
              <MapPinIcon /> {formatDistance(item.stores.latitude, item.stores.longitude)}
            </div>
          )}
        </div>

        <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight mb-3 min-h-[2.5em]">
          {item.name}
        </h3>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[13px] font-black text-slate-900 tracking-tight">
              {Number(item.price).toLocaleString()} <span className="text-[9px] text-slate-400 font-bold ml-0.5">F</span>
            </span>
          </div>
          <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center group-hover:bg-wa-teal transition-colors shadow-md">
            <ShoppingBagIcon />
          </div>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
