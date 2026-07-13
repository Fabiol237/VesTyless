'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart } from 'lucide-react';

export default function Theme06_Street({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const p = '#00FF87';
  const dark = '#000000';
  const activeModules = modules.filter(m => m.is_active);

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'HOME' },
    { key: 'produits', label: tabs.produits || 'DROP' },
    { key: 'promotions', label: tabs.promotions || 'DEALS' },
    { key: 'profil', label: tabs.profil || 'ABOUT' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: dark, fontFamily: "'Space Grotesk', sans-serif", color: '#fff', overflowX: 'hidden' }}>
      
      {/* ── TICKER BANNER (MARQUEE) ── */}
      <div style={{ background: p, color: dark, overflow: 'hidden', whiteSpace: 'nowrap', padding: '10px 0', borderBottom: '3px solid #fff' }}>
        <div style={{ display: 'inline-block', fontSize: '12px', fontWeight: '950', letterSpacing: '0.2em', animation: 'marquee 15s linear infinite' }}>
          🔥 STREET CULTURE DROP • IN STOCK NOW • WORLDWIDE SHIPPING • GET IT FAST • 🔥 STREET CULTURE DROP • IN STOCK NOW • WORLDWIDE SHIPPING • GET IT FAST •
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
        `}</style>
      </div>

      {/* ── BRUTALIST HERO SECT ── */}
      <div style={{ borderBottom: '3px solid #fff', display: 'grid', gridTemplateColumns: '1fr', mdGridTemplateColumns: '2fr 1fr' }}>
        <div style={{ padding: '40px 24px', borderRight: 'none', borderBottom: '3px solid #fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ border: '3px solid #fff', padding: '6px 14px', background: p, color: dark, display: 'inline-block', alignSelf: 'flex-start', fontWeight: '950', fontSize: '12px', letterSpacing: '0.1em', marginBottom: '20px', boxShadow: '4px 4px 0px #fff' }}>
            VERIFIED BRAND
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '950', lineHeight: '0.9', letterSpacing: '-0.04em', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
            {store?.name}
          </h1>
          <p style={{ color: '#aaa', fontSize: '14px', margin: '0 0 20px 0', maxWidth: '400px' }}>
            {store?.description || 'Exclusive street drop. Limited units only.'}
          </p>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleShare} style={{ border: '3px solid #fff', background: 'none', color: '#fff', padding: '10px 20px', fontWeight: '900', cursor: 'pointer', boxShadow: '4px 4px 0px #fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {shared ? <CheckCircle2 size={16} color={p} /> : <Share2 size={16} />}
              SHARE
            </button>
            {!isPreview && (
              <button onClick={onOpenCart} style={{ border: '3px solid #fff', background: p, color: dark, padding: '10px 20px', fontWeight: '950', cursor: 'pointer', boxShadow: '4px 4px 0px #fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={16} />
                CART ({cartCount})
              </button>
            )}
          </div>
        </div>

        {/* LOGO GRID */}
        <div style={{ background: '#111', minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', borderBottom: '3px solid #fff' }}>
          <div style={{ width: '120px', height: '120px', border: '3px solid #fff', background: dark, overflow: 'hidden', transform: 'rotate(-3deg)', boxShadow: '8px 8px 0px ' + p }}>
            {store?.logo_url ? (
              <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: '950', color: p }}>
                {store?.name?.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ASYMMETRICAL TABS ── */}
      <div style={{ display: 'flex', background: '#111', borderBottom: '3px solid #fff', overflowX: 'auto', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', margin: '0 auto' }}>
          {pages.map(pg => (
            <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
              background: activePage === pg.key ? p : 'none',
              color: activePage === pg.key ? dark : '#fff',
              border: '2px solid #fff',
              padding: '8px 20px',
              fontWeight: '950',
              fontSize: '12px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              boxShadow: activePage === pg.key ? '3px 3px 0px #fff' : 'none',
              transform: activePage === pg.key ? 'translate(-2px, -2px)' : 'none',
              transition: 'all 0.15s'
            }}>
              {pg.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        {children}
      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '16px', background: p, color: dark, border: '3px solid #fff', fontWeight: '950', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '6px 6px 0px #fff', zIndex: 9999 }}>
          <MessageCircle size={20} />
          <span>BUY ON WHATSAPP</span>
        </a>
      )}
    </main>
  );
}
