'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

/**
 * TemplateTechPro — Boutique Électronique & High-Tech Flagship
 * ─────────────────────────────────────────────────────────────
 * Design : Dark premium · Glassmorphisme · Micro-animations CSS
 * Pages  : Accueil · Catalogue · Offres Flash · Fiche Produit · Garantie · Panier
 * Spécialité : Smartphones · Laptops · TV · Électroménager · Gaming
 */


const BADGE_COLORS = { 'Nouveauté': '#2563EB', 'Top Vente': '#059669', 'Pro': '#7C3AED', 'Promo': '#DC2626', 'Bundle': '#D97706', 'Énergie A+++': '#0D9488', 'Promo Flash': '#EA580C' };


// ─── Composant Rating ─────────────────────────────────────────────────────────
function Stars({ n }) {
  return (
    <span style={{ fontSize: 10, letterSpacing: 1, color: '#F59E0B' }}>
      {'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))}
    </span>
  );
}

// ─── Template principal ───────────────────────────────────────────────────────
export default function TemplateTechPro({ store, themeVars, currency = 'FCFA', productsProp, isMobile, onAddToCart }) {
  // ── Navigation ──
  const [page, setPage] = useState('accueil');
  const [slideIdx, setSlideIdx] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // ── Catalogue ──
  const [catFilter, setCatFilter] = useState('Tous');
  const [brandFilter, setBrandFilter] = useState('Toutes');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  // ── Fiche produit ──
  const [openProduct, setOpenProduct] = useState(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');

  // ── Panier ──
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedId, setAddedId] = useState(null);

  // ── Flash ──
  const [flash, setFlash] = useState({ h: 11, m: 47, s: 23 });

  // ── Config boutique ──
  const storeName = store?.name || 'TECHPRO HIGH-TECH';
  const storePhone = (store?.phone || store?.whatsapp_number || '').replace(/\D/g, '');
  const storeDesc = store?.description || 'Vente de smartphones, laptops, TV 4K & électroménager. Garantie 1 an officielle. SAV Douala & Yaoundé.';
  const logoUrl = store?.logo_url || null;
  const wa = storePhone ? `https://wa.me/${storePhone}` : '#';
  const fmt = v => new Intl.NumberFormat('fr-FR').format(v || 0) + ' ' + currency;

  const primary = themeVars?.['--prim'] || '#2563EB';
  const accent = themeVars?.['--acc'] || '#F59E0B';

  // ── Vrais produits uniquement — zéro faux contenu ──
  const products = useMemo(() => (productsProp || []), [productsProp]);
  const hasProducts = products.length > 0;

  // ── Slides depuis layout_config ou hero sobre avec les vraies données boutique ──
  const heroSlides = useMemo(() => {
    const configured = store?.layout_config?.hero_slides;
    if (configured?.length > 0) return configured;
    // Hero sobre par défaut : juste le banner de la boutique
    return [{
      title: storeName,
      sub: storeDesc,
      badge: '⚡ Boutique Officielle',
      img: store?.banner_url || store?.logo_url || null,
      color: '#09090B',
      accent: primary,
      emoji: '⚡',
    }];
  }, [store, storeName, storeDesc, primary]);

  // ── Slides auto ──
  useEffect(() => {
    if (page !== 'accueil' || heroSlides.length <= 1) return;
    const t = setInterval(() => setSlideIdx(i => (i + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, [page, heroSlides.length]);

  // ── Flash countdown ──
  useEffect(() => {
    const t = setInterval(() => setFlash(prev => {
      if (prev.s > 0) return { ...prev, s: prev.s - 1 };
      if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
      if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
      return { h: 23, m: 59, s: 59 };
    }), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Scroll ──
  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // ── Panier ──
  const addCart = useCallback((prod) => {
    setCart(c => {
      const k = prod.id + (selectedColor || '') + (selectedStorage || '');
      const ex = c.find(i => i._key === k);
      if (ex) return c.map(i => i._key === k ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...prod, _key: k, selectedColor: selectedColor || prod.colors?.[0], selectedStorage: selectedStorage || prod.storages?.[0], qty: 1 }];
    });
    if (onAddToCart) onAddToCart(prod);
    setAddedId(prod.id);
    setTimeout(() => setAddedId(null), 2000);
    setCartOpen(true);
    setOpenProduct(null);
  }, [selectedColor, selectedStorage, onAddToCart]);

  const removeCart = (key) => setCart(c => c.filter(i => i._key !== key));
  const changeQty = (key, d) => setCart(c => c.map(i => i._key === key ? { ...i, qty: Math.max(1, i.qty + d) } : i));
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // ── WhatsApp ──
  const waMsg = () => {
    if (!cart.length) return '#';
    let msg = `Bonjour *${storeName}* 👋\n\nJe souhaite commander :\n\n`;
    cart.forEach((i, n) => {
      msg += `${n + 1}. *${i.name}*\n`;
      if (i.selectedColor) msg += `   Couleur : ${i.selectedColor}\n`;
      if (i.selectedStorage) msg += `   Stockage : ${i.selectedStorage}\n`;
      msg += `   Quantité : ${i.qty} × ${fmt(i.price)} = *${fmt(i.price * i.qty)}*\n\n`;
    });
    msg += `💰 *TOTAL : ${fmt(cartTotal)}*\n🛡 Garantie 1 An Officielle\n\nMerci de confirmer la disponibilité et le mode de livraison.`;
    return `https://wa.me/${storePhone}?text=${encodeURIComponent(msg)}`;
  };

  // ── Catégories & Marques dynamiques depuis les vrais produits ──
  const dynamicCategories = useMemo(() => {
    const cats = ['Tous', ...new Set(products.map(p => p.category).filter(Boolean))];
    return cats;
  }, [products]);

  const dynamicBrands = useMemo(() => {
    const brands = ['Toutes', ...new Set(products.map(p => p.brand).filter(Boolean))];
    return brands;
  }, [products]);

  // ── Catalogue filtré ──
  const filtered = useMemo(() => {
    let r = products;
    if (catFilter !== 'Tous') r = r.filter(p => p.category === catFilter);
    if (brandFilter !== 'Toutes') r = r.filter(p => (p.brand || '').toLowerCase() === brandFilter.toLowerCase());
    if (search.trim()) r = r.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand || '').toLowerCase().includes(search.toLowerCase()));
    if (sortBy === 'price_asc') r = [...r].sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') r = [...r].sort((a, b) => b.price - a.price);
    if (sortBy === 'promo') r = [...r].sort((a, b) => (b.discount || 0) - (a.discount || 0));
    return r;
  }, [products, catFilter, brandFilter, search, sortBy]);

  const flashProds = useMemo(() => products.filter(p => p.is_promo || (p.original_price > p.price)).slice(0, 4), [products]);

  const navGo = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // ─────────────────────────────────────────────────────────────────────────────
  // CSS INLINE — Design système complet
  // ─────────────────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');

    :root {
      --primary: ${primary};
      --accent: ${accent};
      --bg:     #09090B;
      --surface: #111116;
      --surface2: #18181D;
      --border: rgba(255,255,255,0.07);
      --text:  #F4F4F5;
      --muted: #71717A;
      --radius: 20px;
    }

    .tp { font-family:'Plus Jakarta Sans',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; }
    .tp * { box-sizing:border-box; margin:0; padding:0; }

    /* ── Header ── */
    .tp-header {
      position: sticky; top: 0; z-index: 100;
      transition: all .3s;
    }
    .tp-header.scrolled {
      background: rgba(9,9,11,0.88);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 4px 32px rgba(0,0,0,0.5);
    }
    .tp-header.top { background: transparent; }
    .tp-header-inner {
      max-width: 1200px; margin: 0 auto;
      padding: 0 20px; height: 64px;
      display: flex; align-items: center; gap: 16px;
    }

    /* ── Nav pills ── */
    .tp-nav { display: flex; align-items: center; gap: 2px; }
    .tp-nav-btn {
      padding: 7px 14px; border-radius: 12px; border: none;
      background: transparent; color: #A1A1AA;
      font-size: 13px; font-weight: 700; cursor: pointer;
      font-family: inherit; transition: all .2s;
    }
    .tp-nav-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }
    .tp-nav-btn.active { background: var(--primary); color: #fff; box-shadow: 0 4px 16px rgba(37,99,235,0.4); }
    .tp-nav-btn.flash-nav { color: #F59E0B; }
    .tp-nav-btn.flash-nav:hover, .tp-nav-btn.flash-nav.active { background: #F59E0B; color: #000; }

    /* ── Hero ── */
    .tp-hero {
      position: relative; height: 520px; overflow: hidden;
      display: flex; align-items: center;
    }
    .tp-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: all 1.2s; }
    .tp-hero-grad { position: absolute; inset: 0; }
    .tp-hero-content { position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; padding: 0 24px; }

    /* ── Cards produit ── */
    .tp-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      transition: all .3s cubic-bezier(.4,0,.2,1);
      cursor: pointer;
      position: relative;
    }
    .tp-card:hover {
      transform: translateY(-6px);
      border-color: var(--primary);
      box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px var(--primary);
    }
    .tp-card-img {
      width: 100%; aspect-ratio: 1; object-fit: cover;
      background: #0D0D12; transition: transform .5s;
    }
    .tp-card:hover .tp-card-img { transform: scale(1.05); }

    /* ── Badge ── */
    .tp-badge {
      display: inline-flex; align-items: center;
      padding: 3px 10px; border-radius: 99px;
      font-size: 10px; font-weight: 900; letter-spacing: .03em;
      text-transform: uppercase;
    }

    /* ── Boutons ── */
    .tp-btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 13px 24px; border-radius: 14px; border: none;
      background: var(--primary); color: #fff;
      font-family: inherit; font-size: 13px; font-weight: 800; cursor: pointer;
      box-shadow: 0 8px 28px rgba(37,99,235,0.4); transition: all .2s;
    }
    .tp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(37,99,235,0.55); }
    .tp-btn-primary:active { transform: scale(.98); }
    .tp-btn-secondary {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 13px 24px; border-radius: 14px;
      background: rgba(255,255,255,0.06); color: #fff;
      border: 1px solid rgba(255,255,255,0.1);
      font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
      transition: all .2s;
    }
    .tp-btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
    .tp-btn-whatsapp {
      background: #25D366; color: #fff; box-shadow: 0 8px 28px rgba(37,211,102,0.35);
    }
    .tp-btn-whatsapp:hover { background: #1EBE5A; box-shadow: 0 12px 36px rgba(37,211,102,0.5); }

    /* ── Flash countdown ── */
    .tp-digit {
      width: 42px; height: 42px; border-radius: 12px;
      background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 900; font-feature-settings: 'tnum';
    }

    /* ── Panier drawer ── */
    .tp-drawer-overlay {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
    }
    .tp-drawer {
      position: fixed; top: 0; right: 0; bottom: 0; z-index: 201;
      width: min(420px, 100%); background: var(--surface);
      border-left: 1px solid var(--border);
      display: flex; flex-direction: column;
      box-shadow: -24px 0 80px rgba(0,0,0,0.6);
    }

    /* ── Section titre ── */
    .tp-section-title {
      font-size: 22px; font-weight: 900; letter-spacing: -0.03em;
    }

    /* ── Input search ── */
    .tp-search {
      width: 100%; padding: 10px 16px 10px 40px;
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: 14px; color: var(--text); font-family: inherit;
      font-size: 13px; font-weight: 600; outline: none; transition: all .2s;
    }
    .tp-search:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.2); }
    .tp-search::placeholder { color: var(--muted); }

    /* ── Rating ── */
    .tp-rating { display: flex; align-items: center; gap: 5px; }

    /* ── Animaion bouton "Ajouté" ── */
    .tp-added { animation: tp-pop .3s cubic-bezier(.34,1.56,.64,1); }
    @keyframes tp-pop { 0%{transform:scale(.8)} 100%{transform:scale(1)} }

    /* ── Glassmorphisme card hover ── */
    .tp-glass {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
      border-radius: var(--radius);
    }

    /* ── Mobile ── */
    @media (max-width: 640px) {
      .tp-hero { height: 380px; }
      .tp-hero-title { font-size: 28px !important; }
    }

    /* ── Scrollbar custom ── */
    .tp ::-webkit-scrollbar { width: 4px; }
    .tp ::-webkit-scrollbar-track { background: transparent; }
    .tp ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 99px; }

    /* ── Slide dots ── */
    .tp-dot { width: 8px; height: 8px; border-radius: 99px; border: none; cursor: pointer; transition: all .3s; }
    .tp-dot.active { width: 28px; background: var(--primary); }
    .tp-dot.inactive { background: rgba(255,255,255,0.25); }
    .tp-dot.inactive:hover { background: rgba(255,255,255,0.5); }

    /* ── Chip / pill filter ── */
    .tp-chip {
      padding: 7px 16px; border-radius: 99px; border: none;
      font-family: inherit; font-size: 12px; font-weight: 800; cursor: pointer;
      transition: all .2s; white-space: nowrap;
    }
    .tp-chip.active { background: var(--primary); color: #fff; box-shadow: 0 4px 16px rgba(37,99,235,0.35); }
    .tp-chip.inactive { background: var(--surface2); color: var(--muted); border: 1px solid var(--border); }
    .tp-chip.inactive:hover { border-color: rgba(255,255,255,0.2); color: #fff; }

    /* ── Product grid ── */
    .tp-grid { display: grid; gap: 16px; }
    .tp-grid-3 { grid-template-columns: repeat(3, 1fr); }
    .tp-grid-2 { grid-template-columns: repeat(2, 1fr); }
    .tp-grid-1 { grid-template-columns: 1fr; }
    @media (max-width: 900px) { .tp-grid-3 { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 560px) { .tp-grid-3, .tp-grid-2 { grid-template-columns: 1fr; } }

    /* ── Transition page ── */
    .tp-page { animation: tp-fade .25s ease; }
    @keyframes tp-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    /* ── Spec table ── */
    .tp-spec-row { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
    .tp-spec-row:last-child { border-bottom: none; }
    .tp-spec-key { width: 120px; flex-shrink: 0; font-size: 12px; color: var(--muted); font-weight: 700; }
    .tp-spec-val { font-size: 12px; color: var(--text); font-weight: 700; }

    /* ── Galerie vignettes ── */
    .tp-thumb { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; cursor: pointer; border: 2px solid transparent; transition: all .2s; flex-shrink:0; }
    .tp-thumb.active { border-color: var(--primary); transform: scale(1.08); }
    .tp-thumb:hover { border-color: rgba(255,255,255,0.3); }

    /* ── Footer ── */
    .tp-footer { background: var(--surface); border-top: 1px solid var(--border); padding: 40px 20px; text-align: center; }
  `;

  const slide = heroSlides[slideIdx] || heroSlides[0];

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="tp">
      <style>{css}</style>

      {/* ══════════════════════════════════════════════════════════════
          HEADER STICKY
      ═══════════════════════════════════════════════════════════════ */}
      <header className={`tp-header ${isScrolled ? 'scrolled' : 'top'}`}>
        <div className="tp-header-inner">

          {/* Logo */}
          <button onClick={() => navGo('accueil')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            {logoUrl
              ? <img src={logoUrl} alt="" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
              : <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${primary}, #1d4ed8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⚡</div>
            }
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>{storeName}</div>
              <div style={{ fontSize: 9, color: '#52525B', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>High-Tech Officiel</div>
            </div>
          </button>

          {/* Nav */}
          <nav className="tp-nav" style={{ flex: 1, justifyContent: 'center' }}>
            {[
              { id: 'accueil', label: 'Accueil' },
              { id: 'catalogue', label: 'Catalogue' },
              { id: 'flash', label: '⚡ Ventes Flash', cls: 'flash-nav' },
              { id: 'garantie', label: '🛡 Garantie 1 An' },
            ].map(n => (
              <button key={n.id} className={`tp-nav-btn ${n.cls || ''} ${page === n.id ? 'active' : ''}`} onClick={() => navGo(n.id)}>{n.label}</button>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {storePhone && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="tp-btn-secondary" style={{ padding: '8px 14px', borderRadius: 12, fontSize: 12 }}>
                💬 SAV
              </a>
            )}
            <button onClick={() => setCartOpen(true)} style={{ position: 'relative', width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#fff', transition: 'all .2s' }}>
              🛒
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 99, background: primary, color: '#fff', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #09090B', padding: '0 4px' }}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          PAGE ACCUEIL
      ═══════════════════════════════════════════════════════════════ */}
      {page === 'accueil' && (
        <div className="tp-page">

          {/* ── HERO : Carrousel si slides configurées, sinon hero sobre avec données réelles ── */}
          <section className="tp-hero" style={{ background: slide?.img ? 'transparent' : `linear-gradient(135deg, #09090B 0%, ${primary}20 100%)` }}>
            {slide?.img && <img src={slide.img} alt="" className="tp-hero-img" style={{ filter: 'brightness(0.35)' }} />}
            {slide?.img && <div className="tp-hero-grad" style={{ background: `linear-gradient(90deg, ${slide.color || '#09090B'}E6 0%, ${slide.color || '#09090B'}99 50%, transparent 100%)` }} />}
            {!slide?.img && (
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 20% 50%, ${primary}18 0%, transparent 65%)` }} />
            )}

            <div className="tp-hero-content" style={{ width: '100%' }}>
              <div style={{ maxWidth: 620 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 99, background: `${primary}25`, border: `1px solid ${primary}50`, color: primary, fontSize: 11, fontWeight: 900, marginBottom: 16, letterSpacing: '.04em' }}>
                  {slide?.badge || '⚡ Boutique Officielle'}
                </span>
                <h2 className="tp-hero-title" style={{ fontSize: slide?.img ? 52 : 42, fontWeight: 900, lineHeight: 1.04, letterSpacing: '-0.04em', color: '#fff', marginBottom: 14 }}>
                  {slide?.title || storeName}
                </h2>
                <p style={{ fontSize: 15, color: '#A1A1AA', fontWeight: 600, marginBottom: 28, lineHeight: 1.6 }}>{slide?.sub || storeDesc}</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button className="tp-btn-primary" onClick={() => navGo('catalogue')}>
                    ⚡ Voir le Catalogue →
                  </button>
                  {storePhone && (
                    <button className="tp-btn-secondary tp-btn-whatsapp" style={{ padding: '13px 20px', borderRadius: 14, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer' }} onClick={() => window.open(wa, '_blank')}>
                      💬 WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Indicateurs slides — seulement si plusieurs slides configurées */}
            {heroSlides.length > 1 && (
              <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 3 }}>
                {heroSlides.map((_, i) => (
                  <button key={i} className={`tp-dot ${i === slideIdx ? 'active' : 'inactive'}`} onClick={() => setSlideIdx(i)} />
                ))}
              </div>
            )}

            {heroSlides.length > 1 && [{ dir: -1, label: '‹' }, { dir: 1, label: '›' }].map(({ dir, label }) => (
              <button key={dir} onClick={() => setSlideIdx(i => (i + dir + heroSlides.length) % heroSlides.length)}
                style={{ position: 'absolute', [dir < 0 ? 'left' : 'right']: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: 14, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', transition: 'all .2s', zIndex: 3 }}>
                {label}
              </button>
            ))}
          </section>

          {/* ── TRUST BADGES ── */}
          <section style={{ background: '#111116', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 20px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0 }}>
              {[
                { icon: '🛡️', title: 'Garantie 1 An', sub: 'Officielle Constructeur' },
                { icon: '✅', title: '100% Authentique', sub: 'Certifié d\'origine' },
                { icon: '🔄', title: 'Échange 7 Jours', sub: 'Satisfait ou remboursé' },
                { icon: '🔧', title: 'SAV Douala', sub: 'Techniciens agréés' },
                { icon: '💬', title: 'Réponse rapide', sub: 'WhatsApp < 30 min' },
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', borderRight: i < 4 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <span style={{ fontSize: 22 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#F4F4F5' }}>{b.title}</div>
                    <div style={{ fontSize: 10, color: '#52525B', fontWeight: 600, marginTop: 1 }}>{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── OFFRES FLASH PREVIEW ── */}
          <section style={{ padding: '52px 20px 0', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #F59E0B, #DC2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚡</div>
                <div>
                  <h2 className="tp-section-title">Ventes Flash</h2>
                  <div style={{ fontSize: 12, color: '#71717A', fontWeight: 600 }}>Offres limitées au stock disponible</div>
                </div>
              </div>
              {/* Countdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#71717A', marginRight: 4 }}>Fin dans</span>
                {[flash.h, flash.m, flash.s].map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div className="tp-digit">{String(v).padStart(2, '0')}</div>
                    {i < 2 && <span style={{ color: '#F59E0B', fontWeight: 900, fontSize: 18 }}>:</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Ventes Flash : seulement si des vrais produits en promo */}
            {flashProds.length > 0 ? (
              <div className="tp-grid tp-grid-3" style={{ marginBottom: 52 }}>
                {flashProds.map(prod => {
                  const imgUrl = prod.image_url || prod.image || null;
                  const discountPct = prod.discount || (prod.original_price > prod.price ? Math.round((1 - prod.price / prod.original_price) * 100) : 0);
                  return (
                    <div key={prod.id} className="tp-card" onClick={() => { setOpenProduct(prod); setGalleryIdx(0); setSelectedColor(prod.colors?.[0] || ''); setSelectedStorage(prod.storages?.[0] || ''); }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', gap: 6 }}>
                          {discountPct > 0 && <span className="tp-badge" style={{ background: '#DC2626', color: '#fff' }}>-{discountPct}%</span>}
                        </div>
                        {imgUrl
                          ? <img src={imgUrl} alt={prod.name} className="tp-card-img" />
                          : <div className="tp-card-img" style={{ background: `linear-gradient(135deg, #1a1a2e, ${primary}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>⚡</div>
                        }
                      </div>
                      <div style={{ padding: '16px' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#F4F4F5', lineHeight: 1.3, marginBottom: 8 }}>{prod.name}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
                          <span style={{ fontSize: 18, fontWeight: 900, color: '#F4F4F5' }}>{fmt(prod.price)}</span>
                          {(prod.original_price || prod.originalPrice) && <span style={{ fontSize: 12, color: '#52525B', textDecoration: 'line-through', fontWeight: 700 }}>{fmt(prod.original_price || prod.originalPrice)}</span>}
                        </div>
                        <button className={`tp-btn-primary ${addedId === prod.id ? 'tp-added' : ''}`} style={{ width: '100%', fontSize: 12, padding: '10px' }} onClick={e => { e.stopPropagation(); addCart(prod); }}>
                          {addedId === prod.id ? '✓ Ajouté !' : '+ Ajouter au Panier'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>

          {/* ── CATALOGUE ACCUEIL ou Empty State ── */}
          <section style={{ padding: '0 20px 52px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 className="tp-section-title">Notre Catalogue</h2>
              {hasProducts && (
                <button className="tp-btn-secondary" style={{ fontSize: 12, padding: '8px 16px', borderRadius: 12, fontFamily: 'inherit', cursor: 'pointer' }} onClick={() => navGo('catalogue')}>
                  Tout voir →
                </button>
              )}
            </div>

            {!hasProducts ? (
              /* Empty state élégant — invite à ajouter des produits */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: 28, border: '2px dashed rgba(255,255,255,0.08)' }}>
                <div style={{ width: 80, height: 80, borderRadius: 24, background: `${primary}15`, border: `1px solid ${primary}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 20 }}>📦</div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#F4F4F5', marginBottom: 8, letterSpacing: '-0.02em' }}>Votre catalogue vous attend</h3>
                <p style={{ fontSize: 13, color: '#52525B', fontWeight: 600, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>Ajoutez vos premiers produits depuis le tableau de bord pour qu'ils apparaissent ici automatiquement.</p>
              </div>
            ) : (
              <div className="tp-grid tp-grid-3">
                {products.slice(0, 6).map(prod => {
                  const imgUrl = prod.image_url || prod.image || null;
                  return (
                    <div key={prod.id} className="tp-card" onClick={() => { setOpenProduct(prod); setGalleryIdx(0); setSelectedColor(prod.colors?.[0] || ''); setSelectedStorage(prod.storages?.[0] || ''); }}>
                      <div style={{ position: 'relative' }}>
                        {(prod.is_promo || prod.badge) && (
                          <span className="tp-badge" style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, background: BADGE_COLORS[prod.badge] || '#DC2626', color: '#fff' }}>{prod.badge || 'Promo'}</span>
                        )}
                        {imgUrl
                          ? <img src={imgUrl} alt={prod.name} className="tp-card-img" />
                          : <div className="tp-card-img" style={{ background: `linear-gradient(135deg, #111116, ${primary}20)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📦</div>
                        }
                      </div>
                      <div style={{ padding: '16px' }}>
                        {prod.brand && <div style={{ fontSize: 10, fontWeight: 900, color: primary, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{prod.brand}</div>}
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#F4F4F5', lineHeight: 1.3, marginBottom: 6 }}>{prod.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: '#F4F4F5' }}>{fmt(prod.price)}</div>
                            {(prod.original_price || prod.originalPrice) && <div style={{ fontSize: 11, color: '#52525B', textDecoration: 'line-through' }}>{fmt(prod.original_price || prod.originalPrice)}</div>}
                          </div>
                          <button className="tp-btn-primary" style={{ width: 40, height: 40, padding: 0, borderRadius: 12, fontSize: 18, flexShrink: 0 }} onClick={e => { e.stopPropagation(); addCart(prod); }}>+</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}\n
          </section>

          {/* ── BANDEAU BOUTIQUE ── */}
          <section style={{ margin: '0 20px 52px', borderRadius: 24, background: `linear-gradient(135deg, ${primary}20, ${primary}08)`, border: `1px solid ${primary}30`, padding: '40px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, maxWidth: 1200 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: primary, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>À propos de la boutique</div>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: '#F4F4F5', marginBottom: 8, letterSpacing: '-0.02em' }}>{storeName}</h3>
              <p style={{ fontSize: 13, color: '#71717A', maxWidth: 480, lineHeight: 1.6, fontWeight: 600 }}>{storeDesc}</p>
            </div>
            {storePhone && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="tp-btn-primary tp-btn-whatsapp" style={{ flexShrink: 0, textDecoration: 'none', borderRadius: 16 }}>
                💬 Nous contacter sur WhatsApp
              </a>
            )}
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          PAGE CATALOGUE
      ═══════════════════════════════════════════════════════════════ */}
      {page === 'catalogue' && (
        <div className="tp-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 52px' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#F4F4F5', marginBottom: 6, letterSpacing: '-0.03em' }}>Catalogue</h1>
            <p style={{ fontSize: 13, color: '#71717A', fontWeight: 600 }}>{filtered.length} produit{filtered.length > 1 ? 's' : ''} disponibles</p>
          </div>

          {/* Recherche + tri */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#52525B', fontSize: 16 }}>🔍</span>
              <input className="tp-search" placeholder="Chercher un produit, une marque..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select
              value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 14, background: '#18181D', border: '1px solid rgba(255,255,255,0.07)', color: '#F4F4F5', fontSize: 12, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
            >
              <option value="popular">Les plus populaires</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="promo">Meilleures promos</option>
            </select>
          </div>

          {/* Filtres catégories dynamiques depuis les vrais produits */}
          {dynamicCategories.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 12 }}>
              {dynamicCategories.map(c => (
                <button key={c} className={`tp-chip ${catFilter === c ? 'active' : 'inactive'}`} onClick={() => setCatFilter(c)}>{c}</button>
              ))}
            </div>
          )}

          {/* Filtres marques dynamiques */}
          {dynamicBrands.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 28 }}>
              {dynamicBrands.map(b => (
                <button key={b} className={`tp-chip ${brandFilter === b ? 'active' : 'inactive'}`} style={{ fontSize: 11 }} onClick={() => setBrandFilter(b)}>{b}</button>
              ))}
            </div>
          )}

          {!hasProducts ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📦</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#F4F4F5', marginBottom: 8 }}>Aucun produit pour le moment</div>
              <p style={{ fontSize: 13, color: '#52525B', fontWeight: 600, textAlign: 'center', maxWidth: 340, lineHeight: 1.6 }}>Ajoutez vos produits depuis le tableau de bord, ils apparaîtront ici instantanément.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#52525B' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔎</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#71717A', marginBottom: 8 }}>Aucun produit trouvé</div>
              <button className="tp-btn-primary" style={{ marginTop: 16 }} onClick={() => { setCatFilter('Tous'); setBrandFilter('Toutes'); setSearch(''); }}>Réinitialiser les filtres</button>
            </div>
          ) : (
            <div className="tp-grid tp-grid-3">
              {filtered.map(prod => {
                const imgUrl = prod.image_url || prod.image || null;
                const discountPct = prod.discount || (prod.original_price > prod.price ? Math.round((1 - prod.price / prod.original_price) * 100) : 0);
                return (
                  <div key={prod.id} className="tp-card" onClick={() => { setOpenProduct(prod); setGalleryIdx(0); setSelectedColor(prod.colors?.[0] || ''); setSelectedStorage(prod.storages?.[0] || ''); }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {discountPct > 0 && <span className="tp-badge" style={{ background: '#DC2626', color: '#fff' }}>-{discountPct}%</span>}
                        {prod.badge && <span className="tp-badge" style={{ background: BADGE_COLORS[prod.badge] || primary, color: '#fff' }}>{prod.badge}</span>}
                      </div>
                      {prod.stock_quantity !== undefined && (
                        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                          <span style={{ padding: '3px 8px', borderRadius: 8, background: prod.stock_quantity > 5 ? 'rgba(16,185,129,0.15)' : 'rgba(234,179,8,0.15)', color: prod.stock_quantity > 5 ? '#10B981' : '#EAB308', fontSize: 10, fontWeight: 900, border: `1px solid ${prod.stock_quantity > 5 ? 'rgba(16,185,129,0.3)' : 'rgba(234,179,8,0.3)'}` }}>
                            {prod.stock_quantity > 0 ? `${prod.stock_quantity} en stock` : 'Rupture'}
                          </span>
                        </div>
                      )}
                      {imgUrl
                        ? <img src={imgUrl} alt={prod.name} className="tp-card-img" />
                        : <div className="tp-card-img" style={{ background: `linear-gradient(135deg, #111116, ${primary}20)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📦</div>
                      }
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: primary, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {prod.brand && <span>{prod.brand}</span>}
                        {prod.category && <span style={{ color: '#71717A', fontWeight: 700 }}>{prod.category}</span>}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#F4F4F5', lineHeight: 1.3, marginBottom: 8 }}>{prod.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 17, fontWeight: 900, color: '#F4F4F5' }}>{fmt(prod.price)}</div>
                          {(prod.original_price || prod.originalPrice) && <div style={{ fontSize: 11, color: '#3F3F46', textDecoration: 'line-through' }}>{fmt(prod.original_price || prod.originalPrice)}</div>}
                        </div>
                        <button className="tp-btn-primary" style={{ padding: '9px 14px', borderRadius: 12, fontSize: 12, fontFamily: 'inherit' }} onClick={e => { e.stopPropagation(); addCart(prod); }}>
                          + Panier
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          PAGE VENTES FLASH
      ═══════════════════════════════════════════════════════════════ */}
      {page === 'flash' && (
        <div className="tp-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 52px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 40, padding: '40px 20px', background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(220,38,38,0.08))', borderRadius: 24, border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>⚡</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#F4F4F5', marginBottom: 8, letterSpacing: '-0.03em' }}>Ventes Flash High-Tech</h1>
            <p style={{ fontSize: 14, color: '#71717A', fontWeight: 600, marginBottom: 24 }}>Offres limitées selon les stocks disponibles</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#71717A' }}>Se termine dans :</span>
              {[flash.h, flash.m, flash.s].map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="tp-digit" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>{String(v).padStart(2, '0')}</div>
                  {i < 2 && <span style={{ color: '#F59E0B', fontSize: 22, fontWeight: 900 }}>:</span>}
                </div>
              ))}
            </div>
          </div>
          {flashProds.length > 0 ? (
            <div className="tp-grid tp-grid-3">
              {flashProds.map(prod => {
                const imgUrl = prod.image_url || prod.image || null;
                const discountPct = prod.discount || (prod.original_price > prod.price ? Math.round((1 - prod.price / prod.original_price) * 100) : 0);
                return (
                  <div key={prod.id} className="tp-card">
                    <div style={{ position: 'relative' }}>
                      {discountPct > 0 && <span className="tp-badge" style={{ position: 'absolute', top: 12, left: 12, zIndex: 3, background: '#DC2626', color: '#fff', fontSize: 12, fontWeight: 900 }}>-{discountPct}%</span>}
                      {imgUrl
                        ? <img src={imgUrl} alt={prod.name} className="tp-card-img" onClick={() => { setOpenProduct(prod); setGalleryIdx(0); }} />
                        : <div className="tp-card-img" style={{ background: `linear-gradient(135deg, #1a0000, #DC262620)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>⚡</div>
                      }
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#F4F4F5', lineHeight: 1.3, marginBottom: 10 }}>{prod.name}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
                        <span style={{ fontSize: 20, fontWeight: 900, color: '#F59E0B' }}>{fmt(prod.price)}</span>
                        {(prod.original_price || prod.originalPrice) && <span style={{ fontSize: 12, color: '#3F3F46', textDecoration: 'line-through' }}>{fmt(prod.original_price || prod.originalPrice)}</span>}
                      </div>
                      <button className="tp-btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #F59E0B, #DC2626)', boxShadow: '0 8px 24px rgba(245,158,11,0.35)', fontFamily: 'inherit' }} onClick={() => addCart(prod)}>
                        ⚡ Profiter de l'Offre
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', background: 'rgba(245,158,11,0.04)', borderRadius: 24, border: '1px dashed rgba(245,158,11,0.2)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#F4F4F5', marginBottom: 8 }}>Aucune offre flash active</div>
              <p style={{ fontSize: 12, color: '#52525B', fontWeight: 600, textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>Marquez des produits en promotion depuis votre tableau de bord pour activer les ventes flash.</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          PAGE GARANTIE 1 AN & SAV
      ═══════════════════════════════════════════════════════════════ */}
      {page === 'garantie' && (
        <div className="tp-page" style={{ maxWidth: 900, margin: '0 auto', padding: '52px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 20px' }}>🛡️</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#F4F4F5', marginBottom: 10, letterSpacing: '-0.03em' }}>Garantie 1 An & Support SAV</h1>
            <p style={{ fontSize: 15, color: '#71717A', fontWeight: 600, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Tous nos équipements sont certifiés d'origine constructeur. Chaque achat est couvert par une garantie officielle de 12 mois et notre service après-vente local.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 40 }}>
            {[
              { icon: '✅', color: '#10B981', title: '100% Authentique', desc: 'Équipements certifiés avec numéros de série officiels constructeur.' },
              { icon: '🔄', color: '#3B82F6', title: 'Échange sous 7 jours', desc: 'Remplacement immédiat en cas de défaut constaté à l\'ouverture.' },
              { icon: '🔧', color: '#8B5CF6', title: 'SAV Douala & Yaoundé', desc: 'Prise en charge par nos techniciens agréés. Diagnostic offert.' },
              { icon: '📞', color: '#F59E0B', title: 'Assistance WhatsApp', desc: 'Support technique réactif 7j/7. Réponse en moins de 30 minutes.' },
            ].map((item, i) => (
              <div key={i} className="tp-glass" style={{ padding: '24px 20px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: `${item.color}20`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 14 }}>{item.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#F4F4F5', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 12, color: '#71717A', fontWeight: 600, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="tp-btn-primary tp-btn-whatsapp" style={{ textDecoration: 'none', fontSize: 14, padding: '14px 32px', borderRadius: 16 }}>
              💬 Contacter le Service Garantie
            </a>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL FICHE PRODUIT IMMERSIVE
      ═══════════════════════════════════════════════════════════════ */}
      {openProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setOpenProduct(null)}>
          <div style={{ background: '#111116', borderRadius: 28, width: '100%', maxWidth: 900, maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()}>
            
            {/* Bouton fermer */}
            <button onClick={() => setOpenProduct(null)} style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>✕</button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              
              {/* Galerie gauche */}
              <div style={{ padding: '28px 24px 28px 28px' }}>
                <div style={{ background: '#0D0D12', borderRadius: 20, overflow: 'hidden', marginBottom: 12, aspectRatio: '1' }}>
                  <img src={openProduct.gallery?.[galleryIdx] || openProduct.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                  {(openProduct.gallery || [openProduct.image]).map((img, i) => (
                    <img key={i} src={img} alt="" className={`tp-thumb ${galleryIdx === i ? 'active' : ''}`} onClick={() => setGalleryIdx(i)} />
                  ))}
                </div>
              </div>

              {/* Détails droite */}
              <div style={{ padding: '28px 28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: primary, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>{openProduct.brand} · {openProduct.category}</div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: '#F4F4F5', lineHeight: 1.3, marginBottom: 10, letterSpacing: '-0.02em' }}>{openProduct.name}</h2>
                  <div className="tp-rating">
                    <Stars n={openProduct.rating || 4.5} />
                    <span style={{ fontSize: 11, color: '#71717A', fontWeight: 700 }}>{openProduct.rating || 4.5}/5 · {openProduct.reviews || 0} avis</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: '#F4F4F5' }}>{fmt(openProduct.price)}</span>
                  {openProduct.originalPrice && <span style={{ fontSize: 14, color: '#3F3F46', textDecoration: 'line-through' }}>{fmt(openProduct.originalPrice)}</span>}
                  {openProduct.discount > 0 && <span className="tp-badge" style={{ background: '#DC2626', color: '#fff' }}>-{openProduct.discount}%</span>}
                </div>

                {/* Couleurs */}
                {openProduct.colors?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#52525B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Couleur — {selectedColor}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {openProduct.colors.map(c => (
                        <button key={c} onClick={() => setSelectedColor(c)} style={{ padding: '6px 14px', borderRadius: 99, border: 'none', background: selectedColor === c ? primary : 'rgba(255,255,255,0.06)', color: selectedColor === c ? '#fff' : '#A1A1AA', fontSize: 11, fontWeight: 800, cursor: 'pointer', border: selectedColor === c ? 'none' : '1px solid rgba(255,255,255,0.1)', fontFamily: 'inherit' }}>{c}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stockage */}
                {openProduct.storages?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#52525B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Stockage</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {openProduct.storages.map(s => (
                        <button key={s} onClick={() => setSelectedStorage(s)} style={{ padding: '7px 16px', borderRadius: 12, border: 'none', background: selectedStorage === s ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.05)', color: selectedStorage === s ? primary : '#71717A', fontSize: 12, fontWeight: 800, cursor: 'pointer', outline: selectedStorage === s ? `2px solid ${primary}` : '2px solid transparent', fontFamily: 'inherit' }}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fiche technique */}
                {openProduct.specs && (
                  <div style={{ background: '#0D0D12', borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: '#52525B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Fiche Technique</div>
                    {Object.entries(openProduct.specs).map(([k, v]) => (
                      <div key={k} className="tp-spec-row">
                        <span className="tp-spec-key">{k}</span>
                        <span className="tp-spec-val">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Garantie badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)' }}>
                  <span style={{ fontSize: 18 }}>🛡️</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#10B981' }}>Garantie 1 An Officielle</div>
                    <div style={{ fontSize: 10, color: '#059669', fontWeight: 600 }}>SAV Douala & Yaoundé · Échange 7 jours</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="tp-btn-primary" style={{ flex: 1, fontFamily: 'inherit' }} onClick={() => addCart(openProduct)}>
                    🛒 Ajouter au Panier
                  </button>
                  <a href={wa} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 14, background: '#25D366', color: '#fff', textDecoration: 'none', fontSize: 22, flexShrink: 0 }}>💬</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          DRAWER PANIER
      ═══════════════════════════════════════════════════════════════ */}
      {cartOpen && (
        <>
          <div className="tp-drawer-overlay" onClick={() => setCartOpen(false)} />
          <div className="tp-drawer">
            {/* Header panier */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: '#F4F4F5', display: 'flex', alignItems: 'center', gap: 8 }}>
                🛒 Mon Panier
                <span style={{ padding: '2px 10px', borderRadius: 99, background: primary, color: '#fff', fontSize: 11, fontWeight: 900 }}>{cartCount}</span>
              </h3>
              <button onClick={() => setCartOpen(false)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#A1A1AA', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Liste */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#52525B' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#71717A' }}>Votre panier est vide</div>
                </div>
              ) : cart.map(item => (
                <div key={item._key} style={{ background: '#18181D', borderRadius: 16, padding: '12px', display: 'flex', gap: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img src={item.image} alt="" style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', background: '#0D0D12', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#F4F4F5', lineHeight: 1.3, marginBottom: 3 }}>{item.name}</div>
                    {item.selectedColor && <div style={{ fontSize: 10, color: '#52525B', fontWeight: 700 }}>{item.selectedColor} · {item.selectedStorage}</div>}
                    <div style={{ fontSize: 13, fontWeight: 900, color: primary, marginTop: 4 }}>{fmt(item.price)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <button onClick={() => changeQty(item._key, -1)} style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#F4F4F5', minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => changeQty(item._key, 1)} style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      <button onClick={() => removeCart(item._key)} style={{ marginLeft: 'auto', width: 24, height: 24, borderRadius: 6, background: 'rgba(220,38,38,0.12)', border: 'none', color: '#F87171', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer panier */}
            {cart.length > 0 && (
              <div style={{ padding: '16px 20px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 14, color: '#71717A', fontWeight: 700 }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: '#F4F4F5' }}>{fmt(cartTotal)}</span>
                </div>
                <a href={waMsg()} target="_blank" rel="noopener noreferrer" className="tp-btn-primary" style={{ display: 'flex', width: '100%', background: '#25D366', boxShadow: '0 8px 28px rgba(37,211,102,0.35)', textDecoration: 'none', fontSize: 14, padding: '14px', borderRadius: 16, justifyContent: 'center' }}>
                  💬 Commander sur WhatsApp · {fmt(cartTotal)}
                </a>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── FOOTER ── */}
      <footer className="tp-footer">
        <div style={{ fontSize: 13, fontWeight: 800, color: '#F4F4F5', marginBottom: 6 }}>{storeName}</div>
        <div style={{ fontSize: 11, color: '#3F3F46', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>
          Garantie 1 An · SAV Douala & Yaoundé · High-Tech Officiel
        </div>
      </footer>
    </div>
  );
}
