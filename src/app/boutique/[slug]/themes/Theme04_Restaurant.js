'use client';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart, MapPin, Star, Clock, Utensils, Phone } from 'lucide-react';

export default function Theme04_Restaurant({
  store, modules = [], pages = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const gold = '#D4AF37';
  const dark = '#120A00';
  const brown = '#3D1C00';

  return (
    <main style={{ minHeight: '100vh', background: dark, fontFamily: 'Lora, Georgia, serif', overflowX: 'hidden', color: '#f5f0e8' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Inter:wght@400;600;700;800;900&display=swap');`}</style>

      {/* ── HERO IMAGE PLEIN FORMAT ────────────────────────────────── */}
      <div style={{ position: 'relative', height: '280px', background: dark, overflow: 'hidden' }}>
        {store?.banner_url ? (
          <img src={store.banner_url} alt="restaurant" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${dark} 0%, ${brown} 60%, ${gold}20 100%)` }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 30% 70%, ${gold}15 0%, transparent 60%)` }} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, ${dark}80 0%, transparent 40%, ${dark} 100%)` }} />

        {/* Contenu hero */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {store?.logo_url && (
              <div style={{ width: '54px', height: '54px', borderRadius: '8px', border: `1.5px solid ${gold}60`, overflow: 'hidden', flexShrink: 0 }}>
                <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div>
              <div style={{ fontSize: '9px', fontFamily: 'Inter, sans-serif', fontWeight: '800', letterSpacing: '0.25em', color: gold, textTransform: 'uppercase', marginBottom: '3px' }}>— Restaurant & Gastronomie —</div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#fff', letterSpacing: '0.02em' }}>{store?.name}</h1>
            </div>
          </div>
        </div>

        {/* Actions top-right */}
        <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '8px' }}>
          <button onClick={handleShare} style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.12)', border: `1px solid rgba(255,255,255,0.2)`, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            {shared ? <CheckCircle2 size={16} color={gold} /> : <Share2 size={16} color="#fff" />}
          </button>
          {!isPreview && (
            <button onClick={onOpenCart} style={{ width: '36px', height: '36px', background: gold, border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <ShoppingCart size={16} color={dark} />
              {cartCount > 0 && <span style={{ position: 'absolute', top: '-3px', right: '-3px', background: '#ef4444', color: '#fff', fontSize: '8px', fontWeight: '900', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${dark}` }}>{cartCount}</span>}
            </button>
          )}
        </div>
      </div>

      {/* ── BARRE DE CONFIANCE ────────────────────────────────────── */}
      <div style={{ background: brown, padding: '10px 16px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { icon: <CheckCircle2 size={11} color="#22c55e" />, text: 'Vérifié VesTyle' },
          { icon: <Star size={11} fill={gold} color={gold} />, text: `${store?.positive_rating ?? 100}% Avis Positifs` },
          { icon: <Clock size={11} color="#aaa" />, text: `Rép. ${store?.response_time || '< 1h'}` },
        ].map((b, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontFamily: 'Inter, sans-serif', color: '#c8b99a', whiteSpace: 'nowrap', fontWeight: '600' }}>{b.icon} {b.text}</span>
        ))}
      </div>

      {/* ── BOUTONS D'ACTION ────────────────────────────────────────── */}
      <div style={{ background: dark, padding: '14px 16px', display: 'flex', gap: '10px', maxWidth: '600px', margin: '0 auto' }}>
        {store?.whatsapp_number && (
          <a href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`} target="_blank"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', background: `linear-gradient(135deg, ${gold}, #c49a20)`, color: dark, padding: '11px', borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontWeight: '900', fontSize: '12px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <MessageCircle size={15} /> Commander
          </a>
        )}
        {store?.whatsapp_number && (
          <a href={`tel:${store.whatsapp_number}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', background: 'rgba(255,255,255,0.06)', color: '#f5f0e8', padding: '11px 16px', borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontWeight: '700', fontSize: '12px', textDecoration: 'none', border: `1px solid rgba(255,255,255,0.1)` }}>
            <Phone size={15} /> Appeler
          </a>
        )}
        {store?.latitude && (
          <button onClick={handleDirections}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: '#f5f0e8', padding: '11px 14px', borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontWeight: '700', fontSize: '12px', border: `1px solid rgba(255,255,255,0.1)`, cursor: 'pointer' }}>
            <MapPin size={15} />
          </button>
        )}
      </div>

      {/* ── NAVIGATION ────────────────────────────────────────────── */}
      <div style={{ background: `${brown}cc`, borderTop: `1px solid ${gold}20`, borderBottom: `1px solid ${gold}20`, backdropFilter: 'blur(8px)', position: isPreview ? 'static' : 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', padding: '0 8px' }}>
          {pages.map(m => (
            <button key={m.id} onClick={() => setActivePage(m.id)}
              style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${activePage === m.id ? gold : 'transparent'}`, color: activePage === m.id ? gold : '#9a8872', fontFamily: 'Inter, sans-serif', fontWeight: '800', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s', flexShrink: 0 }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENU ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 14px 80px' }}>
        {children}
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer style={{ background: brown, borderTop: `1px solid ${gold}20`, padding: '24px 20px', textAlign: 'center' }}>
        <div style={{ color: gold, fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{store?.name}</div>
        <div style={{ color: '#9a8872', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>© {new Date().getFullYear()} — Art culinaire par VesTyle</div>
      </footer>
    </main>
  );
}
