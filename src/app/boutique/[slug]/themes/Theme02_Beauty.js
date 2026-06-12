'use client';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {
  MapPin, MessageCircle, Share2, CheckCircle2, Shield, Star, Clock,
  Package, Search, Heart, Sparkles, Phone, Calendar, Image, ArrowRight
} from 'lucide-react';

const ROSE = '#B5325A';
const PINK_LIGHT = '#FFF5F7';
const PINK_MED = '#FFD6DF';
const GOLD = '#D4AF37';
const BLUSH = '#F8BBD0';

const SERVICES_EXAMPLES = [
  { name: 'Coiffure & Styling', price: 'Dès 5 000 FCFA', icon: '✂️', desc: 'Coupes, colorations, mèches, lissages' },
  { name: 'Maquillage Pro', price: 'Dès 8 000 FCFA', icon: '💄', desc: 'Maquillage naturel, soirée, mariée' },
  { name: 'Manucure & Pédicure', price: 'Dès 4 000 FCFA', icon: '💅', desc: 'Ongles naturels, gel, nail art' },
  { name: 'Soins du Visage', price: 'Dès 10 000 FCFA', icon: '🌿', desc: 'Nettoyage, hydratation, anti-âge' },
  { name: 'Épilation', price: 'Dès 3 000 FCFA', icon: '✨', desc: 'Cire, fil, zones diverses' },
  { name: 'Massage Détente', price: 'Dès 12 000 FCFA', icon: '🌸', desc: 'Relaxant, drainant, deep tissue' },
];

