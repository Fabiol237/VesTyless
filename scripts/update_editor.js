const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/builder/[storeId]/BuilderEditor.js');
let content = fs.readFileSync(file, 'utf8');

// Replace styles
content = content.replace(/background: '#13131f'/g, "background: '#ffffff'");
content = content.replace(/borderBottom: '1px solid rgba\(255,255,255,0\.07\)'/g, "borderBottom: '1px solid #d1d7db', background: '#f0f2f5'");
content = content.replace(/color: activeTab === id \? '#a5b4fc' : 'rgba\(255,255,255,0\.4\)'/g, "color: activeTab === id ? '#008069' : '#54656f'");
content = content.replace(/borderBottom: `2px solid \$\{activeTab === id \? '#6366f1' : 'transparent'\}`/g, "borderBottom: `2px solid ${activeTab === id ? '#008069' : 'transparent'}`");

content = content.replace(/color: 'rgba\(255,255,255,0\.35\)'/g, "color: '#54656f'");
content = content.replace(/color: 'rgba\(255,255,255,0\.3\)'/g, "color: '#54656f'");
content = content.replace(/background: state\.activeModuleId === mod\.id \? 'rgba\(99,102,241,0\.15\)' : 'rgba\(255,255,255,0\.04\)'/g, "background: state.activeModuleId === mod.id ? '#f0f2f5' : '#ffffff'");
content = content.replace(/border: `1\.5px solid \$\{state\.activeModuleId === mod\.id \? 'rgba\(99,102,241,0\.4\)' : 'rgba\(255,255,255,0\.06\)'\}`/g, "border: 'none', borderBottom: '1px solid #f0f2f5'");

content = content.replace(/color: 'rgba\(255,255,255,0\.25\)'/g, "color: '#8696a0'");
content = content.replace(/background: `\$\{def\?\.color \|\| '#6366f1'\}22`/g, "background: '#e9edef', color: '#008069'");
content = content.replace(/color: '#fff'/g, "color: '#111b21'");
content = content.replace(/border: '1px solid rgba\(255,255,255,0\.1\)'/g, "border: '1px solid #d1d7db'");
content = content.replace(/color: 'rgba\(255,255,255,0\.5\)'/g, "color: '#54656f'");

content = content.replace(/border: '1\.5px dashed rgba\(99,102,241,0\.3\)'/g, "border: '1px dashed #008069'");
content = content.replace(/background: 'rgba\(99,102,241,0\.06\)'/g, "background: '#f0f2f5'");
content = content.replace(/color: '#a5b4fc'/g, "color: '#008069'");

content = content.replace(/color: 'rgba\(255,255,255,0\.55\)'/g, "color: '#54656f'");
content = content.replace(/background: 'rgba\(255,255,255,0\.06\)'/g, "background: '#ffffff'");
content = content.replace(/border: '1\.5px solid rgba\(255,255,255,0\.1\)'/g, "border: '1.5px solid #d1d7db'");

// library specific
content = content.replace(/border: `1\.5px solid \$\{alreadyAdded \? 'rgba\(255,255,255,0\.05\)' : 'rgba\(255,255,255,0\.08\)'\}`/g, "border: `1.5px solid ${alreadyAdded ? '#f0f2f5' : '#d1d7db'}`");
content = content.replace(/background: alreadyAdded \? 'rgba\(255,255,255,0\.02\)' : 'rgba\(255,255,255,0\.04\)'/g, "background: alreadyAdded ? '#f0f2f5' : '#ffffff'");
content = content.replace(/color: 'rgba\(255,255,255,0\.4\)'/g, "color: '#54656f'");

// themes
content = content.replace(/border: `2px solid \$\{isSelected \? preset\.primary : 'rgba\(255,255,255,0\.08\)'\}`/g, "border: `2px solid ${isSelected ? preset.primary : '#d1d7db'}`");
content = content.replace(/background: isSelected \? `\$\{preset\.primary\}15` : 'rgba\(255,255,255,0\.04\)'/g, "background: isSelected ? `${preset.primary}15` : '#ffffff'");
content = content.replace(/color: 'rgba\(255,255,255,0\.6\)'/g, "color: '#111b21'");
content = content.replace(/border: '2px solid rgba\(255,255,255,0\.1\)'/g, "border: '2px solid #d1d7db'");

content = content.replace(/background: 'rgba\(99,102,241,0\.1\)'/g, "background: '#dcf8c6'");
content = content.replace(/border: '1px solid rgba\(99,102,241,0\.2\)'/g, "border: '1px solid #25d366'");

// Toggles
content = content.replace(/background: value \? 'linear-gradient\(135deg, #6366f1, #a855f7\)' : 'rgba\(255,255,255,0\.12\)'/g, "background: value ? '#00a884' : '#d1d7db'");


fs.writeFileSync(file, content);
console.log('Update complete');
