'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * HeroBlock — Bloc hero générique
 * Variants: centered | split | fullscreen | minimal | image-overlay | carousel | video
 */
export default function HeroBlock({ variant = 'centered', settings = {}, content = {}, theme = {} }) {
  const {
    height = 'screen',
    customHeight = 600,
    backgroundType = 'gradient',
    backgroundGradient = '135deg,#667eea 0%,#764ba2 100%',
    backgroundImage = null,
    overlayOpacity = 0.4,
    overlayColor = '#000000',
    textAlign = 'center',
    imagePosition = 'right',
    titleSize = '4xl',
    titleColor = '#ffffff',
    titleWeight = '800',
    subtitleColor = 'rgba(255,255,255,0.85)',
    ctaStyle = 'solid',
    ctaColor = '#ffffff',
    ctaBg = 'transparent',
    ctaRadius = 8,
    animation = 'fade-up',
    showScrollIndicator = true,
    borderRadius = 'none',
    paddingTop = 80,
    paddingBottom = 80,
  } = settings;

  const {
    badge = '',
    title = 'Bienvenue',
    subtitle = '',
    ctaText = 'Découvrir',
    ctaLink = '#',
    ctaSecond = '',
    ctaSecondLink = '#',
    image = null,
    slides = [],
    videoUrl = '',
  } = content;

  const [visible, setVisible] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Carousel auto-slide
  useEffect(() => {
    if (variant !== 'carousel' || slides.length <= 1) return;
    const t = setInterval(() => setSlideIdx(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [variant, slides.length]);

  // Heights
  const heights = { auto: 'auto', screen: '100vh', half: '50vh', third: '33vh', tall: '80vh', custom: `${customHeight}px` };
  const heightVal = heights[height] || '100vh';

  // Title sizes with fluid typography for perfect mobile scaling
  const titleSizes = {
    '2xl': 'clamp(1.25rem, 3vw, 1.5rem)',
    '3xl': 'clamp(1.5rem, 3.5vw, 1.875rem)',
    '4xl': 'clamp(1.75rem, 4.5vw, 2.25rem)',
    '5xl': 'clamp(2rem, 5.5vw, 3rem)',
    '6xl': 'clamp(2.25rem, 6.5vw, 3.75rem)',
    '7xl': 'clamp(2.5rem, 8vw, 4.5rem)',
  };

  // Border radius
  const radii = { none: 0, sm: 8, md: 16, lg: 24, xl: 40 };
  const br = radii[borderRadius] || 0;

  // Background
  let bgStyle = {};
  const currentSlide = slides[slideIdx];
  const bgImg = (variant === 'carousel' && currentSlide?.image) ? currentSlide.image : backgroundImage;

  if (backgroundType === 'gradient') {
    bgStyle = { background: `linear-gradient(${backgroundGradient})` };
  } else if (backgroundType === 'solid') {
    bgStyle = { background: theme.primaryColor || '#1a1a2e' };
  } else if ((backgroundType === 'image' || variant === 'image-overlay' || variant === 'fullscreen') && bgImg) {
    bgStyle = { backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  } else {
    bgStyle = { background: `linear-gradient(${backgroundGradient})` };
  }

  // CTA styles
  const primary = theme.primaryColor || '#6366f1';
  let ctaStyles = {};
  if (ctaStyle === 'solid')    ctaStyles = { background: ctaBg !== 'transparent' ? ctaBg : primary, color: ctaColor, border: 'none' };
  if (ctaStyle === 'outline')  ctaStyles = { background: 'transparent', color: ctaColor, border: `2px solid ${ctaColor}` };
  if (ctaStyle === 'ghost')    ctaStyles = { background: 'rgba(255,255,255,0.12)', color: ctaColor, border: 'none', backdropFilter: 'blur(8px)' };
  if (ctaStyle === 'gradient') ctaStyles = { background: `linear-gradient(${backgroundGradient})`, color: '#fff', border: 'none' };

  const animStyle = visible ? {} : {
    opacity: 0,
    transform: animation === 'fade-up' ? 'translateY(30px)' : animation === 'slide-left' ? 'translateX(-30px)' : animation === 'zoom' ? 'scale(0.95)' : 'none',
  };

  // ── Variant: SPLIT ──────────────────────────────────────────────────────────
  if (variant === 'split') {
    const imgSrc = image || bgImg;
    return (
      <section className="hero-split-container" style={{
        display: 'flex', flexDirection: imagePosition === 'left' ? 'row-reverse' : 'row',
        minHeight: heightVal, background: backgroundType === 'gradient' ? `linear-gradient(${backgroundGradient})` : (backgroundType === 'solid' ? bgStyle.background : '#0f0c29'),
        borderRadius: br,
        overflow: 'hidden',
      }}>
        <style>{`
          @keyframes heroFadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
          .hero-cta-v2{transition:transform 0.2s,box-shadow 0.2s}
          .hero-cta-v2:hover{transform:scale(1.04) !important;box-shadow:0 8px 32px rgba(0,0,0,0.25) !important}
          @media(max-width:768px){
            .hero-split-container{flex-direction:column !important;min-height:auto !important}
            .hero-split-text{padding:36px 20px !important}
            .hero-split-img{min-height:220px !important;width:100% !important;flex:none !important}
          }
        `}</style>
        {/* Texte */}
        <div className="hero-split-text" style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: `${paddingTop}px 64px ${paddingBottom}px`,
          animation: animation !== 'none' && visible ? 'heroFadeUp 0.7s ease forwards' : 'none',
          ...animStyle,
        }}>
          {badge && (
            <span style={{
              display: 'inline-block', marginBottom: 16,
              padding: '5px 14px', borderRadius: 999,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              color: '#fff', fontSize: 12, fontWeight: 700,
              border: '1px solid rgba(255,255,255,0.2)',
              width: 'fit-content',
            }}>{badge}</span>
          )}
          <h1 style={{
            fontSize: titleSizes[titleSize] || '2.25rem',
            fontWeight: titleWeight, lineHeight: 1.15,
            color: titleColor, margin: '0 0 16px',
            letterSpacing: '-0.02em',
          }}>{(variant === 'carousel' && currentSlide?.title) || title}</h1>
          {((variant === 'carousel' && currentSlide?.subtitle) || subtitle) && (
            <p style={{ fontSize: 'clamp(1rem,2vw,1.2rem)', color: subtitleColor, margin: '0 0 32px', lineHeight: 1.6, maxWidth: 480 }}>
              {(variant === 'carousel' && currentSlide?.subtitle) || subtitle}
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {ctaText && (
              <a href={ctaLink} className="hero-cta-v2" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: ctaRadius,
                fontSize: 15, fontWeight: 700, cursor: 'pointer', textDecoration: 'none',
                ...ctaStyles,
              }}>{ctaText} →</a>
            )}
            {ctaSecond && (
              <a href={ctaSecondLink} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: ctaRadius,
                fontSize: 15, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
                background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)', transition: 'background 0.2s',
              }}>{ctaSecond}</a>
            )}
          </div>
        </div>
        {/* Image */}
        <div className="hero-split-img" style={{
          flex: 1, position: 'relative', overflow: 'hidden', minHeight: 300,
          backgroundImage: imgSrc ? `url(${imgSrc})` : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
      </section>
    );
  }

  // ── Variant: MINIMAL ────────────────────────────────────────────────────────
  if (variant === 'minimal') {
    return (
      <section style={{
        background: '#ffffff',
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        textAlign: textAlign,
        borderRadius: br,
      }}>
        <style>{`.hero-cta-v2{transition:transform 0.2s,box-shadow 0.2s}.hero-cta-v2:hover{transform:scale(1.04)!important}`}</style>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          {badge && (
            <span style={{
              display: 'inline-block', marginBottom: 16,
              padding: '4px 12px', borderRadius: 999,
              background: theme.primaryColor ? `${theme.primaryColor}15` : '#ede9fe',
              color: theme.primaryColor || '#6366f1', fontSize: 12, fontWeight: 700,
            }}>{badge}</span>
          )}
          <h1 style={{ fontSize: titleSizes[titleSize] || '2.25rem', fontWeight: titleWeight, color: '#111827', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 'clamp(1rem,2vw,1.2rem)', color: '#6b7280', margin: '0 0 32px', lineHeight: 1.6 }}>{subtitle}</p>
          )}
          {ctaText && (
            <a href={ctaLink} className="hero-cta-v2" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: ctaRadius,
              background: theme.primaryColor || '#6366f1', color: '#fff',
              fontSize: 15, fontWeight: 700, textDecoration: 'none', border: 'none',
            }}>{ctaText} →</a>
          )}
        </div>
      </section>
    );
  }

  // ── Variant: CENTERED, FULLSCREEN, IMAGE-OVERLAY (défaut) ──────────────────
  const overlayNeeded = backgroundType === 'image' || variant === 'image-overlay' || variant === 'fullscreen';

  return (
    <section ref={ref} style={{
      position: 'relative', overflow: 'hidden',
      minHeight: heightVal,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px`,
      borderRadius: br,
      ...bgStyle,
    }}>
      <style>{`
        @keyframes heroFadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
        @keyframes scrollBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
        .hero-cta-v2{transition:transform 0.2s,box-shadow 0.2s}
        .hero-cta-v2:hover{transform:scale(1.04) !important;box-shadow:0 8px 32px rgba(0,0,0,0.25) !important}
      `}</style>

      {/* Overlay */}
      {overlayNeeded && (
        <div style={{ position: 'absolute', inset: 0, background: overlayColor, opacity: overlayOpacity, pointerEvents: 'none' }} />
      )}

      {/* Carousel dots */}
      {variant === 'carousel' && slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlideIdx(i)} style={{
              width: i === slideIdx ? 24 : 8, height: 8, borderRadius: 999,
              background: i === slideIdx ? '#fff' : 'rgba(255,255,255,0.4)',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s',
            }} />
          ))}
        </div>
      )}

      {/* Contenu */}
      <div style={{
        position: 'relative', zIndex: 1, textAlign,
        padding: '0 24px', maxWidth: 900, width: '100%',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
        animation: animation !== 'none' && visible ? 'heroFadeUp 0.7s ease forwards' : 'none',
      }}>
        {badge && (
          <span style={{
            display: 'inline-block', marginBottom: 16,
            padding: '5px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            color: '#fff', fontSize: 12, fontWeight: 700,
            border: '1px solid rgba(255,255,255,0.2)',
          }}>{(variant === 'carousel' && currentSlide?.badge) || badge}</span>
        )}

        <h1 style={{
          fontSize: titleSizes[titleSize] || '2.25rem',
          fontWeight: titleWeight, lineHeight: 1.15,
          margin: '0 0 16px', letterSpacing: '-0.02em',
          color: titleColor,
        }}>{(variant === 'carousel' && currentSlide?.title) || title}</h1>

        {((variant === 'carousel' && currentSlide?.subtitle) || subtitle) && (
          <p style={{
            fontSize: 'clamp(1rem,2vw,1.25rem)', color: subtitleColor,
            margin: '0 0 32px', lineHeight: 1.6, maxWidth: 600,
            ...(textAlign === 'center' ? { marginLeft: 'auto', marginRight: 'auto' } : {}),
          }}>{(variant === 'carousel' && currentSlide?.subtitle) || subtitle}</p>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: textAlign === 'center' ? 'center' : 'flex-start' }}>
          {ctaText && (
            <a href={ctaLink} className="hero-cta-v2" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: ctaRadius,
              fontSize: 15, fontWeight: 700, cursor: 'pointer', textDecoration: 'none',
              ...ctaStyles,
            }}>{ctaText} →</a>
          )}
          {ctaSecond && (
            <a href={ctaSecondLink} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: ctaRadius,
              fontSize: 15, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            }}>{ctaSecond}</a>
          )}
        </div>

        {/* Scroll indicator */}
        {showScrollIndicator && (
          <div style={{
            position: 'absolute', bottom: -50, left: '50%', transform: 'translateX(-50%)',
            animation: 'scrollBounce 2s ease infinite', color: 'rgba(255,255,255,0.7)', fontSize: 24,
          }}>↓</div>
        )}
      </div>
    </section>
  );
}
