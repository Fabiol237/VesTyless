'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShoppingCart, Store, ArrowLeft, ArrowRight, Loader2, Heart, Share2, ShieldCheck, Truck } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*, stores(*)')
        .eq('id', id)
        .single();

      if (data) {
        setProduct(data);
      }
      setLoading(false);
    }
    
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    setAddingToCart(true);
    addToCart(product);
    setTimeout(() => {
      setAddingToCart(false);
    }, 600);
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

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* IMAGE SECION */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
             <div className="aspect-square bg-neutral-100 rounded-3xl overflow-hidden border border-neutral-200 relative group">
                <img 
                  src={product.image_url || "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800"} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-md text-neutral-600 hover:text-red-500 rounded-full shadow-sm transition-colors">
                  <Heart size={20} />
                </button>
             </div>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="w-full lg:w-1/2 flex flex-col py-2">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                 <span className="text-xs font-bold uppercase tracking-widest text-wa-teal px-3 py-1 bg-wa-chat rounded-full">{product.category || 'Non catégorisé'}</span>
                 <button className="text-neutral-400 hover:text-wa-teal-dark flex items-center gap-1.5 text-sm font-bold transition-colors">
                   <Share2 size={16} /> Partager
                 </button>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-wa-teal-dark tracking-tight leading-[1.1] mb-4">
                {product.name}
              </h1>
              <p className="text-3xl md:text-4xl font-bold text-wa-teal-dark">
                {Number(product.price).toLocaleString('fr-FR')} <span className="text-lg text-neutral-500 font-bold ml-1">FCFA</span>
              </p>
            </div>

            <div className="bg-wa-bg border border-neutral-200/50 rounded-2xl p-5 mb-8 flex items-start gap-4 hover:border-wa-teal transition-colors">
                <Link href={`/boutique/${product.stores?.id}`} className="w-14 h-14 bg-white rounded-xl border border-neutral-200 flex items-center justify-center overflow-hidden flex-shrink-0 transition-transform hover:scale-105 shadow-sm">
                  {product.stores?.logo_url ? <img src={product.stores?.logo_url} alt={product.stores?.name || 'logo boutique'} className="w-full h-full object-cover" /> : <Store className="text-neutral-400" size={24} />}
                </Link>
              <div className="flex-1">
                 <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-0.5">Vendu par</p>
                 <Link href={`/boutique/${product.stores?.id}`} className="text-lg font-bold text-wa-teal-dark hover:text-wa-teal transition-colors block mb-1">
                   {product.stores?.name}
                 </Link>
                 <p className="text-sm font-medium text-neutral-500 flex items-center gap-1.5"><Store size={14}/> {product.stores?.city || 'Localisation non précisée'}</p>
              </div>
              <Link href={`/boutique/${product.stores?.id}`} className="hidden sm:flex items-center justify-center p-3 bg-white border border-neutral-200 rounded-xl hover:bg-wa-teal hover:text-white hover:border-wa-teal transition-all text-neutral-600"><ArrowRight size={20} /></Link>
            </div>

            <div className="space-y-6 mb-8 flex-1">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">Description</h3>
                <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">{product.description || "Aucune description fournie pour ce produit."}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-auto pt-6 border-t border-neutral-100">
               <button 
                 onClick={handleAddToCart}
                 className={`w-full py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-sm ${addingToCart ? 'bg-wa-teal text-white scale-[0.98]' : 'bg-wa-green text-white hover:bg-wa-teal-dark'}`}
               >
                 {addingToCart ? "Ajouté !" : "Ajouter au panier"}
                 {!addingToCart && <ShoppingCart size={22} />}
               </button>

               <div className="flex items-center justify-center gap-6 mt-4">
                 <div className="flex items-center gap-2 text-sm font-medium text-neutral-500"><ShieldCheck size={18} className="text-wa-teal"/> Paiement sécurisé</div>
                 <div className="flex items-center gap-2 text-sm font-medium text-neutral-500"><Truck size={18} className="text-wa-teal"/> Livraison rapide</div>
               </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
