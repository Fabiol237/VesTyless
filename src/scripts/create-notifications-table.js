const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const password = 'Z0kof@ro123';
const host = 'aws-0-eu-west-1.pooler.supabase.com';
const user = 'postgres.qkqowrwkmipxyktjdvfg';
const connectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:6543/postgres?pgbouncer=true`;

const sql = `
-- Création de la table notifications si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activation de RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Suppression des anciennes politiques pour éviter les erreurs
DROP POLICY IF EXISTS "Stores can manage their own notifications" ON public.notifications;

-- Création de la politique RLS
CREATE POLICY "Stores can manage their own notifications"
  ON public.notifications
  FOR ALL
  TO authenticated
  USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

-- Permissions
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.notifications TO anon;

-- Forcer le rafraîchissement du cache PostgREST (si possible)
NOTIFY pgrst, 'reload schema';
`;

async function run() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  try {
    console.log('Connexion à la base de données pour créer la table notifications...');
    await client.connect();
    console.log('✅ Connecté ! Exécution du SQL...');
    await client.query(sql);
    console.log('🚀 Table notifications prête !');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await client.end();
  }
}

run();
