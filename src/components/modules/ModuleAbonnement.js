'use client';
import { useState, useRef, useEffect } from 'react';
import { Check, Star, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE ABONNEMENT — Tarification / Pricing (SaaS, Box, Coaching, etc.)
// Configurable: plans, couleurs, badge populaire
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_PLANS = [
  { id: 1, name: 'Basique', price: 9000, period: 'mois', description: 'Idéal pour démarrer votre activité en toute simplicité.', features: ['Accès à la plateforme', 'Support par email', '1 Utilisateur'], popular: false },
  { id: 2, name: 'Pro', price: 25000, period: 'mois', description: 'La solution complète pour les professionnels exigeants.', features: ['Tout du plan Basique', 'Support prioritaire 24/7', 'Jusqu\'à 5 Utilisateurs', 'Statistiques avancées', 'Marque blanche'], popular: true },
  { id: 3, name: 'Entreprise', price: 75000, period: 'mois', description: 'Pour les grandes équipes nécessitant un accompagnement.', features: ['Tout du plan Pro', 'Utilisateurs illimités', 'Account Manager dédié', 'Développements sur mesure'], popular: false },
];

export default function ModuleAbonnement({
  config = {}, store = {}, theme = {},
  isMobile, storeId, preview, onAddToCart, currency = 'XOF'
}) {
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly | yearly
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  const p      = theme['--prim']   || '#6366f1';
  const acc    = theme['--acc']    || p;
  const bg     = theme['--bg']     || '#ffffff';
  const fg     = theme['--fg']     || '#111827';
  const fg2    = theme['--fg2']    || '#6b7280';
  const border = theme['--border'] || 'rgba(0,0,0,0.08)';
  const isDark = bg === '#0f0f1a' || bg === '#120A00' || bg === '#0D0600' || bg === '#18181b';

  const fmt = (v) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (preview || !storeId) { setPlans(DEMO_PLANS); return; }
    (async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data } = await supabase.from('subscriptions').select('*').eq('store_id', storeId).order('price', { ascending: true });
        setPlans(data?.length ? data : DEMO_PLANS);
      } catch { setPlans(DEMO_PLANS); }
    })();
  }, [storeId, preview]);

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
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: `${p}12`, border: `1px solid ${p}25`, fontSize: 12, fontWeight: 700, color: p, marginBottom: 16 }}>
            <Zap size={13} /> Tarifs & Abonnements
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 40, fontWeight: 900, color: fg, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            {config.headline || 'Des tarifs simples et transparents'}
          </h2>
          <p style={{ fontSize: 16, color: fg2, maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
            {config.subheadline || 'Choisissez l\'offre qui correspond le mieux à vos besoins et évoluez à votre rythme.'}
          </p>

          {/* Toggle Annuel/Mensuel */}
          {config.allowYearly && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 32 }}>
              <span style={{ fontSize: 14, fontWeight: billingCycle === 'monthly' ? 800 : 500, color: billingCycle === 'monthly' ? fg : fg2 }}>Mensuel</span>
              <button
                onClick={() => setBillingCycle(c => c === 'monthly' ? 'yearly' : 'monthly')}
                style={{ width: 56, height: 32, borderRadius: 16, background: billingCycle === 'yearly' ? p : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'), border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
              >
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', position: 'absolute', top: 4, left: billingCycle === 'yearly' ? 28 : 4, transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} />
              </button>
              <span style={{ fontSize: 14, fontWeight: billingCycle === 'yearly' ? 800 : 500, color: billingCycle === 'yearly' ? fg : fg2 }}>Annuel <span style={{ color: '#10b981', fontSize: 11, fontWeight: 800, background: '#d1fae5', padding: '2px 8px', borderRadius: 999, marginLeft: 4 }}>-20%</span></span>
            </div>
          )}
        </div>

        {/* Grille Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'center' }}>
          {plans.map((plan, i) => {
            const isPopular = plan.popular;
            const price = billingCycle === 'yearly' ? plan.price * 12 * 0.8 : plan.price;
            const period = billingCycle === 'yearly' ? 'an' : (plan.period || 'mois');

            return (
              <div
                key={plan.id}
                style={{
                  background: isPopular ? (isDark ? 'rgba(255,255,255,0.06)' : '#fff') : (isDark ? 'rgba(255,255,255,0.02)' : '#fff'),
                  border: `2px solid ${isPopular ? p : (isDark ? 'rgba(255,255,255,0.06)' : border)}`,
                  borderRadius: 24,
                  padding: isMobile ? '32px 24px' : '40px 32px',
                  position: 'relative',
                  transform: isPopular && !isMobile ? 'scale(1.05)' : 'none',
                  zIndex: isPopular ? 10 : 1,
                  boxShadow: isPopular ? `0 24px 60px ${p}25` : (isDark ? 'none' : '0 12px 32px rgba(0,0,0,0.03)'),
                  display: 'flex', flexDirection: 'column',
                  animation: `fadeUp 0.5s ease both ${i * 0.1}s`,
                }}
              >
                {isPopular && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${p}, ${acc})`, color: '#fff', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 16px', borderRadius: 999, boxShadow: `0 4px 12px ${p}40` }}>
                    Le plus choisi
                  </div>
                )}

                <h3 style={{ fontSize: 20, fontWeight: 900, color: fg, margin: '0 0 12px' }}>{plan.name}</h3>
                <p style={{ fontSize: 14, color: fg2, lineHeight: 1.6, margin: '0 0 24px', minHeight: 44 }}>{plan.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 32 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: fg, letterSpacing: '-0.02em' }}>{fmt(price)}</span>
                  <span style={{ fontSize: 14, color: fg2, fontWeight: 600 }}>/ {period}</span>
                </div>

                <button
                  onClick={() => onAddToCart?.(plan)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12,
                    background: isPopular ? `linear-gradient(135deg, ${p}, ${acc})` : (isDark ? 'rgba(255,255,255,0.08)' : `${p}10`),
                    color: isPopular ? '#fff' : p,
                    border: 'none', fontWeight: 800, fontSize: 15,
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: isPopular ? `0 8px 24px ${p}40` : 'none',
                    transition: 'all 0.3s',
                    marginBottom: 32,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; if(!isPopular) e.currentTarget.style.background = `${p}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; if(!isPopular) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : `${p}10`; }}
                >
                  {config.ctaText || 'Choisir ce plan'}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: fg, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ce qui est inclus :</span>
                  {plan.features?.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ background: `${p}15`, borderRadius: '50%', padding: 2, color: p, flexShrink: 0, marginTop: 2 }}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: 14, color: fg2, lineHeight: 1.5, fontWeight: 500 }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Note de sécurité */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 40, color: fg2, fontSize: 13, fontWeight: 600 }}>
          <ShieldCheck size={16} color="#10b981" /> Paiement 100% sécurisé. Annulez à tout moment.
        </div>

        <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>
      </div>
    </section>
  );
}
