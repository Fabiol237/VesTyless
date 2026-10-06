-- ═══════════════════════════════════════════════════════════════════════════
-- VesTyle - Fix stores_public : ne plus filtrer WHERE is_active=true
-- ═══════════════════════════════════════════════════════════════════════════
-- PROBLÈME :
--   La vue stores_public avait WHERE is_active = true.
--   Résultat : les boutiques avec is_active=false ou NULL retournaient 0 ligne,
--   déclenchant le message "Boutique introuvable" même si la boutique existe
--   et a des produits.
--
-- SOLUTION :
--   Supprimer le filtre WHERE is_active=true de la vue.
--   Le champ is_active est déjà exposé dans la vue.
--   C'est au client (StorefrontClient.js) de décider comment afficher
--   une boutique inactive (message spécifique vs page normale).
-- ═══════════════════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS public.stores_public;

CREATE OR REPLACE VIEW public.stores_public AS
SELECT
  -- Identité publique (owner_id EXCLU)
  id,
  name,
  slug,
  description,
  -- Contact et localisation
  city,
  phone,
  whatsapp_link,
  latitude,
  longitude,
  -- Médias
  logo_url,
  banner_url,
  cover_url,
  -- Thème visuel
  theme_color,
  secondary_color,
  accent_color,
  font_family,
  shop_theme,
  shop_tabs,
  layout_config,
  -- Secteur et modèle canonique Master 1
  business_type,
  sub_sector,
  creation_method,
  template_id,
  template_version,
  -- Référence boutique
  store_code,
  -- Statuts et métriques (is_active exposé pour que le client gère l'état)
  is_active,
  is_boosted,
  verified,
  rating,
  daily_views,
  total_views,
  followers_count,
  -- Configuration déclarative publiée UNIQUEMENT
  -- (draft_config et owner_id sont STRICTEMENT EXCLUS de cette vue)
  published_config,
  published_at,
  -- Horodatages
  created_at,
  updated_at
FROM public.stores;
-- NOTE : Le filtre "WHERE is_active = true" a été supprimé intentionnellement.
-- Toutes les boutiques sont accessibles via la vue, is_active est exposé
-- pour permettre au client d'afficher un message approprié.

-- Droits d'accès inchangés
GRANT SELECT ON public.stores_public TO anon;
GRANT SELECT ON public.stores_public TO authenticated;

COMMENT ON VIEW public.stores_public IS
  'Vue publique des boutiques. Jamais draft_config ni owner_id. '
  'is_active est exposé : le client affiche un message adapté pour les boutiques inactives. '
  'Source unique pour visiteurs et utilisateurs non propriétaires.';
