'use client';
import { useState, useEffect, use, useMemo, useCallback, lazy, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useDistance } from '@/hooks/useDistance';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StoreAIChat from '@/components/StoreAIChat';
import { Store, Loader2 } from 'lucide-react';
import Link from 'next/link';

import dynamic from 'next/dynamic';

// ── Lazy-load all themes ─────────────────────────────────────────────────────
const Theme00_Classic   = dynamic(() => import('./themes/Theme00_Classic'), { ssr: false });
const Theme01_Luxury    = dynamic(() => import('./themes/Theme01_Luxury'), { ssr: false });
const Theme02_Beauty    = dynamic(() => import('./themes/Theme02_Beauty'), { ssr: false });
const Theme03_Market    = dynamic(() => import('./themes/Theme03_Market'), { ssr: false });
const Theme04_Restaurant = dynamic(() => import('./themes/Theme04_Restaurant'), { ssr: false });
const Theme05_Pro       = dynamic(() => import('./themes/Theme05_Pro'), { ssr: false });

const THEME_MAP = {
  theme_00: Theme00_Classic,
  theme_01: Theme01_Luxury,
  theme_02: Theme02_Beauty,
  theme_03: Theme03_Market,
  theme_04: Theme04_Restaurant,
  theme_05: Theme05_Pro,
};

// Fallback loader while theme component loads
function ThemeLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} className="animate-spin text-emerald-500" />
    </div>
  );
}

export default function StorefrontClient({ params }) {
  const { slug } = use(params);
  const { addToCart } = useCart();
  const { formatDistance, requestLocation, userLocation } = useDistance();
  
  // Pour le test rapide via l'URL (ex: ?theme=theme_05)
  const [urlTheme, setUrlTheme] = useState(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setUrlTheme(params.get('theme'));
    }
  }, []);

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('accueil');
  const [stats, setStats] = useState({ totalSold: 0, totalViews: 0 });
  const [shared, setShared] = useState(false);

  const trackProductView = useCallback((productId) => {
    try { supabase.rpc('increment_product_view', { prod_id: productId }); } catch (_) {}
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!storeData) { setLoading(false); return; }
      setStore(storeData);

      // Paralléliser les requêtes pour gagner du temps
      const [prodsRes, ordersRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, global_categories(name)')
          .eq('store_id', storeData.id)
          .eq('is_active', true)
          .order('is_boosted', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', storeData.id)
          .eq('status', 'delivered')
      ]);

      const prods = prodsRes.data;
      setProducts(prods || []);

      if (prods) {
        const cats = [...new Set(prods.map(p => p.global_categories?.name || 'Autres'))];
        setCategories(cats);
      }

      setStats({ totalSold: ordersRes.count || 0, totalViews: storeData.daily_views || 0 });

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

  // ── Loading ──────────────────────────────────────────────────────────────
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

  // ── Not Found ────────────────────────────────────────────────────────────
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

  // ── Resolve Theme Component ───────────────────────────────────────────────
  const themeId = urlTheme || store.shop_theme || 'theme_00';
  const ThemeComponent = THEME_MAP[themeId] || THEME_MAP['theme_00'];

  const storeInfo = {
    name: store.name,
    slug: store.slug,
    logo_url: store.logo_url,
    latitude: store.latitude,
    longitude: store.longitude,
  };

  const totalProducts = products.length;

  // Standard props passed to every theme
  const themeProps = {
    store: store,
    products,
    categories,
    stats,
    storeInfo,
    filteredProducts,
    groupedProducts,
    activeTab,
    setActiveTab,
    activeFilter,
    setActiveFilter,
    search,
    setSearch,
    handleShare,
    handleDirections,
    shared,
    trackProductView,
    formatDistance,
    totalProducts,
    addToCart,
    shop_tabs: store.shop_tabs || { accueil: 'Accueil', produits: 'Catalogue', promotions: 'Promotions', profil: 'Profil' }
  };

  return (
    <>
      <Navbar />
      <div className="mt-16 sm:mt-[72px]">
        {/* key={themeId} force le remontage du thème quand il change */}
        <Suspense key={themeId} fallback={<ThemeLoader />}>
          <ThemeComponent key={`theme-${themeId}`} {...themeProps} />
        </Suspense>
      </div>
      {store.ai_enabled && <StoreAIChat store={store} products={products} />}
      <Footer />
    </>
  );
}
