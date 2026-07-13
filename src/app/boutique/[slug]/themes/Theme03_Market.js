'use client';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart, MapPin, Star, Clock, Leaf, Package, Zap, Truck } from 'lucide-react';

export default function Theme03_Market({
  store, modules = [], pages = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const green = '#1B7A3A';
  const lightGreen = '#2ECC71';
  const orange = '#FF8C00';

  return (
    <main style={{ minHeight: '100vh', background: '#F0FFF4', fontFamily: 'Nunito, Inter, sans-serif', overflowX: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900;1000&display=swap');`}</style>

      {/* ── HERO BANNER MARCHÉ ────────────────────────────────────── */}
      <div style={{ position: 'relative', background: green, overflow: 'hidden', minHeight: '190px' }}>
        {/* Pattern de diagonal stripes */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.04) 20px, rgba(255,255,255,0.04) 40px)` }} />
        {store?.banner_url && (
          <img src={store.banner_url} alt="bannière" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} />
        )}

        {/* Header row avec logo + badge ouvert + panier */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.15)', overflow: 'hidden', flexShrink: 0 }}>
              {store?.logo_url ? (
                <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: '900' }}>{store?.name?.charAt(0)}</div>
              )}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: '900', fontSize: '15px', letterSpacing: '-0.01em' }}>{store?.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ background: orange, color: '#fff', fontSize: '9px', fontWeight: '900', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OUVERT</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: '600' }}>{store?.product_count || 0} produits</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: '600' }}><Star size={10} fill={orange} color={orange} /> {store?.positive_rating ?? 100}%</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {store?.whatsapp_number && (
              <a href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`} target="_blank"
                style={{ width: '38px', height: '38px', background: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                <MessageCircle size={18} color="#fff" />
              </a>
            )}
          </div>
        </div>

        {/* Nom principal centré */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '6px 20px 14px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: lightGreen, fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
            <Leaf size={13} /> MARCHÉ FRAIS <Leaf size={13} />
          </div>
          <div style={{ color: '#fff', fontSize: '22px', fontWeight: '900', letterSpacing: '-0.01em' }}>{store?.name}</div>
          {store?.category && <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{store.category}</div>}
          {/* Badges produits */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: orange, color: '#fff', borderRadius: '999px', padding: '5px 12px', fontSize: '11px', fontWeight: '800', boxShadow: '0 3px 10px rgba(0,0,0,0.25)' }}>
              <Package size={12} /> {store?.product_count || 0} produits frais
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '999px', padding: '5px 12px', fontSize: '11px', fontWeight: '800', border: '1px solid rgba(255,255,255,0.3)' }}>
              <Star size={12} fill={orange} color={orange} /> {store?.positive_rating ?? 100}% satisfaits
            </div>
          </div>
        </div>
      </div>

      {/* ── BARRE STATS ───────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: `1px solid #e8f5e9` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', maxWidth: '800px', margin: '0 auto' }}>
          {[
            { value: store?.product_count || 0, label: 'Produits' },
            { value: `${store?.positive_rating ?? 100}%`, label: 'Satisfaits', color: orange },
            { value: store?.total_sold || 0, label: 'Vendus', color: green },
            { value: store?.response_time || '< 1h', label: 'Réponse' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '10px 6px', borderRight: i < 3 ? '1px solid #e8f5e9' : 'none' }}>
              <div style={{ fontSize: '16px', fontWeight: '900', color: s.color || green, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#94a3b8', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── NAVIGATION ────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8f5e9', position: isPreview ? 'static' : 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', padding: '0 8px' }}>
          {pages.map(m => (
            <button key={m.key} onClick={() => setActivePage(m.key)}
              style={{ padding: '11px 14px', background: 'none', border: 'none', borderBottom: `3px solid ${activePage === m.key ? green : 'transparent'}`, color: activePage === m.key ? green : '#64748b', fontWeight: '800', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {m.label}
            </button>
          ))}
          {/* Actions inline */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '4px' }}>
            <button onClick={handleShare} style={{ width: '32px', height: '32px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {shared ? <CheckCircle2 size={15} color="#22c55e" /> : <Share2 size={15} color="#64748b" />}
            </button>
            {!isPreview && (
              <button onClick={onOpenCart} style={{ width: '32px', height: '32px', background: green, border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <ShoppingCart size={15} color="#fff" />
                {cartCount > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: orange, color: '#fff', fontSize: '8px', fontWeight: '900', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENU ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 12px 80px' }}>
        {children}
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer style={{ background: green, padding: '20px 16px', textAlign: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>{store?.name}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>© {new Date().getFullYear()} · Produits frais par VesTyle</div>
      </footer>
    </main>
  );
}
