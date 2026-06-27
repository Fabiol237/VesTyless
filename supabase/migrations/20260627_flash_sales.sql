-- Ajout des colonnes pour les ventes flash (promos éclair)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='original_price') THEN
    ALTER TABLE public.products ADD COLUMN original_price decimal(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='flash_sale_end') THEN
    ALTER TABLE public.products ADD COLUMN flash_sale_end timestamp with time zone;
  END IF;
END $$;
