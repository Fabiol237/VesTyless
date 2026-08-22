'use client';
import { useState, useEffect, useRef } from 'react';

/**
 * ReviewBlock — Avis clients
 * Variants: slider | cards | masonry | wall | featured
 */
export default function ReviewBlock({ variant = 'slider', settings = {}, content = {}, theme = {} }) {
  const {
    cardStyle = 'card',
    bgColor = '#f9fafb',
    cardBg = '#ffffff',
    starColor = '#f59e0b',
    textColor = '#374151',
    autoPlay = true,
    showRating = true,
    showAvatar = true,
    paddingTop = 60,
    paddingBottom = 60,
  } = settings;

  const { title = 'Ce que disent nos clients', subtitle = '', testimonials = [] } = content;
  const items = testimonials || [];

  // Hooks MUST come before any conditional return (React rules of hooks)
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const primary = theme.primaryColor || '#6366f1';

  useEffect(() => {
    if (!autoPlay || variant !== 'slider' || items.length <= 1) return;
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % items.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [autoPlay, variant, items.length]);

  // Guard after all hooks
  if (items.length === 0) return null;

  const Stars = ({ n }) => (
    <span style={{ color: starColor, fontSize: 14 }}>
      {'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))}
    </span>
  );

  const Avatar = ({ item }) => (
    <div style={{
      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
      background: item.avatar ? `url(${item.avatar}) center/cover` : `linear-gradient(135deg, ${primary}, ${primary}88)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: 16,
    }}>
      {!item.avatar && (item.name?.[0] || '?')}
    </div>
  );

  const cardStyles = {
    shadow: { boxShadow: '0 2px 20px rgba(0,0,0,0.08)', border: 'none' },
    border: { boxShadow: 'none', border: '1.5px solid #e5e7eb' },
    glass:  { boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.7)' },
    minimal:{ boxShadow: 'none', border: 'none', background: 'transparent' },
    quote:  { boxShadow: '0 4px 25px rgba(0,0,0,0.06)', border: 'none', borderLeft: `4px solid ${primary}` },
  };
  const cs = cardStyles[cardStyle] || cardStyles.shadow;

  const SectionHeader = () => (
    <div style={{ textAlign: 'center', marginBottom: 40 }}>
      {title && <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>{title}</h2>}
      {subtitle && <p style={{ color: '#6b7280', margin: 0 }}>{subtitle}</p>}
    </div>
  );

  // ── SLIDER ─────────────────────────────────────────────────────────────────
  if (variant === 'slider') {
    const item = items[idx];
    return (
      <section style={{ background: bgColor, paddingTop, paddingBottom }}>
        <style>{`
          @keyframes reviewFade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
          @media(max-width:640px){.review-card-slider{padding:28px 18px!important}}
        `}</style>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <SectionHeader />
          <div key={idx} className="review-card-slider" style={{
            background: cardStyle === 'glass' ? cs.background : cardBg,
            borderRadius: 16, padding: '40px 48px',
            textAlign: 'center', position: 'relative',
            animation: 'reviewFade 0.4s ease forwards',
            ...cs,
          }}>
            <div style={{ fontSize: 48, color: primary, opacity: 0.15, fontFamily: 'Georgia', lineHeight: 1, marginBottom: -8 }}>"</div>
            {showRating && <div style={{ marginBottom: 16 }}><Stars n={item.rating} /></div>}
            <p style={{ fontSize: 18, lineHeight: 1.7, color: textColor, fontStyle: 'italic', margin: '0 0 28px' }}>"{item.text}"</p>
            {showAvatar && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                <Avatar item={item} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{item.name}</div>
                  {item.role && <div style={{ fontSize: 13, color: '#6b7280' }}>{item.role}</div>}
                </div>
              </div>
            )}
          </div>
          {items.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              {items.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} style={{
                  width: i === idx ? 24 : 8, height: 8, borderRadius: 999,
                  background: i === idx ? primary : '#d1d5db',
                  border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                }} />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ── CARDS ──────────────────────────────────────────────────────────────────
  return (
    <section style={{ background: bgColor, paddingTop, paddingBottom }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <SectionHeader />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {items.map(item => (
            <div key={item.id} style={{
              background: cardStyle === 'glass' ? cs.background : cardBg,
              borderRadius: 16, padding: 28,
              ...cs,
            }}>
              {showRating && <div style={{ marginBottom: 12 }}><Stars n={item.rating} /></div>}
              <p style={{ fontSize: 15, lineHeight: 1.6, color: textColor, margin: '0 0 20px', fontStyle: 'italic' }}>"{item.text}"</p>
              {showAvatar && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar item={item} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{item.name}</div>
                    {item.role && <div style={{ fontSize: 12, color: '#6b7280' }}>{item.role}</div>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
