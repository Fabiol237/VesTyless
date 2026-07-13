'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart } from 'lucide-react';

export default function Theme20_Afro({
  store, modules = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 4000); return () => clearInterval(t); }, []);

  const palettes = [
    { bg: '#3D1A0E', accent: '#F4A429', text: '#FFE4B5' }, // Kente Chaud
    { bg: '#1B3A2D', accent: '#E8C547', text: '#F0F0D0' }, // Bogolan Forêt
    { bg: '#4A1942', accent: '#FF6B35', text: '#FFD4C2' }, // Wax Violet
  ];
  const pal = palettes[tick % palettes.length];

  const tabs = store?.shop_tabs || {};
  const pages = [
    { key: 'accueil', label: tabs.accueil || 'Accueil' },
    { key: 'produits', label: tabs.produits || 'Boutique' },
    { key: 'promotions', label: tabs.promotions || 'Promos' },
    { key: 'profil', label: tabs.profil || 'À propos' },
  ];

  return (
    <main style={{ minHeight: '100vh', fontFamily: "'Outfit', sans-serif", background: '#FBF5EC', color: '#1a0a00', overflowX: 'hidden' }}>

      {/* ── KENTE PATTERN HEADER ── */}
      <div style={{
        background: pal.bg,
        transition: 'background 1.5s ease',
        backgroundImage: `
          repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 20px),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 20px)
        `,
        padding: '0 0 0 0',
      }}>
        {/* Accent bar top */}
        <div style={{ height: '5px', background: `linear-gradient(90deg, ${pal.accent}, #FF4500, ${pal.accent})` }} />

        <div style={{ padding: '20px 20px 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${pal.accent}`, flexShrink: 0 }}>
              {store?.logo_url
                ? <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: pal.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '900', color: pal.bg }}>{store?.name?.charAt(0)}</div>
              }
            </div>
            <div>
              <h1 style={{ color: pal.text, fontWeight: '900', fontSize: '20px', margin: 0, transition: 'color 1.5s' }}>{store?.name}</h1>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <span style={{ background: pal.accent, color: pal.bg, fontSize: '8px', fontWeight: '900', padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.1em', transition: 'background 1.5s' }}>
                  🌍 MARCHÉ AFRICAIN
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {!isPreview && (
              <button onClick={onOpenCart} style={{ background: pal.accent, color: pal.bg, border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'background 1.5s' }}>
                <ShoppingCart size={16} />
                {cartCount > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#FF4500', color: '#fff', fontSize: '9px', fontWeight: '900', padding: '2px 5px', borderRadius: '50%' }}>{cartCount}</span>}
              </button>
            )}
            <button onClick={handleShare} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
              {shared ? <CheckCircle2 size={16} color={pal.accent} /> : <Share2 size={16} />}
            </button>
          </div>
        </div>

        {/* Kente Strip (geometric pattern) */}
        <div style={{ height: '28px', marginTop: '16px', display: 'flex', overflow: 'hidden' }}>
          {['#F4A429','#E84855','#3D1A0E','#2D6A4F','#F4A429','#E84855','#3D1A0E','#2D6A4F','#F4A429','#E84855','#3D1A0E','#2D6A4F','#F4A429','#E84855','#3D1A0E','#2D6A4F','#F4A429','#E84855','#3D1A0E','#2D6A4F'].map((c, i) => (
            <div key={i} style={{ flex: 1, background: c, minWidth: '20px' }} />
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: `3px solid ${pal.accent}`, overflowX: 'auto', transition: 'border-color 1.5s' }}>
        {pages.map(pg => (
          <button key={pg.key} onClick={() => setActivePage?.(pg.key)} style={{
            flex: 1,
            minWidth: '80px',
            padding: '14px 8px',
            background: activePage === pg.key ? pal.bg : 'none',
            border: 'none',
            color: activePage === pg.key ? pal.text : '#4a3728',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            letterSpacing: '0.05em'
          }}>
            {pg.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px', minHeight: '60vh' }}>
        {children}
      </div>

      {store?.whatsapp_number && !isPreview && (
        <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
          style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#25D366', color: '#fff', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(37,211,102,0.4)', zIndex: 9999 }}>
          <MessageCircle size={26} />
        </a>
      )}
    </main>
  );
}
