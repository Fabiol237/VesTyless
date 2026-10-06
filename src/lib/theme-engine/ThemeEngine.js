/**
 * VesTyle — Moteur Central de Direction Artistique & Thèmes (ThemeEngine)
 * ─────────────────────────────────────────────────────────────────────────────
 * Définit et applique la charte graphique de manière 100% déclarative.
 * Convertit des descriptions textuelles en palettes et tokens harmonieux.
 * ZÉRO CSS ARBITRAIRE.
 */

export const THEME_PALETTES = {
  emerald_luxury: {
    primary: '#128C7E',
    secondary: '#0F172A',
    accent: '#25D366',
    background: '#0F172A',
    text: '#FFFFFF',
  },
  gold_dark: {
    primary: '#C89B3C',
    secondary: '#0A0A0A',
    accent: '#FFD700',
    background: '#0A0A0A',
    text: '#F5F5F5',
  },
  pink_glow: {
    primary: '#E91E8C',
    secondary: '#2D0E1F',
    accent: '#FFD1E8',
    background: '#FFF5F8',
    text: '#2D0E1F',
  },
  tech_violet: {
    primary: '#7C3AED',
    secondary: '#06020F',
    accent: '#A78BFA',
    background: '#06020F',
    text: '#E2D9F3',
  },
  terracotta_warm: {
    primary: '#E8421A',
    secondary: '#1A0A00',
    accent: '#FFB547',
    background: '#FAFAF7',
    text: '#1A0A00',
  },
  clean_blue: {
    primary: '#2563EB',
    secondary: '#0F172A',
    accent: '#38BDF8',
    background: '#FFFFFF',
    text: '#0F172A',
  },
};

class ThemeEngine {
  /**
   * Crée un thème complet et harmonieux avec valeurs par défaut
   */
  createTheme(customOverrides = {}) {
    return {
      colors: {
        ...THEME_PALETTES.emerald_luxury,
        ...(customOverrides.colors || {}),
      },
      typography: {
        fontFamily: 'Inter',
        headingFont: 'Inter',
        fontScale: 1.0,
        ...(customOverrides.typography || {}),
      },
      spatial: {
        cardRadius: 'smooth',     // 'sharp' | 'smooth' | 'rounded' | 'pill'
        spacingScale: 'comfortable', // 'compact' | 'comfortable' | 'spacious' | 'airy'
        shadowStyle: 'soft',      // 'none' | 'subtle' | 'soft' | 'strong' | 'glow' | 'neon'
        blurEnabled: true,
        buttonStyle: 'filled',    // 'filled' | 'outline' | 'glass' | 'gradient'
        cardStyle: 'elevated',    // 'flat' | 'elevated' | 'glassmorphism' | 'bordered'
        imageStyle: 'cover',
        ...(customOverrides.spatial || {}),
      },
    };
  }

  /**
   * Génère un thème harmonieux à partir d'une description textuelle
   * Ex: "rose, élégant, féminin" -> Thème Pink Glow / Luxe
   */
  generateThemeFromDescription(description = '') {
    const lower = description.toLowerCase();

    // 1. Détection de la palette
    let selectedPalette = THEME_PALETTES.emerald_luxury;
    let headingFont = 'Inter';
    let cardRadius = 'smooth';
    let shadowStyle = 'soft';

    if (lower.includes('rose') || lower.includes('beauté') || lower.includes('féminin') || lower.includes('femme')) {
      selectedPalette = THEME_PALETTES.pink_glow;
      headingFont = 'Playfair Display';
      cardRadius = 'pill';
      shadowStyle = 'glow';
    } else if (lower.includes('or') || lower.includes('luxe') || lower.includes('prestige') || lower.includes('élégant')) {
      selectedPalette = THEME_PALETTES.gold_dark;
      headingFont = 'Playfair Display';
      cardRadius = 'sharp';
      shadowStyle = 'strong';
    } else if (lower.includes('tech') || lower.includes('violet') || lower.includes('moderne') || lower.includes('sombre')) {
      selectedPalette = THEME_PALETTES.tech_violet;
      headingFont = 'Inter';
      cardRadius = 'smooth';
      shadowStyle = 'neon';
    } else if (lower.includes('orange') || lower.includes('food') || lower.includes('chaud') || lower.includes('restaurant')) {
      selectedPalette = THEME_PALETTES.terracotta_warm;
      headingFont = 'Inter';
      cardRadius = 'rounded';
      shadowStyle = 'soft';
    } else if (lower.includes('bleu') || lower.includes('minimal') || lower.includes('clair') || lower.includes('blanc')) {
      selectedPalette = THEME_PALETTES.clean_blue;
      headingFont = 'Inter';
      cardRadius = 'smooth';
      shadowStyle = 'subtle';
    }

    return this.createTheme({
      colors: selectedPalette,
      typography: {
        fontFamily: 'Inter',
        headingFont,
        fontScale: 1.0,
      },
      spatial: {
        cardRadius,
        shadowStyle,
        spacingScale: lower.includes('luxe') ? 'spacious' : 'comfortable',
        blurEnabled: true,
      },
    });
  }
}

export const themeEngine = new ThemeEngine();
export { ThemeEngine };
