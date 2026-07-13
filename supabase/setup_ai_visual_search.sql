-- ================================================================
-- VESTYLE — ARCHITECTURE IA RECHERCHE VISUELLE
-- Florence-2 + DINOv2 + SigLIP → pgvector 1024 dimensions
-- ================================================================
-- 📌 À exécuter dans : Supabase > SQL Editor
-- 🔗 Compatible avec : huggingface_space/app.py
-- ================================================================

-- ════════════════════════════════════════════════════════════════
-- ÉTAPE 0 : Activer l'extension pgvector (si pas encore fait)
-- ════════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- Pour la recherche textuelle

-- ════════════════════════════════════════════════════════════════
-- ÉTAPE 1 : Colonnes vecteurs sur la table products
-- Florence-2 → texte extrait (stocké en texte)
-- DINOv2 + SigLIP fusionnés → 1024 dimensions
-- ════════════════════════════════════════════════════════════════

-- Vecteur image fusionné (DINOv2 60% + SigLIP 40%) = 1024 dim
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_embedding_1024 vector(1024);

-- Texte extrait par Florence-2 (caption + OCR)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS ai_caption TEXT;

-- Tags détectés automatiquement par Florence-2
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS ai_tags TEXT[];

-- Date de la dernière indexation IA
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS ai_indexed_at TIMESTAMPTZ;

-- ════════════════════════════════════════════════════════════════
-- ÉTAPE 2 : Index HNSW ultra-rapide pour pgvector
-- HNSW = Hierarchical Navigable Small World
-- → 10x plus rapide que IVFFlat pour la recherche en temps réel
-- → Idéal pour votre cas : réponse en < 50ms
-- ════════════════════════════════════════════════════════════════

-- Supprimer les anciens index s'ils existent
DROP INDEX IF EXISTS products_image_embedding_1024_idx;
DROP INDEX IF EXISTS products_hnsw_image_1024_idx;

