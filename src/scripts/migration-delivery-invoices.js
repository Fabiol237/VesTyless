const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const password = 'Z0kof@ro123';
const host = 'aws-0-eu-west-1.pooler.supabase.com';
const user = 'postgres.qkqowrwkmipxyktjdvfg';
const connectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:6543/postgres?pgbouncer=true`;

const sql = `
-- 1. Ajout de can_print_invoice à orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS can_print_invoice BOOLEAN DEFAULT false;

-- 2. Mise à jour de livreurs pour permettre la connexion
ALTER TABLE public.livreurs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.livreurs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 3. Ajout du rôle dans les profils
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- 4. RLS pour les livreurs
ALTER TABLE public.livreurs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Livreurs are visible by store owners" ON public.livreurs;
CREATE POLICY "Livreurs are visible by store owners"
  ON public.livreurs FOR SELECT
  TO authenticated
  USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Livreurs can see their own profile" ON public.livreurs;
CREATE POLICY "Livreurs can see their own profile"
  ON public.livreurs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 5. RLS pour les commandes assignées aux livreurs
DROP POLICY IF EXISTS "Livreurs can see assigned orders" ON public.orders;
CREATE POLICY "Livreurs can see assigned orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (livreur_id IN (SELECT id FROM public.livreurs WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Livreurs can update assigned orders status" ON public.orders;
CREATE POLICY "Livreurs can update assigned orders status"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (livreur_id IN (SELECT id FROM public.livreurs WHERE user_id = auth.uid()))
  WITH CHECK (livreur_id IN (SELECT id FROM public.livreurs WHERE user_id = auth.uid()));

-- Notification PostgREST
NOTIFY pgrst, 'reload schema';
`;

async function run() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  try {
    console.log('Exécution de la migration pour le système de facturation et de livraison...');
    await client.connect();
    await client.query(sql);
    console.log('🚀 Migration réussie !');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await client.end();
  }
}

run();
