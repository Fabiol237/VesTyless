'use client';
import { useState, memo, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check, MapPin, Star, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { triggerFeedback } from '@/lib/haptic';
import { usePrefetch } from '@/hooks/usePrefetch';
import ProductVideoModal from '@/components/ProductVideoModal';

const ProductCard = memo(({ item, idx, trackProductView, formatDistance, locationFlash = false, onLocationClick }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const { addToCart } = useCart();
  const { prefetchProduct, prefetchStore } = usePrefetch();

  useEffect(() => {
    if (!locationFlash) return;
    let count = 0;
    setBadgeVisible(true);
    const interval = setInterval(() => {
      count++;
      setBadgeVisible(v => !v);
      if (count >= 14) {
        clearInterval(interval);
        setBadgeVisible(true);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [locationFlash]);

  if (!item) return (
    <div className="w-full rounded-3xl bg-slate-100 animate-pulse overflow-hidden h-80" />
  );

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    triggerFeedback('success');
    addToCart({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      image_url: item.image_url,
      store_id: item.store_id,
      category_id: item.category_id
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleLocationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    triggerFeedback('pop');
    if (onLocationClick && item.stores) {
      onLocationClick({ ...item.stores });
    }
  };

  const imageUrl = item.image_url || '/placeholder-product.png';
  const distanceText = formatDistance && item.stores?.latitude
    ? formatDistance(item.stores.latitude, item.stores.longitude)
    : null;

  const formattedPrice = new Intl.NumberFormat('fr-FR').format(Number(item.price));
  const formattedOrigPrice = item.original_price && item.original_price > item.price
    ? new Intl.NumberFormat('fr-FR').format(Number(item.original_price))
    : null;

  return (
    <div className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100/90 shadow-xs hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 active:scale-[0.99]">
      
      {/* ── EN-TÊTE BOUTIQUE DISCRET & ÉLÉGANT ────────────────────────────────── */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 text-white relative z-10">
        <Link
          href={item.stores?.slug ? `/boutique/${item.stores.slug}` : '#'}
          onMouseEnter={() => item.stores?.slug && prefetchStore(item.stores.slug)}
          onTouchStart={() => item.stores?.slug && prefetchStore(item.stores.slug)}
          className="flex items-center gap-2 min-w-0 group/store hover:opacity-90 transition-opacity"
        >
          <div className="w-6 h-6 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
            {item.stores?.logo_url ? (
              <img
                src={item.stores.logo_url}
                alt={item.stores.name || ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px]">🏪</div>
            )}
          </div>
          <span className="text-[11px] font-extrabold truncate text-slate-100 group-hover/store:text-emerald-400 transition-colors">
            {item.stores?.name || 'Boutique'}
          </span>
        </Link>

        {distanceText && (
          <button
            onClick={handleLocationClick}
            title="Voir sur la carte"
            className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black tracking-tight transition-all ${
              badgeVisible
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                : 'bg-emerald-500/40 text-emerald-300 border border-emerald-500/60 opacity-30'
            } hover:bg-emerald-500 hover:text-white`}
          >
            <MapPin size={9} />
            {distanceText}
          </button>
        )}
      </div>

      {/* ── CONTENEUR IMAGE GRAND FORMAT (4:3 / 1:1 flexible) ──────────────────── */}
      <Link
        href={`/produit/${item.id}`}
        onMouseEnter={() => prefetchProduct(item.id)}
        onTouchStart={() => prefetchProduct(item.id)}
        onClick={() => trackProductView && trackProductView(item.id, item.category_id)}
        className="relative w-full aspect-[4/3] sm:aspect-square bg-slate-50 overflow-hidden flex items-center justify-center"
      >
        <img
          src={imageUrl}
          alt={item.name}
          loading={idx < 6 ? 'eager' : 'lazy'}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {!imgLoaded && <div className="absolute inset-0 bg-slate-100 animate-pulse" />}

        {/* Badges promo / boost */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {item.is_promo && (
            <span className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black px-2.5 py-1 rounded-xl shadow-md uppercase tracking-wider">
              <Star size={8} fill="white" /> Promo
            </span>
          )}
          {item.is_boosted && (
            <span className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-black px-2.5 py-1 rounded-xl shadow-md uppercase tracking-wider">
              <Zap size={8} fill="white" /> Top
            </span>
          )}
        </div>

        {/* Badge 🎥 Vidéo 15s */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowVideoModal(true);
          }}
          className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1 bg-slate-900/80 hover:bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-lg transition-all active:scale-95 group/vid border border-white/20"
          title="Voir la démo en vidéo 15s"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          🎥 15s
        </button>

        {/* Dynamic gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Modal Vidéo Shorts 15s */}
      <ProductVideoModal
        product={item}
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />

      {/* ── INFOS & CTA PRODUIT ────────────────────────────────────────────────── */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 bg-white justify-between space-y-3">
        <div>
          {/* Nom du produit */}
          <Link href={`/produit/${item.id}`}>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
              {item.name}
            </h3>
          </Link>
          {item.stores?.city && (
            <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
              <MapPin size={9} /> {item.stores.city}
            </p>
          )}
        </div>

        {/* Prix & Bouton Ajouter au Panier */}
        <div className="flex items-end justify-between pt-2 border-t border-slate-100">
          <div>
            {formattedOrigPrice && (
              <span className="block text-[11px] font-bold text-slate-400 line-through">
                {formattedOrigPrice} FCFA
              </span>
            )}
            <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none">
              {formattedPrice} <span className="text-[10px] text-blue-600 font-extrabold">FCFA</span>
            </div>
          </div>

          <button
            onClick={handleAdd}
            aria-label="Ajouter au panier"
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-90 ${
              added
                ? 'bg-emerald-500 text-white shadow-emerald-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {added ? <Check size={18} strokeWidth={3} /> : <ShoppingBag size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
