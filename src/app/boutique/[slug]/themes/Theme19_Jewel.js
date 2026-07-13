'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart } from 'lucide-react';

export default function Theme19_Jewel({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const p = '#111111'; // Pure dark luxury
  const plat = '#E2E8F0'; // Platinum shine
  const accent = '#6366F1'; // Diamond purple glow

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'Collection' },
    { key: 'produits', label: tabs.produits || 'Écrin' },
    { key: 'promotions', label: tabs.promotions || 'Sélections' },
    { key: 'profil', label: tabs.profil || 'Maison' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', backgroundImage: 'radial-gradient(#E2E8F0 1.5px, transparent 1.5px)', backgroundSize: '30px 30px', fontFamily: "'Cormorant Garamond', serif", color: p, overflowX: 'hidden' }}>
      
      {/* Luxury Diamond Header */}
      <div style={{ maxWidth: '900px', margin: '30px auto', padding: '0 16px' }}>
        
        {/* Platinum Glassmorphic Header */}
        <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '24px', padding: '30px 24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(99, 102, 241, 0.04)', marginBottom: '20px', position: 'relative' }}>
          
          {/* Subtle top decoration */}
          <div style={{ fontSize: '12px', letterSpacing: '0.4em', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '10px' }}>
            HAUTE JOAILLERIE
          </div>

          <h1 style={{ fontSize: '36px', fontWeight: '300', letterSpacing: '0.05em', color: p, margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            {store?.name}
          </h1>

          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#64748B', letterSpacing: '0.05em', maxWidth: '400px', margin: '0 auto 20px auto' }}>
            {store?.description || 'Créations précieuses d\'exception.'}
          </p>

          {/* Action buttons embedded gracefully */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '20px' }}>
            <button onClick={handleShare} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '12px', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {shared ? <CheckCircle2 size={12} color={accent} /> : <Share2 size={12} />}
              PARTAGER
            </button>
            
            {!isPreview && (
              <button onClick={onOpenCart} style={{ background: p, color: '#FFF', border: 'none', borderRadius: '16px', padding: '6px 16px', fontSize: '11px', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingCart size={12} />
                PANIER ({cartCount})
              </button>
            )}
          </div>
        </div>

        {/* Minimal luxury Tab Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', padding: '10px 0', marginBottom: '20px' }}>
          {pages.map(pg => (
            <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
              background: 'none',
              border: 'none',
              color: activePage === pg.key ? p : '#94A3B8',
              fontWeight: activePage === pg.key ? '700' : '400',
              fontSize: '13px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderBottom: activePage === pg.key ? `1.5px solid ${p}` : '1.5px solid transparent',
              paddingBottom: '4px',
              transition: 'all 0.2s'
            }}>
              {pg.label}
            </button>
          ))}
        </div>

        {/* Pure display frame */}
        <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '24px', padding: '30px 24px', minHeight: '50vh' }}>
          {children}
        </div>

      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', width: '54px', height: '54px', background: p, color: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 9999 }}>
          <MessageCircle size={24} />
        </a>
      )}
    </main>
  );
}
