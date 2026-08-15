'use client';
import { useState, useEffect, useMemo, useCallback, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Store, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import StoreChatWidget from '@/components/StoreChatWidget';
import DownloadCatalogButton from '@/components/DownloadCatalogButton';

// ─── Système de Templates (nouveau) ─────────────────────────────────────────
import { getTemplate, detectTemplate } from '../../../templates';

// ─── Thèmes visuels (réduits au rôle de palette couleurs) ────────────────────
import { getThemeById } from './themes';

// ─── Utilitaires ─────────────────────────────────────────────────────────────
import { normalizeStoreModules } from '@/lib/storeModuleUtils.mjs';

// ─── Cache mémoire (persiste tant que l'onglet navigateur est ouvert) ─────────
const storeCache = {};

// ─────────────────────────────────────────────────────────────────────────────
// ÉCRAN DE CHARGEMENT
// ─────────────────────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg,#25D366,#128C7E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', animation: 'pulse 1.5s ease-in-out infinite', boxShadow: '0 8px 32px rgba(37,211,102,0.4)' }}>🛍️</div>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(37,211,102,0.3)', borderTop: '3px solid #25D366', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#54656f', fontSize: '13px', fontWeight: '600', letterSpacing: '0.05em' }}>Chargement de la boutique...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BARRE DE RAFRAÎCHISSEMENT
// ─────────────────────────────────────────────────────────────────────────────
function RefreshBar() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, height: '3px', background: 'linear-gradient(90deg, #25D366, #128C7E, #25D366)', backgroundSize: '200% 100%', animation: 'refreshSlide 1.2s ease-in-out infinite', pointerEvents: 'none' }}>
      <style>{`@keyframes refreshSlide { 0%{background-position:100% 0} 100%{background-position:-100% 0} }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function StorefrontClient({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug;

  const [store, setStore]         = useState(null);
  const [modules, setModules]     = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const [shared, setShared]       = useState(false);

  const router = useRouter();
  const { cart, addToCart, getCartTotal } = useCart();
  const cartCount = cart.reduce((s, i) => s + (i.quantity || 1), 0);

  // ── Responsive ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Chargement initial depuis le cache ────────────────────────────────
  useEffect(() => {
    const cached = storeCache[slug];
    if (cached) {
      setStore(cached.store);
      setModules(cached.modules);
      setLoading(false);
    }
  }, [slug]);

  // ── Sync Couleur Bannière / Theme-Color Barre de Statut Mobile ───────
  useEffect(() => {
    if (store) {
      const primaryColor = store.theme_color || '#1e3a8a';
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      meta.content = primaryColor;
    }
  }, [store]);

  // ── Chargement / rafraîchissement Supabase ────────────────────────────
  useEffect(() => {
    const load = async () => {
      const hasCached = !!(storeCache[slug]?.store);
      if (hasCached) setRefreshing(true);

      try {
        const { data: storeData, error: storeErr } = await supabase
          .from('stores').select('*').eq('slug', slug).single();

        if (storeErr || !storeData) {
          setStore(null);
          setLoading(false);
          return;
        }

        const { data: modulesData } = await supabase
          .from('store_modules')
          .select('id, type, config, position, is_active')
          .eq('store_id', storeData.id)
          .eq('is_active', true)
          .order('position', { ascending: true });

        const active = normalizeStoreModules(
          (modulesData || []).filter(m => m.is_active !== false)
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        );

        setStore(storeData);
        setModules(active);
        storeCache[slug] = { store: storeData, modules: active };

        // Charger les produits en parallèle
        supabase.from('products').select('*')
          .eq('store_id', storeData.id).eq('is_active', true)
          .order('created_at', { ascending: false }).limit(40)
          .then(({ data }) => { if (data) setProducts(data); });

        // Compteur de vues (non bloquant)
        try { supabase.rpc('increment_store_view', { st_id: storeData.id }); } catch (_) {}
      } catch (err) {
        console.error('[StorefrontClient] Erreur:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    load();
  }, [slug]);

  // ── Actions globales ──────────────────────────────────────────────────
  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: store?.name, url: window.location.href }); } catch (_) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleDirections = () => {
    if (store?.latitude && store?.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`);
    }
  };

  const handleAddToCart = useCallback((product) => {
    if (addToCart) addToCart(product);
    else {
      // Fallback : dispatch event pour CartContext
      window.dispatchEvent(new CustomEvent('vestyle:add-to-cart', { detail: product }));
    }
  }, [addToCart]);

  // ── Premier chargement ────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;

  if (!store) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Store size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
        <h1 style={{ fontWeight: '900', fontSize: '22px', color: '#0f172a', margin: '0 0 8px' }}>Boutique introuvable</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Cette boutique n'existe pas ou a été désactivée.</p>
        <Link href="/" style={{ background: '#6366f1', color: '#fff', padding: '12px 28px', borderRadius: '16px', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>
          Retour à l'accueil
        </Link>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RÉSOLUTION DU THÈME VISUEL
  // Les 20 thèmes (theme_00 à theme_21) fournissent UNIQUEMENT la palette couleurs.
  // La mise en page (layout) est gérée par le Template détecté automatiquement.
  // ─────────────────────────────────────────────────────────────────────────
  const themeId = store.shop_theme || store.theme || 'theme_00';
  const themeConfig = getThemeById(themeId);

  const isDarkTheme = ['#0A0A0A','#120A00','#0D0600','#18181b','#050505','#0f0f1a','#111827'].includes(themeConfig.bgColor);

  // Palette couleurs injectée dans le template
  const themeVars = {
    '--prim':  themeConfig.primaryColor  || '#128C7E',
    '--acc':   themeConfig.accentColor   || '#25D366',
    '--bg':    themeConfig.bgColor       || '#ffffff',
    '--fg':    isDarkTheme ? '#ffffff' : '#0f172a',
    '--fg2':   isDarkTheme ? 'rgba(255,255,255,0.55)' : '#6b7280',
    '--border':isDarkTheme ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)',
    '--font':  themeConfig.font ? `'${themeConfig.font}', Inter, sans-serif` : 'Inter, sans-serif',
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DÉTECTION AUTOMATIQUE DU TEMPLATE
  // Aucune modification de la BD nécessaire.
  // ─────────────────────────────────────────────────────────────────────────
  const TemplateComponent = getTemplate(modules, store);

  // Props communes à tous les templates
  const templateProps = {
    store,
    themeVars,
    storeId: store.id,
    isMobile,
    productsProp: products,
    onAddToCart: handleAddToCart,
    onOpenCart: () => router.push('/cart'),
    cartCount,
    handleShare,
    handleDirections,
    shared,
    currency: store.currency || 'FCFA',
  };

  return (
    <>
      {refreshing && <RefreshBar />}

      {/* Injection de la font du thème et couvrance totale tout en haut */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${(themeConfig.font || 'Inter').replace(/ /g,'+')}:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background-color: ${themeVars['--bg'] || '#1e3a8a'}; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${themeVars['--prim']}40; border-radius: 4px; }
        .store-header-fullbleed { padding-top: max(env(safe-area-inset-top), 16px); }
      `}</style>

      {/* ── TEMPLATE PRINCIPAL ── */}
      <TemplateComponent {...templateProps} />

      {/* ── BOUTON EXPORT CATALOGUE PDF MARCHE ── */}
      <div className="fixed bottom-6 left-6 z-[9999]">
        <DownloadCatalogButton store={store} products={products} variant="compact" />
      </div>

      {/* ── BOUTON PANIER FLOTTANT ── */}
      {cartCount > 0 && (
        <button
          onClick={() => router.push('/cart')}
          style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
            background: themeVars['--prim'], color: '#fff', border: 'none', borderRadius: '50%',
            width: '60px', height: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 30px ${themeVars['--prim']}60`, cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            animation: 'cartPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <ShoppingCart size={24} />
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: '#ef4444', color: '#fff',
            fontSize: '11px', fontWeight: 800,
            width: '22px', height: '22px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', border: '2px solid #fff',
          }}>
            {cartCount}
          </span>
        </button>
      )}

      {/* ── WIDGET CHAT ── */}
      {store?.chat_enabled !== false && (
        <StoreChatWidget
          storeId={store.id}
          storeSlug={store.slug}
          primaryColor={themeVars['--prim']}
          storeName={store.name || 'Boutique'}
        />
      )}

      <style>{`
        @keyframes cartPop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
