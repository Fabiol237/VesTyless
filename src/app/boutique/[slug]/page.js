'use client';
import { use, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { publicProductsIndex } from '@/lib/meilisearch';
import Link from 'next/link';

// Bulletproof SVG Icons (Bypassing Lucide/Turbopack bug)
const ShoppingCartIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);
const XIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const Trash2Icon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);
const SendIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);
const Loader2Icon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
);
const PackageIcon = ({ size = 48, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.27 6.96 8.73 5.05 8.73-5.05"/><path d="M12 22.08V12"/></svg>
);
const TruckIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><path d="M9 18h6"/><circle cx="19" cy="18" r="2"/><path d="M21 18v-3a2 2 0 0 0-2-2h-5"/><polyline points="10 13 10 11 15 11 15 13"/><path d="M17 13h4l1 2v3h-2"/></svg>
);
const SearchIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const HistoryIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);
const ClockIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const ChevronRightIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);
const StarIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const MapPinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
const PhoneIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
const ZapIcon = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);

export default function Storefront({ params }) {
  const routeParams = useParams();
  const resolvedParams = params && typeof params.then === 'function' ? use(params) : params;
  const slug = String(routeParams?.slug ?? resolvedParams?.slug ?? '');
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [meiliResults, setMeiliResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [checkoutData, setCheckoutData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
  });
  
  const [checkoutError, setCheckoutError] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Load recent orders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`vestyle_orders_${slug}`);
    if (saved) {
      try { setRecentOrders(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, [slug]);

  const fetchStoreData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const { data: storeData } = await supabase.from('stores').select('*').eq('slug', slug).single();
        if (storeData) {
          setStore(storeData);
          // Increment store view count (fire-and-forget)
          (async () => { try { await supabase.rpc('increment_store_view', { st_id: storeData.id }); } catch (_) {} })();

          const { data: catData } = await supabase.from('categories').select('*').eq('store_id', storeData.id);
        setCategories(catData || []);
        const { data: prodData } = await supabase.from('products').select('*').eq('store_id', storeData.id).eq('is_active', true);
        setProducts(prodData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchStoreData(); }, [fetchStoreData]);

  // Recherche Meilisearch pour la boutique
  useEffect(() => {
    if (!store) return;

    if (searchQuery.trim() === '') {
      setMeiliResults(null);
      setIsSearching(false);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        const filters = [`store_id = ${store.id}`];
        if (activeCategory !== 'all') {
          filters.push(`category_id = "${activeCategory}"`);
        }

        const response = await publicProductsIndex.search(searchQuery, {
          filter: filters.join(' AND '),
          limit: 20
        });
        setMeiliResults(response.hits);
      } catch (err) {
        console.error('Meilisearch Search Error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, store, activeCategory]);

  const displayProducts = useMemo(() => {
    if (meiliResults) return meiliResults;
    
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) {
      return products.filter(p => activeCategory === 'all' || p.category_id === activeCategory);
    }

    const scoredProducts = products.map(p => {
      const pName = (p.name || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();
      const fullText = `${pName} ${pDesc}`;
      
      let score = 0;
      terms.forEach(t => {
        if (fullText.includes(t)) score += 1;
        else if (t.length > 3) {
          const p1 = t.substring(0, t.length - 1);
          const p2 = t.substring(1);
          if (fullText.includes(p1) || fullText.includes(p2)) score += 0.5;
        }
      });
      return { product: p, score };
    }).filter(item => {
      const matchesCategory = activeCategory === 'all' || item.product.category_id === activeCategory;
      return item.score > 0 && matchesCategory;
    });

    scoredProducts.sort((a, b) => b.score - a.score);
    return scoredProducts.map(item => item.product);
  }, [products, activeCategory, searchQuery, meiliResults]);

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) return;
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const checkoutWhatsApp = async () => {
    if (isSubmittingOrder || !cart.length) return;
    const { customerName, customerPhone, customerAddress } = checkoutData;

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setCheckoutError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const { data: newOrder, error: orderError } = await supabase.from('orders').insert({
        store_id: store.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        total_amount: Number(total),
        status: 'pending',
        order_items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
      }).select().single();

      if (orderError) throw orderError;

      // WhatsApp Message
      let message = `*COMMANDE ${store.name.toUpperCase()}*\n`;
      message += `--------------------------\n`;
      message += `👤 Client: ${customerName}\n`;
      message += `📞 Tel: ${customerPhone}\n`;
      message += `📍 Adresse: ${customerAddress}\n\n`;
      message += `*PANIER:*\n`;
      cart.forEach(item => {
        message += `• ${item.name} (x${item.quantity}) : ${(item.price * item.quantity).toLocaleString()} F\n`;
      });
      message += `\n*TOTAL: ${total.toLocaleString()} FCFA*\n`;
      message += `--------------------------\n`;
      message += `_Propulsé par VesTyle_`;

      window.open(`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
      setCart([]);
      setIsCartOpen(false);
    } catch (err) {
      setCheckoutError("Erreur lors de la validation.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="w-12 h-12 border-4 border-wa-teal border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-black uppercase tracking-widest text-gray-400">Expérience en cours...</p>
    </div>
  );

  if (!store) return (
    <div className="h-screen flex flex-col items-center justify-center p-10 text-center gap-6">
      <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
        <PackageIcon size={48} />
      </div>
      <div>
        <h1 className="text-3xl font-black text-gray-900">Boutique introuvable</h1>
        <p className="text-gray-500 mt-2">Désolé, cette adresse n&apos;existe pas.</p>
      </div>
      <button onClick={() => window.location.href = '/'} className="px-8 py-4 bg-gray-900 text-white font-black rounded-2xl">Retour</button>
    </div>
  );

  const themeColor = store.theme_color || '#128C7E';

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 selection:bg-wa-teal selection:text-white font-sans overflow-x-hidden">
      
      {/* 1. GLASS NAVIGATION — Sticky & Intelligent */}
      <nav className={`fixed inset-x-0 z-[100] transition-all duration-500 px-4 md:px-8 flex items-center justify-between ${isScrolled ? 'h-16 bg-white/90 backdrop-blur-xl shadow-lg border-b border-neutral-100' : 'h-24 bg-transparent'}`}>
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white hover:text-neutral-900 transition-all">
             <ChevronRightIcon className="rotate-180" size={20} />
          </Link>
          <div className={`flex items-center gap-3 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
             <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-md">
                <img src={store.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover" alt="" />
             </div>
             <span className={`font-black tracking-tight text-sm uppercase ${isScrolled ? 'text-neutral-900' : 'text-white'}`}>{store.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowHistory(true)} className={`p-3 rounded-2xl transition-all ${isScrolled ? 'text-neutral-400 hover:text-neutral-900 bg-neutral-50' : 'text-white/80 hover:text-white bg-white/10 backdrop-blur-md border border-white/20'}`}>
            <HistoryIcon size={20} />
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className={`relative flex items-center gap-3 px-6 py-2.5 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-xl ${isScrolled ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'}`}
          >
            <ShoppingCartIcon size={18} />
            <span className="hidden sm:inline">Panier</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-wa-teal rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white text-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* 2. DYNAMIC HERO — High Impact */}
      <section className="relative h-[60vh] sm:h-[50vh] min-h-[400px] w-full overflow-hidden bg-neutral-900">
        <img 
          src={store.banner_url || "https://images.unsplash.com/photo-1550966841-3ee3ad359051?auto=format&fit=crop&q=80"} 
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105" 
          alt="Hero" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FA] via-transparent to-black/30"></div>
        
        <div className="absolute bottom-0 inset-x-0 p-6 md:p-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-end gap-6 md:gap-10 animate-fade-in">
             {/* Large Store Logo with Status Ring */}
             <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-wa-teal to-wa-green rounded-[2.5rem] blur opacity-70 animate-pulse"></div>
                <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-[2.2rem] p-1 shadow-2xl overflow-hidden">
                   <img src={store.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover rounded-[2rem]" alt={store.name} />
                </div>
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-wa-green border-4 border-white rounded-full"></div>
             </div>
             
             <div className="flex-1 pb-4">
                <div className="flex items-center gap-3 mb-2">
                   <span className="px-3 py-1 bg-wa-teal text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-wa-teal/20">Boutique Vérifiée</span>
                   <div className="flex items-center gap-1 text-white/80 text-xs font-bold">
                      <StarIcon size={14} className="text-amber-400 fill-amber-400" /> 4.9 (128 avis)
                   </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-neutral-900 md:text-white tracking-tight drop-shadow-sm mb-4 leading-none">{store.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-neutral-500 md:text-white/70 text-sm font-medium">
                   <div className="flex items-center gap-2"><MapPinIcon size={16} /> {store.city || 'Douala, Cameroun'}</div>
                   <div className="flex items-center gap-2"><PhoneIcon size={16} /> {store.whatsapp_number}</div>
                   <div className="flex items-center gap-2"><TruckIcon size={16} /> Livraison Express</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT FEED — Sidebar + Products */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* STICKY SIDEBAR (Desktop) / TOP BAR (Mobile) */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-8">
              {/* Category Nav */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-neutral-100">
                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-6">Rayons</h3>
                <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                  <button 
                    onClick={() => setActiveCategory('all')}
                    className={`flex-shrink-0 lg:w-full text-left px-5 py-3.5 rounded-2xl font-black text-sm transition-all ${activeCategory === 'all' ? 'bg-wa-teal/10 text-wa-teal' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}`}
                  >
                    Tout explorer
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex-shrink-0 lg:w-full text-left px-5 py-3.5 rounded-2xl font-black text-sm transition-all ${activeCategory === cat.id ? 'bg-wa-teal/10 text-wa-teal' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search in Store */}
              <div className="relative group">
                 <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Chercher ici..." 
                   className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-neutral-100 text-sm font-medium focus:ring-2 focus:ring-wa-teal/20 outline-none transition-all shadow-sm group-hover:shadow-md"
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
              </div>
            </div>
          </aside>

          {/* PRODUCT FEED */}
          <div className="flex-1 space-y-10">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-neutral-900">
                   {activeCategory === 'all' ? 'Sélection du moment' : categories.find(c => c.id === activeCategory)?.name}
                </h2>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{displayProducts.length} ARTICLES</div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {isSearching ? (
                   <div className="col-span-full py-20 flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-wa-teal border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Analyse du stock...</p>
                   </div>
                ) : displayProducts.length === 0 ? (
                   <div className="col-span-full py-20 flex flex-col items-center text-center space-y-6">
                      <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-300">
                         <PackageIcon size={48} />
                      </div>
                      <div className="space-y-2">
                         <p className="text-xl font-black text-neutral-800">Aucun produit ici</p>
                         <p className="text-neutral-500 font-medium max-w-xs">Nous n&apos;avons pas trouvé d&apos;articles correspondant à votre sélection.</p>
                      </div>
                      <button onClick={() => { setActiveCategory('all'); setSearchQuery(''); }} className="text-wa-teal font-black text-sm uppercase tracking-widest">Voir tout le catalogue</button>
                   </div>
                ) : (
                   displayProducts.map((p, idx) => (
                      <ProductCard key={p.id} p={p} idx={idx} addToCart={addToCart} setSelectedProduct={setSelectedProduct} themeColor={themeColor} />
                   ))
                )}
             </div>
          </div>
        </div>
      </main>

      {/* 4. MODALS & UI — Premium Layers */}
      <ProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} addToCart={addToCart} themeColor={themeColor} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} removeFromCart={removeFromCart} total={total} totalItems={totalItems} checkoutData={checkoutData} setCheckoutData={setCheckoutData} isSubmitting={isSubmittingOrder} onCheckout={checkoutWhatsApp} themeColor={themeColor} />
      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} orders={recentOrders} />

      {/* Floating Cart Button (Mobile) */}
      {totalItems > 0 && (
         <button 
           onClick={() => setIsCartOpen(true)}
           className="fixed bottom-8 right-8 z-[90] flex items-center gap-4 bg-neutral-900 text-white px-8 py-5 rounded-[2.5rem] shadow-2xl hover:scale-105 active:scale-95 transition-all md:hidden"
         >
           <ShoppingCartIcon size={24} />
           <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black text-white/50 uppercase mb-1">{totalItems} Articles</span>
              <span className="text-lg font-black">{total.toLocaleString()} F</span>
           </div>
         </button>
      )}

      <footer className="py-20 bg-neutral-900 text-white px-4 text-center mt-20">
         <div className="max-w-4xl mx-auto space-y-8 opacity-80">
            <div className="flex items-center justify-center gap-2">
               <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-lg">V</div>
               <span className="text-xl font-black tracking-[0.2em] uppercase">VesTyle</span>
            </div>
            <p className="text-sm font-medium text-white/50 max-w-md mx-auto">Propulsé par VesTyle — La solution SaaS leader pour les boutiques et restaurants premium au Cameroun.</p>
            <div className="pt-8 border-t border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
               © 2026 VesTyle Technology
            </div>
         </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════
// SUB-COMPONENTS — Isolated for Performance
// ═══════════════════════════════════════════

function ProductCard({ p, idx, addToCart, setSelectedProduct, themeColor }) {
  return (
    <div 
      className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-neutral-100 hover:shadow-2xl hover:shadow-wa-teal/5 transition-all duration-500 animate-fade-in"
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(p)}>
        <img src={p.image_url || '/placeholder-product.png'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           {p.is_promo && (
              <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-black rounded-lg shadow-lg">PROMO</span>
           )}
           {p.is_boosted && (
              <span className="px-3 py-1 bg-wa-teal text-white text-[10px] font-black rounded-lg shadow-lg flex items-center gap-1"><ZapIcon size={10} /> À LA UNE</span>
           )}
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); addToCart(p); }}
          className="absolute bottom-4 right-4 w-12 h-12 bg-white text-neutral-900 rounded-full flex items-center justify-center shadow-xl translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-wa-teal hover:text-white"
        >
          <ShoppingCartIcon size={22} />
        </button>
      </div>

      <div className="p-7 space-y-4 flex-1 flex flex-col">
        <div className="space-y-1 cursor-pointer" onClick={() => setSelectedProduct(p)}>
          <h3 className="font-black text-lg tracking-tight text-neutral-900 group-hover:text-wa-teal transition-colors line-clamp-1">{p.name}</h3>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">{p.categories?.name || 'Collection'}</p>
        </div>
        <div className="pt-4 mt-auto border-t border-neutral-50 flex items-center justify-between">
          <div className="flex flex-col">
             {p.old_price && <span className="text-[10px] text-neutral-400 font-bold line-through">{p.old_price.toLocaleString()} F</span>}
             <span className="text-xl font-black tracking-tighter" style={{ color: themeColor }}>{Number(p.price).toLocaleString()} F</span>
          </div>
          <div className="flex items-center gap-1">
             <StarIcon size={12} className="text-amber-400 fill-amber-400" />
             <span className="text-[10px] font-black text-neutral-400">4.9</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ product, isOpen, onClose, addToCart, themeColor }) {
  if (!isOpen || !product) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-3 bg-white/80 rounded-full hover:bg-white shadow-lg transition-all"><XIcon size={24} /></button>
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto overflow-hidden">
          <img src={product.image_url} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="flex-1 p-8 md:p-16 overflow-y-auto space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <span className="px-4 py-1.5 bg-neutral-100 text-neutral-500 text-[10px] font-black uppercase tracking-widest rounded-full">Détails de l&apos;article</span>
               {product.is_active && <span className="flex items-center gap-1.5 text-wa-green text-[10px] font-black uppercase tracking-widest"><div className="w-2 h-2 bg-wa-green rounded-full animate-pulse"></div> En Stock</span>}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tighter leading-none">{product.name}</h2>
            <p className="text-3xl font-black tracking-tight" style={{ color: themeColor }}>{Number(product.price).toLocaleString()} FCFA</p>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Description</p>
            <p className="text-neutral-500 font-medium leading-relaxed text-lg">{product.description || 'Un produit d&apos;exception sélectionné pour vous.'}</p>
          </div>
          <div className="flex items-center gap-6 py-8 border-y border-neutral-100">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400"><PackageIcon size={24} /></div>
                <div>
                   <p className="text-[10px] font-bold text-neutral-400 uppercase">Qualité</p>
                   <p className="text-sm font-black text-neutral-900">Garantie</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400"><TruckIcon size={24} /></div>
                <div>
                   <p className="text-[10px] font-bold text-neutral-400 uppercase">Livraison</p>
                   <p className="text-sm font-black text-neutral-900">24/48h</p>
                </div>
             </div>
          </div>
          <button 
            onClick={() => { addToCart(product); onClose(); }}
            className="w-full py-6 bg-neutral-900 text-white font-black rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
          >
            <ShoppingCartIcon size={24} />
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ isOpen, onClose, cart, removeFromCart, total, totalItems, checkoutData, setCheckoutData, isSubmitting, onCheckout, themeColor }) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[160] transition-transform duration-500 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between border-b border-neutral-50 bg-neutral-50/50">
          <div>
            <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Votre Panier</h3>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">{totalItems} articles</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm"><XIcon size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
              <div className="w-32 h-32 bg-neutral-100 rounded-full flex items-center justify-center"><ShoppingCartIcon size={64} /></div>
              <p className="font-black uppercase tracking-widest text-sm">Le panier est vide</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-5 group">
                <div className="w-24 h-24 bg-neutral-50 rounded-[1.5rem] overflow-hidden flex-shrink-0 border border-neutral-100">
                  <img src={item.image_url} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-neutral-900 truncate leading-tight mb-1">{item.name}</h4>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-tighter mb-2">{item.quantity} x {Number(item.price).toLocaleString()} F</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">Supprimer</button>
                </div>
                <div className="font-black text-sm">{(item.price * item.quantity).toLocaleString()} F</div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 bg-neutral-50 border-t border-neutral-100 space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-2">Informations de livraison</p>
              <div className="space-y-2">
                <input placeholder="Nom complet" className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-wa-teal/20 transition-all" value={checkoutData.customerName} onChange={e => setCheckoutData({...checkoutData, customerName: e.target.value})} />
                <input placeholder="Téléphone (WhatsApp)" className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-wa-teal/20 transition-all" value={checkoutData.customerPhone} onChange={e => setCheckoutData({...checkoutData, customerPhone: e.target.value})} />
                <textarea placeholder="Quartier / Précisions livraison" className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-wa-teal/20 transition-all resize-none h-24" value={checkoutData.customerAddress} onChange={e => setCheckoutData({...checkoutData, customerAddress: e.target.value})}></textarea>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
              <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">Total de la commande</span>
              <span className="text-3xl font-black text-neutral-900">{total.toLocaleString()} F</span>
            </div>

            <button 
              onClick={onCheckout}
              disabled={isSubmitting}
              className="w-full py-5 bg-[#25D366] text-white font-black rounded-[2rem] shadow-xl shadow-[#25D366]/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-lg"
            >
              {isSubmitting ? <Loader2Icon className="animate-spin" /> : <SendIcon size={24} />}
              Envoyer la commande
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function HistoryModal({ isOpen, onClose, orders }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-[3rem] p-8 md:p-12 space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Historique</h3>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-xl transition-all"><X size={24} /></button>
        </div>
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
          {orders.length === 0 ? (
            <div className="text-center py-10 opacity-30">
               <History size={48} className="mx-auto mb-4" />
               <p className="font-black uppercase tracking-widest text-xs">Aucune commande</p>
            </div>
          ) : (
            orders.map(o => (
              <div key={o.id} className="p-5 bg-neutral-50 rounded-2xl flex items-center justify-between border border-neutral-100">
                <div>
                  <p className="text-xs font-black text-neutral-900 tracking-tighter">#{o.id.slice(0,8).toUpperCase()}</p>
                  <p className="text-[10px] font-bold text-neutral-400 mt-1">{new Date(o.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-wa-teal">{o.total.toLocaleString()} F</p>
                  <span className="text-[8px] font-black bg-wa-chat text-wa-teal-dark px-2 py-0.5 rounded-full uppercase">Terminé</span>
                </div>
              </div>
            ))
          )}
        </div>
        <button onClick={onClose} className="w-full py-4 bg-neutral-900 text-white font-black rounded-2xl">Fermer</button>
      </div>
    </div>
  );
}
