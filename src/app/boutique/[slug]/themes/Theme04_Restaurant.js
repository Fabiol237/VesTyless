'use client';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {
  MapPin, MessageCircle, Share2, CheckCircle2, Star, Clock,
  Package, Search, ChevronRight, Navigation, Utensils, ChefHat,
  Flame, Wine, Clock3
} from 'lucide-react';

const GOLD = '#D4AF37';
const DARK = '#120A00';
const BURGUNDY = '#8B1A1A';
const CREAM = '#FDF6E3';
const BROWN = '#3D1C00';

export default function Theme04_Restaurant({
  store, products, categories, stats, storeInfo,
  filteredProducts, groupedProducts, activeTab, setActiveTab,
  activeFilter, setActiveFilter, search, setSearch,
  handleShare, handleDirections, shared, trackProductView, formatDistance, totalProducts,
  shop_tabs,
}) {
  const tabs = [
    { id: 'accueil', label: shop_tabs?.accueil || 'Notre Menu', icon: <Utensils size={14} /> },
    { id: 'produits', label: shop_tabs?.produits || 'Catalogue', icon: <Package size={14} /> },
    { id: 'promotions', label: shop_tabs?.promotions || 'Spécialités', icon: <Flame size={14} /> },
    { id: 'profil', label: shop_tabs?.profil || 'Notre Histoire', icon: <ChefHat size={14} /> },
  ];

  return (
    <main style={{ background: DARK, fontFamily: "'Lora', Georgia, serif", minHeight: '100vh', color: CREAM }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Raleway:wght@300;400;500;600;700&display=swap');
        .resto-font { font-family: 'Lora', Georgia, serif; }
        .resto-body { font-family: 'Raleway', sans-serif; }
        .resto-card { transition: all 0.3s ease; }
        .resto-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(212,175,55,0.2); }
        .resto-card:hover .resto-card-img { transform: scale(1.08); }
        .resto-tab-active { border-bottom: 2px solid ${GOLD}; color: ${GOLD} !important; }
        .resto-btn-gold { background: linear-gradient(135deg, ${GOLD}, #B8960C); color: ${DARK}; }
        .resto-btn-gold:hover { background: linear-gradient(135deg, #E8C547, ${GOLD}); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(212,175,55,0.4); }
        @keyframes restoFade { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        .resto-fade { animation: restoFade 0.5s ease forwards; }
        .resto-glow { text-shadow: 0 0 40px rgba(212,175,55,0.3); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── HERO BANNER ── */}
      <div style={{ position: 'relative', height: 'clamp(280px, 50vh, 520px)', overflow: 'hidden' }}>
        {store.banner_url ? (
          <img src={store.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3) saturate(0.8)' }} alt="" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `radial-gradient(ellipse at center, ${BROWN} 0%, ${DARK} 70%)` }} />
        )}
        {/* Decorative pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139,26,26,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(212,175,55,0.1) 0%, transparent 50%)' }} />

        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 24px' }}>
          {store.logo_url && (
            <div style={{ width: 80, height: 80, borderRadius: '50%', border: `2px solid ${GOLD}`, overflow: 'hidden', marginBottom: 8, boxShadow: `0 0 30px rgba(212,175,55,0.4)` }}>
              <img src={store.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={store.name} />
            </div>
          )}
          {/* Ornamental line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 400 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
            <Utensils size={16} color={GOLD} />
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
          </div>
          <h1 className="resto-font resto-glow" style={{ color: CREAM, fontSize: 'clamp(24px,5vw,56px)', fontWeight: 700, margin: 0, textAlign: 'center', letterSpacing: '0.05em' }}>
            {store.name}
          </h1>
          {store.city && (
            <p className="resto-body" style={{ color: GOLD, fontSize: '12px', letterSpacing: '4px', margin: 0, textTransform: 'uppercase' }}>
              {store.city}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 400 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
            <Wine size={14} color={GOLD} />
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {store.whatsapp_number && (
              <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank"
                className="resto-body resto-btn-gold"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 4, textDecoration: 'none', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', transition: 'all 0.2s', cursor: 'pointer' }}>
                <MessageCircle size={14} /> Réserver
              </a>
            )}
            <button onClick={handleDirections}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 4, background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>
              <MapPin size={14} /> Nous trouver
            </button>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 32, padding: '14px 20px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderTop: `1px solid rgba(212,175,55,0.2)` }}>
          {[
            { icon: <CheckCircle2 size={12} color={GOLD} />, label: 'Vérifié VesTyle' },
            { icon: <Star size={12} color={GOLD} fill={GOLD} />, label: `${store.positive_rating ?? 100}% de satisfaction` },
            { icon: <Clock size={12} color={GOLD} />, label: `Réponse: ${store.response_time || '< 2h'}` },
            { icon: <Package size={12} color={GOLD} />, label: `${totalProducts} articles au menu` },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              {item.icon}
              <span className="resto-body" style={{ color: '#ccc', fontSize: '10px', letterSpacing: '1px' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <nav style={{ background: '#1a0d00', borderBottom: `1px solid rgba(212,175,55,0.2)`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', overflowX: 'auto', gap: 0 }} className="no-scrollbar">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`resto-body ${activeTab === tab.id ? 'resto-tab-active' : ''}`}
              style={{
                padding: '16px 24px', background: 'none', border: 'none', cursor: 'pointer',
                color: activeTab === tab.id ? GOLD : '#8B7355',
                fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase',
                whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8,
                transition: 'color 0.2s', borderBottom: activeTab === tab.id ? `2px solid ${GOLD}` : '2px solid transparent'
              }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* === ACCUEIL (MENU) === */}
        {activeTab === 'accueil' && (
          <div className="resto-fade">
            {store.custom_message && (
              <div style={{ border: `1px solid rgba(212,175,55,0.3)`, borderLeft: `4px solid ${GOLD}`, padding: '20px 28px', marginBottom: 48, background: 'rgba(212,175,55,0.05)', borderRadius: 4 }}>
                <p className="resto-font" style={{ color: CREAM, fontSize: '16px', fontStyle: 'italic', margin: 0, lineHeight: 1.7 }}>
                  « {store.custom_message} »
                </p>
              </div>
            )}

            {/* Section title */}
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p className="resto-body" style={{ color: GOLD, fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 8px' }}>Notre Sélection</p>
              <h2 className="resto-font" style={{ color: CREAM, fontSize: 'clamp(22px,3.5vw,38px)', fontWeight: 400, margin: 0 }}>Menu du Jour</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, justifyContent: 'center' }}>
                <div style={{ width: 40, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
                <Flame size={14} color={GOLD} />
                <div style={{ width: 40, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
              </div>
            </div>

            {Object.keys(groupedProducts).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', border: `1px solid rgba(212,175,55,0.15)` }}>
                <ChefHat size={48} color={GOLD} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p className="resto-font" style={{ color: '#8B7355', fontSize: '20px', fontStyle: 'italic' }}>Le menu arrive bientôt…</p>
              </div>
            ) : (
              Object.entries(groupedProducts).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: 64 }}>
                  {/* Category header with ornamental style */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <div style={{ flex: 1, height: 1, background: `rgba(212,175,55,0.2)` }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', border: `1px solid rgba(212,175,55,0.3)`, borderRadius: 2 }}>
                      <Utensils size={12} color={GOLD} />
                      <h2 className="resto-font" style={{ color: GOLD, fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase', margin: 0, fontWeight: 400 }}>
                        {cat}
                      </h2>
                    </div>
                    <div style={{ flex: 1, height: 1, background: `rgba(212,175,55,0.2)` }} />
                  </div>

                  {/* Horizontal menu list style for restaurant */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {items.slice(0, 8).map((p) => (
                      <div key={p.id} className="resto-card" style={{ background: '#1a0d00', border: `1px solid rgba(212,175,55,0.15)`, borderRadius: 4, display: 'flex', gap: 0, overflow: 'hidden', cursor: 'pointer' }}>
                        <div style={{ width: 100, minHeight: 100, flexShrink: 0, overflow: 'hidden' }}>
                          <img src={p.image_url || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80'} alt={p.name}
                            className="resto-card-img"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                        </div>
                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <h3 className="resto-font" style={{ color: CREAM, fontSize: '14px', fontWeight: 600, margin: '0 0 6px', lineHeight: 1.3 }}>{p.name}</h3>
                            {p.description && (
                              <p className="resto-body" style={{ color: '#8B7355', fontSize: '11px', margin: '0 0 8px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {p.description}
                              </p>
                            )}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="resto-font" style={{ color: GOLD, fontSize: '15px', fontWeight: 700 }}>
                              {p.price?.toLocaleString('fr-FR')} FCFA
                            </span>
                            {p.is_boosted && (
                              <span className="resto-body" style={{ background: BURGUNDY, color: CREAM, fontSize: '9px', padding: '3px 8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                Chef
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {items.length > 8 && (
                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                      <button onClick={() => { setActiveTab('produits'); setActiveFilter(cat); }}
                        className="resto-body"
                        style={{ padding: '10px 28px', border: `1px solid ${GOLD}`, background: 'none', color: GOLD, fontSize: '11px', letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase' }}>
                        Voir tout ({items.length}) →
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* === CATALOGUE (search + filter) === */}
        {activeTab === 'produits' && (
          <div className="resto-fade">
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <Search size={16} color="#8B7355" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Chercher dans notre menu (${totalProducts} articles)...`}
                className="resto-body"
                style={{ width: '100%', padding: '14px 16px 14px 44px', background: '#1a0d00', border: `1px solid rgba(212,175,55,0.2)`, color: CREAM, fontSize: '14px', outline: 'none', boxSizing: 'border-box', borderRadius: 4 }} />
            </div>

            {categories.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
                {['all', ...categories].map(cat => (
                  <button key={cat} onClick={() => setActiveFilter(cat)}
                    className="resto-body"
                    style={{
                      padding: '8px 18px', border: `1px solid ${activeFilter === cat ? GOLD : 'rgba(212,175,55,0.2)'}`,
                      background: activeFilter === cat ? GOLD : 'transparent',
                      color: activeFilter === cat ? DARK : '#8B7355',
                      fontSize: '11px', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', borderRadius: 4
                    }}>
                    {cat === 'all' ? 'Tout le menu' : cat}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {filteredProducts.map((p, idx) => (
                <div key={p.id} className="resto-card" style={{ background: '#1a0d00', border: `1px solid rgba(212,175,55,0.15)`, borderRadius: 4, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ height: 200, overflow: 'hidden' }}>
                    <img src={p.image_url || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80'} alt={p.name}
                      className="resto-card-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <h3 className="resto-font" style={{ color: CREAM, fontSize: '15px', fontWeight: 600, margin: '0 0 6px' }}>{p.name}</h3>
                    {p.description && (
                      <p className="resto-body" style={{ color: '#8B7355', fontSize: '12px', margin: '0 0 12px', lineHeight: 1.5 }}>
                        {p.description?.substring(0, 80)}{p.description?.length > 80 ? '…' : ''}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="resto-font" style={{ color: GOLD, fontSize: '16px', fontWeight: 700 }}>
                        {p.price?.toLocaleString('fr-FR')} FCFA
                      </span>
                      {p.is_boosted && <Flame size={14} color={BURGUNDY} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === SPÉCIALITÉS === */}
        {activeTab === 'promotions' && (
          <div className="resto-fade">
            {/* Hero banner */}
            <div style={{ background: `linear-gradient(135deg, ${BURGUNDY} 0%, #5C0E0E 100%)`, padding: '48px 40px', textAlign: 'center', marginBottom: 48, borderRadius: 4, border: `1px solid rgba(212,175,55,0.3)`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.01) 10px, rgba(255,255,255,0.01) 20px)' }} />
              <Flame size={36} color={GOLD} style={{ margin: '0 auto 16px' }} />
              <h2 className="resto-font" style={{ color: CREAM, fontSize: 'clamp(20px,3.5vw,36px)', fontWeight: 700, margin: '0 0 12px' }}>
                Spécialités de la Maison
              </h2>
              <p className="resto-body" style={{ color: 'rgba(253,246,227,0.8)', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
                {store.custom_message || 'Découvrez nos plats signatures, préparés avec passion et des ingrédients sélectionnés.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {(products.filter(p => p.is_boosted).length > 0 ? products.filter(p => p.is_boosted) : products.slice(0, 6)).map((p, idx) => (
                <div key={p.id} className="resto-card" style={{ background: '#1a0d00', border: `1px solid rgba(212,175,55,0.2)`, borderRadius: 4, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: GOLD, padding: '4px 10px', borderRadius: 2 }}>
                    <span className="resto-body" style={{ color: DARK, fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Chef</span>
                  </div>
                  <div style={{ height: 220, overflow: 'hidden' }}>
                    <img src={p.image_url || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80'} alt={p.name}
                      className="resto-card-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 className="resto-font" style={{ color: CREAM, fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>{p.name}</h3>
                    <span className="resto-font" style={{ color: GOLD, fontSize: '18px', fontWeight: 700 }}>
                      {p.price?.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === NOTRE HISTOIRE (À propos) === */}
        {activeTab === 'profil' && (
          <div className="resto-fade">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p className="resto-body" style={{ color: GOLD, fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 12px' }}>Notre établissement</p>
              <h2 className="resto-font" style={{ color: CREAM, fontSize: 'clamp(22px,3.5vw,42px)', fontWeight: 400, margin: '0 0 16px' }}>Notre Histoire</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
                <ChefHat size={16} color={GOLD} />
                <div style={{ width: 40, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Left: Story */}
              <div style={{ border: `1px solid rgba(212,175,55,0.2)`, padding: '32px', background: '#1a0d00', borderRadius: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <Wine size={18} color={GOLD} />
                  <h3 className="resto-body" style={{ color: GOLD, fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>Notre Passion</h3>
                </div>
                <p className="resto-font" style={{ color: '#D4C5A9', fontSize: '15px', lineHeight: 1.9, fontStyle: 'italic', margin: '0 0 24px' }}>
                  {store.description || 'Notre établissement est né de la passion pour la gastronomie authentique. Chaque plat est préparé avec soin, en utilisant les meilleurs ingrédients locaux pour offrir une expérience culinaire inoubliable.'}
                </p>
                {store.whatsapp_number && (
                  <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank"
                    className="resto-body resto-btn-gold"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 4, textDecoration: 'none', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', transition: 'all 0.2s' }}>
                    <MessageCircle size={14} /> Réserver une table
                  </a>
                )}
              </div>

              {/* Right: Contact info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { icon: <MapPin size={18} color={GOLD} />, label: 'Localisation', value: store.city || 'Non renseignée', action: handleDirections },
                  { icon: <MessageCircle size={18} color={GOLD} />, label: 'Réservation WhatsApp', value: store.whatsapp_number || 'Non renseigné', href: store.whatsapp_number ? `https://wa.me/${store.whatsapp_number}` : null },
                  { icon: <Clock3 size={18} color={GOLD} />, label: 'Temps de réponse', value: store.response_time || '< 2h', action: null },
                  { icon: <Star size={18} color={GOLD} fill={GOLD} />, label: 'Satisfaction clients', value: `${store.positive_rating ?? 100}%`, action: null },
                ].map((item, i) => (
                  <div key={i} style={{ border: `1px solid rgba(212,175,55,0.15)`, padding: '20px 24px', background: '#1a0d00', display: 'flex', gap: 16, alignItems: 'center', borderRadius: 4 }}>
                    <div style={{ width: 44, height: 44, background: 'rgba(212,175,55,0.1)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="resto-body" style={{ color: '#8B7355', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px' }}>{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target="_blank" className="resto-body" style={{ color: CREAM, fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>{item.value}</a>
                      ) : (
                        <p className="resto-body" style={{ color: CREAM, fontSize: '14px', fontWeight: 500, margin: 0 }}>{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
