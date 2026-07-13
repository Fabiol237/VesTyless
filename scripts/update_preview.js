const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/builder/[storeId]/BuilderPreview.js');
let content = fs.readFileSync(file, 'utf8');

// Replace styles in BuilderPreview
content = content.replace(/background: '#0d0d1a'/g, "background: '#efeae2'");
content = content.replace(/boxShadow: isMobile \? '0 0 0 10px #1a1a2e, 0 0 0 12px rgba\(255,255,255,0\.05\), 0 32px 64px rgba\(0,0,0,0\.6\)'/g, "boxShadow: isMobile ? '0 0 0 10px #e9edef, 0 0 0 12px rgba(0,0,0,0.05), 0 32px 64px rgba(0,0,0,0.2)'");
content = content.replace(/background: '#0f0f1a'/g, "background: '#111b21'");

fs.writeFileSync(file, content);
console.log('Update Preview complete');
