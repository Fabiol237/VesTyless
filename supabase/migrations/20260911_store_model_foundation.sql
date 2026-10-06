-- ═══════════════════════════════════════════════════════════════════════════
-- VesTyle / Vestin — Migration Fondation Modèle de Boutique (Étape 5.4 / Master 1)
-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Permet le modèle 1 utilisateur -> N boutiques (suppression unicité owner_id si présente)
-- 2. Ajout des colonnes déclaratives : sub_sector, creation_method, template_id, template_version, draft_config, published_config, published_at
-- 3. Maintien des index et RLS stricts par owner_id
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. GESTION DE LA CONTRAINTE D'UNICITÉ OWNER_ID ───────────────────────────
-- Si la contrainte unique stores_owner_id_key existe, la supprimer pour autoriser
-- 1 utilisateur à posséder plusieurs boutiques, tout en conservant l'index standard.
ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS stores_owner_id_key;

-- ── 2. INDEX SUR OWNER_ID POUR PERFORMANCES & RLS ────────────────────────────
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores (owner_id);

-- ── 3. EXTENSION DU MODÈLE DE BOUTIQUE CANONIQUE ──────────────────────────────
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS sub_sector         TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS creation_method    TEXT DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS template_id        TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS template_version   TEXT DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS draft_config       JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS published_config   JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS published_at       TIMESTAMPTZ DEFAULT NULL;

-- ── 4. INDEX DE RECHERCHE SECTEUR & SOUS-SECTEUR ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_stores_business_sub_sector
  ON public.stores (business_type, sub_sector);

-- ── 5. EXTENSION DE STORE_VERSIONS POUR CONFIGURATION DÉCLARATIVE ─────────────
ALTER TABLE public.store_versions
  ADD COLUMN IF NOT EXISTS config_data JSONB DEFAULT '{}'::jsonb;

-- ── 6. VÉRIFICATION RLS SUR STORES ───────────────────────────────────────────
-- S'assure que RLS est actif et que l'isolation propriétaire est garantie
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active stores" ON public.stores;
CREATE POLICY "Public can view active stores"
  ON public.stores FOR SELECT
  USING (is_active = true OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update their own stores" ON public.stores;
CREATE POLICY "Owners can update their own stores"
  ON public.stores FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can insert their own stores" ON public.stores;
CREATE POLICY "Owners can insert their own stores"
  ON public.stores FOR INSERT
  WITH CHECK (owner_id = auth.uid());
