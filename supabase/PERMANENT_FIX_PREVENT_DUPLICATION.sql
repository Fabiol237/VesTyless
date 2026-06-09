-- ============================================================
-- PERMANENT FIX: Prevent store duplication
-- ============================================================
-- This adds constraints to prevent the 605 fake stores issue

-- 1. Ensure each owner has at most 1 store per time period
-- (Already handled by code fix in AuthContext.js)

-- 2. Add index on owner_id for faster queries
CREATE INDEX IF NOT EXISTS idx_stores_owner_id 
  ON stores(owner_id) 
  WHERE is_active = true;

-- 3. Add NOT NULL constraint to is_active
ALTER TABLE stores 
  ALTER COLUMN is_active SET DEFAULT true,
  ALTER COLUMN is_active SET NOT NULL;

-- 4. Add slug uniqueness constraint (already exists, but let's verify)
ALTER TABLE stores 
  DROP CONSTRAINT IF EXISTS stores_slug_key,
  ADD CONSTRAINT stores_slug_unique_key UNIQUE(slug);

-- 5. Create trigger to prevent orphaned stores
CREATE OR REPLACE FUNCTION prevent_orphaned_stores()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the store is being created
  IF TG_OP = 'INSERT' THEN
    -- Don't allow stores with invalid owner_id
    IF NEW.owner_id IS NULL THEN
      RAISE EXCEPTION 'Store owner_id cannot be NULL';
    END IF;
    
    -- Check if this owner already has a store in the last 10 minutes
    IF EXISTS (
      SELECT 1 FROM stores 
      WHERE owner_id = NEW.owner_id 
      AND created_at > NOW() - INTERVAL '10 minutes'
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'This user already created a store recently. Please wait.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_orphaned_stores_trigger ON stores;
CREATE TRIGGER prevent_orphaned_stores_trigger
  BEFORE INSERT OR UPDATE ON stores
  FOR EACH ROW
  EXECUTE PROCEDURE prevent_orphaned_stores();

-- 6. Summary
SELECT 'Migration complete' as status;
SELECT 
  (SELECT COUNT(*) FROM stores) as total_stores,
  (SELECT COUNT(*) FROM stores WHERE is_active = true) as active_stores,
  (SELECT COUNT(*) FROM stores WHERE is_active = false) as inactive_stores;
