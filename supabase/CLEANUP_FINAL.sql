-- ============================================================
-- CLEANUP VESTYLE - SCRIPT SQL PRÊT À COPIER-COLLER
-- ============================================================
-- Exécute ceci dans: Supabase → SQL Editor
-- ============================================================

-- 1. VOIR L'ÉTAT ACTUEL
SELECT 
  'AVANT NETTOYAGE' as phase,
  (SELECT COUNT(*) FROM stores) as total_stores,
  (SELECT COUNT(*) FROM stores WHERE is_active = true) as active_stores,
  (SELECT COUNT(*) FROM stores WHERE is_active = false) as inactive_stores,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM orders) as total_orders;

-- 2. DÉSACTIVER TOUTES LES BOUTIQUES SANS PRODUITS ET SANS COMMANDES RÉCENTES
UPDATE stores
SET is_active = false
WHERE is_active = true
  AND id NOT IN (SELECT DISTINCT store_id FROM products WHERE store_id IS NOT NULL)
  AND id NOT IN (SELECT DISTINCT store_id FROM orders WHERE store_id IS NOT NULL AND created_at > NOW() - INTERVAL '30 days');

-- 3. RÉACTIVER TOUTES LES BOUTIQUES QUI ONT DES PRODUITS
UPDATE stores
SET is_active = true
WHERE id IN (SELECT DISTINCT store_id FROM products WHERE store_id IS NOT NULL)
  AND is_active = false;

-- 4. RÉACTIVER TOUTES LES BOUTIQUES QUI ONT DES COMMANDES RÉCENTES (< 30 jours)
UPDATE stores
SET is_active = true
WHERE id IN (
  SELECT DISTINCT store_id FROM orders 
  WHERE store_id IS NOT NULL 
  AND created_at > NOW() - INTERVAL '30 days'
)
AND is_active = false;

-- 5. CORRIGER LES PRODUITS AVEC STOCK NULL
UPDATE products
SET stock_quantity = 1
WHERE stock_quantity IS NULL;

-- 6. CORRIGER LES PRODUITS SANS IMAGES (OPTIONNEL)
-- UPDATE products
-- SET image_url = 'https://via.placeholder.com/300?text=No+Image'
-- WHERE image_url IS NULL;

-- 7. AJOUTER is_active = true AUX BOUTIQUES NULLES (fallback)
UPDATE stores
SET is_active = true
WHERE is_active IS NULL;

-- 8. VOIR LE RÉSULTAT FINAL
SELECT 
  'APRÈS NETTOYAGE' as phase,
  (SELECT COUNT(*) FROM stores) as total_stores,
  (SELECT COUNT(*) FROM stores WHERE is_active = true) as active_stores,
  (SELECT COUNT(*) FROM stores WHERE is_active = false) as inactive_stores,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM orders) as total_orders;

-- 9. LISTER LES BOUTIQUES ACTIVES (finales)
SELECT 
  id,
  name,
  slug,
  is_active,
  created_at,
  (SELECT COUNT(*) FROM products WHERE store_id = stores.id) as product_count,
  (SELECT COUNT(*) FROM orders WHERE store_id = stores.id) as order_count
FROM stores
WHERE is_active = true
ORDER BY created_at DESC;

-- 10. LISTER LES BOUTIQUES DÉSACTIVÉES (à titre informatif)
SELECT 
  id,
  name,
  slug,
  is_active,
  created_at,
  (SELECT COUNT(*) FROM products WHERE store_id = stores.id) as product_count,
  (SELECT COUNT(*) FROM orders WHERE store_id = stores.id) as order_count
FROM stores
WHERE is_active = false
ORDER BY created_at DESC;
