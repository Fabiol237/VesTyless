'use client';
import { useState } from 'react';

/**
 * StatsBlock — Chiffres clés animés
 * Variants: row | cards | dark-band | with-icons
 */
export default function StatsBlock({ variant = 'row', settings = {}, content = {}, theme = {} }) {
  const {
    bgColor = '#1e1b4b',
    textColor = '#ffffff',
    valueColor = '#a5b4fc',
    animated = true,
    showDivider = true,
    paddingTop = 40,
    paddingBottom = 40,
  } = settings;

  const { title = '', items = [] } = content;
  if (!items || items.length === 0) return null;

  const primary = theme.primaryColor || '#6366f1';

  // ── CARDS ──────────────────────────────────────────────────────────────────
  if (variant === 'cards') {
    return (
      <section style={{ background: '#f9fafb', paddingTop, paddingBottom }}>
        <style>{`
          @media(max-width:640px){.stats-cards-grid{grid-template-columns:repeat(2,1fr)!important;gap:12px!important}}
          @media(max-width:380px){.stats-cards-grid{grid-template-columns:1fr!important}}
        `}</style>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {title && <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: 40, color: '#111827' }}>{title}</h2>}
          <div className="stats-cards-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`, gap: 20 }}>
            {items.map((stat, i) => (
              <div key={i} style={{
                background: '#ffffff', borderRadius: 16, padding: '28px 24px', textAlign: 'center',
                boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
              }}>
                {stat.icon && <div style={{ fontSize: 32, marginBottom: 12 }}>{stat.icon}</div>}
                <div style={{ fontSize: '2rem', fontWeight: 900, color: primary, marginBottom: 6 }}>{stat.value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── ROW (défaut) + DARK-BAND + WITH-ICONS ──────────────────────────────────
  return (
    <section style={{ background: bgColor, paddingTop, paddingBottom }}>
      <style>{`
        @media(max-width:640px){.stats-grid{grid-template-columns:repeat(2,1fr)!important;gap:16px!important}}
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {title && <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, color: textColor, marginBottom: 32 }}>{title}</h2>}
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`,
          gap: 0,
        }}>
          {items.map((stat, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '24px 16px',
              borderRight: showDivider && i < items.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none',
            }}>
              {stat.icon && <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>}
              <div style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: 900, color: valueColor, marginBottom: 6, letterSpacing: '-0.03em' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: `${textColor}88`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
