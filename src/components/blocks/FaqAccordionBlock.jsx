'use client';
import { useState } from 'react';

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const MinusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg>
);

const DEMO_ITEMS = [
  { question: 'Quels sont vos délais de livraison ?', answer: 'Nous livrons en 2 à 5 jours ouvrables selon votre localisation. Un suivi est disponible dès l\'expédition de votre colis.' },
  { question: 'Comment puis-je payer ?', answer: 'Nous acceptons les paiements par Mobile Money (Orange Money, MTN MoMo), par carte bancaire et en espèces à la livraison.' },
  { question: 'Puis-je retourner un article ?', answer: 'Oui, vous avez 14 jours pour retourner tout article non utilisé dans son emballage d\'origine. Contactez-nous pour initier le processus.' },
  { question: 'Comment vous contacter ?', answer: 'Vous pouvez nous joindre via WhatsApp, email ou le formulaire de contact. Nous répondons dans les 24h ouvrées.' },
];

export default function FaqAccordionBlock({ config = {}, theme = {} }) {
  const {
    title = 'Questions fréquentes',
    subtitle = '',
    items = DEMO_ITEMS,
    allowMultiple = false,
    defaultOpen = -1,
    style: cardStyle = 'border',
    bgColor = '#ffffff',
    itemBg = '#f9fafb',
    textColor = '#111827',
    iconColor = '#6366f1',
    paddingTop = 60,
    paddingBottom = 60,
  } = config;

  const [openIdx, setOpenIdx] = useState(allowMultiple ? (defaultOpen >= 0 ? [defaultOpen] : []) : (defaultOpen >= 0 ? defaultOpen : null));
  const displayItems = items.length > 0 ? items : DEMO_ITEMS;

  const isOpen = (i) => allowMultiple ? openIdx.includes(i) : openIdx === i;

  const toggle = (i) => {
    if (allowMultiple) {
      setOpenIdx(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
    } else {
      setOpenIdx(prev => prev === i ? null : i);
    }
  };

  const itemStyles = {
    border:  { border: '1.5px solid #e5e7eb', borderRadius: '12px', background: itemBg },
    card:    { boxShadow: '0 2px 16px rgba(0,0,0,0.07)', borderRadius: '12px', background: '#fff', border: 'none' },
    minimal: { borderBottom: '1px solid #e5e7eb', borderRadius: 0, background: 'transparent', border: 'none' },
    boxed:   { border: '2px solid ' + (theme.primaryColor || '#6366f1'), borderRadius: '12px', background: itemBg },
  };

  return (
    <section style={{ background: bgColor, paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <style>{`
        .faq-answer { transition: max-height 0.35s ease, opacity 0.3s ease; overflow: hidden; }
        .faq-item:hover .faq-q { color: ${iconColor} !important; }
      `}</style>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: textColor, margin: '0 0 8px' }}>{title}</h2>
          {subtitle && <p style={{ color: '#6b7280', margin: 0 }}>{subtitle}</p>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayItems.map((item, i) => (
            <div key={i} className="faq-item" style={itemStyles[cardStyle] || itemStyles.border} onClick={() => toggle(i)}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', cursor: 'pointer', gap: '12px',
              }}>
                <h3 className="faq-q" style={{
                  margin: 0, fontSize: '15px', fontWeight: '700',
                  color: isOpen(i) ? iconColor : textColor,
                  transition: 'color 0.2s', flex: 1,
                }}>
                  {item.question}
                </h3>
                <div style={{ color: iconColor, flexShrink: 0, transition: 'transform 0.3s', transform: isOpen(i) ? 'rotate(45deg)' : 'none' }}>
                  <PlusIcon />
                </div>
              </div>
              <div className="faq-answer" style={{ maxHeight: isOpen(i) ? '600px' : '0', opacity: isOpen(i) ? 1 : 0 }}>
                <div style={{ padding: '0 20px 16px', fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
