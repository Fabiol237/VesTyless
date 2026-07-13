const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/builder/[storeId]/BuilderEditor.js');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import CatalogueManager')) {
  content = content.replace("import PortfolioManager from './PortfolioManager';", "import PortfolioManager from './PortfolioManager';\nimport CatalogueManager from './CatalogueManager';");
}

const catalogueBlock = `  if (module.type === 'catalogue') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <ConfigSelect label="Colonnes" value={String(cfg.gridCols || '3')} onChange={v => update('gridCols', Number(v))} options={['2','3','4']} />
      <ConfigToggle label="Afficher les filtres" value={cfg.showFilters} onChange={v => update('showFilters', v)} />
      <ConfigToggle label="Afficher le stock" value={cfg.showStock} onChange={v => update('showStock', v)} />
      <ConfigToggle label="Activer le panier" value={cfg.allowCart} onChange={v => update('allowCart', v)} />
      <ConfigField label="Devise" value={cfg.currency} onChange={v => update('currency', v)} />
      <CatalogueManager storeId={storeId} />
    </div>
  );`;

content = content.replace(/if \(module\.type === 'catalogue'\) return \(\s*<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '14px' \}\}>\s*<ConfigSelect label="Colonnes" value=\{String\(cfg\.gridCols \|\| '3'\)\} onChange=\{v => update\('gridCols', Number\(v\)\)\} options=\{\['2','3','4'\]\} \/>\s*<ConfigToggle label="Afficher les filtres" value=\{cfg\.showFilters\} onChange=\{v => update\('showFilters', v\)\} \/>\s*<ConfigToggle label="Afficher le stock" value=\{cfg\.showStock\} onChange=\{v => update\('showStock', v\)\} \/>\s*<ConfigToggle label="Activer le panier" value=\{cfg\.allowCart\} onChange=\{v => update\('allowCart', v\)\} \/>\s*<ConfigField label="Devise" value=\{cfg\.currency\} onChange=\{v => update\('currency', v\)\} \/>\s*<\/div>\s*\);/m, catalogueBlock);

fs.writeFileSync(file, content);
console.log('Update editor for CatalogueManager complete');
