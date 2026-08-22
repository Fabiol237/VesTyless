'use client';
import { useState } from 'react';

/**
 * FeatureBlock — Caractéristiques / Engagements
 * Variants: icons-grid | icons-list | cards | alternating | horizontal
 */
export default function FeatureBlock({ variant = 'icons-grid', settings = {}, content = {}, theme = {} }) {
  const {
    columns = '3',
    iconStyle = 'emoji',
    iconColor = '#6366f1',
    iconBg = '#ede9fe',
    cardStyle = 'none',
    bgColor = '#ffffff',
    titleColor = '#111827',
    textColor = '#6b7280',
    paddingTop = 60,
    paddingBottom = 60,
  } = settings;

  const {
    title = 'Nos engagements',
    subtitle = '',
    items = [],
  } = content;

  if (!items || items.length === 0) return null;

  const primary = theme.primaryColor || iconColor;
  const cols = parseInt(columns) || 3;

  const cardStyles = {
    none:   { background: 'transparent', boxShadow: 'none', border: 'none', padding: '16px 0' },
    card:   { background: '#ffffff', boxShadow: '0 2px 20px rgba(0,0,0,0.07)', border: '1px solid #f3f4f6', borderRadius: 16, padding: 28 },
    glass:  { background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 16, padding: 28 },
    border: { background: '#ffffff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 24 },
  };
  const cs = cardStyles[cardStyle] || cardStyles.none;

  // ── ALTERNATING ─────────────────────────────────────────────────────────────
  if (variant === 'alternating') {
    return (
      <section style={{ background: bgColor, paddingTop, paddingBottom }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          {title && <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: subtitle ? 8 : 48 }}>{title}</h2>}
          {subtitle && <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 48 }}>{subtitle}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 48, alignItems: 'center', flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: 96, height: 96, borderRadius: 24,
                    background: `${primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40,
                  }}>{item.icon}</div>
                </div>
                <div style={{ flex: 2 }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: titleColor, margin: '0 0 12px' }}>{item.title}</h3>
                  <p style={{ color: textColor, lineHeight: 1.7, margin: 0, fontSize: 16 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── HORIZONTAL ────────────────────────────────────────────────────────────────
  if (variant === 'horizontal') {
    return (
      <section style={{ background: bgColor, paddingTop, paddingBottom }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {title && <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: subtitle ? 8 : 40 }}>{title}</h2>}
          {subtitle && <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 40 }}>{subtitle}</p>}
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: titleColor, fontSize: 15 }}>{item.title}</div>
                  {item.desc && <div style={{ fontSize: 13, color: textColor, marginTop: 2 }}>{item.desc}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── ICONS-LIST ────────────────────────────────────────────────────────────────
  if (variant === 'icons-list') {
    return (
      <section style={{ background: bgColor, paddingTop, paddingBottom }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          {title && <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: subtitle ? 8 : 40 }}>{title}</h2>}
          {subtitle && <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 40 }}>{subtitle}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', ...cs }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: iconBg || `${primary}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>{item.icon}</div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: titleColor, margin: '0 0 6px' }}>{item.title}</h3>
                  <p style={{ color: textColor, margin: 0, lineHeight: 1.6, fontSize: 15 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── ICONS-GRID (défaut) + CARDS ───────────────────────────────────────────────
  return (
    <section style={{ background: bgColor, paddingTop, paddingBottom }}>
      <style>{`
        @media(max-width:768px){.feat-grid{grid-template-columns:repeat(2,1fr)!important;gap:16px!important}}
        @media(max-width:480px){.feat-grid{grid-template-columns:1fr!important;gap:16px!important}}
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {title && <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: subtitle ? 8 : 48 }}>{title}</h2>}
        {subtitle && <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 48 }}>{subtitle}</p>}
        <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24 }}>
          {items.map((item, i) => (
            <div key={i} style={{ textAlign: variant === 'cards' ? 'left' : 'center', ...cs }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 56, height: 56, borderRadius: 16,
                background: iconBg || `${primary}15`,
                fontSize: 24, marginBottom: 16,
              }}>{item.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: titleColor, margin: '0 0 8px' }}>{item.title}</h3>
              <p style={{ color: textColor, margin: 0, lineHeight: 1.6, fontSize: 14 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
