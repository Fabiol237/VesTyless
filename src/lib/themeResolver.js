// Résolveur de thèmes centralisé pour Vestyle - Univers Visuels Riches & Élégants

export const THEME_PRESETS = {
  luxe: {
    id: 'luxe',
    name: 'Haute Couture / Luxe',
    fontFamily: "'Playfair Display', Georgia, serif",
    headingFont: "'Playfair Display', Georgia, serif",
    bg: '#0D0B09',
    cardBg: '#161310',
    fg: '#F7F4EF',
    fgSecondary: '#B5955A',
    accent: '#D4AF37',
    border: 'rgba(212, 175, 55, 0.2)',
    radius: '4px',
    shadow: '0 20px 50px rgba(0,0,0,0.6)',
    heroLayout: 'immersive-full', // Image plein écran avec typographie dorée
    cardStyle: 'border-gold',
  },
  streetwear: {
    id: 'streetwear',
    name: 'Streetwear / Urban',
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    headingFont: "'Space Grotesk', sans-serif",
    bg: '#050505',
    cardBg: '#121212',
    fg: '#FFFFFF',
    fgSecondary: '#A0A0A0',
    accent: '#CCFF00', // Neon Lime
    border: 'rgba(255,255,255,0.12)',
    radius: '0px',
    shadow: 'none',
    heroLayout: 'asymmetric-bold', // Layout asymétrique percutant
    cardStyle: 'raw-sharp',
  },
  artisan: {
    id: 'artisan',
    name: 'Artisanat / Éco & Beauté',
    fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
    headingFont: "'Outfit', sans-serif",
    bg: '#FBF9F5',
    cardBg: '#FFFFFF',
    fg: '#2C221E',
    fgSecondary: '#8C7A6B',
    accent: '#C87D55', // Terracotta warm
    border: 'rgba(200, 125, 85, 0.15)',
    radius: '24px',
    shadow: '0 12px 35px rgba(44, 34, 30, 0.04)',
    heroLayout: 'soft-split', // Split doux avec image arrondie à droite
    cardStyle: 'soft-elevated',
  },
  minimaliste: {
    id: 'minimaliste',
    name: 'Minimaliste / Chic Studio',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    headingFont: "'Plus Jakarta Sans', sans-serif",
    bg: '#FFFFFF',
    cardBg: '#F8FAFC',
    fg: '#0F172A',
    fgSecondary: '#64748B',
    accent: '#0284C7', // Sky Blue Premium
    border: 'rgba(15, 23, 42, 0.06)',
    radius: '16px',
    shadow: '0 4px 25px rgba(0,0,0,0.03)',
    heroLayout: 'centered-clean', // Centré épuré haut de gamme
    cardStyle: 'clean-border',
  }
};

export function resolveThemeVariables(storeConfig = {}) {
  // Sélection du preset selon la config boutique ou le thème
  const styleKey = storeConfig?.shop_style || storeConfig?.theme || 'minimaliste';
  const preset = THEME_PRESETS[styleKey] || THEME_PRESETS.minimaliste;

  const primaryColor = storeConfig?.primary_color || preset.accent;
  const bgColor = storeConfig?.bg_color || preset.bg;

  const isDark = bgColor === '#0D0B09' || bgColor === '#050505' || bgColor === '#0A0A0A' || bgColor === '#0f172a';

  return {
    '--font': preset.fontFamily,
    '--font-heading': preset.headingFont,
    '--radius': preset.radius,
    '--shadow': preset.shadow,
    '--border-style': preset.border,
    '--prim': primaryColor,
    '--bg': bgColor,
    '--card-bg': isDark ? (preset.cardBg || '#121212') : '#FFFFFF',
    '--fg': isDark ? '#FFFFFF' : (preset.fg || '#0F172A'),
    '--fg2': isDark ? 'rgba(255,255,255,0.6)' : (preset.fgSecondary || '#64748B'),
    '--border': isDark ? 'rgba(255,255,255,0.1)' : preset.border,
    heroLayout: preset.heroLayout,
    cardStyle: preset.cardStyle,
  };
}
