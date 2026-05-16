'use client';
import { useState, useEffect, use, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useDistance } from '@/hooks/useDistance';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import StoreAIChat from '@/components/StoreAIChat';
import { 
  MapPin, Package, ShoppingCart, CheckCircle2, 
  Store, Loader2, Search, Zap, Share2, Navigation, 
  MessageCircle, ChevronRight, Star, Clock, Shield, Heart, Eye
} from 'lucide-react';

import ProductCard from '@/components/ProductCard';

export default function StorefrontClient({ params }) {
  const { slug } = use(params);
  const { addToCart } = useCart();
  const { formatDistance, requestLocation, userLocation } = useDistance();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('accueil'); // accueil, produits, promotions, profil
  const [stats, setStats] = useState({ totalSold: 0, totalViews: 0 });
  const [shared, setShared] = useState(false);

  const trackProductView = useCallback((productId) => {
    try { supabase.rpc('increment_product_view', { prod_id: productId }); } catch (_) {}
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data: storeData } = await supabase.from('stores').select('*').eq('slug', slug).single();
      if (!storeData) { setLoading(false); return; }
      setStore(storeData);

      const { data: prods } = await supabase.from('products')
        .select('*, global_categories(name)')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .order('is_boosted', { ascending: false })
        .order('created_at', { ascending: false });
      
      setProducts(prods || []);

      if (prods) {
        const cats = [...new Set(prods.map(p => p.global_categories?.name || 'Autres'))];
        setCategories(cats);
      }

      // Get store stats
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', storeData.id)
        .eq('status', 'delivered');

      setStats({ totalSold: orderCount || 0, totalViews: storeData.daily_views || 0 });

      // Increment store view
      try { supabase.rpc('increment_store_view', { st_id: storeData.id }); } catch (_) {}
      
      setLoading(false);
    };
    load();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: store.name, text: `Découvrez ${store.name} sur VesTyle !`, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleDirections = () => {
    if (store.latitude && store.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`, '_blank');
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    if (activeFilter !== 'all') {
      result = result.filter(p => (p.global_categories?.name || 'Autres') === activeFilter);
    }
    return result;
  }, [products, search, activeFilter]);

  const groupedProducts = useMemo(() => {
    const groups = {};
    filteredProducts.forEach(p => {
      const catName = p.global_categories?.name || 'Autres';
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(p);
    });
    return groups;
  }, [filteredProducts]);

  // Loading State
  if (loading) return (
    <main className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center pt-24 gap-4">
        <div className="w-16 h-16 rounded-[2rem] bg-emerald-100 flex items-center justify-center animate-pulse">
          <Store size={32} className="text-emerald-600" />
        </div>
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Chargement de la boutique...</p>
      </div>
    </main>
  );

  // Not Found State
  if (!store) return (
    <main className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center pt-24 px-6 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Store size={48} className="text-slate-300" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Boutique introuvable</h1>
        <p className="text-slate-400 text-sm mb-8 max-w-sm">Cette boutique n'existe pas ou a été désactivée.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg active:scale-95 transition-all">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );

  const storeInfo = { name: store.name, slug: store.slug, logo_url: store.logo_url, latitude: store.latitude, longitude: store.longitude };
  const totalProducts = products.length;

  return (
    <main className="bg-slate-50 min-h-screen flex flex-col font-sans overflow-x-hidden">
      <Navbar />
      
      {/* ═══════════════════════════════════════════════════════════════
          ALIBABA / ALIEXPRESS STYLE STORE HEADER
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full bg-white mt-16 sm:mt-[72px] shadow-sm relative z-20">
        {/* Top Banner Thin Strip */}
        <div className="w-full h-[200px] sm:h-[300px] bg-slate-900 relative overflow-hidden">
          <img 
            src={store.banner_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600'} 
            className="w-full h-full object-cover opacity-50"
            alt={`Bannière ${store.name}`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative -mt-10 sm:-mt-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pb-4 border-b border-slate-100">
            
            {/* Logo & Core Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 w-full sm:w-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl p-1 shadow-md border border-slate-200 shrink-0 relative">
                <img src={store.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover rounded-lg" alt={store.name} />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                  <Shield size={12} />
                </div>
              </div>

              <div className="text-center sm:text-left mb-1">
                <div className="flex flex-col sm:flex-row items-center gap-2 mb-1.5">
                  <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{store.name}</h1>
                  {store.supplier_level !== 'Nouveau Vendeur' && (
                    <span className="flex items-center gap-1 bg-[#fff8e1] text-[#ff8f00] border border-[#ffe082] px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-sm">
                      <Star size={10} className="fill-[#ff8f00]" /> {store.supplier_level || 'Fournisseur Or'}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 size={14} /> Vérifié VesTyle
                  </span>
                  <span className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="flex items-center gap-1">
                    <span className="text-rose-500 font-black">{store.positive_rating !== undefined ? store.positive_rating : 100}%</span> Avis Positifs
                  </span>
                  <span className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" /> Rép: {store.response_time || '< 2h'}
                  </span>
                </div>
              </div>
            </div>

            {/* AliExpress Action Buttons */}
            <div className="flex flex-row items-center gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
              {store.whatsapp_number && (
                <a 
                  href={`https://wa.me/${store.whatsapp_number}`} 
                  target="_blank" 
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff7a00] to-[#ff5000] text-white px-6 py-2.5 rounded-full font-black text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all uppercase tracking-widest"
                >
                  <MessageCircle size={16} /> Contacter
                </a>
              )}
              <button 
                onClick={handleDirections} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-full font-black text-xs border border-slate-200 active:scale-95 transition-all uppercase tracking-widest"
              >
                <MapPin size={16} /> Visiter
              </button>
              <button 
                onClick={handleShare} 
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-full active:scale-95 transition-all shrink-0"
              >
                {shared ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Share2 size={16} />}
              </button>
            </div>
          </div>

          {/* AliExpress Navigation Tabs */}
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar pt-2 pb-0">
            <button 
              onClick={() => setActiveTab('accueil')}
              className={`py-3 border-b-2 font-black text-xs uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'accueil' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              Accueil Boutique
            </button>
            <button 
              onClick={() => { setActiveTab('produits'); setActiveFilter('all'); }}
              className={`py-3 border-b-2 font-black text-xs uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'produits' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              Tous les Produits ({totalProducts})
            </button>
            <button 
              onClick={() => setActiveTab('promotions')}
              className={`py-3 border-b-2 font-black text-xs uppercase tracking-widest whitespace-nowrap flex items-center gap-1 transition-colors ${activeTab === 'promotions' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              Promotions <span className="bg-rose-500 text-white text-[9px] px-1.5 rounded-sm">HOT</span>
            </button>
            <button 
              onClick={() => setActiveTab('profil')}
              className={`py-3 border-b-2 font-black text-xs uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'profil' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              Profil Fournisseur
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          DYNAMIC CONTENT VIEWS
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto w-full px-4 mb-32 pt-6">
        
        {/* === TAB: ACCUEIL === */}
        {activeTab === 'accueil' && (
          <div className="animate-fade-in space-y-12">
            {/* Show custom message as a banner if exists */}
            {store.custom_message && (
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-3xl p-6 sm:p-8 flex items-center gap-4 shadow-inner">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-emerald-800 font-black text-sm uppercase tracking-widest mb-1">Annonce de la boutique</h3>
                  <p className="text-emerald-900 font-bold sm:text-lg leading-snug">{store.custom_message}</p>
                </div>
              </div>
            )}

            {Object.entries(groupedProducts).length === 0 ? (
              <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-slate-100">
                <Package size={56} className="text-slate-200 mx-auto mb-5" />
                <h3 className="text-lg font-black text-slate-900 mb-2">Aucun produit</h3>
                <p className="text-sm text-slate-400 mb-6">Cette boutique n'a pas encore ajouté de produits.</p>
              </div>
            ) : (
              <div className="space-y-14">
                {Object.entries(groupedProducts).map(([catName, items]) => (
                  <div key={catName}>
                    <div className="flex items-center justify-between mb-6 px-1">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-1.5 h-7 bg-emerald-500 rounded-full" />
                        {catName}
                      </h2>
                      <button onClick={() => { setActiveTab('produits'); setActiveFilter(catName); }} className="text-[10px] font-black text-emerald-600 hover:text-emerald-800 uppercase tracking-widest flex items-center gap-1 transition-colors">
                        Voir tout ({items.length}) <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                      {items.slice(0, 10).map((p, idx) => (
                        <ProductCard key={p.id} item={{...p, stores: storeInfo}} idx={idx} trackProductView={trackProductView} formatDistance={formatDistance} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === TAB: PRODUITS (SEARCH & FILTER) === */}
        {activeTab === 'produits' && (
          <div className="animate-fade-in">
            {/* Search */}
            <div className="relative mb-5">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder={`Chercher parmi ${totalProducts} produits…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all shadow-sm focus:shadow-lg"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                  ✕
                </button>
              )}
            </div>

            {/* Category pills */}
            {categories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-6">
                <button 
                  onClick={() => setActiveFilter('all')}
                  className={`shrink-0 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeFilter === 'all' 
                      ? 'bg-slate-900 text-white shadow-lg' 
                      : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'
                  }`}
                >
                  Tout ({totalProducts})
                </button>
                {categories.map(cat => {
                  const count = products.filter(p => (p.global_categories?.name || 'Autres') === cat).length;
                  return (
                    <button 
                      key={cat}
                      onClick={() => setActiveFilter(cat)}
                      className={`shrink-0 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeFilter === cat 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                          : 'bg-white text-slate-400 border border-slate-100 hover:border-emerald-300'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-slate-100">
                <Package size={56} className="text-slate-200 mx-auto mb-5" />
                <h3 className="text-lg font-black text-slate-900 mb-2">Aucun résultat</h3>
                <p className="text-sm text-slate-400 mb-6">Aucun produit ne correspond à vos filtres.</p>
                <button onClick={() => { setSearch(''); setActiveFilter('all'); }} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm active:scale-95 transition-all">
                  Réinitialiser
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                    {activeFilter === 'all' ? 'Catalogue Complet' : activeFilter}
                  </h2>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{filteredProducts.length} résultats</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                  {filteredProducts.map((p, idx) => (
                    <ProductCard key={p.id} item={{...p, stores: storeInfo}} idx={idx} trackProductView={trackProductView} formatDistance={formatDistance} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === TAB: PROMOTIONS === */}
        {activeTab === 'promotions' && (
          <div className="animate-fade-in space-y-8">
            <div className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-center text-white shadow-xl shadow-rose-500/20">
              <Zap size={48} className="mx-auto mb-4 text-white/90 drop-shadow-lg" />
              <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight drop-shadow-md">Promotions & Nouveautés</h2>
              <p className="text-lg font-medium text-white/90 max-w-2xl mx-auto drop-shadow-sm">
                {store.custom_message || "Découvrez nos offres exclusives et nos derniers arrivages ! Ne manquez pas les bonnes affaires."}
              </p>
            </div>

            {/* Display boosted/promoted products (simulated here by showing newest or all) */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-2 h-8 bg-rose-500 rounded-full" />
                 <h2 className="text-xl font-black text-slate-900">Articles à la une</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                {products.filter(p => p.is_boosted).length > 0 
                  ? products.filter(p => p.is_boosted).map((p, idx) => (
                      <ProductCard key={p.id} item={{...p, stores: storeInfo}} idx={idx} trackProductView={trackProductView} formatDistance={formatDistance} />
                    ))
                  : products.slice(0, 5).map((p, idx) => (
                      <ProductCard key={p.id} item={{...p, stores: storeInfo}} idx={idx} trackProductView={trackProductView} formatDistance={formatDistance} />
                    ))
                }
              </div>
            </div>
          </div>
        )}

        {/* === TAB: PROFIL === */}
        {activeTab === 'profil' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Description & Contact */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <Store className="text-emerald-500" size={24} />
                <h2 className="text-xl font-black text-slate-900">À propos du Fournisseur</h2>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed">
                {store.description || 'Ce fournisseur n\'a pas encore ajouté de description détaillée.'}
              </p>
              
              <div className="pt-6 border-t border-slate-50 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Coordonnées</h3>
                {store.whatsapp_number && (
                  <div className="flex items-center gap-3 text-slate-700 font-bold">
                    <div className="w-10 h-10 bg-[#25D366]/10 text-[#25D366] rounded-xl flex items-center justify-center"><MessageCircle size={18} /></div>
                    <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" className="hover:text-[#25D366] transition-colors">{store.whatsapp_number}</a>
                  </div>
                )}
                {store.city && (
                  <div className="flex items-center gap-3 text-slate-700 font-bold">
                    <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center"><MapPin size={18} /></div>
                    <span>{store.city}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Map & Location */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Navigation className="text-blue-500" size={24} />
                  <h2 className="text-xl font-black text-slate-900">Localisation GPS</h2>
                </div>
                <button onClick={handleDirections} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-blue-100 transition-colors">
                  Itinéraire
                </button>
              </div>
              
              <div className="flex-1 w-full rounded-3xl overflow-hidden bg-slate-100 border-4 border-slate-50 relative min-h-[300px]">
                {store.latitude && store.longitude ? (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    loading="lazy" 
                    allowFullScreen 
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${store.latitude},${store.longitude}`}
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <MapPin size={48} className="mb-4 opacity-50" />
                    <p className="font-bold text-sm">Position GPS non définie</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Chat */}
      {store.ai_enabled && <StoreAIChat store={store} products={products} />}

      <Footer />
    </main>
  );
}
