const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const password = 'Z0kof@ro123';
const host = 'aws-0-eu-west-1.pooler.supabase.com';
const user = 'postgres.qkqowrwkmipxyktjdvfg';
const connectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:6543/postgres?pgbouncer=true`;

const sql = `
-- Mise à jour de la table notifications pour compatibilité totale avec le code
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS related_order_id UUID;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS related_product_id UUID;

-- S'assurer que les permissions sont OK pour l'insertion depuis le client
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.notifications TO anon;

-- Notification PostgREST
NOTIFY pgrst, 'reload schema';
`;

async function run() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  try {
    console.log('Mise à jour de la structure de la table notifications...');
    await client.connect();
    await client.query(sql);
    console.log('🚀 Table notifications mise à jour avec succès !');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await client.end();
  }
}

run();
