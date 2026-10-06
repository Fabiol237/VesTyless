-- ═══════════════════════════════════════════════════════════════════════════
-- VESTIN — Master 2 : Template Library Schema
-- Migration : 20260912_templates_library.sql
-- ─────────────────────────────────────────────────────────────────────────
-- Table canonique unique : public.templates
-- Stocke les configurations de templates déclaratifs Vestin.
--
-- RÈGLE ABSOLUE :
--   • Un template est un document JSON pur (ZÉRO code JS, ZÉRO React, ZÉRO fake data)
--   • quality_score est NULL par défaut — JAMAIS de default 100.0 artificiel
--   • Le score est impérativement calculé par le TemplateQualityGate
--
-- SÉCURITÉ :
--   • Lecture publique : UNIQUEMENT templates publiés (status = 'published')
--   • Écriture / mutation : STRICTEMENT réservée au service_role (admin)
--   • Vue sécurisée public.templates_public pour les requêtes storefront/discovery
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── TABLE public.templates ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.templates (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT          NOT NULL,
  description         TEXT          NOT NULL DEFAULT '',
  business_type       TEXT          NOT NULL,                 -- 'restaurant' | 'fashion' | 'electronics' | ...
  sub_sector          TEXT          NULL,                     -- 'gastronomie' | 'streetwear' | 'smartphone' | ...
  style_tags          TEXT[]        NOT NULL DEFAULT '{}',    -- ['minimal', 'dark', 'luxe', 'bold']
  template_category   TEXT          NOT NULL DEFAULT 'general',
  version             TEXT          NOT NULL DEFAULT '1.0.0',
  status              TEXT          NOT NULL DEFAULT 'draft'
                                    CHECK (status IN ('draft', 'published', 'archived')),
  preview_image       TEXT          NULL,
  source_url          TEXT          NULL,
  source_name         TEXT          NULL,
  provenance          TEXT          NOT NULL DEFAULT 'internal'
                                    CHECK (provenance IN ('internal', 'reference_site', 'community', 'custom')),
  config_json         JSONB         NOT NULL DEFAULT '{}',    -- Structure déclarative { theme, sections, layout }
  quality_score       NUMERIC(5,2)  NULL                      -- NULL par défaut, calculé par QualityGate (0..100)
                                    CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 100)),
  quality_passed      BOOLEAN       NULL,
  quality_report      JSONB         NULL,
  is_official         BOOLEAN       NOT NULL DEFAULT false,
  author_id           TEXT          NULL,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  published_at        TIMESTAMPTZ   NULL
);

-- ── INDEX POUR PERFORMANCE DISCOVERY ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_templates_status        ON public.templates (status);
CREATE INDEX IF NOT EXISTS idx_templates_business_type ON public.templates (business_type);
CREATE INDEX IF NOT EXISTS idx_templates_sub_sector    ON public.templates (sub_sector);
CREATE INDEX IF NOT EXISTS idx_templates_category      ON public.templates (template_category);
CREATE INDEX IF NOT EXISTS idx_templates_official      ON public.templates (is_official) WHERE is_official = true;
CREATE INDEX IF NOT EXISTS idx_templates_quality_score ON public.templates (quality_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_templates_style_tags    ON public.templates USING GIN (style_tags);

-- ── TRIGGER updated_at ────────────────────────────────────────────────────
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

-- ── ROW LEVEL SECURITY (RLS) ──────────────────────────────────────────────
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Public : Seuls les templates "published" sont accessibles
DROP POLICY IF EXISTS "Public can read published templates" ON public.templates;
CREATE POLICY "Public can read published templates"
  ON public.templates
  FOR SELECT
  USING (status = 'published');

-- 2. ALL pour le service_role (admin/backend uniquement)
DROP POLICY IF EXISTS "Service role can manage templates" ON public.templates;
CREATE POLICY "Service role can manage templates"
  ON public.templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── VUE PUBLIQUE SÉCURISÉE : public.templates_public ─────────────────────
-- Expose uniquement les informations publiques nécessaires à la découverte et au rendu.
-- Masque les champs internes (quality_report détaillé, author_id interne, templates brouillons).
CREATE OR REPLACE VIEW public.templates_public
  WITH (security_invoker = true)
AS
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

COMMENT ON TABLE public.templates IS
  'Bibliothèque de templates canonique Vestin. Document JSON pur déclaratif (ZÉRO JSX, ZÉRO code exécutable, ZÉRO fake commercial data).';

COMMENT ON VIEW public.templates_public IS
  'Vue publique sécurisée des templates publiés Vestin (sans données de brouillon ni métadonnées internes).';
