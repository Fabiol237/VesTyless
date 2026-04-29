'use client';
import { use, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { 
  ShoppingCart, X, Trash2, Send, Loader2, Package, 
  ExternalLink, Store, Truck, MapPin, Search, 
  ChevronRight, Info, AlertCircle, History, Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './Storefront.module.css';

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

  const [checkoutData, setCheckoutData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
  });
  
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState([]);

  // Load recent orders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`vestyle_orders_${slug}`);
    if (saved) {
      try {
        setRecentOrders(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing recent orders", e);
      }
    }
  }, [slug]);

  const saveOrderToHistory = (order) => {
    const updated = [order, ...recentOrders].slice(0, 5);
    setRecentOrders(updated);
    localStorage.setItem(`vestyle_orders_${slug}`, JSON.stringify(updated));
  };

  const fetchStoreData = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .single();

      if (storeData) {
        setStore(storeData);
        
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('store_id', storeData.id);
        setCategories(categoriesData || []);

        // Fetch products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .eq('is_active', true);
        
        setProducts(productsData || []);
      }
    } catch (err) {
      console.error("Error fetching store data:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  // Apply branding (Font and Title)
  useEffect(() => {
    if (store) {
      document.title = `${store.name} | VesTyle`;
      if (store.font_family) {
        document.documentElement.style.setProperty('--store-font', store.font_family);
      }
    }
  }, [store]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category_id === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) return;
    
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    setSelectedPreview(cart.slice(0, 4));
  }, [cart]);

  const handleCheckoutChange = (field, value) => {
    setCheckoutData((prev) => ({ ...prev, [field]: value }));
  };

  const checkoutWhatsApp = async () => {
    if (isSubmittingOrder) return;
    if (!cart.length) return;
    if (!store?.whatsapp_number) {
      setCheckoutError("Le vendeur n'a pas configuré son numero WhatsApp.");
      return;
    }

    const { customerName, customerPhone, customerEmail, customerAddress } = checkoutData;

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setCheckoutError('Merci de remplir votre nom, telephone et adresse de livraison.');
      return;
    }

    setCheckoutError('');
    setCheckoutSuccess('');
    setTrackingUrl('');
    setIsSubmittingOrder(true);

    let createdTrackingUrl = '';

    try {
      // 1. Create order in database
      const { data: newOrder, error: orderError } = await supabase.from('orders').insert({
        store_id: store.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        total_amount: Number(total),
        status: 'pending',
        order_items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      }).select().single();

      if (orderError) throw orderError;

      // 2. Generate Internal Tracking URL (Shipday removed as requested)
      createdTrackingUrl = `${window.location.origin}/track/${newOrder.id}`;
      setTrackingUrl(createdTrackingUrl);

      // 3. Save to history
      saveOrderToHistory({
        id: newOrder.id,
        date: new Date().toISOString(),
        total: total,
        items: cart.length,
        trackingUrl: createdTrackingUrl
      });

      // 4. Send WhatsApp Message
      let message = `Bonjour! Voici ma commande sur *${store.name}*:\n\n`;
      message += `👤 *Client:* ${customerName}\n`;
      message += `📞 *Tel:* ${customerPhone}\n`;
      if (customerEmail) message += `📧 *Email:* ${customerEmail}\n`;
      message += `📍 *Adresse:* ${customerAddress}\n\n`;
      message += `🛒 *Produits:*\n`;
      cart.forEach(item => {
        message += `- ${item.name} x${item.quantity} : ${(item.price * item.quantity).toLocaleString()} FCFA\n`;
      });
      message += `\n💰 *Total:* ${total.toLocaleString()} FCFA\n`;
      message += `\nPropulsé par VesTyle`;

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${store.whatsapp_number.replace(/\s+/g, '')}?text=${encodedMessage}`, '_blank');

      setCheckoutSuccess('Commande envoyée ! Redirection WhatsApp...');
      setCart([]);
      setCheckoutData({ customerName: '', customerPhone: '', customerEmail: '', customerAddress: '' });
    } catch (err) {
      console.error("Checkout error:", err);
      setCheckoutError("Erreur lors de la création de la commande. Veuillez réessayer.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loaderPage}>
        <Loader2 className={styles.spin} size={48} />
        <p>Préparation de votre expérience chez {slug}...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className={styles.errorPage}>
        <AlertCircle size={64} color="#ef4444" />
        <h1>Boutique introuvable</h1>
        <p>Désolé, cette boutique n&apos;existe pas ou a été désactivée.</p>
        <button onClick={() => window.location.href = '/'} className={styles.backBtn}>
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  return (
    <div 
      className={styles.store} 
      style={{ 
        '--store-primary': store.theme_color,
        '--store-secondary': store.secondary_color || '#F3F4F6',
        fontFamily: 'var(--store-font), Inter, sans-serif'
      }}
    >
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.brand}>
            <div className={styles.logo} style={{ backgroundColor: store.theme_color }}>
              {store.logo_url ? <img src={store.logo_url} alt={store.name} /> : store.name.charAt(0)}
            </div>
            <span>{store.name}</span>
          </div>

          <div className={styles.searchBar}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <button className={styles.iconBtn} onClick={() => setShowHistory(true)} title="Historique">
              <History size={22} />
            </button>
            <button className={styles.cartBtn} onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className={styles.cartBadge} style={{ backgroundColor: store.theme_color }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Dynamic Selection Bar */}
        <section className={styles.topSelectionBar}>
          <div className={styles.selectionIntro}>
            <div className={styles.selectionIcon} style={{ backgroundColor: `${store.theme_color}15`, color: store.theme_color }}>
              <Store size={18} />
            </div>
            <div>
              <strong>Votre sélection en direct</strong>
              <p>
                {totalItems > 0
                  ? `${totalItems} article(s) prêts pour la commande.`
                  : 'Parcourez la boutique et ajoutez des articles.'}
              </p>
            </div>
          </div>

          <div className={styles.selectionMeta}>
            <div className={styles.metaPill}>
              <Truck size={16} />
              <span>Livraison rapide garantie</span>
            </div>
          </div>

          <div className={styles.selectionProducts}>
            {selectedPreview.length > 0 ? (
              selectedPreview.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.selectionItem}
                  onClick={() => setIsCartOpen(true)}
                >
                  <div className={styles.selectionThumb}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <Package size={16} />
                    )}
                  </div>
                  <div className={styles.selectionText}>
                    <strong>{item.name}</strong>
                    <span>{item.price.toLocaleString()} FCFA</span>
                  </div>
                </button>
              ))
            ) : (
              <div className={styles.selectionEmpty}>
                Aucun produit sélectionné.
              </div>
            )}

            <button
              type="button"
              className={styles.selectionCartButton}
              style={{ backgroundColor: store.theme_color }}
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart size={18} />
              <span>{totalItems > 0 ? `Commander (${total.toLocaleString()} F)` : 'Voir le panier'}</span>
            </button>
          </div>
        </section>

        {/* Hero with Banner and Custom Message */}
        <section 
          className={styles.hero} 
          style={{ 
            background: store.banner_url ? `url(${store.banner_url}) center/cover no-repeat` : `linear-gradient(135deg, ${store.theme_color} 0%, #000 100%)`,
          }}
        >
          <div className={styles.heroOverlay}>
            <h1>{store.name}</h1>
            <p>{store.description || 'Bienvenue dans notre boutique.'}</p>
            {store.custom_message && (
              <div className={styles.customMsg}>
                <Info size={16} />
                <span>{store.custom_message}</span>
              </div>
            )}
          </div>
        </section>

        {/* Categories Bar */}
        <div className={styles.categoryBar}>
          <button 
            className={activeCategory === 'all' ? styles.active : ''} 
            onClick={() => setActiveCategory('all')}
            style={activeCategory === 'all' ? { backgroundColor: store.theme_color } : {}}
          >
            Tout
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              className={activeCategory === cat.id ? styles.active : ''} 
              onClick={() => setActiveCategory(cat.id)}
              style={activeCategory === cat.id ? { backgroundColor: store.theme_color } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className={styles.productGrid}>
          {filteredProducts.length === 0 ? (
            <div className={styles.emptyProducts}>
              <Package size={48} />
              <p>Aucun produit ne correspond à votre recherche.</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className={styles.productCard} onClick={() => setSelectedProduct(product)}>
                <div className={styles.imageBox}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} />
                  ) : (
                    <div className={styles.placeholderImg}><Package size={48} /></div>
                  )}
                  {product.stock_quantity <= 0 && (
                    <div className={styles.outOfStockBadge}>ÉPUISÉ</div>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.catName}>
                    {categories.find(c => c.id === product.category_id)?.name || 'Produit'}
                  </span>
                  <h3>{product.name}</h3>
                  <p className={styles.price}>{product.price.toLocaleString()} FCFA</p>
                  <button 
                    className={styles.addBtn} 
                    style={{ backgroundColor: product.stock_quantity > 0 ? store.theme_color : '#ccc' }}
                    disabled={product.stock_quantity <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                  >
                    {product.stock_quantity > 0 ? 'Ajouter au panier' : 'Indisponible'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Sticky Floating Cart Button (Mobile) */}
        {totalItems > 0 && (
          <button
            className={styles.stickyCart}
            style={{ backgroundColor: store.theme_color }}
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart size={20} />
            <span>Voir le panier · {total.toLocaleString()} FCFA</span>
            <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '100px', padding: '2px 10px', fontSize: '0.82rem', fontWeight: 900 }}>
              {totalItems}
            </span>
          </button>
        )}
      </main>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
          <div className={styles.productModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setSelectedProduct(null)}><X /></button>
            <div className={styles.modalBody}>
              <div className={styles.modalImage}>
                <img src={selectedProduct.image_url || '/placeholder.png'} alt={selectedProduct.name} />
              </div>
              <div className={styles.modalInfo}>
                <h2>{selectedProduct.name}</h2>
                <p className={styles.modalPrice}>{selectedProduct.price.toLocaleString()} FCFA</p>
                <div className={styles.modalDesc}>
                  <h4>Description</h4>
                  <p>{selectedProduct.description || 'Aucune description disponible.'}</p>
                </div>
                <div className={styles.modalStock}>
                  <Clock size={16} />
                  <span>{selectedProduct.stock_quantity > 0 ? `En stock (${selectedProduct.stock_quantity} restants)` : 'Rupture de stock'}</span>
                </div>
                <button 
                  className={styles.modalAddBtn} 
                  style={{ backgroundColor: selectedProduct.stock_quantity > 0 ? store.theme_color : '#ccc' }}
                  disabled={selectedProduct.stock_quantity <= 0}
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                >
                  <ShoppingCart size={20} />
                  {selectedProduct.stock_quantity > 0 ? 'Ajouter au panier' : 'Indisponible'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <div className={`${styles.cartDrawer} ${isCartOpen ? styles.cartOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <h3>Mon Panier</h3>
          <button onClick={() => setIsCartOpen(false)}><X size={24} /></button>
        </div>
        
        <div className={styles.drawerBody}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingCart size={48} />
              <p>Votre panier est vide</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <img src={item.image_url || '/placeholder.png'} alt={item.name} />
                <div className={styles.itemInfo}>
                  <h4>{item.name}</h4>
                  <p>{item.quantity} x {item.price.toLocaleString()} FCFA</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className={styles.removeBtn}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.drawerFooter}>
            <div className={styles.checkoutForm}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Nom complet *</label>
                <input
                  className={styles.fieldInput}
                  value={checkoutData.customerName}
                  onChange={(e) => handleCheckoutChange('customerName', e.target.value)}
                  placeholder="Ex: Aicha Konate"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Téléphone *</label>
                <input
                  className={styles.fieldInput}
                  value={checkoutData.customerPhone}
                  onChange={(e) => handleCheckoutChange('customerPhone', e.target.value)}
                  placeholder="Ex: +225 07 00 00 00 00"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email (optionnel)</label>
                <input
                  className={styles.fieldInput}
                  type="email"
                  value={checkoutData.customerEmail}
                  onChange={(e) => handleCheckoutChange('customerEmail', e.target.value)}
                  placeholder="Ex: aicha@email.com"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Adresse de livraison *</label>
                <textarea
                  className={styles.fieldArea}
                  rows={2}
                  value={checkoutData.customerAddress}
                  onChange={(e) => handleCheckoutChange('customerAddress', e.target.value)}
                  placeholder="Quartier, rue, repère..."
                />
              </div>
            </div>

            <div className={styles.totalRow}>
              <span>Total</span>
              <span>{total.toLocaleString()} FCFA</span>
            </div>

            {checkoutError && <p className={styles.checkoutError}>{checkoutError}</p>}
            {checkoutSuccess && <p className={styles.checkoutSuccess}>{checkoutSuccess}</p>}

            <button 
              className={styles.checkoutBtn} 
              style={{ backgroundColor: '#25D366' }}
              disabled={isSubmittingOrder}
              onClick={checkoutWhatsApp}
            >
              {isSubmittingOrder ? <Loader2 size={18} className={styles.spin} /> : <Send size={18} />}
              <span>{isSubmittingOrder ? 'Traitement...' : 'Commander via WhatsApp'}</span>
            </button>
            <p className={styles.checkoutHint}>Le vendeur vous recontactera sur WhatsApp.</p>
          </div>
        )}
      </div>

      {/* History Drawer */}
      <div className={`${styles.cartDrawer} ${showHistory ? styles.cartOpen : ''}`} style={{ right: showHistory ? '0' : '-400px' }}>
        <div className={styles.drawerHeader}>
          <h3>Historique des commandes</h3>
          <button onClick={() => setShowHistory(false)}><X size={24} /></button>
        </div>
        <div className={styles.drawerBody}>
          {recentOrders.length === 0 ? (
            <div className={styles.emptyCart}>
              <History size={48} />
              <p>Aucune commande récente.</p>
            </div>
          ) : (
            recentOrders.map(order => (
              <div key={order.id} className={styles.historyItem}>
                <div className={styles.historyMeta}>
                  <strong>Commande #{order.id.slice(0, 8)}</strong>
                  <span>{new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div className={styles.historyDetails}>
                  <span>{order.items} article(s) • {order.total.toLocaleString()} F</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {(isCartOpen || showHistory) && <div className={styles.overlay} onClick={() => { setIsCartOpen(false); setShowHistory(false); }}></div>}

      <footer className={styles.footer}>
        <p>Propulsé par <strong>VesTyle</strong> — Plateforme E-commerce & Logistique</p>
      </footer>
    </div>
  );
}
