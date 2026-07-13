'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart, MapPin, Star, Clock, Shield, ChevronRight, Package, Zap } from 'lucide-react';

export default function Theme00_Classic({
  store, modules = [], pages = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const p = '#059669';
  const accent = '#ff5000';

  return (
    <main style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* ── BARRE SUPÉRIEURE VesTyle ─────────────────────────────── */}
      <div style={{ background: '#0f172a', padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em' }}>VesTyle · Marketplace Africaine</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isPreview && (
            <button onClick={onOpenCart} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '11px', fontWeight: '700', position: 'relative' }}>
              <ShoppingCart size={14} />
              <span>Panier</span>
              {cartCount > 0 && <span style={{ background: accent, color: '#fff', fontSize: '9px', fontWeight: '900', padding: '1px 4px', borderRadius: '999px', marginLeft: '2px' }}>{cartCount}</span>}
            </button>
          )}
          <button onClick={handleShare} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
            {shared ? <CheckCircle2 size={14} color="#22c55e" /> : <Share2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── STORE HERO BANNER ─────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', height: '200px', background: '#0f172a', overflow: 'hidden' }}>
        {store?.banner_url ? (
          <img src={store.banner_url} alt="bannière" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, #0f172a 0%, #1e293b 60%, ${p}30 100%)` }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.3) 100%)' }} />
      </div>

      {/* ── STORE IDENTITY CARD ────────────────────────────────────── */}
      <div style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', paddingBottom: '0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>

          {/* Logo + infos */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', marginTop: '-40px', paddingBottom: '12px' }}>
            <div style={{ flexShrink: 0, width: '80px', height: '80px', borderRadius: '16px', background: '#fff', border: '3px solid #fff', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', overflow: 'hidden', position: 'relative' }}>
              {store?.logo_url ? (
                <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${p}, ${accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '900', color: '#fff' }}>{store?.name?.charAt(0)}</div>
              )}
              <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: '#22c55e', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                <Shield size={8} color="#fff" />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em' }}>{store?.name}</h1>
                <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '9px', fontWeight: '900', padding: '2px 7px', borderRadius: '4px', letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Star size={8} fill="#92400e" /> Boutique Officielle
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#22c55e' }}><CheckCircle2 size={12} /> Vérifié VesTyle</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}><span style={{ color: accent, fontWeight: '900' }}>{store?.positive_rating ?? 100}%</span> Avis Positifs</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}><Clock size={11} /> Rép. {store?.response_time || '< 1h'}</span>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div style={{ display: 'flex', gap: '8px', paddingBottom: '14px', flexWrap: 'wrap' }}>
            {store?.whatsapp_number && (
              <a href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`} target="_blank"
                style={{ flex: 1, minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: `linear-gradient(135deg, ${accent}, #ff3300)`, color: '#fff', padding: '10px 16px', borderRadius: '12px', fontWeight: '900', fontSize: '12px', textDecoration: 'none', letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: `0 4px 12px ${accent}40` }}>
                <MessageCircle size={15} /> CONTACTER
              </a>
            )}
            {store?.latitude && (
              <button onClick={handleDirections}
                style={{ flex: 1, minWidth: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#fff', color: '#0f172a', padding: '10px 16px', borderRadius: '12px', fontWeight: '900', fontSize: '12px', border: '2px solid #e2e8f0', cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <MapPin size={15} /> VISITER
              </button>
            )}
            <button onClick={handleShare}
              style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '12px', border: '2px solid #e2e8f0', cursor: 'pointer', flexShrink: 0 }}>
              {shared ? <CheckCircle2 size={17} color="#22c55e" /> : <Share2 size={17} color="#64748b" />}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto', scrollbarWidth: 'none', borderTop: '1px solid #f1f5f9' }}>
            {pages.map(m => (
              <button key={m.key} onClick={() => setActivePage(m.key)}
                style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: `3px solid ${activePage === m.key ? p : 'transparent'}`, color: activePage === m.key ? p : '#64748b', fontWeight: '800', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.04em', textTransform: 'uppercase', transition: 'all 0.2s', flexShrink: 0 }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENU DE LA PAGE ────────────────────────────────────── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 12px 80px' }}>
        {children}
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer style={{ background: '#0f172a', padding: '24px 16px', textAlign: 'center' }}>
        <div style={{ color: '#475569', fontSize: '11px' }}>© {new Date().getFullYear()} {store?.name} · Propulsé par <span style={{ color: p, fontWeight: '700' }}>VesTyle</span></div>
      </footer>
    </main>
  );
}
