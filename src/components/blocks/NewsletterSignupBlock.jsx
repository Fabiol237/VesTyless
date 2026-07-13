'use client';
import { useState } from 'react';

export default function NewsletterSignupBlock({ config = {}, theme = {} }) {
  const {
    title = 'Restez informé(e) !',
    subtitle = 'Offres exclusives en avant-première',
    placeholder = 'Votre adresse email',
    buttonText = "S'abonner",
    showIncentive = true,
    incentive = '-10% sur votre première commande',
    confirmMsg = 'Merci ! Votre inscription est confirmée.',
    bgColor = '#1e1b4b',
    textColor = '#ffffff',
    buttonBg = '#6366f1',
    buttonColor = '#ffffff',
    layout = 'centered',
    paddingTop = 60,
    paddingBottom = 60,
  } = config;

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section style={{ background: bgColor, paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <style>{`.nl-input:focus { outline: none; border-color: ${buttonBg} !important; } .nl-btn:hover { opacity: 0.88 !important; }`}</style>
      <div style={{ maxWidth: layout === 'inline' ? '700px' : '560px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        {submitted ? (
          <div style={{ color: textColor }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
            <p style={{ fontSize: '18px', fontWeight: '700' }}>{confirmMsg}</p>
            {showIncentive && <p style={{ fontSize: '14px', opacity: 0.85 }}>{incentive}</p>}
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: '800', color: textColor, margin: '0 0 8px' }}>{title}</h2>
            {subtitle && <p style={{ color: textColor, opacity: 0.85, margin: '0 0 16px', fontSize: '1rem' }}>{subtitle}</p>}
            {showIncentive && incentive && (
              <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.12)', color: textColor, fontSize: '13px', fontWeight: '700', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
                🎁 {incentive}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', flexDirection: layout === 'centered' ? 'column' : 'row' }}>
              <input
                type="email"
                className="nl-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={placeholder}
                required
                style={{
                  flex: 1, padding: '13px 16px', borderRadius: '10px',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)',
                  color: textColor, fontSize: '14px', fontFamily: 'inherit',
                  backdropFilter: 'blur(8px)',
                  transition: 'border-color 0.15s',
                }}
              />
              <button
                type="submit"
                className="nl-btn"
                disabled={loading}
                style={{
                  padding: '13px 24px', borderRadius: '10px', border: 'none',
                  background: buttonBg, color: buttonColor,
                  fontWeight: '800', fontSize: '14px', cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'opacity 0.15s',
                }}
              >
                {loading ? '...' : buttonText}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
