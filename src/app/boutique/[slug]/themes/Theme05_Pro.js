'use client';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {
  MapPin, MessageCircle, Share2, CheckCircle2, Star, Clock,
  Package, Search, ChevronRight, Navigation, Wrench, Hammer,
  Truck, Shield, AlertCircle, Tag, ChevronDown, Grid, List
} from 'lucide-react';

const NAVY = '#003087';
const ORANGE = '#FF6B00';
const LIGHT_BLUE = '#0052CC';
const BG = '#F4F6F9';
const WHITE = '#FFFFFF';
const DARK = '#1A1A2E';
const GRAY = '#6B7280';

export default function Theme05_Pro({
  store, products, categories, stats, storeInfo,
  filteredProducts, groupedProducts, activeTab, setActiveTab,
  activeFilter, setActiveFilter, search, setSearch,
  handleShare, handleDirections, shared, trackProductView, formatDistance, totalProducts,
  shop_tabs,
}) {
  const tabs = [
    { id: 'accueil', label: shop_tabs?.accueil || 'Accueil', icon: <Grid size={14} /> },
    { id: 'produits', label: `${shop_tabs?.produits || 'Catalogue'} (${totalProducts})`, icon: <List size={14} /> },
    { id: 'promotions', label: shop_tabs?.promotions || 'Offres Pro', icon: <Tag size={14} /> },
    { id: 'profil', label: shop_tabs?.profil || 'Infos & Contact', icon: <Shield size={14} /> },
  ];

  return (
    <main style={{ background: BG, fontFamily: "'Roboto Condensed', 'Arial Narrow', Arial, sans-serif", minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap');
        .pro-font { font-family: 'Roboto Condensed', Arial, sans-serif; }
        .pro-body { font-family: 'Roboto', Arial, sans-serif; }
        .pro-card { transition: all 0.2s ease; cursor: pointer; }
        .pro-card:hover { box-shadow: 0 4px 24px rgba(0,48,135,0.15); transform: translateY(-2px); }
        .pro-card:hover .pro-img { transform: scale(1.05); }
        .pro-btn-orange { background: ${ORANGE}; color: white; transition: all 0.2s; }
        .pro-btn-orange:hover { background: #E55A00; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(255,107,0,0.4); }
        .pro-btn-navy { background: ${NAVY}; color: white; transition: all 0.2s; }
        .pro-btn-navy:hover { background: #002060; transform: translateY(-1px); }
        .pro-tab-active { background: ${ORANGE} !important; color: white !important; }
        @keyframes proFade { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        .pro-fade { animation: proFade 0.3s ease forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .pro-badge-orange { background: ${ORANGE}; color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; letter-spacing: 1px; text-transform: uppercase; }
        .pro-badge-navy { background: ${NAVY}; color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; letter-spacing: 1px; text-transform: uppercase; }
      `}</style>

      {/* ── TOP UTILITY BAR ── */}
      <div style={{ background: DARK, padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="pro-body" style={{ color: '#9CA3AF', fontSize: '12px' }}>
            <Truck size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Livraison pro disponible
          </span>
          {store.store_code && (
            <span className="pro-body" style={{ color: '#9CA3AF', fontSize: '12px' }}>
              Code boutique: <strong style={{ color: ORANGE }}>#{store.store_code}</strong>
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span className="pro-body" style={{ color: '#9CA3AF', fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} color="#10B981" /> Fournisseur vérifié
          </span>
          <button onClick={handleShare} style={{ background: 'none', border: 'none', color: shared ? '#10B981' : '#9CA3AF', cursor: 'pointer' }}>
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <div style={{ background: NAVY, padding: '0 24px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 0', justifyContent: 'space-between', flexWrap: 'wrap' }}>

            {/* Logo + Name + Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, background: WHITE, borderRadius: 4, overflow: 'hidden', border: `3px solid ${ORANGE}`, flexShrink: 0 }}>
                <img src={store.logo_url || 'https://via.placeholder.com/64'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={store.name} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Wrench size={14} color={ORANGE} />
                  <span className="pro-body" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>Commerce Professionnel</span>
                </div>
                <h1 className="pro-font" style={{ color: WHITE, fontSize: 'clamp(20px,3vw,36px)', fontWeight: 900, margin: 0, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  {store.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                  {store.city && (
                    <span className="pro-body" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} /> {store.city}
                    </span>
                  )}
                  {store.supplier_level && store.supplier_level !== 'Nouveau Vendeur' && (
                    <span className="pro-badge-orange">{store.supplier_level}</span>
                  )}
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { label: 'Produits', value: totalProducts, icon: <Package size={18} color={ORANGE} /> },
                { label: 'Satisfaction', value: `${store.positive_rating ?? 100}%`, icon: <Star size={18} color={ORANGE} /> },
                { label: 'Réponse', value: store.response_time || '< 2h', icon: <Clock size={18} color={ORANGE} /> },
              ].map((kpi, i) => (
                <div key={i} style={{ textAlign: 'center', minWidth: 70 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{kpi.icon}</div>
                  <div className="pro-font" style={{ color: WHITE, fontSize: '20px', fontWeight: 800 }}>{kpi.value}</div>
                  <div className="pro-body" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {store.whatsapp_number && (
                <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank"
                  className="pro-font pro-btn-orange"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 4, textDecoration: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  <MessageCircle size={16} /> Devis Pro
                </a>
              )}
              <button onClick={handleDirections}
                className="pro-font"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'transparent', border: `2px solid ${ORANGE}`, color: ORANGE, borderRadius: 4, fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}>
                <Navigation size={16} /> Itinéraire
              </button>
            </div>
          </div>

          {/* Navigation tabs */}
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.1)' }} className="no-scrollbar">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`pro-font ${activeTab === tab.id ? 'pro-tab-active' : ''}`}
                style={{
                  padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
                  color: activeTab === tab.id ? WHITE : 'rgba(255,255,255,0.6)',
                  fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                  whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s',
                  borderRadius: activeTab === tab.id ? '4px 4px 0 0' : 0,
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BANNER (only on accueil) ── */}
      {activeTab === 'accueil' && store.banner_url && (
        <div style={{ height: 'clamp(160px,25vh,280px)', overflow: 'hidden', position: 'relative' }}>
          <img src={store.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} alt="" />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${NAVY}CC 0%, transparent 70%)` }} />
          {store.custom_message && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 40px', maxWidth: 700 }}>
              <p className="pro-font" style={{ color: WHITE, fontSize: 'clamp(14px,2vw,22px)', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {store.custom_message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* === ACCUEIL === */}
        {activeTab === 'accueil' && (
          <div className="pro-fade">
            {/* Pro features strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 40 }}>
              {[
                { icon: <Truck size={20} color={NAVY} />, title: 'Livraison Pro', desc: 'Disponible sur demande' },
                { icon: <Tag size={20} color={NAVY} />, title: 'Prix Gros', desc: 'Tarifs professionnels' },
                { icon: <Shield size={20} color={NAVY} />, title: 'Fournisseur Vérifié', desc: 'Certifié VesTyle' },
                { icon: <MessageCircle size={20} color={NAVY} />, title: 'Devis Rapide', desc: `Rép. en ${store.response_time || '< 2h'}` },
              ].map((feat, i) => (
                <div key={i} style={{ background: WHITE, border: `1px solid #E5E7EB`, borderLeft: `4px solid ${NAVY}`, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center', borderRadius: 4 }}>
                  <div style={{ flexShrink: 0, width: 40, height: 40, background: '#EBF0FF', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {feat.icon}
                  </div>
                  <div>
                    <p className="pro-font" style={{ color: DARK, fontSize: '13px', fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{feat.title}</p>
                    <p className="pro-body" style={{ color: GRAY, fontSize: '11px', margin: 0 }}>{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Products by category */}
            {Object.keys(groupedProducts).length === 0 ? (
              <div style={{ background: WHITE, border: `2px dashed #E5E7EB`, padding: '60px 20px', textAlign: 'center', borderRadius: 4 }}>
                <Package size={48} color="#E5E7EB" style={{ margin: '0 auto 16px' }} />
                <h3 className="pro-font" style={{ color: DARK, fontSize: '18px', margin: '0 0 8px', textTransform: 'uppercase' }}>Catalogue en cours de mise à jour</h3>
                <p className="pro-body" style={{ color: GRAY, margin: 0 }}>Les produits seront disponibles prochainement.</p>
              </div>
            ) : (
              Object.entries(groupedProducts).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: 48 }}>
                  {/* Section header — industrial style */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '10px 16px', background: NAVY, borderRadius: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Wrench size={16} color={ORANGE} />
                      <h2 className="pro-font" style={{ color: WHITE, fontSize: '14px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
                        {cat}
                      </h2>
                      <span className="pro-badge-orange">{items.length} réf.</span>
                    </div>
                    <button onClick={() => { setActiveTab('produits'); setActiveFilter(cat); }}
                      className="pro-body"
                      style={{ background: 'none', border: 'none', color: ORANGE, fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Voir tout <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Product grid — industrial card style */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                    {items.slice(0, 8).map((p) => (
                      <div key={p.id} className="pro-card" style={{ background: WHITE, border: '1px solid #E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: 180, overflow: 'hidden', position: 'relative', background: '#F9FAFB' }}>
                          <img src={p.image_url || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80'} alt={p.name}
                            className="pro-img"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, transition: 'transform 0.3s', boxSizing: 'border-box' }} />
                          {p.is_boosted && (
                            <div style={{ position: 'absolute', top: 8, left: 8 }}>
                              <span className="pro-badge-orange">Promo</span>
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '12px 14px', borderTop: '1px solid #F3F4F6' }}>
                          <p className="pro-font" style={{ color: DARK, fontSize: '13px', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.3 }}>
                            {p.name}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <span className="pro-font" style={{ color: ORANGE, fontSize: '16px', fontWeight: 800 }}>
                              {p.price?.toLocaleString('fr-FR')} <span style={{ fontSize: 10, fontWeight: 500 }}>FCFA</span>
                            </span>
                            {store.whatsapp_number && (
                              <a href={`https://wa.me/${store.whatsapp_number}?text=Bonjour, je m'intéresse au produit: ${p.name}`} target="_blank"
                                className="pro-body"
                                style={{ background: NAVY, color: WHITE, padding: '5px 10px', fontSize: '10px', fontWeight: 700, textDecoration: 'none', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Devis
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* === CATALOGUE (search + filter) === */}
        {activeTab === 'produits' && (
          <div className="pro-fade">
            {/* Search bar — industrial style */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={16} color={GRAY} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={`Rechercher une référence parmi ${totalProducts} produits...`}
                  className="pro-body"
                  style={{ width: '100%', padding: '13px 14px 13px 42px', background: WHITE, border: `2px solid #E5E7EB`, color: DARK, fontSize: '14px', outline: 'none', borderRadius: 4, boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = NAVY}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
              </div>
              {search && (
                <button onClick={() => setSearch('')}
                  className="pro-font pro-btn-orange"
                  style={{ padding: '12px 20px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                  Effacer
                </button>
              )}
            </div>

            {/* Category tabs as dropdown-style pills */}
            {categories.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {['all', ...categories].map(cat => (
                  <button key={cat} onClick={() => setActiveFilter(cat)}
                    className={`pro-font ${activeFilter === cat ? 'pro-btn-orange' : ''}`}
                    style={{
                      padding: '8px 16px', border: `2px solid ${activeFilter === cat ? ORANGE : '#E5E7EB'}`,
                      background: activeFilter === cat ? ORANGE : WHITE,
                      color: activeFilter === cat ? WHITE : GRAY,
                      fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '1px', borderRadius: 4
                    }}>
                    {cat === 'all' ? `Tout (${totalProducts})` : cat}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '10px 14px', background: WHITE, border: '1px solid #E5E7EB', borderRadius: 4 }}>
              <span className="pro-font" style={{ color: DARK, fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
                {filteredProducts.length} référence{filteredProducts.length > 1 ? 's' : ''} trouvée{filteredProducts.length > 1 ? 's' : ''}
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div style={{ background: WHITE, border: `2px dashed #E5E7EB`, padding: '60px 20px', textAlign: 'center', borderRadius: 4 }}>
                <AlertCircle size={40} color="#E5E7EB" style={{ margin: '0 auto 12px' }} />
                <p className="pro-font" style={{ color: GRAY, textTransform: 'uppercase', fontWeight: 700 }}>Aucun résultat pour votre recherche</p>
                <button onClick={() => { setSearch(''); setActiveFilter('all'); }} className="pro-font pro-btn-navy" style={{ marginTop: 16, padding: '10px 24px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                  Réinitialiser
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {filteredProducts.map((p, idx) => (
                  <div key={p.id} className="pro-card" style={{ background: WHITE, border: '1px solid #E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: 180, overflow: 'hidden', position: 'relative', background: '#F9FAFB' }}>
                      <img src={p.image_url || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80'} alt={p.name}
                        className="pro-img"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, transition: 'transform 0.3s', boxSizing: 'border-box' }} />
                      {p.is_boosted && (
                        <div style={{ position: 'absolute', top: 8, left: 8 }}>
                          <span className="pro-badge-orange">Promo</span>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '12px 14px', borderTop: '1px solid #F3F4F6' }}>
                      <p className="pro-font" style={{ color: DARK, fontSize: '13px', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.name}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span className="pro-font" style={{ color: ORANGE, fontSize: '16px', fontWeight: 800 }}>
                          {p.price?.toLocaleString('fr-FR')} <span style={{ fontSize: 10, fontWeight: 500 }}>FCFA</span>
                        </span>
                        {store.whatsapp_number && (
                          <a href={`https://wa.me/${store.whatsapp_number}?text=Bonjour, je souhaite un devis pour: ${p.name}`} target="_blank"
                            className="pro-body"
                            style={{ background: NAVY, color: WHITE, padding: '5px 10px', fontSize: '10px', fontWeight: 700, textDecoration: 'none', borderRadius: 2, textTransform: 'uppercase' }}>
                            Devis
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === OFFRES PRO === */}
        {activeTab === 'promotions' && (
          <div className="pro-fade">
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${LIGHT_BLUE} 100%)`, padding: '40px', marginBottom: 32, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ width: 64, height: 64, background: ORANGE, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Tag size={28} color={WHITE} />
              </div>
              <div>
                <h2 className="pro-font" style={{ color: WHITE, fontSize: 'clamp(18px,3vw,30px)', fontWeight: 900, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  Offres Professionnelles
                </h2>
                <p className="pro-body" style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>
                  {store.custom_message || 'Tarifs spéciaux pour professionnels et achats en gros. Contactez-nous pour un devis personnalisé.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {(products.filter(p => p.is_boosted).length > 0 ? products.filter(p => p.is_boosted) : products.slice(0, 8)).map((p) => (
                <div key={p.id} className="pro-card" style={{ background: WHITE, border: `2px solid ${ORANGE}`, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ background: ORANGE, padding: '6px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="pro-font" style={{ color: WHITE, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Offre Pro</span>
                    <Tag size={12} color={WHITE} />
                  </div>
                  <div style={{ height: 180, overflow: 'hidden', background: '#F9FAFB' }}>
                    <img src={p.image_url || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80'} alt={p.name}
                      className="pro-img"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, transition: 'transform 0.3s', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <p className="pro-font" style={{ color: DARK, fontSize: '14px', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase' }}>{p.name}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="pro-font" style={{ color: ORANGE, fontSize: '18px', fontWeight: 900 }}>
                        {p.price?.toLocaleString('fr-FR')} FCFA
                      </span>
                      {store.whatsapp_number && (
                        <a href={`https://wa.me/${store.whatsapp_number}?text=Bonjour, je souhaite un devis pro pour: ${p.name}`} target="_blank"
                          className="pro-font pro-btn-navy"
                          style={{ padding: '7px 14px', border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '11px', fontWeight: 700, textDecoration: 'none', display: 'inline-block', textTransform: 'uppercase' }}>
                          Devis
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === INFOS & CONTACT === */}
        {activeTab === 'profil' && (
          <div className="pro-fade">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

              {/* Company info */}
              <div style={{ background: WHITE, border: '1px solid #E5E7EB', borderRadius: 4, padding: '28px', borderTop: `4px solid ${NAVY}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <div style={{ width: 36, height: 36, background: '#EBF0FF', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={18} color={NAVY} />
                  </div>
                  <h2 className="pro-font" style={{ color: DARK, fontSize: '16px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Fiche Fournisseur</h2>
                </div>

                <p className="pro-body" style={{ color: GRAY, fontSize: '14px', lineHeight: 1.7, margin: '0 0 24px' }}>
                  {store.description || 'Fournisseur professionnel spécialisé dans la distribution de produits de qualité. Nous proposons des tarifs compétitifs pour les professionnels et les achats en gros.'}
                </p>

                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    { label: 'Localisation', value: store.city || 'Non renseignée', icon: <MapPin size={14} color={NAVY} /> },
                    { label: 'Niveau fournisseur', value: store.supplier_level || 'Fournisseur', icon: <Star size={14} color={NAVY} /> },
                    { label: 'Taux de satisfaction', value: `${store.positive_rating ?? 100}%`, icon: <CheckCircle2 size={14} color="#10B981" /> },
                    { label: 'Délai de réponse', value: store.response_time || '< 2h', icon: <Clock size={14} color={NAVY} /> },
                  ].map((info, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F9FAFB', borderRadius: 4, border: '1px solid #F3F4F6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {info.icon}
                        <span className="pro-body" style={{ color: GRAY, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{info.label}</span>
                      </div>
                      <span className="pro-font" style={{ color: DARK, fontSize: '13px', fontWeight: 700 }}>{info.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact + Location */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Contact card */}
                <div style={{ background: WHITE, border: '1px solid #E5E7EB', borderRadius: 4, padding: '28px', borderTop: `4px solid ${ORANGE}` }}>
                  <h3 className="pro-font" style={{ color: DARK, fontSize: '14px', fontWeight: 800, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact Commercial</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {store.whatsapp_number && (
                      <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank"
                        className="pro-body pro-btn-orange"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px', borderRadius: 4, textDecoration: 'none', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <MessageCircle size={18} /> Envoyer un devis WhatsApp
                      </a>
                    )}
                    <button onClick={handleDirections}
                      className="pro-font pro-btn-navy"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      <MapPin size={18} /> Voir sur la carte
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ background: NAVY, borderRadius: 4, padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Références', value: totalProducts, unit: 'produits' },
                    { label: 'Satisfaction', value: `${store.positive_rating ?? 100}%`, unit: 'clients' },
                    { label: 'Commandes', value: stats.totalSold || 0, unit: 'livrées' },
                    { label: 'Vues boutique', value: stats.totalViews || 0, unit: 'visites' },
                  ].map((stat, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                      <div className="pro-font" style={{ color: ORANGE, fontSize: '24px', fontWeight: 900, lineHeight: 1 }}>{stat.value}</div>
                      <div className="pro-body" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 4 }}>{stat.unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
