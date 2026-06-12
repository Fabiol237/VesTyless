-- Ajouter une colonne shop_tabs (JSONB) à la table stores pour configurer les sous-pages des thèmes
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS shop_tabs JSONB DEFAULT '{"accueil":"Accueil","produits":"Catalogue","promotions":"Promotions","profil":"Profil"}';
