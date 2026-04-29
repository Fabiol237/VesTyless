-- Table des commandes
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    total_amount numeric NOT NULL,
    status text DEFAULT 'pending',
    shipping_address text,
    phone_contact text,
    created_at timestamp with time zone DEFAULT now()
);

-- Table des éléments de commande (les produits dans le panier)
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id),
    store_id uuid REFERENCES public.stores(id),
    quantity int NOT NULL,
    price_at_time numeric NOT NULL
);

-- Active RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Politiques rapides (à ajuster selon les besoins stricts)
CREATE POLICY "Les utilisateurs voient leurs commandes" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs créent leurs commandes" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les vendeurs voient les éléments de commande liés à leur boutique" ON public.order_items FOR SELECT USING (
    store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
);
