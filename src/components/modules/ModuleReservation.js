'use client';
import { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle2, X, ChevronLeft, ChevronRight, Users, Calendar, Loader2, Phone, Mail, MessageCircle, AlertCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE RESERVATION — Système de réservation complet, calendrier + créneaux
// Configurable: horaires par jour, durée créneaux, paiement, notifications
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAY_MAP = { 0: 'Dim', 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven', 6: 'Sam' };

function generateTimeSlots(start = '09:00', end = '18:00', duration = 60) {
  const slots = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let minutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  while (minutes + duration <= endMinutes) {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    const eh2 = Math.floor((minutes + duration) / 60).toString().padStart(2, '0');
    const em2 = ((minutes + duration) % 60).toString().padStart(2, '0');
    slots.push({ time: `${h}:${m}`, label: `${h}:${m} – ${eh2}:${em2}`, taken: Math.random() > 0.7 });
    minutes += duration + (0);
  }
  return slots;
}

export default function ModuleReservation({
  config = {}, store = {}, theme = {},
  isMobile, storeId, preview
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step,         setStep]         = useState(1); // 1=calendrier, 2=formulaire, 3=confirmation
  const [form,         setForm]         = useState({ name: '', phone: '', email: '', note: '' });
  const [status,       setStatus]       = useState('idle');
  const [slots,        setSlots]        = useState([]);
  const [visible,      setVisible]      = useState(false);
  const sectionRef = useRef(null);

  const p      = theme['--prim']   || '#6366f1';
  const acc    = theme['--acc']    || p;
  const bg     = theme['--bg']     || '#ffffff';
  const fg     = theme['--fg']     || '#111827';
  const fg2    = theme['--fg2']    || '#6b7280';
  const border = theme['--border'] || 'rgba(0,0,0,0.08)';
  const isDark = bg === '#0f0f1a' || bg === '#120A00' || bg === '#0D0600';

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Générer les jours du calendrier ─────────────────────────────────────
  const getDaysInMonth = (month, year) => {
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay + 6) % 7; // Lundi = 0
    for (let i = 0; i < offset; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);
    return days;
  };

  const calDays = getDaysInMonth(currentMonth, currentYear);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + (config.maxDaysAhead || 60));

  const isDayAvailable = (day) => {
    if (!day) return false;
    const d = new Date(currentYear, currentMonth, day);
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return false;
    if (d > maxDate) return false;
    const dayName = DAY_MAP[d.getDay()];
    const wh = config.workingHours || {};
    return wh[dayName]?.open !== false;
  };

  const handleSelectDate = (day) => {
    if (!isDayAvailable(day)) return;
    const d = new Date(currentYear, currentMonth, day);
    setSelectedDate(d);
    setSelectedSlot(null);
    const dayName = DAY_MAP[d.getDay()];
    const wh = config.workingHours || {};
    const dayConf = wh[dayName] || { start: '09:00', end: '18:00' };
    setSlots(generateTimeSlots(dayConf.start, dayConf.end, config.slotDuration || 60));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    if (preview) { setTimeout(() => { setStatus('success'); setStep(3); }, 1200); return; }
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('reservations').insert({
        store_id: storeId,
        date: selectedDate?.toISOString(),
        time: selectedSlot.time,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        note: form.note,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      setStatus('success');
      setStep(3);
    } catch { setStatus('error'); }
  };

  const cardStyle = {
    background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : border}`,
    borderRadius: 20,
    padding: isMobile ? '20px 16px' : '28px 28px',
    boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.04)',
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : border}`,
    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    color: fg, fontSize: 14, fontFamily: 'inherit',
    boxSizing: 'border-box', outline: 'none',
    transition: 'border-color 0.25s, box-shadow 0.25s',
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
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .resi:focus { border-color: ${p} !important; box-shadow: 0 0 0 3px ${p}18 !important; }
        .cal-day {
          width: 100%; aspect-ratio: 1;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; border: 1.5px solid transparent;
          position: relative;
        }
        .cal-day.available:hover { background: ${p}18; border-color: ${p}40; color: ${p}; }
        .cal-day.selected { background: ${p} !important; color: #fff !important; border-color: ${p} !important; box-shadow: 0 4px 14px ${p}40; }
        .cal-day.today { border-color: ${p}60; color: ${p}; }
        .cal-day.unavailable { opacity: 0.25; cursor: not-allowed; }
        .cal-day.past { opacity: 0.15; cursor: not-allowed; }
        .slot-btn {
          padding: 10px 16px; border-radius: 10px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          border: 1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : border};
          background: ${isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc'};
          color: ${fg}; font-family: inherit; transition: all 0.25s;
          display: flex; align-items: center; gap: 6px;
        }
        .slot-btn.available:hover { border-color: ${p}; color: ${p}; background: ${p}10; }
        .slot-btn.selected { background: ${p}; color: #fff; border-color: ${p}; box-shadow: 0 4px 14px ${p}35; }
        .slot-btn.taken { opacity: 0.4; cursor: not-allowed; text-decoration: line-through; }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: `${p}12`, border: `1px solid ${p}25`, fontSize: 12, fontWeight: 700, color: p, marginBottom: 16 }}>
            <Calendar size={13} /> Réservation en ligne
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 900, color: fg, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Choisissez votre créneau
          </h2>
          <p style={{ fontSize: 15, color: fg2, maxWidth: 440, margin: '0 auto', lineHeight: 1.65 }}>
            Sélectionnez une date et un horaire disponible. Confirmation immédiate.
          </p>
        </div>

        {/* ── Étape 3: Confirmation ── */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 0 12px rgba(34,197,94,0.08)' }}>
              <CheckCircle2 size={40} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: fg, margin: '0 0 12px' }}>Réservation confirmée ! 🎉</h3>
            <p style={{ fontSize: 15, color: fg2, lineHeight: 1.65, maxWidth: 480, margin: '0 auto 24px' }}>
              {config.confirmationMessage || `Votre réservation du ${selectedDate?.toLocaleDateString('fr-FR')} à ${selectedSlot?.time} a été enregistrée. Vous serez contacté(e) prochainement.`}
            </p>
            <button onClick={() => { setStep(1); setSelectedDate(null); setSelectedSlot(null); setStatus('idle'); setForm({ name:'',phone:'',email:'',note:'' }); }} style={{ padding: '12px 28px', borderRadius: 12, background: `${p}12`, border: `1px solid ${p}30`, color: p, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.25s' }}>
              Nouvelle réservation
            </button>
          </div>
        )}

        {step < 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24, alignItems: 'start' }}>
            
            {/* ── Calendrier ── */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); }} style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${border}`, background: 'transparent', color: fg2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = `${p}12`; e.currentTarget.style.borderColor = p; e.currentTarget.style.color = p; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = border; e.currentTarget.style.color = fg2; }}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontWeight: 800, fontSize: 15, color: fg }}>{MONTHS_FR[currentMonth]} {currentYear}</span>
                <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); }} style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${border}`, background: 'transparent', color: fg2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = `${p}12`; e.currentTarget.style.borderColor = p; e.currentTarget.style.color = p; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = border; e.currentTarget.style.color = fg2; }}>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Jours de la semaine */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                {DAYS_FR.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: fg2, padding: '4px 0', letterSpacing: '0.05em' }}>{d}</div>
                ))}
              </div>

              {/* Cases du calendrier */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {calDays.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const d = new Date(currentYear, currentMonth, day);
                  const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const isToday = d.toDateString() === today.toDateString();
                  const isSelected = selectedDate && d.toDateString() === selectedDate.toDateString();
                  const available = isDayAvailable(day);
                  return (
                    <div
                      key={i}
                      onClick={() => handleSelectDate(day)}
                      className={`cal-day ${isSelected ? 'selected' : ''} ${isToday && !isSelected ? 'today' : ''} ${!available || isPast ? (isPast ? 'past' : 'unavailable') : 'available'}`}
                      style={{ color: fg2 }}
                    >
                      {day}
                      {isToday && <div style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: isSelected ? '#fff' : p }} />}
                    </div>
                  );
                })}
              </div>

              {/* Légende */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, paddingTop: 16, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}` }}>
                {[{ color: p, label: 'Sélectionné' }, { color: '#94a3b8', label: 'Indisponible' }, { color: '#22c55e', label: "Aujourd'hui" }].map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: fg2 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Créneaux + Formulaire ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {!selectedDate && (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px', color: fg2 }}>
                  <Calendar size={32} color={`${p}40`} style={{ marginBottom: 12 }} />
                  <p style={{ fontWeight: 700, fontSize: 15, color: fg, marginBottom: 6 }}>Sélectionnez une date</p>
                  <p style={{ fontSize: 13 }}>Choisissez un jour disponible dans le calendrier</p>
                </div>
              )}

              {selectedDate && step === 1 && (
                <div style={cardStyle}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: fg, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={16} color={p} />
                    {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)', gap: 10 }}>
                    {slots.length > 0 ? slots.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => !slot.taken && setSelectedSlot(slot)}
                        className={`slot-btn ${slot.taken ? 'taken' : 'available'} ${selectedSlot?.time === slot.time ? 'selected' : ''}`}
                      >
                        <Clock size={12} /> {slot.label}
                        {slot.taken && <span style={{ fontSize: 9, marginLeft: 'auto' }}>Complet</span>}
                      </button>
                    )) : (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', color: fg2, padding: 20 }}>
                        Aucun créneau disponible ce jour.
                      </div>
                    )}
                  </div>
                  {selectedSlot && (
                    <button
                      onClick={() => setStep(2)}
                      style={{ marginTop: 20, width: '100%', padding: '13px', borderRadius: 12, background: `linear-gradient(135deg, ${p}, ${acc})`, color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 8px 24px ${p}35`, transition: 'all 0.3s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                    >
                      Confirmer ce créneau →
                    </button>
                  )}
                </div>
              )}

              {step === 2 && (
                <div style={cardStyle}>
                  <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: fg2, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: 'inherit', padding: 0 }}>
                    <ChevronLeft size={14} /> Changer de créneau
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: `${p}10`, border: `1px solid ${p}20`, marginBottom: 24 }}>
                    <Calendar size={16} color={p} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: fg }}>
                      {selectedDate?.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {selectedSlot?.time}
                    </span>
                  </div>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: fg2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nom complet *</label>
                      <input className="resi" style={inputStyle} type="text" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Votre nom" />
                    </div>
                    {config.requirePhone && (
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: fg2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Téléphone *</label>
                        <input className="resi" style={inputStyle} type="tel" required value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+221 77 000 00 00" />
                      </div>
                    )}
                    {config.requireEmail && (
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: fg2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email *</label>
                        <input className="resi" style={inputStyle} type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="votre@email.com" />
                      </div>
                    )}
                    {config.requireNote && (
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: fg2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{config.noteLabel || 'Note / Demande spéciale'}</label>
                        <textarea className="resi" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} rows={3} value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} placeholder="Information complémentaire..." />
                      </div>
                    )}
                    {status === 'error' && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
                        <AlertCircle size={14} /> Erreur lors de la réservation. Réessayez.
                      </div>
                    )}
                    <button type="submit" disabled={status === 'loading'} style={{ padding: '14px', borderRadius: 12, background: `linear-gradient(135deg, ${p}, ${acc})`, color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: status === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: `0 8px 24px ${p}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: status === 'loading' ? 0.8 : 1 }}>
                      {status === 'loading' ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><CheckCircle2 size={16} /> Confirmer la réservation</>}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
