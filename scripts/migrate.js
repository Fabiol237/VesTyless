const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.qkqowrwkmipxyktjdvfg',
  password: 'Z0kof@ro123',
  ssl: { rejectUnauthorized: false },
});

const steps = [
  {
    name: '1. Add store_code to stores',
    sql: `ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_code VARCHAR(5); ALTER TABLE stores ADD COLUMN IF NOT EXISTS qr_code_url TEXT; ALTER TABLE stores ADD COLUMN IF NOT EXISTS city TEXT;`
  },
  {
    name: '2. Add columns to products',
    sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code VARCHAR(8); ALTER TABLE products ADD COLUMN IF NOT EXISTS qr_code_url TEXT; ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price NUMERIC; ALTER TABLE products ADD COLUMN IF NOT EXISTS is_promo BOOLEAN DEFAULT false; ALTER TABLE products ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false;`
  },
  {
    name: '3. Create generate_store_code function',
    sql: `CREATE OR REPLACE FUNCTION generate_store_code() RETURNS VARCHAR(5) LANGUAGE plpgsql AS $$ DECLARE new_code VARCHAR(5); code_exists BOOLEAN; BEGIN LOOP new_code := LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0'); SELECT EXISTS(SELECT 1 FROM stores WHERE store_code = new_code) INTO code_exists; EXIT WHEN NOT code_exists; END LOOP; RETURN new_code; END; $$;`
  },
  {
    name: '4. Assign codes to existing stores',
    sql: `DO $$ DECLARE store_rec RECORD; BEGIN FOR store_rec IN SELECT id FROM stores WHERE store_code IS NULL LOOP UPDATE stores SET store_code = generate_store_code() WHERE id = store_rec.id; END LOOP; END; $$;`
  },
  {
    name: '5. Add unique constraint',
    sql: `ALTER TABLE stores DROP CONSTRAINT IF EXISTS stores_store_code_key; ALTER TABLE stores ADD CONSTRAINT stores_store_code_key UNIQUE (store_code);`
  },
  {
    name: '6. Create auto-assign trigger',
    sql: `
      CREATE OR REPLACE FUNCTION auto_assign_store_code() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN IF NEW.store_code IS NULL THEN NEW.store_code := generate_store_code(); END IF; RETURN NEW; END; $$;
      DROP TRIGGER IF EXISTS trg_auto_store_code ON stores;
      CREATE TRIGGER trg_auto_store_code BEFORE INSERT ON stores FOR EACH ROW EXECUTE FUNCTION auto_assign_store_code();
    `
  },
  {
    name: '7. Create get_store_by_code RPC function',
    sql: `
      CREATE OR REPLACE FUNCTION get_store_by_code(p_code VARCHAR)
      RETURNS TABLE (id UUID, name TEXT, slug TEXT, description TEXT, logo_url TEXT, banner_url TEXT, whatsapp_number TEXT, store_code VARCHAR, theme_color TEXT, city TEXT)
      LANGUAGE plpgsql SECURITY DEFINER AS $$
      BEGIN
        RETURN QUERY SELECT s.id, s.name, s.slug, s.description, s.logo_url, s.banner_url, s.whatsapp_number, s.store_code, s.theme_color, s.city
        FROM stores s WHERE s.store_code = p_code AND s.is_active = true;
      END;
      $$;
      GRANT EXECUTE ON FUNCTION get_store_by_code(VARCHAR) TO anon, authenticated;
      GRANT EXECUTE ON FUNCTION generate_store_code() TO authenticated;
    `
  },
  {
    name: '8. Verify: Show stores with codes',
    sql: `SELECT name, store_code FROM stores LIMIT 10;`
  }
];

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL\n');

    for (const step of steps) {
      try {
        process.stdout.write(`Running: ${step.name}... `);
        const result = await client.query(step.sql);
        if (result.rows && result.rows.length > 0) {
          console.log('✅');
          console.log('   Results:', JSON.stringify(result.rows, null, 2));
        } else {
          console.log('✅ Done');
        }
      } catch (err) {
        console.log(`❌ ERROR: ${err.message}`);
      }
    }

    console.log('\n🎉 Migration complete!');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
