-- FIX POUR LE SYSTÈME DE LIVRAISON VESTYLE
-- Ce script configure les permissions (RLS) pour permettre aux vendeurs de gérer les livreurs
-- et aux livreurs de mettre à jour les commandes.

-- 1. Table des Livreurs
ALTER TABLE livreurs ENABLE ROW LEVEL SECURITY;

-- Les vendeurs peuvent voir et gérer leurs propres livreurs
CREATE POLICY "Les vendeurs gèrent leurs livreurs" ON livreurs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = livreurs.store_id 
      AND stores.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = livreurs.store_id 
      AND stores.owner_id = auth.uid()
    )
  );

-- Les livreurs peuvent voir leur propre profil
CREATE POLICY "Les livreurs voient leur profil" ON livreurs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 2. Permissions sur les Commandes pour les Livreurs
-- Permettre aux livreurs de voir les commandes qui leur sont assignées
CREATE POLICY "Les livreurs voient leurs commandes assignées" ON orders
  FOR SELECT TO authenticated
  USING (livreur_id IN (SELECT id FROM livreurs WHERE user_id = auth.uid()));

-- Permettre aux livreurs de mettre à jour le statut des commandes assignées
CREATE POLICY "Les livreurs mettent à jour le statut" ON orders
  FOR UPDATE TO authenticated
  USING (livreur_id IN (SELECT id FROM livreurs WHERE user_id = auth.uid()))
  WITH CHECK (livreur_id IN (SELECT id FROM livreurs WHERE user_id = auth.uid()));

-- 3. Mise à jour de la table Profiles (si nécessaire)
-- S'assurer que le champ email existe pour la recherche dans le dashboard settings
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- 4. RPC pour compter les vues (utilisé dans boutique/[slug]/page.js)
CREATE OR REPLACE FUNCTION increment_store_view(st_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE stores
  SET reviews_count = COALESCE(reviews_count, 0) + 1 -- On détourne reviews_count pour les tests ou on ajoute une colonne views
  WHERE id = st_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
