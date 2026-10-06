-- =============================================================================
-- Migration: VesTyle Design Intelligence V2
-- Description: Tables pour le stockage persistant, graphe de relations et mémoire des échecs
-- =============================================================================

-- Extension pgvector pour les embeddings sémantiques 1024D (Jina CLIP / Embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Table principale : design_patterns
CREATE TABLE IF NOT EXISTS design_patterns (
    id TEXT PRIMARY KEY,
    industry TEXT NOT NULL,
    business_type TEXT NOT NULL DEFAULT 'product',
    positioning TEXT NOT NULL DEFAULT 'accessible',
    audience TEXT NOT NULL DEFAULT 'general',
    visual_style TEXT NOT NULL DEFAULT 'clean_modern',
    pattern_type TEXT NOT NULL DEFAULT 'composition',
    pattern_name TEXT NOT NULL,
    pattern_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedding vector(1024),
    evidence_count INT NOT NULL DEFAULT 1,
    confidence NUMERIC(4,3) NOT NULL DEFAULT 0.500 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    quality_score NUMERIC(4,3) NOT NULL DEFAULT 0.800 CHECK (quality_score >= 0.0 AND quality_score <= 1.0),
    source_count INT NOT NULL DEFAULT 1,
    source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide et filtrage structuré
CREATE INDEX IF NOT EXISTS idx_design_patterns_industry ON design_patterns(industry);
CREATE INDEX IF NOT EXISTS idx_design_patterns_positioning ON design_patterns(positioning);
CREATE INDEX IF NOT EXISTS idx_design_patterns_business_type ON design_patterns(business_type);
CREATE INDEX IF NOT EXISTS idx_design_patterns_confidence ON design_patterns(confidence DESC);

-- Index IVFFlat pour la recherche vectorielle cosinus si pgvector est activé
CREATE INDEX IF NOT EXISTS idx_design_patterns_embedding_cosine
ON design_patterns USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 2. Table de relations : design_pattern_relations
CREATE TABLE IF NOT EXISTS design_pattern_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_pattern_id TEXT NOT NULL REFERENCES design_patterns(id) ON DELETE CASCADE,
    target_pattern_id TEXT NOT NULL REFERENCES design_patterns(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('compatible_with', 'conflicts_with', 'often_followed_by', 'works_with', 'enhances')),
    weight NUMERIC(4,3) NOT NULL DEFAULT 1.000 CHECK (weight >= 0.0 AND weight <= 1.0),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pattern_relation UNIQUE (source_pattern_id, target_pattern_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_pattern_relations_source ON design_pattern_relations(source_pattern_id);
CREATE INDEX IF NOT EXISTS idx_pattern_relations_target ON design_pattern_relations(target_pattern_id);
CREATE INDEX IF NOT EXISTS idx_pattern_relations_type ON design_pattern_relations(relation_type);

-- 3. Table de mémoire des échecs : design_failures
CREATE TABLE IF NOT EXISTS design_failures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_combination JSONB NOT NULL,
    industry TEXT NOT NULL,
    context TEXT,
    problem TEXT NOT NULL,
    failed_reason TEXT NOT NULL,
    correction JSONB NOT NULL,
    result TEXT,
    occurrence_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_design_failures_industry ON design_failures(industry);

-- 4. Fonction RPC pour la recherche sémantique hybride
CREATE OR REPLACE FUNCTION match_design_patterns (
    query_embedding vector(1024),
    match_threshold float,
    match_count int,
    filter_industry text DEFAULT NULL,
    filter_positioning text DEFAULT NULL
)
RETURNS TABLE (
    id text,
    industry text,
    business_type text,
    positioning text,
    audience text,
    pattern_name text,
    pattern_data jsonb,
    confidence numeric,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dp.id,
        dp.industry,
        dp.business_type,
        dp.positioning,
        dp.audience,
        dp.pattern_name,
        dp.pattern_data,
        dp.confidence,
        1 - (dp.embedding <=> query_embedding) AS similarity
    FROM design_patterns dp
    WHERE (filter_industry IS NULL OR dp.industry = filter_industry OR dp.industry = 'general')
      AND (filter_positioning IS NULL OR dp.positioning = filter_positioning)
      AND (dp.embedding IS NOT NULL)
      AND (1 - (dp.embedding <=> query_embedding) >= match_threshold)
    ORDER BY similarity DESC, dp.confidence DESC
    LIMIT match_count;
END;
$$;
