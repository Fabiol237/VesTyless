'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Search, Filter, ShoppingBag, Plus, Star, Tag, Clock } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE CATALOGUE — Boutique E-commerce Premium
// Configurable: layout grille/liste, filtres catégories, tags, badges promo
// ─────────────────────────────────────────────────────────────────────────────

// Pas de produits de démonstration — uniquement les vraies données de la BD

export default function ModuleCatalogue({
  config = {}, store = {}, theme = {},
  isMobile, storeId, preview, onAddToCart, currency = 'XOF'
}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  const p      = theme['--prim']   || '#6366f1';
  const acc    = theme['--acc']    || p;
  const bg     = theme['--bg']     || '#ffffff';
  const fg     = theme['--fg']     || '#111827';
  const fg2    = theme['--fg2']    || '#6b7280';
  const border = theme['--border'] || 'rgba(0,0,0,0.08)';
  const isDark = bg === '#0f0f1a' || bg === '#120A00' || bg === '#0D0600' || bg === '#18181b';

  const fmt = (v) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (error) throw error;

        const normalizedProducts = (data || []).filter((product) => {
          if (!product) return false;
          const name = String(product.name || '').trim();
          const category = String(product.category || '').trim();
          return name.length > 0 || category.length > 0 || product.image_url || product.price != null;
        });

        setProducts(normalizedProducts);
        setCategories([...new Set(normalizedProducts.map((product) => product.category).filter(Boolean))]);
      } catch (err) {
        console.error('[ModuleCatalogue] Erreur chargement produits:', err);
        setProducts([]);
      }
      setLoading(false);
    })();
  }, [storeId, preview]);

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const btnStyle = {
    padding: '8px 16px', borderRadius: 999, border: `1.5px solid ${border}`,
    background: isDark ? 'rgba(255,255,255,0.04)' : '#fff', color: fg2,
    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.25s', whiteSpace: 'nowrap'
  };
  const sectionTitle = config.headline || 'Découvrez notre collection';
  const sectionSubtitle = config.subheadline || 'Des produits soigneusement sélectionnés pour répondre à toutes vos envies.';

  const activeBtnStyle = { ...btnStyle, background: p, border: `1.5px solid ${p}`, color: '#fff', boxShadow: `0 4px 12px ${p}30` };

  return (
    <section
      ref={sectionRef}
      style={{
        padding: isMobile ? '48px 16px' : '80px 32px',
        background: bg,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: `${p}12`, border: `1px solid ${p}25`, fontSize: 12, fontWeight: 700, color: p, marginBottom: 16 }}>
            <ShoppingBag size={13} /> Boutique en ligne
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 900, color: fg, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            {sectionTitle}
          </h2>
          <p style={{ fontSize: 15, color: fg2, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            {sectionSubtitle}
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          {/* Recherche */}
          <div style={{ position: 'relative', flex: 1, maxWidth: isMobile ? '100%' : 320 }}>
            <Search size={16} color={fg2} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px 12px 40px', borderRadius: 999,
                border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : border}`,
                background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                color: fg, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none'
              }}
            />
          </div>

          {/* Catégories */}
          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: isMobile ? 8 : 0, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              <button onClick={() => setActiveCategory('all')} style={activeCategory === 'all' ? activeBtnStyle : btnStyle}>
                Tout
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={activeCategory === cat ? activeBtnStyle : btnStyle}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grille Produits */}
        {filtered.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: isMobile ? 12 : 24,
          }}>
            {filtered.map((product, i) => (
              <div
                key={product.id}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : border}`,
                  borderRadius: 16, overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  transition: 'all 0.3s',
                  animation: `fadeUp 0.5s ease both ${i * 0.05}s`,
                  position: 'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.08)`; e.currentTarget.style.borderColor = `${p}40`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : border; }}
              >
                {/* Image */}
                <div style={{ aspectRatio: '1', background: isDark ? '#1a1a2e' : `${p}08`, position: 'relative', overflow: 'hidden' }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📦</div>
                  )}
                  {/* Badges (Promo, Nouveau) */}
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {product.old_price && product.old_price > product.price && (
                      <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.05em' }}>PROMO</span>
                    )}
                    {product.tags?.map((tag, idx) => (
                      <span key={idx} style={{ background: p, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.05em' }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Contenu */}
                <div style={{ padding: isMobile ? 12 : 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 11, color: fg2, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{product.category}</div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: fg, margin: '0 0 8px', lineHeight: 1.3 }}>{product.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 'auto', marginBottom: 16 }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: p }}>{fmt(product.price)}</span>
                    {product.old_price && product.old_price > product.price && (
                      <span style={{ fontSize: 12, color: fg2, textDecoration: 'line-through' }}>{fmt(product.old_price)}</span>
                    )}
                  </div>

                  <button
                    onClick={() => { if (product.stock !== 0) onAddToCart?.(product); }}
                    disabled={product.stock === 0}
                    style={{
                      width: '100%', padding: '10px', borderRadius: 10,
                      background: product.stock === 0 ? (isDark ? '#333' : '#f1f5f9') : `linear-gradient(135deg, ${p}, ${acc})`,
                      color: product.stock === 0 ? fg2 : '#fff',
                      border: 'none', fontWeight: 800, fontSize: 13, cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'all 0.2s',
                    }}
                  >
                    {product.stock === 0 ? 'Rupture' : <><Plus size={16} /> Ajouter</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: fg2 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
            <p style={{ fontWeight: 700, color: fg, fontSize: 16 }}>Aucun produit trouvé.</p>
            <p style={{ fontSize: 13 }}>Essayez de modifier votre recherche ou vos filtres.</p>
          </div>
        )}

        <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>
      </div>
    </section>
  );
}
