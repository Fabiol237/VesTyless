'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart } from 'lucide-react';

export default function Theme21_Paper({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'Vitrine' },
    { key: 'produits', label: tabs.produits || 'Produits' },
    { key: 'promotions', label: tabs.promotions || 'Offres' },
    { key: 'profil', label: tabs.profil || 'Infos' },
  ];

  return (
    <main style={{
      minHeight: '100vh',
      background: '#EFEFEF',
      backgroundImage: `
        radial-gradient(circle, #DDD 1px, transparent 1px),
        radial-gradient(circle, #DDD 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px',
      fontFamily: "'Inter', sans-serif",
      color: '#1a1a1a',
      padding: '20px',
    }}>

      {/* ── STACKED PAPER CARDS LAYOUT ── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>

        {/* Paper shadow layers (stacked cards effect) */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', right: '-8px', height: '100%', background: '#D8D8D8', borderRadius: '16px' }} />
        <div style={{ position: 'absolute', top: '4px', left: '4px', right: '-4px', height: '100%', background: '#E4E4E4', borderRadius: '16px' }} />

        {/* Main paper card */}
        <div style={{ position: 'relative', background: '#FEFEFE', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>

          {/* Punched holes decoration */}
          <div style={{ display: 'flex', gap: '0', alignItems: 'center', background: '#F0F0F0', borderBottom: '1px solid #DDD', padding: '0 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginRight: '16px', padding: '8px 0' }}>
              {[1,2,3].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D0D0D0', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }} />)}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: '#E0E0E0' }}>
                  {store?.logo_url
                    ? <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900', color: '#888' }}>{store?.name?.charAt(0)}</div>
                  }
                </div>
                <div>
                  <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#111', margin: 0 }}>{store?.name}</h1>
                  <p style={{ fontSize: '11px', color: '#888', margin: '2px 0 0 0' }}>{store?.description?.slice(0, 50) || 'Boutique VesTyle'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!isPreview && (
                  <button onClick={onOpenCart} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <ShoppingCart size={14} /> {cartCount}
                  </button>
                )}
                <button onClick={handleShare} style={{ background: '#E8E8E8', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
                  {shared ? <CheckCircle2 size={16} color="#22c55e" /> : <Share2 size={16} color="#555" />}
                </button>
              </div>
            </div>
          </div>

          {/* Ruled paper tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #E0E0E0', background: '#FAFAFA' }}>
            {pages.map((pg, i) => {
              const isActive = activePage === pg.key;
              const tagColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
              return (
                <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
                  flex: 1,
                  background: isActive ? '#FEFEFE' : 'none',
                  border: 'none',
                  borderTop: isActive ? `3px solid ${tagColors[i]}` : '3px solid transparent',
                  color: isActive ? '#1a1a1a' : '#999',
                  fontWeight: '700',
                  fontSize: '12px',
                  padding: '12px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 -2px 8px rgba(0,0,0,0.05)' : 'none'
                }}>
                  {pg.label}
                </button>
              );
            })}
          </div>

          {/* Lined paper body */}
          <div style={{
            padding: '24px 24px 24px 60px',
            minHeight: '55vh',
            backgroundImage: 'linear-gradient(#E8E8E8 1px, transparent 1px)',
            backgroundSize: '100% 32px',
            backgroundPosition: '0 31px',
            position: 'relative',
          }}>
            {/* Vertical margin line (left red margin) */}
            <div style={{ position: 'absolute', left: '44px', top: 0, bottom: 0, width: '1px', background: '#FFB3B3', opacity: 0.5 }} />
            {children}
          </div>

        </div>
      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#25D366', color: '#fff', width: '54px', height: '54px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(37,211,102,0.4)', zIndex: 9999 }}>
          <MessageCircle size={24} />
        </a>
      )}
    </main>
  );
}
