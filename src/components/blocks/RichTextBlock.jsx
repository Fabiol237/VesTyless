'use client';

function parseGradient(g) {
  if (!g) return null;
  return `linear-gradient(${g})`;
}

export default function RichTextBlock({ config = {}, theme = {} }) {
  const {
    title = 'Notre Histoire',
    titleSize = '3xl',
    titleColor = '#111827',
    titleAlign = 'center',
    content = '<p>Partagez votre histoire, vos valeurs ou toute information importante pour vos clients.</p>',
    contentColor = '#374151',
    contentSize = 'base',
    bgColor = '#ffffff',
    maxWidth = '3xl',
    showDivider = false,
    dividerColor = '#6366f1',
    paddingTop = 60,
    paddingBottom = 60,
  } = config;

  const titleSizes = { xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem' };
  const contentSizes = { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' };
  const maxWidths = { sm: '480px', md: '640px', lg: '800px', xl: '960px', '2xl': '1120px', '3xl': '1280px', full: '100%' };

  return (
    <section style={{ background: bgColor, paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <style>{`
        .richtext-content p { margin: 0 0 1em; }
        .richtext-content ul, .richtext-content ol { paddingLeft: 1.5em; marginBottom: 1em; }
        .richtext-content li { marginBottom: 0.4em; }
        .richtext-content strong { fontWeight: 700; }
        .richtext-content em { fontStyle: italic; }
        .richtext-content a { color: ${theme.primaryColor || '#6366f1'}; textDecoration: underline; }
      `}</style>
      <div style={{ maxWidth: maxWidths[maxWidth] || '1280px', margin: '0 auto', padding: '0 24px' }}>
        {title && (
          <div style={{ textAlign: titleAlign, marginBottom: showDivider ? '16px' : '24px' }}>
            <h2 style={{
              fontSize: titleSizes[titleSize] || '1.875rem',
              fontWeight: '800', color: titleColor, margin: 0,
              lineHeight: 1.2, letterSpacing: '-0.01em',
            }}>
              {title}
            </h2>
            {showDivider && (
              <div style={{
                width: '60px', height: '4px', borderRadius: '2px',
                background: dividerColor,
                margin: titleAlign === 'center' ? '16px auto 0' : titleAlign === 'right' ? '16px 0 0 auto' : '16px 0 0',
              }} />
            )}
          </div>
        )}
        <div
          className="richtext-content"
          style={{
            fontSize: contentSizes[contentSize] || '1rem',
            color: contentColor,
            lineHeight: 1.75,
            textAlign: titleAlign,
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
}
