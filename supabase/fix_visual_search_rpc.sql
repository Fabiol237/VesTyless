-- 1. Ensure the vector extension is active
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Ensure image_embedding column exists with correct dimensions
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_embedding vector(512);

-- 3. Create or replace the visual search function used by VestyleLens
-- This function matches query_embedding against products and returns the most similar one
DROP FUNCTION IF EXISTS match_products_v2(vector, double precision, integer);

CREATE OR REPLACE FUNCTION match_products_v2(query_embedding vector(512), match_threshold FLOAT DEFAULT 0.7, match_count INT DEFAULT 1)
RETURNS TABLE (
  id uuid,
  name text,
  price decimal,
  image_url text,
  store_id uuid,
  similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.image_url, 
        p.store_id,
        1 - (p.image_embedding <=> query_embedding) as similarity
    FROM products p
    WHERE p.is_active = true 
      AND p.image_embedding IS NOT NULL
      AND 1 - (p.image_embedding <=> query_embedding) > match_threshold
    ORDER BY p.image_embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- 4. Re-ensure the existing search_products_visual also works correctly
CREATE OR REPLACE FUNCTION search_products_visual(query_embedding vector(512), match_threshold FLOAT DEFAULT 0.5, match_count INT DEFAULT 16)
RETURNS SETOF products AS $$
BEGIN
    RETURN QUERY
    SELECT p.*
    FROM products p
    WHERE p.is_active = true 
      AND p.image_embedding IS NOT NULL
      AND 1 - (p.image_embedding <=> query_embedding) > match_threshold
    ORDER BY p.image_embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
