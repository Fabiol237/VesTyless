'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart } from 'lucide-react';

export default function Theme14_Cyber({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const p = '#FF007F';
  const cyan = '#00F0FF';
  const dark = '#080018';
  const activeModules = modules.filter(m => m.is_active);

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || '// CORE' },
    { key: 'produits', label: tabs.produits || '// CATALOG' },
    { key: 'promotions', label: tabs.promotions || '// GEAR' },
    { key: 'profil', label: tabs.profil || '// PROFILE' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: dark, backgroundImage: 'linear-gradient(rgba(255, 0, 127, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 127, 0.05) 1px, transparent 1px)', backgroundSize: '15px 15px', fontFamily: "'Courier New', Courier, monospace", color: '#FFF', overflowX: 'hidden' }}>
      
      {/* Laser header strip */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${p}, ${cyan}, ${p})` }} />

      {/* Cyber Grid Wrap */}
      <div style={{ maxWidth: '850px', margin: '30px auto', padding: '0 16px' }}>
        
        {/* Hologram Header */}
        <div style={{ border: `1px solid ${cyan}`, background: 'rgba(0, 240, 255, 0.03)', padding: '24px', borderRadius: '4px', position: 'relative', marginBottom: '20px', boxShadow: `0 0 15px ${cyan}20` }}>
          <div style={{ position: 'absolute', top: '-10px', left: '15px', background: dark, padding: '0 10px', color: cyan, fontSize: '11px', fontWeight: 'bold' }}>
            SYSTEM_ID // TERMINAL
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '60px', height: '60px', border: `1px solid ${p}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,0,127,0.1)' }}>
                {store?.logo_url ? (
                  <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '24px', color: p, fontWeight: 'bold' }}>{store?.name?.charAt(0)}</span>
                )}
              </div>
              <div>
                <h1 style={{ fontSize: '26px', color: '#FFF', textShadow: `0 0 8px ${cyan}`, margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {store?.name}
                </h1>
                <div style={{ fontSize: '11px', color: cyan, marginTop: '4px' }}>ACCESS_LEVEL: VISITOR</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleShare} style={{ background: 'none', border: `1px solid ${p}`, color: p, padding: '8px', cursor: 'pointer' }}>
                {shared ? <CheckCircle2 size={16} color={cyan} /> : <Share2 size={16} />}
              </button>
              {!isPreview && (
                <button onClick={onOpenCart} style={{ background: 'none', border: `1px solid ${cyan}`, color: cyan, padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart size={14} />
                  <span>CART [{cartCount}]</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Scanline Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '5px', marginBottom: '20px' }}>
          {pages.map(pg => (
            <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
              background: activePage === pg.key ? p : 'rgba(0,0,0,0.5)',
              color: activePage === pg.key ? '#FFF' : '#888',
              border: `1px solid ${activePage === pg.key ? p : '#222'}`,
              padding: '12px 8px',
              fontSize: '11px',
              fontWeight: 'bold',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textShadow: activePage === pg.key ? '0 0 5px #FFF' : 'none'
            }}>
              {pg.label}
            </button>
          ))}
        </div>

        {/* Cyber shell content */}
        <div style={{ border: `1px solid ${p}`, background: 'rgba(255, 0, 127, 0.02)', padding: '24px', minHeight: '50vh' }}>
          {children}
        </div>

      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 20px', border: `1px solid ${cyan}`, background: dark, color: cyan, textDecoration: 'none', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 9999, boxShadow: `0 0 10px ${cyan}` }}>
          <MessageCircle size={16} />
          <span>ESTABLISH_COMM //</span>
        </a>
      )}
    </main>
  );
}
