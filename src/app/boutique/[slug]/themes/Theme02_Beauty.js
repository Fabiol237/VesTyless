'use client';
import { MessageCircle, Share2, CheckCircle2, ShoppingBag, MapPin, Star, Clock, Heart } from 'lucide-react';

export default function Theme02_Beauty({
  store, modules = [], pages = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const rose = '#B5325A';
  const gold = '#D4AF37';
  const pink = '#FFF5F7';
  const activeModules = modules.filter(m => m.is_active);

  return (
    <main style={{ minHeight: '100vh', background: pink, fontFamily: "'Cormorant Garamond', Georgia, serif", overflowX: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;600;700;800;900&display=swap');`}</style>

      {/* ── STORE HEADER BEAUTY ───────────────────────────────────── */}
      <div style={{ background: `linear-gradient(180deg, ${pink} 0%, #FFE4EC 100%)`, padding: '28px 20px 0', textAlign: 'center' }}>

        {/* Logo circulaire avec halo */}
        <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 14px' }}>
          <div style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', background: `linear-gradient(135deg, ${rose}40, ${gold}40)`, animation: 'pulse 3s ease-in-out infinite' }} />
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${rose}`, background: '#fff', position: 'relative', zIndex: 1 }}>
            {store?.logo_url ? (
              <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${rose}, ${gold})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: '700', color: '#fff' }}>{store?.name?.charAt(0)}</div>
            )}
          </div>
          {/* Étoile déco */}
          <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '24px', height: '24px', background: gold, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', zIndex: 2 }}>
            <Star size={11} fill="#fff" color="#fff" />
          </div>
        </div>

        {/* Label & Nom */}
        {store?.category && (
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', color: rose, marginBottom: '6px' }}>
            {store.category}
          </div>
        )}
        <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '700', color: '#2d1a22', letterSpacing: '0.03em' }}>{store?.name}</h1>

        {/* Badge officiel */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fff', border: `1.5px solid ${gold}`, borderRadius: '999px', padding: '4px 12px', fontSize: '11px', fontFamily: 'Inter, sans-serif', fontWeight: '700', color: '#78610a', marginBottom: '12px' }}>
          <Star size={10} fill={gold} color={gold} /> Boutique Officielle
        </div>

        {/* Stats de confiance */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[
            { icon: <CheckCircle2 size={12} color="#22c55e" />, text: 'Vérifié VesTyle' },
            { icon: <Star size={12} fill={rose} color={rose} />, text: `${store?.positive_rating ?? 100}% Avis` },
            { icon: <Clock size={12} color="#888" />, text: `Rép. ${store?.response_time || '< 1h'}` },
          ].map((b, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'Inter, sans-serif', fontWeight: '600', color: '#6b4457' }}>{b.icon} {b.text}</span>
          ))}
        </div>

        {/* Boutons d'action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px', margin: '0 auto 16px' }}>
          {store?.whatsapp_number && (
            <a href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`} target="_blank"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: rose, color: '#fff', padding: '12px 20px', borderRadius: '999px', fontFamily: 'Inter, sans-serif', fontWeight: '800', fontSize: '13px', textDecoration: 'none', boxShadow: `0 6px 20px ${rose}40`, letterSpacing: '0.03em' }}>
              <MessageCircle size={16} /> Contacter sur WhatsApp
            </a>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleShare}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#fff', color: rose, border: `1.5px solid ${rose}`, padding: '10px', borderRadius: '999px', fontFamily: 'Inter, sans-serif', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
              {shared ? <CheckCircle2 size={14} color="#22c55e" /> : <Share2 size={14} />} Partager
            </button>
            {store?.latitude && (
              <button onClick={handleDirections}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#fff', color: '#555', border: '1.5px solid #ddd', padding: '10px', borderRadius: '999px', fontFamily: 'Inter, sans-serif', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                <MapPin size={14} /> Localiser
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── BANNIÈRE ──────────────────────────────────────────────── */}
      {store?.banner_url && (
        <div style={{ width: '100%', height: '160px', overflow: 'hidden', position: 'relative' }}>
          <img src={store.banner_url} alt="bannière" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent, ${pink}60)` }} />
        </div>
      )}

      {/* ── NAVIGATION ────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderTop: `3px solid ${rose}20`, borderBottom: `1px solid ${rose}15` }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', justifyContent: 'center' }}>
          {activeModules.map(m => (
            <button key={m.id} onClick={() => setActivePage(m.id)}
              style={{ padding: '13px 18px', background: 'none', border: 'none', borderBottom: `2.5px solid ${activePage === m.id ? rose : 'transparent'}`, color: activePage === m.id ? rose : '#888', fontFamily: 'Inter, sans-serif', fontWeight: '800', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'all 0.2s', flexShrink: 0 }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENU ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 14px 80px' }}>
        {children}
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer style={{ background: '#fff', borderTop: `1px solid ${rose}15`, padding: '24px 20px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: rose }}>{store?.name}</h3>
        <p style={{ margin: 0, color: '#999', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>© {new Date().getFullYear()} — Beauté propulsée par VesTyle</p>
      </footer>
    </main>
  );
}
