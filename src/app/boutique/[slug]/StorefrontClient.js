'use client';
import { useState, useEffect, use, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import StoreAIChat from '@/components/StoreAIChat';
import { 
  MapPin, Phone, Package, ShoppingCart, CheckCircle2, 
  Store, Loader2, Search, Zap, Share2, Navigation, MessageCircle, ChevronRight 
} from 'lucide-react';

function ProductCard({ item, addToCart }) {
  const [added, setAdded] = useState(false);
  const handleAdd = () => {
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

  return (
    <div className="group relative flex flex-col bg-white rounded-3xl border border-neutral-100 overflow-hidden hover:border-wa-teal transition-all duration-300 hover:shadow-xl">
      <Link href={`/produit/${item.id}`} className="relative w-full aspect-square bg-neutral-50 overflow-hidden flex items-center justify-center">
        {item.image_url
          ? <img src={item.image_url} alt={item.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          : <Package size={48} className="text-neutral-200" />}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {item.is_promo && <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-lg">PROMO</span>}
          {item.is_boosted && <span className="bg-wa-teal text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-lg"><Zap size={8} />BOOST</span>}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/produit/${item.id}`}>
          <h3 className="text-sm font-bold text-neutral-900 line-clamp-2 leading-snug mb-2 group-hover:text-wa-teal transition-colors">{item.name}</h3>
        </Link>
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-neutral-50">
          <span className="text-base font-black text-wa-teal">{Number(item.price).toLocaleString('fr-FR')} F</span>
          <button 
            onClick={handleAdd} 
            disabled={item.stock === 0} 
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-md ${added ? 'bg-green-500 text-white' : 'bg-wa-teal text-white hover:bg-wa-teal-dark'}`}
          >
            {added ? <CheckCircle2 size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StorefrontClient({ params }) {
  const { slug } = use(params);
  const { addToCart } = useCart();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      // 1. Boutique
      const { data: storeData } = await supabase.from('stores').select('*').eq('slug', slug).single();
      if (!storeData) { setLoading(false); return; }
      setStore(storeData);

      // 2. Produits
      const { data: prods } = await supabase.from('products')
        .select('*, global_categories(name)')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .order('is_boosted', { ascending: false })
        .order('created_at', { ascending: false });
      
      setProducts(prods || []);

      // 3. Catégories uniques présentes
      if (prods) {
        const cats = [...new Set(prods.map(p => p.global_categories?.name || 'Autres'))];
        setCategories(cats);
      }
      
      setLoading(false);
    };
    load();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: store.name,
        text: `Découvrez la boutique ${store.name} sur VesTyle !`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié !');
    }
  };

  const handleDirections = () => {
    if (store.latitude && store.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`, '_blank');
    } else {
      alert('Position non renseignée par le vendeur.');
    }
  };

  const groupedProducts = useMemo(() => {
    const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
    const groups = {};
    filtered.forEach(p => {
      const catName = p.global_categories?.name || 'Autres';
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(p);
    });
    return groups;
  }, [products, search]);

  if (loading) return (
    <main className="bg-wa-bg min-h-screen flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center pt-24">
        <Loader2 size={40} className="text-wa-teal animate-spin" />
      </div>
    </main>
  );

  if (!store) return (
    <main className="bg-wa-bg min-h-screen flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center pt-24 px-6 text-center">
        <Store size={60} className="text-neutral-200 mb-4" />
        <h1 className="text-2xl font-black text-neutral-800 mb-2">Boutique introuvable</h1>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 bg-wa-teal text-white px-8 py-3 rounded-full font-bold">Retour à l&apos;accueil</Link>
      </div>
    </main>
  );

  return (
    <main className="bg-wa-bg min-h-screen flex flex-col font-sans overflow-x-hidden">
      <Navbar />
      
      {/* 🖼️ GRANDE BANNIÈRE IMMERSIVE */}
      <div className="relative w-full h-[250px] sm:h-[400px] bg-neutral-200 overflow-hidden mt-16 sm:mt-20">
        <img 
          src={store.banner_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80'} 
          className="w-full h-full object-cover"
          alt="Bannière"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 relative -mt-16 sm:-mt-24 pb-32">
        
        {/* 🏪 HEADER PREMIUM */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 text-center sm:text-left">
            
            {/* LOGO FLOTTANT */}
            <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-[2rem] bg-white p-2 shadow-2xl relative -mt-20 sm:-mt-32">
              <div className="w-full h-full rounded-[1.5rem] overflow-hidden border-4 border-white">
                {store.logo_url 
                  ? <img src={store.logo_url} className="w-full h-full object-cover" alt={store.name} />
                  : <div className="w-full h-full bg-wa-teal/10 flex items-center justify-center text-wa-teal"><Store size={64}/></div>}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight">{store.name}</h1>
                <div className="flex items-center justify-center gap-2">
                   <button onClick={handleShare} className="p-3 bg-neutral-100 hover:bg-wa-teal/10 hover:text-wa-teal rounded-2xl transition-all"><Share2 size={20}/></button>
                   <button onClick={handleDirections} className="p-3 bg-neutral-100 hover:bg-wa-teal/10 hover:text-wa-teal rounded-2xl transition-all"><Navigation size={20}/></button>
                </div>
              </div>
              <p className="text-sm sm:text-base text-neutral-500 max-w-2xl font-medium mb-6 leading-relaxed">{store.description || 'Bienvenue dans notre boutique officielle.'}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                {store.city && <span className="flex items-center gap-2 text-sm font-bold text-neutral-400 bg-neutral-50 px-4 py-2 rounded-full border border-neutral-100"><MapPin size={14} className="text-wa-teal" />{store.city}</span>}
                {store.whatsapp_number && (
                  <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-green-500/20 hover:scale-105 transition-all">
                    <MessageCircle size={18} />
                    WhatsApp
                  </a>
                )}
                <button onClick={handleDirections} className="flex items-center gap-2 bg-wa-teal text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-wa-teal/20 hover:scale-105 transition-all">
                   <Navigation size={18} />
                   S&apos;y rendre
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 RECHERCHE & FILTRES */}
        <div className="mt-12 mb-10 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Chercher un article dans cette boutique…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border-2 border-neutral-100 rounded-[2rem] text-base font-medium focus:outline-none focus:border-wa-teal transition-all shadow-sm focus:shadow-xl"
            />
          </div>
        </div>

        {/* 📦 GRILLES DE PRODUITS PAR CATÉGORIES */}
        <div className="space-y-16">
          {Object.entries(groupedProducts).length === 0 ? (
            <div className="bg-white rounded-[3rem] p-16 text-center shadow-sm border border-neutral-100">
              <Package size={64} className="text-neutral-200 mx-auto mb-6" />
              <p className="text-xl font-bold text-neutral-500">Aucun produit ne correspond à votre recherche.</p>
            </div>
          ) : (
            Object.entries(groupedProducts).map(([catName, items]) => (
              <div key={catName} className="animate-fade-in">
                <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
                    <div className="w-2 h-8 bg-wa-teal rounded-full" />
                    {catName}
                  </h2>
                  <span className="text-xs font-black text-neutral-400 uppercase tracking-widest bg-neutral-100 px-4 py-1.5 rounded-full">{items.length} Articles</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {items.map(p => <ProductCard key={p.id} item={p} addToCart={addToCart} />)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Chat */}
      {store.ai_enabled && <StoreAIChat store={store} products={products} />}

      <Footer />
    </main>
  );
}
