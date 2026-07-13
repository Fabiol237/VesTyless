'use client';
import { useState, useEffect } from 'react';

function useCountdown(targetDate) {
  const calc = () => {
    const now  = Date.now();
    const end  = new Date(targetDate).getTime();
    const diff = Math.max(0, end - now);
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
      expired: diff === 0,
    };
  };
  const [time, setTime] = useState(calc());
  useEffect(() => {
    if (!targetDate) return;
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return time;
}

function Digit({ value, label, digitBg, textColor }) {
  const val = String(value).padStart(2, '0');
  return (
    <div style={{ textAlign: 'center', minWidth: '70px' }}>
      <div style={{
        background: digitBg,
        borderRadius: '12px', padding: '12px 8px',
        fontSize: '2.5rem', fontWeight: '900', color: textColor,
        lineHeight: 1, marginBottom: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        minWidth: '70px',
      }}>
        {val}
      </div>
      <div style={{ fontSize: '11px', fontWeight: '600', color: textColor, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
    </div>
  );
}

export default function CountdownBlock({ config = {}, theme = {} }) {
  const {
    title = '⚡ Offre Flash — Temps restant :',
    targetDate = new Date(Date.now() + 86400000 * 3).toISOString(),
    expiredText = 'L\'offre a expiré !',
    ctaText = 'Profiter de l\'offre',
    ctaLink = '#',
    bgColor = '#7c3aed',
    textColor = '#ffffff',
    digitBg = 'rgba(255,255,255,0.15)',
    showDays = true,
    showHours = true,
    showMinutes = true,
    showSeconds = true,
    paddingTop = 40,
    paddingBottom = 40,
  } = config;

  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

  return (
    <section style={{ background: bgColor, paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        {title && (
          <h2 style={{ fontSize: 'clamp(1.1rem,3vw,1.5rem)', fontWeight: '800', color: textColor, margin: '0 0 28px', lineHeight: 1.3 }}>
            {title}
          </h2>
        )}
        {expired ? (
          <p style={{ fontSize: '1.25rem', fontWeight: '700', color: textColor, opacity: 0.85 }}>{expiredText}</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
            {showDays    && <><Digit value={days}    label="Jours"   digitBg={digitBg} textColor={textColor} /><span style={{ fontSize: '2rem', color: textColor, opacity: 0.4, fontWeight: '300' }}>:</span></>}
            {showHours   && <><Digit value={hours}   label="Heures"  digitBg={digitBg} textColor={textColor} /><span style={{ fontSize: '2rem', color: textColor, opacity: 0.4, fontWeight: '300' }}>:</span></>}
            {showMinutes && <><Digit value={minutes} label="Minutes" digitBg={digitBg} textColor={textColor} />{showSeconds && <span style={{ fontSize: '2rem', color: textColor, opacity: 0.4, fontWeight: '300' }}>:</span>}</>}
            {showSeconds && <Digit value={seconds} label="Secondes" digitBg={digitBg} textColor={textColor} />}
          </div>
        )}
        {ctaText && !expired && (
          <a href={ctaLink} style={{
            display: 'inline-block', padding: '13px 32px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            color: textColor, textDecoration: 'none', fontWeight: '800', fontSize: '15px',
            border: '1.5px solid rgba(255,255,255,0.3)',
            transition: 'transform 0.2s, background 0.2s',
          }}>
            {ctaText} →
          </a>
        )}
      </div>
    </section>
  );
}
