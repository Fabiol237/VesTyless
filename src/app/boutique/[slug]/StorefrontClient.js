'use client';
import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Store } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import StoreChatWidget from '@/components/StoreChatWidget';

// ─── Import de tous les modules (Anciens & Nouveaux Blocs) ──────────────────
import ModuleVitrine from '@/components/modules/ModuleVitrine';
import ModuleCatalogue from '@/components/modules/ModuleCatalogue';
import ModuleReservation from '@/components/modules/ModuleReservation';
import ModulePortfolio from '@/components/modules/ModulePortfolio';
import ModuleBilletterie from '@/components/modules/ModuleBilletterie';
import ModuleRestaurant from '@/components/modules/ModuleRestaurant';
import ModuleServices from '@/components/modules/ModuleServices';
import ModuleLinks from '@/components/modules/ModuleLinks';
import ModuleTestimonials from '@/components/modules/ModuleTestimonials';
import ModuleContact from '@/components/modules/ModuleContact';
import ModuleNewsletter from '@/components/modules/ModuleNewsletter';
import ModuleDevis from '@/components/modules/ModuleDevis';
import ModuleAbonnement from '@/components/modules/ModuleAbonnement';

// Nouveaux blocs premium
import HeroBlock from '@/components/blocks/HeroBlock';
import CarouselBlock from '@/components/blocks/CarouselBlock';
import OfferingGridBlock from '@/components/blocks/OfferingGridBlock';
import RichTextBlock from '@/components/blocks/RichTextBlock';
import TestimonialSliderBlock from '@/components/blocks/TestimonialSliderBlock';
import StatsBarBlock from '@/components/blocks/StatsBarBlock';
import FaqAccordionBlock from '@/components/blocks/FaqAccordionBlock';
import CountdownBlock from '@/components/blocks/CountdownBlock';
import VideoEmbedBlock from '@/components/blocks/VideoEmbedBlock';
import ImageGalleryBlock from '@/components/blocks/ImageGalleryBlock';
import DividerBlock from '@/components/blocks/DividerBlock';
import SpacerBlock from '@/components/blocks/SpacerBlock';
import ContactFormBlock from '@/components/blocks/ContactFormBlock';
import NewsletterSignupBlock from '@/components/blocks/NewsletterSignupBlock';
import SocialLinksBlock from '@/components/blocks/SocialLinksBlock';

const MODULE_RENDERERS = {
  // Anciens
  vitrine: ModuleVitrine, catalogue: ModuleCatalogue, lookbook: ModuleCatalogue,
  reservation: ModuleReservation, portfolio: ModulePortfolio, billetterie: ModuleBilletterie,
  restaurant: ModuleRestaurant, services: ModuleServices, properties: ModuleServices,
  links: ModuleLinks, testimonials: ModuleTestimonials, contact: ModuleContact,
  newsletter: ModuleNewsletter, devis: ModuleDevis, abonnement: ModuleAbonnement,
  // Nouveaux Blocs
  hero: HeroBlock,
  carousel: CarouselBlock,
  offeringGrid: OfferingGridBlock,
  richText: RichTextBlock,
  testimonialSlider: TestimonialSliderBlock,
  statsBar: StatsBarBlock,
  faqAccordion: FaqAccordionBlock,
  countdown: CountdownBlock,
  videoEmbed: VideoEmbedBlock,
  imageGallery: ImageGalleryBlock,
  divider: DividerBlock,
  spacer: SpacerBlock,
  contactForm: ContactFormBlock,
  newsletterSignup: NewsletterSignupBlock,
  socialLinks: SocialLinksBlock,
};

// ─── Import des Thèmes ──────────────────────────────────────────────────────
import { getThemeById } from './themes';
import StoreAIChat from '@/components/StoreAIChat';
import { normalizeStoreModules } from '@/lib/storeModuleUtils.mjs';
import { resolveThemeConfig } from '@/lib/themeResolver.mjs';

