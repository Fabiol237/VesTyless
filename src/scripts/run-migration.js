const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const password = 'Z0kof@ro123';
const host = 'aws-0-eu-west-1.pooler.supabase.com';
const user = 'postgres.qkqowrwkmipxyktjdvfg';
const connectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:6543/postgres?pgbouncer=true`;

const sql = `
-- 1. Ajout des colonnes manquantes à la table 'stores'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='is_active') THEN
    ALTER TABLE stores ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='is_boosted') THEN
    ALTER TABLE stores ADD COLUMN is_boosted BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='daily_views') THEN
    ALTER TABLE stores ADD COLUMN daily_views INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='total_views') THEN
    ALTER TABLE stores ADD COLUMN total_views INTEGER DEFAULT 0;
  END IF;
END $$;

-- 2. Activation de toutes les boutiques existantes par défaut
UPDATE stores SET is_active = true WHERE is_active IS NULL;

-- 3. Vérification que toutes les boutiques ont un code à 5 chiffres
DO $$
DECLARE
  store_record RECORD;
  new_code VARCHAR(5);
BEGIN
  FOR store_record IN SELECT id FROM stores WHERE store_code IS NULL LOOP
    LOOP
      new_code := LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM stores WHERE store_code = new_code);
    END LOOP;
    UPDATE stores SET store_code = new_code WHERE id = store_record.id;
  END LOOP;
END $$;

-- 4. Nettoyage et optimisation
ANALYZE stores;
`;

async function run() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  try {
    console.log('Connexion à la base de données Supabase (IPv4 Pooler)...');
    await client.connect();
    console.log('✅ Connecté ! Exécution de la migration...');
    await client.query(sql);
    console.log('🚀 Migration terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur détaillée:', err.message);
    if (err.detail) console.error('Détail:', err.detail);
    if (err.hint) console.error('Aide:', err.hint);
  } finally {
    await client.end();
  }
}

run();
