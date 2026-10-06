-- ═══════════════════════════════════════════════════════════════════════════
-- VESTIN — MASTER 3.1 : CORRECTIF FINAL DE SÉCURITÉ TEMPLATES + JINA
-- Migration : 20260913_templates_jina_embedding.sql
-- ─────────────────────────────────────────────────────────────────────────
-- Objectif :
--   public.templates       = PRIVÉ (service_role uniquement)
--   templates_public       = Surface publique contrôlée (vue standard sans vecteurs)
--   match_templates()      = Recherche vectorielle publique contrôlée (SECURITY DEFINER)
-- 
-- Ne supprime aucun template ni embedding existant.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. EXTENSIONS NÉCESSAIRES ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ── 2. TABLE SOURCE public.templates ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.templates (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT          NOT NULL,
  description         TEXT          NOT NULL DEFAULT '',
  business_type       TEXT          NOT NULL,
  sub_sector          TEXT          NULL,
  style_tags          TEXT[]        NOT NULL DEFAULT '{}',
  template_category   TEXT          NOT NULL DEFAULT 'general',
  version             TEXT          NOT NULL DEFAULT '1.0.0',
  status              TEXT          NOT NULL DEFAULT 'draft'
                                    CHECK (status IN ('draft', 'published', 'archived')),
  preview_image       TEXT          NULL,
  source_url          TEXT          NULL,
  source_name         TEXT          NULL,
  provenance          TEXT          NOT NULL DEFAULT 'internal'
                                    CHECK (provenance IN ('internal', 'reference_site', 'community', 'custom')),
  config_json         JSONB         NOT NULL DEFAULT '{}',
  quality_score       NUMERIC(5,2)  NULL
                                    CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 100)),
  quality_passed      BOOLEAN       NULL,
  quality_report      JSONB         NULL,
  is_official         BOOLEAN       NOT NULL DEFAULT false,
  author_id           TEXT          NULL,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  published_at        TIMESTAMPTZ   NULL
);

-- Colonnes vectorielles Jina AI (1024D)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'templates'
    AND column_name = 'template_embedding'
  ) THEN
    ALTER TABLE public.templates ADD COLUMN template_embedding vector(1024);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'templates'
    AND column_name = 'embedding_text'
  ) THEN
    ALTER TABLE public.templates ADD COLUMN embedding_text TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'templates'
    AND column_name = 'embedded_at'
  ) THEN
    ALTER TABLE public.templates ADD COLUMN embedded_at TIMESTAMPTZ;
  END IF;
END $$;

-- Index de performance & HNSW
CREATE INDEX IF NOT EXISTS idx_templates_status        ON public.templates (status);
CREATE INDEX IF NOT EXISTS idx_templates_business_type ON public.templates (business_type);
CREATE INDEX IF NOT EXISTS idx_templates_sub_sector    ON public.templates (sub_sector);
CREATE INDEX IF NOT EXISTS idx_templates_category      ON public.templates (template_category);
CREATE INDEX IF NOT EXISTS idx_templates_official      ON public.templates (is_official) WHERE is_official = true;
CREATE INDEX IF NOT EXISTS idx_templates_quality_score ON public.templates (quality_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_templates_style_tags    ON public.templates USING GIN (style_tags);

DROP INDEX IF EXISTS idx_templates_embedding_hnsw;
CREATE INDEX idx_templates_embedding_hnsw
  ON public.templates
  USING hnsw (template_embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_templates_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_templates_updated_at ON public.templates;
CREATE TRIGGER trg_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.set_templates_updated_at();

-- ── 3. RLS SUR LA TABLE SOURCE ─────────────────────────────────────────────
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published templates" ON public.templates;
DROP POLICY IF EXISTS "Public can read templates" ON public.templates;
DROP POLICY IF EXISTS "Service role can manage templates" ON public.templates;

CREATE POLICY "Service role can manage templates"
ON public.templates
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ── 4. BLOQUER LE SELECT DIRECT SUR LA TABLE SOURCE ────────────────────────
REVOKE SELECT ON TABLE public.templates FROM anon, authenticated;
GRANT ALL ON TABLE public.templates TO service_role;

-- ── 5. RECONSTRUIRE LA VUE PUBLIQUE ─────────────────────────────────────────
DROP VIEW IF EXISTS public.templates_public;

CREATE VIEW public.templates_public AS
SELECT
    id,
    name,
    description,
    business_type,
    sub_sector,
    style_tags,
    template_category,
    version,
    preview_image,
    source_name,
    provenance,
    config_json,
    quality_score,
    quality_passed,
    is_official,
    published_at
FROM public.templates
WHERE status = 'published';

REVOKE ALL ON public.templates_public FROM PUBLIC;
GRANT SELECT ON public.templates_public TO anon, authenticated, service_role;

-- ── 6. RECONSTRUIRE LE RPC JINA / PGVECTOR ─────────────────────────────────
DROP FUNCTION IF EXISTS public.match_templates(vector(1024), text, text, double precision, integer);
DROP FUNCTION IF EXISTS public.match_templates(vector(1024), text, text, real, integer);
DROP FUNCTION IF EXISTS public.match_templates(vector(1024), text, text, float, integer);

CREATE OR REPLACE FUNCTION public.match_templates(
    query_embedding vector(1024),
    filter_business_type text DEFAULT NULL,
    filter_sub_sector text DEFAULT NULL,
    match_threshold double precision DEFAULT 0.0,
    match_count integer DEFAULT 20
)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    business_type text,
    sub_sector text,
    style_tags text[],
    template_category text,
    version text,
    preview_image text,
    source_name text,
    provenance text,
    config_json jsonb,
    quality_score numeric,
    quality_passed boolean,
    is_official boolean,
    published_at timestamptz,
    similarity double precision
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT
        t.id,
        t.name,
        t.description,
        t.business_type,
        t.sub_sector,
        t.style_tags,
        t.template_category,
        t.version,
        t.preview_image,
        t.source_name,
        t.provenance,
        t.config_json,
        t.quality_score,
        t.quality_passed,
        t.is_official,
        t.published_at,
        (1 - (t.template_embedding <=> query_embedding))::double precision AS similarity
    FROM public.templates AS t
    WHERE
        t.status = 'published'
        AND t.template_embedding IS NOT NULL
        AND (
            filter_business_type IS NULL
            OR t.business_type = filter_business_type
        )
        AND (
            filter_sub_sector IS NULL
            OR t.sub_sector = filter_sub_sector
        )
        AND (
            1 - (t.template_embedding <=> query_embedding)
        ) >= match_threshold
    ORDER BY
        t.template_embedding <=> query_embedding ASC
    LIMIT LEAST(
        GREATEST(COALESCE(match_count, 20), 1),
        50
    );
$$;

-- ── 7. PERMISSIONS DU RPC ──────────────────────────────────────────────────
REVOKE ALL ON FUNCTION public.match_templates(vector(1024), text, text, double precision, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_templates(vector(1024), text, text, double precision, integer) TO anon, authenticated, service_role;

COMMIT;