// ─── Correspondance Type de module → Groupe de page ─────────────────────────
// Chaque onglet (accueil, produits, promotions, profil) regroupe plusieurs types de modules.
// Cela permet de ne jamais avoir d'onglets en double et de s'adapter à chaque boutique.
const TAB_TYPE_MAP = {
  accueil:    ['vitrine', 'hero', 'carousel', 'imageGallery', 'richText', 'statsBar', 'videoEmbed', 'divider', 'spacer'],
  produits:   ['catalogue', 'lookbook', 'offeringGrid'],
  promotions: ['billetterie', 'countdown', 'newsletterSignup', 'newsletter', 'faqAccordion'],
  profil:     ['portfolio', 'contact', 'contactForm', 'services', 'properties', 'links',
               'testimonials', 'testimonialSlider', 'devis', 'abonnement', 'reservation',
               'restaurant', 'socialLinks'],
};
const DEFAULT_TAB_LABELS = {
  accueil: 'Accueil', produits: 'Boutique', promotions: 'Offres', profil: 'Profil',
};

// ─── Cache mémoire (persiste tant que l'onglet navigateur reste ouvert) ──────
// Permet d'afficher les données IMMÉDIATEMENT au retour sur la page,
// sans écran de chargement, tout en rafraîchissant en arrière-plan.
const storeCache = {}; // { [slug]: { store, modules } }

// ─── Écran de chargement (utilisé UNIQUEMENT à la toute première visite) ─────
function LoadingScreen() {
  return (
    <div style={{ minHeight:'100vh', background:'#f0f2f5', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px', fontFamily:'Inter, sans-serif' }}>
      <div style={{ width:'64px', height:'64px', borderRadius:'20px', background:'linear-gradient(135deg,#25D366,#128C7E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', animation:'pulse 1.5s ease-in-out infinite', boxShadow:'0 8px 32px rgba(37,211,102,0.4)' }}>🛍️</div>
      <div style={{ width:'40px', height:'40px', border:'3px solid rgba(37,211,102,0.3)', borderTop:'3px solid #25D366', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:'#54656f', fontSize:'13px', fontWeight:'600', letterSpacing:'0.05em' }}>Chargement de la boutique...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
    </div>
  );
}

// ─── Barre de progression discrète (rafraîchissement en arrière-plan) ─────────
function RefreshBar() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
      height: '3px', background: 'linear-gradient(90deg, #25D366, #128C7E, #25D366)',
      backgroundSize: '200% 100%',
      animation: 'refreshSlide 1.2s ease-in-out infinite',
      pointerEvents: 'none',
    }}>
      <style>{`@keyframes refreshSlide { 0%{background-position:100% 0} 100%{background-position:-100% 0} }`}</style>
    </div>
  );
}