-- Créer l'index HNSW sur les vecteurs 1024D
CREATE INDEX IF NOT EXISTS products_hnsw_image_1024_idx
  ON products
  USING hnsw (image_embedding_1024 vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
-- m = 16 → connexions par nœud (16 = bon compromis vitesse/précision)
-- ef_construction = 64 → précision lors de la construction

-- ════════════════════════════════════════════════════════════════
-- ÉTAPE 3 : Index texte pour le fallback Florence-2
-- ════════════════════════════════════════════════════════════════

-- Index GIN pour recherche dans les tags (tableau)
CREATE INDEX IF NOT EXISTS products_ai_tags_idx
  ON products USING gin (ai_tags);

-- Index trigram pour recherche floue dans la caption IA
CREATE INDEX IF NOT EXISTS products_ai_caption_trgm_idx
  ON products USING gin (ai_caption gin_trgm_ops);

-- ════════════════════════════════════════════════════════════════
-- ÉTAPE 4 : RPC principale — Recherche par image (vecteur 1024D)
-- Appelée par : huggingface_space/app.py → search_in_supabase()
-- ════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS match_products_v2(vector(1024), FLOAT, INT) CASCADE;

CREATE OR REPLACE FUNCTION match_products_v2(
  query_embedding  vector(1024),   -- Vecteur DINOv2+SigLIP fusionné
  match_threshold  FLOAT,          -- Seuil minimum de similarité (ex: 0.3)
  match_count      INT             -- Nombre max de résultats (ex: 12)
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
    -- Score de similarité cosine (1 = identique, 0 = différent)
    (1 - (p.image_embedding_1024 <=> query_embedding))::FLOAT AS similarity
  FROM products p
  WHERE
    p.is_active = true
    AND p.stock_quantity > 0
    AND p.image_embedding_1024 IS NOT NULL
    -- Filtre rapide : seulement les produits > seuil
    AND (1 - (p.image_embedding_1024 <=> query_embedding)) > match_threshold
  ORDER BY
    p.image_embedding_1024 <=> query_embedding  -- Tri cosine distance (ASC = plus proche)
  LIMIT match_count;
$$;

-- ════════════════════════════════════════════════════════════════
-- ÉTAPE 5 : RPC hybride — Image + Texte Florence-2
-- Combine la similarité vectorielle ET la recherche textuelle
-- ════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS search_vestyle_hybrid(vector(1024), TEXT, FLOAT, INT) CASCADE;

CREATE OR REPLACE FUNCTION search_vestyle_hybrid(
  query_embedding  vector(1024),   -- Vecteur de l'image uploadée
  query_text       TEXT,           -- Texte extrait par Florence-2 (caption + tags)
  match_threshold  FLOAT DEFAULT 0.25,
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
  score       FLOAT,              -- Score final hybride
  match_type  TEXT                -- 'vector' | 'text' | 'hybrid'
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH

  -- ── Recherche vectorielle pure (DINOv2+SigLIP) ──
  vector_matches AS (
    SELECT
      p.id,
      p.name,
      p.price,
      p.image_url,
      p.store_id,
      p.description,
      p.ai_caption,
      p.ai_tags,
      (1 - (p.image_embedding_1024 <=> query_embedding))::FLOAT AS vector_score
    FROM products p
    WHERE
      p.is_active = true
      AND p.stock_quantity > 0
      AND p.image_embedding_1024 IS NOT NULL
      AND (1 - (p.image_embedding_1024 <=> query_embedding)) > match_threshold
    ORDER BY p.image_embedding_1024 <=> query_embedding
    LIMIT match_count * 2  -- Récupère plus pour le re-ranking
  ),

  -- ── Recherche textuelle (Florence-2 caption + tags) ──
  text_matches AS (
    SELECT
      p.id,
      p.name,
      p.price,
      p.image_url,
      p.store_id,
      p.description,
      p.ai_caption,
      p.ai_tags,
      -- Score texte basé sur la similarité trigram
      GREATEST(
        similarity(p.name, query_text),
        similarity(COALESCE(p.ai_caption, ''), query_text),
        similarity(COALESCE(p.description, ''), query_text)
      )::FLOAT AS text_score
    FROM products p
    WHERE
      p.is_active = true
      AND p.stock_quantity > 0
      AND (
        p.name ILIKE '%' || query_text || '%'
        OR p.ai_caption ILIKE '%' || query_text || '%'
        OR p.description ILIKE '%' || query_text || '%'
        OR p.ai_tags && string_to_array(query_text, ' ')
      )
    LIMIT match_count * 2
  ),

  -- ── Fusion : Re-ranking hybride ──
  combined AS (
    SELECT
      COALESCE(v.id, t.id)                  AS id,
      COALESCE(v.name, t.name)              AS name,
      COALESCE(v.price, t.price)            AS price,
      COALESCE(v.image_url, t.image_url)    AS image_url,
      COALESCE(v.store_id, t.store_id)      AS store_id,
      COALESCE(v.description, t.description) AS description,
      COALESCE(v.ai_caption, t.ai_caption)  AS ai_caption,
      COALESCE(v.ai_tags, t.ai_tags)        AS ai_tags,
      COALESCE(v.vector_score, 0)           AS vs,
      COALESCE(t.text_score, 0)             AS ts,
      -- Score hybride : 70% visuel + 30% texte
      (COALESCE(v.vector_score, 0) * 0.70 + COALESCE(t.text_score, 0) * 0.30) AS final_score,
      CASE
        WHEN v.id IS NOT NULL AND t.id IS NOT NULL THEN 'hybrid'
        WHEN v.id IS NOT NULL THEN 'vector'
        ELSE 'text'
      END AS match_type
    FROM vector_matches v
    FULL OUTER JOIN text_matches t ON v.id = t.id
  )

  SELECT
    c.id,
    c.name,
    c.price,
    c.image_url,
    c.store_id,
    c.description,
    c.ai_caption,
    c.ai_tags,
    c.final_score AS score,
    c.match_type
  FROM combined c
  WHERE c.final_score > 0.1
  ORDER BY c.final_score DESC
  LIMIT match_count;
END;
$$;

-- ════════════════════════════════════════════════════════════════
-- ÉTAPE 6 : RPC d'indexation — Appelée lors de l'ajout produit
-- Le script Python HF envoie le vecteur ici après génération
-- ════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION upsert_product_embedding(
  p_product_id   UUID,
  p_embedding    vector(1024),    -- Vecteur DINOv2+SigLIP fusionné
  p_ai_caption   TEXT DEFAULT '',
  p_ai_tags      TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- Exécuté avec les droits admin (service_role)
AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE products
  SET
    image_embedding_1024 = p_embedding,
    ai_caption           = p_ai_caption,
    ai_tags              = p_ai_tags,
    ai_indexed_at        = NOW()
  WHERE id = p_product_id;

  IF FOUND THEN
    result := json_build_object(
      'success', true,
      'product_id', p_product_id,
      'indexed_at', NOW(),
      'vector_dims', 1024
    );
  ELSE
    result := json_build_object(
      'success', false,
      'error', 'Produit introuvable : ' || p_product_id::TEXT
    );
  END IF;

  RETURN result;
END;
$$;

-- ════════════════════════════════════════════════════════════════
-- ÉTAPE 7 : Statistiques — Suivi de l'indexation IA
-- ════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_ai_indexing_stats()
RETURNS JSON
LANGUAGE sql
STABLE
AS $$
  SELECT json_build_object(
    'total_products',         COUNT(*),
    'indexed_products',       COUNT(*) FILTER (WHERE image_embedding_1024 IS NOT NULL),
    'not_indexed',            COUNT(*) FILTER (WHERE image_embedding_1024 IS NULL),
    'indexation_rate_pct',    ROUND(
                                100.0 * COUNT(*) FILTER (WHERE image_embedding_1024 IS NOT NULL)
                                / NULLIF(COUNT(*), 0), 1
                              ),
    'last_indexed_at',        MAX(ai_indexed_at)
  )
  FROM products
  WHERE is_active = true;
$$;

-- ════════════════════════════════════════════════════════════════
-- ÉTAPE 8 : Permissions Row Level Security (RLS)
-- ════════════════════════════════════════════════════════════════

-- Recherche visuelle : accessible à tous (anonyme + connecté)
GRANT EXECUTE ON FUNCTION match_products_v2(vector(1024), FLOAT, INT)
  TO anon, authenticated;

-- Recherche hybride : accessible à tous
GRANT EXECUTE ON FUNCTION search_vestyle_hybrid(vector(1024), TEXT, FLOAT, INT)
  TO anon, authenticated;

-- Indexation : seulement service_role (Hugging Face backend)
GRANT EXECUTE ON FUNCTION upsert_product_embedding(UUID, vector(1024), TEXT, TEXT[])
  TO service_role;

-- Stats : seulement les utilisateurs connectés
GRANT EXECUTE ON FUNCTION get_ai_indexing_stats()
  TO authenticated, service_role;

-- ════════════════════════════════════════════════════════════════
-- ÉTAPE 9 : Vue pratique — Produits non encore indexés
-- Utile pour savoir quels produits manquent encore de vecteurs IA
-- ════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW products_not_indexed AS
  SELECT
    id,
    name,
    image_url,
    created_at,
    store_id
  FROM products
  WHERE
    is_active = true
    AND image_embedding_1024 IS NULL
    AND image_url IS NOT NULL
  ORDER BY created_at DESC;

GRANT SELECT ON products_not_indexed TO authenticated, service_role;

-- ════════════════════════════════════════════════════════════════
-- ✅ VÉRIFICATION FINALE
-- ════════════════════════════════════════════════════════════════

-- Tester que tout fonctionne :
SELECT get_ai_indexing_stats();

-- Vérifier les colonnes ajoutées :
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN (
    'image_embedding_1024',
    'ai_caption',
    'ai_tags',
    'ai_indexed_at'
  );

-- ════════════════════════════════════════════════════════════════
-- 📋 RÉSUMÉ DE L'ARCHITECTURE
-- ════════════════════════════════════════════════════════════════
/*
  FLUX DE DONNÉES :
  ─────────────────
  📱 Utilisateur → photo

  🤗 Hugging Face Space (app.py) :
     ├─ Florence-2  → caption + OCR + tags (texte)
     ├─ DINOv2      → vecteur structurel 768 dim
     ├─ SigLIP      → vecteur sémantique 768 dim
     └─ Fusion      → vecteur final 1024 dim

  🗄️ Supabase pgvector :
     ├─ match_products_v2()       → recherche pure vecteur (< 50ms)
     ├─ search_vestyle_hybrid()   → vecteur + texte Florence-2
     └─ upsert_product_embedding() → indexation nouveaux produits

  📦 Retour → produit exact à l'utilisateur
*/
