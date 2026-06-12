'use client';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {
  MapPin, MessageCircle, Share2, CheckCircle2, Shield, Star, Clock,
  Package, Search, ChevronRight, Navigation, Crown, Sparkles, Eye, Heart
} from 'lucide-react';

const GOLD = '#C9A84C';
const BLACK = '#0A0A0A';
const CREAM = '#FAF8F5';
const DARK_GOLD = '#A07830';

export default function Theme01_Luxury({
  store, products, categories, stats, storeInfo,
  filteredProducts, groupedProducts, activeTab, setActiveTab,
  activeFilter, setActiveFilter, search, setSearch,
  handleShare, handleDirections, shared, trackProductView, formatDistance, totalProducts,
  shop_tabs,
}) {
  const tabs = [
    { id: 'accueil', label: shop_tabs?.accueil || 'Accueil' },
    { id: 'collection', label: shop_tabs?.produits || 'Collection' },
    { id: 'lookbook', label: shop_tabs?.promotions || 'Lookbook' },
    { id: 'apropos', label: shop_tabs?.profil || 'À Propos' },
  ];

  return (
    <main style={{ background: CREAM, fontFamily: 'serif', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Cormorant:wght@300;400;500&display=swap');
        .lux-font { font-family: 'Playfair Display', Georgia, serif; }
        .lux-body { font-family: 'Cormorant', Georgia, serif; }
        .lux-tab-active::after { content: ''; display: block; width: 100%; height: 1px; background: ${GOLD}; margin-top: 4px; }
        .lux-product:hover .lux-img { transform: scale(1.04); }
        .lux-product:hover { box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
        .lux-btn:hover { background: ${BLACK}; color: ${CREAM}; }
        .lux-tab:hover { color: ${GOLD}; }
        @keyframes luxFade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .lux-fade { animation: luxFade 0.5s ease forwards; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background: BLACK, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ borderBottom: `1px solid #222`, padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#888', fontSize: '11px', letterSpacing: '3px', fontFamily: 'Cormorant, serif' }}>
            MAISON DE MODE · VESTYLE
          </span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {store.whatsapp_number && (
              <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" style={{ color: '#888', fontSize: '11px', letterSpacing: '2px', textDecoration: 'none', fontFamily: 'Cormorant, serif' }}>
                CONTACT
              </a>
            )}
            <button onClick={handleShare} style={{ background: 'none', border: 'none', color: shared ? GOLD : '#888', cursor: 'pointer' }}>
              <Share2 size={14} />
            </button>
          </div>
        </div>

        {/* Store Name Bar */}
        <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {store.logo_url && (
              <div style={{ width: 48, height: 48, border: `1px solid ${GOLD}`, overflow: 'hidden', flexShrink: 0 }}>
                <img src={store.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={store.name} />
              </div>
            )}
            <div>
              <h1 className="lux-font" style={{ color: CREAM, fontSize: 'clamp(18px,3vw,28px)', fontWeight: 700, letterSpacing: '0.05em', margin: 0 }}>
                {store.name?.toUpperCase()}
              </h1>
              {store.supplier_level && store.supplier_level !== 'Nouveau Vendeur' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Crown size={10} color={GOLD} />
                  <span style={{ color: GOLD, fontSize: '10px', letterSpacing: '3px', fontFamily: 'Cormorant, serif' }}>
                    {store.supplier_level?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {store.whatsapp_number && (
              <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: `1px solid ${GOLD}`, color: GOLD, textDecoration: 'none', fontSize: '11px', letterSpacing: '2px', fontFamily: 'Cormorant, serif', transition: 'all 0.2s' }}
                className="lux-btn">
                CONTACTER
              </a>
            )}
            <button onClick={handleDirections}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: '1px solid #444', color: '#888', background: 'none', fontSize: '11px', letterSpacing: '2px', fontFamily: 'Cormorant, serif', cursor: 'pointer', transition: 'all 0.2s' }}
              className="lux-btn">
              <MapPin size={12} /> LOCALISER
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: 0, borderTop: '1px solid #1a1a1a', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`lux-tab ${activeTab === tab.id ? 'lux-tab-active' : ''}`}
              style={{
                padding: '14px 28px', background: 'none', border: 'none', cursor: 'pointer',
                color: activeTab === tab.id ? GOLD : '#666',
                fontFamily: 'Cormorant, serif', fontSize: '12px', letterSpacing: '3px', whiteSpace: 'nowrap',
                transition: 'color 0.2s', borderBottom: activeTab === tab.id ? `2px solid ${GOLD}` : '2px solid transparent'
              }}>
              {tab.label.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      {/* ── HERO BANNER ── */}
      <div style={{ position: 'relative', height: 'clamp(220px,40vh,420px)', overflow: 'hidden', background: BLACK }}>
        {store.banner_url ? (
          <img src={store.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} alt="" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 50%, #0d0d0d 100%)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 1, background: GOLD }} />
          <p className="lux-font" style={{ color: GOLD, fontSize: '11px', letterSpacing: '6px', margin: 0 }}>MAISON</p>
          <h2 className="lux-font" style={{ color: CREAM, fontSize: 'clamp(28px,5vw,64px)', fontWeight: 900, letterSpacing: '0.08em', margin: 0, textAlign: 'center', padding: '0 20px' }}>
            {store.name}
          </h2>
          <div style={{ width: 40, height: 1, background: GOLD }} />
          {store.city && (
            <p style={{ color: '#888', fontSize: '11px', letterSpacing: '4px', fontFamily: 'Cormorant, serif', margin: 0 }}>
              {store.city?.toUpperCase()}
            </p>
          )}
        </div>
        {/* Trust bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 32, padding: '12px 20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          {[
            { icon: <CheckCircle2 size={12} color={GOLD} />, label: 'Vérifié VesTyle' },
            { icon: <Star size={12} color={GOLD} fill={GOLD} />, label: `${store.positive_rating ?? 100}% Avis Positifs` },
            { icon: <Clock size={12} color={GOLD} />, label: `Rép: ${store.response_time || '< 2h'}` },
            { icon: <Package size={12} color={GOLD} />, label: `${totalProducts} Pièces` },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              {item.icon}
              <span style={{ color: '#ccc', fontSize: '10px', letterSpacing: '2px', fontFamily: 'Cormorant, serif' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* === ACCUEIL === */}
        {activeTab === 'accueil' && (
          <div className="lux-fade">
            {store.custom_message && (
              <div style={{ border: `1px solid ${GOLD}`, padding: '20px 28px', marginBottom: 48, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(201,168,76,0.04)' }}>
                <div style={{ width: 1, height: 40, background: GOLD, flexShrink: 0 }} />
                <p className="lux-font" style={{ color: BLACK, fontSize: '15px', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                  "{store.custom_message}"
                </p>
              </div>
            )}
            {Object.keys(groupedProducts).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ width: 1, height: 60, background: '#ddd', margin: '0 auto 20px' }} />
                <p className="lux-font" style={{ color: '#999', fontSize: '20px', fontStyle: 'italic' }}>La collection arrive bientôt</p>
              </div>
            ) : (
              Object.entries(groupedProducts).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: 64 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                    <div style={{ flex: 1, height: 1, background: '#e0d9d0' }} />
                    <h2 className="lux-font" style={{ color: BLACK, fontSize: 'clamp(16px,2.5vw,24px)', fontWeight: 400, letterSpacing: '0.15em', margin: 0, whiteSpace: 'nowrap' }}>
                      {cat.toUpperCase()}
                    </h2>
                    <div style={{ flex: 1, height: 1, background: '#e0d9d0' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
                    {items.slice(0, 8).map((p, idx) => (
                      <div key={p.id} className="lux-product" style={{ cursor: 'pointer', transition: 'box-shadow 0.3s', background: '#fff' }}>
                        <div style={{ overflow: 'hidden', aspectRatio: '3/4' }}>
                          <img src={p.image_url} alt={p.name} className="lux-img" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }} />
                        </div>
                        <div style={{ padding: '12px 8px' }}>
                          <p className="lux-font" style={{ color: BLACK, fontSize: '13px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '0.05em' }}>{p.name}</p>
                          <p style={{ color: GOLD, fontSize: '14px', fontWeight: 700, margin: 0, fontFamily: 'Cormorant, serif' }}>
                            {p.price?.toLocaleString('fr-FR')} FCFA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {items.length > 8 && (
                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                      <button onClick={() => { setActiveTab('collection'); setActiveFilter(cat); }}
                        style={{ padding: '10px 32px', border: `1px solid ${BLACK}`, background: 'none', fontFamily: 'Cormorant, serif', fontSize: '12px', letterSpacing: '3px', cursor: 'pointer', transition: 'all 0.2s' }}
                        className="lux-btn">
                        VOIR TOUT ({items.length}) →
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* === COLLECTION (all products + filter) === */}
        {activeTab === 'collection' && (
          <div className="lux-fade">
            {/* Search */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 32, alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={16} color="#999" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={`Rechercher dans la collection (${totalProducts} pièces)...`}
                  style={{ width: '100%', padding: '14px 16px 14px 44px', border: '1px solid #ddd', background: '#fff', fontFamily: 'Cormorant, serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            {/* Category filter */}
            {categories.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
                {['all', ...categories].map(cat => (
                  <button key={cat} onClick={() => setActiveFilter(cat)}
                    style={{
                      padding: '7px 20px', border: `1px solid ${activeFilter === cat ? BLACK : '#ddd'}`,
                      background: activeFilter === cat ? BLACK : 'transparent',
                      color: activeFilter === cat ? CREAM : '#666',
                      fontFamily: 'Cormorant, serif', fontSize: '11px', letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    {cat === 'all' ? 'TOUT' : cat.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <p style={{ color: '#999', fontFamily: 'Cormorant, serif', fontSize: '13px', letterSpacing: '2px', margin: 0 }}>
                {filteredProducts.length} PIÈCE{filteredProducts.length !== 1 ? 'S' : ''}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
              {filteredProducts.map((p, idx) => (
                <ProductCard key={p.id} item={{ ...p, stores: storeInfo }} idx={idx} trackProductView={trackProductView} formatDistance={formatDistance} />
              ))}
            </div>
          </div>
        )}

        {/* === LOOKBOOK === */}
        {activeTab === 'lookbook' && (
          <div className="lux-fade">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{ color: GOLD, fontSize: '11px', letterSpacing: '5px', fontFamily: 'Cormorant, serif', margin: '0 0 8px' }}>ÉDITORIAL</p>
              <h2 className="lux-font" style={{ fontSize: 'clamp(24px,4vw,48px)', color: BLACK, fontWeight: 400, margin: '0 0 16px' }}>Lookbook</h2>
              <div style={{ width: 60, height: 1, background: GOLD, margin: '0 auto' }} />
            </div>
            {products.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', fontFamily: 'Cormorant, serif', fontStyle: 'italic', fontSize: '18px' }}>Le lookbook arrive bientôt…</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridAutoRows: '80px', gap: 4 }}>
                {products.slice(0, 6).map((p, i) => {
                  const spans = [
                    { col: '1 / 8', row: '1 / 5' },
                    { col: '8 / 13', row: '1 / 3' },
                    { col: '8 / 13', row: '3 / 5' },
                    { col: '1 / 5', row: '5 / 8' },
                    { col: '5 / 9', row: '5 / 8' },
                    { col: '9 / 13', row: '5 / 8' },
                  ];
                  return (
                    <div key={p.id} style={{ gridColumn: spans[i]?.col, gridRow: spans[i]?.row, position: 'relative', overflow: 'hidden', background: '#111' }}>
                      <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, transition: 'transform 0.6s, opacity 0.3s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.85'; }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                        <p className="lux-font" style={{ color: CREAM, fontSize: '13px', margin: '0 0 2px' }}>{p.name}</p>
                        <p style={{ color: GOLD, fontSize: '12px', fontFamily: 'Cormorant, serif', margin: 0 }}>{p.price?.toLocaleString('fr-FR')} FCFA</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* === À PROPOS === */}
        {(activeTab === 'apropos') && (
          <div className="lux-fade" style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{ color: GOLD, fontSize: '11px', letterSpacing: '5px', fontFamily: 'Cormorant, serif', margin: '0 0 8px' }}>LA MAISON</p>
              <h2 className="lux-font" style={{ fontSize: 'clamp(24px,4vw,42px)', color: BLACK, fontWeight: 400, margin: '0 0 16px' }}>Notre Histoire</h2>
              <div style={{ width: 60, height: 1, background: GOLD, margin: '0 auto' }} />
            </div>
            <div style={{ background: '#fff', padding: '40px 48px', borderTop: `2px solid ${GOLD}` }}>
              <p className="lux-font" style={{ color: '#444', fontSize: '18px', fontStyle: 'italic', lineHeight: 1.8, margin: '0 0 32px' }}>
                {store.description || 'Cette maison incarne l\'élégance et le raffinement. Chaque pièce est sélectionnée avec soin pour vous offrir le meilleur de la mode contemporaine.'}
              </p>
              <div style={{ borderTop: `1px solid #eee`, paddingTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {store.whatsapp_number && (
                  <div>
                    <p style={{ color: GOLD, fontSize: '10px', letterSpacing: '3px', fontFamily: 'Cormorant, serif', margin: '0 0 8px' }}>CONTACT</p>
                    <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" style={{ color: BLACK, textDecoration: 'none', fontFamily: 'Cormorant, serif', fontSize: '15px' }}>
                      {store.whatsapp_number}
                    </a>
                  </div>
                )}
                {store.city && (
                  <div>
                    <p style={{ color: GOLD, fontSize: '10px', letterSpacing: '3px', fontFamily: 'Cormorant, serif', margin: '0 0 8px' }}>ADRESSE</p>
                    <p style={{ color: BLACK, fontFamily: 'Cormorant, serif', fontSize: '15px', margin: 0 }}>{store.city}</p>
                  </div>
                )}
                <div>
                  <p style={{ color: GOLD, fontSize: '10px', letterSpacing: '3px', fontFamily: 'Cormorant, serif', margin: '0 0 8px' }}>AVIS CLIENTS</p>
                  <p style={{ color: BLACK, fontFamily: 'Cormorant, serif', fontSize: '15px', margin: 0 }}>{store.positive_rating ?? 100}% Positifs</p>
                </div>
                <div>
                  <p style={{ color: GOLD, fontSize: '10px', letterSpacing: '3px', fontFamily: 'Cormorant, serif', margin: '0 0 8px' }}>RÉPONSE</p>
                  <p style={{ color: BLACK, fontFamily: 'Cormorant, serif', fontSize: '15px', margin: 0 }}>{store.response_time || '< 2h'}</p>
                </div>
              </div>
            </div>
            {store.whatsapp_number && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank"
                  style={{ display: 'inline-block', padding: '14px 48px', background: BLACK, color: CREAM, textDecoration: 'none', fontFamily: 'Cormorant, serif', fontSize: '12px', letterSpacing: '3px', transition: 'background 0.2s' }}>
                  PRENDRE CONTACT →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