// ─── Fallback de chargement de thème ──────────────────────────────────────────
function ThemeLoader() {
  return (
    <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,0,0,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}


import { use } from 'react';

// ─── Composant principal ─────────────────────────────────────────────────────
export default function StorefrontClient({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug;

  const [store, setStore]     = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePage, setActivePageRaw] = useState(null);

  // Charger le cache sur le client après le montage (évite le mismatch de hydration)
  useEffect(() => {
    const cached = storeCache[slug];
    if (cached) {
      setStore(cached.store);
      setModules(cached.modules);
      setLoading(false);
      const mods = cached.modules || [];
      if (mods.length > 0) {
        const firstType = mods[0].type;
        const firstKey = Object.entries(TAB_TYPE_MAP).find(([, types]) => types.includes(firstType))?.[0] || 'accueil';
        setActivePageRaw(firstKey);
      }
    }
  }, [slug]);

  const [isMobile, setIsMobile] = useState(false);
  const [shared, setShared]     = useState(false);
  const router = useRouter();
  const { cart, getCartTotal } = useCart();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shopTabs = store?.shop_tabs || {};
  const computedPages = useMemo(() => {
    return Object.entries(TAB_TYPE_MAP).reduce((acc, [key, types]) => {
      const matching = modules.filter(m => types.includes(m.type));
      if (matching.length > 0) {
        acc.push({
          key,
          label: shopTabs[key] || DEFAULT_TAB_LABELS[key],
          modules: matching,
        });
      }
      return acc;
    }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules, shopTabs]);

  const setActivePage = useCallback((keyOrId) => {
    if (TAB_TYPE_MAP[keyOrId]) {
      setActivePageRaw(keyOrId);
      return;
    }
    const mod = modules.find(m => m.id === keyOrId);
    if (mod) {
      const key = Object.entries(TAB_TYPE_MAP).find(([, types]) => types.includes(mod.type))?.[0];
      if (key) { setActivePageRaw(key); return; }
    }
    setActivePageRaw(keyOrId);
  }, [modules]);

  useEffect(() => {
    const load = async () => {
      // Si on a déjà des données en cache → on rafraîchit en silence (pas de spinner)
      const hasCached = !!(storeCache[slug]?.store);
      if (hasCached) setRefreshing(true);

      try {
        // Charger d'abord la boutique
        const { data: storeData, error: storeErr } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', slug)
          .single();

        if (storeErr || !storeData) {
          console.error('[StorefrontClient] Store non trouvé pour le slug:', slug, storeErr);
          setStore(null);
          setLoading(false);
          return;
        }

        // Charger ensuite ses modules actifs
        const { data: modulesData } = await supabase
          .from('store_modules')
          .select('id, type, config, position, is_active')
          .eq('store_id', storeData.id)
          .eq('is_active', true)
          .order('position', { ascending: true });

        const active = normalizeStoreModules((modulesData || [])
          .filter(m => m.is_active !== false)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));

        setStore(storeData);
        setModules(active);

        // Mettre à jour le cache mémoire
        storeCache[slug] = { store: storeData, modules: active };

        // Incrémenter le compteur de vues (sans bloquer l'affichage)
        try { supabase.rpc('increment_store_view', { st_id: storeData.id }); } catch (_) {}

        // Initialise l'onglet actif seulement à la première visite (pas de cache)
        if (!hasCached && active.length > 0) {
          const firstType = active[0].type;
          const firstKey = Object.entries(TAB_TYPE_MAP).find(([, types]) => types.includes(firstType))?.[0] || 'accueil';
          setActivePageRaw(firstKey);
        }
      } catch (err) {
        console.error('[StorefrontClient] Erreur lors du chargement de la boutique:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    load();
  }, [slug]);

  // Premier chargement sans cache → écran de chargement complet
  if (loading) return <LoadingScreen />;

  if (!store) {
    return (
      <main style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f8fafc' }}>
        <Store size={48} style={{ color:'#cbd5e1', marginBottom:'16px' }} />
        <h1 style={{ fontWeight:'900', fontSize:'22px', color:'#0f172a', margin:'0 0 8px' }}>Boutique introuvable</h1>
        <p style={{ color:'#94a3b8', fontSize:'14px', marginBottom:'24px' }}>Cette boutique n'existe pas ou a été désactivée.</p>
        <Link href="/" style={{ background:'#6366f1', color:'#fff', padding:'12px 28px', borderRadius:'16px', fontWeight:'700', textDecoration:'none', fontSize:'14px' }}>
          Retour à l'accueil
        </Link>
      </main>
    );
  }

  // ─── Actions globales ───
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: store.name, url: window.location.href });
        setShared(true); setTimeout(() => setShared(false), 2000);
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true); setTimeout(() => setShared(false), 2000);
    }
  };

  const handleDirections = () => {
    if (store.latitude && store.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`);
    }
  };

  // ─── Modules à afficher pour la page active ──────────────────────────────
  const activePageGroup = computedPages.find(p => p.key === activePage);
  // Pour compatibilité theme_00-05 : si activePage est un UUID, trouver ce module
  const currentModuleById = !activePageGroup ? modules.find(m => m.id === activePage) : null;
  const modulesToRender = activePageGroup?.modules || (currentModuleById ? [currentModuleById] : []);

  // ─── Résolution du Thème Visuel ───
  const themePreset = getThemeById(store.shop_theme || store.theme || 'theme_00');
  const themeConfig = resolveThemeConfig({
    themeId: store.shop_theme || store.theme || 'theme_00',
    preset: themePreset,
    store,
    fallback: { primaryColor: '#6366f1', secondaryColor: '#ffffff', accentColor: '#a855f7', fontFamily: 'Inter', mode: 'light' },
  });
  const THEME_COMPONENTS = {
    theme_00: require('./themes/Theme00_Classic').default,
    theme_01: require('./themes/Theme01_Luxury').default,
    theme_02: require('./themes/Theme02_Beauty').default,
    theme_03: require('./themes/Theme03_Market').default,
    theme_04: require('./themes/Theme04_Restaurant').default,
    theme_05: require('./themes/Theme05_Pro').default,
    theme_06: require('./themes/Theme06_Street').default,
    theme_07: require('./themes/Theme07_Tech').default,
    theme_08: require('./themes/Theme08_Editorial').default,
    theme_09: require('./themes/Theme09_Artisan').default,
    theme_10: require('./themes/Theme10_Sport').default,
    theme_11: require('./themes/Theme11_Health').default,
    theme_12: require('./themes/Theme12_Event').default,
    theme_13: require('./themes/Theme13_Kids').default,
    theme_14: require('./themes/Theme14_Cyber').default,
    theme_15: require('./themes/Theme15_Retro').default,
    theme_16: require('./themes/Theme16_Deco').default,
    theme_17: require('./themes/Theme17_Garage').default,
    theme_18: require('./themes/Theme18_Book').default,
    theme_19: require('./themes/Theme19_Jewel').default,
    theme_20: require('./themes/Theme20_Afro').default,
    theme_21: require('./themes/Theme21_Paper').default,
  };
  const ThemeComponent = THEME_COMPONENTS[themeId] || THEME_COMPONENTS['theme_00'];

  const isDark = themeConfig.mode === 'dark';
  const themeVars = {
    primaryColor: themeConfig.primaryColor || '#6366f1',
    secondaryColor: themeConfig.secondaryColor || '#ffffff',
    accentColor: themeConfig.accentColor || '#a855f7',
    fontFamily: themeConfig.fontFamily || 'Inter',
    '--prim': themeConfig.primaryColor || '#6366f1',
    '--sec': themeConfig.secondaryColor || '#f0f0ff',
    '--acc': themeConfig.accentColor || '#a855f7',
    '--font': themeConfig.fontFamily || 'Inter',
    '--bg': themeConfig.secondaryColor || '#ffffff',
    '--fg': isDark ? '#ffffff' : '#111827',
    '--fg2': isDark ? 'rgba(255,255,255,0.55)' : '#6b7280',
    '--border': isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)',
  };

  return (
    <>
      {/* Barre de rafraîchissement discrète — visible seulement lors d'une synchro silencieuse */}
      {refreshing && <RefreshBar />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${(themeConfig.fontFamily || 'Inter').replace(/ /g,'+')}:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${themeConfig.primaryColor}40; border-radius: 4px; }
        .page-transition { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
      `}</style>
      
      <Suspense key={themeId} fallback={<ThemeLoader />}>
        <ThemeComponent
          store={store}
          modules={modules}
          pages={computedPages}         // ← Onglets construits depuis la BD (sans doublons)
          activePage={activePage}        // ← Clé de page ('accueil', 'produits'…) ou UUID pour theme 00-05
          setActivePage={setActivePage}  // ← Navigateur intelligent
          handleShare={handleShare}
          handleDirections={handleDirections}
          shared={shared}
          cartCount={cart.reduce((s,i)=>s+(i.quantity||1), 0)}
          cartTotal={`${getCartTotal()} FCFA`}
          onOpenCart={() => router.push('/cart')}
          currency="FCFA"
        >
          {/* Rendu de TOUS les modules de la page active (jamais vide) */}
          {modulesToRender.length > 0 ? modulesToRender.map(mod => {
            const Renderer = MODULE_RENDERERS[mod.type];
            if (!Renderer) return null;
            return (
              <div key={mod.id} className="page-transition">
                <Renderer
                  config={mod.config}
                  store={store}
                  theme={themeVars}
                  isMobile={isMobile}
                  storeId={store.id}
                  preview={false}
                  onNavigate={setActivePage}
                  modules={modules}
                  globalCart={cart}
                />
              </div>
            );
          }) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔧</div>
              <p style={{ fontWeight: '700', fontSize: '15px', margin: 0 }}>Cette section n'a pas encore de contenu.</p>
              <p style={{ fontSize: '13px', marginTop: '8px', opacity: 0.7 }}>Ajoutez des blocs depuis votre espace Vendeur.</p>
            </div>
          )}
        </ThemeComponent>
      </Suspense>

      {/* ── PANIER GLOBAL (HEADER) ── */}
      <button
        onClick={() => router.push('/cart')}
        style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: themeVars['--prim'], color: '#fff', border: 'none', borderRadius: '50%',
          width: '56px', height: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)', cursor: 'pointer', transition: 'all 0.3s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingCart size={24} />
          {cart.length > 0 && (
            <span style={{
              position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: '#fff',
              fontSize: '10px', fontWeight: 'bold', width: '20px', height: '20px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid #fff'
            }}>
              {cart.reduce((s,i)=>s+(i.quantity||1), 0)}
            </span>
          )}
        </div>
      </button>

      {store?.chat_enabled !== false && (
        <StoreChatWidget
          storeId={store?.id}
          storeSlug={store?.slug}
          primaryColor={store?.theme_color || '#6366f1'}
          storeName={store?.name || 'Boutique'}
        />
      )}
    </>
  );
}
