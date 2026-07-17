'use client';
import { useState, memo, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, CheckCircle2, Zap, MapPin, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { triggerFeedback } from '@/lib/haptic';

const ProductCard = memo(({ item, idx, trackProductView, formatDistance, locationFlash = false, onLocationClick }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const { addToCart } = useCart();

  // ── Clignotement 7× quand la localisation s'active ───────────────────────────
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
    <div className="w-full rounded-[2rem] bg-neutral-100 animate-pulse overflow-hidden" style={{ height: 340 }} />
  );

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    triggerFeedback('success'); // vibration ferme + ding
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

  // ── Click sur badge distance → ouvre carte boutique ────────────────────────
  const handleLocationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    triggerFeedback('pop'); // vibration micro-clic + pop
    if (onLocationClick && item.stores) {
      onLocationClick({ ...item.stores });
    }
  };

  const imageUrl = item.image_url || '/placeholder-product.png';
  const distanceText = formatDistance && item.stores?.latitude
    ? formatDistance(item.stores.latitude, item.stores.longitude)
    : null;

  return (
    <div className="group relative flex flex-col bg-white rounded-[1.75rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] hover:-translate-y-1 border border-neutral-100/80 active:scale-[0.98]">

      {/* ── BANDEAU BOUTIQUE EN HAUT ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-950 border-b border-slate-800/80 relative overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#128C7E]/10 to-transparent pointer-events-none" />

        {/* Logo boutique */}
        <div className="relative w-8 h-8 rounded-xl overflow-hidden border-2 border-[#25D366]/30 flex-shrink-0 bg-slate-800">
          <img
            src={item.stores?.logo_url || '/placeholder-store.png'}
            alt={item.stores?.name || ''}
            className="w-full h-full object-cover"
          />
          {/* Live dot */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#25D366] border-2 border-slate-950" />
        </div>

        {/* Nom boutique + ville */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-[11px] leading-none truncate">
            {item.stores?.name || 'Boutique'}
          </p>
          {item.stores?.city && (
            <p className="text-slate-500 text-[9px] font-mono truncate mt-0.5 flex items-center gap-1">
              <MapPin size={7} /> {item.stores.city}
            </p>
          )}
        </div>

        {/* ── Badge distance CLIQUABLE + CLIGNOTANT ── */}
        {distanceText && (
          <button
            onClick={handleLocationClick}
            title="Voir sur la carte"
            style={{ transition: 'opacity 0.15s, box-shadow 0.3s' }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9px] font-black cursor-pointer active:scale-90 transition-all duration-150 ${
              badgeVisible
                ? 'bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 shadow-[0_0_10px_rgba(37,211,102,0.35)] opacity-100'
                : 'bg-[#25D366]/40 text-[#25D366] border border-[#25D366]/60 shadow-[0_0_18px_rgba(37,211,102,0.6)] opacity-20'
            } hover:bg-[#25D366] hover:text-white hover:border-[#25D366] hover:shadow-[0_0_20px_rgba(37,211,102,0.5)]`}
          >
            <MapPin size={9} />
            {distanceText}
          </button>
        )}
      </div>

      {/* ── IMAGE PRODUIT ─────────────────────────────────────────────────────── */}
      <Link
        href={`/produit/${item.id}`}
        onClick={() => trackProductView && trackProductView(item.id, item.category_id)}
        className="relative w-full overflow-hidden bg-neutral-50 flex items-center justify-center"
        style={{ aspectRatio: '1 / 1' }}
      >
        <img
          src={imageUrl}
          alt={item.name}
          loading={idx < 6 ? 'eager' : 'lazy'}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {!imgLoaded && <div className="absolute inset-0 bg-neutral-100 animate-pulse" />}

        {/* Badges produit */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {item.is_promo && (
            <span className="flex items-center gap-1 bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-xl uppercase tracking-wider">
              <Star size={7} fill="white" /> Promo
            </span>
          )}
          {item.is_boosted && (
            <span className="flex items-center gap-1 bg-[#128C7E] text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-xl uppercase tracking-wider">
              <Zap size={7} fill="white" /> Boost
            </span>
          )}
        </div>

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* ── INFOS PRODUIT ─────────────────────────────────────────────────────── */}
      <div className="p-3.5 flex flex-col flex-1 bg-white">
        <Link href={`/produit/${item.id}`}>
          <h3 className="text-xs sm:text-[13px] font-black text-slate-900 line-clamp-2 leading-snug mb-3 group-hover:text-[#128C7E] transition-colors" style={{ minHeight: '2.6em' }}>
            {item.name}
          </h3>
        </Link>

        {/* Prix + Panier */}
        <div className="flex items-center justify-between border-t border-neutral-50 pt-3 mt-auto">
          <div>
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tighter leading-none">
              {Number(item.price).toLocaleString()}
            </span>
            <span className="text-[10px] text-neutral-400 ml-1 font-bold">F</span>
          </div>
          <button
            onClick={handleAdd}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-90 ${
              added
                ? 'bg-green-500 text-white shadow-green-200'
                : 'bg-[#128C7E] text-white hover:bg-[#0f7368] shadow-[#128C7E]/20'
            }`}
          >
            {added ? <CheckCircle2 size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
