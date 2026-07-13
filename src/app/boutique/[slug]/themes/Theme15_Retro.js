'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart } from 'lucide-react';

export default function Theme15_Retro({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const p = '#C85A32'; // Terracotta
  const dark = '#483526'; // Dark wood
  const cream = '#F8F1E5'; // Warm cream
  const yellow = '#ECA72C'; // Vintage yellow

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'Le Salon' },
    { key: 'produits', label: tabs.produits || 'Bazar' },
    { key: 'promotions', label: tabs.promotions || 'Pépites' },
    { key: 'profil', label: tabs.profil || 'L\'Esprit' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: cream, fontFamily: "'Georgia', serif", color: dark, overflowX: 'hidden' }}>
      
      {/* 70s Stripe Header */}
      <div style={{ display: 'flex', height: '12px' }}>
        <div style={{ flex: 1, background: '#D94E34' }}></div>
        <div style={{ flex: 1, background: '#ECA72C' }}></div>
        <div style={{ flex: 1, background: '#5F8575' }}></div>
      </div>

      <div style={{ maxWidth: '800px', margin: '30px auto', padding: '0 16px' }}>
        
        {/* Rounded Vintage Header Card */}
        <div style={{ background: '#FFF', borderRadius: '30px 30px 10px 10px', border: `3px solid ${dark}`, padding: '30px 24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: yellow, border: `3px solid ${dark}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `4px 4px 0px ${dark}` }}>
              {store?.logo_url ? (
                <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
              ) : (
                <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFF' }}>{store?.name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: dark, margin: 0, fontStyle: 'italic' }}>{store?.name}</h1>
              <p style={{ fontSize: '13px', color: '#8b7058', margin: '4px 0 0 0' }}>{store?.description || 'Authentique & vintage.'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleShare} style={{ background: '#FFF', border: `2px solid ${dark}`, borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {shared ? <CheckCircle2 size={16} color={p} /> : <Share2 size={16} />}
            </button>
            {!isPreview && (
              <button onClick={onOpenCart} style={{ background: yellow, color: dark, border: `3px solid ${dark}`, borderRadius: '20px', padding: '8px 20px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `3px 3px 0px ${dark}` }}>
                <ShoppingCart size={14} />
                <span>Panier ({cartCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Vintage Tab style (Folder tabs) */}
        <div style={{ display: 'flex', gap: '4px', background: dark, padding: '4px', borderRadius: '0 0 20px 20px', overflowX: 'auto' }}>
          {pages.map(pg => (
            <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
              flex: 1,
              background: activePage === pg.key ? cream : 'transparent',
              color: activePage === pg.key ? dark : '#FFF',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 10px',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}>
              {pg.label}
            </button>
          ))}
        </div>

        {/* Outer content frame */}
        <div style={{ background: '#FFF', border: `3px solid ${dark}`, borderTop: 'none', borderRadius: '0 0 30px 30px', padding: '30px 24px', minHeight: '50vh', marginTop: '20px' }}>
          {children}
        </div>

      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', width: '54px', height: '54px', background: p, color: '#FFF', border: `3px solid ${dark}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `4px 4px 0px ${dark}`, zIndex: 9999 }}>
          <MessageCircle size={24} />
        </a>
      )}
    </main>
  );
}
