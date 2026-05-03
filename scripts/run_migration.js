const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qkqowrwkmipxyktjdvfg.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE';

// Use service role key derived from project - try with password as service role
// We'll use the REST API to run SQL via the pg connection
const sql = `
-- 1. Add store_code column to stores
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_code VARCHAR(5);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS qr_code_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS city TEXT;

-- 2. Add columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code VARCHAR(8);
ALTER TABLE products ADD COLUMN IF NOT EXISTS qr_code_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_promo BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false;

-- 3. Generate store code function
CREATE OR REPLACE FUNCTION generate_store_code()
RETURNS VARCHAR(5) LANGUAGE plpgsql AS $$
DECLARE
  new_code VARCHAR(5);
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');
    SELECT EXISTS(SELECT 1 FROM stores WHERE store_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- 4. Assign codes to existing stores
DO $$
DECLARE
  store_rec RECORD;
BEGIN
  FOR store_rec IN SELECT id FROM stores WHERE store_code IS NULL LOOP
    UPDATE stores SET store_code = generate_store_code() WHERE id = store_rec.id;
  END LOOP;
END;
$$;

-- 5. Add unique constraint after populating
ALTER TABLE stores DROP CONSTRAINT IF EXISTS stores_store_code_key;
ALTER TABLE stores ADD CONSTRAINT stores_store_code_key UNIQUE (store_code);

-- 6. Auto-assign trigger function
CREATE OR REPLACE FUNCTION auto_assign_store_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.store_code IS NULL THEN
    NEW.store_code := generate_store_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_store_code ON stores;
CREATE TRIGGER trg_auto_store_code
  BEFORE INSERT ON stores
  FOR EACH ROW EXECUTE FUNCTION auto_assign_store_code();

-- 7. Search function by code
CREATE OR REPLACE FUNCTION get_store_by_code(p_code VARCHAR)
RETURNS TABLE (
  id UUID, name TEXT, slug TEXT, description TEXT,
  logo_url TEXT, banner_url TEXT, whatsapp_number TEXT,
  store_code VARCHAR, theme_color TEXT, city TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.name, s.slug, s.description, s.logo_url, s.banner_url,
         s.whatsapp_number, s.store_code, s.theme_color, s.city
  FROM stores s
  WHERE s.store_code = p_code AND s.is_active = true;
END;
$$;

GRANT EXECUTE ON FUNCTION get_store_by_code(VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_store_code() TO authenticated;
`;

// Try using pg directly with the connection string
const { execSync } = require('child_process');

const connStr = `postgresql://postgres:Z0kof%40ro123@db.qkqowrwkmipxyktjdvfg.supabase.co:5432/postgres`;

const fs = require('fs');
fs.writeFileSync('/tmp/migration.sql', sql);

try {
  const result = execSync(`npx pg-client "${connStr}" < /tmp/migration.sql 2>&1`, { encoding: 'utf-8' });
  console.log('Result:', result);
} catch (e) {
  console.log('Error:', e.message);
}
