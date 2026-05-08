'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShoppingCart, Store, ArrowLeft, ArrowRight, Loader2, Heart, Share2, ShieldCheck, Truck, Plus, Minus, Star, Navigation, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { useDistance } from '@/hooks/useDistance';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-neutral-100 animate-pulse flex items-center justify-center text-xs font-black uppercase tracking-widest text-neutral-400 text-center p-8">Calcul de l'itinéraire optimal...</div>
});

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showRoute, setShowRoute] = useState(false);
  const { userLocation, requestLocation, formatDistance } = useDistance();
  const { addToHistory, toggleFavorite, favorites } = useUserPreferences();
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, stores(*)')
          .eq('id', id)
          .single();

        if (data) {
          setProduct(data);
          addToHistory({
            id: data.id,
            name: data.name,
            price: data.price,
            image_url: data.image_url
          });
          // Fetch related products
          const { data: related } = await supabase
            .from('products')
            .select('*, stores(name, slug, logo_url, city)')
            .eq('category_id', data.category_id)
            .neq('id', data.id)
            .limit(4);
          setRelatedProducts(related || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    setAddingToCart(true);
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setTimeout(() => {
      setAddingToCart(false);
    }, 1000);
  };

  if (loading) {
    return (
      <main className="bg-wa-bg min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-wa-teal" size={48} /></div>
      </main>
    );
  }

  if (!product) {
    return (
       <main className="bg-wa-bg min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
           <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm"><ShoppingCart size={40} className="text-neutral-400" /></div>
           <h1 className="text-3xl font-bold text-wa-teal-dark mb-2">Produit introuvable</h1>
           <p className="text-neutral-500 mb-8 max-w-md">Le produit que vous cherchez n&apos;existe plus ou l&apos;URL est incorrecte.</p>
           <button onClick={() => router.back()} className="px-8 py-3.5 bg-wa-teal text-white font-bold rounded-xl hover:bg-wa-teal-dark transition-colors flex items-center gap-2"><ArrowLeft size={20}/> Retourner</button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 pt-28 pb-20">
        <button onClick={() => router.back()} className="text-sm font-bold text-neutral-500 hover:text-neutral-900 mb-8 flex items-center gap-2 transition-colors">
          <ArrowLeft size={16} /> Retour
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row gap-10 lg:gap-16"
        >
          {/* IMAGE SECTION */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
             <div className="aspect-[4/5] bg-neutral-50 rounded-[40px] overflow-hidden border border-neutral-100 relative group shadow-2xl">
                <motion.img 
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  src={product.image_url || "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800"} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md text-neutral-600 hover:text-red-500 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95">
                  <Heart size={24} />
                </button>
             </div>
             {/* Thumbnail placeholders if multiple images existed */}
             <div className="flex gap-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-wa-teal p-0.5 overflow-hidden cursor-pointer shadow-md">
                   <img src={product.image_url || "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800"} className="w-full h-full object-cover rounded-xl" alt="" />
                </div>
             </div>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="w-full lg:w-1/2 flex flex-col py-2">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-wa-teal px-4 py-1.5 bg-wa-teal/10 rounded-full">{product.category || 'EXCLUSIVITÉ'}</span>
                   {product.is_promo && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 px-4 py-1.5 bg-orange-50 rounded-full">Offre Spéciale</span>}
                 </div>
                 <button className="text-neutral-400 hover:text-wa-teal-dark flex items-center gap-2 text-xs font-black transition-colors uppercase tracking-widest">
                   <Share2 size={16} /> Partager
                 </button>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-8">
                <p className="text-4xl font-black text-emerald-700">
                  {Number(product.price).toLocaleString('fr-FR')} <span className="text-sm font-bold text-slate-400 ml-1">FCFA</span>
                </p>
                <div className="h-6 w-px bg-slate-200"></div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < 4 ? "fill-amber-400 text-amber-400" : "text-slate-200"} />)}
                  <span className="text-xs font-bold text-slate-400 ml-1">(12 avis)</span>
                </div>
              </div>
            </div>

            {/* Store Card / Location */}
            <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-6 mb-10 flex flex-col sm:flex-row items-center gap-5 hover:border-wa-teal/30 transition-all hover:bg-white hover:shadow-xl group relative overflow-hidden">
                <Link href={`/boutique/${product.stores?.slug}`} className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm z-10">
                  {product.stores?.logo_url ? <img src={product.stores?.logo_url} alt={product.stores?.name} className="w-full h-full object-cover" /> : <Store className="text-slate-400" size={28} />}
                </Link>
              <div className="flex-1 text-center sm:text-left z-10">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Boutique Partenaire</p>
                 <Link href={`/boutique/${product.stores?.slug}`} className="text-xl font-black text-slate-900 hover:text-wa-teal transition-colors block leading-tight">
                   {product.stores?.name}
                 </Link>
                 <div className="flex items-center justify-center sm:justify-start gap-4 mt-1.5">
                   <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 uppercase tracking-wide italic"><Store size={14}/> {product.stores?.city || 'Douala'}</p>
                   {product.stores?.latitude && (
                     <p className="text-xs font-black text-slate-400 flex items-center gap-1">
                       <MapPin size={12} className="text-wa-teal" /> 
                       {formatDistance(product.stores.latitude, product.stores.longitude)}
                     </p>
                   )}
                 </div>
              </div>
              {product.stores?.latitude && product.stores?.longitude && (
                <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      requestLocation();
                      setShowRoute(true);
                    }}
                    className="w-full sm:w-auto px-6 py-4 bg-wa-teal text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-wa-teal/20 hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
                    S&apos;y rendre
                  </button>

                  <button 
                    onClick={() => toggleFavorite(product.stores)}
                    className={`p-4 rounded-2xl transition-all shadow-sm flex items-center justify-center ${favorites.some(s => s.id === product.stores?.id) ? 'bg-rose-500 text-white' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={favorites.some(s => s.id === product.stores?.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  </button>

                  <Link href={`/boutique/${product.stores?.slug}`} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm hidden sm:block">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-8 mb-10">
              <div>
                <h3 className="text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Description du produit</h3>
                <p className="text-slate-600 leading-relaxed text-base font-medium">{product.description || "Une pièce d'exception sélectionnée avec soin par nos experts."}</p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-6 mb-10">
               <div className="flex items-center bg-slate-100 rounded-2xl p-1.5">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white transition-colors text-slate-600 active:scale-90"><Minus size={18}/></button>
                  <span className="w-12 text-center font-black text-lg text-slate-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white transition-colors text-slate-600 active:scale-90"><Plus size={18}/></button>
               </div>
               <p className="text-sm font-bold text-slate-400 italic">En stock (Livraison immédiate)</p>
            </div>

            <div className="flex flex-col gap-4">
               <button 
                 onClick={handleAddToCart}
                 className={`w-full py-5 rounded-[24px] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl ${addingToCart ? 'bg-emerald-600 text-white scale-[0.97]' : 'bg-wa-teal text-white hover:bg-emerald-800 hover:-translate-y-1'}`}
               >
                 <AnimatePresence mode="wait">
                   {addingToCart ? (
                     <motion.span key="added" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>🎉 Article ajouté !</motion.span>
                   ) : (
                     <motion.div key="add" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-3">
                       Réserver Maintenant <ShoppingCart size={22} />
                     </motion.div>
                   )}
                 </AnimatePresence>
               </button>

               <div className="flex items-center justify-center gap-8 mt-6">
                 <div className="flex flex-col items-center gap-2">
                   <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><ShieldCheck size={20}/></div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sécurisé</span>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                   <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Truck size={20}/></div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Express</span>
                 </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-20 border-t border-slate-100">
             <div className="flex items-center justify-between mb-12">
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Vous aimerez aussi</h2>
               <div className="h-px flex-1 mx-8 bg-slate-100"></div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((p, idx) => (
                  <div key={p.id} className="group">
                    <Link href={`/produit/${p.id}`} className="block aspect-[3/4] bg-slate-50 rounded-[32px] overflow-hidden mb-4 relative shadow-sm border border-slate-100">
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute bottom-4 left-4 right-4 translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl flex items-center justify-between shadow-lg">
                           <span className="font-black text-sm text-slate-900">{Number(p.price).toLocaleString()} F</span>
                           <div className="w-8 h-8 bg-wa-teal text-white rounded-full flex items-center justify-center"><Plus size={16}/></div>
                        </div>
                      </div>
                    </Link>
                    <Link href={`/produit/${p.id}`} className="block px-2">
                       <h4 className="font-bold text-slate-900 group-hover:text-wa-teal transition-colors line-clamp-1">{p.name}</h4>
                       <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{p.stores?.name}</p>
                    </Link>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {showRoute && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            onClick={() => setShowRoute(false)}
            className="absolute inset-0 bg-neutral-900/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-4xl h-[80vh] md:aspect-video bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Itinéraire vers {product.stores?.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Satellite & Temps Réel</p>
              </div>
              <button 
                onClick={() => setShowRoute(false)}
                className="p-3 bg-white text-slate-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 relative bg-slate-50">
              {userLocation && product.stores?.latitude && product.stores?.longitude ? (
                <InteractiveMap 
                  mode="route"
                  initialPos={[Number(product.stores.latitude), Number(product.stores.longitude)]}
                  userPos={userLocation ? [userLocation.latitude, userLocation.longitude] : null}
                  userAccuracy={userLocation?.accuracy}
                  showSatellite={true}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 text-center">
                  <div className="w-20 h-20 bg-wa-teal/10 rounded-[2.5rem] flex items-center justify-center text-wa-teal animate-bounce">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
                  </div>
                  <div className="space-y-2">
                    <p className="font-black text-xl text-slate-900">GPS ou Données manquantes</p>
                    <p className="text-sm font-medium text-slate-400 max-w-xs">Activez votre position ou vérifiez que la boutique a renseigné ses coordonnées.</p>
                  </div>
                  <button 
                    onClick={requestLocation}
                    className="px-10 py-4 bg-wa-teal text-white rounded-2xl font-black shadow-2xl shadow-wa-teal/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
                  >
                    Activer ma position
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
