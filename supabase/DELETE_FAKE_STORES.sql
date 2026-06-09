-- ============================================================
-- DELETE FALSE STORES - KEEP ONLY ZOFAROCLUB & ZOKOSTORE
-- ============================================================
-- ⚠️ ATTENTION: Ce script SUPPRIME les boutiques fausses
-- Garder SEULEMENT: ZOFAROCLUB, ZOKOSTORE
-- ============================================================

-- 1. IDENTIFIER LES VRAIES BOUTIQUES À GARDER
SELECT 
  id,
  name,
  slug,
  owner_id,
  created_at,
  (SELECT COUNT(*) FROM products WHERE store_id = stores.id) as product_count
FROM stores
WHERE LOWER(name) IN ('zofaroclub', 'zokostore')
   OR LOWER(slug) LIKE '%zofaroclub%' 
   OR LOWER(slug) LIKE '%zokostore%';

-- 2. LISTER LES BOUTIQUES QUI SERONT SUPPRIMÉES
SELECT 
  id,
  name,
  slug,
  created_at,
  (SELECT COUNT(*) FROM products WHERE store_id = stores.id) as product_count,
  (SELECT COUNT(*) FROM orders WHERE store_id = stores.id) as order_count
FROM stores
WHERE LOWER(name) NOT IN ('zofaroclub', 'zokostore')
  AND LOWER(slug) NOT LIKE '%zofaroclub%'
  AND LOWER(slug) NOT LIKE '%zokostore%'
ORDER BY created_at DESC;

-- 3. SUPPRIMER LES PRODUITS DES FAUSSES BOUTIQUES
DELETE FROM products
WHERE store_id NOT IN (
  SELECT id FROM stores
  WHERE LOWER(name) IN ('zofaroclub', 'zokostore')
     OR LOWER(slug) LIKE '%zofaroclub%'
     OR LOWER(slug) LIKE '%zokostore%'
);

-- 4. SUPPRIMER LES COMMANDES DES FAUSSES BOUTIQUES
DELETE FROM orders
WHERE store_id NOT IN (
  SELECT id FROM stores
  WHERE LOWER(name) IN ('zofaroclub', 'zokostore')
     OR LOWER(slug) LIKE '%zofaroclub%'
     OR LOWER(slug) LIKE '%zokostore%'
);

-- 5. SUPPRIMER LES CATÉGORIES DES FAUSSES BOUTIQUES
DELETE FROM categories
WHERE store_id NOT IN (
  SELECT id FROM stores
  WHERE LOWER(name) IN ('zofaroclub', 'zokostore')
     OR LOWER(slug) LIKE '%zofaroclub%'
     OR LOWER(slug) LIKE '%zokostore%'
);

-- 6. SUPPRIMER LES FAUSSES BOUTIQUES
DELETE FROM stores
WHERE LOWER(name) NOT IN ('zofaroclub', 'zokostore')
  AND LOWER(slug) NOT LIKE '%zofaroclub%'
  AND LOWER(slug) NOT LIKE '%zokostore%';

-- 7. VOIR LE RÉSULTAT FINAL
SELECT 
  'APRÈS SUPPRESSION' as phase,
  (SELECT COUNT(*) FROM stores) as total_stores,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM orders) as total_orders;

-- 8. LISTER LES BOUTIQUES RESTANTES
SELECT 
  id,
  name,
  slug,
  is_active,
  created_at,
  (SELECT COUNT(*) FROM products WHERE store_id = stores.id) as product_count,
  (SELECT COUNT(*) FROM orders WHERE store_id = stores.id) as order_count
FROM stores
ORDER BY created_at DESC;
