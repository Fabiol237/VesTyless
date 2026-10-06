import { BusinessProfileSchema } from './businessProfileSchema.js';
import { capabilityEngine, CAPABILITIES } from '../capability-engine/CapabilityEngine.js';
import { businessTypeRegistry } from '../business-types/BusinessTypeRegistry.js';
import { getThemeById } from '../../app/boutique/[slug]/themes/index.js';
import { themeEngine } from '../theme-engine/ThemeEngine.js';

/**
 * VesTyle / Vestin — BusinessProfile Adapter
 * ─────────────────────────────────────────────────────────────────────────────
 * Fonction pure et déterministe transformant n'importe quel ensemble de données
 * existant (stores + products + store_modules + layout_config) en un contrat
 * canonique BusinessProfile strictement validé par Zod.
 * 
 * ZÉRO mutation de base de données. 100% testable et isolé.
 */

export function adaptStoreToBusinessProfile(store = {}, products = [], modules = [], options = {}) {
  if (!store || typeof store !== 'object') {
    throw new Error('[BusinessProfileAdapter] Le paramètre store doit être un objet.');
  }

  const rawStore = { ...store };
  const storeId = String(rawStore.id || options.storeId || `temp_store_${Date.now()}`);
  const storeName = String(rawStore.name || 'Boutique Sans Nom').trim();
  const storeSlug = String(rawStore.slug || 'boutique').trim().toLowerCase();
  const rawType = rawStore.business_type || rawStore.activity_type || rawStore.type;
  const analysis = businessTypeRegistry.analyze(rawType);
  const businessType = analysis.canonicalId || (analysis.isMissing ? 'unspecified' : (analysis.isAmbiguous ? 'ambiguous' : 'unknown'));

  // ── 1. RÉSOUDRE LES TOKENS DE THÈME ──────────────────────────────────────────
  const activeDeclarativeConfig = options.useDraft
    ? (rawStore.draft_config || rawStore.published_config)
    : (rawStore.published_config || rawStore.draft_config);
  const declarativeTheme = activeDeclarativeConfig?.theme || rawStore.storefront?.theme || (typeof rawStore.theme === 'object' ? rawStore.theme : {});

  const themeId = rawStore.shop_theme || (typeof rawStore.theme === 'string' ? rawStore.theme : 'theme_00');
  const legacyTheme = getThemeById(themeId) || {};
  const customPrimary = declarativeTheme.primaryColor || rawStore.theme_color || rawStore.primary_color || legacyTheme.primaryColor || '#128C7E';
  const customAccent = declarativeTheme.accentColor || legacyTheme.accentColor || rawStore.accent_color || '#25D366';
  const customBg = declarativeTheme.bgColor || legacyTheme.bgColor || (declarativeTheme.mode === 'dark' ? '#0B0F19' : '#FFFFFF');
  const customFont = declarativeTheme.font || legacyTheme.font || rawStore.font_family || 'Inter';

  const isDark = declarativeTheme.isDark !== undefined
    ? Boolean(declarativeTheme.isDark)
    : (declarativeTheme.mode === 'dark' || ['#0A0A0A', '#120A00', '#0D0600', '#18181b', '#050505', '#0f0f1a', '#111827', '#0B0F19', '#090D16', '#0F172A'].includes(customBg));

  const themeTokens = {
    primaryColor: customPrimary,
    accentColor: customAccent,
    secondaryColor: declarativeTheme.secondaryColor || legacyTheme.secondaryColor || '#0F172A',
    bgColor: customBg,
    textColor: declarativeTheme.textColor || (isDark ? '#F8FAFC' : '#0F172A'),
    textMutedColor: declarativeTheme.textMutedColor || (isDark ? '#94A3B8' : '#64748B'),
    borderColor: declarativeTheme.borderColor || (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.08)'),
    font: customFont,
    headingFont: declarativeTheme.headingFont || customFont,
    isDark,
    mode: declarativeTheme.mode || (isDark ? 'dark' : 'light'),
  };

  // ── 2. RÉSOUDRE LES CAPACITÉS MÉTIER ─────────────────────────────────────────
  const typeDef = businessTypeRegistry.get(businessType);
  const baseCaps = typeDef ? (typeDef.capabilities || {}) : {};
  
  const hasProducts = baseCaps.hasProducts !== undefined
    ? baseCaps.hasProducts
    : true;
  const hasServices = baseCaps.hasServices !== undefined
    ? baseCaps.hasServices
    : false;
  const hasCart = baseCaps.hasCart !== undefined ? baseCaps.hasCart : true;
  const hasDelivery = baseCaps.hasDelivery !== undefined ? baseCaps.hasDelivery : true;
  const hasBooking = baseCaps.hasBooking !== undefined ? baseCaps.hasBooking : false;
  const hasQuotes = baseCaps.hasQuotes !== undefined ? baseCaps.hasQuotes : false;
  const hasStaff = baseCaps.hasStaff !== undefined ? baseCaps.hasStaff : false;

  const capabilities = {
    [CAPABILITIES.PRODUCT]: hasProducts,
    [CAPABILITIES.SERVICE]: hasServices,
    [CAPABILITIES.HYBRID]: Boolean(hasProducts && hasServices),
    [CAPABILITIES.BOOKING]: hasBooking,
    [CAPABILITIES.ORDER]: true,
    [CAPABILITIES.CART]: hasCart,
    [CAPABILITIES.DELIVERY]: hasDelivery,
    [CAPABILITIES.QUOTE]: hasQuotes,
    [CAPABILITIES.PAYMENT]: true,
    [CAPABILITIES.STAFF]: hasStaff,
    [CAPABILITIES.AVAILABILITY]: hasBooking,
    [CAPABILITIES.LOCATION]: Boolean(rawStore.latitude && rawStore.longitude),
    [CAPABILITIES.REVIEWS]: true,
    [CAPABILITIES.PROMOTIONS]: true,
    [CAPABILITIES.LOYALTY]: false,
    [CAPABILITIES.GALLERY]: true,
    [CAPABILITIES.FAQ]: true,
    [CAPABILITIES.CONTACT]: true,
    [CAPABILITIES.OPENING_HOURS]: Boolean(rawStore.opening_hours),
    [CAPABILITIES.TABLE_RESERVATION]: Boolean(baseCaps.hasMenu && baseCaps.hasBooking),
    [CAPABILITIES.ROOM_RESERVATION]: Boolean(baseCaps.hasRooms),
    [CAPABILITIES.EVENT_REGISTRATION]: false,
    ...(rawStore.capabilities_override || {}),
  };

  // ── 3. NORMALISER LE CATALOGUE PRODUITS ───────────────────────────────────────
  const rawProducts = Array.isArray(products) ? products : [];
  const normalizedProducts = rawProducts.map((p, idx) => {
    const pId = String(p.id || `prod_${idx}_${Date.now()}`);
    const pName = String(p.name || 'Produit').trim();
    const pPrice = typeof p.price === 'number' ? Math.max(0, p.price) : Number(p.price) || 0;
    const pOrigPrice = p.original_price ? Number(p.original_price) : null;
    const pImage = p.image_url || p.image || (Array.isArray(p.images) ? p.images[0] : '') || '';
    const pImages = Array.isArray(p.images) && p.images.length > 0 ? p.images : (pImage ? [pImage] : []);
    const pStock = typeof p.stock_quantity === 'number' ? p.stock_quantity : (typeof p.stock === 'number' ? p.stock : 99);
    const pMoq = typeof p.moq === 'number' ? Math.max(1, p.moq) : 1;

    return {
      id: pId,
      name: pName,
      slug: p.slug || pName.toLowerCase().replace(/\s+/g, '-'),
      price: pPrice,
      originalPrice: pOrigPrice,
      description: p.description || '',
      category: p.category || 'Général',
      categoryId: p.category_id || null,
      images: pImages,
      image: pImage,
      stock: pStock,
      isActive: p.is_active !== false,
      moq: pMoq,
      variants: Array.isArray(p.variants) ? p.variants : [],
      specifications: typeof p.specifications === 'object' && p.specifications !== null ? p.specifications : {},
      badge: p.badge || (pOrigPrice && pOrigPrice > pPrice ? 'PROMO' : null),
      createdAt: p.created_at || new Date().toISOString(),
      updatedAt: p.updated_at || new Date().toISOString(),
    };
  });

  // Extraire les catégories uniques
  const categorySet = new Set();
  normalizedProducts.forEach(p => { if (p.category) categorySet.add(p.category); });
  if (Array.isArray(rawStore.categories)) {
    rawStore.categories.forEach(c => {
      if (typeof c === 'string') categorySet.add(c);
      else if (c && c.name) categorySet.add(c.name);
    });
  }
  const categoriesList = Array.from(categorySet);

  // ── 4. NORMALISER LES SECTIONS DU STOREFRONT ──────────────────────────────────
  const rawModules = Array.isArray(modules) ? modules : [];
  const declarativeSections = Array.isArray(activeDeclarativeConfig?.sections)
    ? activeDeclarativeConfig.sections
    : [];

  const layoutConfig = rawStore.layout_config || rawStore.store_config || {};
  const rawBlocks = layoutConfig.blocks || layoutConfig.sections || [];

  let sections = [];

  if (declarativeSections.length > 0) {
    sections = declarativeSections
      .filter(s => s && s.enabled !== false)
      .map((s, idx) => ({
        id: String(s.id || `section_${s.type}_${idx}`),
        type: String(s.type || 'section'),
        variant: s.variant || 'default',
        componentId: s.componentId || (s.variant && s.variant !== 'default' ? s.variant : null),
        label: s.label || s.type,
        position: typeof s.order === 'number' ? s.order : idx,
        isActive: s.enabled !== false,
        config: s.config || {},
        content: s.content || {},
      }));
  } else if (rawModules.length > 0) {
    sections = rawModules
      .filter(m => m && m.is_active !== false)
      .map((m, idx) => ({
        id: String(m.id || `module_${m.type}_${idx}`),
        type: String(m.type || 'section'),
        variant: m.variant || 'default',
        label: m.label || m.type,
        position: typeof m.position === 'number' ? m.position : idx,
        isActive: m.is_active !== false,
        config: m.config || {},
        content: m.content || {},
      }));
  } else if (rawBlocks.length > 0) {
    sections = rawBlocks.map((b, idx) => ({
      id: String(b.id || `block_${b.type}_${idx}`),
      type: String(b.type || 'section'),
      variant: b.variant || 'default',
      label: b.label || b.type,
      position: typeof b.position === 'number' ? b.position : idx,
      isActive: b.enabled !== false && b.is_active !== false,
      config: b.settings || b.config || {},
      content: b.content || {},
    }));
  }

  // ── 5. ASSEMBLER LE BUSINESSPROFILE ─────────────────────────────────────────
  const rawProfile = {
    id: storeId,
    ownerId: rawStore.owner_id || null,
    identity: {
      name: storeName,
      slug: storeSlug,
      description: rawStore.description || '',
      slogan: rawStore.slogan || '',
      logo: rawStore.logo_url || rawStore.logo || '',
      coverImage: rawStore.banner_url || rawStore.cover_url || rawStore.coverImage || '',
      phone: rawStore.phone || '',
      whatsapp: rawStore.whatsapp || rawStore.phone || '',
      email: rawStore.email || '',
      address: rawStore.address || '',
      city: rawStore.city || 'Douala',
      country: rawStore.country || 'Cameroun',
      latitude: rawStore.latitude || null,
      longitude: rawStore.longitude || null,
      website: rawStore.website || '',
      socialLinks: rawStore.social_links || {},
      galleryUrls: Array.isArray(rawStore.gallery_urls)
        ? rawStore.gallery_urls
        : (Array.isArray(rawStore.gallery)
          ? rawStore.gallery
          : (Array.isArray(rawStore.assets?.gallery) ? rawStore.assets.gallery : [])),
      gallery: Array.isArray(rawStore.gallery)
        ? rawStore.gallery
        : (Array.isArray(rawStore.gallery_urls)
          ? rawStore.gallery_urls
          : (Array.isArray(rawStore.assets?.gallery) ? rawStore.assets.gallery : [])),
    },
    business: {
      type: businessType,
      category: rawStore.category || 'Général',
      subcategory: rawStore.subcategory || '',
      status: rawStore.is_active !== false ? 'active' : 'suspended',
      tags: Array.isArray(rawStore.tags) ? rawStore.tags : [],
    },
    capabilities,
    commerce: {
      currency: rawStore.currency || 'FCFA',
      currencySymbol: rawStore.currency_symbol || rawStore.currency || 'FCFA',
      minOrderAmount: Number(rawStore.min_order_amount) || 0,
      allowOutOfStockOrders: Boolean(rawStore.allow_out_of_stock),
      paymentMethods: Array.isArray(rawStore.payment_methods) && rawStore.payment_methods.length > 0
        ? rawStore.payment_methods
        : ['cash_on_delivery', 'orange_money', 'mtn_momo'],
      deliveryZones: Array.isArray(rawStore.delivery_zones) ? rawStore.delivery_zones : [],
      freeDeliveryThreshold: rawStore.free_delivery_threshold ? Number(rawStore.free_delivery_threshold) : null,
      taxesIncluded: rawStore.taxes_included !== false,
    },
    catalog: {
      products: normalizedProducts,
      categories: categoriesList,
      services: Array.isArray(rawStore.services) ? rawStore.services : [],
    },
    storefront: {
      templateId: rawStore.store_template || 'boutique_pro',
      themeId,
      theme: themeTokens,
      layout: layoutConfig,
      sections,
      pages: Array.isArray(activeDeclarativeConfig?.pages) && activeDeclarativeConfig.pages.length > 0
        ? activeDeclarativeConfig.pages
        : (Array.isArray(layoutConfig.pages) ? layoutConfig.pages : []),
      headerId: rawStore.header_id || undefined,
      footerId: rawStore.footer_id || undefined,
      customCss: rawStore.custom_css || '',
    },
    metadata: {
      source: options.source || 'supabase_legacy',
      version: '1.0.0',
      createdAt: rawStore.created_at || new Date().toISOString(),
      updatedAt: rawStore.updated_at || new Date().toISOString(),
      isVerified: Boolean(rawStore.is_verified),
      isBoosted: Boolean(rawStore.is_boosted),
      viewCount: Number(rawStore.views_count || rawStore.views || 0),
      rating: Number(rawStore.rating || 5.0),
      reviewCount: Number(rawStore.reviews_count || 0),
    },
  };

  // Validation stricte Zod — garantie de conformité absolue
  return BusinessProfileSchema.parse(rawProfile);
}
