-- Nettoyage des exemples précédents pour repartir sur du propre
TRUNCATE TABLE global_categories CASCADE;

-- 1. CATÉGORIES PARENTES (NIVEAU 0) - 7 CATÉGORIES UNIVERSELLES
INSERT INTO global_categories (id, name, slug, icon) VALUES 
('c1000000-0000-0000-0000-000000000001', 'Mode & Beauté', 'mode-beaute', 'Shirt'),
('c1000000-0000-0000-0000-000000000002', 'Alimentation & Supermarché', 'alimentation', 'ShoppingCart'),
('c1000000-0000-0000-0000-000000000003', 'Électronique & High-Tech', 'electronique', 'Smartphone'),
('c1000000-0000-0000-0000-000000000004', 'Maison & Électroménager', 'maison', 'Home'),
('c1000000-0000-0000-0000-000000000005', 'Santé & Bien-être', 'sante', 'Heart'),
('c1000000-0000-0000-0000-000000000006', 'Services & Loisirs', 'loisirs', 'Star'),
('c1000000-0000-0000-0000-000000000007', 'Divers', 'divers', 'Package');

-- CONFIGURATION DES DROITS D'ACCÈS PUBLIC (RLS)
-- Cela permet à tous les utilisateurs (même non connectés) de lire les catégories
ALTER TABLE global_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON global_categories;
CREATE POLICY "Enable read access for all users" ON global_categories FOR SELECT USING (true);
