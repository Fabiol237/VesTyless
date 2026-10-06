-- ─────────────────────────────────────────────────────────────────────────────
-- Vestin / VeStyle — Étape 5.2 : Connection & Lead Engine
-- Migration : Table public.leads pour les demandes et prospects clients
-- Idempotente : CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.leads (
  id              TEXT PRIMARY KEY,
  store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  customer_email  TEXT,
  request_type    TEXT NOT NULL DEFAULT 'direct_contact',
  item_id         TEXT,
  item_name       TEXT,
  item_type       TEXT,
  message         TEXT DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'new',
  metadata        JSONB DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide par boutique et tri par date
CREATE INDEX IF NOT EXISTS idx_leads_store_created
  ON public.leads (store_id, created_at DESC);

-- Index pour filtrage par statut
CREATE INDEX IF NOT EXISTS idx_leads_status
  ON public.leads (store_id, status);

-- RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Politiques RLS idempotentes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'leads_service_role_all'
  ) THEN
    CREATE POLICY leads_service_role_all ON public.leads
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'leads_public_insert'
  ) THEN
    CREATE POLICY leads_public_insert ON public.leads
      FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;
