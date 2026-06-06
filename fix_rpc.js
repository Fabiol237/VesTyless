const { Client } = require('pg');

const fixSQL = `
DROP FUNCTION IF EXISTS match_products_v2(vector(1024), FLOAT, INT) CASCADE;
DROP FUNCTION IF EXISTS search_products_text(vector(1024), FLOAT, INT) CASCADE;
DROP FUNCTION IF EXISTS search_products_visual(vector(1024), FLOAT, INT) CASCADE;

CREATE OR REPLACE FUNCTION match_products_v2(
  query_embedding vector(1024),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  price NUMERIC,
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
    (1 - (products.image_embedding_1024 <=> query_embedding))::FLOAT AS similarity
  FROM products
  WHERE image_embedding_1024 IS NOT NULL
  ORDER BY image_embedding_1024 <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_products_text(
  query_embedding vector(1024),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  price NUMERIC,
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
    (1 - (products.text_embedding_1024 <=> query_embedding))::FLOAT AS similarity
  FROM products
  WHERE text_embedding_1024 IS NOT NULL
  ORDER BY text_embedding_1024 <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_products_visual(
  query_embedding vector(1024),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  price NUMERIC,
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
    (1 - (products.image_embedding_1024 <=> query_embedding))::FLOAT AS similarity
  FROM products
  WHERE image_embedding_1024 IS NOT NULL
  ORDER BY image_embedding_1024 <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION match_products_v2(vector(1024), FLOAT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_products_text(vector(1024), FLOAT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_products_visual(vector(1024), FLOAT, INT) TO anon, authenticated;
`;

const client = new Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.qkqowrwkmipxyktjdvfg',
  password: 'Z0kof@ro123',
  database: 'postgres',
  connectionTimeoutMillis: 10000
});

client.connect()
  .then(() => {
    console.log('Connected! Applying fix...');
    return client.query(fixSQL);
  })
  .then(() => {
    console.log('✅ RPC functions fixed successfully! (UUID types corrected)');
    return client.end();
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    client.end();
  });
