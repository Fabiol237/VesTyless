-- supabase/migrations/20260501_search_rpc.sql
-- Migration pour ajouter la recherche avec tolérance aux fautes de frappe
-- et découpe de phrases (trigram matching)

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION search_products_v2(search_term text)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM products p
  LEFT JOIN stores s ON p.store_id = s.id
  WHERE p.is_active = true
    AND (
      p.name ILIKE '%' || search_term || '%'
      OR s.name ILIKE '%' || search_term || '%'
      OR word_similarity(search_term, p.name) > 0.3
      OR word_similarity(search_term, s.name) > 0.3
    )
  ORDER BY 
    GREATEST(word_similarity(search_term, p.name), word_similarity(search_term, s.name)) DESC,
    p.is_boosted DESC,
    p.is_promo DESC,
    p.daily_views DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION search_products_v2(text) TO anon, authenticated;
