const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/context/BuilderContext.js');
let content = fs.readFileSync(file, 'utf8');

const newPresets = `export const THEME_PRESETS = [
  { id: 'ecommerce', name: 'Boutique E-commerce', primary: '#25D366', secondary: '#f0f2f5', accent: '#008069', mode: 'light', font: 'Inter', defaultModules: ['vitrine', 'catalogue', 'testimonials', 'newsletter'] },
  { id: 'hotel', name: 'Hôtel & Hébergement', primary: '#b45309', secondary: '#fffbeb', accent: '#78350f', mode: 'light', font: 'Cormorant Garamond', defaultModules: ['vitrine', 'reservation', 'services', 'contact'] },
  { id: 'restaurant', name: 'Restaurant & Gastronomie', primary: '#dc2626', secondary: '#fef2f2', accent: '#991b1b', mode: 'light', font: 'Plus Jakarta Sans', defaultModules: ['vitrine', 'restaurant', 'reservation', 'contact'] },
  { id: 'services', name: 'Services & Consultations', primary: '#0284c7', secondary: '#f0f9ff', accent: '#0369a1', mode: 'light', font: 'Outfit', defaultModules: ['vitrine', 'services', 'devis', 'contact'] },
  { id: 'portfolio', name: 'Créatif & Agence', primary: '#c026d3', secondary: '#18181b', accent: '#e879f9', mode: 'dark', font: 'Space Grotesk', defaultModules: ['vitrine', 'portfolio', 'links', 'contact'] },
  { id: 'event', name: 'Événementiel & Billetterie', primary: '#eab308', secondary: '#111827', accent: '#fef08a', mode: 'dark', font: 'Space Grotesk', defaultModules: ['vitrine', 'billetterie', 'newsletter'] },
];`;

content = content.replace(/export const THEME_PRESETS = \[\s*[\s\S]*?\s*\];/m, newPresets);
fs.writeFileSync(file, content);
console.log('Update presets complete');
