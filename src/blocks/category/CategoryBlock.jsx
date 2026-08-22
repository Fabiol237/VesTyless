'use client';
export default function CategoryBlock({ variant = 'grid', settings = {}, content = {}, theme = {}, products }) {
  const { columns = '4', cardRadius = 12, bgColor = '#ffffff', paddingTop = 40, paddingBottom = 40 } = settings;
  const { title = '', items = [] } = content;
  const primary = theme.primaryColor || '#6366f1';

  // Deriver les categories réelles depuis les produits si items est vide
  const derivedFromProducts = (products || []).reduce((acc, p) => {
    if (p.category && !acc.some(c => c.label === p.category)) {
      acc.push({ label: p.category, icon: '📦', count: (products || []).filter(item => item.category === p.category).length });
    }
    return acc;
  }, []);

  const displayItems = items.length > 0 ? items : derivedFromProducts;
  if (displayItems.length === 0) return null;
  const cols = parseInt(columns) || 4;
  return (
    <section style={{ background: bgColor, paddingTop, paddingBottom }}>
      <style>{`
        .cat-card{transition:transform 0.2s,box-shadow 0.2s}
        .cat-card:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(0,0,0,0.1)!important;cursor:pointer}
        @media(max-width:768px){.cat-grid{grid-template-columns:repeat(2,1fr)!important;gap:12px!important}}
        @media(max-width:380px){.cat-grid{grid-template-columns:repeat(2,1fr)!important;gap:8px!important}}
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {title && <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: 32 }}>{title}</h2>}
        <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
          {displayItems.map((cat, i) => (
            <div key={i} className="cat-card" style={{ borderRadius: cardRadius, background: cat.color || `${primary}10`, padding: '28px 16px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              {cat.image ? (
                <img src={cat.image} alt={cat.label} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} />
              ) : (
                <div style={{ fontSize: 36, marginBottom: 12 }}>{cat.icon || '📦'}</div>
              )}
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{cat.label}</div>
              {cat.count != null && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{cat.count} articles</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
