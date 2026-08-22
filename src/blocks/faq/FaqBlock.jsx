'use client';
import { useState } from 'react';

/**
 * FaqBlock — FAQ en accordéon
 * Variants: border | card | minimal | boxed
 */
export default function FaqBlock({ variant = 'border', settings = {}, content = {}, theme = {} }) {
  const {
    allowMultiple = false,
    defaultOpen = -1,
    bgColor = '#ffffff',
    itemBg = '#f9fafb',
    textColor = '#111827',
    iconColor = '#6366f1',
    paddingTop = 60,
    paddingBottom = 60,
  } = settings;

  const {
    title = 'Questions fréquentes',
    subtitle = '',
    items = [],
  } = content;

  const [open, setOpen] = useState(defaultOpen >= 0 ? [defaultOpen] : []);
  const primary = theme.primaryColor || iconColor;
  if (!items || items.length === 0) return null;

  const toggle = (i) => {
    setOpen(prev => {
      if (allowMultiple) {
        return prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i];
      }
      return prev.includes(i) ? [] : [i];
    });
  };

  const getItemStyle = () => {
    switch (variant) {
      case 'card':    return { background: itemBg, borderRadius: 12, marginBottom: 12, border: 'none', overflow: 'hidden' };
      case 'minimal': return { borderBottom: '1px solid #f3f4f6', background: 'transparent' };
      case 'boxed':   return { border: '1.5px solid #e5e7eb', borderRadius: 8, marginBottom: 8, background: '#fff', overflow: 'hidden' };
      default:        return { borderBottom: '1px solid #e5e7eb', background: 'transparent' };
    }
  };

  return (
    <section style={{ background: bgColor, paddingTop, paddingBottom }}>
      <style>{`
        .faq-answer{overflow:hidden;transition:max-height 0.35s ease,padding 0.35s ease}
        .faq-icon{transition:transform 0.3s}
      `}</style>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        {title && <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: subtitle ? 8 : 40 }}>{title}</h2>}
        {subtitle && <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 40 }}>{subtitle}</p>}

        <div>
          {items.map((item, i) => {
            const isOpen = open.includes(i);
            return (
              <div key={i} style={getItemStyle()}>
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 12, padding: variant === 'minimal' ? '20px 0' : '20px 24px',
                    background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 16, color: textColor, lineHeight: 1.4, flex: 1 }}>
                    {item.question}
                  </span>
                  <span className="faq-icon" style={{ color: isOpen ? primary : '#9ca3af', fontSize: 20, fontWeight: 300, transform: isOpen ? 'rotate(45deg)' : 'none', flexShrink: 0, lineHeight: 1 }}>
                    +
                  </span>
                </button>
                <div className="faq-answer" style={{ maxHeight: isOpen ? 500 : 0, paddingBottom: isOpen ? 20 : 0, paddingLeft: variant === 'minimal' ? 0 : 24, paddingRight: variant === 'minimal' ? 0 : 24 }}>
                  <p style={{ color: '#6b7280', lineHeight: 1.7, margin: 0, fontSize: 15 }}>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
