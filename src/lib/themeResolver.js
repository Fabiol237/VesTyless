// Résolveur de thèmes centralisé pour Vestyle
// Il garantit que chaque boutique est visuellement cohérente (coins, polices, ombres, couleurs)

export const THEME_TEMPLATES = {
  luxe: {
    fontFamily: 'Playfair Display, serif',
    borderRadius: '8px', // Coins très chics, rigides et précis
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    borderStyle: '1px solid rgba(181, 149, 90, 0.15)', // Couleur dorée ultra-fine
    accentColor: '#B5955A', // Or sablé
    spacingClass: 'py-16 md:py-24',
  },
  streetwear: {
    fontFamily: 'Montserrat, sans-serif',
    borderRadius: '0px', // Coins carrés très bruts style urbain
    boxShadow: 'none',
    borderStyle: '3px solid #000000', // Bordures noires épaisses
    accentColor: '#FF4D00', // Orange néon
    spacingClass: 'py-14 md:py-20',
  },
  artisan: {
    fontFamily: 'Outfit, sans-serif',
    borderRadius: '24px', // Coins doux et naturels
    boxShadow: '0 8px 30px rgba(139, 92, 26, 0.05)',
    borderStyle: '1px solid rgba(220, 200, 180, 0.5)',
    accentColor: '#D97706', // Ocre chaud
    spacingClass: 'py-12 md:py-18',
  },
  minimaliste: {
    fontFamily: 'Inter, sans-serif',
    borderRadius: '16px', // Coins arrondis modernes
    boxShadow: '0 4px 30px rgba(0,0,0,0.02)',
    borderStyle: '1px solid rgba(0,0,0,0.05)',
    accentColor: '#10B981', // Vert émeraude épuré
    spacingClass: 'py-12 md:py-16',
  }
};

/**
 * Génère les variables CSS unifiées en fonction du style du vendeur
 * @param {Object} storeConfig - Configuration de la boutique en base
 * @returns {Object} Variables CSS standards et classes unifiées
 */
export function resolveThemeVariables(storeConfig) {
  const selectedTheme = storeConfig?.shop_style || 'minimaliste'; // luxe, streetwear, artisan, minimaliste
  const template = THEME_TEMPLATES[selectedTheme] || THEME_TEMPLATES.minimaliste;

  const primaryColor = storeConfig?.primary_color || template.accentColor || '#128C7E';
  const bgColor = storeConfig?.bg_color || '#ffffff';
  
  // Déterminer si le fond est sombre
  const isDark = bgColor === '#0A0A0A' || bgColor === '#0f172a' || bgColor === '#18181b';
  
  return {
    // Variables CSS injectées
    '--font': template.fontFamily,
    '--radius': template.borderRadius,
    '--shadow': template.boxShadow,
    '--border-style': template.borderStyle,
    '--prim': primaryColor,
    '--bg': bgColor,
    '--fg': isDark ? '#ffffff' : '#0f172a',
    '--fg-secondary': isDark ? 'rgba(255,255,255,0.6)' : '#4b5563',
    '--border-color': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    
    // Classes et configurations globales
    spacingClass: template.spacingClass,
  };
}
