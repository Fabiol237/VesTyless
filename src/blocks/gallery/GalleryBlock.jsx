'use client';
export default function GalleryBlock({ variant = 'masonry', settings = {}, content = {}, theme = {} }) {
  const { columns = '3', gap = 8, borderRadius = 8, hoverEffect = 'zoom', bgColor = '#ffffff', paddingTop = 60, paddingBottom = 60 } = settings;
  const { title = 'Notre Galerie', images = [] } = content;
  const demo = images.length > 0 ? images : [1,2,3,4,5,6].map(i => ({ id: i, src: null, alt: `Photo ${i}` }));
  const grads = ['linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#f093fb,#f5576c)','linear-gradient(135deg,#4facfe,#00f2fe)','linear-gradient(135deg,#43e97b,#38f9d7)','linear-gradient(135deg,#fa709a,#fee140)','linear-gradient(135deg,#a18cd1,#fbc2eb)'];
  return (
    <section style={{ background: bgColor, paddingTop, paddingBottom }}>
      <style>{`.gal-img{transition:transform 0.25s}.gal-img:hover{transform:scale(1.04)}`}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {title && <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: 32 }}>{title}</h2>}
        <div style={{ columns: parseInt(columns) || 3, gap: `${gap}px` }}>
          {demo.map((img, i) => (
            <div key={img.id || i} className="gal-img" style={{ marginBottom: gap, borderRadius, overflow: 'hidden', breakInside: 'avoid', cursor: 'pointer', height: i % 3 === 0 ? 280 : 200, background: img.src ? `url(${img.src}) center/cover` : grads[i % grads.length] }} />
          ))}
        </div>
      </div>
    </section>
  );
}
