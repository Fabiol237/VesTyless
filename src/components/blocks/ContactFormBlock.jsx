'use client';
import { useState } from 'react';

export default function ContactFormBlock({ config = {}, theme = {}, store }) {
  const {
    title = 'Nous Contacter',
    subtitle = 'Répondons à toutes vos questions',
    showPhone = true,
    phone = '',
    showEmail = true,
    email = '',
    showAddress = true,
    address = '',
    showWhatsApp = true,
    whatsapp = '',
    showMap = false,
    mapEmbedUrl = '',
    showForm = true,
    confirmMessage = 'Message envoyé ! Nous vous répondrons bientôt.',
    bgColor = '#f9fafb',
    paddingTop = 60,
    paddingBottom = 60,
  } = config;

  const [form, setForm]   = useState({ name: '', email: '', message: '' });
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // Simuler envoi
    setSent(true);
    setLoading(false);
  };

  const phoneDisplay  = phone  || store?.phone  || '';
  const emailDisplay  = email  || store?.email  || '';
  const addressDisplay = address || store?.city  || '';
  const waNumber      = whatsapp || store?.phone || '';

  return (
    <section style={{ background: bgColor, paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <style>{`.contact-input:focus { outline:none; border-color:${theme.primaryColor || '#6366f1'} !important; box-shadow: 0 0 0 3px ${theme.primaryColor || '#6366f1'}22; }`}</style>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', margin: '0 0 8px' }}>{title}</h2>
          {subtitle && <p style={{ color: '#6b7280', margin: 0 }}>{subtitle}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 1fr' : '1fr', gap: '40px', alignItems: 'start' }}>
          {/* Infos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {showPhone && phoneDisplay && (
              <a href={`tel:${phoneDisplay}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textDecoration: 'none', color: '#111827' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${theme.primaryColor || '#6366f1'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📞</div>
                <div><div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Téléphone</div><div style={{ fontWeight: '700', fontSize: '15px' }}>{phoneDisplay}</div></div>
              </a>
            )}
            {showEmail && emailDisplay && (
              <a href={`mailto:${emailDisplay}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textDecoration: 'none', color: '#111827' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#3b82f618', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✉️</div>
                <div><div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div><div style={{ fontWeight: '700', fontSize: '15px' }}>{emailDisplay}</div></div>
              </a>
            )}
            {showAddress && addressDisplay && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#10b98118', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📍</div>
                <div><div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Adresse</div><div style={{ fontWeight: '700', fontSize: '15px' }}>{addressDisplay}</div></div>
              </div>
            )}
            {showWhatsApp && waNumber && (
              <a href={`https://wa.me/${waNumber.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#25D36618', borderRadius: '12px', border: '1px solid #25D36630', textDecoration: 'none', color: '#111827' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💬</div>
                <div><div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp</div><div style={{ fontWeight: '700', fontSize: '15px', color: '#25D366' }}>Nous contacter</div></div>
              </a>
            )}
          </div>

          {/* Formulaire */}
          {showForm && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#059669' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                  <p style={{ fontWeight: '700', fontSize: '15px' }}>{confirmMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {['name','email','message'].map(field => (
                    <div key={field}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '5px', textTransform: 'capitalize' }}>
                        {field === 'name' ? 'Votre nom' : field === 'email' ? 'Email' : 'Message'}
                      </label>
                      {field === 'message' ? (
                        <textarea className="contact-input" rows={4} value={form[field]} onChange={e => setForm(p => ({...p,[field]:e.target.value}))} required style={{ width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.15s' }} />
                      ) : (
                        <input type={field === 'email' ? 'email' : 'text'} className="contact-input" value={form[field]} onChange={e => setForm(p => ({...p,[field]:e.target.value}))} required style={{ width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' }} />
                      )}
                    </div>
                  ))}
                  <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: '10px', border: 'none', background: theme.primaryColor || '#6366f1', color: '#fff', fontWeight: '800', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, transition: 'opacity 0.15s' }}>
                    {loading ? 'Envoi...' : 'Envoyer le message'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
