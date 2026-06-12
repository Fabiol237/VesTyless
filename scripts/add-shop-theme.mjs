/**
 * Migration : Ajoute la colonne `shop_theme` à la table `stores`
 * Usage : node scripts/add-shop-theme.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Charger les variables d'environnement manuellement
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local');
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const value = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[key]) process.env[key] = value;
        }
      }
    }
  } catch (e) {
    console.warn('Impossible de lire .env.local:', e.message);
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Variables manquantes: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nAjoutez dans votre .env.local:');
  console.error('SUPABASE_SERVICE_ROLE_KEY=votre_clé_service');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function runMigration() {
  console.log('🚀 Migration : Ajout de la colonne shop_theme...\n');

  // Test 1: Vérifier si la colonne existe déjà
  const { data: testData, error: testError } = await supabase
    .from('stores')
    .select('shop_theme')
    .limit(1);

  if (!testError) {
    console.log('✅ La colonne shop_theme existe déjà ! Migration non nécessaire.');
    console.log('\nValeurs actuelles disponibles dans la boutique ✓');
    return;
  }

  // Colonne n'existe pas — afficher le SQL à exécuter
  console.log('ℹ️  La colonne shop_theme n\'existe pas encore.');
  console.log('\n📋 Exécutez ce SQL dans votre dashboard Supabase (SQL Editor) :\n');
  console.log('─'.repeat(60));
  console.log(`
-- Ajouter le thème de boutique
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS shop_theme TEXT DEFAULT 'theme_01';

-- Optionnel: Commentaire descriptif
COMMENT ON COLUMN public.stores.shop_theme IS 
  'Identifiant du thème visuel de la boutique (theme_01 à theme_20)';

-- Vérifier
SELECT id, name, shop_theme FROM public.stores LIMIT 5;
  `);
  console.log('─'.repeat(60));
  console.log('\n💡 Lien direct: https://supabase.com/dashboard/project/_/sql/new');
  console.log('\n⚠️  Après avoir exécuté le SQL, relancez ce script pour confirmer.');

  // Essayer via RPC si disponible
  console.log('\n🔄 Tentative via API admin...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        sql: "ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS shop_theme TEXT DEFAULT 'theme_01';"
      })
    });

    if (response.ok) {
      console.log('✅ Migration exécutée avec succès via RPC !');
    } else {
      const text = await response.text();
      console.log('ℹ️  RPC non disponible (normal). Exécutez manuellement le SQL ci-dessus.');
    }
  } catch (e) {
    console.log('ℹ️  Exécutez manuellement le SQL dans le dashboard Supabase.');
  }
}

runMigration().catch(console.error);
