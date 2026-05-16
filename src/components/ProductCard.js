'use client';
import { useState, memo } from 'react';
import Link from 'next/link';
import { ShoppingCart, CheckCircle2, Zap, MapPin, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const ProductCard = memo(({ item, idx, trackProductView, formatDistance }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  if (!item) return <div className="w-full aspect-square bg-neutral-100 animate-pulse rounded-3xl" />;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  const imageUrl = item.image_url || '/placeholder-product.png';

  return (
    <div className="group relative flex flex-col bg-white rounded-[2rem] border border-neutral-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-wa-teal/30 active:scale-[0.98]">
      {/* IMAGE CONTAINER */}
      <Link 
        href={`/produit/${item.id}`}
        onClick={() => trackProductView && trackProductView(item.id, item.category_id)}
        className="relative w-full aspect-[4/5] bg-neutral-50 overflow-hidden flex items-center justify-center"
      >
        <img
          src={imageUrl}
          alt={item.name}
          loading={idx < 6 ? "eager" : "lazy"}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {!imgLoaded && <div className="absolute inset-0 bg-neutral-50 animate-pulse" />}

        {/* BADGES PREMIUM */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {item.is_promo && <span className="bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-xl uppercase tracking-wider">Promo</span>}
          {item.is_boosted && <span className="bg-wa-teal text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-xl flex items-center gap-1 uppercase tracking-wider"><Zap size={8} />Boost</span>}
        </div>

        {/* OVERLAY ON HOVER */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* TEXT CONTENT */}
      <div className="p-4 flex flex-col flex-1 bg-white relative">
        {/* STORE INFO */}
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-neutral-100 border border-neutral-100 flex-shrink-0">
                <img src={item.stores?.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover" alt="" />
              </div>
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter truncate">{item.stores?.name}</span>
           </div>
           {formatDistance && item.stores?.latitude && (
             <div className="text-[9px] font-black text-wa-teal flex items-center gap-1 px-2 py-0.5 bg-wa-teal/5 rounded-full border border-wa-teal/10">
               <MapPin size={8} /> {formatDistance(item.stores.latitude, item.stores.longitude)}
             </div>
           )}
        </div>

        <Link href={`/produit/${item.id}`}>
          <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2 leading-snug mb-3 group-hover:text-wa-teal transition-colors h-[2.8em]">
            {item.name}
          </h3>
        </Link>

        {/* PRICE & ACTION */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-neutral-50">
          <div className="flex flex-col">
             <span className="text-sm sm:text-base font-black text-slate-900 tracking-tighter">
               {Number(item.price).toLocaleString()} <span className="text-[10px] text-neutral-400 ml-0.5 font-bold">F</span>
             </span>
          </div>
          
          <button 
            onClick={handleAdd}
            className={`w-11 h-11 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${added ? 'bg-green-500 text-white' : 'bg-wa-teal text-white hover:bg-wa-teal-dark shadow-wa-teal/20'}`}
          >
            {added ? <CheckCircle2 size={20} /> : <ShoppingCart size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
