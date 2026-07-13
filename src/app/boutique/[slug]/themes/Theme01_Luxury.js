'use client';
import { MessageCircle, Share2, CheckCircle2, ShoppingBag, MapPin, Star, Clock } from 'lucide-react';

export default function Theme01_Luxury({
  store, modules = [], pages = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const gold = '#C9A84C';
  const dark = '#0A0A0A';

  return (
    <main style={{ minHeight: '100vh', background: '#FAF8F5', fontFamily: "'Cormorant Garamond', 'Georgia', serif", overflowX: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ── BANDE SUPÉRIEURE ──────────────────────────────────────── */}
      <div style={{ background: dark, padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#888', fontSize: '10px', fontFamily: 'Inter, sans-serif', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          MAISON DE MODE · VESTYLE
        </span>
        <button onClick={handleShare} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {shared ? <CheckCircle2 size={15} color="#C9A84C" /> : <Share2 size={15} />}
        </button>
      </div>

      {/* ── STORE HEADER LUXURY ───────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${gold}30`, padding: '14px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Logo */}
          <div style={{ width: '52px', height: '52px', flexShrink: 0, border: `1.5px solid ${gold}`, overflow: 'hidden' }}>
            {store?.logo_url ? (
              <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold, fontSize: '20px', fontWeight: '700' }}>{store?.name?.charAt(0)}</div>
            )}
          </div>
          {/* Nom + badge */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '17px', fontWeight: '700', color: dark, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1 }}>{store?.name}</div>
            <div style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', color: gold, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Star size={9} fill={gold} color={gold} /> BOUTIQUE OFFICIELLE
            </div>
          </div>
          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {store?.whatsapp_number && (
              <a href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`} target="_blank"
                style={{ padding: '8px 14px', border: `1.5px solid ${gold}`, color: dark, fontSize: '10px', fontFamily: 'Inter, sans-serif', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                CONTACTER
              </a>
            )}
            {!isPreview && (
              <button onClick={onOpenCart} style={{ padding: '8px 14px', background: dark, color: gold, border: 'none', fontSize: '10px', fontFamily: 'Inter, sans-serif', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', position: 'relative' }}>
                <ShoppingBag size={13} />
                {cartCount > 0 && <span style={{ background: gold, color: dark, fontSize: '8px', fontWeight: '900', padding: '1px 4px', borderRadius: '2px' }}>{cartCount}</span>}
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ maxWidth: '800px', margin: '12px auto 0', display: 'flex', gap: '0', borderTop: `1px solid ${gold}20`, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {pages.map(m => (
            <button key={m.key} onClick={() => setActivePage(m.key)}
              style={{ padding: '10px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${activePage === m.key ? gold : 'transparent'}`, color: activePage === m.key ? dark : '#888', fontFamily: 'Inter, sans-serif', fontWeight: '800', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.2s', flexShrink: 0 }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── HERO IMAGE ────────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', height: '240px', background: dark, overflow: 'hidden' }}>
        {store?.banner_url ? (
          <img src={store.banner_url} alt="collection" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 60%, #2C2C2C 100%)` }} />
        )}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ color: '#888', fontSize: '10px', fontFamily: 'Inter, sans-serif', letterSpacing: '0.3em', textTransform: 'uppercase' }}>MAISON</span>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '32px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', padding: '0 20px' }}>{store?.name}</h2>
          <div style={{ width: '40px', height: '1px', background: gold }} />
        </div>
        {/* Badges en bas */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(10,10,10,0.85)', padding: '8px 20px', display: 'flex', justifyContent: 'center', gap: '20px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { icon: <CheckCircle2 size={11} color="#22c55e" />, text: 'Vérifié VesTyle' },
            { icon: <Star size={11} fill={gold} color={gold} />, text: `${store?.positive_rating ?? 100}% Avis Positifs` },
            { icon: <Clock size={11} color="#888" />, text: `Rép. ${store?.response_time || '< 1h'}` },
          ].map((b, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontFamily: 'Inter, sans-serif', color: '#ccc', whiteSpace: 'nowrap' }}>{b.icon} {b.text}</span>
          ))}
        </div>
      </div>

      {/* ── CONTENU ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px 80px' }}>
        {children}
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer style={{ background: dark, borderTop: `1px solid ${gold}30`, padding: '24px 20px', textAlign: 'center' }}>
        <div style={{ color: gold, fontSize: '14px', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>{store?.name}</div>
        <div style={{ color: '#555', fontSize: '10px', fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em' }}>© {new Date().getFullYear()} — Propulsé par VesTyle</div>
      </footer>
    </main>
  );
}
