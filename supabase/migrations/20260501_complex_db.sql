ALTER TABLE products ADD COLUMN IF NOT EXISTS rating numeric(3,2) DEFAULT 4.5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews_count integer DEFAULT floor(random() * 100 + 1);
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percentage integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url text;

ALTER TABLE stores ADD COLUMN IF NOT EXISTS cover_url text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS rating numeric(3,2) DEFAULT 4.8;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_categories text[] DEFAULT '{}';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT floor(random() * 1000 + 50);
