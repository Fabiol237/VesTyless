'use client';

/**
 * FooterBlock — Pied de page
 * Variants: simple | columns | minimal | dark | branded
 */
export default function FooterBlock({ variant = 'simple', settings = {}, content = {}, theme = {}, store }) {
  const {
    bgColor = '#111827',
    textColor = '#9ca3af',
    accentColor = '#6366f1',
    showSocials = true,
    showLegal = true,
    showNewsletter = false,
  } = settings;

  const {
    storeName = store?.name || 'Ma Boutique',
    logo = store?.logo_url || null,
    description = '',
    links = [],
    legalLinks = [
      { label: 'Mentions légales', href: '#' },
      { label: 'Confidentialité', href: '#' },
    ],
    copyright = `© ${new Date().getFullYear()} ${storeName || 'VesTyle'}. Tous droits réservés.`,
    socials = {},
  } = content;

  const primary = theme.primaryColor || accentColor;

  const SocialIcon = ({ platform, href }) => {
    const icons = {
      instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
      facebook:  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
      tiktok:    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
      whatsapp:  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
    };
    if (!href || !icons[platform]) return null;
    return (
      <a href={platform === 'whatsapp' ? `https://wa.me/${href.replace(/\D/g,'')}` : href}
        target="_blank" rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: textColor, transition: 'background 0.15s, color 0.15s', textDecoration: 'none' }}
        onMouseEnter={e => { e.currentTarget.style.background = primary; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = textColor; }}
      >
        {icons[platform]}
      </a>
    );
  };

  // ── MINIMAL ───────────────────────────────────────────────────────────────────
  if (variant === 'minimal') {
    return (
      <footer style={{ background: bgColor, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: textColor }}>{storeName}</div>
          <div style={{ fontSize: 13, color: `${textColor}88` }}>{copyright}</div>
          {showSocials && (
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(socials).map(([p, h]) => <SocialIcon key={p} platform={p} href={h} />)}
            </div>
          )}
        </div>
      </footer>
    );
  }

  // ── COLUMNS ────────────────────────────────────────────────────────────────
  if (variant === 'columns') {
    const cols = [
      { title: 'Navigation', items: links },
      { title: 'Légal', items: legalLinks },
    ];
    return (
      <footer style={{ background: bgColor, paddingTop: 64, paddingBottom: 32 }}>
        <style>{`
          @media(max-width:768px){.footer-grid{grid-template-columns:1fr!important;gap:32px!important}}
        `}</style>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            {/* Colonne brand */}
            <div>
              {logo ? <img src={logo} alt={storeName} style={{ height: 40, marginBottom: 16 }} /> : <div style={{ fontWeight: 900, fontSize: 22, color: '#fff', marginBottom: 16 }}>{storeName}</div>}
              {description && <p style={{ color: textColor, fontSize: 14, lineHeight: 1.7, marginBottom: 20, maxWidth: 300 }}>{description}</p>}
              {showSocials && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {Object.entries(socials).map(([p, h]) => <SocialIcon key={p} platform={p} href={h} />)}
                </div>
              )}
            </div>
            {/* Colonnes liens */}
            {cols.map((col, ci) => (
              <div key={ci}>
                <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{col.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(col.items || []).map((l, i) => (
                    <a key={i} href={l.href} style={{ color: textColor, fontSize: 14, textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.target.style.color = primary} onMouseLeave={e => e.target.style.color = textColor}>
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 13, color: `${textColor}88` }}>{copyright}</span>
            {showLegal && (
              <div style={{ display: 'flex', gap: 16 }}>
                {legalLinks.map((l, i) => <a key={i} href={l.href} style={{ fontSize: 13, color: `${textColor}88`, textDecoration: 'none' }}>{l.label}</a>)}
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }

  // ── SIMPLE (défaut) ───────────────────────────────────────────────────────────
  return (
    <footer style={{ background: bgColor, paddingTop: 48, paddingBottom: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap', marginBottom: 40 }}>
          {/* Brand */}
          <div style={{ maxWidth: 320 }}>
            {logo ? <img src={logo} alt={storeName} style={{ height: 36, marginBottom: 12 }} /> : <div style={{ fontWeight: 900, fontSize: 20, color: '#fff', marginBottom: 12 }}>{storeName}</div>}
            {description && <p style={{ color: textColor, fontSize: 14, lineHeight: 1.6 }}>{description}</p>}
          </div>
          {/* Liens */}
          {links.length > 0 && (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {links.map((l, i) => (
                <a key={i} href={l.href} style={{ color: textColor, fontSize: 14, textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = primary} onMouseLeave={e => e.target.style.color = textColor}>
                  {l.label}
                </a>
              ))}
            </div>
          )}
          {/* Socials */}
          {showSocials && Object.keys(socials).length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(socials).map(([p, h]) => <SocialIcon key={p} platform={p} href={h} />)}
            </div>
          )}
        </div>
        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: `${textColor}88` }}>{copyright}</span>
          {showLegal && (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {legalLinks.map((l, i) => <a key={i} href={l.href} style={{ fontSize: 13, color: `${textColor}88`, textDecoration: 'none' }}>{l.label}</a>)}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
