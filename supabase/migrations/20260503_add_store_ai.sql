-- Ajout des champs pour la Secrétaire IA (WebLLM)
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_name TEXT DEFAULT 'Assistant VesTyle',
ADD COLUMN IF NOT EXISTS ai_prompt TEXT DEFAULT 'Vous êtes l''assistant virtuel de cette boutique. Soyez poli, concis et aidez le client à trouver ce qu''il cherche en vous basant sur la description de la boutique. Ne proposez que des services liés à la vente des produits de la boutique.';
