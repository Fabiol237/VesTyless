'use client';
export default function SocialBlock({ variant = 'icons-row', settings = {}, content = {}, theme = {} }) {
  const { bgColor = '#ffffff', iconColor = '#374151', paddingTop = 40, paddingBottom = 40 } = settings;
  const { title = 'Suivez-nous', instagram = '', facebook = '', tiktok = '', whatsapp = '', youtube = '', twitter = '' } = content;
  const primary = theme.primaryColor || '#6366f1';
  const links = [
    { label: 'Instagram', href: instagram, icon: '📷', color: '#E1306C' },
    { label: 'Facebook',  href: facebook,  icon: '👤', color: '#1877F2' },
    { label: 'TikTok',    href: tiktok,    icon: '🎵', color: '#010101' },
    { label: 'WhatsApp',  href: whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g,'')}` : '', icon: '💬', color: '#25D366' },
    { label: 'YouTube',   href: youtube,   icon: '▶',  color: '#FF0000' },
    { label: 'X/Twitter', href: twitter,   icon: '🐦', color: '#000000' },
  ].filter(l => l.href);

  if (links.length === 0) return null;

  return (
    <section style={{ background: bgColor, paddingTop, paddingBottom, textAlign: 'center' }}>
      {title && <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: 20 }}>{title}</h3>}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {links.map((l, i) => (
          <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: `${l.color}15`, border: `1.5px solid ${l.color}30`, color: l.color, fontWeight: 700, fontSize: 14, textDecoration: 'none', transition: 'background 0.15s' }}>
            {l.icon} {l.label}
          </a>
        ))}
      </div>
    </section>
  );
}
