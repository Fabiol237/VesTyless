-- ==========================================
-- RECHERCHE SÉMANTIQUE (TEXT SEARCH)
-- ==========================================

-- 1. Ajoute une colonne spécifique pour les vecteurs de texte (Gemini = 768 dimensions pour text-embedding-004)
ALTER TABLE products ADD COLUMN IF NOT EXISTS text_embedding vector(768);

-- 2. Index ultra-rapide
CREATE INDEX IF NOT EXISTS products_text_embedding_idx 
ON products USING ivfflat (text_embedding vector_cosine_ops) 
WITH (lists = 100);

-- 3. La fonction magique pour comparer le texte de recherche avec les produits
CREATE OR REPLACE FUNCTION search_products_text(query_embedding vector(768), match_threshold FLOAT DEFAULT 0.5, match_count INT DEFAULT 12)
RETURNS SETOF products AS $$
BEGIN
    RETURN QUERY
    SELECT p.*
    FROM products p
    WHERE p.is_active = true 
      AND p.stock_quantity > 0
      AND p.text_embedding IS NOT NULL
      AND 1 - (p.text_embedding <=> query_embedding) > match_threshold
    ORDER BY p.text_embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Accord de sécurité
GRANT EXECUTE ON FUNCTION search_products_text(vector(768), FLOAT, INT) TO anon, authenticated;
