'use client';
import { useState, useMemo } from 'react';
import { getStoreBlocks } from '@/lib/storeBlocks';

export default function TemplatePresta({ store, themeVars, storeId, currency = 'FCFA', productsProp, isMobile }) {
  const blocks = useMemo(() => getStoreBlocks(store), [store]);

  const [activeTab, setActiveTab] = useState('services');
  const [quoteModal, setQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'Consulting & Strategie',
    budget: '500.000 - 1.000.000 FCFA',
    details: ''
  });
  const [quoteSent, setQuoteSent] = useState(false);

  const config = store?.layout_config || {};
  const name = store?.name || blocks.hero.title || 'Cabinet Advisory & Services';
  const desc = store?.description || blocks.hero.subtitle || 'Nous accompagnons les entreprises et particuliers dans le développement de leurs projets grâce à des solutions sur-mesure et à forte valeur ajoutée.';
  const phone = store?.phone || store?.whatsapp_number || '';
  const wa = phone ? `https://wa.me/${phone.replace(/\D/g, '')}` : '#';
  const fmt = v => new Intl.NumberFormat('fr-FR').format(v || 0) + ' ' + currency;

  // Liste des services (utilisent uniquement les vraies prestations Supabase)
  const servicesList = useMemo(() => {
    if (productsProp && productsProp.length > 0) {
      return productsProp.map(p => ({
        id: p.id,
        title: p.name,
        badge: p.category || 'Service Premium',
        description: p.description || 'Prestation professionnelle réalisée par des experts qualifiés.',
        price: p.price ? fmt(p.price) : 'Sur devis',
        features: ['Diagnostic personnalisé', 'Suivi dédié 7j/7', 'Rapport d\'intervention complet']
      }));
    }
    return [];
  }, [productsProp]);

  // Handle Form Submission for Quote / Appointment
  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.phone) return;
    const msg = `Bonjour ${name} !%0A%0AJe souhaite demander un DEVIS SUR-MESURE :%0A- Nom : ${encodeURIComponent(quoteForm.name)}%0A- Email : ${encodeURIComponent(quoteForm.email)}%0A- Téléphone : ${quoteForm.phone}%0A- Service : ${encodeURIComponent(quoteForm.serviceType)}%0A- Budget estimé : ${encodeURIComponent(quoteForm.budget)}%0A${quoteForm.details ? `- Détails : ${encodeURIComponent(quoteForm.details)}` : ''}`;
    const cleanPhone = phone.replace(/\D/g, '');
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    setQuoteSent(true);
    setTimeout(() => {
      window.open(waUrl, '_blank');
      setQuoteModal(false);
      setQuoteSent(false);
    }, 1000);
  };

  const p = themeVars?.['--prim'] || '#6366F1';
  const bg = themeVars?.['--bg'] || '#0F0C29';
  const fg = themeVars?.['--fg'] || '#FFFFFF';
  const fg2 = themeVars?.['--fg2'] || 'rgba(255,255,255,0.7)';

  return (
    <div style={{ background: bg, color: fg, minHeight: '100vh', fontFamily: themeVars?.['--font'] || 'Inter, sans-serif' }}>

      {/* ── HEADER ── */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,12,41,0.85)', backdropFilter: 'blur(12px)', sticky: 'top', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, tracking: '-0.02em', margin: 0, color: '#FFF', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>💼</span> {name}
            </h1>
            <span style={{ fontSize: 11, color: '#A5B4FC', fontWeight: 600 }}>Services Professionnels & Expertise</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setQuoteModal(true)}
              style={{
                background: `linear-gradient(135deg, ${p}, #A855F7)`,
                color: '#FFF', border: 'none', padding: '12px 22px', borderRadius: 999,
                fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.4)'
              }}
            >
              📋 Obtenir un Devis Gratuit
            </button>
            {phone && (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'rgba(255,255,255,0.08)', color: '#FFF', textDecoration: 'none',
                  padding: '12px 18px', borderRadius: 999, fontWeight: 700, fontSize: 13, border: '1px solid rgba(255,255,255,0.15)'
                }}
              >
                💬 Prise de RDV WhatsApp
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <div style={{
        position: 'relative', padding: '90px 24px 70px', textAlign: 'center',
        background: `radial-gradient(circle at top center, ${p}33 0%, transparent 70%)`
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#A5B4FC', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
          <span>✨</span> Des Solutions Clé en Main pour Votre Réussite
        </div>

        <h2 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)', fontWeight: 900, maxWidth: 850, margin: '0 auto 20px', lineHeight: 1.1, tracking: '-0.03em' }}>
          Propulsez Vos Projets au Niveau Supérieur
        </h2>

        <p style={{ fontSize: '1.05rem', color: fg2, maxWidth: 650, margin: '0 auto 36px', lineHeight: 1.7 }}>
          {desc}
        </p>

        {/* Navigation Onglets */}
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', padding: 5, borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)' }}>
          {[
            ['services', '⚡ Nos Prestations'],
            ['portfolio', '🏆 Projets & Réalisations'],
            ['disponibilites', '🕒 Horaires & Intervention']
          ].map(([tKey, tLabel]) => (
            <button
              key={tKey}
              onClick={() => setActiveTab(tKey)}
              style={{
                background: activeTab === tKey ? p : 'transparent',
                color: '#FFF', border: 'none', padding: '10px 22px', borderRadius: 999,
                fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tLabel}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1 : SERVICES & FORMULES ── */}
      {activeTab === 'services' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h3 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Formules & Tarifs Transparents</h3>
            <p style={{ fontSize: 13, color: fg2, marginTop: 6 }}>Sélectionnez une prestation ou demandez une cotation personnalisée.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {servicesList.map(srv => (
              <div
                key={srv.id}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between', transition: 'all 0.2s', position: 'relative'
                }}
              >
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, background: `${p}30`, color: '#A5B4FC', padding: '4px 12px', borderRadius: 999, display: 'inline-block', marginBottom: 16 }}>
                    {srv.badge}
                  </span>
                  <h4 style={{ fontSize: 20, fontWeight: 900, marginBottom: 10, color: '#FFF' }}>{srv.title}</h4>
                  <p style={{ fontSize: 13, color: fg2, lineHeight: 1.6, marginBottom: 24 }}>{srv.description}</p>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, marginBottom: 24 }}>
                    {srv.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: fg2, marginBottom: 8 }}>
                        <span style={{ color: '#10B981', fontWeight: 900 }}>✓</span> {feat}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: p, marginBottom: 16 }}>{srv.price}</div>
                  <button
                    onClick={() => {
                      setQuoteForm(prev => ({ ...prev, serviceType: srv.title }));
                      setQuoteModal(true);
                    }}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.1)', color: '#FFF',
                      border: '1px solid rgba(255,255,255,0.2)', padding: '12px', borderRadius: 14,
                      fontWeight: 800, fontSize: 13, cursor: 'pointer'
                    }}
                  >
                    Commander ce Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2 : REALIATIONS / PORTFOLIO ── */}
      {activeTab === 'portfolio' && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: 40 }}>
            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Projets Réalisés & Témoignages</h3>
            <p style={{ fontSize: 13, color: fg2, lineHeight: 1.7, marginBottom: 32 }}>
              Nous sommes fiers d&apos;accompagner nos clients avec passion et exigence dans l&apos;atteinte de leurs objectifs.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 18 }}>⭐⭐⭐⭐⭐</div>
                <p style={{ fontSize: 13, fontStyle: 'italic', color: fg2, margin: '12px 0' }}>
                  &ldquo;Une équipe ultra-réactive et un travail d&apos;une précision exemplaire. Le projet a été livré avec 3 jours d&apos;avance !&rdquo;
                </p>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#FFF' }}>— Direction Générale, Afrique Tech</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 18 }}>⭐⭐⭐⭐⭐</div>
                <p style={{ fontSize: 13, fontStyle: 'italic', color: fg2, margin: '12px 0' }}>
                  &ldquo;Le devis était clair et sans frais cachés. Le suivi hebdomadaire sur WhatsApp a fait toute la différence.&rdquo;
                </p>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#FFF' }}>— Paul M., Entrepreneur Général</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3 : HORAIRES & DISPONIBILITÉS ── */}
      {activeTab === 'disponibilites' && (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>🕒</span> Plages Horaires d&apos;Intervention & Consultation
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { day: 'Lundi', key: 'monday' },
                { day: 'Mardi', key: 'tuesday' },
                { day: 'Mercredi', key: 'wednesday' },
                { day: 'Jeudi', key: 'thursday' },
                { day: 'Vendredi', key: 'friday' },
                { day: 'Samedi', key: 'saturday' },
                { day: 'Dimanche', key: 'sunday' },
              ].map(({ day, key }) => {
                const dayConf = config.opening_hours?.[key];
                const isClosed = dayConf?.closed;
                const hoursText = isClosed ? 'Indisponible' : `${dayConf?.open || '08:00'} - ${dayConf?.close || '18:00'}`;

                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 14 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{day}</span>
                    <span style={{ fontSize: 13, color: isClosed ? '#EF4444' : '#A5B4FC', fontWeight: 800 }}>{hoursText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DEMANDE DE DEVIS ── */}
      {quoteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0F0C29', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 28, maxWidth: 500, width: '100%', padding: 32, position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            <button onClick={() => setQuoteModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#FFF', fontSize: 20, cursor: 'pointer' }}>✕</button>

            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, color: '#FFF' }}>Demande de Devis Gratuit</h3>
            <p style={{ fontSize: 12, color: fg2, marginBottom: 24 }}>Réponse sous 24h ouvrées & estimation directe sur WhatsApp.</p>

            {quoteSent ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div style={{ fontSize: 48 }}>⚡</div>
                <h4 style={{ fontSize: 18, fontWeight: 800, marginTop: 12, color: '#10B981' }}>Devis Généré avec Succès !</h4>
                <p style={{ fontSize: 12, color: fg2, marginTop: 4 }}>Ouverture du canal WhatsApp pour l&apos;envoi instantané...</p>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: fg2, display: 'block', marginBottom: 4 }}>Nom / Raison Sociale</label>
                  <input required type="text" placeholder="Ex: Société ABC" value={quoteForm.name} onChange={e => setQuoteForm({...quoteForm, name: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px', color: '#FFF', outline: 'none', fontSize: 13 }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: fg2, display: 'block', marginBottom: 4 }}>Téléphone WhatsApp</label>
                    <input required type="tel" placeholder="Ex: 699001122" value={quoteForm.phone} onChange={e => setQuoteForm({...quoteForm, phone: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px', color: '#FFF', outline: 'none', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: fg2, display: 'block', marginBottom: 4 }}>Email</label>
                    <input type="email" placeholder="contact@domaine.com" value={quoteForm.email} onChange={e => setQuoteForm({...quoteForm, email: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px', color: '#FFF', outline: 'none', fontSize: 13 }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: fg2, display: 'block', marginBottom: 4 }}>Prestation Souhaitée</label>
                  <input type="text" value={quoteForm.serviceType} onChange={e => setQuoteForm({...quoteForm, serviceType: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px', color: '#FFF', outline: 'none', fontSize: 13 }} />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: fg2, display: 'block', marginBottom: 4 }}>Description du Projet</label>
                  <textarea rows="3" placeholder="Expliquez brièvement vos besoins et délais..." value={quoteForm.details} onChange={e => setQuoteForm({...quoteForm, details: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px', color: '#FFF', outline: 'none', fontSize: 13, resize: 'none' }} />
                </div>

                <button type="submit" style={{ marginTop: 8, background: `linear-gradient(135deg, ${p}, #A855F7)`, color: '#FFF', border: 'none', padding: '14px', borderRadius: 14, fontWeight: 900, fontSize: 14, cursor: 'pointer' }}>
                  Envoyer la Demande de Devis 🚀
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
