-- Migration VeStyle: Table des mouvements de stock
-- À exécuter dans Supabase SQL Editor > New Query

-- ─── Table stock_logs ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id   UUID NOT NULL REFERENCES stores(id)   ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('add', 'remove', 'set')),
  quantity   INT  NOT NULL CHECK (quantity >= 0),
  before_qty INT  NOT NULL,
  after_qty  INT  NOT NULL,
  note       TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_stock_logs_product_id  ON stock_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_store_id    ON stock_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_created_at  ON stock_logs(created_at DESC);

-- RLS : seul le propriétaire peut voir ses logs
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view stock logs"
  ON stock_logs FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner can insert stock logs"
  ON stock_logs FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- Vue agrégée pour les stats de stock
CREATE OR REPLACE VIEW stock_summary AS
SELECT
  p.id            AS product_id,
  p.name,
  p.store_id,
  p.stock_quantity AS current_stock,
  COUNT(sl.id)     AS total_movements,
  SUM(CASE WHEN sl.type = 'add'    THEN sl.quantity ELSE 0 END) AS total_in,
  SUM(CASE WHEN sl.type = 'remove' THEN sl.quantity ELSE 0 END) AS total_out,
  MAX(sl.created_at) AS last_movement
FROM products p
LEFT JOIN stock_logs sl ON sl.product_id = p.id
GROUP BY p.id, p.name, p.store_id, p.stock_quantity;
