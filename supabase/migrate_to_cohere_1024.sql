-- Adaptation de la base de données pour Cohere embed-english-v3.0
-- Cohere produit des embeddings de 1024 dimensions (vs 768 précédemment)

-- ✅ ÉTAPE 1 : Créer des colonnes 1024 si elles n'existent pas
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS text_embedding_1024 vector(1024),
ADD COLUMN IF NOT EXISTS image_embedding_1024 vector(1024);

-- ✅ ÉTAPE 2 : Créer des indices IVFFlat pour la recherche 1024D
CREATE INDEX IF NOT EXISTS products_text_embedding_1024_idx 
  ON products USING ivfflat (text_embedding_1024 vector_cosine_ops) 
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS products_image_embedding_1024_idx 
  ON products USING ivfflat (image_embedding_1024 vector_cosine_ops) 
  WITH (lists = 100);

-- ✅ ÉTAPE 3 : Recréer les RPC functions pour 1024 dimensions
-- (Ces RPC remplacent les versions 768)

DROP FUNCTION IF EXISTS match_products_v2(vector(768), FLOAT, INT) CASCADE;
DROP FUNCTION IF EXISTS search_products_text(vector(768), FLOAT, INT) CASCADE;
DROP FUNCTION IF EXISTS search_products_visual(vector(768), FLOAT, INT) CASCADE;

-- Nouvelle RPC : image-based search avec 1024D
CREATE OR REPLACE FUNCTION match_products_v2(
  query_embedding vector(1024),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  price DECIMAL,
  image_url TEXT,
  store_id UUID,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    products.id,
    products.name,
    products.price,
    products.image_url,
    products.store_id,
    (1 - (products.image_embedding_1024 <=> query_embedding)) AS similarity
  FROM products
  WHERE image_embedding_1024 IS NOT NULL
    AND (1 - (products.image_embedding_1024 <=> query_embedding)) > match_threshold
  ORDER BY products.image_embedding_1024 <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Nouvelle RPC : text-based search avec 1024D
CREATE OR REPLACE FUNCTION search_products_text(
  query_embedding vector(1024),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  price DECIMAL,
  image_url TEXT,
  store_id UUID,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    products.id,
    products.name,
    products.price,
    products.image_url,
    products.store_id,
    (1 - (products.text_embedding_1024 <=> query_embedding)) AS similarity
  FROM products
  WHERE text_embedding_1024 IS NOT NULL
    AND (1 - (products.text_embedding_1024 <=> query_embedding)) > match_threshold
  ORDER BY products.text_embedding_1024 <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Nouvelle RPC : compatible search_products_visual
CREATE OR REPLACE FUNCTION search_products_visual(
  query_embedding vector(1024),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  price DECIMAL,
  image_url TEXT,
  store_id UUID,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    products.id,
    products.name,
    products.price,
    products.image_url,
    products.store_id,
    (1 - (products.image_embedding_1024 <=> query_embedding)) AS similarity
  FROM products
  WHERE image_embedding_1024 IS NOT NULL
    AND (1 - (products.image_embedding_1024 <=> query_embedding)) > match_threshold
  ORDER BY products.image_embedding_1024 <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ✅ ÉTAPE 4 : Permissions pour les utilisateurs
GRANT EXECUTE ON FUNCTION match_products_v2(vector(1024), FLOAT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_products_text(vector(1024), FLOAT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_products_visual(vector(1024), FLOAT, INT) TO anon, authenticated;

-- ✅ Migration terminée
-- Note : Les colonnes 768D restent en place pour la rétrocompatibilité
-- Progressivement remplir les colonnes 1024D avec les embeddings Cohere
