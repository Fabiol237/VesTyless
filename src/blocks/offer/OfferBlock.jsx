'use client';
import { useEffect, useState, useRef } from 'react';

/**
 * OfferBlock — Compte à rebours promo
 * Variants: countdown | flash-band | card | popup
 */
export default function OfferBlock({ variant = 'countdown', settings = {}, content = {}, theme = {} }) {
  const {
    bgColor = '#7c3aed', textColor = '#ffffff', digitBg = 'rgba(255,255,255,0.15)',
    paddingTop = 40, paddingBottom = 40,
  } = settings;

  const { title = '⚡ Offre Flash', subtitle = '', ctaText = "Profiter de l'offre", ctaLink = '#', targetDate = '', expiredText = "L'offre a expiré !" } = content;
  const primary = theme.primaryColor || '#6366f1';
  const bg = bgColor || primary;

  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    const target = targetDate ? new Date(targetDate) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000);
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTime(t => ({ ...t, expired: true })); return; }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const Digit = ({ val, label }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ background: digitBg, backdropFilter: 'blur(8px)', borderRadius: 12, padding: '12px 16px', minWidth: 64, marginBottom: 6 }}>
        <span style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: 900, color: textColor, fontVariantNumeric: 'tabular-nums' }}>
          {String(val).padStart(2, '0')}
        </span>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: `${textColor}99`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
  );

  if (variant === 'flash-band') {
    return (
      <div style={{ background: bg, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
        <span style={{ color: textColor, fontWeight: 800, fontSize: 16 }}>{title}</span>
        {!time.expired && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: textColor, fontWeight: 900, fontSize: 18 }}>
            <span>{String(time.h).padStart(2,'0')}:{String(time.m).padStart(2,'0')}:{String(time.s).padStart(2,'0')}</span>
          </div>
        )}
        <a href={ctaLink} style={{ padding: '8px 20px', borderRadius: 8, background: '#fff', color: bg, fontWeight: 800, textDecoration: 'none', fontSize: 14 }}>{ctaText}</a>
      </div>
    );
  }

  return (
    <section style={{ background: bg, paddingTop, paddingBottom, textAlign: 'center' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 900, color: textColor, margin: '0 0 8px' }}>{title}</h2>
        {subtitle && <p style={{ color: `${textColor}cc`, margin: '0 0 32px' }}>{subtitle}</p>}
        {time.expired ? (
          <p style={{ color: textColor, fontWeight: 700, fontSize: 18 }}>{expiredText}</p>
        ) : (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
            <Digit val={time.d} label="Jours" />
            <div style={{ color: textColor, fontSize: '2rem', fontWeight: 900, alignSelf: 'flex-start', paddingTop: 16 }}>:</div>
            <Digit val={time.h} label="Heures" />
            <div style={{ color: textColor, fontSize: '2rem', fontWeight: 900, alignSelf: 'flex-start', paddingTop: 16 }}>:</div>
            <Digit val={time.m} label="Minutes" />
            <div style={{ color: textColor, fontSize: '2rem', fontWeight: 900, alignSelf: 'flex-start', paddingTop: 16 }}>:</div>
            <Digit val={time.s} label="Secondes" />
          </div>
        )}
        {!time.expired && ctaText && (
          <a href={ctaLink} style={{ display: 'inline-block', padding: '14px 36px', borderRadius: 12, background: '#fff', color: bg, fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
            {ctaText} →
          </a>
        )}
      </div>
    </section>
  );
}
