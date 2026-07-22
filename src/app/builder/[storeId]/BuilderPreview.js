'use client';
import { useState, useEffect } from 'react';
import { useBuilder } from '@/context/BuilderContext';
import { supabase } from '@/lib/supabase';
import { resolveThemeConfig } from '@/lib/themeResolver.mjs';

// ── Blocs dynamiques ─────────────────────────────────────────────────────────
import HeroBlock          from '@/components/blocks/HeroBlock';
import CarouselBlock      from '@/components/blocks/CarouselBlock';
import OfferingGridBlock  from '@/components/blocks/OfferingGridBlock';
import RichTextBlock      from '@/components/blocks/RichTextBlock';
import TestimonialSliderBlock from '@/components/blocks/TestimonialSliderBlock';
import StatsBarBlock      from '@/components/blocks/StatsBarBlock';
import FaqAccordionBlock  from '@/components/blocks/FaqAccordionBlock';
import CountdownBlock     from '@/components/blocks/CountdownBlock';
import VideoEmbedBlock    from '@/components/blocks/VideoEmbedBlock';
import ImageGalleryBlock  from '@/components/blocks/ImageGalleryBlock';
import DividerBlock       from '@/components/blocks/DividerBlock';
import SpacerBlock        from '@/components/blocks/SpacerBlock';
import ContactFormBlock   from '@/components/blocks/ContactFormBlock';
import NewsletterSignupBlock from '@/components/blocks/NewsletterSignupBlock';
import SocialLinksBlock   from '@/components/blocks/SocialLinksBlock';

// ── Anciens modules (rétrocompatibilité) ────────────────────────────────────
import ModuleVitrine    from '@/components/modules/ModuleVitrine';
import ModuleCatalogue  from '@/components/modules/ModuleCatalogue';
import ModuleReservation from '@/components/modules/ModuleReservation';
import ModulePortfolio  from '@/components/modules/ModulePortfolio';
import ModuleBilletterie from '@/components/modules/ModuleBilletterie';
import ModuleRestaurant from '@/components/modules/ModuleRestaurant';
import ModuleServices   from '@/components/modules/ModuleServices';
import ModuleLinks      from '@/components/modules/ModuleLinks';
import ModuleTestimonials from '@/components/modules/ModuleTestimonials';
import ModuleContact    from '@/components/modules/ModuleContact';
import ModuleNewsletter from '@/components/modules/ModuleNewsletter';
import ModuleDevis      from '@/components/modules/ModuleDevis';
import ModuleAbonnement from '@/components/modules/ModuleAbonnement';

// ── Thèmes de boutique (identiques à la boutique publique) ───────────────────
import { THEME_COMPONENTS } from '@/app/boutique/[slug]/themes';

// ── Registre complet ─────────────────────────────────────────────────────────
const BLOCK_RENDERERS = {
  hero: HeroBlock, carousel: CarouselBlock, offeringGrid: OfferingGridBlock,
  richText: RichTextBlock, testimonialSlider: TestimonialSliderBlock,
  statsBar: StatsBarBlock, faqAccordion: FaqAccordionBlock,
  countdown: CountdownBlock, videoEmbed: VideoEmbedBlock,
  imageGallery: ImageGalleryBlock, divider: DividerBlock, spacer: SpacerBlock,
  contactForm: ContactFormBlock, newsletterSignup: NewsletterSignupBlock,
  socialLinks: SocialLinksBlock,
  vitrine: ModuleVitrine, catalogue: ModuleCatalogue, reservation: ModuleReservation,
  portfolio: ModulePortfolio, billetterie: ModuleBilletterie,
  restaurant: ModuleRestaurant, services: ModuleServices, links: ModuleLinks,
  testimonials: ModuleTestimonials, contact: ModuleContact,
  newsletter: ModuleNewsletter, devis: ModuleDevis, abonnement: ModuleAbonnement,
  lookbook: ModuleCatalogue, properties: ModuleServices,
};

const LEGACY_TYPES = new Set([
  'vitrine','catalogue','reservation','portfolio','billetterie',
  'restaurant','services','links','testimonials','contact',
  'newsletter','devis','abonnement','lookbook','properties',
]);

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

// ── Normalisation du thème ───────────────────────────────────────────────────
function buildTheme(raw = {}) {
  const resolvedTheme = resolveThemeConfig({ rawTheme: raw, fallback: { primaryColor: '#6366f1', secondaryColor: '#ffffff', accentColor: '#a855f7', fontFamily: 'Inter', mode: 'light' } });
  const dark = resolvedTheme.mode === 'dark';
  return {
    primaryColor: resolvedTheme.primaryColor,
    accentColor: resolvedTheme.accentColor,
    secondaryColor: resolvedTheme.secondaryColor,
    fontFamily: resolvedTheme.fontFamily,
    mode: resolvedTheme.mode,
    '--prim': resolvedTheme.primaryColor,
    '--acc': resolvedTheme.accentColor,
    '--bg': resolvedTheme.secondaryColor,
    '--fg': dark ? '#f8fafc' : '#111827',
    '--fg2': dark ? '#94a3b8' : '#6b7280',
    '--border': dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  };
}

