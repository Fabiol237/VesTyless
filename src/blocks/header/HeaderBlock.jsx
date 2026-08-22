'use client';
import { useState, useEffect } from 'react';

/**
 * HeaderBlock — En-tête de boutique
 * Variants: minimal | sticky | transparent | centered | sidebar
 */
export default function HeaderBlock({ variant = 'sticky', settings = {}, content = {}, theme = {}, store }) {
  const {
    logoPosition = 'left',
    height = 'md',
    transparent = false,
    sticky = true,
    showCart = true,
    showSearch = true,
    bgColor = '#ffffff',
    textColor = '#111827',
    borderBottom = true,
  } = settings;

  const {
    logo = store?.logo_url || null,
    storeName = store?.name || 'Ma Boutique',
    links = [],
  } = content;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!transparent && !sticky) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparent, sticky]);

  const heights = { sm: 56, md: 72, lg: 88 };
  const h = heights[height] || 72;
  const primary = theme.primaryColor || '#6366f1';

  const isTransparent = transparent && !scrolled;
  const bg = isTransparent ? 'transparent' : bgColor;
  const fg = isTransparent ? '#ffffff' : textColor;

  const navLinks = links.length > 0 ? links : [
    { label: 'Accueil', href: '#' },
    { label: 'Catalogue', href: '#catalogue' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <style>{`
        .header-link{transition:color 0.15s;text-decoration:none;font-size:14px;font-weight:600}
        .header-link:hover{color:${primary}!important}
        .header-icon-btn{background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;transition:background 0.15s}
        .header-icon-btn:hover{background:rgba(0,0,0,0.06)}
        .mobile-menu{position:fixed;inset:0;top:${h}px;background:#fff;z-index:998;padding:16px 24px;display:flex;flex-direction:column;gap:8px;transform:translateY(-100%);transition:transform 0.3s;border-top:1px solid #f3f4f6}
        .mobile-menu.open{transform:translateY(0)}
        @media(min-width:769px){.mobile-menu{display:none!important}.mobile-toggle{display:none!important}}
        @media(max-width:768px){.desktop-nav{display:none!important}}
      `}</style>

      <header style={{
        position: sticky ? 'sticky' : 'relative',
        top: 0, left: 0, right: 0,
        zIndex: 900,
        height: h,
        background: bg,
        borderBottom: borderBottom && !isTransparent ? '1px solid rgba(0,0,0,0.08)' : 'none',
        backdropFilter: isTransparent ? 'none' : scrolled && transparent ? 'blur(12px)' : 'none',
        transition: 'background 0.3s, box-shadow 0.3s',
        boxShadow: scrolled && sticky ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', width: '100%',
          display: 'grid',
          gridTemplateColumns: logoPosition === 'center' ? '1fr auto 1fr' : 'auto 1fr auto',
          alignItems: 'center',
          gap: 24,
        }}>

          {/* Nav gauche (desktop) */}
          {logoPosition === 'center' && (
            <nav className="desktop-nav" style={{ display: 'flex', gap: 24 }}>
              {navLinks.slice(0, Math.ceil(navLinks.length / 2)).map((l, i) => (
                <a key={i} href={l.href} className="header-link" style={{ color: fg }}>{l.label}</a>
              ))}
            </nav>
          )}

          {/* Logo */}
          <a href="#" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            textDecoration: 'none',
            ...(logoPosition === 'center' ? { justifyContent: 'center' } : {}),
          }}>
            {logo ? (
              <img src={logo} alt={storeName} style={{ height: h - 28, maxWidth: 120, objectFit: 'contain' }} />
            ) : (
              <span style={{ fontWeight: 900, fontSize: 20, color: primary, letterSpacing: '-0.03em' }}>
                {storeName}
              </span>
            )}
          </a>

          {/* Nav droite (desktop) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: logoPosition === 'center' ? 8 : 24, justifyContent: 'flex-end' }}>
            {logoPosition !== 'center' && (
              <nav className="desktop-nav" style={{ display: 'flex', gap: 24 }}>
                {navLinks.map((l, i) => (
                  <a key={i} href={l.href} className="header-link" style={{ color: fg }}>{l.label}</a>
                ))}
              </nav>
            )}
            {logoPosition === 'center' && (
              <nav className="desktop-nav" style={{ display: 'flex', gap: 24 }}>
                {navLinks.slice(Math.ceil(navLinks.length / 2)).map((l, i) => (
                  <a key={i} href={l.href} className="header-link" style={{ color: fg }}>{l.label}</a>
                ))}
              </nav>
            )}
            {showSearch && (
              <button className="header-icon-btn" aria-label="Rechercher" style={{ color: fg }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            )}
            {showCart && (
              <button className="header-icon-btn" aria-label="Panier" style={{ color: fg, position: 'relative' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              </button>
            )}
            {/* Mobile toggle */}
            <button className="mobile-toggle header-icon-btn" onClick={() => setMenuOpen(o => !o)} style={{ color: fg }}>
              {menuOpen
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              }
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {navLinks.map((l, i) => (
          <a key={i} href={l.href} onClick={() => setMenuOpen(false)} style={{
            padding: '12px 0', borderBottom: '1px solid #f3f4f6',
            color: '#111827', fontWeight: 600, fontSize: 16, textDecoration: 'none',
          }}>{l.label}</a>
        ))}
      </div>
    </>
  );
}
