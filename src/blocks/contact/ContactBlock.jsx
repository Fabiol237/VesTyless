'use client';
import { useState } from 'react';

/**
 * ContactBlock — Contact complet
 * Variants: full | minimal | side-by-side | whatsapp-cta
 */
export default function ContactBlock({ variant = 'full', settings = {}, content = {}, theme = {}, store }) {
  const {
    showPhone = true, showEmail = true, showAddress = true,
    showWhatsApp = true, showMap = false, showForm = true,
    bgColor = '#f9fafb', paddingTop = 60, paddingBottom = 60,
  } = settings;

  const {
    title = 'Nous Contacter', subtitle = '',
    phone = store?.phone || '',
    email = store?.email || '',
    address = store?.address || '',
    whatsapp = store?.phone || '',
    mapEmbedUrl = '',
    confirmMsg = 'Message envoyé ! Nous vous répondrons bientôt.',
  } = content;

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const primary = theme.primaryColor || '#6366f1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setSent(true); setLoading(false);
  };

  const waLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : '#';

  const ContactInfo = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {showPhone && phone && (
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📞</div>
          <div><div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Téléphone</div><div style={{ fontWeight: 600, color: '#111827' }}>{phone}</div></div>
        </div>
      )}
      {showEmail && email && (
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📧</div>
          <div><div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Email</div><div style={{ fontWeight: 600, color: '#111827' }}>{email}</div></div>
        </div>
      )}
      {showAddress && address && (
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📍</div>
          <div><div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Adresse</div><div style={{ fontWeight: 600, color: '#111827' }}>{address}</div></div>
        </div>
      )}
      {showWhatsApp && whatsapp && (
        <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 12, background: '#25D366', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          Envoyer un message WhatsApp
        </a>
      )}
    </div>
  );

  const ContactForm = () => (
    sent ? (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <p style={{ fontWeight: 700, color: '#059669', fontSize: 18 }}>{confirmMsg}</p>
      </div>
    ) : (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Votre nom" required
          style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', transition: 'border-color 0.15s' }}
          onFocus={e => e.target.style.borderColor = primary} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Votre email" required
          style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', transition: 'border-color 0.15s' }}
          onFocus={e => e.target.style.borderColor = primary} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Votre message" required rows={5}
          style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', resize: 'vertical', transition: 'border-color 0.15s', fontFamily: 'inherit' }}
          onFocus={e => e.target.style.borderColor = primary} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: 10, border: 'none', background: primary, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s' }}>
          {loading ? 'Envoi en cours...' : 'Envoyer le message'}
        </button>
      </form>
    )
  );

  // ── WHATSAPP-CTA ─────────────────────────────────────────────────────────────
  if (variant === 'whatsapp-cta') {
    return (
      <section style={{ background: bgColor, paddingTop, paddingBottom, textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>{title}</h2>
          {subtitle && <p style={{ color: '#6b7280', marginBottom: 32 }}>{subtitle}</p>}
          <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '16px 40px', borderRadius: 999, background: '#25D366', color: '#fff', fontWeight: 800, fontSize: 17, textDecoration: 'none', boxShadow: '0 8px 30px rgba(37,211,102,0.35)' }}>
            Envoyer un message →
          </a>
          <div style={{ marginTop: 32 }}><ContactInfo /></div>
        </div>
      </section>
    );
  }

  // ── SIDE-BY-SIDE ────────────────────────────────────────────────────────────
  if (variant === 'side-by-side') {
    return (
      <section style={{ background: bgColor, paddingTop, paddingBottom }}>
        <style>{`
          @media(max-width:768px){.contact-grid{grid-template-columns:1fr!important;gap:32px!important}}
        `}</style>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          {title && <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: subtitle ? 8 : 40 }}>{title}</h2>}
          {subtitle && <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 40 }}>{subtitle}</p>}
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
            <ContactInfo />
            {showForm && <ContactForm />}
          </div>
        </div>
      </section>
    );
  }

  // ── FULL / MINIMAL (défaut) ───────────────────────────────────────────────────
  return (
    <section style={{ background: bgColor, paddingTop, paddingBottom }}>
      <style>{`
        @media(max-width:768px){.contact-grid{grid-template-columns:1fr!important;gap:32px!important}}
      `}</style>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        {title && <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: subtitle ? 8 : 40 }}>{title}</h2>}
        {subtitle && <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 40 }}>{subtitle}</p>}
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 1.3fr' : '1fr', gap: 48, alignItems: 'start' }}>
          <ContactInfo />
          {showForm && <ContactForm />}
        </div>
        {showMap && mapEmbedUrl && (
          <div style={{ marginTop: 48, borderRadius: 16, overflow: 'hidden' }}>
            <iframe src={mapEmbedUrl} width="100%" height="300" style={{ border: 0 }} allowFullScreen loading="lazy" />
          </div>
        )}
      </div>
    </section>
  );
}
