-- 1. Table des Catégories Globales (Standards)
CREATE TABLE IF NOT EXISTS global_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT, -- Nom de l'icone Lucide
    slug TEXT UNIQUE NOT NULL,
    parent_id UUID REFERENCES global_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertion de quelques catégories de base (pour l'exemple)
INSERT INTO global_categories (name, slug, icon) VALUES 
('Mode Homme', 'mode-homme', 'User'),
('Mode Femme', 'mode-femme', 'User'),
('Chaussures', 'chaussures', 'Footprints'),
('Accessoires', 'accessoires', 'Watch'),
('Électronique', 'electronique', 'Smartphone')
ON CONFLICT (slug) DO NOTHING;

-- 2. Mise à jour de la table products pour le multi-images
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS global_category_id UUID REFERENCES global_categories(id);

-- 3. Table des Variantes (Tailles, Couleurs)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_type TEXT NOT NULL, -- 'taille', 'couleur', 'matiere'
    variant_value TEXT NOT NULL, -- 'XL', 'Rouge', 'Cuir'
    additional_price DECIMAL(12,2) DEFAULT 0, -- Si le XL est plus cher par ex.
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour la recherche rapide
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_global_category ON products(global_category_id);
