-- ════════════════════════════════════════════════════════════
-- Migration: Add unique 5-digit codes + QR code support
-- Run in Supabase SQL Editor
-- ════════════════════════════════════════════════════════════

-- 1. Add store_code (unique 5-digit reference) to stores table
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS store_code VARCHAR(5) UNIQUE,
  ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT;

-- 2. Add product_code to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_code VARCHAR(8) UNIQUE,
  ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
  ADD COLUMN IF NOT EXISTS old_price NUMERIC,
  ADD COLUMN IF NOT EXISTS is_promo BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false;

-- 3. Function to generate a random 5-digit code not already used
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

-- 4. Generate codes for all existing stores that don't have one yet
DO $$
DECLARE
  store_rec RECORD;
BEGIN
  FOR store_rec IN SELECT id FROM stores WHERE store_code IS NULL LOOP
    UPDATE stores SET store_code = generate_store_code() WHERE id = store_rec.id;
  END LOOP;
END;
$$;

-- 5. Trigger to auto-assign store_code on INSERT
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

-- 6. Function to search store by 5-digit code
CREATE OR REPLACE FUNCTION get_store_by_code(p_code VARCHAR)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  whatsapp_number TEXT,
  store_code VARCHAR,
  theme_color TEXT,
  city TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.name, s.slug, s.description, s.logo_url, s.banner_url, 
         s.whatsapp_number, s.store_code, s.theme_color, s.city
  FROM stores s
  WHERE s.store_code = p_code AND s.is_active = true;
END;
$$;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION get_store_by_code(VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_store_code() TO authenticated;
