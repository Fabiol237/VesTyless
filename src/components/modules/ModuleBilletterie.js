'use client';
import { useState, useRef, useEffect } from 'react';
import { Ticket, Calendar, Clock, MapPin, Users, Info, Plus, ChevronRight, CheckCircle2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE BILLETTERIE — Gestion d'événements et achat de billets
// Configurable: layout grid/list, champs de formulaire, affichage lieu/date
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_EVENTS = [
  { id: 1, title: 'Concert Symphonique', date: '2025-08-15T20:00:00Z', location: 'Grand Théâtre National', price: 15000, category: 'Musique', image_url: null, stock: 150 },
  { id: 2, title: 'Masterclass : Entrepreneuriat', date: '2025-09-02T09:00:00Z', location: 'Hôtel Radisson Blu', price: 50000, category: 'Business', image_url: null, stock: 50 },
  { id: 3, title: 'Festival des Saveurs', date: '2025-10-10T10:00:00Z', location: 'Place de l\'Indépendance', price: 5000, category: 'Gastronomie', image_url: null, stock: 500 },
];

export default function ModuleBilletterie({
  config = {}, store = {}, theme = {},
  isMobile, storeId, preview, onAddToCart, currency = 'XOF'
}) {
  const [events, setEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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
    if (preview || !storeId) {
      setEvents(DEMO_EVENTS);
      setCategories([...new Set(DEMO_EVENTS.map(e => e.category))]);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data } = await supabase.from('events').select('*').eq('store_id', storeId).order('date', { ascending: true });
        if (data?.length) {
          setEvents(data);
          setCategories([...new Set(data.map(e => e.category).filter(Boolean))]);
        } else {
          setEvents(DEMO_EVENTS);
          setCategories([...new Set(DEMO_EVENTS.map(e => e.category))]);
        }
      } catch { setEvents(DEMO_EVENTS); }
      setLoading(false);
    })();
  }, [storeId, preview]);

  const filtered = activeCategory === 'all' ? events : events.filter(e => e.category === activeCategory);

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
            <Ticket size={13} /> Billetterie
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 900, color: fg, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            {config.headline || 'Événements à venir'}
          </h2>
          <p style={{ fontSize: 15, color: fg2, maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
            {config.subheadline || 'Réservez vos places dès maintenant pour nos prochains événements.'}
          </p>
        </div>

        {/* Filtres Catégories */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', overflowX: 'auto', paddingBottom: 16, marginBottom: 24, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveCategory('all')}
              style={{ padding: '8px 18px', borderRadius: 999, border: activeCategory === 'all' ? `1px solid ${p}` : `1.5px solid ${border}`, background: activeCategory === 'all' ? p : 'transparent', color: activeCategory === 'all' ? '#fff' : fg2, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.25s', whiteSpace: 'nowrap' }}
            >
              Tous les événements
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{ padding: '8px 18px', borderRadius: 999, border: activeCategory === cat ? `1px solid ${p}` : `1.5px solid ${border}`, background: activeCategory === cat ? p : 'transparent', color: activeCategory === cat ? '#fff' : fg2, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.25s', whiteSpace: 'nowrap' }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Liste d'événements */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {filtered.map((event, i) => {
              const d = new Date(event.date);
              const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
              const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={event.id}
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : border}`,
                    borderRadius: 20, overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                    transition: 'all 0.3s',
                    animation: `fadeUp 0.5s ease both ${i * 0.08}s`,
                    boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.03)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${p}15`; e.currentTarget.style.borderColor = `${p}40`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isDark ? '0 16px 40px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : border; }}
                >
                  <div style={{ position: 'relative', height: 180, background: isDark ? '#1a1a2e' : `${p}10` }}>
                    {event.image_url ? (
                      <img src={event.image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Ticket size={48} color={`${p}40`} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#fff', padding: '6px 12px', borderRadius: 12, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{d.toLocaleDateString('fr-FR', { month: 'short' })}</div>
                      <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{d.getDate()}</div>
                    </div>
                  </div>

                  <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: p, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{event.category}</div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: fg, margin: '0 0 16px', lineHeight: 1.3 }}>{event.title}</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: fg2, fontSize: 13, fontWeight: 600 }}>
                        <Calendar size={16} color={p} /> {dateStr}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: fg2, fontSize: 13, fontWeight: 600 }}>
                        <Clock size={16} color={p} /> {timeStr}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: fg2, fontSize: 13, fontWeight: 600 }}>
                        <MapPin size={16} color={p} /> {event.location}
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : border}` }}>
                      <div>
                        <div style={{ fontSize: 11, color: fg2, fontWeight: 700, textTransform: 'uppercase' }}>Tarif</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: fg }}>{event.price === 0 ? 'Gratuit' : fmt(event.price)}</div>
                      </div>
                      <button
                        onClick={() => onAddToCart?.(event)}
                        disabled={event.stock === 0}
                        style={{
                          padding: '10px 20px', borderRadius: 10,
                          background: event.stock === 0 ? (isDark ? '#333' : '#e2e8f0') : `linear-gradient(135deg, ${p}, ${acc})`,
                          color: event.stock === 0 ? fg2 : '#fff',
                          border: 'none', fontWeight: 800, fontSize: 13,
                          cursor: event.stock === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                          boxShadow: event.stock === 0 ? 'none' : `0 6px 16px ${p}40`,
                          transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        {event.stock === 0 ? 'Complet' : <><Ticket size={16} /> Réserver</>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: fg2 }}>
            <Calendar size={48} color={`${p}40`} style={{ marginBottom: 16 }} />
            <p style={{ fontWeight: 700, color: fg, fontSize: 16 }}>Aucun événement prévu pour le moment.</p>
          </div>
        )}

        <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>
      </div>
    </section>
  );
}
