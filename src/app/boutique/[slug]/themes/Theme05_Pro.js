'use client';
import { MessageCircle, Share2, CheckCircle2, ShoppingCart, MapPin, Star, Clock, Shield, Wrench, Phone, Package, Truck, Zap } from 'lucide-react';

export default function Theme05_Pro({
  store, modules = [], pages = [], activePage, setActivePage,
  handleShare, handleDirections, shared,
  cartCount, cartTotal, onOpenCart, currency, children, isPreview
}) {
  const navy = '#003087';
  const blue = '#0052CC';
  const orange = '#FF6B00';
  const light = '#F4F6F9';

  return (
    <main style={{ minHeight: '100vh', background: light, fontFamily: 'Roboto Condensed, Inter, sans-serif', overflowX: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;500;600;700;800;900&display=swap');`}</style>

      {/* ── TOPBAR PROFESSIONNELLE ────────────────────────────────── */}
      <div style={{ background: navy, padding: '7px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {store?.whatsapp_number && (
            <a href={`tel:${store.whatsapp_number}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '600', textDecoration: 'none' }}>
              <Phone size={11} /> {store.whatsapp_number}
            </a>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>Livraison Pro disponible</span>
          <Truck size={12} color={orange} />
        </div>
      </div>

      {/* ── HEADER PRINCIPAL ────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '3px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: isPreview ? 'static' : 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Logo avec badge vérifié */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '10px', background: navy, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {store?.logo_url ? (
                  <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#fff', fontSize: '22px', fontWeight: '900' }}>{store?.name?.charAt(0)}</span>
                )}
              </div>
              <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#22c55e', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                <Shield size={8} color="#fff" />
              </div>
            </div>

            {/* Nom + catégorie */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: navy, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>{store?.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                <span style={{ background: orange, color: '#fff', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PRO</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: '600', color: '#22c55e' }}><CheckCircle2 size={11} /> Vérifié VesTyle</span>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>· <span style={{ color: navy, fontWeight: '700' }}>{store?.positive_rating ?? 100}%</span> Avis</span>
              </div>
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              {store?.whatsapp_number && (
                <a href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`} target="_blank"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', background: orange, color: '#fff', padding: '8px 12px', borderRadius: '7px', fontWeight: '900', fontSize: '11px', textDecoration: 'none', letterSpacing: '0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  <MessageCircle size={13} /> Devis
                </a>
              )}
              <button onClick={handleShare} style={{ width: '36px', height: '36px', background: light, border: '1.5px solid #e5e7eb', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {shared ? <CheckCircle2 size={15} color="#22c55e" /> : <Share2 size={15} color="#6b7280" />}
              </button>
              {!isPreview && (
                <button onClick={onOpenCart} style={{ width: '36px', height: '36px', background: navy, border: 'none', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <ShoppingCart size={15} color="#fff" />
                  {cartCount > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: orange, color: '#fff', fontSize: '8px', fontWeight: '900', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
                </button>
              )}
            </div>
          </div>

          {/* Navigation tabs */}
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto', scrollbarWidth: 'none', marginTop: '10px', borderTop: '1px solid #f3f4f6' }}>
            {pages.map(m => (
              <button key={m.key} onClick={() => setActivePage(m.key)}
                style={{ padding: '9px 14px', background: activePage === m.key ? navy : 'none', border: 'none', color: activePage === m.key ? '#fff' : '#6b7280', fontWeight: '800', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s', flexShrink: 0, borderRadius: activePage === m.key ? '6px' : '0', marginBottom: '2px', marginTop: '2px' }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BANNIÈRE PRO ────────────────────────────────────────────── */}
      <div style={{ position: 'relative', background: `linear-gradient(135deg, ${navy} 0%, ${blue} 70%, ${orange}30 100%)`, padding: '30px 20px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(60deg, transparent, transparent 30px, rgba(255,255,255,0.02) 30px, rgba(255,255,255,0.02) 60px)` }} />
        {store?.banner_url && <img src={store.banner_url} alt="bannière" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} />}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { icon: <Package size={18} />, value: store?.product_count || 0, label: 'Produits' },
              { icon: <Star size={18} />, value: `${store?.positive_rating ?? 100}%`, label: 'Satisfaits' },
              { icon: <Truck size={18} />, value: 'Rapide', label: 'Livraison' },
              { icon: <Clock size={18} />, value: store?.response_time || '< 1h', label: 'Réponse' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '10px 6px', background: 'rgba(255,255,255,0.07)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: orange, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENU ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 14px 80px' }}>
        {children}
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer style={{ background: navy, padding: '20px 16px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ color: '#fff', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{store?.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>© {new Date().getFullYear()} · Commerce Pro par VesTyle</div>
        </div>
      </footer>
    </main>
  );
}
