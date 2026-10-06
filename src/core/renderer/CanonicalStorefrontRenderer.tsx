'use client';

/**
 * VesTyle V1 — Canonical Storefront Renderer (Unified Single Renderer)
 * ─────────────────────────────────────────────────────────────────────────────
 * Règle R9: UN SEUL RENDERER PUBLIC CANONIQUE.
 * Sert à la fois pour le rendu public en production (/boutique/[slug]) et
 * pour l'aperçu dynamique du Studio / Mes Sites (/mes-sites, /creer-mon-site).
 *
 * Supporte :
 *  - Les 9 Domaines métier (Vendeur, Restauration, Hébergement, Services, etc.)
 *  - DesignDefinition v3.0 ou StorefrontConfig
 *  - Résolution des DataSlots dynamiques & VisualNodeTree
 *  - Responsive mobile-first avec barres d'action flottantes
 *  - Déclencheur WhatsApp direct et modale de commande / réservation
 */

import React, { useState, useMemo, useEffect } from 'react';
import { DesignDefinition, designDefinitionToStorefrontConfig } from '../contracts/designDefinition';
import { StorefrontConfig, Section } from '@/types/storefront';
import { SiteDefinition } from '../contracts/siteDefinition';
import { getDomainById } from '../domains/domainDefinitions';

export interface CanonicalRendererProps {
  design?: DesignDefinition | null;
  config?: StorefrontConfig | null;
  site?: Partial<SiteDefinition> | null;
  products?: any[];
  isEditing?: boolean;
  isPreview?: boolean;
  activePageId?: string;
  onSlotClick?: (slotKey: string, meta?: any) => void;
  onNavigatePage?: (pageId: string) => void;
  className?: string;
}

