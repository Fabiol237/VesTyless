'use client';
import { useState, useEffect, useRef } from 'react';
import { Mail, Sparkles, Gift, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE NEWSLETTER — Capture email ultra-configurable et premium
// Adapte son look selon le thème injecté par le parent (dark/light/custom)
// ─────────────────────────────────────────────────────────────────────────────

export default function ModuleNewsletter({
  config = {}, store = {}, theme = {},
  isMobile, storeId, preview
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  // ── Variables de thème ────────────────────────────────────────────────────
  const p      = theme['--prim']   || '#6366f1';
  const acc    = theme['--acc']    || p;
  const bg     = theme['--bg']     || '#ffffff';
  const fg     = theme['--fg']     || '#111827';
  const fg2    = theme['--fg2']    || '#6b7280';
  const border = theme['--border'] || 'rgba(0,0,0,0.08)';
  const isDark = bg === '#0f0f1a' || bg === '#120A00' || bg === '#0D0600' || bg === '#18181b';

  // ── Animation d'entrée ────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, { threshold: 0.2 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Soumission formulaire ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === 'loading') return;
    setStatus('loading');
    
    if (preview) {
      // Simulation en mode aperçu
      setTimeout(() => { setStatus('success'); }, 1200);
      return;
    }
    
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, store_id: storeId, subscribed_at: new Date().toISOString() });
      
      if (error && error.code !== '23505') { // ignore duplicate
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch {
      setStatus('error');
    }
  };

  // ── Styles dérivés du thème ───────────────────────────────────────────────
  const cardBg   = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
  const cardBorder = `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : border}`;

  return (
    <section
      ref={sectionRef}
      style={{
        padding: isMobile ? '48px 20px' : '80px 32px',
        background: bg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes nlFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nlPulse {
          0%,100% { box-shadow: 0 0 0 0 ${p}40; }
          50%      { box-shadow: 0 0 0 10px ${p}00; }
        }
        .nl-visible { animation: nlFadeUp 0.7s ease both; }
        .nl-input:focus { outline: none; border-color: ${p} !important; box-shadow: 0 0 0 3px ${p}20 !important; }
        .nl-btn { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .nl-btn:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 12px 32px ${p}45 !important; }
        .nl-btn:active { transform: scale(0.97); }
      `}</style>

      {/* Décor de fond */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${p}10 0%, transparent 70%)` }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${acc}08 0%, transparent 70%)` }} />
      </div>

      <div
        className={visible ? 'nl-visible' : ''}
        style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}
      >
        {/* ── Card principale ── */}
        <div style={{
          background: isDark
            ? `linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`
            : `linear-gradient(145deg, ${p}08, ${acc}04)`,
          border: cardBorder,
          borderRadius: 24,
          padding: isMobile ? '32px 20px' : '48px 40px',
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
          boxShadow: isDark
            ? '0 24px 60px rgba(0,0,0,0.3)'
            : `0 24px 60px ${p}08, 0 8px 24px rgba(0,0,0,0.04)`,
        }}>
          
          {/* Icône / Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            {config.showIncentive ? (
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: `linear-gradient(135deg, ${p}, ${acc})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 12px 32px ${p}40`,
                animation: 'nlPulse 2.5s infinite',
              }}>
                <Gift size={28} color="#fff" />
              </div>
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: isDark ? 'rgba(255,255,255,0.08)' : `${p}10`,
                border: `1px solid ${p}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Mail size={28} color={p} />
              </div>
            )}
          </div>

          {/* Offre incitative */}
          {config.showIncentive && config.incentive && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 999,
              background: `linear-gradient(90deg, ${p}18, ${acc}18)`,
              border: `1px solid ${p}30`,
              fontSize: 12, fontWeight: 800, color: p,
              marginBottom: 16, letterSpacing: '0.04em',
            }}>
              <Sparkles size={12} /> {config.incentive}
            </div>
          )}

          {/* Titre */}
          <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: fg, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            {config.headline || 'Restez informé(e)'}
          </h2>

          {/* Sous-titre */}
          <p style={{ fontSize: 15, color: fg2, lineHeight: 1.65, margin: '0 0 32px', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
            {config.subtext || 'Recevez nos actualités, offres exclusives et conseils directement dans votre boîte mail.'}
          </p>

          {/* Formulaire ou confirmation */}
          {status === 'success' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={28} color="#16a34a" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: fg, margin: 0 }}>
                {config.confirmMessage || 'Merci ! Vous êtes inscrit(e) 🎉'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: 8, maxWidth: 480, margin: '0 auto', flexDirection: isMobile ? 'column' : 'row' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={config.placeholder || 'votre@email.com'}
                  required
                  className="nl-input"
                  style={{
                    flex: 1,
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : border}`,
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                    color: fg,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    transition: 'all 0.25s',
                  }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="nl-btn"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px 24px',
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${p}, ${acc})`,
                    color: '#fff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: `0 6px 20px ${p}40`,
                    opacity: status === 'loading' ? 0.8 : 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {status === 'loading'
                    ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    : <><span>{config.buttonText || "S'inscrire"}</span><ArrowRight size={16} /></>
                  }
                </button>
              </div>
              {status === 'error' && (
                <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8, fontWeight: 600 }}>
                  Une erreur s'est produite. Veuillez réessayer.
                </p>
              )}
              <p style={{ fontSize: 11, color: fg2, marginTop: 12, opacity: 0.6 }}>
                Pas de spam. Désinscription en un clic.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
