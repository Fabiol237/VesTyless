'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart, Activity } from 'lucide-react';

export default function Theme10_Sport({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const p = '#E11D48';
  const dark = '#09090b';
  const activeModules = modules.filter(m => m.is_active);

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'HOME' },
    { key: 'produits', label: tabs.produits || 'SHOP_CATALOG' },
    { key: 'promotions', label: tabs.promotions || 'OFFERS' },
    { key: 'profil', label: tabs.profil || 'ABOUT_TEAM' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: dark, fontFamily: "'Montserrat', sans-serif", color: '#fff', overflowX: 'hidden' }}>
      
      {/* ── DIAGONAL SKEW BANNER ── */}
      <div style={{ position: 'relative', background: p, transform: 'skewY(-3deg)', marginTop: '-20px', paddingTop: '20px', zIndex: 10, borderBottom: '4px solid #fff', boxShadow: `0 10px 30px ${p}30` }}>
        <div style={{ transform: 'skewY(3deg)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: '#fff', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontWeight: '950', fontSize: '16px', letterSpacing: '0.1em' }}>{store?.name}</span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleShare} style={{ background: '#fff', border: 'none', color: dark, padding: '6px', cursor: 'pointer', fontWeight: '900', display: 'flex', alignItems: 'center' }}>
              {shared ? <CheckCircle2 size={16} color={p} /> : <Share2 size={16} />}
            </button>
            {!isPreview && (
              <button onClick={onOpenCart} style={{ background: '#000', border: 'none', color: '#fff', padding: '6px 12px', cursor: 'pointer', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                <ShoppingCart size={14} />
                <span>PANIER ({cartCount})</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ── DETAILS SECT ── */}
      <div style={{ padding: '40px 20px', textAlign: 'center', position: 'relative' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '950', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.02em', margin: '0 0 10px 0' }}>
          {store?.name}
        </h2>
        <p style={{ fontSize: '13px', color: '#a1a1aa', maxWidth: '500px', margin: '0 auto' }}>
          {store?.description || 'Prépare-toi à dépasser tes limites. Équipements pros.'}
        </p>
      </div>

      {/* ── SKEWED CONTRAST NAVIGATION ── */}
      <div style={{ display: 'flex', background: '#18181b', borderTop: '2px solid #27272a', borderBottom: '2px solid #27272a', overflowX: 'auto' }}>
        {pages.map(pg => (
          <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
            flex: 1,
            minWidth: '100px',
            padding: '16px 8px',
            background: activePage === pg.key ? p : 'none',
            border: 'none',
            color: '#fff',
            fontWeight: '900',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontStyle: 'italic',
            cursor: 'pointer',
            transform: 'skewX(-10deg)',
            transition: 'all 0.15s'
          }}>
            <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>{pg.label}</span>
          </button>
        ))}
      </div>

      {/* ── DYNAMIC BODY ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        {children}
      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', background: p, color: '#fff', padding: '14px 24px', fontWeight: '950', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 9999, boxShadow: `0 10px 20px ${p}50` }}>
          <MessageCircle size={18} />
          <span>CONTACT TEAM</span>
        </a>
      )}
    </main>
  );
}
