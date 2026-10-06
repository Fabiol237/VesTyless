import fs from 'fs';
import path from 'path';

const root = process.cwd();

const itemsToRemove = [
  'src/lib/blockEngine',
  'src/lib/blockPatcher.js',
  'src/lib/builder',
  'src/lib/developer-mode',
  'src/lib/composition-engine',
  'src/lib/component-libraries',
  'src/lib/component-registry',
  'src/lib/design-intelligence',
  'src/lib/template-packages',
  'src/lib/template-library',
  'src/lib/headers',
  'src/lib/storeBlocks.js',
  'src/blocks',
  'src/components/blocks',
  'src/components/builder',
  'src/components/developer-mode',
  'src/components/dynamic-dashboard',
  'src/components/editor-shell',
  'src/components/page-manager',
  'src/components/store-composer',
  'src/components/template-library',
  'src/components/template-packages',
  'src/components/visual-engine',
  'src/app/builder',
  'src/app/headers-gallery',
  'src/app/dashboard-preview',
];

for (const rel of itemsToRemove) {
  const full = path.join(root, rel);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true, force: true });
    console.log(`[DELETED] ${rel}`);
  } else {
    console.log(`[NOT FOUND / ALREADY REMOVED] ${rel}`);
  }
}
