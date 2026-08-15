'use client';

export default function SectionHeader({
  badge,
  icon: Icon,
  title,
  subtitle,
  centered = true,
  theme = {}
}) {
  const p = theme['--prim'] || '#128C7E';
  const fg = theme['--fg'] || '#0f172a';
  const fg2 = theme['--fg2'] || '#64748b';
  const fontHeading = theme['--font-heading'] || 'inherit';

  return (
    <div className={`mb-12 ${centered ? 'text-center' : 'text-left'}`}>
      {badge && (
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-4 border ${
            centered ? 'mx-auto' : ''
          }`}
          style={{
            background: `${p}12`,
            borderColor: `${p}25`,
            color: p,
          }}
        >
          {Icon && <Icon size={14} />}
          <span>{badge}</span>
        </div>
      )}

      {title && (
        <h2
          className="text-3xl sm:text-4xl font-black tracking-tight mb-3"
          style={{
            color: fg,
            fontFamily: fontHeading,
            lineHeight: 1.15,
          }}
        >
          {title}
        </h2>
      )}

      {subtitle && (
        <p
          className={`text-base sm:text-lg leading-relaxed max-w-2xl ${
            centered ? 'mx-auto' : ''
          }`}
          style={{ color: fg2 }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
