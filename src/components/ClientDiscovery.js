'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import VoiceSearchButton from '@/components/VoiceSearchButton';
import { useDistance } from '@/hooks/useDistance';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import { normalizeStr } from '@/lib/searchUtils';
import ProductCard from '@/components/ProductCard';
import { useOfflineData } from '@/hooks/useOfflineData';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  ShoppingBag, 
  Store, 
  Sparkles, 
  Search, 
  MapPin, 
  ChevronRight, 
  X, 
  SlidersHorizontal, 
  Zap,
  Shirt,
  Utensils,
  Smartphone,
  Home,
  HeartPulse,
  Gamepad2,
  MoreHorizontal,
  Globe
} from 'lucide-react';

const categoryIcons = {
  'all': Globe,
  'Alimentation & Supermarché': Utensils,
  'Électronique & High-Tech': Smartphone,
  'Maison & Électroménager': Home,
  'Mode & Beauté': Shirt,
  'Santé & Bien-être': HeartPulse,
  'Services & Loisirs': Gamepad2,
  'Divers': MoreHorizontal,
};

const CategoryIcon = ({ name, size = 24, className = "" }) => {
  const Icon = categoryIcons[name] || LayoutGrid;
  return <Icon size={size} className={className} />;
};

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-neutral-100 animate-pulse rounded-3xl flex items-center justify-center text-xs font-black uppercase tracking-widest text-neutral-400 text-center p-8">Initialisation de la carte satellite...</div>
});
const MapPinIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

// Bulletproof SVG Icons
const ShoppingBagIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
const SearchIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const StoreIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-4.8 0v0a2.7 2.7 0 0 1-4.8 0v0a2.7 2.7 0 0 1-4.8 0v0a2 2 0 0 1-2-2V7"/></svg>
);
const SparklesIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3 1.91 5.81L19 12l-5.09 3.19L12 21l-1.91-5.81L5 12l5.09-3.19L12 3Z"/></svg>
);
const ChevronRightIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);
const XIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const SlidersHorizontalIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>
);
const ZapIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const StarIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

// Helper to safely call RPC without crashing if not a promise
async function safeRpc(fn) {
  try { await fn; } catch (_) {}
}

