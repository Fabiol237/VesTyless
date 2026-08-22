/**
 * VesTyle — Block Engine : Renderer universel
 *
 * <BlockRenderer> est le point d'entrée unique pour afficher n'importe quel bloc.
 * Il reçoit { type, variant, settings, content, theme, store } et instancie
 * le bon composant React.
 */
'use client';
import { Suspense, lazy, memo } from 'react';
import { BLOCK_REGISTRY } from '@/lib/blockEngine/registry';

// ─── Composants réels implémentés ───────────────────────────────────────────
const IMPLEMENTED_BLOCKS = {
  header:       lazy(() => import('@/blocks/header/HeaderBlock')),
  hero:         lazy(() => import('@/blocks/hero/HeroBlock')),
  collection:   lazy(() => import('@/blocks/collection/CollectionBlock')),
  category:     lazy(() => import('@/blocks/category/CategoryBlock')),
  offer:        lazy(() => import('@/blocks/offer/OfferBlock')),
  contact:      lazy(() => import('@/blocks/contact/ContactBlock')),
  review:       lazy(() => import('@/blocks/review/ReviewBlock')),
  newsletter:   lazy(() => import('@/blocks/newsletter/NewsletterBlock')),
  footer:       lazy(() => import('@/blocks/footer/FooterBlock')),
  faq:          lazy(() => import('@/blocks/faq/FaqBlock')),
  feature:      lazy(() => import('@/blocks/feature/FeatureBlock')),
  stats:        lazy(() => import('@/blocks/stats/StatsBlock')),
  cta:          lazy(() => import('@/blocks/cta/CtaBlock')),
  gallery:      lazy(() => import('@/blocks/gallery/GalleryBlock')),
  video:        lazy(() => import('@/blocks/video/VideoBlock')),
  social:       lazy(() => import('@/blocks/social/SocialBlock')),
  booking:      lazy(() => import('@/blocks/booking/BookingBlock')),
};

// ─── Composant générique pour les blocs non encore créés ─────────────────────
function GenericBlock({ type, settings = {}, content = {}, theme = {} }) {
  const meta = BLOCK_REGISTRY[type] || {};
  const { bgColor = '#f8fafc', paddingTop = 40, paddingBottom = 40 } = settings;
  const title = content.title || meta.label || type;
  const subtitle = content.subtitle || meta.description || '';

  return (
    <section style={{ background: bgColor, paddingTop, paddingBottom, borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', color: theme.primaryColor || '#6366f1', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
          <span>{meta.icon || '📦'}</span>
          <span>{meta.label || type}</span>
        </div>
        {title && <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>{title}</h2>}
        {subtitle && <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>{subtitle}</p>}
      </div>
    </section>
  );
}

// ─── Skeleton de chargement ──────────────────────────────────────────────────
function BlockSkeleton({ type }) {
  return (
    <div
      aria-label={`Chargement du bloc ${type}...`}
      style={{
        minHeight: 80,
        background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
        backgroundSize: '200% 100%',
        animation: 'blockShimmer 1.5s infinite',
        borderRadius: 8,
      }}
    >
      <style>{`@keyframes blockShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

// ─── BlockRenderer ────────────────────────────────────────────────────────────
const BlockRenderer = memo(function BlockRenderer({
  type,
  variant,
  settings = {},
  content  = {},
  theme    = {},
  store    = {},
  enabled  = true,
  blockId,
  isEditing = false,
  onSelect,
  products,
  onAddToCart,
  currency,
}) {
  if (!enabled) return null;

  if (!BLOCK_REGISTRY[type]) {
    return null;
  }

  const BlockComponent = IMPLEMENTED_BLOCKS[type];

  const commonProps = {
    variant:    variant || BLOCK_REGISTRY[type]?.defaultVariant,
    settings,
    content,
    theme,
    store,
    blockId,
    isEditing,
    onSelect,
    products,
    onAddToCart,
    currency: currency || settings?.currency || 'XOF',
  };

  const wrapper = isEditing ? {
    position: 'relative',
    outline: '2px dashed transparent',
    transition: 'outline-color 0.15s',
    cursor: 'pointer',
  } : {};

  return (
    <div
      data-block-id={blockId}
      data-block-type={type}
      data-block-variant={variant}
      style={wrapper}
      onClick={isEditing && onSelect ? () => onSelect(blockId) : undefined}
    >
      {BlockComponent ? (
        <Suspense fallback={<BlockSkeleton type={type} />}>
          <BlockComponent {...commonProps} />
        </Suspense>
      ) : (
        <GenericBlock type={type} settings={settings} content={content} theme={theme} />
      )}
    </div>
  );
});

export default BlockRenderer;

// ─── StorefrontRenderer ───────────────────────────────────────────────────────
export function StorefrontRenderer({
  blocks = [],
  theme  = {},
  store  = {},
  isEditing = false,
  onSelectBlock,
  products,
  onAddToCart,
  currency,
}) {
  const sorted = [...blocks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return (
    <>
      {sorted.map((block) => (
        <BlockRenderer
          key={block.id || block.type}
          type={block.type}
          variant={block.variant}
          settings={block.settings || {}}
          content={block.content   || {}}
          enabled={block.enabled !== false}
          blockId={block.id}
          theme={theme}
          store={store}
          isEditing={isEditing}
          onSelect={onSelectBlock}
          products={products}
          onAddToCart={onAddToCart}
          currency={currency}
        />
      ))}
    </>
  );
}
