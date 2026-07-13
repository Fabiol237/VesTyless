'use client';
import { useEffect, useState, useRef } from 'react';

function useCountUp(target, duration = 1500, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const num = parseFloat(String(target).replace(/[^0-9.]/g, ''));
    if (isNaN(num)) { setVal(target); return; }
    let startTime = null;
    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setVal(Math.floor(progress * num));
      if (progress < 1) requestAnimationFrame(animate);
      else setVal(target);
    };
    requestAnimationFrame(animate);
  }, [start, target, duration]);
  return val;
}

function StatItem({ stat, index, started, textColor, valueColor, showDivider, isLast }) {
  const count = useCountUp(stat.value, 1500, started);
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '24px 16px',
      borderRight: showDivider && !isLast ? '1px solid rgba(255,255,255,0.15)' : 'none',
      position: 'relative',
    }}>
      {stat.icon && <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>}
      <div style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', color: valueColor, lineHeight: 1, marginBottom: '6px' }}>
        {started ? count : 0}
        {typeof stat.value === 'string' && /[^0-9]/.test(stat.value) && !started ? stat.value : ''}
        {typeof stat.value === 'string' && stat.value.includes('★') ? '★' : ''}
        {typeof stat.value === 'string' && stat.value.includes('%') ? '%' : ''}
        {typeof stat.value === 'string' && stat.value.includes('+') ? '+' : ''}
      </div>
      <div style={{ fontSize: '13px', color: textColor, fontWeight: '500', opacity: 0.85 }}>{stat.label}</div>
    </div>
  );
}

export default function StatsBarBlock({ config = {}, theme = {} }) {
  const {
    stats = [
      { value: '1 200', label: 'Clients satisfaits', icon: '👥' },
      { value: '4.9★', label: 'Note moyenne', icon: '⭐' },
      { value: '5 000+', label: 'Commandes livrées', icon: '📦' },
      { value: '100%', label: 'Satisfaction garantie', icon: '✅' },
    ],
    layout = 'row',
    bgColor = '#1e1b4b',
    textColor = '#c7d2fe',
    valueColor = '#a5b4fc',
    animated = true,
    showDivider = true,
    paddingTop = 40,
    paddingBottom = 40,
  } = config;

  const [started, setStarted] = useState(!animated);
  const ref = useRef(null);

  useEffect(() => {
    if (!animated) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStarted(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animated]);

  return (
    <section ref={ref} style={{ background: bgColor, paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
        display: layout === 'row' ? 'flex' : 'flex',
        flexDirection: layout === 'column' ? 'column' : 'row',
        flexWrap: 'wrap',
        gap: layout === 'cards' ? '16px' : '0',
      }}>
        {stats.map((stat, i) =>
          layout === 'cards' ? (
            <div key={i} style={{
              flex: '1 0 200px', textAlign: 'center', padding: '24px',
              background: 'rgba(255,255,255,0.08)', borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
            }}>
              {stat.icon && <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>}
              <div style={{ fontSize: '2rem', fontWeight: '900', color: valueColor }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: textColor, marginTop: '4px' }}>{stat.label}</div>
            </div>
          ) : (
            <StatItem
              key={i} stat={stat} index={i} started={started}
              textColor={textColor} valueColor={valueColor}
              showDivider={showDivider} isLast={i === stats.length - 1}
            />
          )
        )}
      </div>
    </section>
  );
}
