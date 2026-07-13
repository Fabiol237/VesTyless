'use client';

const SOCIALS = [
  { key: 'instagram', label: 'Instagram', emoji: '📸', color: '#E1306C', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' },
  { key: 'facebook',  label: 'Facebook',  emoji: '👤', color: '#1877f2', bg: '#1877f2' },
  { key: 'tiktok',    label: 'TikTok',    emoji: '🎵', color: '#010101', bg: 'linear-gradient(135deg,#010101,#69C9D0)' },
  { key: 'whatsapp',  label: 'WhatsApp',  emoji: '💬', color: '#25D366', bg: '#25D366' },
  { key: 'youtube',   label: 'YouTube',   emoji: '▶️', color: '#FF0000', bg: '#FF0000' },
  { key: 'twitter',   label: 'X / Twitter',emoji: '𝕏', color: '#1DA1F2', bg: '#1DA1F2' },
];

export default function SocialLinksBlock({ config = {}, theme = {} }) {
  const {
    title = 'Suivez-nous',
    instagram = '', facebook = '', tiktok = '',
    whatsapp = '', youtube = '', twitter = '',
    style: btnStyle = 'rounded',
    size = 'md',
    bgColor = '#ffffff',
    paddingTop = 40,
    paddingBottom = 40,
  } = config;

  const values = { instagram, facebook, tiktok, whatsapp, youtube, twitter };
  const active = SOCIALS.filter(s => values[s.key]);

  const sizes = { sm: { btn: '40px', font: '18px' }, md: { btn: '52px', font: '24px' }, lg: { btn: '64px', font: '30px' } };
  const sz = sizes[size] || sizes.md;

  const getHref = (s) => {
    const v = values[s.key];
    if (s.key === 'whatsapp') return `https://wa.me/${v.replace(/\D/g, '')}`;
    return v.startsWith('http') ? v : `https://${v}`;
  };

  const borderRadii = { rounded: '50%', square: '12px', pill: '8px', minimal: '0' };
  const radius = borderRadii[btnStyle] || '50%';

  return (
    <section style={{ background: bgColor, paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <style>{`.social-btn:hover { transform: translateY(-4px) scale(1.08); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }`}</style>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        {title && <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', margin: '0 0 24px' }}>{title}</h2>}
        {active.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Configurez vos liens sociaux via le panneau IA ou l'éditeur.</p>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {active.map(s => (
              <a key={s.key} href={getHref(s)} target="_blank" rel="noopener noreferrer" className="social-btn"
                title={s.label}
                style={{
                  width: sz.btn, height: sz.btn, borderRadius: radius,
                  background: s.bg, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: sz.font, textDecoration: 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                {btnStyle === 'minimal' ? (
                  <span style={{ fontSize: '14px', fontWeight: '700', color: s.color }}>{s.label}</span>
                ) : s.emoji}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
