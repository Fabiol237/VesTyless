#!/usr/bin/env node

/**
 * Script de Vérification Rapide - Recherche Visuelle
 * 
 * Teste que tout est bien configuré avant de lancer
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\n🔍 VÉRIFICATION RAPIDE - Recherche Visuelle\n');
console.log('═'.repeat(50));

// 1. Vérifier .env.local
console.log('\n1️⃣  Fichiers d\'Configuration');
const envPath = path.join(__dirname, '.env.local');
const hasEnv = fs.existsSync(envPath);
console.log(`   ${hasEnv ? '✅' : '❌'} .env.local existe`);

if (hasEnv) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasCohereKey = envContent.includes('COHERE_API_KEY');
  const hasMistralKey = envContent.includes('MISTRAL_API_KEY');
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  console.log(`   ${hasCohereKey ? '✅' : '❌'} COHERE_API_KEY présente`);
  console.log(`   ${hasMistralKey ? '✅' : '❌'} MISTRAL_API_KEY présente`);
  console.log(`   ${hasSupabaseUrl ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_URL présente`);
  console.log(`   ${hasSupabaseKey ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_ANON_KEY présente`);
}

// 2. Vérifier les fichiers d'API
console.log('\n2️⃣  Fichiers d\'API');

const embeddingsApiPath = path.join(__dirname, 'src/app/api/products/generate-embeddings-v2/route.js');
const visualSearchPath = path.join(__dirname, 'src/app/api/search/visual/route.js');
const addProductPath = path.join(__dirname, 'src/app/dashboard/add-product/page.js');
const fillEmbeddingsPath = path.join(__dirname, 'fill-embeddings.mjs');

console.log(`   ${fs.existsSync(embeddingsApiPath) ? '✅' : '❌'} generate-embeddings-v2/route.js`);
console.log(`   ${fs.existsSync(visualSearchPath) ? '✅' : '❌'} search/visual/route.js`);
console.log(`   ${fs.existsSync(addProductPath) ? '✅' : '❌'} dashboard/add-product/page.js`);
console.log(`   ${fs.existsSync(fillEmbeddingsPath) ? '✅' : '❌'} fill-embeddings.mjs`);

// 3. Vérifier package.json
console.log('\n3️⃣  Package.json');
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const hasFillEmbeddingsScript = packageJson.scripts?.['fill-embeddings'] !== undefined;
console.log(`   ${hasFillEmbeddingsScript ? '✅' : '❌'} Script "fill-embeddings" présent`);

// 4. Vérifier les dépendances
console.log('\n4️⃣  Dépendances NPM');
const hasCohere = packageJson.dependencies?.['cohere-ai'] !== undefined;
const hasMistral = packageJson.dependencies?.['@mistralai/mistralai'] !== undefined;
const hasSupabase = packageJson.dependencies?.['@supabase/supabase-js'] !== undefined;

console.log(`   ${hasCohere ? '✅' : '❌'} cohere-ai installé`);
console.log(`   ${hasMistral ? '✅' : '❌'} @mistralai/mistralai installé`);
console.log(`   ${hasSupabase ? '✅' : '❌'} @supabase/supabase-js installé`);

// 5. Vérifier la documentation
console.log('\n5️⃣  Documentation');
const hasVisualSearchGuide = fs.existsSync(path.join(__dirname, 'VISUAL_SEARCH_GUIDE.md'));
const hasRecapSummary = fs.existsSync(path.join(__dirname, 'RECONSTRUCTION_SUMMARY.md'));
const hasChecklist = fs.existsSync(path.join(__dirname, 'DEPLOYMENT_CHECKLIST.md'));
const hasReadme = fs.existsSync(path.join(__dirname, 'README_VISUAL_SEARCH.md'));

console.log(`   ${hasVisualSearchGuide ? '✅' : '❌'} VISUAL_SEARCH_GUIDE.md`);
console.log(`   ${hasRecapSummary ? '✅' : '❌'} RECONSTRUCTION_SUMMARY.md`);
console.log(`   ${hasChecklist ? '✅' : '❌'} DEPLOYMENT_CHECKLIST.md`);
console.log(`   ${hasReadme ? '✅' : '❌'} README_VISUAL_SEARCH.md`);

// Résumé
console.log('\n' + '═'.repeat(50));
console.log('\n📊 RÉSUMÉ');

const checks = [
  hasEnv,
  hasCohere,
  hasMistral,
  hasSupabase,
  fs.existsSync(embeddingsApiPath),
  fs.existsSync(visualSearchPath),
  fs.existsSync(addProductPath),
  fs.existsSync(fillEmbeddingsPath),
  hasFillEmbeddingsScript,
  hasVisualSearchGuide,
  hasRecapSummary,
  hasChecklist,
  hasReadme
];

const passedChecks = checks.filter(Boolean).length;
const totalChecks = checks.length;
const percentage = Math.round((passedChecks / totalChecks) * 100);

console.log(`\n✅ ${passedChecks}/${totalChecks} vérifications passées (${percentage}%)`);

if (percentage === 100) {
  console.log('\n🎉 PARFAIT! Tout est configuré correctement!');
  console.log('\n➡️  Prochaines étapes:');
  console.log('   1. npm run dev   (démarrer le serveur)');
  console.log('   2. http://localhost:3000/dashboard/add-product');
  console.log('   3. Tester l\'ajout de produit');
  console.log('   4. http://localhost:3000/search');
  console.log('   5. Tester la recherche visuelle');
} else if (percentage >= 80) {
  console.log('\n⚠️  Presque prêt! Quelques éléments manquent.');
  console.log('   Voir les détails ci-dessus.');
} else {
  console.log('\n❌ Configuration incomplète.');
  console.log('   Voir RECONSTRUCTION_SUMMARY.md pour plus d\'infos.');
}

console.log('\n' + '═'.repeat(50) + '\n');
