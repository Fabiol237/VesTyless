-- ═══════════════════════════════════════════════════════════════
-- VeStyle — Migration 003 (CORRIGÉE) : Versions, Promotions, Chat
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Historique des versions de boutique ───────────────────
CREATE TABLE IF NOT EXISTS store_versions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id      UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  label         TEXT NOT NULL DEFAULT 'Version sans nom',
  description   TEXT DEFAULT '',
  modules_count INT  DEFAULT 0,
  modules_data  JSONB NOT NULL DEFAULT '[]',
  theme_data    JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_store_versions_store_id   ON store_versions(store_id);
CREATE INDEX IF NOT EXISTS idx_store_versions_created_at ON store_versions(created_at DESC);

ALTER TABLE store_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can view versions"   ON store_versions;
DROP POLICY IF EXISTS "Owner can insert versions" ON store_versions;
DROP POLICY IF EXISTS "Owner can delete versions" ON store_versions;

CREATE POLICY "Owner can view versions"
  ON store_versions FOR SELECT
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Owner can insert versions"
  ON store_versions FOR INSERT
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Owner can delete versions"
  ON store_versions FOR DELETE
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- ─── 2. Promotions planifiées ─────────────────────────────────
CREATE TABLE IF NOT EXISTS promotions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT DEFAULT '',
  discount_type   TEXT NOT NULL DEFAULT 'percentage'
                  CHECK (discount_type IN ('percentage','fixed','free_shipping')),
  discount_value  NUMERIC(10,2) DEFAULT 0,
  start_date      TIMESTAMPTZ NOT NULL,
  end_date        TIMESTAMPTZ NOT NULL,
  applicable_to   TEXT DEFAULT 'all',
  products        JSONB DEFAULT '[]',
  show_countdown  BOOLEAN DEFAULT TRUE,
  countdown_text  TEXT DEFAULT 'Offre expire dans :',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_store_id   ON promotions(store_id);
CREATE INDEX IF NOT EXISTS idx_promotions_start_date ON promotions(start_date);
CREATE INDEX IF NOT EXISTS idx_promotions_end_date   ON promotions(end_date);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage promotions"     ON promotions;
DROP POLICY IF EXISTS "Public can view active promotions" ON promotions;

CREATE POLICY "Owner can manage promotions"
  ON promotions FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Public can view active promotions"
  ON promotions FOR SELECT
  USING (is_active = TRUE AND start_date <= NOW() AND end_date >= NOW());

-- ─── 3. Logs du chatbot client ────────────────────────────────
CREATE TABLE IF NOT EXISTS store_chat_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id   UUID REFERENCES stores(id) ON DELETE CASCADE,
  visitor_id TEXT,
  messages   JSONB DEFAULT '[]',
  lang       TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_store_id ON store_chat_logs(store_id);

-- ─── 4. Extension stores ──────────────────────────────────────
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS chat_enabled   BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS chat_greeting  TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_link  TEXT;

-- ─── Confirmation ─────────────────────────────────────────────
SELECT 'Migration 003 appliquée avec succès ✅' AS status;
