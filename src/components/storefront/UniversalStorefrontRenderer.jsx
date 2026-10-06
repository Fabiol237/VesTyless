'use client';
import React, { useMemo } from 'react';
import { getTemplate } from '@/templates';

/**
 * VesTyle / Vestin — Universal Storefront Renderer
 * ─────────────────────────────────────────────────────────────────────────────
 * Point d'accès universel au rendu des vitrines par architecture sectorielle.
 */
export default function UniversalStorefrontRenderer({
  profile,
  activePageId = 'home',
  onNavigatePage,
  onAddToCart,
  cartCount = 0,
  isMobile = false,
  legacyTemplateFallback = null,
  forceLegacy = false,
}) {
  // 1. Données du magasin adaptées pour les templates sectoriels
  const theme = profile?.storefront?.theme || {};
  const isDark = theme.mode === 'dark' || theme.isDark;

  const resolvedTheme = useMemo(() => {
    const primaryColor = theme.primaryColor || theme.colors?.primary || '#128C7E';
    const accentColor = theme.accentColor || theme.colors?.accent || '#25D366';
    const bgColor = theme.bgColor || theme.colors?.background || (isDark ? '#0B0F19' : '#FFFFFF');
    const textColor = theme.textColor || theme.colors?.text || (isDark ? '#F8FAFC' : '#0F172A');
    const mutedColor = isDark ? '#94A3B8' : '#64748B';
    const cardBg = theme.colors?.cardBackground || (isDark ? 'rgba(30, 41, 59, 0.92)' : '#FFFFFF');
    const cardBorder = theme.colors?.cardBorder || (isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(15, 23, 42, 0.08)');

    return {
      mode: isDark ? 'dark' : 'light',
      isDark,
      primaryColor,
      accentColor,
      bgColor,
      textColor,
      mutedColor,
      cardBg,
      cardBorder,
      font: theme.font || 'Inter',
      headingFont: theme.headingFont || theme.font || 'Inter',
    };
  }, [theme, isDark]);

  const themeVars = useMemo(() => ({
    '--prim': resolvedTheme.primaryColor,
    '--acc': resolvedTheme.accentColor,
    '--bg': resolvedTheme.bgColor,
    '--fg': resolvedTheme.textColor,
    '--fg2': resolvedTheme.mutedColor,
    '--border': resolvedTheme.cardBorder,
    '--font': `'${resolvedTheme.font}', Inter, sans-serif`,
    '--heading-font': `'${resolvedTheme.headingFont}', '${resolvedTheme.font}', Inter, sans-serif`,
  }), [resolvedTheme]);

  const storeData = useMemo(() => {
    if (!profile) return null;
    return {
      id: profile.id || '',
      name: profile.identity?.name || 'Boutique',
      slug: profile.identity?.slug || 'boutique',
      description: profile.identity?.description || '',
      slogan: profile.identity?.slogan || '',
      logo_url: profile.identity?.logo || '',
      banner_url: profile.identity?.coverImage || '',
      phone: profile.identity?.phone || '',
      whatsapp: profile.identity?.whatsapp || profile.identity?.phone || '',
      whatsapp_link: profile.identity?.whatsapp || profile.identity?.phone || '',
      address: profile.identity?.address || '',
      city: profile.identity?.city || 'Douala',
      currency: profile.commerce?.currency || 'FCFA',
      theme_color: resolvedTheme.primaryColor,
      business_type: profile.identity?.businessType || profile.business_type || 'products',
      store_template: profile.storefront?.templateId || '',
      categories: profile.catalog?.categories || [],
      galleryUrls: profile.identity?.galleryUrls || profile.identity?.gallery || [],
    };
  }, [profile, resolvedTheme]);

  const products = useMemo(() => profile?.catalog?.products || [], [profile]);
  const modules = useMemo(() => profile?.storefront?.modules || [], [profile]);

  if (!profile || !storeData) {
    if (legacyTemplateFallback) return legacyTemplateFallback;
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
        <p className="text-sm font-medium opacity-70">Chargement de la boutique...</p>
      </div>
    );
  }

  // Résolution du Template Sectoriel Maître
  const TemplateComponent = getTemplate(modules, storeData);

  const templateProps = {
    store: storeData,
    themeVars,
    storeId: storeData.id,
    isMobile,
    productsProp: products,
    onAddToCart: onAddToCart || (() => {}),
    cartCount,
    currency: storeData.currency,
  };

  return (
    <main
      className="w-full min-h-screen transition-colors duration-300 relative"
      style={{
        ...themeVars,
        backgroundColor: resolvedTheme.bgColor,
        color: resolvedTheme.textColor,
        fontFamily: 'var(--font)',
      }}
    >
      <TemplateComponent {...templateProps} />

      {/* Bouton d'action flottant WhatsApp */}
      {(storeData.whatsapp || storeData.phone) && (
        <aside
          aria-label="Commander sur WhatsApp"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 group"
        >
          <a
            href={`https://wa.me/${(storeData.whatsapp || storeData.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${storeData.name}, je visite votre boutique sur VesTyle et je souhaite passer commande.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Discuter sur WhatsApp"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 18px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
              fontWeight: 700,
              fontSize: '13px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </aside>
      )}
    </main>
  );
}
