'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
];

/**
 * CollectionBlock — Grille de produits/services/plats
 * Variants: grid | list | featured | masonry | menu | carousel
 */
export default function CollectionBlock({ variant = 'grid', settings = {}, content = {}, theme = {}, store, products: productsDirect, productsProp }) {
  const activeProducts = productsDirect || productsProp;
  const {
    columns = '3',
    cardStyle = 'shadow',
    cardRadius = 12,
    imageRatio = 'square',
    showPrice = true,
    currency: settingsCurrency = 'XOF',
    showRating = true,
    showBadges = true,
    showCart = true,
    showFilters = true,
    showSearch = false,
    limit = 12,
    hoverEffect = 'lift',
    bgColor = '#f9fafb',
    paddingTop = 60,
    paddingBottom = 60,
  } = settings;

  const {
    title = 'Notre Catalogue',
    subtitle = '',
    dataSource = 'products',
    filterType = 'all',
  } = content;

  const currency = settingsCurrency;
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeProducts && Array.isArray(activeProducts) && activeProducts.length > 0) {
      setItems(activeProducts);
      setCats([...new Set(activeProducts.map(p => p.category).filter(Boolean))]);
      setLoading(false);
      return;
    }
    if (!store?.id) { setLoading(false); return; }
    (async () => {
      let q = supabase.from('products').select('*').eq('store_id', store.id).limit(limit);
      if (dataSource === 'services') q = q.eq('offer_type', 'service');
      const { data } = await q;
      setItems(data || []);
      setCats([...new Set((data || []).map(p => p.category).filter(Boolean))]);
      setLoading(false);
    })();
  }, [store?.id, dataSource, limit, activeProducts]);

  const filtered = items.filter(p => {
    const matchCat = filter === 'all' || p.category === filter;
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cols = parseInt(columns) || 3;
  const ratioMap = { square: '100%', portrait: '133%', landscape: '66%', auto: '200px' };
  const cardBg = cardStyle === 'glass' ? 'rgba(255,255,255,0.7)' : '#fff';
  const cardShadow = cardStyle === 'shadow' ? '0 2px 20px rgba(0,0,0,0.08)' : 'none';
  const cardBorder = cardStyle === 'border' ? '1.5px solid #e5e7eb' : cardStyle === 'glass' ? '1px solid rgba(255,255,255,0.5)' : 'none';
  const primary = theme.primaryColor || '#6366f1';
  const fmt = v => typeof v === 'number' ? new Intl.NumberFormat('fr-FR').format(v) + ' ' + currency : `${v || 0} ${currency}`;

  // ── Variant: MENU (restaurant) ──────────────────────────────────────────────
  if (variant === 'menu') {
    return (
      <section style={{ background: bgColor, paddingTop, paddingBottom }}>
        <style>{`.menu-card{transition:all 0.2s}.menu-card:hover{box-shadow:0 8px 30px rgba(0,0,0,0.12)!important}`}</style>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          {title && <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: 8 }}>{title}</h2>}
          {subtitle && <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 32 }}>{subtitle}</p>}
          {showFilters && cats.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
              {['all', ...cats].map(cat => (
                <button key={cat} onClick={() => setFilter(cat)} style={{
                  padding: '6px 16px', borderRadius: 20, border: `1.5px solid ${filter === cat ? primary : '#e5e7eb'}`,
                  background: filter === cat ? primary : '#fff', color: filter === cat ? '#fff' : '#374151',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>{cat === 'all' ? 'Tout voir' : cat}</button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Chargement...</div>
            ) : filtered.map((item, idx) => (
              <div key={item.id} className="menu-card" style={{
                display: 'flex', gap: 16, alignItems: 'center',
                background: cardBg, borderRadius: cardRadius, padding: 16,
                boxShadow: cardShadow, border: cardBorder,
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 8, flexShrink: 0,
                  backgroundImage: item.image_url ? `url(${item.image_url})` : 'none',
                  background: item.image_url ? undefined : PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length],
                  backgroundSize: 'cover', backgroundPosition: 'center',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 4 }}>{item.name}</div>
                  {item.description && <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, marginBottom: 6 }}>{item.description}</div>}
                  {showBadges && item.is_featured && <span style={{ fontSize: 10, background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>⭐ Vedette</span>}
                </div>
                {showPrice && (
                  <div style={{ fontWeight: 800, fontSize: 16, color: primary, whiteSpace: 'nowrap' }}>{fmt(item.price)}</div>
                )}
              </div>
            ))}
            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Aucun article disponible</div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ── Variant: LIST ────────────────────────────────────────────────────────────
  if (variant === 'list') {
    return (
      <section style={{ background: bgColor, paddingTop, paddingBottom }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {title && <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: subtitle ? 8 : 32 }}>{title}</h2>}
          {subtitle && <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 32 }}>{subtitle}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Chargement...</div>
              : filtered.map((item, idx) => (
              <div key={item.id} style={{
                display: 'flex', gap: 20, alignItems: 'center',
                background: cardBg, borderRadius: cardRadius,
                boxShadow: cardShadow, border: cardBorder, padding: 16,
              }}>
                <div style={{
                  width: 100, height: 80, borderRadius: 8, flexShrink: 0,
                  background: item.image_url ? `url(${item.image_url}) center/cover` : PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length],
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{item.name}</div>
                  {item.description && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{item.description}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  {showPrice && <span style={{ fontWeight: 800, fontSize: 18, color: primary }}>{fmt(item.price)}</span>}
                  {showCart && item.stock !== 0 && (
                    <button style={{ padding: '8px 16px', borderRadius: 8, background: primary, color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      Ajouter
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Variant: FEATURED ────────────────────────────────────────────────────────
  if (variant === 'featured' && filtered.length > 0) {
    const [first, ...rest] = filtered;
    return (
      <section style={{ background: bgColor, paddingTop, paddingBottom }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {title && <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: 32 }}>{title}</h2>}
          {/* Item featured */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div style={{
              borderRadius: cardRadius, overflow: 'hidden',
              background: first.image_url ? `url(${first.image_url}) center/cover` : PLACEHOLDER_GRADIENTS[0],
              minHeight: 300, position: 'relative',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.7),transparent)' }} />
              <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>{first.name}</div>
                {showPrice && <div style={{ color: '#fff', fontWeight: 700, marginTop: 4 }}>{fmt(first.price)}</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {rest.slice(0, 4).map((item, idx) => (
                <div key={item.id} style={{
                  borderRadius: cardRadius, overflow: 'hidden',
                  background: item.image_url ? `url(${item.image_url}) center/cover` : PLACEHOLDER_GRADIENTS[(idx + 1) % PLACEHOLDER_GRADIENTS.length],
                  minHeight: 130, position: 'relative',
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6),transparent)' }} />
                  <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Variant: GRID (défaut) ───────────────────────────────────────────────────
  return (
    <section style={{ background: bgColor, paddingTop, paddingBottom }}>
      <style>{`
        .coll-card{transition:transform 0.25s,box-shadow 0.25s}
        .coll-card:hover{${hoverEffect === 'lift' ? 'transform:translateY(-6px);box-shadow:0 12px 40px rgba(0,0,0,0.15)!important' : hoverEffect === 'zoom' ? 'transform:scale(1.02)' : ''}}
        .filter-tab.active{background:${primary}!important;color:#fff!important;border-color:${primary}!important}
        @media(max-width:640px){.coll-grid{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {title && <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: subtitle ? 8 : 32 }}>{title}</h2>}
        {subtitle && <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 32 }}>{subtitle}</p>}

        {showSearch && (
          <div style={{ marginBottom: 20 }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              style={{ width: '100%', maxWidth: 400, display: 'block', margin: '0 auto', padding: '10px 16px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none' }}
            />
          </div>
        )}

        {showFilters && cats.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
            {['all', ...cats].map(cat => (
              <button key={cat} className={`filter-tab${filter === cat ? ' active' : ''}`} onClick={() => setFilter(cat)} style={{
                padding: '6px 16px', borderRadius: 20, border: '1.5px solid #e5e7eb',
                background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}>{cat === 'all' ? 'Tout voir' : cat}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Aucun produit disponible</div>
        ) : (
          <div className="coll-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>
            {filtered.map((item, idx) => (
              <div key={item.id} className="coll-card" style={{
                background: cardBg, borderRadius: cardRadius,
                boxShadow: cardShadow, border: cardBorder, overflow: 'hidden',
                backdropFilter: cardStyle === 'glass' ? 'blur(12px)' : 'none', cursor: 'pointer',
              }}>
                <div style={{
                  position: 'relative',
                  paddingTop: imageRatio === 'auto' ? '200px' : ratioMap[imageRatio],
                  background: item.image_url ? `url(${item.image_url}) center/cover` : PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length],
                  overflow: 'hidden',
                }}>
                  {showBadges && (
                    <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {item.is_new && <span style={{ background: '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>NOUVEAU</span>}
                      {item.is_featured && <span style={{ background: '#f59e0b', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>⭐ VEDETTE</span>}
                      {item.stock === 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>RUPTURE</span>}
                    </div>
                  )}
                </div>
                <div style={{ padding: 14 }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{item.name}</h3>
                  {showRating && item.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                      <span style={{ color: '#f59e0b', fontSize: 12 }}>★</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{item.rating}</span>
                      {item.reviews_count && <span style={{ fontSize: 11, color: '#9ca3af' }}>({item.reviews_count})</span>}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    {showPrice && (
                      <span style={{ fontSize: 16, fontWeight: 800, color: primary }}>{fmt(item.price)}</span>
                    )}
                    {showCart && item.stock !== 0 && (
                      <button style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '7px 14px', borderRadius: 8, border: 'none',
                        background: primary, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      }}>
                        🛒 Ajouter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
