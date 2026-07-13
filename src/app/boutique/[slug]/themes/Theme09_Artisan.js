'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart } from 'lucide-react';

export default function Theme09_Artisan({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const p = '#6B4226';
  const accent = '#D4832A';
  const bg = '#F6EFEB';
  const activeModules = modules.filter(m => m.is_active);

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'Accueil' },
    { key: 'produits', label: tabs.produits || 'Créations' },
    { key: 'promotions', label: tabs.promotions || 'Le Coin doux' },
    { key: 'profil', label: tabs.profil || 'L\'Atelier' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: bg, fontFamily: "'Lora', serif", color: p, padding: '20px', overflowX: 'hidden' }}>
      
      {/* ── ORGANIC FLOATING CONTAINER ── */}
      <div style={{ maxWidth: '850px', margin: '0 auto', background: '#FFFDFB', borderRadius: '40px', boxShadow: '0 20px 50px rgba(107, 66, 38, 0.08)', overflow: 'hidden', border: '1px solid rgba(107, 66, 38, 0.05)' }}>
        
        {/* Soft Banner with large rounded borders */}
        <div style={{ position: 'relative', height: '220px', margin: '16px', borderRadius: '28px', overflow: 'hidden' }}>
          {store?.banner_url ? (
            <img src={store.banner_url} alt="Bannière Atelier" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #e3d5ca 0%, #d5bdaf 100%)' }} />
          )}
          <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
            <button onClick={handleShare} style={{ background: '#FFFDFB', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              {shared ? <CheckCircle2 size={16} color={accent} /> : <Share2 size={16} />}
            </button>
          </div>
        </div>

        {/* Centered Identity Circle */}
        <div style={{ textAlign: 'center', marginTop: '-60px', position: 'relative', zIndex: 5, padding: '0 20px' }}>
          <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#FFFDFB', border: `4px solid #FFFDFB`, boxShadow: '0 10px 25px rgba(107, 66, 38, 0.15)', overflow: 'hidden', margin: '0 auto' }}>
            {store?.logo_url ? (
              <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eddcd2', color: p, fontSize: '32px', fontWeight: 'bold' }}>
                {store?.name?.charAt(0)}
              </div>
            )}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '400', margin: '14px 0 6px 0', fontStyle: 'italic' }}>{store?.name}</h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#8c7a6b', margin: '0 0 16px 0' }}>
            {store?.description || 'Créations artisanales faites avec patience.'}
          </p>
        </div>

        {/* Soft Label Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', padding: '16px', background: 'rgba(107, 66, 38, 0.02)', borderTop: '1px solid rgba(107, 66, 38, 0.05)', borderBottom: '1px solid rgba(107, 66, 38, 0.05)' }}>
          {pages.map(pg => (
            <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
              background: activePage === pg.key ? '#FFFDFB' : 'none',
              color: activePage === pg.key ? accent : '#8c7a6b',
              border: activePage === pg.key ? '1px solid rgba(212, 131, 42, 0.2)' : '1px solid transparent',
              borderRadius: '20px',
              padding: '6px 18px',
              fontWeight: '600',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: activePage === pg.key ? '0 4px 10px rgba(107, 66, 38, 0.05)' : 'none',
              transition: 'all 0.2s'
            }}>
              {pg.label}
            </button>
          ))}
        </div>

        {/* Content Inside Container */}
        <div style={{ padding: '30px 24px', minHeight: '50vh' }}>
          {children}
        </div>
      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', width: '54px', height: '54px', background: accent, color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(212, 131, 42, 0.3)', zIndex: 9999 }}>
          <MessageCircle size={24} />
        </a>
      )}
    </main>
  );
}
