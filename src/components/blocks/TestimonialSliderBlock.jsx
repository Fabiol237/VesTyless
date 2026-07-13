'use client';
import { useState } from 'react';

const StarFilled = ({ color = '#f59e0b' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const DEMO_TESTIMONIALS = [
  { name: 'Aminata K.', role: 'Cliente fidèle', rating: 5, text: 'Service exceptionnel ! Les produits sont de très haute qualité et la livraison était rapide. Je recommande vivement cette boutique à tous mes amis.', avatar: '' },
  { name: 'Jean-Paul M.', role: 'Acheteur premium', rating: 5, text: 'J\'ai commandé plusieurs fois et je suis toujours satisfait. L\'équipe est réactive et les produits correspondent parfaitement aux descriptions.', avatar: '' },
  { name: 'Fatima B.', role: 'Cliente depuis 2023', rating: 4, text: 'Très bonne boutique avec un excellent rapport qualité-prix. La gamme est diverse et les prix sont compétitifs pour la région.', avatar: '' },
  { name: 'Patrick N.', role: 'Entrepreneur', rating: 5, text: 'Cette boutique a révolutionné ma façon de m\'approvisionner. Tout est simple, rapide et de qualité. Bravo pour le travail accompli !', avatar: '' },
];

export default function TestimonialSliderBlock({ config = {}, theme = {} }) {
  const {
    title = 'Ce que disent nos clients',
    subtitle = '',
    testimonials = [],
    layout = 'slider',
    cardStyle = 'card',
    bgColor = '#f9fafb',
    cardBg = '#ffffff',
    textColor = '#374151',
    starColor = '#f59e0b',
    showRating = true,
    showAvatar = true,
    paddingTop = 60,
    paddingBottom = 60,
  } = config;

  const [current, setCurrent] = useState(0);
  const items = testimonials.length > 0 ? testimonials : DEMO_TESTIMONIALS;
  const count = items.length;

  const cardShadow = cardStyle === 'card' ? '0 4px 24px rgba(0,0,0,0.08)' : cardStyle === 'glass' ? 'none' : 'none';
  const cardBorder = cardStyle === 'glass' ? '1px solid rgba(255,255,255,0.4)' : 'none';
  const cardBackground = cardStyle === 'glass' ? 'rgba(255,255,255,0.6)' : cardStyle === 'minimal' ? 'transparent' : cardBg;

  const AVATAR_COLORS = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6'];

  const renderCard = (item, i) => (
    <div key={i} style={{
      background: cardBackground,
      boxShadow: cardShadow,
      border: cardBorder,
      borderRadius: '16px',
      padding: '24px',
      backdropFilter: cardStyle === 'glass' ? 'blur(12px)' : 'none',
      borderLeft: cardStyle === 'quote' ? `4px solid ${theme.primaryColor || '#6366f1'}` : 'none',
      flex: layout === 'slider' ? '0 0 100%' : '1',
    }}>
      {/* Stars */}
      {showRating && (
        <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
          {Array.from({ length: 5 }).map((_, j) => (
            <StarFilled key={j} color={j < (item.rating || 5) ? starColor : '#e5e7eb'} />
          ))}
        </div>
      )}

      {/* Quote */}
      <p style={{ color: textColor, fontSize: '14px', lineHeight: 1.7, margin: '0 0 16px', fontStyle: 'italic' }}>
        "{item.text}"
      </p>

      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {showAvatar && (
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
            background: item.avatar ? `url(${item.avatar}) center/cover` : AVATAR_COLORS[i % AVATAR_COLORS.length],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: '800', fontSize: '16px',
          }}>
            {!item.avatar && (item.name?.[0] || '?')}
          </div>
        )}
        <div>
          <div style={{ fontWeight: '700', fontSize: '13px', color: '#111827' }}>{item.name}</div>
          {item.role && <div style={{ fontSize: '11px', color: '#9ca3af' }}>{item.role}</div>}
        </div>
      </div>
    </div>
  );

  return (
    <section style={{ background: bgColor, paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <style>{`
        @keyframes slideT { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
      `}</style>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', margin: '0 0 8px' }}>{title}</h2>
          {subtitle && <p style={{ color: '#6b7280', margin: 0 }}>{subtitle}</p>}
        </div>

        {layout === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
            {items.map((t, i) => renderCard(t, i))}
          </div>
        ) : (
          /* Slider */
          <div style={{ position: 'relative' }}>
            <div style={{ overflow: 'hidden', borderRadius: '16px' }}>
              <div style={{ display: 'flex', animation: 'slideT 0.4s ease' }}>
                {renderCard(items[current], current)}
              </div>
            </div>
            {count > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px', alignItems: 'center' }}>
                <button onClick={() => setCurrent((current - 1 + count) % count)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: `2px solid ${theme.primaryColor || '#6366f1'}`, background: 'transparent', color: theme.primaryColor || '#6366f1', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                {items.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? '24px' : '8px', height: '8px', borderRadius: '4px', border: 'none', background: i === current ? (theme.primaryColor || '#6366f1') : '#d1d5db', cursor: 'pointer', transition: 'all 0.3s' }} />
                ))}
                <button onClick={() => setCurrent((current + 1) % count)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: `2px solid ${theme.primaryColor || '#6366f1'}`, background: 'transparent', color: theme.primaryColor || '#6366f1', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
