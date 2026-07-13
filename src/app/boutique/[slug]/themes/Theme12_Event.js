'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart, Music } from 'lucide-react';

export default function Theme12_Event({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const p = '#8B5CF6';
  const neon = '#EC4899';
  const dark = '#0A0516';
  const gold = '#F59E0B';
  const activeModules = modules.filter(m => m.is_active);

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'Line-Up' },
    { key: 'produits', label: tabs.produits || 'Tickets' },
    { key: 'promotions', label: tabs.promotions || 'VIP Access' },
    { key: 'profil', label: tabs.profil || 'Infos' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: dark, color: '#fff', fontFamily: "'Space Grotesk', sans-serif", overflowX: 'hidden' }}>
      
      {/* Glowing Neon Blobs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50%', height: '50%', background: `radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)`, filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: `radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)`, filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1 }} />

      {/* ── HEADER ── */}
      <div style={{ background: 'rgba(10, 5, 22, 0.75)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(236, 72, 153, 0.15)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: `linear-gradient(135deg, ${p}, ${neon})`, width: '12px', height: '12px', borderRadius: '50%', boxShadow: `0 0 10px ${neon}` }}></div>
          <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff' }}>
            {store?.name}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isPreview && (
            <button onClick={onOpenCart} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingCart size={18} />
              {cartCount > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: gold, color: dark, fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '50%' }}>{cartCount}</span>}
            </button>
          )}
          <button onClick={handleShare} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            {shared ? <CheckCircle2 size={18} color={gold} /> : <Share2 size={18} />}
          </button>
        </div>
      </div>

      {/* ── FLOATING DJ TURNTABLE STYLE NAVIGATION ── */}
      <div style={{ padding: '20px 16px 0 16px', position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '30px', padding: '6px', gap: '4px', maxWidth: '500px', width: '100%' }}>
          {pages.map(pg => (
            <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
              flex: 1,
              background: activePage === pg.key ? `linear-gradient(135deg, ${p}, ${neon})` : 'none',
              color: '#fff',
              border: 'none',
              borderRadius: '24px',
              padding: '10px 8px',
              fontWeight: '800',
              fontSize: '11px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: activePage === pg.key ? `0 0 15px rgba(236, 72, 153, 0.4)` : 'none',
              transition: 'all 0.2s'
            }}>
              {pg.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '30px 16px', position: 'relative', zIndex: 5, minHeight: '60vh' }}>
        {children}
      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', width: '54px', height: '54px', background: `linear-gradient(135deg, ${p}, ${neon})`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${p}`, zIndex: 9999 }}>
          <MessageCircle size={24} color="#fff" />
        </a>
      )}
    </main>
  );
}
