'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart, ArrowDown } from 'lucide-react';

export default function Theme08_Editorial({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const p = '#111111';
  const accent = '#D4B26F';
  const bg = '#FAFAFA';

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'Editorial' },
    { key: 'produits', label: tabs.produits || 'Catalogue' },
    { key: 'promotions', label: tabs.promotions || 'Curations' },
    { key: 'profil', label: tabs.profil || 'Manifesto' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: bg, fontFamily: "'Cormorant Garamond', serif", color: p, overflowX: 'hidden' }}>

      {/* ── GIANT CINEMATIC HERO (80vh) ── */}
      <div style={{ position: 'relative', width: '100%', height: '80vh', overflow: 'hidden', background: p }}>
        {store?.banner_url ? (
          <img src={store.banner_url} alt="Bannière éditoriale" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #111 0%, #2a2a2a 100%)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />

        {/* Minimal Float Menu */}
        <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {store?.name}
          </span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {!isPreview && (
              <button onClick={onOpenCart} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.1em', display: 'flex', gap: '6px' }}>
                <ShoppingCart size={16} />
                <span>({cartCount})</span>
              </button>
            )}
            <button onClick={handleShare} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              {shared ? <CheckCircle2 size={16} color={accent} /> : <Share2 size={16} />}
            </button>
          </div>
        </div>

        {/* Center Title Layout */}
        <div style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '800px', textAlign: 'center', color: '#fff' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: accent, display: 'block', marginBottom: '16px' }}>
            THE EDITORIAL STORE
          </span>
          <h1 style={{ fontSize: '64px', fontWeight: '300', margin: '0 0 20px 0', fontStyle: 'italic', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {store?.name}
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#ccc', letterSpacing: '0.05em', maxWidth: '500px', margin: '0 auto 30px auto', opacity: 0.9 }}>
            {store?.description || 'A curated visual narrative of collections.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ animation: 'bounce 2s infinite', color: '#fff', opacity: 0.7 }}>
              <ArrowDown size={24} />
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>

      {/* ── MINIMALIST NAV BAR ── */}
      <div style={{ borderBottom: '1px solid #e5e5e5', background: '#fff', position: 'sticky', top: 0, zIndex: 90 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', padding: '20px 0' }}>
          {pages.map(pg => (
            <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
              background: 'none',
              border: 'none',
              color: activePage === pg.key ? p : '#999',
              fontWeight: activePage === pg.key ? '700' : '400',
              fontSize: '14px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderBottom: activePage === pg.key ? `1px solid ${p}` : '1px solid transparent',
              paddingBottom: '4px',
              transition: 'all 0.2s'
            }}>
              {pg.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── WIDE CONTENT AREA ── */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px', minHeight: '60vh' }}>
        {children}
      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 24px', background: p, color: '#fff', textDecoration: 'none', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 9999 }}>
          <MessageCircle size={16} />
          <span>Inquire</span>
        </a>
      )}
    </main>
  );
}
