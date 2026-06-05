const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = "postgresql://postgres.qkqowrwkmipxyktjdvfg:Z0kof@ro123@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";

async function migrateEmbeddings() {
  const client = new Client({ connectionString });
  await client.connect();
  
  try {
    console.log("🚀 Migration embeddings: 512 → 768 dimensions");
    
    // 1. Extension vector
    console.log("✓ Vérification extension vector...");
    await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
    
    // 2. Ajouter colonne text_embedding si elle n'existe pas
    console.log("✓ Création colonne text_embedding (768)...");
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS text_embedding vector(768);
    `);
    
    // 3. Modifier image_embedding en 768
    console.log("✓ Migration image_embedding: 512 → 768...");
    try {
      await client.query(`
        ALTER TABLE products 
        ALTER COLUMN image_embedding TYPE vector(768) USING image_embedding::text::vector;
      `);
    } catch (e) {
      // Si la colonne n'existe pas ou autre erreur, on crée juste
      await client.query(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS image_embedding vector(768);
      `);
    }
    
    // 4. Créer indices IVFFlat optimisés
    console.log("✓ Création indices IVFFlat...");
    await client.query(`
      DROP INDEX IF EXISTS products_image_embedding_idx CASCADE;
      CREATE INDEX products_image_embedding_idx ON products 
      USING ivfflat (image_embedding vector_cosine_ops) 
      WITH (lists = 100);
    `);
    
    await client.query(`
      DROP INDEX IF EXISTS products_text_embedding_idx CASCADE;
      CREATE INDEX products_text_embedding_idx ON products 
      USING ivfflat (text_embedding vector_cosine_ops) 
      WITH (lists = 100);
    `);
    
    // 5. Recréer RPC match_products_v2 pour image_embedding (768)
    console.log("✓ Recréation match_products_v2 (768)...");
    await client.query("DROP FUNCTION IF EXISTS match_products_v2(vector, double precision, integer) CASCADE;");
    await client.query("DROP FUNCTION IF EXISTS match_products_v2(vector(512), FLOAT, INT) CASCADE;");
    
    await client.query(`
      CREATE OR REPLACE FUNCTION match_products_v2(
        query_embedding vector(768), 
        match_threshold FLOAT DEFAULT 0.45, 
        match_count INT DEFAULT 12
      )
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
    
    // 6. Recréer RPC search_products_text pour text_embedding (768)
    console.log("✓ Recréation search_products_text (768)...");
    await client.query("DROP FUNCTION IF EXISTS search_products_text(vector, double precision, integer) CASCADE;");
    await client.query("DROP FUNCTION IF EXISTS search_products_text(vector(512), FLOAT, INT) CASCADE;");
    
    await client.query(`
      CREATE OR REPLACE FUNCTION search_products_text(
        query_embedding vector(768), 
        match_threshold FLOAT DEFAULT 0.5, 
        match_count INT DEFAULT 12
      )
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
          (1 - (p.text_embedding <=> query_embedding))::float as similarity
        FROM products p
        WHERE p.is_active = true 
          AND p.text_embedding IS NOT NULL
          AND 1 - (p.text_embedding <=> query_embedding) > match_threshold
        ORDER BY p.text_embedding <=> query_embedding
        LIMIT match_count;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // 7. Recréer RPC search_products_visual
    console.log("✓ Recréation search_products_visual (768)...");
    await client.query("DROP FUNCTION IF EXISTS search_products_visual(vector, FLOAT, INT) CASCADE;");
    await client.query("DROP FUNCTION IF EXISTS search_products_visual(vector(512), FLOAT, INT) CASCADE;");
    
    await client.query(`
      CREATE OR REPLACE FUNCTION search_products_visual(
        query_embedding vector(768), 
        match_threshold FLOAT DEFAULT 0.45, 
        match_count INT DEFAULT 16
      )
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
    
    // 8. Permissions
    console.log("✓ Configuration permissions...");
    await client.query("GRANT EXECUTE ON FUNCTION match_products_v2(vector(768), FLOAT, INT) TO anon, authenticated;");
    await client.query("GRANT EXECUTE ON FUNCTION search_products_text(vector(768), FLOAT, INT) TO anon, authenticated;");
    await client.query("GRANT EXECUTE ON FUNCTION search_products_visual(vector(768), FLOAT, INT) TO anon, authenticated;");
    
    console.log("✅ Migration terminée avec succès! (512 → 768 dimensions)");
    
  } catch (err) {
    console.error("❌ ERREUR:", err.message);
    throw err;
  } finally {
    await client.end();
  }
}

migrateEmbeddings();
