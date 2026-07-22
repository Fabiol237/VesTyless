'use client';
import { useState, useRef, useEffect } from 'react';
import { ExternalLink, CheckCircle2, ChevronRight, Star, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE SERVICES — Présentation de services / Prestations
// Configurable: layout grid/cards, icônes, prix, appels à l'action
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_SERVICES = [
  { id: 1, title: 'Consultation Initiale', description: 'Un premier rendez-vous pour faire le point sur vos besoins et définir une stratégie sur-mesure.', price: 'Gratuit', icon: '💬', featured: false },
  { id: 2, title: 'Accompagnement Premium', description: 'Un suivi mensuel complet avec des points réguliers et un accès prioritaire à nos experts.', price: 'À partir de 150 000 FCFA / mois', icon: '⭐', featured: true },
  { id: 3, title: 'Audit Complet', description: 'Une analyse approfondie de votre situation avec remise d\'un rapport détaillé et de recommandations.', price: 'Sur devis', icon: '🔍', featured: false },
];

export default function ModuleServices({
  config = {}, store = {}, theme = {},
  isMobile, storeId, preview, onNavigate, modules = []
}) {
  const [services, setServices] = useState([]);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  const p      = theme['--prim']   || '#6366f1';
  const acc    = theme['--acc']    || p;
  const bg     = theme['--bg']     || '#ffffff';
  const fg     = theme['--fg']     || '#111827';
  const fg2    = theme['--fg2']    || '#6b7280';
  const border = theme['--border'] || 'rgba(0,0,0,0.08)';
  const isDark = bg === '#0f0f1a' || bg === '#120A00' || bg === '#0D0600' || bg === '#18181b';

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (preview || !storeId) { setServices(DEMO_SERVICES); return; }
    (async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data } = await supabase.from('services').select('*').eq('store_id', storeId).order('created_at', { ascending: true });
        setServices(data?.length ? data : DEMO_SERVICES);
      } catch { setServices(DEMO_SERVICES); }
    })();
  }, [storeId, preview]);

  const handleCTA = () => {
    if (!onNavigate || !config.ctaLink) return;
    const target = modules.find(m => m.type === config.ctaLink || m.id === config.ctaLink);
    if (target) onNavigate(target.id);
  };

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
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: `${p}12`, border: `1px solid ${p}25`, fontSize: 12, fontWeight: 700, color: p, marginBottom: 16 }}>
            <Zap size={13} /> Nos Prestations
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 900, color: fg, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            {config.headline || 'Ce que nous proposons'}
          </h2>
          <p style={{ fontSize: 15, color: fg2, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            {config.subheadline || 'Découvrez nos solutions adaptées à vos besoins avec une expertise reconnue.'}
          </p>
        </div>

        {/* Grille de services */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'stretch' }}>
          {services.map((service, i) => (
            <div
              key={service.id}
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                border: `1.5px solid ${service.featured ? p : (isDark ? 'rgba(255,255,255,0.08)' : border)}`,
                borderRadius: 20,
                padding: '32px 24px',
                display: 'flex', flexDirection: 'column',
                transition: 'all 0.3s',
                animation: `fadeUp 0.5s ease both ${i * 0.1}s`,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: service.featured ? (isDark ? `0 20px 40px ${p}30` : `0 20px 40px ${p}20`) : '0 4px 20px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; if(!service.featured) e.currentTarget.style.borderColor = `${p}40`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; if(!service.featured) e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : border; }}
            >
              {service.featured && (
                <div style={{ position: 'absolute', top: 0, right: 0, background: p, color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderBottomLeftRadius: 16, letterSpacing: '0.05em' }}>
                  RECOMMANDÉ
                </div>
              )}
              
              <div style={{ width: 56, height: 56, borderRadius: 16, background: service.featured ? p : `${p}15`, color: service.featured ? '#fff' : p, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>
                {service.icon || '✨'}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 900, color: fg, margin: '0 0 12px' }}>{service.title}</h3>
              <p style={{ fontSize: 14, color: fg2, lineHeight: 1.65, margin: '0 0 24px', flex: 1 }}>{service.description}</p>
              
              <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: service.featured ? p : fg }}>{service.price}</div>
                {config.ctaLink && (
                  <button onClick={handleCTA} style={{ background: 'none', border: 'none', color: p, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', padding: 0 }}>
                    En savoir plus <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Global CTA */}
        {config.showGlobalCTA && config.ctaLink && (
          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <button
              onClick={handleCTA}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '16px 36px', borderRadius: 999,
                background: `linear-gradient(135deg, ${p}, ${acc})`,
                color: '#fff', border: 'none', fontWeight: 800,
                fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: `0 8px 24px ${p}35`,
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 16px 40px ${p}50`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 8px 24px ${p}35`; }}
            >
              {config.globalCTAText || 'Demander un accompagnement'} <ArrowRight size={18} />
            </button>
          </div>
        )}

        <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>
      </div>
    </section>
  );
}
