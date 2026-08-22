'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * CtaBlock — Appel à l'action
 * Variants: centered | banner | card | large | minimal | whatsapp
 */
export default function CtaBlock({ variant = 'centered', settings = {}, content = {}, theme = {} }) {
  const {
    bgType = 'gradient',
    bgGradient = '135deg,#6366f1 0%,#8b5cf6 100%',
    bgColor: settingsBgColor = '#6366f1',
    textColor = '#ffffff',
    btnBg = '#ffffff',
    btnColor = '#6366f1',
    btnRadius = 8,
    paddingTop = 80,
    paddingBottom = 80,
  } = settings;

  const {
    eyebrow = '',
    title = 'Prêt à commencer ?',
    subtitle = '',
    ctaText = 'Commencer maintenant',
    ctaLink = '#',
    ctaSecond = '',
    ctaSecondLink = '#',
    whatsapp = '',
  } = content;

  const primary = theme.primaryColor || '#6366f1';

  const bg = bgType === 'gradient'
    ? `linear-gradient(${bgGradient})`
    : bgType === 'solid'
      ? (settingsBgColor || primary)
      : `linear-gradient(${bgGradient})`;

  // ── BANNER ──────────────────────────────────────────────────────────────────
  if (variant === 'banner') {
    return (
      <div style={{
        background: bg, padding: '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          {eyebrow && <div style={{ fontSize: 12, fontWeight: 700, color: `${textColor}99`, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{eyebrow}</div>}
          <div style={{ fontWeight: 800, fontSize: 20, color: textColor }}>{title}</div>
          {subtitle && <div style={{ fontSize: 14, color: `${textColor}cc`, marginTop: 4 }}>{subtitle}</div>}
        </div>
        <a href={ctaLink} style={{
          padding: '12px 28px', borderRadius: btnRadius, fontWeight: 700, fontSize: 15,
          background: btnBg, color: btnColor, textDecoration: 'none', whiteSpace: 'nowrap',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}>{ctaText} →</a>
      </div>
    );
  }

  // ── WHATSAPP ─────────────────────────────────────────────────────────────────
  if (variant === 'whatsapp') {
    const wa = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(ctaText || 'Bonjour, je souhaite en savoir plus.')}` : ctaLink;
    return (
      <section style={{ background: bg, paddingTop, paddingBottom, textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
          {eyebrow && <div style={{ fontSize: 12, fontWeight: 700, color: `${textColor}99`, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{eyebrow}</div>}
          <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 900, color: textColor, margin: '0 0 16px', lineHeight: 1.2 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 18, color: `${textColor}cc`, margin: '0 0 40px', lineHeight: 1.6 }}>{subtitle}</p>}
          <a href={wa} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '16px 40px', borderRadius: 999,
            background: '#25D366', color: '#fff', fontWeight: 800, fontSize: 17,
            textDecoration: 'none', boxShadow: '0 8px 30px rgba(37,211,102,0.35)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            {ctaText || 'Nous contacter sur WhatsApp'}
          </a>
        </div>
      </section>
    );
  }

  // ── MINIMAL ───────────────────────────────────────────────────────────────────
  if (variant === 'minimal') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, padding: `${paddingTop / 2}px 24px` }}>
        <div>
          {eyebrow && <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{eyebrow}</div>}
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0 }}>{title}</h3>
        </div>
        <a href={ctaLink} style={{
          padding: '12px 28px', borderRadius: btnRadius, fontWeight: 700,
          background: primary, color: '#fff', textDecoration: 'none',
        }}>{ctaText}</a>
      </div>
    );
  }

  // ── CENTERED (défaut) + LARGE + CARD ──────────────────────────────────────────
  return (
    <section style={{ background: variant === 'card' ? '#f9fafb' : bg, paddingTop, paddingBottom }}>
      <style>{`.cta-btn{transition:transform 0.2s,box-shadow 0.2s}.cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,0.2)!important}`}</style>
      <div style={{
        maxWidth: variant === 'large' ? 900 : 700,
        margin: '0 auto', padding: '0 24px',
        textAlign: 'center',
        ...(variant === 'card' ? {
          background: '#ffffff',
          borderRadius: 24,
          padding: 48,
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6',
        } : {}),
      }}>
        {eyebrow && (
          <div style={{
            display: 'inline-block', marginBottom: 16,
            fontSize: 12, fontWeight: 700,
            color: variant === 'card' ? primary : `${textColor}99`,
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>{eyebrow}</div>
        )}
        <h2 style={{
          fontSize: variant === 'large' ? 'clamp(2rem,5vw,3.5rem)' : 'clamp(1.75rem,4vw,2.5rem)',
          fontWeight: 900,
          color: variant === 'card' ? '#111827' : textColor,
          margin: '0 0 16px', lineHeight: 1.15, letterSpacing: '-0.02em',
        }}>{title}</h2>
        {subtitle && (
          <p style={{
            fontSize: 18, lineHeight: 1.6, margin: '0 0 40px',
            color: variant === 'card' ? '#6b7280' : `${textColor}cc`,
          }}>{subtitle}</p>
        )}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={ctaLink} className="cta-btn" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: variant === 'large' ? '18px 48px' : '14px 36px',
            borderRadius: btnRadius, fontWeight: 800,
            fontSize: variant === 'large' ? 18 : 16,
            background: variant === 'card' ? primary : btnBg,
            color: variant === 'card' ? '#fff' : btnColor,
            textDecoration: 'none',
          }}>{ctaText} →</a>
          {ctaSecond && (
            <a href={ctaSecondLink} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: variant === 'large' ? '18px 48px' : '14px 36px',
              borderRadius: btnRadius, fontWeight: 700,
              fontSize: variant === 'large' ? 18 : 16,
              background: 'transparent',
              color: variant === 'card' ? '#6b7280' : textColor,
              border: `2px solid ${variant === 'card' ? '#e5e7eb' : `${textColor}55`}`,
              textDecoration: 'none',
            }}>{ctaSecond}</a>
          )}
        </div>
      </div>
    </section>
  );
}
