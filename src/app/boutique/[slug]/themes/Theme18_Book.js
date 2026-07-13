'use client';
import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart } from 'lucide-react';

export default function Theme18_Book({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const p = '#1F2937'; // Ink-black
  const paper = '#FAF7F0'; // Textured book paper
  const sepia = '#8B5A2B'; // Soft sepia

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'Chapitre I' },
    { key: 'produits', label: tabs.produits || 'Index' },
    { key: 'promotions', label: tabs.promotions || 'Notes' },
    { key: 'profil', label: tabs.profil || 'Auteur' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: paper, fontFamily: "'Cormorant Garamond', 'Georgia', serif", color: p, padding: '30px 16px', overflowX: 'hidden' }}>
      
      {/* Book-frame Wrapper */}
      <div style={{ maxWidth: '750px', margin: '0 auto', border: '1px solid rgba(0,0,0,0.15)', padding: '40px 30px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'relative', background: '#FFF' }}>
        
        {/* Bookmark styling */}
        <div style={{ position: 'absolute', top: 0, right: '40px', width: '20px', height: '50px', background: sepia }} />

        {/* Minimalist Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '300', fontStyle: 'italic', color: p, margin: 0 }}>
            {store?.name}
          </h1>
          <div style={{ width: '60px', height: '1px', background: sepia, margin: '12px auto' }}></div>
          <p style={{ fontSize: '13px', color: '#777', fontStyle: 'italic', margin: 0 }}>
            {store?.description || 'Livres, reliures, manuscrits & notes.'}
          </p>
        </div>

        {/* Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button onClick={handleShare} style={{ background: 'none', border: 'none', color: sepia, cursor: 'pointer', fontSize: '13px' }}>
              {shared ? 'Lien copié' : 'Partager'}
            </button>
          </div>
          {!isPreview && (
            <button onClick={onOpenCart} style={{ background: 'none', border: `1px solid ${p}`, color: p, padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>
              Panier ({cartCount})
            </button>
          )}
        </div>

        {/* Book Index Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '30px' }}>
          {pages.map(pg => (
            <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
              background: 'none',
              border: 'none',
              color: activePage === pg.key ? sepia : '#888',
              fontWeight: activePage === pg.key ? '700' : '400',
              fontStyle: 'italic',
              fontSize: '15px',
              cursor: 'pointer',
              borderBottom: activePage === pg.key ? `1.5px solid ${sepia}` : '1.5px solid transparent',
              paddingBottom: '2px'
            }}>
              {pg.label}
            </button>
          ))}
        </div>

        {/* Main Book Body */}
        <div style={{ minHeight: '50vh', fontSize: '15px', lineHeight: '1.7' }}>
          {children}
        </div>

      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 24px', background: p, color: '#FFF', textDecoration: 'none', fontSize: '12px', fontStyle: 'italic', zIndex: 9999 }}>
          <MessageCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
          <span>Écrire</span>
        </a>
      )}
    </main>
  );
}
