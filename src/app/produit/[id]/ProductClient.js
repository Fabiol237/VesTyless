'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackNavigation from '@/components/BackNavigation';
import Link from 'next/link';
import { ShoppingCart, ArrowLeft, Store, MapPin, CheckCircle2, Package, Loader2, Zap, Shield, ChevronRight } from 'lucide-react';

export default function ProductClient({ productId, initialProduct, initialVariants }) {
  const id = productId;
  const { addToCart, cart } = useCart();
  const [product, setProduct] = useState(initialProduct);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(!initialProduct);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [variants, setVariants] = useState(initialVariants);
  const [selectedVariants, setSelectedVariants] = useState({}); // {taille: 'XL', couleur: 'Rouge'}

  useEffect(() => {
    if (!id) return;
    
    async function loadData() {
      // Si on n'a pas reçu le produit initialement par le serveur (fallback)
      if (!product) {
        const { data: p } = await supabase
          .from('products')
          .select('*, stores(id,name,slug,logo_url,city)')
          .eq('id', id)
          .single();
        
        if (p) {
          setProduct(p);
          const { data: v } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', id);
          if (v) setVariants(v);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }

      // 3. Recommandations (toujours asynchrone pour ne pas ralentir le reste)
      supabase.rpc('get_product_recommendations', { target_product_id: id, limit_count: 4 })
        .then(({ data: recs }) => { if (recs) setRecommendations(recs); });
      
      // 4. Vue quotidienne (Incriméntation silencieuse)
      try {
        await supabase.rpc('increment_daily_views', { product_id: id });
      } catch (e) {
        // Ignorer silencieusement
      }
    }

    loadData();
  }, [id, product]);

  const handleAdd = () => {
    if (!product) return;
    
    // On vérifie si toutes les variantes existantes sont choisies
    const types = [...new Set(variants.map(v => v.variant_type))];
    const missing = types.filter(t => !selectedVariants[t]);
    if (missing.length > 0) {
       alert(`Veuillez choisir : ${missing.join(', ')}`);
       return;
    }

    const item = { 
      id: product.id, 
      name: product.name, 
      price: Number(product.price), 
      image_url: product.images?.[0] || product.image_url, 
      store_id: product.store_id, 
      store_name: product.stores?.name, 
      category_id: product.category_id,
      selectedVariants // Transmis au panier
    };

    for (let i = 0; i < qty; i++) addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  if (loading) return (
    <main className="bg-wa-bg min-h-screen flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center pt-24">
        <Loader2 size={40} className="text-wa-teal animate-spin" />
      </div>
    </main>
  );

  if (!product) return (
    <main className="bg-wa-bg min-h-screen flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center pt-24 px-6 text-center">
        <Package size={60} className="text-neutral-200 mb-4" />
        <h1 className="text-2xl font-black text-neutral-800 mb-2">Produit introuvable</h1>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 bg-wa-teal text-white px-8 py-3 rounded-full font-bold"><ArrowLeft size={16}/>Retour</Link>
      </div>
    </main>
  );

  const images = product.images?.length > 0 ? product.images : [product.image_url];
  const variantTypes = [...new Set(variants.map(v => v.variant_type))];

  return (
    <main className="bg-wa-bg min-h-screen flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 pt-24 pb-24">
        <BackNavigation title={product?.name || 'Produit'} />

        <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-4">
          <Link href="/" className="hover:text-wa-teal">Accueil</Link>
          <ChevronRight size={12} />
          {product.stores?.slug && <><Link href={`/boutique/${product.stores.slug}`} className="hover:text-wa-teal truncate max-w-[120px]">{product.stores.name}</Link><ChevronRight size={12} /></>}
          <span className="text-neutral-600 font-medium truncate max-w-[160px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* MULTI-IMAGE CAROUSEL - Meilleur responsive */}
          <div className="md:col-span-1 flex flex-col gap-3 order-1 md:order-1">
            <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-white shadow-xl border border-neutral-100">
               <div style={{paddingBottom: '100%'}} className="relative md:rounded-3xl">
                 <img src={images[activeImage]} className="absolute inset-0 w-full h-full object-cover transition-all duration-500" />
               </div>
               <div className="absolute top-4 left-4 flex flex-col gap-2">
                 {product.is_boosted && <span className="bg-wa-teal text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1"><Zap size={10}/>SPONSORISÉ</span>}
                 {product.is_promo && <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">PROMO</span>}
               </div>
            </div>
            {/* THUMBNAILS */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === i ? 'border-wa-teal scale-105' : 'border-transparent opacity-50 hover:opacity-75'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info - Mieux organisé sur toutes les tailles */}
          <div className="md:col-span-2 flex flex-col order-2 md:order-2">
            {product.stores && (
              <Link href={`/boutique/${product.stores.slug || ''}`} className="inline-flex items-center gap-2 mb-4 group w-fit">
                {product.stores.logo_url
                  ? <img src={product.stores.logo_url} alt={product.stores.name} className="w-7 h-7 rounded-full object-cover border border-neutral-100" />
                  : <div className="w-7 h-7 rounded-full bg-wa-teal/10 flex items-center justify-center"><Store size={12} className="text-wa-teal" /></div>}
                <span className="text-xs font-bold text-neutral-500 group-hover:text-wa-teal transition-colors">{product.stores.name}</span>
                {product.stores.city && <span className="flex items-center gap-1 text-xs text-neutral-400"><MapPin size={9}/>{product.stores.city}</span>}
              </Link>
            )}

            <h1 className="text-2xl md:text-3xl font-black text-neutral-900 leading-tight mb-3 tracking-tight">{product.name}</h1>

            <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-neutral-100">
              <span className="text-3xl md:text-4xl font-black text-wa-teal">{Number(product.price).toLocaleString()} F</span>
              {product.promo_price && <span className="text-lg text-neutral-400 line-through">{Number(product.promo_price).toLocaleString()} F</span>}
            </div>

            {/* VARIANTES SELECTOR */}
            {variantTypes.length > 0 && (
              <div className="space-y-4 mb-6">
                {variantTypes.map(type => (
                  <div key={type}>
                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2">Choisir {type}</p>
                    <div className="flex flex-wrap gap-2">
                      {variants.filter(v => v.variant_type === type).map(v => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariants({...selectedVariants, [type]: v.variant_value})}
                          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all border-2 ${selectedVariants[type] === v.variant_value ? 'bg-wa-teal text-white border-wa-teal shadow-lg scale-105' : 'bg-neutral-50 text-neutral-600 border-neutral-100 hover:border-wa-teal/30'}`}
                        >
                          {v.variant_value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {product.description && (
              <div className="bg-white/70 rounded-2xl p-4 border border-neutral-100 mb-6 shadow-sm">
                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2">À propos</p>
                <p className="text-xs text-neutral-700 leading-relaxed line-clamp-3">{product.description}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2 text-neutral-400 hover:text-wa-teal font-bold text-base">−</button>
                  <span className="px-3 py-2 font-bold text-neutral-900 min-w-[45px] text-center text-sm">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="px-4 py-2 text-neutral-400 hover:text-wa-teal font-bold text-base">+</button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={product.stock_quantity === 0}
                  className={`flex-1 h-12 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${added ? 'bg-green-500 text-white' : product.stock_quantity === 0 ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-wa-teal text-white hover:bg-wa-teal-dark shadow-wa-teal/20'}`}
                >
                  {added ? <><CheckCircle2 size={16}/>Ajouté !</> : <><ShoppingCart size={16}/><span className="hidden sm:inline">{product.stock_quantity === 0 ? 'Rupture' : 'Ajouter au panier'}</span><span className="sm:hidden">{product.stock_quantity === 0 ? 'Rupture' : 'Panier'}</span></>}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3 mt-6 md:mt-8">
              {[{icon: Shield, label: 'Vérifié'}, {icon: Zap, label: 'Rapide'}, {icon: CheckCircle2, label: 'Confiance'}].map(({icon: Icon, label}) => (
                <div key={label} className="bg-white/60 border border-neutral-100 rounded-lg p-2 md:p-3 flex flex-col items-center gap-0.5 md:gap-1 text-center">
                  <Icon size={14} className="text-wa-teal"/>
                  <span className="text-[8px] md:text-[9px] font-black text-neutral-500 uppercase tracking-tighter">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ... reste de la page (Boutique, Recommandations) ... */}
        {product.stores && (
          <div className="mt-20">
            <h2 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-6">La Boutique</h2>
            <Link href={`/boutique/${product.stores.slug || ''}`} className="flex items-center gap-6 bg-white border border-neutral-100 rounded-[2.5rem] p-6 hover:border-wa-teal hover:shadow-xl transition-all group">
              {product.stores.logo_url
                ? <img src={product.stores.logo_url} alt={product.stores.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
                : <div className="w-20 h-20 rounded-2xl bg-wa-teal/10 flex items-center justify-center flex-shrink-0 text-wa-teal"><Store size={32}/></div>}
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-xl text-neutral-900 tracking-tight">{product.stores.name}</h3>
                {product.stores.city && <p className="flex items-center gap-1 text-sm text-neutral-500 mt-1 font-medium"><MapPin size={14}/>{product.stores.city}</p>}
                <p className="text-xs text-wa-teal font-black mt-2 group-hover:translate-x-1 transition-transform">Visiter la boutique →</p>
              </div>
              <ChevronRight size={24} className="text-neutral-200 group-hover:text-wa-teal transition-colors flex-shrink-0"/>
            </Link>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-20 animate-fade-in">
            <h2 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-6">Pour compléter votre look</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.map(rec => (
                <Link key={rec.id} href={`/produit/${rec.id}`} className="bg-white rounded-3xl border border-neutral-100 overflow-hidden group hover:border-wa-teal hover:shadow-lg transition-all">
                  <div className="aspect-square bg-neutral-50 relative">
                    <img src={rec.images?.[0] || rec.image_url} alt={rec.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xs font-bold text-neutral-900 truncate">{rec.name}</h3>
                    <p className="text-xs font-black text-wa-teal mt-1">{Number(rec.price).toLocaleString()} F</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
