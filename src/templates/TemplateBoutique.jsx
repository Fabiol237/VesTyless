'use client';
import { useState, useEffect } from 'react';

export default function TemplateBoutique({ store, themeVars, storeId, currency = 'FCFA', productsProp, isMobile, onAddToCart }) {
  const [page, setPage] = useState('accueil');
  const [products, setProducts] = useState(productsProp || []);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openIngredient, setOpenIngredient] = useState(null);

  const name = store?.name || 'Maison Luxe';
  const desc = store?.description || "Une approche rigoureuse et sensorielle du soin. Nos formules sont conçues avec exigence et passion.";
  const phone = store?.phone || '';
  const wa = phone ? `https://wa.me/${phone.replace(/\D/g, '')}` : '#';
  const fmt = v => new Intl.NumberFormat('fr-FR').format(v || 0) + ' ' + currency;

  useEffect(() => {
    if (productsProp?.length) setProducts(productsProp);
  }, [productsProp]);

  const addToCart = (prod) => {
    setCart(c => {
      const ex = c.find(i => i.id === prod.id);
      return ex ? c.map(i => i.id === prod.id ? { ...i, qty: i.qty + 1 } : i) : [...c, { ...prod, qty: 1 }];
    });
    if (onAddToCart) onAddToCart(prod);
    setPage('panier');
    setSelectedProduct(null);
  };

  const cartTotal = cart.reduce((a, i) => a + (i.price || 0) * i.qty, 0);
  const cartQty = cart.reduce((a, i) => a + i.qty, 0);

  // Valeurs par défaut : style Aesop
  const bg = themeVars?.['--bg'] || '#FAF8F3';
  const fg = themeVars?.['--fg'] || '#1A1814';
  const fg2 = themeVars?.['--fg2'] || '#6B6560';
  const p = themeVars?.['--prim'] || '#8C5E3C';

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .ae { font-family: 'DM Sans', sans-serif; background: ${bg}; color: ${fg}; min-height: 100vh; -webkit-font-smoothing: antialiased; }
    
    /* ── NAV DESKTOP ── */
    .ae-nav { position: sticky; top: 0; z-index: 900; background: ${bg}; border-bottom: 1px solid ${fg}1A; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0 40px; height: 72px; }
    .ae-nav-left { display: flex; gap: 28px; }
    .ae-nav-center { text-align: center; font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; }
    .ae-nav-right { display: flex; gap: 28px; justify-content: flex-end; align-items: center; }
    .ae-nl { background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 0.75rem; font-weight: 400; letter-spacing: 0.08em; color: ${fg2}; cursor: pointer; text-transform: uppercase; }
    .ae-nl:hover, .ae-nl.on { color: ${fg}; }
    @media(max-width:768px){ .ae-nav-left, .ae-nav-right { display: none; } .ae-nav { grid-template-columns: 1fr; justify-items: center; padding: 0 20px; height: 60px; } }

    /* ── NAV MOBILE ── */
    .ae-bnav { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 950; height: 64px; background: ${bg}; border-top: 1px solid ${fg}12; padding-bottom: env(safe-area-inset-bottom); }
    @media(max-width:768px){ .ae-bnav { display: flex; } .ae { padding-bottom: 64px; } }
    .ae-bnav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; background: none; border: none; cursor: pointer; padding: 6px 0; color: ${fg2}; transition: color 0.2s; }
    .ae-bnav-icon { font-size: 1.3rem; line-height: 1; }
    .ae-bnav-label { font-family: 'DM Sans', sans-serif; font-size: 0.55rem; letter-spacing: 0.1em; text-transform: uppercase; }
    .ae-bnav-btn.on { color: ${fg}; }

    /* ── PAGE ACCUEIL : MANIFESTO ── */
    .ae-manifesto { max-width: 800px; margin: 0 auto; padding: clamp(50px, 10vw, 120px) 24px; text-align: center; }
    .ae-manifesto-label { font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase; color: ${p}; margin-bottom: 32px; display: block; }
    .ae-manifesto-text { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 300; line-height: 1.6; color: ${fg}; }
    .ae-manifesto-sub { margin-top: 32px; color: ${fg2}; font-size: clamp(0.95rem, 2vw, 1.1rem); line-height: 1.8; font-weight: 300; max-width: 600px; margin-inline: auto; }

    /* ── SCROLL HORIZONTAL PRODUITS ── */
    .ae-hscroll-wrap { padding: 40px 0 80px; overflow: hidden; border-top: 1px solid ${fg}10; }
    .ae-hscroll-title { padding: 0 40px; font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; margin-bottom: 32px; }
    @media(max-width:768px){ .ae-hscroll-title { padding: 0 24px; } }
    .ae-hscroll { display: flex; gap: 2px; overflow-x: auto; padding: 0 40px 40px; scrollbar-width: none; background: ${fg}08; }
    .ae-hscroll::-webkit-scrollbar { display: none; }
    @media(max-width:768px){ .ae-hscroll { padding: 0 24px 40px; } }
    .ae-hcard { flex: 0 0 calc(30% - 2px); min-width: 240px; background: ${bg}; padding: 32px 24px; cursor: pointer; transition: background 0.3s; display: flex; flex-direction: column; }
    .ae-hcard:hover { background: ${fg}03; }
    @media(max-width:768px){ .ae-hcard { flex: 0 0 calc(75% - 2px); min-width: 220px; } }
    .ae-hcard-img { width: 100%; aspect-ratio: 4/5; object-fit: contain; margin-bottom: 32px; mix-blend-mode: multiply; }
    .ae-hcard-cat { font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: ${fg2}; margin-bottom: 8px; }
    .ae-hcard-name { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; margin-bottom: auto; }
    .ae-hcard-price { font-size: 0.85rem; color: ${p}; margin-top: 24px; }

    /* ── OVERLAY PRODUIT ── */
    .ae-overlay { position: fixed; inset: 0; z-index: 1000; background: ${bg}; overflow-y: auto; display: flex; }
    .ae-overlay-left { flex: 1; background: ${fg}03; display: flex; align-items: center; justify-content: center; padding: 40px; }
    .ae-overlay-left img { width: 100%; max-width: 500px; height: auto; object-fit: contain; mix-blend-mode: multiply; }
    .ae-overlay-right { flex: 1; padding: clamp(40px, 8vw, 100px); display: flex; flex-direction: column; justify-content: center; }
    @media(max-width:768px) { .ae-overlay { flex-direction: column; } .ae-overlay-left { padding: 40px 20px; } .ae-overlay-right { padding: 40px 24px; } }
    .ae-overlay-close { position: absolute; top: 24px; right: 24px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: ${fg}; font-family: 'DM Sans', sans-serif; }
    
    /* ── BOUTIQUE LISTE ── */
    .ae-shop { max-width: 1000px; margin: 0 auto; padding: 60px 40px; }
    @media(max-width:768px){ .ae-shop { padding: 40px 24px; } }
    .ae-prod-row { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 16px; padding: 24px 0; border-top: 1px solid ${fg}10; cursor: pointer; transition: padding 0.3s; }
    .ae-prod-row:last-child { border-bottom: 1px solid ${fg}10; }
    .ae-prod-row:hover { padding-left: 12px; padding-right: 12px; background: ${fg}03; }
    @media(max-width:600px){ .ae-prod-row { grid-template-columns: 1fr auto; } .ae-prod-arrow { display: none; } }
    .ae-prod-name { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; }
    .ae-prod-cat { font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: ${fg2}; }
    .ae-prod-price { font-size: 0.9rem; color: ${p}; text-align: right; }

    /* ── PANIER REÇU ── */
    .ae-cart { max-width: 500px; margin: 0 auto; padding: 80px 24px; }
    .ae-receipt { border: 1px solid ${fg}20; padding: 40px 32px; background: #fff; box-shadow: 0 10px 40px rgba(0,0,0,0.03); }
    .ae-receipt-header { text-align: center; font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; margin-bottom: 32px; letter-spacing: 0.1em; text-transform: uppercase; border-bottom: 1px dashed ${fg}30; padding-bottom: 24px; }
    .ae-cart-item { display: flex; justify-content: space-between; font-family: monospace; font-size: 0.85rem; margin-bottom: 16px; color: ${fg}; }
    .ae-cart-total { display: flex; justify-content: space-between; font-family: monospace; font-size: 1rem; font-weight: bold; margin-top: 32px; border-top: 1px dashed ${fg}30; padding-top: 24px; }
    
    /* ── BOUTONS ── */
    .ae-btn { display: inline-flex; align-items: center; justify-content: center; padding: 16px 32px; background: ${fg}; color: ${bg}; border: 1px solid ${fg}; font-family: 'DM Sans', sans-serif; font-size: 0.75rem; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.3s; }
    .ae-btn:hover { background: transparent; color: ${fg}; }
    .ae-btn-outline { background: transparent; color: ${fg}; }
    .ae-btn-outline:hover { background: ${fg}; color: ${bg}; }

    /* ── ACCORDION INGRÉDIENTS ── */
    .ae-ingr { max-width: 800px; margin: 0 auto; padding: 80px 24px; }
    .ae-acc-item { border-top: 1px solid ${fg}15; }
    .ae-acc-item:last-child { border-bottom: 1px solid ${fg}15; }
    .ae-acc-btn { width: 100%; display: flex; justify-content: space-between; padding: 24px 0; background: none; border: none; cursor: pointer; font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: ${fg}; text-align: left; }
    .ae-acc-content { padding-bottom: 32px; font-size: 0.95rem; line-height: 1.8; color: ${fg2}; font-weight: 300; display: none; }
    .ae-acc-item.open .ae-acc-content { display: block; }

    /* ── FOOTER ── */
    .ae-footer { padding: 60px 40px; border-top: 1px solid ${fg}15; text-align: center; }
    .ae-footer-brand { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 24px; }
    .ae-footer-text { font-size: 0.8rem; color: ${fg2}; margin-bottom: 8px; }
  `;

  const nav = (
    <nav className="ae-nav">
      <div className="ae-nav-left">
        <button className={`ae-nl${page === 'accueil' ? ' on' : ''}`} onClick={() => setPage('accueil')}>Manifeste</button>
        <button className={`ae-nl${page === 'ingredients' ? ' on' : ''}`} onClick={() => setPage('ingredients')}>Philosophie</button>
      </div>
      <div className="ae-nav-center" onClick={() => setPage('accueil')}>{name}</div>
      <div className="ae-nav-right">
        <button className={`ae-nl${page === 'boutique' ? ' on' : ''}`} onClick={() => setPage('boutique')}>Collection</button>
        <button className={`ae-nl${page === 'panier' ? ' on' : ''}`} onClick={() => setPage('panier')}>
          Panier {cartQty > 0 ? `(${cartQty})` : ''}
        </button>
      </div>
    </nav>
  );

  const bnav = (
    <nav className="ae-bnav">
      {[['accueil', '✦', 'Manifeste'], ['ingredients', '✧', 'Philosophie'], ['boutique', '⌂', 'Collection'], ['panier', '◯', 'Panier']].map(([id, icon, label]) => (
        <button key={id} className={`ae-bnav-btn${page === id ? ' on' : ''}`} onClick={() => setPage(id)}>
          <span className="ae-bnav-icon">{icon}</span>
          <span className="ae-bnav-label">{label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="ae">
      <style>{css}</style>
      {nav}
      {bnav}

      {/* ── OVERLAY PRODUIT ── */}
      {selectedProduct && (
        <div className="ae-overlay">
          <button className="ae-overlay-close" onClick={() => setSelectedProduct(null)}>✕</button>
          <div className="ae-overlay-left">
            {selectedProduct.image_url ? <img src={selectedProduct.image_url} alt={selectedProduct.name} /> : <div style={{fontSize: '4rem', color: `${fg}20`}}>Images en cours</div>}
          </div>
          <div className="ae-overlay-right">
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: p, marginBottom: '16px' }}>{selectedProduct.category || 'Soin'}</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, marginBottom: '24px' }}>{selectedProduct.name}</h2>
            <p style={{ fontSize: '1rem', lineHeight: '1.8', color: fg2, marginBottom: '40px', fontWeight: 300 }}>{selectedProduct.description || "Un mélange exceptionnel d'ingrédients sélectionnés pour leurs propriétés purifiantes et équilibrantes. Convient à tous les types de peau."}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', borderTop: `1px solid ${fg}20`, paddingTop: '32px' }}>
              <span style={{ fontSize: '1.2rem', color: fg }}>{selectedProduct.price ? fmt(selectedProduct.price) : 'Sur demande'}</span>
              <button className="ae-btn" onClick={() => addToCart(selectedProduct)}>Ajouter au panier</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ACCUEIL ── */}
      {page === 'accueil' && (
        <>
          <div className="ae-manifesto">
            <span className="ae-manifesto-label">Notre Philosophie</span>
            <h1 className="ae-manifesto-text">{desc}</h1>
            <p className="ae-manifesto-sub">Nous explorons le monde à la recherche des meilleurs ingrédients végétaux et créons avec soin des formules qui élèvent vos rituels quotidiens.</p>
          </div>

          <div className="ae-hscroll-wrap">
            <h2 className="ae-hscroll-title">Produits phares</h2>
            <div className="ae-hscroll">
              {(products.length > 0 ? products : Array.from({length: 4}, (_, i) => ({id: `ph-${i}`}))).map((prod, i) => (
                <div key={`ae-hcard-${prod.id ?? 'x'}-${i}`} className="ae-hcard" onClick={() => prod.id && setSelectedProduct(prod)}>
                  <div className="ae-hcard-img">
                    {prod.image_url ? <img src={prod.image_url} alt={prod.name} /> : <span>Image</span>}
                  </div>
                  <div className="ae-hcard-cat">{prod.category || 'Catégorie'}</div>
                  <h3 className="ae-hcard-name">{prod.name || 'Nom du produit'}</h3>
                  <div className="ae-hcard-price">{prod.price ? fmt(prod.price) : '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── COLLECTION (BOUTIQUE LISTE) ── */}
      {page === 'boutique' && (
        <div className="ae-shop">
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', marginBottom: '48px', borderBottom: `1px solid ${fg}20`, paddingBottom: '24px' }}>Toute la Collection</h1>
          {products.map((prod, i) => (
            <div key={`ae-row-${prod.id ?? 'x'}-${i}`} className="ae-prod-row" onClick={() => setSelectedProduct(prod)}>
              <div className="ae-prod-name">{prod.name}</div>
              <div className="ae-prod-cat">{prod.category || 'Soin'}</div>
              <div className="ae-prod-price">{fmt(prod.price)}</div>
              <div className="ae-prod-arrow" style={{color: fg2}}>→</div>
            </div>
          ))}
          {products.length === 0 && <p style={{ color: fg2 }}>Aucun produit disponible.</p>}
        </div>
      )}

      {/* ── INGRÉDIENTS (À PROPOS) ── */}
      {page === 'ingredients' && (
        <div className="ae-ingr">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="ae-manifesto-label">Savoir-faire</span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem' }}>L'Art de la Formulation</h1>
          </div>
          {[
            { id: 1, title: 'Sélection Botanique', content: 'Chaque extrait végétal est choisi pour sa pureté absolue et ses bénéfices cliniquement prouvés. Nous travaillons en direct avec des producteurs indépendants respectueux des sols.' },
            { id: 2, title: 'Science & Recherche', content: 'Nos laboratoires combinent les extraits naturels avec des actifs synthétiques sûrs et éprouvés, uniquement lorsque la science moderne permet de décupler l’efficacité sans compromettre l’intégrité du soin.' },
            { id: 3, title: 'Design & Rituels', content: 'L’emballage de nos produits est pensé de manière fonctionnelle et durable. Nous croyons que le moment que vous passez à prendre soin de vous doit être une expérience multisensorielle parfaite.' }
          ].map(item => (
            <div key={item.id} className={`ae-acc-item ${openIngredient === item.id ? 'open' : ''}`}>
              <button className="ae-acc-btn" onClick={() => setOpenIngredient(openIngredient === item.id ? null : item.id)}>
                {item.title}
                <span style={{ fontSize: '1rem', color: fg2 }}>{openIngredient === item.id ? '−' : '+'}</span>
              </button>
              <div className="ae-acc-content">{item.content}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── PANIER ── */}
      {page === 'panier' && (
        <div className="ae-cart">
          <div className="ae-receipt">
            <div className="ae-receipt-header">Reçu d'Achat</div>
            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', fontFamily: 'monospace', color: fg2, padding: '40px 0' }}>Aucun article sélectionné.</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} className="ae-cart-item">
                    <span>{item.qty}x {item.name.substring(0, 20)}</span>
                    <span>{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="ae-cart-total">
                  <span>TOTAL</span>
                  <span>{fmt(cartTotal)}</span>
                </div>
                <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {wa !== '#' ? (
                    <a href={`${wa}?text=${encodeURIComponent(`Commande ${name}\n\n${cart.map(i => `${i.qty}x ${i.name}`).join('\n')}\n\nTotal: ${fmt(cartTotal)}`)}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                      <button className="ae-btn" style={{ width: '100%' }}>Finaliser sur WhatsApp</button>
                    </a>
                  ) : (
                    <button className="ae-btn" style={{ width: '100%' }}>Finaliser la commande</button>
                  )}
                  <button className="ae-btn ae-btn-outline" style={{ width: '100%' }} onClick={() => setPage('boutique')}>Continuer la visite</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="ae-footer">
        <div className="ae-footer-brand">{name}</div>
        <p className="ae-footer-text">© {new Date().getFullYear()} {name}. Tous droits réservés.</p>
        <p className="ae-footer-text">L'excellence dans chaque détail.</p>
      </footer>
    </div>
  );
}
