const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Z0kof%40ro123@db.qkqowrwkmipxyktjdvfg.supabase.co:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB!');
    
    await client.query('DROP FUNCTION IF EXISTS match_products_v2(vector, double precision, integer)');
    await client.query('DROP FUNCTION IF EXISTS match_products_v2(vector(512), double precision, integer)');
    console.log('Dropped old functions');

    const createFunctionSql = `
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
    `;
    await client.query(createFunctionSql);
    console.log('Function match_products_v2 recreated successfully!');

    const rlsSql = `
      ALTER TABLE global_categories ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Enable read access for all users" ON global_categories;
      CREATE POLICY "Enable read access for all users" ON global_categories FOR SELECT USING (true);
    `;
    await client.query(rlsSql);
    console.log('RLS applied to global_categories!');
  } catch (err) {
    console.error('Error during execution:', err.message);
  } finally {
    await client.end();
    console.log('Disconnected.');
  }
}

run();
