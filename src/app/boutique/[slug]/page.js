'use client';
import { use, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import X from 'lucide-react/dist/esm/icons/x';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Send from 'lucide-react/dist/esm/icons/send';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Package from 'lucide-react/dist/esm/icons/package';
import Store from 'lucide-react/dist/esm/icons/store';
import Truck from 'lucide-react/dist/esm/icons/truck';
import Search from 'lucide-react/dist/esm/icons/search';
import History from 'lucide-react/dist/esm/icons/history';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Info from 'lucide-react/dist/esm/icons/info';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Star from 'lucide-react/dist/esm/icons/star';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Phone from 'lucide-react/dist/esm/icons/phone';
import { supabase } from '@/lib/supabase';
import { publicProductsIndex } from '@/lib/meilisearch';

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
        <Store size={48} />
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
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 selection:bg-wa-teal selection:text-white font-sans overflow-x-hidden">
      
      {/* Premium Promotion Banner */}
      {store.custom_message && (
        <div className="relative z-[60] bg-gray-900 text-white py-2 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap items-center gap-10">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest">{store.custom_message}</span>
                <Star size={10} className="text-wa-teal fill-wa-teal" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Navigation */}
      <nav className={`fixed inset-x-0 h-20 bg-white/80 backdrop-blur-2xl z-50 border-b border-gray-100 px-4 transition-all ${store.custom_message ? 'top-8' : 'top-0'}`}>
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform hover:rotate-3" style={{ backgroundColor: themeColor }}>
              {store.logo_url ? <img src={store.logo_url} className="w-full h-full object-cover rounded-2xl" alt="" /> : store.name.charAt(0)}
            </div>
            <span className="text-lg font-black tracking-tighter uppercase hidden sm:block">{store.name}</span>
          </div>

          <div className="flex-1 max-w-md hidden md:flex items-center bg-gray-50 rounded-2xl px-4 py-2 border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher un délice..." 
              className="bg-transparent border-none outline-none px-3 w-full text-sm font-medium"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(true)} className="p-3 text-gray-400 hover:text-gray-900 transition-all rounded-2xl hover:bg-gray-50">
              <History size={22} />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-3 px-5 py-2.5 bg-gray-900 text-white rounded-2xl shadow-xl shadow-gray-200 transition-all hover:scale-105 active:scale-95"
            >
              <ShoppingCart size={18} />
              <span className="font-black text-sm hidden sm:inline">Panier</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-wa-teal rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        
        {/* Dynamic Hero Section */}
        <section className="relative w-full aspect-[21/9] sm:aspect-[3/1] max-h-[500px] overflow-hidden group">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img 
            src={store.banner_url || "https://images.unsplash.com/photo-1550966841-3ee3ad359051?auto=format&fit=crop&q=80"} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt="Hero" 
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 text-white">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 animate-fade-in">Bienvenue chez {store.name}</span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-2xl">{store.name}</h1>
            <p className="text-sm md:text-lg max-w-2xl font-medium opacity-90 drop-shadow-lg leading-relaxed">{store.description || 'Découvrez nos créations uniques.'}</p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
          
          {/* Versatile Category Navigation */}
          <div className="sticky top-20 z-40 py-4 bg-[#FDFDFD]/90 backdrop-blur-md -mx-4 px-4 border-b border-gray-50 flex items-center gap-3 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === 'all' 
                ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' 
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Tout voir
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeCategory === cat.id 
                  ? 'bg-white text-gray-900 border-2 border-gray-900 shadow-xl' 
                  : 'text-gray-400 hover:text-gray-900'
                }`}
                style={activeCategory === cat.id ? { borderColor: themeColor, color: themeColor } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Elegant Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {isSearching ? (
               <div className="col-span-full py-20 text-center space-y-4">
                 <Loader2 size={48} className="mx-auto text-wa-teal animate-spin" />
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Recherche en cours...</p>
               </div>
            ) : displayProducts.length === 0 ? (
               <div className="col-span-full py-20 text-center space-y-4">
                 <Package size={64} className="mx-auto text-gray-100" />
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aucun article trouvé</p>
               </div>
            ) : (
              displayProducts.map(p => (
                <div 
                  key={p.id} 
                  className="group flex flex-col bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(p);
                    // Increment product view count (fire-and-forget)
                    (async () => { try { await supabase.rpc('increment_product_view', { prod_id: p.id }); } catch (_) {} })();
                  }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.name} />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200">
                        <Package size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                       <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">
                         {categories.find(c => c.id === p.category_id)?.name || 'Nouveauté'}
                       </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <div className="space-y-1">
                      <h3 className="font-black text-lg tracking-tight text-gray-900 group-hover:text-wa-teal transition-colors">{p.name}</h3>
                      <p className="text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed">{p.description}</p>
                    </div>
                    <div className="pt-4 mt-auto flex items-center justify-between">
                      <p className="text-xl font-black tracking-tighter" style={{ color: themeColor }}>{p.price.toLocaleString()} F</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                        className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-gray-200"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button for Cart (Mobile) */}
      {totalItems > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-4 bg-gray-900 text-white px-6 py-4 rounded-3xl shadow-2xl shadow-gray-900/40 hover:scale-105 active:scale-95 transition-all md:hidden"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <span className="font-black text-sm">{totalItems}</span>
          </div>
          <div className="h-4 w-px bg-white/20"></div>
          <span className="font-black text-sm">{total.toLocaleString()} F</span>
        </button>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-10 p-2 bg-white/80 rounded-full hover:bg-white shadow-lg transition-all">
              <X size={20} />
            </button>
            <div className="w-full md:w-1/2 aspect-square md:aspect-auto overflow-hidden bg-gray-50">
              <img src={selectedProduct.image_url} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 p-8 sm:p-12 overflow-y-auto space-y-8 text-left">
              <div className="space-y-4">
                <span className="px-4 py-1 bg-wa-chat text-wa-teal-dark text-[10px] font-black uppercase tracking-widest rounded-full">
                   {categories.find(c => c.id === selectedProduct.category_id)?.name}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-none">{selectedProduct.name}</h2>
                <p className="text-2xl font-black text-wa-teal-dark">{selectedProduct.price.toLocaleString()} FCFA</p>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description du produit</p>
                <p className="text-gray-500 font-medium leading-relaxed">{selectedProduct.description || 'Une pièce d\'exception sélectionnée avec soin par notre équipe.'}</p>
              </div>

              <div className="flex items-center gap-6 py-6 border-y border-gray-50">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Clock size={20} /></div>
                   <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Disponibilité</p>
                     <p className="text-sm font-black text-gray-900">{selectedProduct.stock_quantity > 0 ? 'En stock' : 'Rupture'}</p>
                   </div>
                </div>
              </div>

              <button 
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                className="w-full py-5 bg-gray-900 text-white font-black rounded-[24px] shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
              >
                <ShoppingCart size={22} />
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[110] transition-transform duration-500 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between border-b border-gray-50">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Votre Panier</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{totalItems} articles sélectionnés</p>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
              <ShoppingCart size={64} />
              <p className="font-black uppercase tracking-widest text-sm">Panier Vide</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={item.image_url} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-gray-900 truncate">{item.name}</h4>
                  <p className="text-sm font-bold text-gray-400">{item.quantity} x {item.price.toLocaleString()} F</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-200 hover:text-rose-500 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 bg-gray-50/50 space-y-6">
            <div className="space-y-4">
              <input 
                placeholder="Votre nom complet" 
                className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-wa-teal transition-all"
                value={checkoutData.customerName}
                onChange={e => setCheckoutData({...checkoutData, customerName: e.target.value})}
              />
              <input 
                placeholder="Numéro de téléphone" 
                className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-wa-teal transition-all"
                value={checkoutData.customerPhone}
                onChange={e => setCheckoutData({...checkoutData, customerPhone: e.target.value})}
              />
              <textarea 
                placeholder="Adresse de livraison exacte" 
                className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-wa-teal transition-all resize-none h-24"
                value={checkoutData.customerAddress}
                onChange={e => setCheckoutData({...checkoutData, customerAddress: e.target.value})}
              ></textarea>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total à payer</span>
              <span className="text-2xl font-black text-gray-900">{total.toLocaleString()} FCFA</span>
            </div>

            <button 
              onClick={checkoutWhatsApp}
              disabled={isSubmittingOrder}
              className="w-full py-4 bg-[#25D366] text-white font-black rounded-3xl shadow-xl shadow-[#25D366]/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              {isSubmittingOrder ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              Commander via WhatsApp
            </button>
          </div>
        )}
      </div>

      <footer className="py-20 bg-gray-50 px-4 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xs">V</div>
          <span className="text-sm font-black tracking-widest uppercase">VesTyle</span>
        </div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Plateforme sécurisée — Propulsé par Google AI</p>
      </footer>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowHistory(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[40px] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Vos Commandes</h3>
              <button onClick={() => setShowHistory(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">Aucun historique</p>
              ) : (
                recentOrders.map(o => (
                  <div key={o.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-gray-900">#{o.id.slice(0,8)}</p>
                      <p className="text-[10px] font-bold text-gray-400">{new Date(o.date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm font-black text-wa-teal">{o.total.toLocaleString()} F</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
