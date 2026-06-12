const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.qkqowrwkmipxyktjdvfg:Z0kof%40ro123@db.qkqowrwkmipxyktjdvfg.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB!');
    await client.query(`ALTER TABLE stores ADD COLUMN IF NOT EXISTS shop_theme text DEFAULT 'theme_00';`);
    console.log('Added shop_theme column.');
    await client.query(`ALTER TABLE stores ADD COLUMN IF NOT EXISTS shop_tabs jsonb DEFAULT '{"accueil": "Accueil", "produits": "Catalogue", "promotions": "Promotions", "profil": "Profil"}'::jsonb;`);
    console.log('Added shop_tabs column.');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}
run();
