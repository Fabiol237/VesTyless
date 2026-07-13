'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart } from 'lucide-react';

export default function Theme13_Kids({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const p = '#FF6B6B';
  const yellow = '#FFD166';
  const blue = '#118AB2';
  const green = '#06D6A0';
  const bg = '#FFF9E6';

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'Jouer' },
    { key: 'produits', label: tabs.produits || 'Jouets' },
    { key: 'promotions', label: tabs.promotions || 'Cadeaux' },
    { key: 'profil', label: tabs.profil || 'Infos' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: bg, backgroundImage: 'radial-gradient(#ffd166 1px, transparent 1px)', backgroundSize: '20px 20px', fontFamily: "'Comic Sans MS', 'Inter', sans-serif", color: '#2B2D42', padding: '16px', overflowX: 'hidden' }}>
      
      {/* Cloud-like Floating Container */}
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#FFF', borderRadius: '36px', border: '6px solid #FFD166', padding: '24px', boxShadow: '0 12px 0px rgba(255, 209, 102, 0.4)' }}>
        
        {/* Soft playful Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '24px', background: yellow, transform: 'rotate(-5deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #2B2D42' }}>
              {store?.logo_url ? (
                <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
              ) : (
                <span style={{ fontSize: '28px', fontWeight: '900', color: '#FFF' }}>{store?.name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: p, margin: 0, textShadow: '2px 2px 0px #FFE3E3' }}>{store?.name}</h1>
              <span style={{ background: green, color: '#FFF', fontSize: '10px', fontWeight: '800', padding: '2px 10px', borderRadius: '20px', display: 'inline-block', marginTop: '4px', border: '2px solid #2B2D42' }}>KIDS_FRIENDLY 🧸</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleShare} style={{ background: '#FFF', border: '3px solid #2B2D42', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '3px 3px 0px #2B2D42' }}>
              {shared ? <CheckCircle2 size={16} color={green} /> : <Share2 size={16} />}
            </button>
            {!isPreview && (
              <button onClick={onOpenCart} style={{ background: blue, color: '#FFF', border: '3px solid #2B2D42', borderRadius: '16px', padding: '8px 16px', fontWeight: '900', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '3px 3px 0px #2B2D42' }}>
                <ShoppingCart size={14} />
                <span>Panier ({cartCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Soft rounded Bouncy Navigation */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px' }}>
          {pages.map((pg, idx) => {
            const colors = [p, blue, green, yellow];
            const activeColor = colors[idx % colors.length];
            return (
              <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
                background: activePage === pg.key ? activeColor : '#FFF',
                color: activePage === pg.key ? '#FFF' : '#2B2D42',
                border: '3px solid #2B2D42',
                borderRadius: '20px',
                padding: '8px 20px',
                fontWeight: '900',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activePage === pg.key ? 'none' : '3px 3px 0px #2B2D42',
                transform: activePage === pg.key ? 'translate(3px, 3px)' : 'none',
                transition: 'all 0.15s'
              }}>
                {pg.label}
              </button>
            );
          })}
        </div>

        <div style={{ minHeight: '45vh' }}>
          {children}
        </div>

      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', width: '54px', height: '54px', background: p, color: '#FFF', border: '3px solid #2B2D42', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 4px 0px #2B2D42', zIndex: 9999 }}>
          <MessageCircle size={24} />
        </a>
      )}
    </main>
  );
}
