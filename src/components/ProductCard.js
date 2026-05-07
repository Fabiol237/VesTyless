'use client';
import Link from 'next/link';

// Helper icons
const MapPinIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
const SparklesIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3 1.91 5.81L19 12l-5.09 3.19L12 21l-1.91-5.81L5 12l5.09-3.19L12 3Z"/></svg>
);
const ChevronRightIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);
const ZapIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const StarIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

export default function ProductCard({ item, idx, trackProductView, formatDistance }) {
  const rating = item.rating || 4.5;
  const reviewsCount = item.reviews_count || 0;
  const discount = item.discount_percentage || 0;

  return (
    <Link
      href={`/produit/${item.id}`}
      onClick={() => trackProductView && trackProductView(item.id)}
      className="group relative flex flex-col bg-white rounded-3xl border border-neutral-100 overflow-hidden hover:shadow-2xl hover:shadow-wa-teal/10 transition-all duration-500 hover:-translate-y-1 animate-fade-in"
      style={{ animationDelay: `${(idx || 0) * 50}ms` }}
    >
      <div className="relative w-full aspect-square bg-neutral-50 overflow-hidden">
        <img src={item.image_url || '/placeholder-product.png'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.is_promo && (
            <div className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg">
              PROMO {discount > 0 ? `-${discount}%` : ''}
            </div>
          )}
          {item.is_boosted && (
            <div className="bg-wa-teal text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
              <SparklesIcon size={10} /> SPONSORISÉ
            </div>
          )}
        </div>

        <div className="absolute bottom-3 right-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
           <div className="w-10 h-10 bg-white text-neutral-900 rounded-full flex items-center justify-center shadow-xl hover:bg-wa-teal hover:text-white transition-colors">
             <ChevronRightIcon size={20} />
           </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
              <img src={item.stores?.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider truncate flex-1">
              {item.stores?.name || item.store_name}
            </div>
            {formatDistance && item.stores?.latitude && (
              <div className="text-[10px] font-black text-wa-teal bg-wa-teal/10 px-2 py-0.5 rounded-md flex items-center gap-1 whitespace-nowrap">
                <MapPinIcon size={10} /> {formatDistance(item.stores.latitude, item.stores.longitude)}
              </div>
            )}
          </div>
          <h3 className="text-base font-black text-neutral-900 group-hover:text-wa-teal transition-colors line-clamp-2 leading-tight">
            {item.name}
          </h3>
          
          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} size={12} className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'} />
            ))}
            <span className="text-[10px] font-bold text-neutral-400 ml-1">({reviewsCount})</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex flex-col">
            {discount > 0 && (
               <span className="text-xs text-neutral-400 font-medium line-through">
                 {(Number(item.price) * (1 + discount/100)).toLocaleString('fr-FR')} F
               </span>
            )}
            <span className="text-lg font-black text-neutral-900">{Number(item.price).toLocaleString('fr-FR')} F</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-50 text-neutral-500 text-[10px] font-bold">
              <ZapIcon size={12} className="text-orange-500" /> Populaire
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
