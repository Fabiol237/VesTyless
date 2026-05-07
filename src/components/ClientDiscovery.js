'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { publicProductsIndex, publicStoresIndex } from '@/lib/meilisearch';
import Link from 'next/link';
import VoiceSearchButton from '@/components/VoiceSearchButton';
import { useDistance } from '@/hooks/useDistance';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import { normalizeStr } from '@/lib/searchUtils';
import ProductCard from '@/components/ProductCard';
import dynamic from 'next/dynamic';

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
  onExternalSearchChange = null
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
  const [categorySearch, setCategorySearch] = useState('');

  // Suggestions pour l'autocomplétion de la recherche principale
  const mainSuggestions = useMemo(() => {
    const items = [];
    categories.forEach(c => items.push({ label: c.name || c, value: c.name || c, type: 'Catégorie', emoji: '🏷️' }));
    stores.slice(0, 20).forEach(s => items.push({ label: s.name, value: s.name, type: 'Boutique', emoji: '🏪', sublabel: s.city || '' }));
    products.slice(0, 40).forEach(p => items.push({ label: p.name, value: p.name, type: 'Produit', emoji: '🛍️', sublabel: p.stores?.name || '' }));
    // Dédoublonner par label
    return [...new Map(items.map(i => [normalizeStr(i.label), i])).values()];
  }, [products, stores, categories]);
  
  const { formatDistance, getDistanceKm, requestLocation, userLocation } = useDistance();
  
  // Ask for location quietly once
  useEffect(() => {
    if (!userLocation) requestLocation();
  }, [userLocation, requestLocation]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Produits réels avec boutique + catégorie, triés par boost puis vues puis date
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select(`
          id, name, price, image_url, created_at, category_id, is_active,
          is_boosted, is_promo, daily_views,
          stores ( id, name, slug, logo_url, latitude, longitude ),
          categories ( name )
        `)
        .eq('is_active', true)
        .order('is_boosted', { ascending: false })
        .order('is_promo', { ascending: false })
        .order('daily_views', { ascending: false })
        .order('created_at', { ascending: false });

      if (prodErr) throw prodErr;

      // Récupérer uniquement les boutiques qui ont au moins un produit actif
      // On passe par les produits pour extraire les store_id uniques avec produits
      const { data: storeIdsData } = await supabase
        .from('products')
        .select('store_id')
        .eq('is_active', true);

      const activeStoreIds = [...new Set((storeIdsData || []).map(p => p.store_id))];

      let storeData = [];
      if (activeStoreIds.length > 0) {
        const { data: sd, error: storeErr } = await supabase
          .from('stores')
          .select('id, name, slug, logo_url, city, is_boosted, daily_views, latitude, longitude')
          .in('id', activeStoreIds)
          .order('is_boosted', { ascending: false })
          .order('daily_views', { ascending: false });

        if (storeErr) throw storeErr;
        storeData = sd || [];
      }

      // Catégories réelles
      const { data: catData } = await supabase.from('categories').select('*');

      const normalized = (prodData || []).map(p => ({
        ...p,
        category: p.categories?.name || 'Autre',
      }));

      setProducts(normalized);
      setStores(storeData || []);

      if (catData && catData.length > 0) {
        setCategories(catData);
      } else {
        // Dériver les catégories depuis les produits si la table est vide
        const uniqueCats = [...new Set(normalized.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCats.map(name => ({ id: name, name })));
      }
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError('Impossible de charger les données. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Incrémenter vues produit (fire-and-forget)
  const trackProductView = useCallback((productId) => {
    safeRpc(supabase.rpc('increment_product_view', { prod_id: productId }));
  }, []);

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
      if (!searchQuery.trim()) {
        setMeiliResults({ products: [], stores: [] });
        return;
      }

      setIsSearching(true);
      try {
        // Parallel search for products and stores
        const [prodSearch, storeSearch] = await Promise.all([
          publicProductsIndex.search(searchQuery, {
            limit: 12,
            attributesToHighlight: ['name'],
          }),
          publicStoresIndex.search(searchQuery, {
            limit: 4,
          })
        ]);
        
        let fetchedProducts = prodSearch.hits;
        let fetchedStores = storeSearch.hits;

        // Fallback SQL (Tolérance de frappe) si Meilisearch est vide
        if (fetchedProducts.length === 0) {
          const { data: rpcData } = await supabase.rpc('search_products_v2', { search_term: searchQuery });
          if (rpcData && rpcData.length > 0) fetchedProducts = rpcData;
        }

        setMeiliResults({
          products: fetchedProducts.map(hit => {
            const local = products.find(p => p.id === hit.id);
            return local || { ...hit, stores: { name: hit.store_name || hit.stores?.name, slug: hit.store_slug || hit.stores?.slug } };
          }),
          stores: fetchedStores
        });
      } catch (err) {
        console.error('Meilisearch search error:', err);
        // Fallback SQL total si Meilisearch est down
        const { data: rpcData } = await supabase.rpc('search_products_v2', { search_term: searchQuery });
        if (rpcData && rpcData.length > 0) {
          setMeiliResults({ products: rpcData, stores: [] });
        } else {
          setMeiliResults({ products: [], stores: [] });
        }
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, products]);

  // Produits filtrés + triés côté client
  const filteredProducts = useMemo(() => {
    let result = searchQuery.trim() && meiliResults.products.length > 0 ? [...meiliResults.products] : [...products];

    // Client-side fallback ultra robuste si Meili/SQL sont vides
    if (searchQuery.trim() && meiliResults.products.length === 0) {
      const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      
      const scoredProducts = products.map(p => {
        const pName = (p.name || '').toLowerCase();
        const sName = (p.stores?.name || '').toLowerCase();
        const pCat = (p.category || '').toLowerCase();
        const fullText = `${pName} ${sName} ${pCat}`;
        
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
          if (a.is_boosted !== b.is_boosted) return b.is_boosted ? 1 : -1;
          if (a.is_promo !== b.is_promo) return b.is_promo ? 1 : -1;
          return b.daily_views - a.daily_views;
        });
    }
    return result;
  }, [products, searchQuery, activeCategory, sortBy, meiliResults.products, userLocation, getDistanceKm]);

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
    <div className="space-y-12 pb-20">

      {/* ═══════════════════════════════════════════
          1. WHATSAPP STYLE SEARCH BAR
      ════════════════════════════════════════════ */}
      <section className="sticky top-[70px] z-40 transition-all duration-500 py-4 bg-[#F8F9FA]/80 backdrop-blur-xl">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-wa-teal to-wa-green rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white px-4 py-3 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-3">
            <SearchAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSelect={(s) => setSearchQuery(s.value)}
              suggestions={mainSuggestions}
              placeholder="Chercher le meilleur de Douala..."
              className="flex-1"
              inputClassName="w-full pl-10 pr-20 py-3 bg-transparent rounded-xl text-base font-medium border-none outline-none focus:ring-0 placeholder-neutral-400"
              dropdownOffset="mt-3"
              leftIcon={<SearchIcon className={`transition-colors ${isSearching ? 'text-wa-teal' : 'text-neutral-400'}`} size={20} />}
            >
              <div className="absolute right-3 flex items-center gap-2">
                {isSearching && (
                  <div className="w-5 h-5 border-2 border-wa-teal border-t-transparent rounded-full animate-spin"></div>
                )}
                <VoiceSearchButton
                  onInterimResult={(text) => setSearchQuery(text)}
                  onResult={(text) => setSearchQuery(text)}
                  className="p-1"
                />
              </div>
            </SearchAutocomplete>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl transition-all flex-shrink-0 ${showFilters ? 'bg-wa-teal text-white shadow-lg shadow-wa-teal/30' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`}
            >
              <SlidersHorizontalIcon size={20} />
            </button>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`p-3 rounded-xl transition-all flex-shrink-0 flex items-center gap-2 ${showMap ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
            >
              <MapPinIcon size={20} />
              <span className="hidden md:inline font-bold text-xs uppercase tracking-widest">Carte</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-2 bg-white p-4 rounded-2xl shadow-2xl border border-neutral-100 animate-fade-in space-y-4">
            {/* Barre de recherche catégories (mobile) */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                placeholder="Chercher une catégorie..."
                value={categorySearch}
                onChange={e => setCategorySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-wa-teal/20 placeholder-neutral-400"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {['all', ...categories.map(c => c.name || c)]
                .filter(cat => cat === 'all' || normalizeStr(cat).includes(normalizeStr(categorySearch)))
                .map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setCategorySearch(''); }}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-black transition-all ${activeCategory === cat ? 'bg-wa-teal text-white shadow-md' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
                >
                  {cat === 'all' ? 'TOUT' : cat.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-50 flex flex-wrap gap-2">
              <span className="text-[10px] font-black text-neutral-400 w-full mb-1 uppercase tracking-widest">Trier par</span>
              <button onClick={() => setSortBy('boost')} className={`px-4 py-2 rounded-xl text-xs font-bold ${sortBy === 'boost' ? 'bg-wa-teal/10 text-wa-teal' : 'bg-neutral-50 text-neutral-500'}`}>Suggérés</button>
              <button onClick={() => setSortBy('distance')} className={`px-4 py-2 rounded-xl text-xs font-bold ${sortBy === 'distance' ? 'bg-wa-teal/10 text-wa-teal' : 'bg-neutral-50 text-neutral-500'}`}>À proximité 📍</button>
              <button onClick={() => setSortBy('newest')} className={`px-4 py-2 rounded-xl text-xs font-bold ${sortBy === 'newest' ? 'bg-wa-teal/10 text-wa-teal' : 'bg-neutral-50 text-neutral-500'}`}>Nouveautés</button>
              <button onClick={() => setSortBy('price_asc')} className={`px-4 py-2 rounded-xl text-xs font-bold ${sortBy === 'price_asc' ? 'bg-wa-teal/10 text-wa-teal' : 'bg-neutral-50 text-neutral-500'}`}>Prix croissant</button>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════
          MAP VIEW (GLOBAL DISCOVERY)
      ════════════════════════════════════════════ */}
      {showMap && (
        <div className="animate-fade-in space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-neutral-900">Boutiques à proximité</h2>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{stores.length} boutiques localisées</p>
          </div>
          <div className="h-[60vh] md:h-[70vh] w-full rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative bg-neutral-100 group">
             <InteractiveMap 
               mode="view"
               initialPos={userLocation ? [userLocation.latitude, userLocation.longitude] : [4.0511, 9.7679]}
               userPos={userLocation ? [userLocation.latitude, userLocation.longitude] : null}
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
          MOBILE ONLY — Catégories scrollables (discret)
      ════════════════════════════════════════════ */}
      {!searchQuery && !showMap && categories.length > 0 && (
        <div className="lg:hidden -mx-1 animate-fade-in">
          {/* Petit champ de filtre discret */}
          <div className="relative mb-2">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" size={13} />
            <input
              type="text"
              placeholder="Filtrer les catégories…"
              value={categorySearch}
              onChange={e => setCategorySearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white border border-neutral-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-wa-teal/20 placeholder-neutral-300 shadow-sm"
            />
          </div>
          {/* Pills scrollables */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['all', ...categories.map(c => c.name || c)]
              .filter(cat => cat === 'all' || normalizeStr(cat).includes(normalizeStr(categorySearch)))
              .map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setCategorySearch(''); }}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-wa-teal text-white shadow-sm'
                      : 'bg-white border border-neutral-200 text-neutral-500 hover:border-wa-teal hover:text-wa-teal'
                  }`}
                >
                  {cat === 'all' ? 'Tout' : cat}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          2. GLOBAL SEARCH RESULTS (STORES + PRODUCTS)
      ════════════════════════════════════════════ */}
      {searchQuery && (
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
      {!searchQuery && !showMap && (
        <>
          {/* Status Style Stores */}
          {stores.length > 0 && (
            <section className="animate-fade-in">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">En ligne maintenant</h2>
                <Link href="/boutiques" className="text-xs font-bold text-wa-teal">Voir tout</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {stores.map(store => (
                  <Link key={store.id} href={`/boutique/${store.slug}`} className="flex-shrink-0 group flex flex-col items-center w-20">
                    <div className={`relative p-[3px] rounded-full border-2 ${store.is_boosted ? 'border-wa-teal' : 'border-neutral-200'} group-hover:border-wa-teal transition-all duration-500`}>
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100 border border-white shadow-sm">
                        <img src={store.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={store.name} />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-neutral-800 mt-2 truncate w-full text-center group-hover:text-wa-teal">{store.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Feed Layout: Sidebar Categories + Product Grid */}
          <section className="animate-fade-in flex flex-col lg:flex-row gap-8">
            
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-[160px] bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
                <h3 className="font-black text-lg mb-4">Catégories</h3>
                {/* Barre de recherche catégories (desktop) */}
                <div className="relative mb-4">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                  <input
                    type="text"
                    placeholder="Filtrer..."
                    value={categorySearch}
                    onChange={e => setCategorySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-wa-teal/20 placeholder-neutral-400"
                  />
                </div>
                <div className="space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar">
                  {['all', ...categories.map(c => c.name || c)]
                    .filter(cat => cat === 'all' || normalizeStr(cat).includes(normalizeStr(categorySearch)))
                    .map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setCategorySearch(''); }}
                      className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeCategory === cat ? 'bg-wa-teal/10 text-wa-teal' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}`}
                    >
                      {cat === 'all' ? 'Toutes les catégories' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* All Products Feed */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-neutral-900">À la une</h2>
                <div className="text-sm font-bold text-neutral-500">{filteredProducts.length} produits</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((item, idx) => (
                  <ProductCard key={item.id} item={item} idx={idx} trackProductView={trackProductView} formatDistance={formatDistance} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