export default function Theme02_Beauty({
  store, products, categories, stats, storeInfo,
  filteredProducts, groupedProducts, activeTab, setActiveTab,
  activeFilter, setActiveFilter, search, setSearch,
  handleShare, handleDirections, shared, trackProductView, formatDistance, totalProducts,
  shop_tabs,
}) {
  const tabs = [
    { id: 'accueil', label: shop_tabs?.accueil || 'Accueil', icon: '🏠' },
    { id: 'produits', label: shop_tabs?.produits || 'Boutique', icon: '🛍️' },
    { id: 'services', label: shop_tabs?.promotions || 'Services', icon: '✨' },
    { id: 'galerie', label: 'Galerie', icon: '📸' },
    { id: 'rdv', label: 'Rendez-vous', icon: '📅' },
    { id: 'apropos', label: shop_tabs?.profil || 'À Propos', icon: '💗' },
  ];

  return (
    <main style={{ background: PINK_LIGHT, minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Poppins:wght@300;400;500;600;700&display=swap');
        .bty-font { font-family: 'Cormorant Garamond', Georgia, serif; }
        .bty-body { font-family: 'Poppins', sans-serif; }
        .bty-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(181,50,90,0.15); }
        .bty-btn-rose { background: ${ROSE}; color: white; transition: all 0.3s; }
        .bty-btn-rose:hover { background: #8E1F3C; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(181,50,90,0.4); }
        @keyframes btyFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .bty-float { animation: btyFloat 3s ease-in-out infinite; }
        @keyframes btyFade { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        .bty-fade { animation: btyFade 0.5s ease forwards; }
        .bty-pill-active { background: ${ROSE} !important; color: white !important; }
        .bty-service:hover { border-color: ${ROSE} !important; background: white !important; }
        .bty-gallery-item:hover img { transform: scale(1.1); }
        .bty-gallery-item:hover .bty-overlay { opacity: 1 !important; }
      `}</style>

      {/* ── HERO HEADER ── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Gradient background */}
        <div style={{
          background: `linear-gradient(160deg, ${BLUSH} 0%, ${PINK_MED} 40%, ${PINK_LIGHT} 100%)`,
          position: 'relative', paddingTop: 80
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(212,175,55,0.08)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(181,50,90,0.06)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              {/* Logo */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 100, height: 100, borderRadius: '50%',
                  border: `3px solid ${ROSE}`, padding: 4,
                  background: 'white', boxShadow: `0 0 0 6px ${BLUSH}`
                }}>
                  {store.logo_url ? (
                    <img src={store.logo_url} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt={store.name} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: `linear-gradient(135deg, ${ROSE}, ${PINK_MED})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 36 }}>💄</span>
                    </div>
                  )}
                </div>
                <div className="bty-float" style={{ position: 'absolute', top: -8, right: -8, background: GOLD, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✨</div>
              </div>

              <div>
                <p style={{ color: ROSE, fontSize: '11px', letterSpacing: '4px', margin: '0 0 6px', fontWeight: 600, textTransform: 'uppercase' }}>
                  Salon Beauté & Bien-être
                </p>
                <h1 className="bty-font" style={{ fontSize: 'clamp(28px,5vw,54px)', color: '#2D0A1A', fontWeight: 600, margin: '0 0 8px', lineHeight: 1.1 }}>
                  {store.name}
                </h1>
                {store.supplier_level && store.supplier_level !== 'Nouveau Vendeur' && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}`, borderRadius: 20, padding: '4px 14px' }}>
                    <Star size={11} fill={GOLD} color={GOLD} />
                    <span style={{ color: '#8A6B00', fontSize: '11px', fontWeight: 600, letterSpacing: '1px' }}>{store.supplier_level}</span>
                  </div>
                )}
              </div>

              {/* Trust row */}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', padding: '8px 0' }}>
                {[
                  { icon: <CheckCircle2 size={13} color={ROSE} />, text: 'Vérifié VesTyle' },
                  { icon: <Star size={13} fill={ROSE} color={ROSE} />, text: `${store.positive_rating ?? 100}% Avis ❤️` },
                  { icon: <Clock size={13} color={ROSE} />, text: `Rép. ${store.response_time || '< 2h'}` },
                ].map((item, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6B3050', fontSize: '12px', fontWeight: 500 }}>
                    {item.icon} {item.text}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', paddingBottom: 24 }}>
                {store.whatsapp_number && (
                  <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank"
                    className="bty-btn-rose"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 40, fontWeight: 600, fontSize: '13px', textDecoration: 'none', cursor: 'pointer' }}>
                    <MessageCircle size={16} /> Contacter sur WhatsApp
                  </a>
                )}
                <button onClick={handleShare}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 40, border: `2px solid ${ROSE}`, background: 'white', color: ROSE, fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {shared ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
                  {shared ? 'Copié !' : 'Partager'}
                </button>
                <button onClick={handleDirections}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 40, border: `2px solid ${BLUSH}`, background: 'white', color: '#888', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}>
                  <MapPin size={16} /> Localiser
                </button>
              </div>
            </div>
          </div>

          {/* Banner image strip */}
          {store.banner_url && (
            <div style={{ width: '100%', height: 180, overflow: 'hidden', marginTop: -20 }}>
              <img src={store.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} alt="" />
              <div style={{ position: 'relative', marginTop: -180, height: 180, background: `linear-gradient(to bottom, transparent 40%, ${PINK_LIGHT})` }} />
            </div>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ background: 'white', borderBottom: `1px solid ${BLUSH}`, position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 2px 16px rgba(181,50,90,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', display: 'flex', overflowX: 'auto', gap: 0 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 18px', border: 'none', background: 'none', cursor: 'pointer',
                color: activeTab === tab.id ? ROSE : '#888',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '12px', whiteSpace: 'nowrap',
                borderBottom: activeTab === tab.id ? `3px solid ${ROSE}` : '3px solid transparent',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5
              }}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* ACCUEIL */}
        {activeTab === 'accueil' && (
          <div className="bty-fade">
            {store.custom_message && (
              <div style={{ background: `linear-gradient(135deg, ${ROSE}, #8E1F3C)`, borderRadius: 20, padding: '20px 28px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 28 }}>💌</span>
                <p style={{ color: 'white', fontSize: '15px', fontWeight: 500, margin: 0, fontStyle: 'italic' }}>{store.custom_message}</p>
              </div>
            )}

            {/* Featured categories */}
            {Object.keys(groupedProducts).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <span style={{ fontSize: 64, display: 'block', marginBottom: 16 }}>💄</span>
                <p className="bty-font" style={{ color: ROSE, fontSize: '24px', fontStyle: 'italic' }}>Les produits arrivent bientôt…</p>
              </div>
            ) : (
              Object.entries(groupedProducts).slice(0, 3).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: 48 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 className="bty-font" style={{ color: '#2D0A1A', fontSize: 'clamp(18px,3vw,28px)', fontWeight: 600, margin: 0 }}>
                      ✨ {cat}
                    </h2>
                    <button onClick={() => { setActiveTab('produits'); setActiveFilter(cat); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, color: ROSE, background: 'none', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                      Tout voir <ArrowRight size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                    {items.slice(0, 6).map((p, idx) => (
                      <div key={p.id} className="bty-card" style={{ borderRadius: 20, overflow: 'hidden', background: 'white', boxShadow: '0 4px 16px rgba(181,50,90,0.08)', transition: 'all 0.3s', cursor: 'pointer' }}>
                        <div style={{ aspectRatio: '1', overflow: 'hidden' }}>
                          <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '12px' }}>
                          <p style={{ fontWeight: 600, fontSize: '13px', color: '#2D0A1A', margin: '0 0 4px' }}>{p.name}</p>
                          <p style={{ color: ROSE, fontWeight: 700, fontSize: '14px', margin: 0 }}>{p.price?.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* BOUTIQUE / PRODUITS */}
        {activeTab === 'produits' && (
          <div className="bty-fade">
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <Search size={17} color={ROSE} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un produit..."
                style={{ width: '100%', padding: '14px 16px 14px 46px', borderRadius: 40, border: `2px solid ${BLUSH}`, fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: 'white' }}
                onFocus={e => e.target.style.borderColor = ROSE}
                onBlur={e => e.target.style.borderColor = BLUSH} />
            </div>
            {categories.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {['all', ...categories].map(cat => (
                  <button key={cat} onClick={() => setActiveFilter(cat)}
                    className={activeFilter === cat ? 'bty-pill-active' : ''}
                    style={{ padding: '8px 18px', borderRadius: 40, border: `2px solid ${activeFilter === cat ? ROSE : BLUSH}`, background: activeFilter === cat ? ROSE : 'white', color: activeFilter === cat ? 'white' : '#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {cat === 'all' ? '🛍️ Tout' : cat}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {filteredProducts.map((p, idx) => (
                <ProductCard key={p.id} item={{ ...p, stores: storeInfo }} idx={idx} trackProductView={trackProductView} formatDistance={formatDistance} />
              ))}
            </div>
          </div>
        )}

        {/* SERVICES */}
        {activeTab === 'services' && (
          <div className="bty-fade">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ color: ROSE, fontSize: '11px', letterSpacing: '3px', fontWeight: 600, margin: '0 0 8px' }}>PRESTATIONS</p>
              <h2 className="bty-font" style={{ fontSize: 'clamp(24px,4vw,42px)', color: '#2D0A1A', fontWeight: 600, margin: '0 0 8px' }}>Nos Services</h2>
              <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Prenez soin de vous avec nos prestations haut de gamme</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {SERVICES_EXAMPLES.map((svc, i) => (
                <div key={i} className="bty-service" style={{
                  border: `2px solid ${BLUSH}`, borderRadius: 20, padding: '24px',
                  background: PINK_LIGHT, transition: 'all 0.3s', cursor: 'pointer'
                }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{svc.icon}</div>
                  <h3 style={{ color: '#2D0A1A', fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>{svc.name}</h3>
                  <p style={{ color: '#888', fontSize: '13px', margin: '0 0 10px' }}>{svc.desc}</p>
                  <span style={{ color: ROSE, fontWeight: 700, fontSize: '14px' }}>{svc.price}</span>
                </div>
              ))}
            </div>
            {store.whatsapp_number && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank"
                  className="bty-btn-rose"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 40, fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
                  💬 Réserver ce service sur WhatsApp
                </a>
              </div>
            )}
          </div>
        )}

        {/* GALERIE */}
        {activeTab === 'galerie' && (
          <div className="bty-fade">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 className="bty-font" style={{ fontSize: 'clamp(22px,4vw,40px)', color: '#2D0A1A', fontWeight: 600, margin: '0 0 8px' }}>Notre Galerie</h2>
              <p style={{ color: '#888', fontSize: '14px' }}>Découvrez nos réalisations</p>
            </div>
            {products.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa', fontStyle: 'italic', padding: '40px 0' }}>La galerie sera bientôt disponible ✨</p>
            ) : (
              <div style={{ columns: '2 160px', gap: 12 }}>
                {products.slice(0, 12).map((p, i) => (
                  <div key={p.id} className="bty-gallery-item" style={{ breakInside: 'avoid', marginBottom: 12, borderRadius: 16, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
                    <img src={p.image_url} alt={p.name} style={{ width: '100%', display: 'block', transition: 'transform 0.4s' }} />
                    <div className="bty-overlay" style={{
                      position: 'absolute', inset: 0, background: 'rgba(181,50,90,0.7)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.3s'
                    }}>
                      <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', textAlign: 'center', padding: '0 12px', margin: '0 0 4px' }}>{p.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', margin: 0 }}>{p.price?.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RENDEZ-VOUS */}
        {activeTab === 'rdv' && (
          <div className="bty-fade" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>📅</div>
            <h2 className="bty-font" style={{ fontSize: 'clamp(24px,4vw,40px)', color: '#2D0A1A', fontWeight: 600, margin: '0 0 12px' }}>Prendre Rendez-vous</h2>
            <p style={{ color: '#888', fontSize: '15px', lineHeight: 1.7, margin: '0 0 32px' }}>
              Réservez votre créneau directement via WhatsApp. Notre équipe vous répondra dans les {store.response_time || '< 2h'}.
            </p>
            {store.whatsapp_number ? (
              <>
                <a href={`https://wa.me/${store.whatsapp_number}?text=Bonjour, je souhaite prendre rendez-vous à ${encodeURIComponent(store.name)}`}
                  target="_blank"
                  className="bty-btn-rose"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 40px', borderRadius: 50, fontWeight: 700, fontSize: '16px', textDecoration: 'none', marginBottom: 16 }}>
                  💬 Réserver sur WhatsApp
                </a>
                <p style={{ color: '#aaa', fontSize: '12px' }}>{store.whatsapp_number}</p>
              </>
            ) : (
              <div style={{ border: `2px dashed ${BLUSH}`, borderRadius: 20, padding: 32, color: '#ccc' }}>
                <p>Numéro de contact non renseigné</p>
              </div>
            )}
            <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, textAlign: 'left' }}>
              {[
                { icon: '⏰', title: 'Temps de réponse', val: store.response_time || '< 2h' },
                { icon: '⭐', title: 'Satisfaction client', val: `${store.positive_rating ?? 100}%` },
                { icon: '📍', title: 'Localisation', val: store.city || 'Non renseignée' },
                { icon: '🌸', title: 'Services', val: `${SERVICES_EXAMPLES.length} prestations` },
              ].map((item, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 16, padding: '16px', border: `1px solid ${BLUSH}` }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                  <p style={{ color: '#aaa', fontSize: '11px', margin: '0 0 2px', fontWeight: 600 }}>{item.title}</p>
                  <p style={{ color: '#2D0A1A', fontSize: '15px', fontWeight: 700, margin: 0 }}>{item.val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* À PROPOS */}
        {activeTab === 'apropos' && (
          <div className="bty-fade" style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <span style={{ fontSize: 64 }}>💗</span>
              <h2 className="bty-font" style={{ fontSize: 'clamp(24px,4vw,42px)', color: '#2D0A1A', fontWeight: 600, margin: '16px 0 8px' }}>Notre Histoire</h2>
              <div style={{ width: 60, height: 3, background: `linear-gradient(to right, ${ROSE}, ${GOLD})`, borderRadius: 2, margin: '0 auto' }} />
            </div>
            <div style={{ background: 'white', borderRadius: 24, padding: '36px', border: `1px solid ${BLUSH}`, marginBottom: 24 }}>
              <p className="bty-font" style={{ color: '#4A1530', fontSize: '18px', lineHeight: 1.9, fontStyle: 'italic', margin: 0 }}>
                {store.description || 'Bienvenue dans notre espace beauté. Nous sommes passionnées par la beauté sous toutes ses formes et nous nous engageons à sublimer chaque femme avec des soins et produits de qualité.'}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { icon: '✅', label: 'Certifié VesTyle', val: 'Boutique vérifiée' },
                { icon: '⭐', label: 'Avis clients', val: `${store.positive_rating ?? 100}% positifs` },
                { icon: '⚡', label: 'Réponse', val: store.response_time || '< 2h' },
                { icon: '📍', label: 'Ville', val: store.city || 'Non renseignée' },
              ].map((item, i) => (
                <div key={i} style={{ background: PINK_LIGHT, borderRadius: 16, padding: '16px 20px', border: `1px solid ${BLUSH}` }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <p style={{ color: '#aaa', fontSize: '11px', margin: '6px 0 2px', fontWeight: 600 }}>{item.label}</p>
                  <p style={{ color: ROSE, fontSize: '14px', fontWeight: 700, margin: 0 }}>{item.val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
