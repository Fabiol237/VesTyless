-- ==========================================
-- RECHERCHE VISUELLE (IMAGE SEARCH)
-- ==========================================

-- 1. Ajoute une colonne spécifique pour les vecteurs visuels (CLIP = 512 dimensions)
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_embedding vector(512);

-- 2. Index ultra-rapide (HNSW est idéal pour +10k utilisateurs, mais on met IVFFLAT comme base de sécurité)
CREATE INDEX IF NOT EXISTS products_image_embedding_idx 
ON products USING ivfflat (image_embedding vector_cosine_ops) 
WITH (lists = 100);

-- 3. La fonction magique pour comparer les photos
CREATE OR REPLACE FUNCTION search_products_visual(query_embedding vector(512), match_threshold FLOAT DEFAULT 0.5, match_count INT DEFAULT 12)
RETURNS SETOF products AS $$
BEGIN
    RETURN QUERY
    SELECT p.*
    FROM products p
    WHERE p.is_active = true 
      AND p.stock_quantity > 0
      AND p.image_embedding IS NOT NULL
      AND 1 - (p.image_embedding <=> query_embedding) > match_threshold
    ORDER BY p.image_embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Accord de sécurité
GRANT EXECUTE ON FUNCTION search_products_visual(vector(512), FLOAT, INT) TO anon, authenticated;
