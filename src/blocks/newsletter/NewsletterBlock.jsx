'use client';
import { useState } from 'react';

/**
 * NewsletterBlock — Inscription newsletter
 * Variants: centered | inline | split | minimal | popup
 */
export default function NewsletterBlock({ variant = 'centered', settings = {}, content = {}, theme = {} }) {
  const {
    bgColor = '#1e1b4b',
    textColor = '#ffffff',
    buttonBg = '#6366f1',
    buttonColor = '#ffffff',
    inputBg = 'rgba(255,255,255,0.1)',
    showIncentive = true,
    paddingTop = 60,
    paddingBottom = 60,
  } = settings;

  const {
    title = 'Restez informé(e) !',
    subtitle = 'Offres exclusives en avant-première',
    incentive = '-10% sur votre première commande',
    placeholder = 'Votre adresse email',
    buttonText = "S'abonner",
    confirmMsg = 'Merci ! Inscription confirmée. 🎉',
  } = content;

  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const primary = theme.primaryColor || '#6366f1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setDone(true);
    setLoading(false);
  };

  // ── INLINE ────────────────────────────────────────────────────────────────────
  if (variant === 'inline') {
    return (
      <section style={{ background: bgColor, paddingTop, paddingBottom }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: textColor, margin: '0 0 4px' }}>{title}</h2>
            {subtitle && <p style={{ color: `${textColor}aa`, margin: 0, fontSize: 14 }}>{subtitle}</p>}
          </div>
          {done ? (
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: 16 }}>✓ {confirmMsg}</p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flex: 2, minWidth: 280 }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder={placeholder} required
                style={{ flex: 1, padding: '12px 16px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.2)', background: inputBg, color: textColor, fontSize: 14, outline: 'none' }}
              />
              <button type="submit" disabled={loading} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: buttonBg || primary, color: buttonColor, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', opacity: loading ? 0.7 : 1 }}>
                {loading ? '...' : buttonText}
              </button>
            </form>
          )}
        </div>
      </section>
    );
  }

  // ── MINIMAL ───────────────────────────────────────────────────────────────────
  if (variant === 'minimal') {
    return (
      <div style={{ borderTop: `1px solid ${primary}22`, paddingTop: 32, paddingBottom: 32, textAlign: 'center' }}>
        <p style={{ color: '#6b7280', marginBottom: 16 }}>{title}</p>
        {done ? (
          <p style={{ color: '#10b981', fontWeight: 700 }}>✓ {confirmMsg}</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={placeholder} required
              style={{ padding: '10px 16px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', width: 280 }} />
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: primary, color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '...' : buttonText}
            </button>
          </form>
        )}
      </div>
    );
  }

  // ── CENTERED (défaut) ─────────────────────────────────────────────────────────
  return (
    <section style={{ background: bgColor, paddingTop, paddingBottom, textAlign: 'center' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 900, color: textColor, margin: '0 0 12px' }}>{title}</h2>
        {subtitle && <p style={{ color: `${textColor}aa`, margin: '0 0 20px', fontSize: 16 }}>{subtitle}</p>}
        {showIncentive && incentive && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28, padding: '8px 20px', borderRadius: 999, background: `${primary}25`, border: `1px solid ${primary}44` }}>
            <span style={{ fontSize: 18 }}>🎁</span>
            <span style={{ color: textColor, fontWeight: 700, fontSize: 14 }}>{incentive}</span>
          </div>
        )}
        {done ? (
          <p style={{ color: '#10b981', fontWeight: 700, fontSize: 18 }}>✓ {confirmMsg}</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={placeholder} required
              style={{ flex: 1, minWidth: 220, padding: '14px 20px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.2)', background: inputBg, color: textColor, fontSize: 15, outline: 'none' }} />
            <button type="submit" disabled={loading} style={{ padding: '14px 28px', borderRadius: 10, border: 'none', background: buttonBg || primary, color: buttonColor, fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Envoi...' : buttonText}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
