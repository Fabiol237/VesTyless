'use client';
import { useState, useEffect, useRef } from 'react';
import { FileText, CheckCircle2, Loader2, Sparkles, ArrowRight, AlertCircle, Brain } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE DEVIS — Formulaire de demande de devis avec IA optionnelle
// Configurable: budget, délai, description projet, téléphone, email
// ─────────────────────────────────────────────────────────────────────────────

export default function ModuleDevis({
  config = {}, store = {}, theme = {},
  isMobile, storeId, preview
}) {
  const [form, setForm]   = useState({ name: '', email: '', phone: '', budget: '', deadline: '', project: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  const p      = theme['--prim']   || '#6366f1';
  const acc    = theme['--acc']    || p;
  const bg     = theme['--bg']     || '#ffffff';
  const fg     = theme['--fg']     || '#111827';
  const fg2    = theme['--fg2']    || '#6b7280';
  const border = theme['--border'] || 'rgba(0,0,0,0.08)';
  const isDark = bg === '#0f0f1a' || bg === '#120A00' || bg === '#0D0600' || bg === '#18181b';

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : border}`,
    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    color: fg, fontSize: 14, fontFamily: 'inherit',
    boxSizing: 'border-box', outline: 'none',
    transition: 'border-color 0.25s, box-shadow 0.25s',
  };

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Amélioration IA du texte ──────────────────────────────────────────────
  const improveWithAI = async () => {
    if (!form.project || aiLoading) return;
    setAiLoading(true);
    if (preview) {
      setTimeout(() => { setAiSuggestion('Projet de refonte complète de l\'identité visuelle incluant la création d\'un logo, de supports de communication et d\'un site web responsive.'); setAiLoading(false); }, 1200);
      return;
    }
    try {
      const res = await fetch('/api/ai/improve-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: form.project, field: 'project', context: store?.description }),
      });
      const { improved } = await res.json();
      if (improved) setAiSuggestion(improved);
    } catch { /* silent */ }
    setAiLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    if (preview) { setTimeout(() => setStatus('success'), 1200); return; }
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('devis_requests').insert({
        store_id: storeId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        budget: form.budget,
        deadline: form.deadline,
        project_description: aiSuggestion || form.project,
        message: form.message,
        submitted_at: new Date().toISOString(),
      });
      if (config.autoReplyEnabled && form.email) {
        // Auto-reply logic handled server-side
      }
      setStatus('success');
    } catch { setStatus('error'); }
  };

  const Label = ({ children }) => (
    <label style={{ fontSize: 11, fontWeight: 700, color: fg2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
      {children}
    </label>
  );

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
        .devis-input:focus {
          border-color: ${p} !important;
          box-shadow: 0 0 0 3px ${p}18 !important;
          background: ${isDark ? 'rgba(255,255,255,0.08)' : '#fff'} !important;
        }
      `}</style>

      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: `${p}12`, border: `1px solid ${p}25`, fontSize: 12, fontWeight: 700, color: p, marginBottom: 16 }}>
            <FileText size={13} /> Demande de devis gratuit
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 900, color: fg, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Discutons de votre projet
          </h2>
          <p style={{ fontSize: 15, color: fg2, maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
            Remplissez ce formulaire et nous vous répondrons dans les 24h avec une proposition personnalisée.
          </p>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle2 size={36} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: fg, margin: '0 0 10px' }}>Demande envoyée ! 🎉</h3>
            <p style={{ fontSize: 15, color: fg2 }}>{config.confirmMessage || 'Nous étudions votre projet et vous répondrons très bientôt.'}</p>
          </div>
        ) : (
          <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : border}`, borderRadius: 24, padding: isMobile ? '28px 20px' : '48px 44px', boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.3)' : '0 16px 48px rgba(0,0,0,0.05)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Infos de contact */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                <div>
                  <Label>Nom complet *</Label>
                  <input className="devis-input" style={inputStyle} type="text" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Jean Dupont" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <input className="devis-input" style={inputStyle} type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="jean@email.com" />
                </div>
                {config.requirePhone && (
                  <div>
                    <Label>Téléphone *</Label>
                    <input className="devis-input" style={inputStyle} type="tel" required={config.requirePhone} value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+221 77 000 00 00" />
                  </div>
                )}
              </div>

              {/* Budget */}
              {config.showBudget && (
                <div>
                  <Label>{config.budgetLabel || 'Budget estimé'}</Label>
                  <input className="devis-input" style={inputStyle} type="text" value={form.budget} onChange={e => setForm(f => ({...f, budget: e.target.value}))} placeholder="Ex: 500 000 – 1 000 000 FCFA" />
                </div>
              )}

              {/* Délai */}
              {config.showDeadline && (
                <div>
                  <Label>{config.deadlineLabel || 'Délai souhaité'}</Label>
                  <input className="devis-input" style={inputStyle} type="text" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))} placeholder="Ex: Dans 2 semaines, pour juillet 2025..." />
                </div>
              )}

              {/* Description projet avec IA */}
              {config.showProject && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Label>{config.projectLabel || 'Description du projet'}</Label>
                    {config.aiAssisted && (
                      <button
                        type="button"
                        onClick={improveWithAI}
                        disabled={aiLoading || !form.project}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 700, color: p,
                          background: `${p}12`, border: `1px solid ${p}30`,
                          borderRadius: 999, padding: '3px 10px',
                          cursor: aiLoading || !form.project ? 'not-allowed' : 'pointer',
                          opacity: !form.project ? 0.5 : 1,
                          transition: 'all 0.25s',
                          fontFamily: 'inherit',
                        }}
                      >
                        {aiLoading
                          ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                          : <Brain size={11} />
                        }
                        {aiLoading ? 'IA en cours...' : 'Améliorer avec IA'}
                      </button>
                    )}
                  </div>
                  <textarea
                    className="devis-input"
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }}
                    rows={4}
                    value={form.project}
                    onChange={e => setForm(f => ({...f, project: e.target.value}))}
                    placeholder="Décrivez votre projet en détail..."
                  />
                  {aiSuggestion && (
                    <div style={{ marginTop: 12, padding: '14px 16px', borderRadius: 10, background: `${p}08`, border: `1px solid ${p}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: p, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Sparkles size={11} /> Suggestion IA
                      </div>
                      <p style={{ fontSize: 13, color: fg, lineHeight: 1.65, margin: 0 }}>{aiSuggestion}</p>
                      <button
                        type="button"
                        onClick={() => { setForm(f => ({...f, project: aiSuggestion})); setAiSuggestion(''); }}
                        style={{ fontSize: 12, color: p, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, padding: 0, fontFamily: 'inherit' }}
                      >
                        Utiliser cette version →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Message libre */}
              <div>
                <Label>Message (optionnel)</Label>
                <textarea className="devis-input" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }} rows={3} value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} placeholder="Informations complémentaires..." />
              </div>

              {status === 'error' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 600 }}>
                  <AlertCircle size={16} /> Une erreur est survenue. Veuillez réessayer.
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '16px 32px', borderRadius: 14,
                  background: `linear-gradient(135deg, ${p}, ${acc})`,
                  color: '#fff', border: 'none', fontWeight: 900,
                  fontSize: 16, cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: `0 10px 30px ${p}40`,
                  opacity: status === 'loading' ? 0.8 : 1,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { if (status !== 'loading') { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 18px 45px ${p}55`; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 10px 30px ${p}40`; }}
              >
                {status === 'loading'
                  ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  : <><FileText size={18} /> Envoyer ma demande de devis <ArrowRight size={16} /></>
                }
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
