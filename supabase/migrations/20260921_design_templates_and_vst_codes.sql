-- =============================================================================
-- Migration: VesTyle VST-CODE & Public Design Templates Ecosystem
-- Date: 2026-09-21
-- Description: Table centrale pour les templates extraits (Jina/Mistral),
--              indexation des VST-CODE uniques et clonage instantané.
-- =============================================================================

-- 1. Ajouter la colonne active_vst_code à la table stores si inexistante
ALTER TABLE IF EXISTS stores
ADD COLUMN IF NOT EXISTS active_vst_code TEXT;

CREATE INDEX IF NOT EXISTS idx_stores_active_vst_code ON stores(active_vst_code);

-- 2. Création de la table des templates de design (design_templates)
CREATE TABLE IF NOT EXISTS design_templates (
    id TEXT PRIMARY KEY,
    vst_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sector TEXT NOT NULL DEFAULT 'general',
    source_url TEXT,
    theme JSONB NOT NULL DEFAULT '{}'::jsonb,
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    conversion_hooks JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    usage_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_design_templates_vst_code ON design_templates(vst_code);
CREATE INDEX IF NOT EXISTS idx_design_templates_sector ON design_templates(sector);
CREATE INDEX IF NOT EXISTS idx_design_templates_is_public ON design_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_design_templates_usage_count ON design_templates(usage_count DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE design_templates ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour tous les templates publics
CREATE POLICY "Public read design_templates"
ON design_templates
FOR SELECT
USING (is_public = TRUE);

-- Insertion et modification autorisées pour les utilisateurs connectés ou le service role
CREATE POLICY "Auth insert design_templates"
ON design_templates
FOR INSERT
WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Auth update design_templates"
ON design_templates
FOR UPDATE
USING (auth.role() IN ('authenticated', 'service_role'));

-- 4. Fonction RPC pour incrémenter le compteur d'utilisation d'un VST-CODE
CREATE OR REPLACE FUNCTION increment_vst_code_usage(code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE design_templates
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE vst_code = code;
END;
$$;
