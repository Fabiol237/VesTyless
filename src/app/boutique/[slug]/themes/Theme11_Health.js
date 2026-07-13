'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart, ShieldAlert } from 'lucide-react';

export default function Theme11_Health({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const p = '#0284C7';
  const green = '#059669';
  const bg = '#FAFAFA';

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'Santé' },
    { key: 'produits', label: tabs.produits || 'Catalogue' },
    { key: 'promotions', label: tabs.promotions || 'Conseils' },
    { key: 'profil', label: tabs.profil || 'Agréments' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: bg, fontFamily: "'Inter', sans-serif", color: '#1F2937', overflowX: 'hidden' }}>

      {/* ── CLINIC CARD LAYOUT ── */}
      <div style={{ maxWidth: '850px', margin: '30px auto', padding: '0 16px' }}>
        
        {/* White Grid Header */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#F0F9FF', border: `1.5px solid ${p}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {store?.logo_url ? (
                <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
              ) : (
                <span style={{ fontWeight: 'bold', fontSize: '24px', color: p }}>{store?.name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>{store?.name}</h1>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <span style={{ background: '#ECFDF5', color: green, fontSize: '9px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${green}20` }}>🛡️ LAB_APPROVED</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleShare} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
              {shared ? <CheckCircle2 size={16} color={green} /> : <Share2 size={16} />}
            </button>
            {!isPreview && (
              <button onClick={onOpenCart} style={{ background: p, color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <ShoppingCart size={14} />
                <span>Panier ({cartCount})</span>
              </button>
            )}
          </div>

        </div>

        {/* Flat Tabs */}
        <div style={{ display: 'flex', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '6px', overflowX: 'auto', marginBottom: '24px' }}>
          {pages.map(pg => (
            <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
              flex: 1,
              minWidth: '80px',
              padding: '10px 8px',
              background: activePage === pg.key ? '#F0F9FF' : 'none',
              border: 'none',
              borderRadius: '8px',
              color: activePage === pg.key ? p : '#6B7280',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}>
              {pg.label}
            </button>
          ))}
        </div>

        {/* White Base Content */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', minHeight: '50vh' }}>
          {children}
        </div>

      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', background: green, color: '#fff', borderRadius: '30px', padding: '12px 24px', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)', zIndex: 9999 }}>
          <MessageCircle size={18} />
          <span>Conseil Santé</span>
        </a>
      )}
    </main>
  );
}
