'use client';
export default function BookingBlock({ variant = 'whatsapp', settings = {}, content = {}, theme = {} }) {
  const { bgColor = '#f9fafb', accentColor = '#6366f1', showDate = true, showTime = true, showGuests = false, paddingTop = 60, paddingBottom = 60 } = settings;
  const { title = 'Réserver', subtitle = '', whatsapp = '', ctaText = 'Réserver maintenant' } = content;
  const primary = theme.primaryColor || accentColor;
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(1);

  const handleBook = () => {
    if (whatsapp) {
      const msg = `Bonjour, je souhaite réserver${date ? ` le ${date}` : ''}${time ? ` à ${time}` : ''}${showGuests ? ` pour ${guests} personne(s)` : ''}.`;
      window.open(`https://wa.me/${whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  return (
    <section style={{ background: bgColor, paddingTop, paddingBottom }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
        {title && <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: subtitle ? 8 : 32 }}>{title}</h2>}
        {subtitle && <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 32 }}>{subtitle}</p>}
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {showDate && (
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 6 }}>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${date ? primary : '#e5e7eb'}`, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
            {showTime && (
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 6 }}>Heure</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${time ? primary : '#e5e7eb'}`, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
            {showGuests && (
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 6 }}>Nombre de personnes</label>
                <input type="number" min={1} max={20} value={guests} onChange={e => setGuests(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
            <button onClick={handleBook} style={{ padding: '14px', borderRadius: 10, border: 'none', background: primary, color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', marginTop: 8 }}>
              {whatsapp ? '💬 ' : ''}{ctaText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
