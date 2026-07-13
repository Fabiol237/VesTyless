-- ═══════════════════════════════════════════════════════════════
-- VeStyle — Migration 001 (VERSION CORRIGÉE)
-- Exécutez ce script dans Supabase > SQL Editor > New Query
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Extension de store_modules ───────────────────────────────────────────
ALTER TABLE store_modules
  ADD COLUMN IF NOT EXISTS block_version    INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS visibility_rules JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT NOW();

-- ─── 2. Extension de stores ──────────────────────────────────────────────────
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS accent_color   TEXT,
  ADD COLUMN IF NOT EXISTS theme_mode     TEXT DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS secondary_color TEXT,
  ADD COLUMN IF NOT EXISTS font_family    TEXT,
  ADD COLUMN IF NOT EXISTS layout_config  JSONB DEFAULT '{}';

-- ─── 3. Extension de la table products (si elle existe) ──────────────────────
-- Ajoute les colonnes manquantes sans toucher aux colonnes existantes
DO $$
BEGIN
  -- offer_type (produit ou service)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='products' AND column_name='offer_type'
  ) THEN
    ALTER TABLE products ADD COLUMN offer_type TEXT DEFAULT 'product';
  END IF;

  -- currency
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='products' AND column_name='currency'
  ) THEN
    ALTER TABLE products ADD COLUMN currency TEXT DEFAULT 'XOF';
  END IF;

  -- is_featured
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='products' AND column_name='is_featured'
  ) THEN
    ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
  END IF;

  -- is_new
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='products' AND column_name='is_new'
  ) THEN
    ALTER TABLE products ADD COLUMN is_new BOOLEAN DEFAULT FALSE;
  END IF;

  -- rating
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='products' AND column_name='rating'
  ) THEN
    ALTER TABLE products ADD COLUMN rating NUMERIC(3,2) DEFAULT 0;
  END IF;

  -- reviews_count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='products' AND column_name='reviews_count'
  ) THEN
    ALTER TABLE products ADD COLUMN reviews_count INT DEFAULT 0;
  END IF;

  -- metadata
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='products' AND column_name='metadata'
  ) THEN
    ALTER TABLE products ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;

  -- updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='products' AND column_name='updated_at'
  ) THEN
    ALTER TABLE products ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

EXCEPTION WHEN undefined_table THEN
  -- La table products n'existe pas encore, la créer complètement
  CREATE TABLE products (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id      UUID REFERENCES stores(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    description   TEXT,
    price         NUMERIC(12,2) DEFAULT 0,
    currency      TEXT DEFAULT 'XOF',
    image_url     TEXT,
    images        JSONB DEFAULT '[]',
    category      TEXT,
    tags          TEXT[],
    offer_type    TEXT DEFAULT 'product' CHECK (offer_type IN ('product','service')),
    stock_quantity INT DEFAULT 0,
    is_active     BOOLEAN DEFAULT TRUE,
    is_featured   BOOLEAN DEFAULT FALSE,
    is_new        BOOLEAN DEFAULT FALSE,
    rating        NUMERIC(3,2) DEFAULT 0,
    reviews_count INT DEFAULT 0,
    views         INT DEFAULT 0,
    metadata      JSONB DEFAULT '{}',
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
  );
END;
$$;

-- ─── 4. Table des actions IA (historique Mistral) ─────────────────────────────
CREATE TABLE IF NOT EXISTS store_ai_actions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id      UUID REFERENCES stores(id) ON DELETE CASCADE,
  action_type   TEXT NOT NULL,
  payload       JSONB NOT NULL DEFAULT '{}',
  before_state  JSONB DEFAULT '{}',
  user_message  TEXT,
  ai_response   TEXT,
  applied_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. Table des logs de stock ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id   UUID NOT NULL REFERENCES stores(id)   ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('add', 'remove', 'set')),
  quantity   INT  NOT NULL CHECK (quantity >= 0),
  before_qty INT  NOT NULL,
  after_qty  INT  NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. Index pour performances ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_store_modules_store_id   ON store_modules(store_id);
CREATE INDEX IF NOT EXISTS idx_store_modules_position   ON store_modules(store_id, position);
CREATE INDEX IF NOT EXISTS idx_ai_actions_store_id      ON store_ai_actions(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_product_id    ON stock_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_store_id      ON stock_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_created_at    ON stock_logs(created_at DESC);

-- ─── 7. RLS sur stock_logs ────────────────────────────────────────────────────
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can view stock logs"   ON stock_logs;
DROP POLICY IF EXISTS "Owner can insert stock logs" ON stock_logs;

CREATE POLICY "Owner can view stock logs"
  ON stock_logs FOR SELECT
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner can insert stock logs"
  ON stock_logs FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

-- ─── 8. RLS sur store_ai_actions ─────────────────────────────────────────────
ALTER TABLE store_ai_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can view ai actions"   ON store_ai_actions;
DROP POLICY IF EXISTS "Owner can insert ai actions" ON store_ai_actions;

CREATE POLICY "Owner can view ai actions"
  ON store_ai_actions FOR SELECT
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner can insert ai actions"
  ON store_ai_actions FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

-- ─── Confirmation ─────────────────────────────────────────────────────────────
SELECT 'Migration VeStyle 001 + 002 appliquée avec succès ✅' AS status;
