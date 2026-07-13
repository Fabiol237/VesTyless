-- Migration: Add business_type column to stores table
-- Run this in the Supabase SQL Editor if the column does not exist

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'ecommerce';

-- Optional: Add an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_stores_business_type ON stores(business_type);

-- Business type values:
-- 'ecommerce'  → Boutique E-commerce
-- 'hotel'      → Hôtel & Hébergement  
-- 'restaurant' → Restaurant & Gastronomie
-- 'services'   → Services & Consultations
-- 'creative'   → Créatifs & Agences
-- 'event'      → Événements & Billetterie
