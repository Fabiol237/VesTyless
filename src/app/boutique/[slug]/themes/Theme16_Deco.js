'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart } from 'lucide-react';

export default function Theme16_Deco({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const p = '#4A554A'; // Sage green
  const sand = '#F4EFEA'; // Sand background
  const dark = '#2C302E'; // Soft charcoal

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'Salon' },
    { key: 'produits', label: tabs.produits || 'Catalogue' },
    { key: 'promotions', label: tabs.promotions || 'Sélections' },
    { key: 'profil', label: tabs.profil || 'Histoire' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: sand, fontFamily: "'Inter', sans-serif", color: dark, overflowX: 'hidden' }}>
      
      {/* Delicate line grid layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', minHeight: '100vh' }}>
        
        {/* Top Minimalist Header */}
        <div style={{ padding: '30px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '400', letterSpacing: '0.15em', textTransform: 'uppercase', color: dark, margin: 0 }}>
              {store?.name}
            </h1>
            <p style={{ fontSize: '11px', color: '#888', letterSpacing: '0.05em', margin: '4px 0 0 0' }}>
              {store?.description || 'Objets, déco et design d\'intérieur.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <button onClick={handleShare} style={{ background: 'none', border: 'none', color: dark, cursor: 'pointer' }}>
              {shared ? <CheckCircle2 size={16} color={p} /> : <Share2 size={16} />}
            </button>
            {!isPreview && (
              <button onClick={onOpenCart} style={{ background: dark, color: sand, border: 'none', padding: '8px 16px', fontSize: '12px', letterSpacing: '0.05em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingCart size={12} />
                <span>Panier ({cartCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Clean Side-Tab layout on desktop / Centered on Mobile */}
        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '16px 24px', display: 'flex', gap: '24px', overflowX: 'auto' }}>
          {pages.map(pg => (
            <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
              background: 'none',
              border: 'none',
              color: activePage === pg.key ? dark : 'rgba(0,0,0,0.3)',
              fontWeight: activePage === pg.key ? '700' : '400',
              fontSize: '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              paddingBottom: '6px',
              borderBottom: activePage === pg.key ? `2px solid ${p}` : '2px solid transparent',
              transition: 'all 0.2s'
            }}>
              {pg.label}
            </button>
          ))}
        </div>

        {/* Spacious display section */}
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '40px 24px', minHeight: '60vh' }}>
          {children}
        </div>

      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 24px', background: dark, color: sand, border: 'none', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 9999 }}>
          <MessageCircle size={14} />
          <span>Nous Contacter</span>
        </a>
      )}
    </main>
  );
}
