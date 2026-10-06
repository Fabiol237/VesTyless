'use client';
import React, { useMemo } from 'react';
import { Theme } from '@/types/storefront';

interface ThemeProviderProps {
  theme?: Theme;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ThemeProvider({ theme, children, className = '', style = {} }: ThemeProviderProps) {
  const safeTheme: Theme = useMemo(() => ({
    mode: theme?.mode || (theme?.isDark ? 'dark' : 'light'),
    isDark: Boolean(theme?.isDark || theme?.mode === 'dark'),
    primaryColor: theme?.primaryColor || '#128C7E',
    accentColor: theme?.accentColor || '#25D366',
    bgColor: theme?.bgColor || (theme?.isDark || theme?.mode === 'dark' ? '#0B0F19' : '#FFFFFF'),
    textColor: theme?.textColor || (theme?.isDark || theme?.mode === 'dark' ? '#F8FAFC' : '#0F172A'),
    textMutedColor: theme?.textMutedColor || (theme?.isDark || theme?.mode === 'dark' ? '#94A3B8' : '#64748B'),
    borderColor: theme?.borderColor || (theme?.isDark || theme?.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'rgba(15, 23, 42, 0.08)'),
    font: theme?.font || 'Inter',
    headingFont: theme?.headingFont || theme?.font || 'Inter',
    borderRadius: theme?.borderRadius || 'smooth',
    buttonRadius: theme?.buttonRadius,
    customCss: theme?.customCss || '',
  }), [theme]);

  // Résolution des rayons de bordure
  const { cardRadius, buttonRadius } = useMemo(() => {
    let cRadius = '16px';
    let bRadius = '12px';

    if (safeTheme.borderRadius === 'sharp') {
      cRadius = '4px';
      bRadius = '4px';
    } else if (safeTheme.borderRadius === 'pill' || safeTheme.borderRadius === 'full') {
      cRadius = '24px';
      bRadius = '9999px';
    } else if (safeTheme.borderRadius === 'smooth') {
      cRadius = '16px';
      bRadius = '12px';
    } else if (typeof safeTheme.borderRadius === 'string' && safeTheme.borderRadius.includes('px')) {
      cRadius = safeTheme.borderRadius;
      bRadius = safeTheme.borderRadius;
    }

    if (safeTheme.buttonRadius !== undefined) {
      bRadius = typeof safeTheme.buttonRadius === 'number' ? `${safeTheme.buttonRadius}px` : safeTheme.buttonRadius;
    }

    return { cardRadius: cRadius, buttonRadius: bRadius };
  }, [safeTheme.borderRadius, safeTheme.buttonRadius]);

  // Variables CSS injectées dans le scope local
  // FIX DT-07 : Noms canoniques --btn-radius / --card-radius en plus des alias --vst-*
  // pour compatibilité totale avec Hero001, ServicesGrid et UniversalStorefrontRenderer
  const cssVariables = useMemo(() => ({
    // Tokens sémantiques VesTyle (--vst-*)
    '--vst-primary': safeTheme.primaryColor,
    '--vst-accent': safeTheme.accentColor,
    '--vst-bg': safeTheme.bgColor,
    '--vst-text': safeTheme.textColor,
    '--vst-muted': safeTheme.textMutedColor,
    '--vst-border': safeTheme.borderColor,
    '--vst-font': `'${safeTheme.font}', Inter, -apple-system, sans-serif`,
    '--vst-heading-font': `'${safeTheme.headingFont}', '${safeTheme.font}', Inter, sans-serif`,
    '--vst-radius-card': cardRadius,
    '--vst-radius-btn': buttonRadius,
    // Aliases canoniques du renderer universel (--btn-radius / --card-radius)
    '--btn-radius': buttonRadius,
    '--card-radius': cardRadius,
    // Aliases courts utilisés dans UniversalStorefrontRenderer
    '--prim': safeTheme.primaryColor,
    '--acc': safeTheme.accentColor,
    '--bg': safeTheme.bgColor,
    '--fg': safeTheme.textColor,
    '--fg2': safeTheme.textMutedColor,
    '--border': safeTheme.borderColor,
    '--font': `'${safeTheme.font}', Inter, -apple-system, sans-serif`,
    '--heading-font': `'${safeTheme.headingFont}', '${safeTheme.font}', Inter, sans-serif`,
  } as React.CSSProperties), [safeTheme, cardRadius, buttonRadius]);

  // Polices Google Fonts à injecter
  const fontsToLoad = useMemo(() => {
    const fonts = new Set<string>();
    if (safeTheme.font && safeTheme.font !== 'Inter' && safeTheme.font !== 'system-ui') {
      fonts.add(safeTheme.font);
    }
    if (safeTheme.headingFont && safeTheme.headingFont !== 'Inter' && safeTheme.headingFont !== 'system-ui') {
      fonts.add(safeTheme.headingFont);
    }
    return Array.from(fonts);
  }, [safeTheme.font, safeTheme.headingFont]);

  return (
    <div
      className={`vst-storefront-root w-full min-h-screen transition-colors duration-200 ${className}`}
      style={{
        ...cssVariables,
        ...style,
        backgroundColor: safeTheme.bgColor,
        color: safeTheme.textColor,
        fontFamily: 'var(--vst-font)',
        colorScheme: safeTheme.isDark ? 'dark' : 'light',
      }}
    >
      {/* Injection dynamique de polices Google Fonts via <link> (FIX DT-04 : remplace @import anti-pattern) */}
      {fontsToLoad.length > 0 && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {fontsToLoad.map((fontName) => (
            <link
              key={fontName}
              href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700;800;900&display=swap`}
              rel="stylesheet"
            />
          ))}
        </>
      )}

      {/* CSS personnalisé injecté si présent */}
      {safeTheme.customCss && (
        <style>{safeTheme.customCss}</style>
      )}

      {children}
    </div>
  );
}