export default function ClientDiscovery({ 
  initialSearchQuery = '', 
  initialProximity = false,
  externalSearchQuery = null,
  onExternalSearchChange = null,
  overrideProducts = null,
  onClearVisualSearch = null
}) {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting
  const [internalSearchQuery, setInternalSearchQuery] = useState(initialSearchQuery);
  const searchQuery = externalSearchQuery !== null ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onExternalSearchChange || setInternalSearchQuery;
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState(initialProximity ? 'distance' : 'boost'); // 'boost', 'distance', 'newest', 'price_asc', 'price_desc'
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // Suggestions pour l'autocomplétion de la recherche principale
  const mainSuggestions = useMemo(() => {
    const items = [];
    categories.forEach(c => items.push({ label: c.name || c, value: c.name || c, type: 'Catégorie' }));
    stores.slice(0, 20).forEach(s => items.push({ label: s.name, value: s.name, type: 'Boutique', sublabel: s.city || '' }));
    products.slice(0, 40).forEach(p => items.push({ label: p.name, value: p.name, type: 'Produit', sublabel: p.stores?.name || '' }));
    // Dédoublonner par label
    return [...new Map(items.map(i => [normalizeStr(i.label), i])).values()];
  }, [products, stores, categories]);
  
  const { formatDistance, getDistanceKm, requestLocation, userLocation } = useDistance();
  
  // --- SMART RANKING (Simulation: Personalization) ---
  const [userInterests, setUserInterests] = useState({});

  useEffect(() => {
    // Charger les intérêts locaux (catégories les plus vues)
    const saved = localStorage.getItem('vestyle_user_interests');
    if (saved) setUserInterests(JSON.parse(saved));
  }, []);

  const trackInterest = useCallback((categoryId) => {
    if (!categoryId) return;
    setUserInterests(prev => {
      const next = { ...prev, [categoryId]: (prev[categoryId] || 0) + 1 };
      localStorage.setItem('vestyle_user_interests', JSON.stringify(next));
      return next;
    });
  }, []);

  // Ask for location quietly once
  useEffect(() => {
    if (!userLocation) requestLocation();
  }, [userLocation, requestLocation]);

  // --- STRATÉGIE OFFLINE-FIRST POUR LE FLUX PRINCIPAL ---
  const { data: offlineDiscovery, loading: offlineLoading } = useOfflineData('discovery_feed_v4', async () => {
    // On regroupe les appels pour un cache cohérent
    const [prodRes, storeIdsRes, catRes] = await Promise.all([
      supabase.from('products').select('id, name, price, image_url, created_at, global_category_id, is_active, is_boosted, is_promo, daily_views, stores(id, name, slug, logo_url, latitude, longitude), global_categories(name, icon)').eq('is_active', true).order('is_boosted', { ascending: false }).order('is_promo', { ascending: false }).order('daily_views', { ascending: false }).order('created_at', { ascending: false }).limit(100),
      supabase.from('products').select('store_id').eq('is_active', true).limit(100),
      supabase.from('global_categories').select('*').is('parent_id', null).order('name')
    ]);

    const activeStoreIds = [...new Set((storeIdsRes.data || []).map(p => p.store_id))];
    let stores = [];
    if (activeStoreIds.length > 0) {
      const { data: sd } = await supabase.from('stores').select('id, name, slug, logo_url, city, is_boosted, daily_views, latitude, longitude').in('id', activeStoreIds).order('is_boosted', { ascending: false }).order('daily_views', { ascending: false });
      stores = sd || [];
    }

    const normalizedProds = (prodRes.data || []).map(p => ({
      ...p,
      category: p.global_categories?.name || 'Autre',
    }));

    return { data: { products: normalizedProds, stores, categories: catRes.data || [] } };
  });

  useEffect(() => {
    if (overrideProducts) {
      setProducts(overrideProducts);
      setLoading(false);
    } else if (offlineDiscovery) {
      setProducts(offlineDiscovery.products);
      setStores(offlineDiscovery.stores);
      setCategories(offlineDiscovery.categories);
      setLoading(false);
    }
  }, [offlineDiscovery, overrideProducts]);

  // Incrémenter vues produit + Tracker l'intérêt local
  const trackProductView = useCallback((productId, categoryId) => {
    safeRpc(supabase.rpc('increment_product_view', { prod_id: productId }));
    if (categoryId) trackInterest(categoryId);
  }, [trackInterest]);

  // Incrémenter vues boutique (fire-and-forget)
  const trackStoreView = useCallback((storeId) => {
    safeRpc(supabase.rpc('increment_store_view', { st_id: storeId }));
  }, []);

  // State for Meilisearch results
  const [meiliResults, setMeiliResults] = useState({ products: [], stores: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Search effect
  useEffect(() => {
    const performSearch = async () => {
      const q = (searchQuery || '').trim();
      if (!q) {
        setMeiliResults({ products: [], stores: [] });
        return;
      }

      setIsSearching(true);
      try {
        const [rpcDataRes, storeSearchRes] = await Promise.all([
          supabase.rpc('search_products_v2', { search_term: searchQuery }),
          supabase.from('stores')
            .select('id, name, slug, logo_url, city, is_boosted, daily_views, latitude, longitude')
            .ilike('name', `%${searchQuery}%`)
            .limit(4)
        ]);
        
        let fetchedProducts = rpcDataRes.data || [];
        let fetchedStores = storeSearchRes.data || [];

        setMeiliResults({
          products: fetchedProducts.map(hit => {
            const local = products.find(p => p.id === hit.id);
            return local || { ...hit, stores: { name: hit.store_name || hit.stores?.name, slug: hit.store_slug || hit.stores?.slug } };
          }),
          stores: fetchedStores
        });
      } catch (err) {
        console.error('Supabase search error:', err);
        setMeiliResults({ products: [], stores: [] });
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, products]);

  // Produits filtrés + triés côté client
  const filteredProducts = useMemo(() => {
    if (overrideProducts) return overrideProducts;
    const _sq = (searchQuery || '').trim();
    let result = _sq && meiliResults.products.length > 0 ? [...meiliResults.products] : [...products];

    // Client-side fallback ultra robuste si Meili/SQL sont vides
    if (_sq && meiliResults.products.length === 0) {
      const terms = _sq.toLowerCase().split(/\s+/).filter(Boolean);
      
      const scoredProducts = products.map(p => {
        const pName = (p.name || '').toLowerCase();
        const fullText = `${pName}`;
        
        let score = 0;
        terms.forEach(t => {
           if (fullText.includes(t)) score += 1;
           // Basic typo tolerance
           else if (t.length > 3) {
             const partial1 = t.substring(0, t.length - 1);
             const partial2 = t.substring(1);
             if (fullText.includes(partial1) || fullText.includes(partial2)) score += 0.5;
           }
        });
        return { product: p, score };
      }).filter(item => item.score > 0);

      scoredProducts.sort((a, b) => b.score - a.score);
      result = scoredProducts.map(item => item.product);
    }

    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
      case 'distance':
        if (userLocation) {
          result.sort((a, b) => {
            const distA = getDistanceKm(a.stores?.latitude, a.stores?.longitude) || Infinity;
            const distB = getDistanceKm(b.stores?.latitude, b.stores?.longitude) || Infinity;
            return distA - distB;
          });
        }
        break;
      default:
        result.sort((a, b) => {
          // Priorité 1 : Produits Boostés (Sponsorisés)
          if (a.is_boosted !== b.is_boosted) return b.is_boosted ? 1 : -1;
          
          // Priorité 2 : Score d'Affinité (Personnalisation par habitude)
          const scoreA = userInterests[a.category_id] || 0;
          const scoreB = userInterests[b.category_id] || 0;
          if (scoreA !== scoreB) return scoreB - scoreA;
          
          // Priorité 3 : Promotions
          if (a.is_promo !== b.is_promo) return b.is_promo ? 1 : -1;
          
          // Priorité 4 : Popularité globale
          return b.daily_views - a.daily_views;
        });
    }
    return result;
  }, [products, searchQuery, activeCategory, sortBy, meiliResults.products, userLocation, getDistanceKm, userInterests, overrideProducts]);

  const displayedProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);

  // Safe searchQuery for JSX (avoid null.trim() crashes)
  const sq = (searchQuery || '').trim();

  // Handle scroll reveal
  // IntersectionObserver removed to prevent elements staying invisible.
  // Using pure CSS animate-fade-in instead.

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="w-14 h-14 border-4 border-wa-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20" id="discovery-section">

      {/* ═══════════════════════════════════════════
          1. WHATSAPP STYLE SEARCH BAR - Hide if external search is handled by parent (e.g. Home Page)
      ════════════════════════════════════════════ */}
      {!externalSearchQuery && (
        <section className="sticky top-[70px] z-40 transition-all duration-500 py-4 bg-slate-950/20 backdrop-blur-xl rounded-3xl px-2">
          <div className="relative group">
            {/* Soft pulsing emerald/teal background shadow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-wa-teal to-wa-green rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-[#0d2137]/80 backdrop-blur-2xl px-5 py-4 rounded-3xl shadow-2xl border border-white/5 flex items-center gap-4 focus-within:border-wa-green/30 transition-all duration-300">
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                onSelect={(s) => setSearchQuery(s.value)}
                suggestions={mainSuggestions}
                placeholder="Chercher le meilleur de Douala..."
                className="flex-1"
                inputClassName="w-full pl-12 pr-20 py-3 bg-transparent rounded-xl text-base font-medium border-none outline-none text-white placeholder:text-slate-400 focus:ring-0"
                dropdownOffset="mt-4"
                leftIcon={<SearchIcon className={`transition-colors ${isSearching ? 'text-wa-green text-glow-wa' : 'text-slate-400'}`} size={22} />}
              >
                <div className="absolute right-3 flex items-center gap-2">
                  {isSearching && (
                    <div className="w-5 h-5 border-2 border-wa-green border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <VoiceSearchButton
                    onInterimResult={(text) => setSearchQuery(text)}
                    onResult={(text) => setSearchQuery(text)}
                    className="p-1 text-wa-green hover:scale-110 transition-transform"
                  />
                </div>
              </SearchAutocomplete>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-2xl transition-all duration-300 flex-shrink-0 border ${showFilters ? 'bg-wa-green text-slate-950 border-wa-green shadow-lg shadow-wa-green/20' : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'}`}
              >
                <SlidersHorizontalIcon size={20} />
              </button>
              <button
                onClick={() => setShowMap(!showMap)}
                className={`p-3 rounded-2xl transition-all duration-300 flex-shrink-0 flex items-center gap-2 border ${showMap ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10 hover:bg-indigo-500/20'}`}
              >
                <MapPinIcon size={20} />
                <span className="hidden md:inline font-black text-[10px] uppercase tracking-widest">Carte</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-2 bg-white p-4 rounded-2xl shadow-2xl border border-neutral-100 animate-fade-in space-y-4">
              {/* Catégories (mobile) */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 pt-2">
                {[{name: 'all', icon: 'Globe'}, ...categories].map(cat => {
                  const isActive = activeCategory === cat.name;
                  return (
                  <button
                    key={cat.id || 'all'}
                    onClick={() => { setActiveCategory(cat.name); setShowFilters(false); }}
                    className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl min-w-[80px] transition-all border-2 ${isActive ? 'border-wa-teal bg-wa-teal/5' : 'border-transparent bg-neutral-50 hover:bg-neutral-100'}`}
                  >
                    <CategoryIcon name={cat.icon || 'LayoutGrid'} size={24} className={isActive ? 'text-wa-teal' : 'text-neutral-500'} />
                    <span className={`text-[10px] font-black ${isActive ? 'text-wa-teal' : 'text-neutral-500'}`}>{cat.name === 'all' ? 'TOUT' : cat.name.toUpperCase()}</span>
                  </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-neutral-50 flex flex-wrap gap-2">
                <span className="text-[10px] font-black text-neutral-400 w-full mb-1 uppercase tracking-widest">Trier par</span>
                <button onClick={() => setSortBy('boost')} className={`px-4 py-2 rounded-xl text-xs font-bold ${sortBy === 'boost' ? 'bg-wa-teal/10 text-wa-teal' : 'bg-neutral-50 text-neutral-500'}`}>Suggérés</button>
                <button onClick={() => setSortBy('distance')} className={`px-4 py-2 rounded-xl text-xs font-bold ${sortBy === 'distance' ? 'bg-wa-teal/10 text-wa-teal' : 'bg-neutral-50 text-neutral-500'}`}>À proximité</button>
                <button onClick={() => setSortBy('newest')} className={`px-4 py-2 rounded-xl text-xs font-bold ${sortBy === 'newest' ? 'bg-wa-teal/10 text-wa-teal' : 'bg-neutral-50 text-neutral-500'}`}>Nouveautés</button>
                <button onClick={() => setSortBy('price_asc')} className={`px-4 py-2 rounded-xl text-xs font-bold ${sortBy === 'price_asc' ? 'bg-wa-teal/10 text-wa-teal' : 'bg-neutral-50 text-neutral-500'}`}>Prix croissant</button>
              </div>
            </div>
          )}
        </section>
      )}

      {showMap && (
        <div className="animate-fade-in space-y-8" id="map-section">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Explorez la <span className="text-wa-teal">Ville</span></h2>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Trouvez vos boutiques favorites</p>
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
               <div className="w-10 h-10 rounded-xl bg-wa-teal/10 flex items-center justify-center text-wa-teal">
                  <MapPinIcon size={20} />
               </div>
               <p className="text-xs font-black text-slate-600 uppercase tracking-widest">{stores.length} Boutiques</p>
            </div>
          </div>
          <div className="h-[60vh] md:h-[70vh] w-full rounded-[32px] overflow-hidden border border-white/50 shadow-2xl relative bg-neutral-100 group">
             <InteractiveMap 
               mode="view"
               initialPos={userLocation ? [userLocation.latitude, userLocation.longitude] : [4.0511, 9.7679]}
               userPos={userLocation ? [userLocation.latitude, userLocation.longitude] : null}
               userAccuracy={userLocation?.accuracy}
               showSatellite={true}
               stores={stores}
             />
             
             {/* Floating Activate GPS Button */}
             {!userLocation && (
               <button 
                 onClick={requestLocation}
                 className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10] px-8 py-4 bg-wa-teal text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-wa-teal/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
               >
                 <MapPinIcon size={16} /> Activer ma position
               </button>
             )}
             
             {userLocation && (
               <button 
                 onClick={requestLocation}
                 className="absolute bottom-10 right-10 z-[10] p-4 bg-white text-wa-teal rounded-2xl shadow-xl hover:bg-wa-teal hover:text-white transition-all border-2 border-white"
                 title="Recalculer ma position"
               >
                 <MapPinIcon size={20} />
               </button>
             )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          AIRBNB STYLE CATEGORY RIBBON (MOBILE)
      ════════════════════════════════════════════ */}
      {!sq && !showMap && categories.length > 0 && !overrideProducts && (
        <div className="lg:hidden -mx-4 px-4 bg-slate-950/90 backdrop-blur-xl sticky top-[70px] z-30 shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-slate-800/80 pt-3 pb-2 animate-fade-in overflow-hidden">
          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory relative z-10 px-2">
            {[{name: 'all', icon: 'Globe'}, ...categories].map(cat => {
              const isActive = activeCategory === cat.name;
              const displayName = cat.name === 'all' ? 'Tout' : cat.name;
              return (
                <button
                  key={cat.id || 'all'}
                  onClick={() => { setActiveCategory(cat.name); }}
                  className={`flex flex-col items-center gap-1.5 flex-shrink-0 snap-start pb-2 relative min-w-[70px] transition-all group`}
                >
                  <div className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="activeMobileCatBg"
                        className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/20 to-teal-500/25 rounded-2xl blur-[2px] border border-emerald-500/30"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className={`relative z-10 p-2.5 rounded-xl transition-all duration-300 ${isActive ? 'text-[#25D366] scale-110' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      <CategoryIcon name={cat.name} size={22} />
                    </div>
                  </div>
                  <span className={`relative z-10 text-[10px] font-mono uppercase tracking-widest transition-colors ${isActive ? 'text-white font-black' : 'text-slate-400 font-medium'}`}>
                    {displayName.split(' ')[0]}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeMobileIndicatorLine"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#25D366] rounded-t-full shadow-[0_0_12px_#25D366]" 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          2. GLOBAL SEARCH RESULTS (STORES + PRODUCTS)
      ════════════════════════════════════════════ */}
      {sq && !overrideProducts && (
        <div className="space-y-10">
          {/* Section Boutiques dans la recherche */}
          {meiliResults.stores.length > 0 && (
            <section className="animate-fade-in">
              <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <StoreIcon size={14} /> Boutiques trouvées
              </h2>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {meiliResults.stores.map(store => (
                  <Link key={store.id} href={`/boutique/${store.slug}`} className="flex-shrink-0 group w-20 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-100 group-hover:border-wa-teal transition-all p-[2px] bg-white">
                      <img src={store.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover rounded-full" alt={store.name} />
                    </div>
                    <span className="text-[10px] font-bold text-neutral-800 mt-2 truncate w-full text-center">{store.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Section Produits dans la recherche */}
          <section className="animate-fade-in">
            <h2 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShoppingBagIcon size={16} /> Produits trouvés ({filteredProducts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((item, idx) => (
                <ProductCard key={item.id} item={item} idx={idx} trackProductView={trackProductView} formatDistance={formatDistance} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          3. REGULAR FEED (WHATSAPP STATUS + ALL PRODUCTS)
      ════════════════════════════════════════════ */}
      {(!searchQuery || overrideProducts) && (
        <>
          {/* Vestyle Life (Stories Style) */}
          {!overrideProducts && stores.length > 0 && (
            <section className="animate-fade-in">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-8 bg-wa-teal rounded-full" />
                  <div>
                    <h2 className="text-xl font-black text-neutral-900 tracking-tight">Boutiques <span className="text-wa-teal">à la Une</span></h2>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">En direct des boutiques</p>
                  </div>
                </div>
                <Link href="/boutiques" className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Tout voir</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {stores.map(store => (
                  <Link key={store.id} href={`/boutique/${store.slug}`} className="flex-shrink-0 group flex flex-col items-center w-20 relative">
                    <div className={`relative p-[3px] rounded-full transition-all duration-500 ${store.is_boosted ? 'bg-gradient-to-tr from-wa-teal to-emerald-400' : 'border-2 border-neutral-200'}`}>
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-white shadow-lg">
                        <img src={store.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={store.name} />
                      </div>
                      {/* Pulse Live indicator */}
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-wa-teal rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-neutral-800 mt-2 truncate w-full text-center uppercase tracking-tighter group-hover:text-wa-teal">{store.name}</span>
                    {store.is_boosted && (
                      <span className="absolute -top-1 right-0 bg-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-sm">LIVE</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Feed Layout: Sidebar Categories + Product Grid */}
          <section className="animate-fade-in flex flex-col lg:flex-row gap-8">
            
            {/* Desktop Sidebar */}
            {!overrideProducts && (
              <div className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-[160px] bg-slate-950/90 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-slate-800/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                  {/* Decorative ambient background light */}
                  <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#25D366]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#25D366]/15 transition-all duration-700" />
                  
                  <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#25D366] mb-6 font-black flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                    SÉLECTEUR DE FLUX
                  </h3>
                  
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                    {[{name: 'all', icon: 'Globe'}, ...categories].map(cat => {
                      const isActive = activeCategory === cat.name;
                      return (
                        <button
                          key={cat.id || 'all'}
                          onClick={() => { setActiveCategory(cat.name); }}
                          className={`w-full text-left px-4 py-4 rounded-2xl font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-4 relative group`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeDesktopCatBg"
                              className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/60 border border-emerald-500/30 rounded-2xl shadow-[0_0_20px_rgba(37,211,102,0.05)]"
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <div className={`relative z-10 p-2.5 rounded-xl transition-all ${isActive ? 'bg-[#25D366]/15 text-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.2)]' : 'bg-slate-900 text-slate-400 group-hover:bg-slate-800 group-hover:text-slate-200'}`}>
                            <CategoryIcon name={cat.name} size={18} />
                          </div>
                          <span className={`relative z-10 font-bold ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                            {cat.name === 'all' ? 'Toutes catégories' : cat.name}
                          </span>
                          {isActive && (
                            <motion.div 
                              layoutId="activeDesktopIndicator"
                              className="relative z-10 ml-auto"
                            >
                              <ChevronRightIcon className="text-[#25D366] drop-shadow-[0_0_8px_#25D366]" size={16} />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* All Products Feed */}
            <div className="flex-1">
              {/* Header: Résultats IA ou titre normal */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                {overrideProducts ? (
                  <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 p-4 rounded-3xl border border-emerald-100 shadow-sm w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                        <SparklesIcon size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-lg">Résultats IA</h3>
                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest">{overrideProducts.length} produit(s) trouvé(s)</p>
                      </div>
                    </div>
                    <button
                      onClick={onClearVisualSearch}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 font-bold text-sm rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                      <XIcon size={16} /> Fermer
                    </button>
                  </div>
                ) : (
                  <>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-10 bg-wa-teal rounded-full shadow-[0_0_10px_#128c7e]" />
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Tous les <span className="text-wa-teal">Produits</span></h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{filteredProducts.length} produits disponibles</p>
                    </div>
                  </div>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedProducts.map((item, idx) => (
                  <ProductCard key={item.id} item={item} idx={idx} trackProductView={trackProductView} formatDistance={formatDistance} />
                ))}
              </div>

              {visibleCount < filteredProducts.length && (
                <div className="mt-12 flex justify-center">
                  <button 
                    onClick={() => setVisibleCount(v => v + 12)}
                    className="group flex items-center gap-3 px-10 py-5 bg-white border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-wa-teal hover:text-wa-teal transition-all shadow-sm hover:shadow-xl active:scale-95"
                  >
                    <span>Charger plus de pépites</span>
                    <Zap size={14} className="group-hover:animate-bounce" />
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