export default function BuilderPreview({ externalModules, externalTheme }) {
  const { state } = useBuilder();
  const { modules: ctxModules, themeConfig: ctxTheme, previewTab, store } = state;
  const isMobile = previewTab === 'mobile';

  const modules     = externalModules ?? ctxModules;
  const themeConfig = externalTheme   ?? ctxTheme;
  const theme       = buildTheme(themeConfig);

  const activeModules = (modules || [])
    .filter(m => m.is_active)
    .sort((a, b) => a.position - b.position);

  // Page active = premier module
  const [activePage, setActivePage] = useState(null);
  useEffect(() => {
    if (activeModules.length > 0 && !activePage) {
      setActivePage(activeModules[0].id);
    }
  }, [activeModules.length]);

  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (!isMobile) { setScale(1); return; }
    const update = () => {
      const h = window.innerHeight - 100;
      setScale(h < 800 ? h / 800 : 1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isMobile]);

  // ── Résolution du ThemeComponent ────────────────────────────────────────────
  const resolvedTheme = resolveThemeConfig({
    rawTheme: themeConfig,
    store,
    fallback: { primaryColor: '#6366f1', secondaryColor: '#ffffff', accentColor: '#a855f7', fontFamily: 'Inter', mode: 'light' },
  });
  const themeId = resolvedTheme._themeId || 'theme_00';
  const ThemeComponent = THEME_COMPONENTS[themeId] || THEME_COMPONENTS['theme_00'];

  // ── Rendu du module actif ────────────────────────────────────────────────────
  const currentModule = activeModules.find(m => m.id === activePage) || activeModules[0];
  const renderCurrentModule = () => {
    if (!currentModule) return null;
    const Renderer = BLOCK_RENDERERS[currentModule.type];
    if (!Renderer) return (
      <div style={{ padding: '20px', textAlign: 'center', background: '#fff3cd', color: '#856404', border: '1px dashed #ffc107', borderRadius: '8px', margin: '8px', fontSize: '12px' }}>
        ⚠️ Composant inconnu : <code>{currentModule.type}</code>
      </div>
    );
    if (LEGACY_TYPES.has(currentModule.type)) {
      return <Renderer module={currentModule} theme={theme} store={store} isMobile={isMobile} storeId={store?.id} preview={true} />;
    }
    return <Renderer config={currentModule.config || {}} theme={theme} store={store} moduleId={currentModule.id} />;
  };

  // ── Écran vide ──────────────────────────────────────────────────────────────
  if (activeModules.length === 0) {
    const EmptyScreen = () => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', gap: '16px', padding: '32px' }}>
        <div style={{ fontSize: '64px' }}>🏗️</div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#374151' }}>Votre boutique est vide</div>
        <div style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', maxWidth: '300px' }}>
          Utilisez ✨ Mistral pour générer votre boutique en quelques secondes, ou ajoutez des pages manuellement.
        </div>
      </div>
    );
    const previewContent = <EmptyScreen />;
    if (!isMobile) return <div style={{ height: '100%', overflow: 'auto', background: '#e5e7eb' }}><div style={{ minHeight: '100%', background: '#fff' }}>{previewContent}</div></div>;
    return <MobileFrame scale={scale}>{previewContent}</MobileFrame>;
  }

  // Calcul des onglets dynamiques
  const shopTabs = store?.shop_tabs || {};
  const computedPages = Object.entries(TAB_TYPE_MAP).reduce((acc, [key, types]) => {
    const matching = activeModules.filter(m => types.includes(m.type));
    if (matching.length > 0) {
      acc.push({
        key,
        label: shopTabs[key] || DEFAULT_TAB_LABELS[key],
        modules: matching,
      });
    }
    return acc;
  }, []);

  const previewContent = (
    <ThemeComponent
      store={store || { name: 'Ma Boutique', positive_rating: 100, response_time: '< 1h' }}
      modules={activeModules}
      pages={computedPages}
      activePage={activePage}
      setActivePage={setActivePage}
      handleShare={() => {}}
      handleDirections={() => {}}
      shared={false}
      cartCount={0}
      cartTotal="0 FCFA"
      onOpenCart={() => {}}
      currency="FCFA"
      isPreview={true}
    >
      <div key={currentModule?.id}>
        {renderCurrentModule()}
      </div>
    </ThemeComponent>
  );

  if (!isMobile) {
    return (
      <div style={{ height: '100%', overflow: 'auto', background: '#e5e7eb', position: 'relative' }}>
        <div style={{ minHeight: '100%', background: '#fff', maxWidth: '100%' }}>
          {previewContent}
        </div>
      </div>
    );
  }

  return <MobileFrame scale={scale}>{previewContent}</MobileFrame>;
}

// ── Cadre iPhone ─────────────────────────────────────────────────────────────
function MobileFrame({ scale, children }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb', gap: '16px', overflow: 'hidden' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '390px', height: '800px', borderRadius: '48px', border: '12px solid #1f2937', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.35)', position: 'relative', background: '#fff' }}>
        {/* Notch */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '130px', height: '32px', background: '#1f2937', borderRadius: '0 0 20px 20px', zIndex: 100 }} />
        <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
