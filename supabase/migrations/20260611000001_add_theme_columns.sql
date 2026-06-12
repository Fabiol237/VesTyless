ALTER TABLE stores ADD COLUMN IF NOT EXISTS shop_theme text DEFAULT 'theme_00';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS shop_tabs jsonb DEFAULT '{"accueil": "Accueil", "produits": "Catalogue", "promotions": "Promotions", "profil": "Profil"}'::jsonb;
