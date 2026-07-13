'use client';

export default function DividerBlock({ config = {} }) {
  const { style = 'line', color = '#e5e7eb', height = 2, width = 'full', margin = 24 } = config;
  const widths = { full: '100%', '3/4': '75%', '1/2': '50%', '1/4': '25%' };

  if (style === 'none') return <div style={{ margin: `${margin}px 0` }} />;

  if (style === 'wave') {
    return (
      <div style={{ margin: `${margin}px auto`, width: widths[width], display: 'flex', justifyContent: 'center' }}>
        <svg viewBox="0 0 1200 60" style={{ width: '100%', height: '30px' }} preserveAspectRatio="none">
          <path d="M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30" fill="none" stroke={color} strokeWidth={height} />
        </svg>
      </div>
    );
  }

  if (style === 'dots') {
    return (
      <div style={{ margin: `${margin}px auto`, display: 'flex', justifyContent: 'center', gap: '8px', width: widths[width] }}>
        {[0,1,2,3,4].map(i => <div key={i} style={{ width: height * 3, height: height * 3, borderRadius: '50%', background: color, opacity: i === 2 ? 1 : 0.5 }} />)}
      </div>
    );
  }

  if (style === 'diagonal') {
    return (
      <div style={{ margin: `${margin}px auto`, width: widths[width], height: `${height * 2}px`, overflow: 'hidden' }}>
        <svg viewBox="0 0 100 10" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
          <path d="M0,10 L100,0" stroke={color} strokeWidth="2" />
        </svg>
      </div>
    );
  }

  if (style === 'zigzag') {
    return (
      <div style={{ margin: `${margin}px auto`, width: widths[width], display: 'flex', justifyContent: 'center' }}>
        <svg viewBox="0 0 120 12" style={{ width: '100%', height: '12px' }} preserveAspectRatio="none">
          <polyline points="0,6 10,0 20,6 30,0 40,6 50,0 60,6 70,0 80,6 90,0 100,6 110,0 120,6" fill="none" stroke={color} strokeWidth={height} strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  // default: line
  return (
    <div style={{ margin: `${margin}px auto`, width: widths[width] || '100%', height: `${height}px`, background: color, borderRadius: `${height}px` }} />
  );
}
