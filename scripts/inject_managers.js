const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/builder/[storeId]/BuilderEditor.js');
let content = fs.readFileSync(file, 'utf8');

// Add imports if not present
if (!content.includes('import RestaurantManager')) {
  content = content.replace("import CatalogueManager from './CatalogueManager';", "import CatalogueManager from './CatalogueManager';\nimport RestaurantManager from './RestaurantManager';\nimport ServicesManager from './ServicesManager';");
}

// Inject RestaurantManager
const restaurantBlock = `  if (module.type === 'restaurant') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <ConfigToggle label="Afficher les catégories" value={cfg.showCategories} onChange={v => update('showCategories', v)} />
      <ConfigToggle label="Afficher les allergènes" value={cfg.showAllergens} onChange={v => update('showAllergens', v)} />
      <ConfigToggle label="Commande à emporter" value={cfg.allowClickCollect} onChange={v => update('allowClickCollect', v)} />
      <ConfigToggle label="Réservation de table" value={cfg.allowTableBooking} onChange={v => update('allowTableBooking', v)} />
      <RestaurantManager storeId={storeId} />
    </div>
  );`;

content = content.replace(/if \(module\.type === 'restaurant'\) return \(\s*<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '14px' \}\}>\s*<ConfigToggle label="Afficher les catégories" value=\{cfg\.showCategories\} onChange=\{v => update\('showCategories', v\)\} \/>\s*<ConfigToggle label="Afficher les allergènes" value=\{cfg\.showAllergens\} onChange=\{v => update\('showAllergens', v\)\} \/>\s*<ConfigToggle label="Commande à emporter" value=\{cfg\.allowClickCollect\} onChange=\{v => update\('allowClickCollect', v\)\} \/>\s*<ConfigToggle label="Réservation de table" value=\{cfg\.allowTableBooking\} onChange=\{v => update\('allowTableBooking', v\)\} \/>\s*<\/div>\s*\);/m, restaurantBlock);

// Inject ServicesManager into 'services'
const servicesBlock = `  if (module.type === 'services') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <ConfigSelect label="Disposition" value={cfg.layout} onChange={v => update('layout', v)} options={['cards','list']} />
      <ConfigToggle label="Afficher les tarifs" value={cfg.showPricing} onChange={v => update('showPricing', v)} />
      <ConfigToggle label="Afficher la durée" value={cfg.showDuration} onChange={v => update('showDuration', v)} />
      <ServicesManager storeId={storeId} />
    </div>
  );`;

content = content.replace(/if \(module\.type === 'services'\) return \(\s*<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '14px' \}\}>\s*<ConfigSelect label="Disposition" value=\{cfg\.layout\} onChange=\{v => update\('layout', v\)\} options=\{\['cards','list'\]\} \/>\s*<ConfigToggle label="Afficher les tarifs" value=\{cfg\.showPricing\} onChange=\{v => update\('showPricing', v\)\} \/>\s*<ConfigToggle label="Afficher la durée" value=\{cfg\.showDuration\} onChange=\{v => update\('showDuration', v\)\} \/>\s*<\/div>\s*\);/m, servicesBlock);

// Inject ServicesManager into 'reservation'
const reservationBlock = `  if (module.type === 'reservation') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <ConfigField label="Heure de début" value={cfg.startTime} onChange={v => update('startTime', v)} type="time" />
      <ConfigField label="Heure de fin" value={cfg.endTime} onChange={v => update('endTime', v)} type="time" />
      <ConfigField label="Durée d'un créneau (min)" value={String(cfg.slotDuration)} onChange={v => update('slotDuration', Number(v))} type="number" />
      <ConfigField label="Temps de battement (min)" value={String(cfg.bufferTime)} onChange={v => update('bufferTime', Number(v))} type="number" />
      <ConfigToggle label="Paiement requis" value={cfg.requirePayment} onChange={v => update('requirePayment', v)} />
      <ServicesManager storeId={storeId} />
    </div>
  );`;

content = content.replace(/if \(module\.type === 'reservation'\) return \(\s*<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '14px' \}\}>\s*<ConfigField label="Heure de début" value=\{cfg\.startTime\} onChange=\{v => update\('startTime', v\)\} type="time" \/>\s*<ConfigField label="Heure de fin" value=\{cfg\.endTime\} onChange=\{v => update\('endTime', v\)\} type="time" \/>\s*<ConfigField label="Durée d'un créneau \(min\)" value=\{String\(cfg\.slotDuration\)\} onChange=\{v => update\('slotDuration', Number\(v\)\)\} type="number" \/>\s*<ConfigField label="Temps de battement \(min\)" value=\{String\(cfg\.bufferTime\)\} onChange=\{v => update\('bufferTime', Number\(v\)\)\} type="number" \/>\s*<ConfigToggle label="Paiement requis" value=\{cfg\.requirePayment\} onChange=\{v => update\('requirePayment', v\)\} \/>\s*<\/div>\s*\);/m, reservationBlock);

fs.writeFileSync(file, content);
console.log('Update editor for Service/Restaurant Managers complete');
