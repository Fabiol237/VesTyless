'use client';
import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Instagram, Twitter, Youtube, Linkedin, Globe, ArrowRight, Music, ShoppingBag, MessageCircle, Star } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE LINKS — Page "Link in Bio" ultra-configurable
// Style des boutons configurable: pill, rounded, square
// ─────────────────────────────────────────────────────────────────────────────

const SOCIAL_ICONS = {
  instagram: { icon: <Instagram size={20} />, color: '#E1306C', label: 'Instagram' },
  tiktok:    { icon: <Music size={20} />,     color: '#000000', label: 'TikTok' },
  youtube:   { icon: <Youtube size={20} />,   color: '#FF0000', label: 'YouTube' },
  twitter:   { icon: <Twitter size={20} />,   color: '#1DA1F2', label: 'Twitter' },
  linkedin:  { icon: <Linkedin size={20} />,  color: '#0077B5', label: 'LinkedIn' },
  whatsapp:  { icon: <MessageCircle size={20} />, color: '#25D366', label: 'WhatsApp' },
  website:   { icon: <Globe size={20} />,     color: '#6366f1', label: 'Site web' },
  shop:      { icon: <ShoppingBag size={20} />, color: '#f59e0b', label: 'Boutique' },
};

const BORDER_RADIUS = {
  pill:    '999px',
  rounded: '14px',
  square:  '6px',
};

export default function ModuleLinks({
  config = {}, store = {}, theme = {},
  isMobile, storeId, preview
}) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  const p      = theme['--prim']   || '#6366f1';
  const acc    = theme['--acc']    || p;
  const bg     = theme['--bg']     || '#ffffff';
  const fg     = theme['--fg']     || '#111827';
  const fg2    = theme['--fg2']    || '#6b7280';
  const border = theme['--border'] || 'rgba(0,0,0,0.08)';
  const isDark = bg === '#0f0f1a' || bg === '#120A00' || bg === '#0D0600' || bg === '#18181b';

  const btnRadius = BORDER_RADIUS[config.buttonStyle || 'rounded'] || '14px';

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Liens depuis la config ou depuis le store
  const links = config.links || store?.links || [];
  
  // Liens sociaux prédéfinis
  const socialLinks = [
    store?.instagram && { type: 'instagram', url: store.instagram },
    store?.tiktok    && { type: 'tiktok',    url: store.tiktok },
    store?.youtube   && { type: 'youtube',   url: store.youtube },
    store?.whatsapp_number && { type: 'whatsapp', url: `https://wa.me/${store.whatsapp_number.replace(/\D/g,'')}` },
    store?.website   && { type: 'website',   url: store.website },
  ].filter(Boolean);

  const allLinks = [...links, ...socialLinks];

  return (
    <section
      ref={sectionRef}
      style={{
        padding: isMobile ? '48px 20px' : '80px 32px',
        background: bg,
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes linksSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .link-item {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          max-width: 480px;
          padding: 16px 20px;
          border: 1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : border};
          background: ${isDark ? 'rgba(255,255,255,0.04)' : '#ffffff'};
          color: ${fg};
          text-decoration: none;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          border-radius: ${btnRadius};
          position: relative;
          overflow: hidden;
        }
        .link-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${p}00, ${p}08);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .link-item:hover::before { opacity: 1; }
        .link-item:hover {
          border-color: ${p}50;
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 12px 32px ${p}15, 0 4px 12px rgba(0,0,0,0.06);
        }
        .link-item:active { transform: scale(0.98); }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: 520,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(20px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}
      >
        {/* ── Profil / Avatar ── */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            {store?.logo_url ? (
              <img src={store.logo_url} alt={store.name} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', boxShadow: `0 8px 32px ${p}30, 0 0 0 3px ${p}20` }} />
            ) : (
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: `linear-gradient(135deg, ${p}, ${acc})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#fff', fontWeight: 900, boxShadow: `0 8px 32px ${p}40` }}>
                {store?.name ? store.name.charAt(0).toUpperCase() : '🔗'}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: '#22c55e', border: `2px solid ${bg}` }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: fg, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            {store?.name || 'Mon Profil'}
          </h2>
          {config.showBio && config.bio && (
            <p style={{ fontSize: 14, color: fg2, lineHeight: 1.6, margin: '0 0 6px', maxWidth: 360 }}>{config.bio}</p>
          )}
          {!config.showBio && store?.description && (
            <p style={{ fontSize: 13, color: fg2, lineHeight: 1.5, margin: 0, maxWidth: 360 }}>{store.description}</p>
          )}
        </div>

        {/* ── Liens ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
          {allLinks.length > 0 ? allLinks.map((link, i) => {
            const social = link.type ? SOCIAL_ICONS[link.type] : null;
            const label  = link.label || (social ? social.label : 'Lien');
            const url    = link.url || link.href;
            const iconColor = social?.color || p;
            
            return (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-item"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  animation: visible ? `linksSlideUp 0.5s ease both ${i * 0.08}s` : 'none',
                }}
              >
                {/* Icône colorée */}
                <div style={{
                  width: 40, height: 40, borderRadius: config.buttonStyle === 'square' ? '8px' : '50%',
                  background: `${iconColor}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  color: iconColor,
                  border: `1px solid ${iconColor}25`,
                }}>
                  {social ? social.icon : <Globe size={20} color={iconColor} />}
                </div>
                
                <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                
                {/* Compteur d'abonnés ou de followers */}
                {link.count && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: p, background: `${p}12`, padding: '2px 8px', borderRadius: 999 }}>
                    {link.count}
                  </span>
                )}
                
                <ArrowRight size={16} color={fg2} style={{ flexShrink: 0, transition: 'transform 0.2s' }} />
              </a>
            );
          }) : (
            /* ── Empty state ── */
            <div style={{ textAlign: 'center', padding: '40px 20px', color: fg2 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
              <p style={{ fontWeight: 700, color: fg, fontSize: 16, marginBottom: 6 }}>Aucun lien configuré</p>
              <p style={{ fontSize: 13 }}>Ajoutez vos réseaux depuis l'éditeur de boutique.</p>
            </div>
          )}
        </div>

        {/* ── Animated links (si config.animated) ── */}
        {config.animated && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            {[p, acc, '#22c55e'].map((c, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c, animation: `pulse ${1.5 + i * 0.3}s infinite` }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
