'use client';
import { useState } from 'react';

const DEMO_IMAGES = Array.from({ length: 9 }, (_, i) => ({
  url: '',
  alt: `Photo ${i + 1}`,
  gradient: [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)',
    'linear-gradient(135deg,#a18cd1,#fbc2eb)',
    'linear-gradient(135deg,#ffecd2,#fcb69f)',
    'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
    'linear-gradient(135deg,#d4fc79,#96e6a1)',
  ][i],
}));

export default function ImageGalleryBlock({ config = {}, theme = {} }) {
  const {
    title = 'Notre Galerie',
    images = [],
    layout = 'masonry',
    columns = '3',
    gap = 8,
    borderRadius = 8,
    hoverEffect = 'zoom',
    openLightbox = true,
    bgColor = '#ffffff',
    paddingTop = 60,
    paddingBottom = 60,
  } = config;

  const [lightbox, setLightbox] = useState(null);
  const displayImages = images.length > 0 ? images : DEMO_IMAGES;
  const cols = parseInt(columns) || 3;

  // Diviser en colonnes pour masonry
  const masonryCols = Array.from({ length: cols }, (_, i) =>
    displayImages.filter((_, idx) => idx % cols === i)
  );

  const imgStyle = (item, i) => ({
    width: '100%',
    aspectRatio: layout === 'masonry' ? undefined : '1',
    display: 'block',
    background: item.url ? `url(${item.url}) center/cover` : (item.gradient || DEMO_IMAGES[i % 9]?.gradient),
    borderRadius: `${borderRadius}px`,
    cursor: openLightbox ? 'zoom-in' : 'default',
    transition: 'transform 0.3s, box-shadow 0.3s',
    minHeight: layout === 'masonry' ? `${120 + (i % 3) * 60}px` : undefined,
  });

  const hoverClass = hoverEffect === 'zoom' ? 'gallery-zoom' : hoverEffect === 'lift' ? 'gallery-lift' : '';

  return (
    <section style={{ background: bgColor, paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <style>{`
        .gallery-zoom:hover { transform: scale(1.03); }
        .gallery-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.15); }
        .gallery-overlay { position: relative; overflow: hidden; }
        .gallery-overlay::after { content:''; position:absolute;inset:0;background:rgba(0,0,0,0);transition:background 0.3s; }
        .gallery-overlay:hover::after { background: rgba(0,0,0,0.25); }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {title && (
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', color: '#111827', margin: '0 0 32px' }}>{title}</h2>
        )}

        {layout === 'masonry' ? (
          <div style={{ display: 'flex', gap: `${gap}px` }}>
            {masonryCols.map((col, ci) => (
              <div key={ci} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
                {col.map((img, ii) => (
                  <div key={ii} className={`${hoverClass} gallery-overlay`} onClick={() => openLightbox && setLightbox(img)} style={imgStyle(img, ci * cols + ii)} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gap}px` }}>
            {displayImages.map((img, i) => (
              <div key={i} className={`${hoverClass} gallery-overlay`} onClick={() => openLightbox && setLightbox(img)} style={imgStyle(img, i)} />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.9)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'zoom-out',
        }}>
          <div style={{
            width: '90vw', height: '80vh',
            background: lightbox.url ? `url(${lightbox.url}) center/contain no-repeat` : lightbox.gradient,
            borderRadius: '12px',
          }} />
          <button onClick={() => setLightbox(null)} style={{
            position: 'fixed', top: '20px', right: '24px',
            background: 'rgba(255,255,255,0.15)', border: 'none',
            color: '#fff', fontSize: '28px', cursor: 'pointer', borderRadius: '8px',
            padding: '4px 12px', backdropFilter: 'blur(8px)',
          }}>×</button>
        </div>
      )}
    </section>
  );
}
