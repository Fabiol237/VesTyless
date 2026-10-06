-- ═══════════════════════════════════════════════════════════════════════════
-- VesTyle / Vestin - Securite draft_config (Master 1 - Security Patch v6 Final)
-- ═══════════════════════════════════════════════════════════════════════════
-- MODÈLE DE SÉCURITÉ :
--   PUBLIC (anon)     -> stores_public uniquement (vue, sans owner_id, jamais draft_config)
--   OWNER (auth)      -> stores directement via RLS (accès complet)
--   AUTRE USER (auth) -> stores bloqué par RLS (0 ligne)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. AJOUT STRICT DES COLONNES MASTER 1 (Zéro donnée inventée) ────────────
-- Ajout idempotent des seules colonnes nécessaires au modèle déclaratif.
-- Aucune valeur par défaut artificielle sur les données métier.
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS sub_sector         TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS creation_method    TEXT DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS template_id        TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS template_version   TEXT DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS draft_config       JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS published_config   JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS published_at       TIMESTAMPTZ DEFAULT NULL;

-- ── 2. NETTOYAGE COMPLET DE TOUTES LES POLICIES SUR public.stores ───────────
-- Suppression dynamique de toutes les politiques existantes pour éliminer
-- tout SELECT public ou transversal résiduel sans supposer les noms.
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'stores'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.stores', pol.policyname);
    END LOOP;
END $$;

-- ── 3. POLICIES RLS ÉTANCHES PAR PROPRIÉTAIRE ──────────────────────────────
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- SELECT : propriétaire uniquement (accès complet à sa boutique + draft_config)
CREATE POLICY "Owners can view their own stores"
  ON public.stores FOR SELECT
  USING (owner_id = auth.uid());

-- INSERT : propriétaire uniquement
CREATE POLICY "Owners can insert their own stores"
  ON public.stores FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- UPDATE : propriétaire uniquement
CREATE POLICY "Owners can update their own stores"
  ON public.stores FOR UPDATE
  USING  (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- DELETE : propriétaire uniquement
CREATE POLICY "Owners can delete their own stores"
  ON public.stores FOR DELETE
  USING (owner_id = auth.uid());

-- ── 4. VUE PUBLIQUE stores_public (Sans owner_id, Sans draft_config) ───────
-- Comportement security_definer (par défaut) pour lecture anonyme/authentifiée
-- sans jamais exposer draft_config ni les identifiants internes (owner_id).
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
  -- Statuts et métriques
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
FROM public.stores
WHERE is_active = true;

-- ── 5. DROITS D'ACCÈS SUR LA VUE ───────────────────────────────────────────
GRANT SELECT ON public.stores_public TO anon;
GRANT SELECT ON public.stores_public TO authenticated;

-- ── 6. COMMENTAIRES DE SÉCURITÉ ────────────────────────────────────────────
COMMENT ON VIEW public.stores_public IS
  'Vue publique des boutiques actives. Jamais draft_config ni owner_id. '
  'Source unique pour visiteurs et utilisateurs non proprietaires.';

COMMENT ON COLUMN public.stores.draft_config IS
  'Configuration en cours (Studio). Prive - proprietaire uniquement via RLS.';

COMMENT ON COLUMN public.stores.published_config IS
  'Configuration publiee. Accessible publiquement via stores_public.';
