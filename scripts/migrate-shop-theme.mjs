/**
 * Migration : Ajoute la colonne shop_theme à la table stores
 * Run: node scripts/migrate-shop-theme.mjs
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function migrate() {
  console.log('🔄 Vérification de la colonne shop_theme...');

  // Check if column exists by attempting a select
  const { data: testData, error: testError } = await supabase
    .from('stores')
    .select('shop_theme')
    .limit(1);

  if (!testError) {
    console.log('✅ La colonne shop_theme existe déjà !');
    
    // Show current themes distribution
    const { data: stores } = await supabase
      .from('stores')
      .select('name, shop_theme');
    
    if (stores) {
      console.log('\n📊 Boutiques et leurs thèmes :');
      stores.forEach(s => {
        console.log(`  • ${s.name}: ${s.shop_theme || 'theme_01 (défaut)'}`);
      });
    }
    return;
  }

  // Column does not exist
  console.log('⚠️ La colonne n\'existe pas encore.');
  console.log('\n📋 Exécutez cette commande dans Supabase SQL Editor :');
  console.log('─────────────────────────────────────────────────────────');
  console.log("ALTER TABLE stores ADD COLUMN IF NOT EXISTS shop_theme TEXT DEFAULT 'theme_01';");
  console.log('─────────────────────────────────────────────────────────');
  console.log('\nEnsuite relancez ce script pour vérifier.');
}

migrate().catch(console.error);
