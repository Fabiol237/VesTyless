'use client';
import { useState, useEffect, useRef } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle2, Loader2, ExternalLink, Instagram, Facebook } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE CONTACT — Informations de contact premium + formulaire + carte
// ─────────────────────────────────────────────────────────────────────────────

export default function ModuleContact({
  config = {}, store = {}, theme = {},
  isMobile, storeId, preview
}) {
  const [form, setForm]   = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  const p      = theme['--prim']   || '#6366f1';
  const acc    = theme['--acc']    || p;
  const bg     = theme['--bg']     || '#ffffff';
  const fg     = theme['--fg']     || '#111827';
  const fg2    = theme['--fg2']    || '#6b7280';
  const border = theme['--border'] || 'rgba(0,0,0,0.08)';
  const isDark = bg === '#0f0f1a' || bg === '#120A00' || bg === '#0D0600' || bg === '#18181b';

  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : border}`,
    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    color: fg,
    fontSize: 14,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.25s, box-shadow 0.25s',
  };

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    if (preview) { setTimeout(() => setStatus('success'), 1200); return; }
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('contact_messages').insert({
        store_id: storeId,
        name: form.name,
        email: form.email,
        message: form.message,
        sent_at: new Date().toISOString(),
      });
      setStatus('success');
    } catch { setStatus('error'); }
  };

  const infoItems = [
    config.showPhone && store?.phone && { icon: <Phone size={18} color={p} />, label: config.phoneLabel || 'Téléphone', value: store.phone, href: `tel:${store.phone}` },
    config.showEmail && store?.email && { icon: <Mail size={18} color={p} />, label: config.emailLabel || 'Email', value: store.email, href: `mailto:${store.email}` },
    config.showAddress && store?.address && { icon: <MapPin size={18} color={p} />, label: config.addressLabel || 'Adresse', value: store.address, href: null },
    config.showWhatsapp && config.whatsappNumber && { icon: <MessageCircle size={18} color="#25D366" />, label: 'WhatsApp', value: config.whatsappText || 'Nous contacter', href: `https://wa.me/${config.whatsappNumber.replace(/\D/g,'')}` },
  ].filter(Boolean);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: isMobile ? '48px 16px' : '80px 32px',
        background: bg,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .contact-input:focus {
          border-color: ${p} !important;
          box-shadow: 0 0 0 3px ${p}18 !important;
          background: ${isDark ? 'rgba(255,255,255,0.08)' : '#fff'} !important;
        }
        .contact-info-item {
          padding: 16px 20px;
          border-radius: 14px;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : border};
          background: ${cardBg};
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.3s;
          text-decoration: none;
          color: inherit;
        }
        .contact-info-item:hover {
          border-color: ${p}40;
          background: ${isDark ? 'rgba(255,255,255,0.07)' : `${p}06`};
          transform: translateX(4px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.05);
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: `${p}12`, border: `1px solid ${p}25`, fontSize: 12, fontWeight: 700, color: p, marginBottom: 16 }}>
            <MessageCircle size={13} /> Contactez-nous
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 900, color: fg, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Nous sommes là pour vous
          </h2>
          <p style={{ fontSize: 15, color: fg2, maxWidth: 480, margin: '0 auto' }}>
            Une question, un projet ? N'hésitez pas à nous contacter. Nous répondons généralement sous 2h.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.4fr', gap: 32, alignItems: 'start' }}>
          
          {/* ── Colonne Infos ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Horaires */}
            {config.showHours && config.hours && (
              <div style={{ padding: '24px', borderRadius: 20, background: isDark ? 'rgba(255,255,255,0.04)' : `${p}06`, border: `1px solid ${p}20`, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${p}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={18} color={p} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 14, color: fg }}>Horaires d'ouverture</span>
                </div>
                <p style={{ fontSize: 13, color: fg2, whiteSpace: 'pre-line', lineHeight: 1.8, margin: 0 }}>{config.hours}</p>
              </div>
            )}

            {/* Infos de contact */}
            {infoItems.map((item, i) => (
              item.href ? (
                <a key={i} href={item.href} target={item.href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer" className="contact-info-item">
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${p}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: fg2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: fg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.value}</div>
                  </div>
                  <ExternalLink size={14} color={fg2} style={{ flexShrink: 0 }} />
                </a>
              ) : (
                <div key={i} className="contact-info-item" style={{ cursor: 'default' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${p}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: fg2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: fg }}>{item.value}</div>
                  </div>
                </div>
              )
            ))}

            {/* Carte embed */}
            {config.showMap && config.mapEmbedUrl && (
              <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginTop: 8 }}>
                <iframe src={config.mapEmbedUrl} width="100%" height="220" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>

          {/* ── Colonne Formulaire ── */}
          {config.showForm && (
            <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : border}`, borderRadius: 24, padding: isMobile ? '28px 20px' : '40px 36px', boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.3)' : `0 16px 48px rgba(0,0,0,0.06)` }}>
              {status === 'success' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '40px 0', textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={32} color="#16a34a" />
                  </div>
                  <h3 style={{ fontWeight: 900, fontSize: 20, color: fg, margin: 0 }}>Message envoyé !</h3>
                  <p style={{ fontSize: 14, color: fg2, margin: 0 }}>{config.confirmMessage || 'Nous vous répondrons dans les plus brefs délais.'}</p>
                </div>
              ) : (
                <>
                  <h3 style={{ fontWeight: 900, fontSize: 20, color: fg, margin: '0 0 28px' }}>
                    {config.formTitle || 'Envoyez-nous un message'}
                  </h3>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: fg2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nom *</label>
                        <input className="contact-input" style={inputStyle} type="text" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Votre nom" />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: fg2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email *</label>
                        <input className="contact-input" style={inputStyle} type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="votre@email.com" />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: fg2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Message *</label>
                      <textarea className="contact-input" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }} rows={5} required value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} placeholder="Décrivez votre demande..." />
                    </div>
                    {status === 'error' && (
                      <p style={{ color: '#ef4444', fontSize: 13, fontWeight: 600, margin: 0 }}>Une erreur est survenue. Réessayez.</p>
                    )}
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '14px 24px', borderRadius: 12,
                        background: `linear-gradient(135deg, ${p}, ${acc})`,
                        color: '#fff', border: 'none', fontWeight: 800, fontSize: 15,
                        cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                        boxShadow: `0 8px 28px ${p}35`,
                        opacity: status === 'loading' ? 0.8 : 1,
                        transition: 'all 0.3s',
                      }}
                      onMouseEnter={e => { if (status !== 'loading') { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 14px 40px ${p}50`; }}}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 8px 28px ${p}35`; }}
                    >
                      {status === 'loading'
                        ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        : <><Send size={16} /> Envoyer le message</>
                      }
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
