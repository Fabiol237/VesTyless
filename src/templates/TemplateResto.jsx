'use client';
import { useState, useEffect, useMemo } from 'react';

export default function TemplateResto({ store, themeVars, storeId, currency = 'FCFA', productsProp, isMobile }) {
  const [activeTab, setActiveTab] = useState('menu');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [reservationModal, setReservationModal] = useState(false);
  const [resForm, setResForm] = useState({
    name: '',
    phone: '',
    guests: '2',
    date: new Date().toISOString().split('T')[0],
    time: '19:30',
    notes: ''
  });
  const [resSuccess, setResSuccess] = useState(false);

  const config = store?.layout_config || {};
  const name = store?.name || 'Le Bistro Gourmand';
  const desc = store?.description || 'Une cuisine authentique élaborée à partir d\'ingrédients locaux et de saison. Venez vivre une expérience gustative inoubliable.';
  const phone = store?.phone || store?.whatsapp_number || '';
  const wa = phone ? `https://wa.me/${phone.replace(/\D/g, '')}` : '#';
  const fmt = v => new Intl.NumberFormat('fr-FR').format(v || 0) + ' ' + currency;

  // Calcul du statut d'ouverture en direct
  const isOpenNow = useMemo(() => {
    const hours = config.opening_hours;
    if (!hours) return { open: true, text: 'Ouvert 7j/7 • 08h00 - 22h00' };
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const dayConfig = hours[currentDay];
    if (!dayConfig || dayConfig.closed) {
      return { open: false, text: 'Fermé aujourd\'hui' };
    }
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = (dayConfig.open || '08:00').split(':').map(Number);
    const [closeH, closeM] = (dayConfig.close || '22:00').split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    const open = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    return {
      open,
      text: open ? `Ouvert aujourd'hui (${dayConfig.open} - ${dayConfig.close})` : `Fermé • Ouvre à ${dayConfig.open}`
    };
  }, [config.opening_hours]);

  // Menus / Plats (utilisent uniquement les vrais produits Supabase)
  const menuItems = useMemo(() => {
    if (productsProp && productsProp.length > 0) {
      return productsProp.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category || 'Plats Principaux',
        description: p.description || 'Préparation maison aux saveurs fraîches et raffinées.',
        price: p.price,
        image_url: p.image_url,
      }));
    }
    return [];
  }, [productsProp]);

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(menuItems.map(i => i.category))];
    return cats;
  }, [menuItems]);

  const filteredItems = categoryFilter === 'all' ? menuItems : menuItems.filter(i => i.category === categoryFilter);

  // Soumission de réservation sur WhatsApp
  const handleReservationSubmit = (e) => {
    e.preventDefault();
    if (!resForm.name || !resForm.phone) return;
    const msg = `Bonjour ${name} !%0A%0AJe souhaite réserver une table :%0A- Nom : ${encodeURIComponent(resForm.name)}%0A- Personnes : ${resForm.guests}%0A- Date : ${resForm.date}%0A- Heure : ${resForm.time}%0A${resForm.notes ? `- Notes : ${encodeURIComponent(resForm.notes)}` : ''}`;
    const cleanPhone = phone.replace(/\D/g, '');
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    setResSuccess(true);
    setTimeout(() => {
      window.open(waUrl, '_blank');
      setReservationModal(false);
      setResSuccess(false);
    }, 1000);
  };

  const p = themeVars?.['--prim'] || '#C87D55';
  const bg = themeVars?.['--bg'] || '#1C0A00';
  const fg = themeVars?.['--fg'] || '#FFFFFF';
  const fg2 = themeVars?.['--fg2'] || 'rgba(255,255,255,0.7)';

  return (
    <div style={{ background: bg, color: fg, minHeight: '100vh', fontFamily: themeVars?.['--font'] || 'Outfit, sans-serif' }}>
      
      {/* ── HEADER & BARRE DE STATUT ── */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', sticky: 'top', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, tracking: '-0.02em', margin: 0, color: '#FFF' }}>{name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: isOpenNow.open ? '#10B981' : '#EF4444' }} />
              <span style={{ fontSize: 12, color: isOpenNow.open ? '#34D399' : '#FCA5A5', fontWeight: 700 }}>{isOpenNow.text}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setReservationModal(true)}
              style={{
                background: `linear-gradient(135deg, ${p}, #FF6B35)`,
                color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: 999,
                fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 16px rgba(200,125,85,0.4)'
              }}
            >
              🍷 Réserver une Table
            </button>
            {phone && (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'rgba(255,255,255,0.1)', color: '#FFF', textDecoration: 'none',
                  padding: '10px 16px', borderRadius: 999, fontWeight: 700, fontSize: 13, border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                📱 Contact WhatsApp
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <div style={{
        position: 'relative', padding: '80px 24px 60px', textAlign: 'center',
        background: `radial-gradient(circle at center, ${p}22 0%, transparent 70%)`
      }}>
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: p, display: 'block', marginBottom: 12 }}>
          L&apos;Art de la Gastronomie
        </span>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, maxWidth: 800, margin: '0 auto 16px', lineHeight: 1.1 }}>
          Savoir-Faire & Ingrédients d&apos;Exception
        </h2>
        <p style={{ fontSize: '1rem', color: fg2, maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
          {desc}
        </p>

        {/* Navigation Onglets */}
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.08)', padding: 4, borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)' }}>
          {[['menu', '🍽️ Notre Carte'], ['histoire', '✨ Le Concept'], ['horaires', '🕒 Horaires & Accès']].map(([tabKey, tabLabel]) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              style={{
                background: activeTab === tabKey ? p : 'transparent',
                color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: 999,
                fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tabLabel}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1 : LA CARTE DU RESTAURANT ── */}
      {activeTab === 'menu' && (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px' }}>
          
          {/* Filtres de catégories */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 24, justifyContent: 'center' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  background: categoryFilter === cat ? '#FFF' : 'rgba(255,255,255,0.06)',
                  color: categoryFilter === cat ? '#000' : fg2,
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'capitalize'
                }}
              >
                {cat === 'all' ? 'Toutes les créations' : cat}
              </button>
            ))}
          </div>

          {/* Grille des Plats */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(420px, 1fr))', gap: 20 }}>
            {filteredItems.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20, padding: 24, display: 'flex', gap: 20, alignItems: 'center',
                  transition: 'all 0.2s hover:border-color'
                }}
              >
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} style={{ width: 90, height: 90, borderRadius: 16, objectFit: 'cover' }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#FFF' }}>{item.name}</h3>
                    <span style={{ fontSize: 15, fontWeight: 900, color: p, whiteSpace: 'nowrap' }}>{fmt(item.price)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: fg2, margin: 0, lineHeight: 1.5 }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2 : HISTOIRE & CONCEPT ── */}
      {activeTab === 'histoire' && (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '40px 32px' }}>
            <span style={{ fontSize: 40 }}>🍷</span>
            <h3 style={{ fontSize: 24, fontWeight: 900, marginTop: 16, marginBottom: 12 }}>Notre Philosophie Culinaire</h3>
            <p style={{ fontSize: 14, color: fg2, lineHeight: 1.8, marginBottom: 24 }}>
              Chaque jour, notre chef sélectionne les meilleurs arrivages auprès des producteurs locaux pour confectionner des recettes équilibrées, généreuses et savoureuses.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: p }}>100%</div>
                <div style={{ fontSize: 11, color: fg2, marginTop: 4 }}>Produits Frais</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: p }}>Artisanal</div>
                <div style={{ fontSize: 11, color: fg2, marginTop: 4 }}>Fait Maison</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: p }}>Éthique</div>
                <div style={{ fontSize: 11, color: fg2, marginTop: 4 }}>Circuit Court</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3 : HORAIRES & ACCÈS ── */}
      {activeTab === 'horaires' && (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>🕒</span> Horaires d&apos;Ouverture Hebdomadaires
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
                const hoursText = isClosed ? 'Fermé' : `${dayConf?.open || '08:00'} - ${dayConf?.close || '22:00'}`;

                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 14 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{day}</span>
                    <span style={{ fontSize: 13, color: isClosed ? '#EF4444' : p, fontWeight: 800 }}>{hoursText}</span>
                  </div>
                );
              })}
            </div>

            {store?.city && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: fg2 }}>
                📍 Localisation : <strong style={{ color: '#FFF' }}>{store.city}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL RÉSERVATION TABLE ── */}
      {reservationModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1C0A00', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 28, maxWidth: 480, width: '100%', padding: 32, position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <button onClick={() => setReservationModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#FFF', fontSize: 20, cursor: 'pointer' }}>✕</button>

            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, color: '#FFF' }}>Réserver une Table</h3>
            <p style={{ fontSize: 12, color: fg2, marginBottom: 24 }}>Confirmation immédiate par notification WhatsApp.</p>

            {resSuccess ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div style={{ fontSize: 48 }}>✅</div>
                <h4 style={{ fontSize: 18, fontWeight: 800, marginTop: 12, color: '#10B981' }}>Demande Prête !</h4>
                <p style={{ fontSize: 12, color: fg2, marginTop: 4 }}>Redirection vers WhatsApp pour l&apos;envoi instantané...</p>
              </div>
            ) : (
              <form onSubmit={handleReservationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: fg2, display: 'block', marginBottom: 4 }}>Votre Nom Complet</label>
                  <input required type="text" placeholder="Ex: Marc Dupont" value={resForm.name} onChange={e => setResForm({...resForm, name: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px', color: '#FFF', outline: 'none', fontSize: 13 }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: fg2, display: 'block', marginBottom: 4 }}>Téléphone</label>
                    <input required type="tel" placeholder="Ex: 699001122" value={resForm.phone} onChange={e => setResForm({...resForm, phone: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px', color: '#FFF', outline: 'none', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: fg2, display: 'block', marginBottom: 4 }}>Couverts</label>
                    <select value={resForm.guests} onChange={e => setResForm({...resForm, guests: e.target.value})} style={{ width: '100%', background: '#261104', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px', color: '#FFF', outline: 'none', fontSize: 13 }}>
                      {[1,2,3,4,5,6,8,10,12].map(n => <option key={n} value={n}>{n} personne{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: fg2, display: 'block', marginBottom: 4 }}>Date Souhaitée</label>
                    <input type="date" value={resForm.date} onChange={e => setResForm({...resForm, date: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px', color: '#FFF', outline: 'none', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: fg2, display: 'block', marginBottom: 4 }}>Heure</label>
                    <input type="time" value={resForm.time} onChange={e => setResForm({...resForm, time: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px', color: '#FFF', outline: 'none', fontSize: 13 }} />
                  </div>
                </div>

                <button type="submit" style={{ marginTop: 8, background: `linear-gradient(135deg, ${p}, #FF6B35)`, color: '#FFF', border: 'none', padding: '14px', borderRadius: 14, fontWeight: 900, fontSize: 14, cursor: 'pointer' }}>
                  Envoyer ma Réservation WhatsApp 🚀
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
