-- Cleanup Inactive Stores
-- This script marks old/empty stores as inactive instead of deleting them
-- To be run manually in Supabase SQL editor

-- 1. Mark stores with NO products AND NO orders as inactive
-- (unless they were created recently - less than 7 days ago)
UPDATE stores
SET is_active = false
WHERE id NOT IN (
  SELECT DISTINCT store_id FROM products
)
AND id NOT IN (
  SELECT DISTINCT store_id FROM orders
)
AND created_at < NOW() - INTERVAL '7 days'
AND is_active = true
AND owner_id IS NOT NULL;

-- 2. List stores that will be marked inactive (for preview)
SELECT id, name, slug, owner_id, created_at, 
  (SELECT COUNT(*) FROM products WHERE store_id = stores.id) as product_count,
  (SELECT COUNT(*) FROM orders WHERE store_id = stores.id) as order_count
FROM stores
WHERE is_active = false
  AND created_at < NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 3. Re-activate stores that have products or recent activity
UPDATE stores
SET is_active = true
WHERE id IN (
  SELECT DISTINCT store_id FROM products
)
OR id IN (
  SELECT DISTINCT store_id FROM orders WHERE created_at > NOW() - INTERVAL '30 days'
)
AND is_active = false;

-- 4. Check the current state
SELECT 
  is_active,
  COUNT(*) as store_count,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_count,
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/86400)::INT as avg_days_old
FROM stores
GROUP BY is_active
ORDER BY is_active DESC;
