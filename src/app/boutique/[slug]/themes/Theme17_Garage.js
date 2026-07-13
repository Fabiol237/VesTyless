'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart, Shield } from 'lucide-react';

export default function Theme17_Garage({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const p = '#FBBF24'; // Hazard Yellow
  const dark = '#111827'; // Dark Carbon
  const gray = '#1F2937';
  const activeModules = modules.filter(m => m.is_active);

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'ATELIER' },
    { key: 'produits', label: tabs.produits || 'PIÈCES' },
    { key: 'promotions', label: tabs.promotions || 'OFFRES' },
    { key: 'profil', label: tabs.profil || 'SERVICE' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#0B0F19', fontFamily: "'Oswald', 'Inter', sans-serif", color: '#E5E7EB', overflowX: 'hidden' }}>
      
      {/* Hazard Warning Pattern Strip */}
      <div style={{ height: '8px', background: `repeating-linear-gradient(-45deg, #000 0px, #000 10px, ${p} 10px, ${p} 20px)` }} />

      <div style={{ maxWidth: '850px', margin: '30px auto', padding: '0 16px' }}>
        
        {/* Carbon Fibre Header Card */}
        <div style={{ background: gray, border: `2px solid ${p}`, padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '0px', background: '#000', border: `2px solid ${p}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {store?.logo_url ? (
                <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '26px', fontWeight: '950', color: p }}>{store?.name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#FFF', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {store?.name}
              </h1>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                <Shield size={12} style={{ color: p }} />
                <span style={{ fontSize: '10px', color: p, fontWeight: '800', letterSpacing: '0.1em' }}>GARAGE_APPROVED</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleShare} style={{ background: '#000', border: `1px solid ${p}`, color: p, padding: '8px', cursor: 'pointer' }}>
              {shared ? <CheckCircle2 size={16} color="#FFF" /> : <Share2 size={16} />}
            </button>
            {!isPreview && (
              <button onClick={onOpenCart} style={{ background: p, color: '#000', border: 'none', padding: '8px 16px', fontWeight: '950', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={14} />
                <span>PANIER ({cartCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Angular Hazard Tabs */}
        <div style={{ display: 'flex', gap: '2px', background: '#000', padding: '2px', marginTop: '10px' }}>
          {pages.map(pg => (
            <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
              flex: 1,
              background: activePage === pg.key ? p : gray,
              color: activePage === pg.key ? '#000' : '#FFF',
              border: 'none',
              padding: '12px 6px',
              fontWeight: '900',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}>
              {pg.label}
            </button>
          ))}
        </div>

        {/* Heavy metal content frame */}
        <div style={{ background: gray, border: '1px solid rgba(255,255,255,0.05)', padding: '24px', minHeight: '50vh', marginTop: '15px' }}>
          {children}
        </div>

      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 24px', background: p, color: '#000', fontWeight: '950', fontSize: '12px', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 9999 }}>
          <MessageCircle size={16} />
          <span>CONTACTEZ L'ATELIER</span>
        </a>
      )}
    </main>
  );
}
