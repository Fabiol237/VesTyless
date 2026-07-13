'use client';
import { useState, useEffect, useRef } from 'react';

export default function CarouselBlock({ config = {}, theme = {} }) {
  const {
    slides = [],
    autoPlay = true,
    autoPlayDelay = 4000,
    transition = 'fade',
    showDots = true,
    showArrows = true,
    showCaptions = true,
    height = 'screen',
    overlayColor = 'rgba(0,0,0,0.3)',
    dotsColor = '#ffffff',
    arrowColor = '#ffffff',
    arrowBg = 'rgba(0,0,0,0.4)',
    borderRadius = 0,
    pauseOnHover = true,
  } = config;

  const [current, setCurrent]   = useState(0);
  const [paused, setPaused]     = useState(false);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  const demoSlides = slides.length > 0 ? slides : [
    { image: '', caption: '✨ Votre première slide', subtitle: 'Ajoutez des images via le panneau IA', ctaText: 'Découvrir', ctaLink: '#' },
    { image: '', caption: '🌟 Slide 2', subtitle: 'Personnalisable à l\'infini', ctaText: 'En savoir plus', ctaLink: '#' },
    { image: '', caption: '🚀 Slide 3', subtitle: 'Dégradés, images, vidéos...', ctaText: 'Commencer', ctaLink: '#' },
  ];
  const count = demoSlides.length;

  const heights = { auto: '400px', screen: '100vh', half: '50vh', third: '33vh', tall: '80vh' };
  const DEMO_GRADIENTS = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
  ];

  const goTo = (idx) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setCurrent((idx + count) % count);
    setTimeout(() => setAnimating(false), 600);
  };

  useEffect(() => {
    if (!autoPlay || paused || count <= 1) return;
    timerRef.current = setInterval(() => goTo(current + 1), autoPlayDelay);
    return () => clearInterval(timerRef.current);
  }, [current, paused, autoPlay, autoPlayDelay, count]);

  const slide = demoSlides[current];
  const bg = slide.image
    ? { backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: DEMO_GRADIENTS[current % DEMO_GRADIENTS.length] };

  return (
    <section
      style={{ position: 'relative', overflow: 'hidden', height: heights[height] || '100vh', borderRadius: `${borderRadius}px` }}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      <style>{`
        @keyframes fadeInSlide { from{opacity:0} to{opacity:1} }
        @keyframes slideIn { from{transform:translateX(60px);opacity:0} to{transform:none;opacity:1} }
        @keyframes zoomIn  { from{transform:scale(1.08);opacity:0} to{transform:scale(1);opacity:1} }
        .carousel-arrow:hover { transform: scale(1.1) !important; }
        .carousel-dot:hover { transform: scale(1.4) !important; }
      `}</style>

      {/* Slide background */}
      <div style={{
        position: 'absolute', inset: 0, transition: 'opacity 0.5s',
        animation: `${transition === 'fade' ? 'fadeInSlide' : transition === 'slide' ? 'slideIn' : 'zoomIn'} 0.6s ease`,
        ...bg,
      }} />

      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: overlayColor }} />

      {/* Caption */}
      {showCaptions && slide.caption && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '0 40px', zIndex: 2,
        }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem,4vw,3rem)', fontWeight: '800', margin: '0 0 12px', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
            {slide.caption}
          </h2>
          {slide.subtitle && (
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', margin: '0 0 24px', maxWidth: '500px' }}>
              {slide.subtitle}
            </p>
          )}
          {slide.ctaText && (
            <a href={slide.ctaLink || '#'} style={{
              padding: '12px 28px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              color: '#fff', textDecoration: 'none', fontWeight: '700',
              border: '1.5px solid rgba(255,255,255,0.4)',
              transition: 'all 0.2s',
            }}>
              {slide.ctaText}
            </a>
          )}
        </div>
      )}

      {/* Arrows */}
      {showArrows && count > 1 && (
        <>
          {['prev', 'next'].map(dir => (
            <button key={dir} className="carousel-arrow" onClick={() => goTo(current + (dir === 'next' ? 1 : -1))} style={{
              position: 'absolute', top: '50%', [dir === 'prev' ? 'left' : 'right']: '16px',
              transform: 'translateY(-50%)',
              width: '44px', height: '44px', borderRadius: '50%',
              background: arrowBg, border: 'none',
              color: arrowColor, fontSize: '20px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 3, transition: 'transform 0.2s',
            }}>
              {dir === 'prev' ? '‹' : '›'}
            </button>
          ))}
        </>
      )}

      {/* Dots */}
      {showDots && count > 1 && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 3 }}>
          {demoSlides.map((_, i) => (
            <button key={i} className="carousel-dot" onClick={() => goTo(i)} style={{
              width: i === current ? '24px' : '8px', height: '8px',
              borderRadius: '4px', border: 'none', cursor: 'pointer',
              background: i === current ? dotsColor : `${dotsColor}66`,
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      )}
    </section>
  );
}
