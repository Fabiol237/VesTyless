'use client';
import { useState, useRef, useEffect } from 'react';
import { Utensils, Search, Plus, Info, Coffee, Flame } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE RESTAURANT — Menu Digital Premium pour Restaurants
// Configurable: layout (grid/list), catégories, filtres, badges plats
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_MENU = [
  { id: 1, name: 'Burger Truffe & Cheddar', description: 'Bœuf haché, cheddar affiné, mayonnaise à la truffe, roquette.', price: 8500, category: 'Plats', tags: ['Populaire', 'Nouveau'], image_url: null },
  { id: 2, name: 'Salade César Croustillante', description: 'Poulet pané, laitue romaine, parmesan, croûtons, sauce César maison.', price: 6000, category: 'Entrées', tags: [], image_url: null },
  { id: 3, name: 'Tiramisu au Café Moka', description: 'Mascarpone, biscuit cuillère, espresso et cacao intense.', price: 4500, category: 'Desserts', tags: ['Fait maison'], image_url: null },
  { id: 4, name: 'Cocktail Signature VesTyle', description: 'Gin, sirop de romarin, jus de citron, tonic.', price: 5000, category: 'Boissons', tags: [], image_url: null },
  { id: 5, name: 'Planche Mixte', description: 'Charcuterie fine, fromages de la région, confiture de figues.', price: 12000, category: 'À Partager', tags: ['À partager'], image_url: null },
];

export default function ModuleRestaurant({
  config = {}, store = {}, theme = {},
  isMobile, storeId, preview, onAddToCart, currency = 'XOF'
}) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  const p      = theme['--prim']   || '#D4AF37';
  const acc    = theme['--acc']    || p;
  const bg     = theme['--bg']     || '#120A00';
  const fg     = theme['--fg']     || '#FDF6E3';
  const fg2    = theme['--fg2']    || '#888888';
  const border = theme['--border'] || 'rgba(212,175,55,0.2)';
  const isDark = bg === '#0f0f1a' || bg === '#120A00' || bg === '#0D0600' || bg === '#18181b' || bg === '#0a0500';

  const fmt = (v) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (preview || !storeId) {
      setMenuItems(DEMO_MENU);
      setCategories([...new Set(DEMO_MENU.map(m => m.category))]);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data } = await supabase.from('restaurant_menu').select('*').eq('store_id', storeId).order('category', { ascending: true });
        if (data?.length) {
          setMenuItems(data);
          setCategories([...new Set(data.map(m => m.category).filter(Boolean))]);
        } else {
          setMenuItems(DEMO_MENU);
          setCategories([...new Set(DEMO_MENU.map(m => m.category))]);
        }
      } catch { setMenuItems(DEMO_MENU); }
      setLoading(false);
    })();
  }, [storeId, preview]);

  const filtered = menuItems.filter(m => {
    const matchCat = activeCategory === 'all' || m.category === activeCategory;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const layout = config.layout || 'list'; // list ou grid

  return (
    <section
      ref={sectionRef}
      style={{
        padding: isMobile ? '40px 16px' : '80px 32px',
        background: bg,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        {/* En-tête Menu */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: `linear-gradient(to right, transparent, ${p})` }} />
            <Utensils size={18} color={p} />
            <div style={{ width: 40, height: 1, background: `linear-gradient(to left, transparent, ${p})` }} />
          </div>
          <h2 style={{ fontSize: isMobile ? 28 : 42, fontWeight: 900, color: fg, margin: '0 0 10px', letterSpacing: '0.02em', fontFamily: 'var(--font), Georgia, serif' }}>
            {config.headline || 'Notre Carte'}
          </h2>
          <p style={{ fontSize: 14, color: fg2, maxWidth: 500, margin: '0 auto', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {config.subheadline || 'Des plats préparés avec passion'}
          </p>
        </div>

        {/* Filtres & Recherche */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          
          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, msOverflowStyle: 'none', scrollbarWidth: 'none', width: isMobile ? '100%' : 'auto' }}>
              <button
                onClick={() => setActiveCategory('all')}
                style={{ padding: '8px 20px', borderRadius: 4, border: activeCategory === 'all' ? `1px solid ${p}` : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : border}`, background: activeCategory === 'all' ? `${p}15` : 'transparent', color: activeCategory === 'all' ? p : fg2, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Tout le menu
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{ padding: '8px 20px', borderRadius: 4, border: activeCategory === cat ? `1px solid ${p}` : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : border}`, background: activeCategory === cat ? `${p}15` : 'transparent', color: activeCategory === cat ? p : fg2, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div style={{ position: 'relative', width: isMobile ? '100%' : 260 }}>
            <Search size={16} color={fg2} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: 4, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : border}`, background: 'transparent', color: fg, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        </div>

        {/* Affichage des plats (LISTE ou GRILLE) */}
        {filtered.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: layout === 'grid' ? (isMobile ? '1fr' : 'repeat(2, 1fr)') : '1fr',
            gap: layout === 'grid' ? 24 : 32,
          }}>
            {filtered.map((item, i) => (
              <div
                key={item.id}
                style={{
                  display: 'flex', gap: 16, alignItems: 'center',
                  padding: layout === 'grid' ? 16 : 0,
                  border: layout === 'grid' ? `1px solid ${border}` : 'none',
                  borderRadius: layout === 'grid' ? 12 : 0,
                  borderBottom: layout === 'list' ? `1px dashed ${border}` : undefined,
                  paddingBottom: layout === 'list' ? 32 : undefined,
                  animation: `fadeUp 0.5s ease both ${i * 0.05}s`,
                  background: layout === 'grid' ? (isDark ? 'rgba(255,255,255,0.02)' : '#fff') : 'transparent',
                }}
              >
                {item.image_url && (
                  <div style={{ width: layout === 'grid' ? 80 : 100, height: layout === 'grid' ? 80 : 100, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: `1px solid ${border}` }}>
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: fg, margin: 0, fontFamily: 'var(--font), Georgia, serif' }}>{item.name}</h3>
                    <div style={{ height: 1, flex: 1, background: `repeating-linear-gradient(to right, ${fg2}40 0, ${fg2}40 2px, transparent 2px, transparent 6px)` }} className="hidden sm:block" />
                    <span style={{ fontSize: 16, fontWeight: 900, color: p, flexShrink: 0 }}>{fmt(item.price)}</span>
                  </div>
                  
                  <p style={{ fontSize: 13, color: fg2, lineHeight: 1.6, margin: '0 0 10px' }}>{item.description}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {item.tags?.map((tag, idx) => (
                        <span key={idx} style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#fff' : p, background: isDark ? 'rgba(255,255,255,0.1)' : `${p}15`, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {config.allowCart && (
                      <button
                        onClick={() => onAddToCart?.(item)}
                        style={{ background: 'none', border: `1px solid ${p}`, borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p, cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.background = p; e.currentTarget.style.color = isDark ? '#000' : '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = p; }}
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: fg2 }}>
            <Coffee size={40} color={`${p}50`} style={{ marginBottom: 16 }} />
            <p style={{ fontWeight: 700, color: fg, fontSize: 16 }}>Aucun plat ne correspond à vos critères.</p>
          </div>
        )}

        <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>
      </div>
    </section>
  );
}
