const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/builder/[storeId]/BuilderEditor.js');
let content = fs.readFileSync(file, 'utf8');

// Add import
if (!content.includes('import PortfolioManager')) {
  content = content.replace("import { useBuilder, MODULE_DEFINITIONS, THEME_PRESETS } from '@/context/BuilderContext';", "import { useBuilder, MODULE_DEFINITIONS, THEME_PRESETS } from '@/context/BuilderContext';\nimport PortfolioManager from './PortfolioManager';");
}

// Add storeId prop to ModuleConfigFields signature
content = content.replace(/function ModuleConfigFields\(\{ module, onUpdate, onImprove, aiLoading \}\) \{/g, "function ModuleConfigFields({ module, onUpdate, onImprove, aiLoading, storeId }) {");

// Add storeId prop where ModuleConfigFields is called
content = content.replace(/<ModuleConfigFields module=\{activeModule\} onUpdate=\{updateModuleConfig\} onImprove=\{improveWithAI\} aiLoading=\{aiLoading\} \/>/g, "<ModuleConfigFields module={activeModule} onUpdate={updateModuleConfig} onImprove={improveWithAI} aiLoading={aiLoading} storeId={storeId} />");

// Add PortfolioManager to portfolio config
const portfolioBlock = `  if (module.type === 'portfolio') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <ConfigSelect label="Disposition" value={cfg.layout} onChange={v => update('layout', v)} options={['masonry','grid','carousel']} />
      <ConfigToggle label="Afficher les tags" value={cfg.showTags} onChange={v => update('showTags', v)} />
      <ConfigToggle label="Lightbox au clic" value={cfg.enableLightbox} onChange={v => update('enableLightbox', v)} />
      <ConfigToggle label="Mettre en avant une réalisation" value={cfg.showFeatured} onChange={v => update('showFeatured', v)} />
      <PortfolioManager storeId={storeId} />
    </div>
  );`;

content = content.replace(/if \(module\.type === 'portfolio'\) return \(\s*<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '14px' \}\}>\s*<ConfigSelect label="Disposition" value=\{cfg\.layout\} onChange=\{v => update\('layout', v\)\} options=\{\['masonry','grid','carousel'\]\} \/>\s*<ConfigToggle label="Afficher les tags" value=\{cfg\.showTags\} onChange=\{v => update\('showTags', v\)\} \/>\s*<ConfigToggle label="Lightbox au clic" value=\{cfg\.enableLightbox\} onChange=\{v => update\('enableLightbox', v\)\} \/>\s*<ConfigToggle label="Mettre en avant une réalisation" value=\{cfg\.showFeatured\} onChange=\{v => update\('showFeatured', v\)\} \/>\s*<\/div>\s*\);/m, portfolioBlock);

fs.writeFileSync(file, content);
console.log('Update editor for PortfolioManager complete');
