'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart, Home, Grid, Tag, User } from 'lucide-react';

export default function Theme07_Tech({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const p = '#2563EB';
  const neon = '#60A5FA';
  const dark = '#050B1A';
  const glass = 'rgba(10, 22, 45, 0.7)';

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'Home', icon: Home },
    { key: 'produits', label: tabs.produits || 'Shop', icon: Grid },
    { key: 'promotions', label: tabs.promotions || 'Deals', icon: Tag },
    { key: 'profil', label: tabs.profil || 'Specs', icon: User },
  ];

  return (
    <main style={{ minHeight: '100vh', background: dark, backgroundImage: 'radial-gradient(rgba(37,99,235,0.15) 1px, transparent 1px)', backgroundSize: '24px 24px', fontFamily: "'Inter', sans-serif", color: '#fff', paddingBottom: '80px', overflowX: 'hidden' }}>
      
      {/* ── TECH CYBER HEADER ── */}
      <div style={{ background: glass, backdropFilter: 'blur(20px)', borderBottom: `1px solid rgba(37,99,235,0.2)`, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', border: `1px solid ${p}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a162d', boxShadow: `0 0 10px ${p}50` }}>
            {store?.logo_url ? (
              <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '7px' }} />
            ) : (
              <span style={{ fontWeight: '900', color: neon }}>{store?.name?.charAt(0)}</span>
            )}
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '16px', letterSpacing: '-0.02em' }}>{store?.name}</div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
              <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: '700' }}>SYS_ONLINE</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleShare} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#fff', cursor: 'pointer' }}>
            {shared ? <CheckCircle2 size={16} color={neon} /> : <Share2 size={16} />}
          </button>
          {!isPreview && (
            <button onClick={onOpenCart} style={{ background: `${p}30`, border: `1px solid ${p}`, borderRadius: '8px', padding: '8px 12px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '12px' }}>
              <ShoppingCart size={14} />
              <span>{cartCount}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT (Cyber dashboard wrapper) ── */}
      <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 16px' }}>
        <div style={{ background: 'rgba(10, 22, 45, 0.5)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(10px)', minHeight: '65vh' }}>
          {children}
        </div>
      </div>

      {/* ── SYSTEM APP BAR (BOTTOM NAVIGATION) ── */}
      <div style={{ position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '400px', background: 'rgba(5, 11, 26, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '24px', padding: '8px 12px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(37,99,235,0.15)', zIndex: 9999 }}>
        {pages.map(pg => {
          const Icon = pg.icon;
          const isActive = activePage === pg.key;
          return (
            <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{ background: isActive ? `${p}20` : 'none', border: isActive ? `1px solid ${p}` : 'none', borderRadius: '16px', color: isActive ? neon : '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <Icon size={18} />
              <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.05em' }}>{pg.label}</span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
