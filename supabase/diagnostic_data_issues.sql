-- Diagnostic Script for VesTyle Data Issues

-- 1. OVERVIEW: Total counts
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM stores) as total_stores,
  (SELECT COUNT(*) FROM stores WHERE is_active = true) as active_stores,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(*) FROM categories) as total_categories;

-- 2. PROBLEMATIC STORES: Empty stores (no products, no orders)
SELECT 
  s.id,
  s.name,
  s.slug,
  s.owner_id,
  s.is_active,
  s.created_at,
  p.product_count,
  o.order_count
FROM stores s
LEFT JOIN (SELECT store_id, COUNT(*) as product_count FROM products GROUP BY store_id) p ON s.id = p.store_id
LEFT JOIN (SELECT store_id, COUNT(*) as order_count FROM orders GROUP BY store_id) o ON s.id = o.store_id
WHERE (p.product_count IS NULL OR p.product_count = 0)
  AND (o.order_count IS NULL OR o.order_count = 0)
ORDER BY s.created_at DESC
LIMIT 20;

-- 3. HEALTHY STORES: Stores with products and/or orders
SELECT 
  s.id,
  s.name,
  s.slug,
  s.is_active,
  s.created_at,
  COUNT(DISTINCT p.id) as product_count,
  COUNT(DISTINCT o.id) as order_count,
  COUNT(DISTINCT p.id) FILTER (WHERE p.image_url IS NULL) as products_no_image,
  COUNT(DISTINCT p.id) FILTER (WHERE p.text_embedding_1024 IS NULL) as products_no_embedding
FROM stores s
LEFT JOIN products p ON s.id = p.store_id
LEFT JOIN orders o ON s.id = o.store_id
GROUP BY s.id, s.name, s.slug, s.is_active, s.created_at
HAVING COUNT(DISTINCT p.id) > 0 OR COUNT(DISTINCT o.id) > 0
ORDER BY COUNT(DISTINCT p.id) DESC;

-- 4. CHECK PRODUCT ISSUES
SELECT 
  'No image_url' as issue,
  COUNT(*) as affected_count
FROM products
WHERE image_url IS NULL
UNION ALL
SELECT 
  'No embedding',
  COUNT(*)
FROM products
WHERE text_embedding_1024 IS NULL
UNION ALL
SELECT
  'Zero stock',
  COUNT(*)
FROM products
WHERE stock_quantity = 0;

-- 5. CHECK SCHEMA: Are columns present?
SELECT 
  'is_active' as column_name,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='is_active') as exists_in_stores
UNION ALL
SELECT 'text_embedding_1024', EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='text_embedding_1024')
UNION ALL
SELECT 'image_embedding_1024', EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_embedding_1024');

-- 6. Recent activity (last 24h)
SELECT 
  'Stores created' as activity,
  COUNT(*) as count_24h
FROM stores
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 'Products added', COUNT(*) FROM products WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 'Orders placed', COUNT(*) FROM orders WHERE created_at > NOW() - INTERVAL '24 hours';
