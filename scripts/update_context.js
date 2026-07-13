const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/context/BuilderContext.js');
let content = fs.readFileSync(file, 'utf8');

// Replace THEME_PRESETS to add defaultModules
const newPresets = `export const THEME_PRESETS = [
  { id: 'violet', name: 'Boutique Pro', primary: '#6366f1', secondary: '#f0f0ff', accent: '#a855f7', mode: 'light', font: 'Inter', defaultModules: ['vitrine', 'catalogue', 'newsletter'] },
  { id: 'emerald', name: 'Restaurant', primary: '#10b981', secondary: '#f0fdf4', accent: '#059669', mode: 'light', font: 'Plus Jakarta Sans', defaultModules: ['vitrine', 'restaurant', 'contact'] },
  { id: 'midnight', name: 'Portfolio', primary: '#818cf8', secondary: '#1e1b4b', accent: '#c084fc', mode: 'dark', font: 'Space Grotesk', defaultModules: ['vitrine', 'portfolio', 'contact'] },
  { id: 'rose', name: 'Beauté & Bien-être', primary: '#f43f5e', secondary: '#fff1f2', accent: '#fb923c', mode: 'light', font: 'Outfit', defaultModules: ['vitrine', 'services', 'testimonials'] },
  { id: 'ocean', name: 'Agence', primary: '#0ea5e9', secondary: '#f0f9ff', accent: '#38bdf8', mode: 'light', font: 'Inter', defaultModules: ['vitrine', 'services', 'devis'] },
  { id: 'amber', name: 'Luxe & VIP', primary: '#f59e0b', secondary: '#1c1917', accent: '#fbbf24', mode: 'dark', font: 'Cormorant Garamond', defaultModules: ['vitrine', 'catalogue', 'abonnement'] },
  { id: 'slate', name: 'Créateur (Link in Bio)', primary: '#64748b', secondary: '#f8fafc', accent: '#475569', mode: 'light', font: 'DM Sans', defaultModules: ['vitrine', 'links', 'contact'] },
  { id: 'neon', name: 'Événement & Billetterie', primary: '#a855f7', secondary: '#0a0a0a', accent: '#22d3ee', mode: 'dark', font: 'Space Grotesk', defaultModules: ['vitrine', 'billetterie', 'contact'] },
];`;

content = content.replace(/export const THEME_PRESETS = \[\s*[\s\S]*?\s*\];/m, newPresets);

// Also add a loadTemplate function to context
if (!content.includes('LOAD_TEMPLATE')) {
  const reducerLoadTemplate = `    case 'LOAD_TEMPLATE': {
      const newModules = action.modules.map((type, i) => {
        const def = MODULE_DEFINITIONS[type];
        return {
          id: \`temp_\${Date.now()}_\${i}\`,
          type,
          label: def.label,
          icon: def.icon,
          position: i,
          is_active: true,
          config: { ...def.defaultConfig },
        };
      });
      return { ...state, modules: newModules, themeConfig: action.themeConfig, activeModuleId: newModules[0]?.id, isDirty: true };
    }`;
  
  content = content.replace(/case 'ADD_MODULE':/, reducerLoadTemplate + "\n\n    case 'ADD_MODULE':");

  const loadTemplateFunc = `  const loadTemplate = useCallback((modules, themeConfig) => {
    if (confirm('Cela remplacera vos modules actuels par ceux du modèle. Continuer ?')) {
      dispatch({ type: 'LOAD_TEMPLATE', modules, themeConfig });
    }
  }, []);`;
  
  content = content.replace(/const addModule = useCallback/, loadTemplateFunc + "\n\n  const addModule = useCallback");
  
  content = content.replace(/init, addModule, removeModule/, "init, loadTemplate, addModule, removeModule");
}

fs.writeFileSync(file, content);
console.log('Update BuilderContext complete');
