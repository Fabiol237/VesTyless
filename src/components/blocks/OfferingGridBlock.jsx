'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
];

export default function OfferingGridBlock({ config = {}, theme = {}, store }) {
  const {
    title = 'Nos Offres',
    subtitle = '',
    offerTypes = 'both',
    columns = '3',
    layout = 'grid',
    cardStyle = 'shadow',
    cardRadius = 12,
    showPrice = true,
    currency = 'XOF',
    showRating = true,
    showBadges = true,
    showAddToCart = true,
    addToCartText = 'Ajouter',
    showFilters = true,
    itemsPerPage = 12,
    imageRatio = 'square',
    hoverEffect = 'lift',
    bgColor = '#f9fafb',
    paddingTop = 60,
    paddingBottom = 60,
  } = config;

  const [items, setItems]   = useState([]);
  const [filter, setFilter] = useState('all');
  const [cats, setCats]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store?.id) { setLoading(false); return; }
    const fetchItems = async () => {
      // Requête sans filtre is_active pour ne pas bloquer les produits sans ce champ
      let q = supabase.from('products').select('*').eq('store_id', store.id).limit(itemsPerPage);
      if (offerTypes === 'products') q = q.eq('offer_type', 'product');
      if (offerTypes === 'services') q = q.eq('offer_type', 'service');
      const { data, error } = await q;
      if (error) console.error('[OfferingGridBlock] Erreur BD:', error);
      setItems(data || []);
      const unique = [...new Set((data || []).map(p => p.category).filter(Boolean))];
      setCats(unique);
      setLoading(false);
    };
    fetchItems();
  }, [store?.id, offerTypes, itemsPerPage]);

  const filtered = filter === 'all' ? items : items.filter(p => p.category === filter);
  const colMap = { '1': 1, '2': 2, '3': 3, '4': 4 };
  const cols = colMap[columns] || 3;
  const ratioMap = { square: '100%', portrait: '133%', landscape: '66%', auto: 'auto' };

  const cardBg = cardStyle === 'glass' ? 'rgba(255,255,255,0.7)' : '#fff';
  const cardShadow = cardStyle === 'shadow' ? '0 2px 20px rgba(0,0,0,0.08)' : cardStyle === 'border' ? 'none' : 'none';
  const cardBorder = cardStyle === 'border' ? '1.5px solid #e5e7eb' : cardStyle === 'glass' ? '1px solid rgba(255,255,255,0.5)' : 'none';

  // Uniquement les vraies données BD — pas de données fictives
  const displayItems = filtered;

  return (
    <section style={{ background: bgColor, paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <style>{`
        .offering-card { transition: transform 0.25s, box-shadow 0.25s; }
        .offering-card:hover { ${hoverEffect === 'lift' ? 'transform: translateY(-6px); box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;' : hoverEffect === 'zoom' ? 'transform: scale(1.02);' : ''} }
        .cart-btn:hover { opacity: 0.85 !important; }
        .filter-tab:hover { background: ${theme.primaryColor || '#6366f1'}22 !important; }
        .filter-tab.active { background: ${theme.primaryColor || '#6366f1'} !important; color: #fff !important; }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        {title && (
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', margin: '0 0 8px' }}>{title}</h2>
            {subtitle && <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0 }}>{subtitle}</p>}
          </div>
        )}

        {/* Filtres */}
        {showFilters && cats.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
            {['all', ...cats].map(cat => (
              <button key={cat} className={`filter-tab${filter === cat ? ' active' : ''}`} onClick={() => setFilter(cat)} style={{
                padding: '6px 16px', borderRadius: '20px', border: '1.5px solid #e5e7eb',
                background: '#fff', color: '#374151', fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {cat === 'all' ? 'Tout voir' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Grille */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Chargement...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '20px',
          }}>
            {displayItems.map((item, idx) => (
              <div key={item.id} className="offering-card" style={{
                background: cardBg,
                borderRadius: `${cardRadius}px`,
                boxShadow: cardShadow,
                border: cardBorder,
                overflow: 'hidden',
                backdropFilter: cardStyle === 'glass' ? 'blur(12px)' : 'none',
                cursor: 'pointer',
              }}>
                {/* Image */}
                <div style={{
                  position: 'relative',
                  paddingTop: imageRatio === 'auto' ? '200px' : ratioMap[imageRatio],
                  background: item.image_url ? `url(${item.image_url}) center/cover` : PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length],
                  overflow: 'hidden',
                }}>
                  {showBadges && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {item.is_new && <span style={{ background: '#3b82f6', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>NOUVEAU</span>}
                      {item.is_featured && <span style={{ background: '#f59e0b', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>⭐ VEDETTE</span>}
                      {item.stock === 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>RUPTURE</span>}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '14px' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: '700', color: '#111827', lineHeight: 1.3 }}>{item.name}</h3>

                  {showRating && item.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                      <span style={{ color: '#f59e0b', display: 'flex' }}><StarIcon /></span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>{item.rating}</span>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>({item.reviews_count})</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    {showPrice && (
                      <span style={{ fontSize: '16px', fontWeight: '800', color: theme.primaryColor || '#6366f1' }}>
                        {typeof item.price === 'number' ? item.price.toLocaleString() : item.price} {currency}
                      </span>
                    )}
                    {showAddToCart && item.stock !== 0 && (
                      <button className="cart-btn" style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '7px 14px', borderRadius: '8px', border: 'none',
                        background: theme.primaryColor || '#6366f1',
                        color: '#fff', fontSize: '12px', fontWeight: '700',
                        cursor: 'pointer', transition: 'opacity 0.15s',
                      }}>
                        <CartIcon /> {addToCartText}
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
