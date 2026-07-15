-- ================================================================
-- VESTYLE — Migration vers Jina AI CLIP v2 (1024D)
-- À exécuter dans : Supabase > SQL Editor
-- ================================================================

-- ÉTAPE 1 : Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ÉTAPE 2 : S'assurer que la colonne image_embedding_1024 existe (1024D)
-- Si elle existait déjà avec une autre dimension, la recréer
DO $$
BEGIN
  -- Vérifier si la colonne existe avec la bonne dimension
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'image_embedding_1024'
  ) THEN
    ALTER TABLE products ADD COLUMN image_embedding_1024 vector(1024);
  END IF;
END $$;

-- Colonnes IA supplémentaires
ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_caption TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_tags TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_indexed_at TIMESTAMPTZ;

-- ÉTAPE 3 : Vider les anciens embeddings (dimensions incorrectes)
-- IMPORTANT : ceci efface les embeddings existants pour repartir proprement
UPDATE products SET image_embedding_1024 = NULL WHERE image_embedding_1024 IS NOT NULL;

-- ÉTAPE 4 : Supprimer les anciens index et les recréer
DROP INDEX IF EXISTS products_image_embedding_1024_idx;
DROP INDEX IF EXISTS products_hnsw_image_1024_idx;
DROP INDEX IF EXISTS products_text_embedding_1024_idx;

-- Index HNSW ultra-rapide sur 1024D (10x plus rapide que IVFFlat)
CREATE INDEX products_hnsw_image_1024_idx
  ON products
  USING hnsw (image_embedding_1024 vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ÉTAPE 5 : Recréer la fonction match_products_v2 pour 1024D
DROP FUNCTION IF EXISTS match_products_v2(vector(512), float, integer);
DROP FUNCTION IF EXISTS match_products_v2(vector(768), float, integer);
DROP FUNCTION IF EXISTS match_products_v2(vector(1024), float, integer);

CREATE OR REPLACE FUNCTION match_products_v2(
  query_embedding  vector(1024),
  match_threshold  FLOAT DEFAULT 0.15,
  match_count      INT   DEFAULT 12
)
RETURNS TABLE(
  id          UUID,
  name        TEXT,
  price       DECIMAL,
  image_url   TEXT,
  store_id    UUID,
  description TEXT,
  ai_caption  TEXT,
  ai_tags     TEXT[],
  similarity  FLOAT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.name,
    p.price,
    p.image_url,
    p.store_id,
    p.description,
    p.ai_caption,
    p.ai_tags,
    (1 - (p.image_embedding_1024 <=> query_embedding))::FLOAT AS similarity
  FROM products p
  WHERE
    p.is_active = true
    AND p.image_embedding_1024 IS NOT NULL
    AND (1 - (p.image_embedding_1024 <=> query_embedding)) > match_threshold
  ORDER BY
    p.image_embedding_1024 <=> query_embedding
  LIMIT match_count;
$$;

-- ÉTAPE 6 : Recréer upsert_product_embedding pour 1024D
DROP FUNCTION IF EXISTS upsert_product_embedding(UUID, vector(1024), TEXT, TEXT[]);

CREATE OR REPLACE FUNCTION upsert_product_embedding(
  p_product_id UUID,
  p_embedding  vector(1024),
  p_ai_caption TEXT    DEFAULT '',
  p_ai_tags    TEXT[]  DEFAULT ARRAY[]::TEXT[]
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE result JSON;
BEGIN
  UPDATE products
  SET
    image_embedding_1024 = p_embedding,
    ai_caption           = p_ai_caption,
    ai_tags              = p_ai_tags,
    ai_indexed_at        = NOW()
  WHERE id = p_product_id;

  IF FOUND THEN
    result := json_build_object('success', true, 'product_id', p_product_id, 'vector_dims', 1024, 'model', 'jina-clip-v2');
  ELSE
    result := json_build_object('success', false, 'error', 'Produit introuvable: ' || p_product_id::TEXT);
  END IF;

  RETURN result;
END;
$$;

-- ÉTAPE 7 : Permissions
GRANT EXECUTE ON FUNCTION match_products_v2(vector(1024), FLOAT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION upsert_product_embedding(UUID, vector(1024), TEXT, TEXT[]) TO service_role;

-- ÉTAPE 8 : Vérification
SELECT
  COUNT(*) AS total_produits,
  COUNT(*) FILTER (WHERE image_embedding_1024 IS NOT NULL) AS avec_embedding,
  COUNT(*) FILTER (WHERE image_embedding_1024 IS NULL) AS sans_embedding_a_reindexer
FROM products
WHERE is_active = true;

-- ================================================================
-- RÉSULTAT ATTENDU :
-- total_produits | avec_embedding | sans_embedding_a_reindexer
-- Tous les produits ont sans_embedding = total (normal, on efface pour repartir)
-- Lancer ensuite : node fill-embeddings-jina.mjs
-- ================================================================
