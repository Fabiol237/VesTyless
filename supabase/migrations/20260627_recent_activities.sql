-- Création de la table publique pour les activités récentes
CREATE TABLE IF NOT EXISTS public.recent_activities (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  message text NOT NULL,
  type text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sécurité RLS : Tout le monde peut lire, seul le système peut écrire
ALTER TABLE public.recent_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activité visible par tous" ON public.recent_activities
  FOR SELECT USING (true);

-- Active le realtime sur cette table
ALTER PUBLICATION supabase_realtime ADD TABLE public.recent_activities;

-- Fonction pour insérer automatiquement lors d'une nouvelle commande
CREATE OR REPLACE FUNCTION public.handle_new_order_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  product_name text;
BEGIN
  -- On récupère le nom du premier produit commandé (si on veut faire simple)
  -- Mais pour éviter une requête complexe, on utilise le customer_name anonymisé
  -- ou juste "Une commande a été passée"
  
  -- Ex: "Quelqu'un vient de passer commande !"
  INSERT INTO public.recent_activities (message, type)
  VALUES ('Quelqu''un vient d''acheter un article !', 'purchase');
  
  RETURN NEW;
END;
$$;

-- Trigger sur la table orders
DROP TRIGGER IF EXISTS on_new_order_activity ON public.orders;
CREATE TRIGGER on_new_order_activity
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_order_activity();
