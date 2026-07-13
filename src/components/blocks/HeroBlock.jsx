'use client';
import { useEffect, useRef, useState } from 'react';

function parseGradient(g) {
  if (!g) return null;
  // "135deg,#667eea 0%,#764ba2 100%" → CSS
  return `linear-gradient(${g})`;
}

export default function HeroBlock({ config = {}, theme = {} }) {
  const {
    title = 'Bienvenue dans notre boutique',
    subtitle = 'Découvrez notre sélection unique',
    backgroundType = 'gradient',
    backgroundGradient = '135deg,#667eea 0%,#764ba2 100%',
    backgroundImage = '',
    backgroundSolid = '#1a1a2e',
    overlayColor = '#000000',
    overlayOpacity = 0.4,
    height = 'screen',
    textAlign = 'center',
    titleSize = '4xl',
    titleColor = '#ffffff',
    titleGradient = '',
    titleWeight = '800',
    subtitleColor = 'rgba(255,255,255,0.85)',
    ctaText = 'Découvrir',
    ctaLink = '#',
    ctaStyle = 'solid',
    ctaColor = '#ffffff',
    ctaBg = 'rgba(255,255,255,0.2)',
    ctaRadius = 8,
    animation = 'fade-up',
    showScrollIndicator = true,
    showBadges = false,
    badges = [],
    paddingTop = 80,
    paddingBottom = 80,
  } = config;

  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const heights = { auto: 'auto', screen: '100vh', half: '50vh', third: '33vh', tall: '80vh' };
  const titleSizes = { '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem', '6xl': '3.75rem', '7xl': '4.5rem' };

  // Background CSS
  let bgStyle = {};
  if (backgroundType === 'gradient')  bgStyle = { background: parseGradient(backgroundGradient) || '#667eea' };
  if (backgroundType === 'solid')     bgStyle = { background: backgroundSolid };
  if (backgroundType === 'image' && backgroundImage) {
    bgStyle = { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  if (backgroundType === 'particles') bgStyle = { background: '#0f0c29' };

  // Title style
  const titleStyle = titleGradient
    ? { backgroundImage: parseGradient(titleGradient), WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
    : { color: titleColor };

  // CTA style
  let ctaStyles = {};
  if (ctaStyle === 'solid')   ctaStyles = { background: ctaBg || theme.primaryColor || '#6366f1', color: ctaColor, border: 'none' };
  if (ctaStyle === 'outline') ctaStyles = { background: 'transparent', color: ctaColor, border: `2px solid ${ctaColor}` };
  if (ctaStyle === 'ghost')   ctaStyles = { background: 'rgba(255,255,255,0.12)', color: ctaColor, border: 'none', backdropFilter: 'blur(8px)' };
  if (ctaStyle === 'gradient')ctaStyles = { background: parseGradient(backgroundGradient) || theme.primaryColor, color: '#fff', border: 'none' };

  // Animation
  const animStyle = visible ? {} : {
    opacity: 0,
    transform: animation === 'fade-up' ? 'translateY(30px)' : animation === 'slide-left' ? 'translateX(-30px)' : animation === 'zoom' ? 'scale(0.95)' : 'none',
  };

  return (
    <section ref={ref} style={{
      position: 'relative', overflow: 'hidden',
      minHeight: heights[height] || '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px`,
      ...bgStyle,
    }}>
      <style>{`
        @keyframes heroFadeUp { from { opacity:0; transform: translateY(30px); } to { opacity:1; transform: none; } }
        @keyframes scrollBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
        .hero-cta:hover { transform: scale(1.04) !important; box-shadow: 0 8px 32px rgba(0,0,0,0.25) !important; }
      `}</style>

      {/* Overlay */}
      {(backgroundType === 'image' || backgroundType === 'video') && (
        <div style={{
          position: 'absolute', inset: 0,
          background: overlayColor,
          opacity: overlayOpacity,
          pointerEvents: 'none',
        }} />
      )}

      {/* Contenu */}
      <div style={{
        position: 'relative', zIndex: 1,
        textAlign,
        padding: '0 24px',
        maxWidth: '900px',
        width: '100%',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
        animation: animation !== 'none' && visible ? `heroFadeUp 0.7s ease forwards` : 'none',
      }}>
        <h1 style={{
          fontSize: titleSizes[titleSize] || '2.25rem',
          fontWeight: titleWeight,
          lineHeight: 1.15,
          margin: '0 0 16px',
          letterSpacing: '-0.02em',
          ...titleStyle,
        }}>
          {title}
        </h1>

        {subtitle && (
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: subtitleColor,
            margin: '0 0 32px',
            lineHeight: 1.6,
            maxWidth: '600px',
            ...(textAlign === 'center' ? { marginLeft: 'auto', marginRight: 'auto' } : {}),
          }}>
            {subtitle}
          </p>
        )}

        {/* Badges */}
        {showBadges && badges.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: textAlign === 'center' ? 'center' : 'flex-start', marginBottom: '24px' }}>
            {badges.map((b, i) => (
              <span key={i} style={{
                padding: '5px 14px', borderRadius: '999px',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff', fontSize: '12px', fontWeight: '600',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>{b}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        {ctaText && (
          <a href={ctaLink} className="hero-cta" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '14px 32px', borderRadius: `${ctaRadius}px`,
            fontSize: '15px', fontWeight: '700',
            cursor: 'pointer', textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
            ...ctaStyles,
          }}>
            {ctaText}
            <span style={{ fontSize: '18px' }}>→</span>
          </a>
        )}

        {/* Scroll indicator */}
        {showScrollIndicator && (
          <div style={{
            position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)',
            animation: 'scrollBounce 2s ease infinite',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '24px',
          }}>↓</div>
        )}
      </div>
    </section>
  );
}
