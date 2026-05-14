const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.qkqowrwkmipxyktjdvfg:Z0kof@ro123@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
  });
  await client.connect();
  try {
    console.log("Starting SQL migration for Visual Search...");
    
    // 1. Extension
    await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
    
    // 2. Column
    await client.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_embedding vector(512);");
    
    // 3. Index
    await client.query("CREATE INDEX IF NOT EXISTS products_image_embedding_idx ON products USING ivfflat (image_embedding vector_cosine_ops) WITH (lists = 100);");
    
    // 4. match_products_v2
    await client.query("DROP FUNCTION IF EXISTS match_products_v2(vector(512), FLOAT, INT);");
    await client.query(`
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
              (1 - (p.image_embedding <=> query_embedding))::float as similarity
          FROM products p
          WHERE p.is_active = true 
            AND p.image_embedding IS NOT NULL
            AND 1 - (p.image_embedding <=> query_embedding) > match_threshold
          ORDER BY p.image_embedding <=> query_embedding
          LIMIT match_count;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 5. search_products_visual
    await client.query("DROP FUNCTION IF EXISTS search_products_visual(vector(512), FLOAT, INT);");
    await client.query(`
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
    `);

    // 6. Permissions
    await client.query("GRANT EXECUTE ON FUNCTION match_products_v2(vector(512), FLOAT, INT) TO anon, authenticated;");
    await client.query("GRANT EXECUTE ON FUNCTION search_products_visual(vector(512), FLOAT, INT) TO anon, authenticated;");

    console.log("SUCCESS: Visual Search RPCs fixed and dimensions set to 512.");
  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    await client.end();
  }
}

run();