export function CanonicalStorefrontRenderer({
  design,
  config: incomingConfig,
  site,
  products = [],
  isEditing = false,
  isPreview = false,
  activePageId = 'page_home',
  onSlotClick,
  onNavigatePage,
  className = '',
}: CanonicalRendererProps) {
  // 1. Résolution de la configuration canonique
  const config = useMemo<StorefrontConfig>(() => {
    if (incomingConfig && incomingConfig.theme) {
      return incomingConfig;
    }
    if (design) {
      return designDefinitionToStorefrontConfig(design, {
        storeName: site?.name || design.meta?.name || 'VesTyle Store',
        currency: 'FCFA',
        city: site?.city || 'Douala',
        phone: site?.phone || '',
      });
    }
    // Fallback minimalisé
    return {
      version: '3.0.0',
      businessType: (site?.domain as any) || 'vendeur',
      metadata: {
        storeName: site?.name || 'VesTyle Store',
        tagline: site?.description || 'Plateforme professionnelle',
        currency: 'FCFA',
        locale: 'fr-FR',
        primaryCity: site?.city || 'Douala',
        contactPhone: site?.phone || '',
        whatsappNumber: site?.whatsapp || site?.phone || '',
        logoUrl: site?.logoUrl || '',
        bannerUrl: site?.bannerUrl || '',
      },
      theme: {
        colorScheme: 'dark',
        palette: {
          primary: '#E5A93C',
          accent: '#D97706',
          background: '#090D16',
          surface: '#111827',
          surfaceBorder: 'rgba(255,255,255,0.08)',
          textPrimary: '#FFFFFF',
          textMuted: '#94A3B8',
        },
        typography: {
          fontFamilyHeading: 'Outfit, Inter, sans-serif',
          fontFamilyBody: 'Inter, sans-serif',
          baseSize: 'STANDARD',
          headingWeight: 'BOLD',
        },
        spatial: {
          borderRadius: 'MODERN_MD',
          spacingDensity: 'COMFORTABLE',
          cardElevation: 'SOFT_SHADOW',
        },
      },
      sections: [
        {
          id: 'sec_hero_default',
          type: 'HERO',
          variant: 'LUXURY_SPLIT',
          visible: true,
          content: {
            title: site?.name || 'Bienvenue chez nous',
            subtitle: site?.description || 'Découvrez nos services d’excellence et produits d’exception.',
            ctaPrimaryText: 'Découvrir le catalogue',
            ctaPrimaryUrl: '#catalog',
          },
        },
      ],
    };
  }, [incomingConfig, design, site]);

  // 2. State & modal pour commandes / réservations rapides WhatsApp
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNote, setBookingNote] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const domain = site?.domain || (config.businessType as any) || 'vendeur';
  const domainMeta = getDomainById(domain);

  // Palette & Tokens
  const palette = config.theme?.palette || {
    primary: '#E5A93C',
    accent: '#D97706',
    background: '#090D16',
    surface: '#111827',
    surfaceBorder: 'rgba(255,255,255,0.08)',
    textPrimary: '#FFFFFF',
    textMuted: '#94A3B8',
  };

  const whatsappNum = site?.whatsapp || config.metadata?.whatsappNumber || site?.phone || '';

  // Produits & Items de démonstration ou réels
  const displayItems = useMemo(() => {
    if (products && products.length > 0) {
      return products;
    }
    // Items générés à partir du domaine si vide
    if (domain === 'restauration') {
      return [
        { id: 'item_1', name: 'Ndolé Royal aux Crevettes', price: 6500, category: 'Plats', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', description: 'Accompagné de miondo frais et plantains mûrs.' },
        { id: 'item_2', name: 'Poulet DG Prestige', price: 7500, category: 'Plats', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&q=80', description: 'Légumes croquants du terroir et épices traditionnelles.' },
        { id: 'item_3', name: 'Poisson Braisé Kribi (Bar)', price: 9000, category: 'Grillades', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', description: 'Sauce piment doux, frites de plantain et bâton de manioc.' },
        { id: 'item_4', name: 'Cocktail Hibiscus & Gingembre', price: 2500, category: 'Boissons', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80', description: 'Infusion fraîche de fleurs de bissap et menthe sauvage.' },
      ];
    }
    if (domain === 'hebergement') {
      return [
        { id: 'item_1', name: 'Suite Panoramique Océan', price: 65000, unit: '/nuit', category: 'Suites', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80', description: 'Lit King Size, balcon privé vue imprenable, petit-déjeuner inclus.' },
        { id: 'item_2', name: 'Chambre Deluxe Executive', price: 45000, unit: '/nuit', category: 'Chambres', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80', description: 'Climatisation, WiFi ultra-rapide, espace bureau ergonomique.' },
        { id: 'item_3', name: 'Appartement Loft Standing', price: 85000, unit: '/nuit', category: 'Appartements', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80', description: 'Cuisine équipée, salon spacieux et service de conciergerie 24/7.' },
      ];
    }
    if (domain === 'services' || domain === 'sante' || domain === 'education') {
      return [
        { id: 'item_1', name: 'Consultation & Bilan Complet', price: 25000, category: 'Consultation', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80', description: 'Diagnostic personnalisé avec plan d’action certifié.' },
        { id: 'item_2', name: 'Accompagnement Premium', price: 75000, category: 'Formules', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', description: 'Suivi continu sur 30 jours avec support direct prioritaire.' },
        { id: 'item_3', name: 'Atelier Pratique Intensif', price: 40000, category: 'Formations', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80', description: 'Session interactive en petit comité avec supports complets.' },
      ];
    }
    // Vendeur standard
    return [
      { id: 'item_1', name: 'Costume Croisé 3 Pièces Sartorial', price: 85000, category: 'Costumes', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80', description: 'Laine fine italienne, coupe ajustée, finitions main.' },
      { id: 'item_2', name: 'Robe de Soirée Velours Royal', price: 65000, category: 'Robes', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80', description: 'Élégance intemporelle, drapé soyeux et broderie raffinée.' },
      { id: 'item_3', name: 'Mocassins Cuir Patiné Ébène', price: 45000, category: 'Chaussures', image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=80', description: 'Semelle cousue Goodyear, confort exceptionnel toute la journée.' },
      { id: 'item_4', name: 'Montre Chronographe Automatique', price: 120000, category: 'Accessoires', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80', description: 'Verre saphir inrayable, étanche 50m, boîtier acier inoxydable.' },
    ];
  }, [products, domain]);

  // Catégories uniques
  const categories = useMemo(() => {
    const cats = new Set<string>();
    displayItems.forEach(i => {
      if (i.category) cats.add(i.category);
    });
    return ['all', ...Array.from(cats)];
  }, [displayItems]);

  const filteredItems = useMemo(() => {
    return displayItems.filter(item => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      const matchSearch = searchQuery === '' || (item.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [displayItems, activeCategory, searchQuery]);

  // Handler d'action WhatsApp
  const handleOpenWhatsApp = (message: string) => {
    if (!whatsappNum) {
      alert("Numéro WhatsApp de l'établissement non configuré.");
      return;
    }
    const cleanNum = whatsappNum.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanNum}?text=${encoded}`, '_blank');
  };

  const handleOrderDirect = (item: any) => {
    const msg = `Bonjour *${config.metadata.storeName}*, je souhaite commander :\n\n• *${item.name}*\n• Prix : ${item.price?.toLocaleString()} ${config.metadata.currency || 'FCFA'}\n\nMerci de me confirmer la disponibilité et le mode de livraison !`;
    handleOpenWhatsApp(msg);
  };

  const handleSendBooking = () => {
    const unitText = selectedItem?.unit ? ` (${selectedItem.unit})` : '';
    const msg = `Bonjour *${config.metadata.storeName}*,\n\nJe souhaite effectuer une réservation / commande :\n• Service / Produit : *${selectedItem?.name || 'Général'}*${unitText}\n• Nom : ${customerName || 'Non spécifié'}\n• Téléphone : ${customerPhone || 'Non spécifié'}\n• Date souhaitée : ${bookingDate || 'Dès que possible'}\n• Note : ${bookingNote || 'Aucune'}\n\nMerci de me recontacter !`;
    handleOpenWhatsApp(msg);
    setBookingModalOpen(false);
  };

  // Sections triées
  const activeSections = useMemo(() => {
    if (config.sections && config.sections.length > 0) {
      return [...config.sections].filter(s => isEditing || s.visible !== false);
    }
    return [];
  }, [config.sections, isEditing]);

  const heroSection = activeSections.find(s => s.type === 'HERO') || activeSections[0];

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 font-sans selection:bg-amber-500/30 ${className}`}
      style={{
        backgroundColor: palette.background,
        color: palette.textPrimary,
        fontFamily: config.theme?.typography?.fontFamilyBody || 'Inter, sans-serif',
      }}
    >
      {/* ── HEADER / NAVIGATION ── */}
      <header
        className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-all"
        style={{
          backgroundColor: `${palette.surface}E6`,
          borderColor: palette.surfaceBorder,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Titre */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSlotClick && onSlotClick('brand_logo')}
          >
            {site?.logoUrl || config.metadata.logoUrl ? (
              <img
                src={site?.logoUrl || config.metadata.logoUrl}
                alt={config.metadata.storeName}
                className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg shadow-md"
                style={{ backgroundColor: palette.primary, color: '#000000' }}
              >
                {(config.metadata.storeName || 'V')[0].toUpperCase()}
              </div>
            )}
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight block leading-tight">
                {config.metadata.storeName}
              </span>
              <span className="text-[11px] font-medium tracking-wide uppercase" style={{ color: palette.accent }}>
                {domainMeta?.badge || domainMeta?.name || 'Établissement vérifié'}
              </span>
            </div>
          </div>

          {/* Navigation Links Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#hero" className="hover:text-amber-400 transition-colors">Accueil</a>
            <a href="#catalog" className="hover:text-amber-400 transition-colors">
              {domain === 'restauration' ? 'Notre Carte' : domain === 'hebergement' ? 'Hébergements' : domain === 'services' ? 'Nos Services' : 'Catalogue'}
            </a>
            <a href="#about" className="hover:text-amber-400 transition-colors">À Propos</a>
            <a href="#contact" className="hover:text-amber-400 transition-colors">Contact</a>
          </nav>

          {/* Action Call & Contact CTA */}
          <div className="flex items-center gap-3">
            {whatsappNum && (
              <button
                onClick={() => handleOpenWhatsApp(`Bonjour ${config.metadata.storeName}, je visite votre site et souhaite avoir des renseignements.`)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: palette.primary,
                  color: '#000000',
                }}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.146-.532-1.854-.775-3.037-2.656-3.13-2.779-.093-.124-.746-.994-.746-1.897 0-.902.473-1.344.641-1.528.169-.184.368-.231.492-.231.123 0 .247.002.354.008.113.006.262-.043.411.314.154.37.525 1.282.571 1.376.046.093.077.202.015.325-.062.123-.093.199-.185.307-.092.108-.194.24-.277.323-.092.092-.189.193-.081.379.108.185.48 1.134 1.154 1.734.867.772 1.599 1.01 1.825 1.12.226.11.359.094.492-.059.133-.153.571-.663.725-.89.153-.227.307-.189.518-.112.21.077 1.332.628 1.56.741.229.113.382.169.438.266.056.097.056.564-.088.969z"/>
                </svg>
                <span>WhatsApp Direct</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border text-white"
              style={{ borderColor: palette.surfaceBorder }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 space-y-3 border-t" style={{ backgroundColor: palette.surface, borderColor: palette.surfaceBorder }}>
            <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">Accueil</a>
            <a href="#catalog" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">
              {domain === 'restauration' ? 'Notre Carte' : domain === 'hebergement' ? 'Hébergements' : domain === 'services' ? 'Nos Services' : 'Catalogue'}
            </a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">À Propos</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">Contact</a>
          </div>
        )}
      </header>

      {/* ── HERO SECTION ── */}
      <section
        id="hero"
        className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-32 px-4 sm:px-6 lg:px-8 border-b"
        style={{
          borderColor: palette.surfaceBorder,
          background: `radial-gradient(ellipse at top, ${palette.surface} 0%, ${palette.background} 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Texte & Titre */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border shadow-sm"
              style={{
                backgroundColor: `${palette.primary}15`,
                borderColor: `${palette.primary}40`,
                color: palette.primary,
              }}
            >
              <span>✨</span>
              <span>{heroSection?.content?.badge || `${domainMeta?.badge || domainMeta?.name || 'VesTyle'} — Qualité Certifiée`}</span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
              style={{
                fontFamily: config.theme?.typography?.fontFamilyHeading || 'Outfit, Inter, sans-serif',
              }}
            >
              {heroSection?.content?.title || config.metadata.storeName}
            </h1>

            <p className="text-base sm:text-lg max-w-2xl leading-relaxed" style={{ color: palette.textMuted }}>
              {heroSection?.content?.subtitle || config.metadata.tagline || 'L’excellence et l’authenticité à votre service.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 inline-flex items-center gap-2"
                style={{
                  backgroundColor: palette.primary,
                  color: '#000000',
                }}
              >
                <span>{heroSection?.content?.ctaPrimaryText || (domain === 'hebergement' || domain === 'services' ? 'Réserver maintenant' : 'Découvrir nos offres')}</span>
                <span>→</span>
              </a>

              {whatsappNum && (
                <button
                  onClick={() => handleOpenWhatsApp(`Bonjour ${config.metadata.storeName}, je souhaite en savoir plus sur vos services.`)}
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm border transition-all hover:bg-white/5 active:scale-95 inline-flex items-center gap-2"
                  style={{
                    borderColor: palette.surfaceBorder,
                    color: palette.textPrimary,
                  }}
                >
                  <span>Discuter en direct</span>
                </button>
              )}
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t" style={{ borderColor: palette.surfaceBorder }}>
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">100%</div>
                <div className="text-xs" style={{ color: palette.textMuted }}>Qualité Garantie</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">24/7</div>
                <div className="text-xs" style={{ color: palette.textMuted }}>Support Réactif</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">Direct</div>
                <div className="text-xs" style={{ color: palette.textMuted }}>WhatsApp Sans Frais</div>
              </div>
            </div>
          </div>

          {/* Image / Visuel Hero */}
          <div className="lg:col-span-5 relative">
            <div
              className="relative rounded-2xl overflow-hidden border shadow-2xl aspect-[4/3] group"
              style={{ borderColor: palette.surfaceBorder }}
            >
              <img
                src={
                  site?.bannerUrl ||
                  config.metadata.bannerUrl ||
                  heroSection?.content?.imageUrl ||
                  (domain === 'restauration'
                    ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'
                    : domain === 'hebergement'
                    ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'
                    : domain === 'services'
                    ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'
                    : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80')
                }
                alt={config.metadata.storeName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl backdrop-blur-md bg-slate-900/80 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-amber-400">Établissement Recommandé</div>
                  <div className="text-sm font-bold">{site?.city || config.metadata.primaryCity || 'Douala'}, Cameroun</div>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-extrabold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Ouvert
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATALOGUE / MENU / SERVICES GRID ── */}
      <section id="catalog" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: palette.accent }}>
              Nos Propositions
            </div>
            <h2
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ fontFamily: config.theme?.typography?.fontFamilyHeading || 'Outfit, sans-serif' }}
            >
              {domain === 'restauration' ? 'La Carte Gastronomique' : domain === 'hebergement' ? 'Nos Hébergements & Suites' : domain === 'services' ? 'Nos Formules & Services' : 'Nos Articles & Collections'}
            </h2>
          </div>

          {/* Recherche & Filtre Catégorie */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 rounded-xl text-xs font-medium border bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-400"
              style={{ borderColor: palette.surfaceBorder, color: palette.textPrimary }}
            />

            {categories.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                    style={{
                      backgroundColor: activeCategory === cat ? palette.primary : `${palette.surface}`,
                      color: activeCategory === cat ? '#000000' : palette.textMuted,
                      border: `1px solid ${activeCategory === cat ? palette.primary : palette.surfaceBorder}`,
                    }}
                  >
                    {cat === 'all' ? 'Tout' : cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grille des articles */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border" style={{ borderColor: palette.surfaceBorder, backgroundColor: palette.surface }}>
            <p className="text-sm font-semibold" style={{ color: palette.textMuted }}>Aucun résultat trouvé pour votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col group"
                style={{
                  backgroundColor: palette.surface,
                  borderColor: palette.surfaceBorder,
                }}
              >
                {/* Image Item */}
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-800">
                  <img
                    src={item.image || item.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.category && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-md bg-black/60 text-white border border-white/10">
                      {item.category}
                    </div>
                  )}
                </div>

                {/* Contenu Item */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold tracking-tight line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: palette.textMuted }}>
                      {item.description || 'Prestation haut de gamme assurée par nos experts.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: palette.surfaceBorder }}>
                    <div>
                      <span className="text-xs block" style={{ color: palette.textMuted }}>Prix</span>
                      <span className="text-base font-extrabold text-amber-400">
                        {item.price ? `${item.price.toLocaleString()} ${config.metadata.currency || 'FCFA'}` : 'Sur devis'}
                        {item.unit && <span className="text-xs font-normal text-slate-400">{item.unit}</span>}
                      </span>
                    </div>

                    {domain === 'vendeur' ? (
                      <button
                        onClick={() => handleOrderDirect(item)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        style={{
                          backgroundColor: palette.primary,
                          color: '#000000',
                        }}
                      >
                        <span>Commander</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setBookingModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        style={{
                          backgroundColor: palette.primary,
                          color: '#000000',
                        }}
                      >
                        <span>{domain === 'hebergement' || domain === 'restauration' ? 'Réserver' : 'Prendre RDV'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── À PROPOS & VALEURS ── */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-b" style={{ borderColor: palette.surfaceBorder, backgroundColor: palette.surface }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: palette.accent }}>
              Notre Engagement
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              L'élégance du service et la passion du détail
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: palette.textMuted }}>
              Basé à {site?.city || config.metadata.primaryCity || 'Douala'}, notre établissement s'engage à vous offrir
              le meilleur niveau de qualité, de rapidité et d'assistance personnalisée.
              Chaque demande est traitée avec le plus grand soin par notre équipe dédiée.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border" style={{ borderColor: palette.surfaceBorder, backgroundColor: palette.background }}>
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-sm font-bold">Réponse Immédiate</div>
                <div className="text-xs mt-1" style={{ color: palette.textMuted }}>Traitement en direct via WhatsApp</div>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: palette.surfaceBorder, backgroundColor: palette.background }}>
                <div className="text-2xl mb-1">🛡️</div>
                <div className="text-sm font-bold">Paiement & Sécurité</div>
                <div className="text-xs mt-1" style={{ color: palette.textMuted }}>Transactions claires & traçables</div>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border aspect-video shadow-xl" style={{ borderColor: palette.surfaceBorder }}>
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
              alt="Notre univers"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── CONTACT & FOOTER ── */}
      <footer id="contact" className="pt-16 pb-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: palette.background }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b" style={{ borderColor: palette.surfaceBorder }}>
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: palette.primary, color: '#000000' }}
              >
                {(config.metadata.storeName || 'V')[0].toUpperCase()}
              </div>
              <span className="text-lg font-bold">{config.metadata.storeName}</span>
            </div>
            <p className="text-xs max-w-sm leading-relaxed" style={{ color: palette.textMuted }}>
              {config.metadata.tagline || 'Site propulsé par la plateforme VesTyle V1.'}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: palette.accent }}>Navigation</h4>
            <ul className="space-y-2 text-xs" style={{ color: palette.textMuted }}>
              <li><a href="#hero" className="hover:text-white transition-colors">Accueil</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Catalogue & Offres</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">À Propos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: palette.accent }}>Coordonnées</h4>
            <ul className="space-y-2 text-xs" style={{ color: palette.textMuted }}>
              <li>📍 {site?.city || config.metadata.primaryCity || 'Douala'}, Cameroun</li>
              {site?.phone && <li>📞 {site.phone}</li>}
              {whatsappNum && <li>💬 WhatsApp : {whatsappNum}</li>}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: palette.textMuted }}>
          <div>© {new Date().getFullYear()} {config.metadata.storeName}. Tous droits réservés.</div>
          <div className="flex items-center gap-2">
            <span>Propulsé par</span>
            <span className="font-bold text-amber-400">VesTyle V1</span>
          </div>
        </div>
      </footer>

      {/* ── MODALE RÉSERVATION / PRISE DE CONTACT RAPIDE ── */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl relative"
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.surfaceBorder,
              color: palette.textPrimary,
            }}
          >
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="mb-5">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-400 mb-1">
                {domain === 'hebergement' || domain === 'restauration' ? 'Demande de Réservation' : 'Demande de RDV'}
              </div>
              <h3 className="text-xl font-bold">{selectedItem?.name || 'Prestation'}</h3>
              {selectedItem?.price && (
                <div className="text-sm font-semibold text-slate-300 mt-1">
                  {selectedItem.price.toLocaleString()} {config.metadata.currency || 'FCFA'} {selectedItem.unit || ''}
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold">Votre Nom & Prénom *</label>
                <input
                  type="text"
                  placeholder="Ex: Jean Dupont"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-black/20 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  style={{ borderColor: palette.surfaceBorder }}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Votre Téléphone / WhatsApp *</label>
                <input
                  type="tel"
                  placeholder="Ex: 699 00 00 00"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-black/20 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  style={{ borderColor: palette.surfaceBorder }}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Date ou créneau souhaité</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-black/20 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  style={{ borderColor: palette.surfaceBorder }}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Notes / Demandes particulières</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Nombre de personnes, allergies, heure exacte..."
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-black/20 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  style={{ borderColor: palette.surfaceBorder }}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setBookingModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border text-xs font-semibold hover:bg-white/5"
                style={{ borderColor: palette.surfaceBorder }}
              >
                Annuler
              </button>
              <button
                onClick={handleSendBooking}
                disabled={!customerName || !customerPhone}
                className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                style={{
                  backgroundColor: palette.primary,
                  color: '#000000',
                }}
              >
                Envoyer via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CanonicalStorefrontRenderer;
