-- ============================================================
-- VESTYLE - SYSTÈME DE SUIVI LIVREUR
-- Exécuter dans Supabase SQL Editor
-- ============================================================

-- 1. TABLE LIVREURS (équipe de livraison du vendeur)
create table if not exists livreurs (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  phone text,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. COLONNES SUPPLÉMENTAIRES SUR ORDERS
do $$
begin
  -- Livreur assigné à la commande
  if not exists (select 1 from information_schema.columns where table_name='orders' and column_name='livreur_id') then
    alter table orders add column livreur_id uuid references livreurs(id) on delete set null;
  end if;
  -- Token unique pour que le livreur accède à sa page sans login
  if not exists (select 1 from information_schema.columns where table_name='orders' and column_name='livreur_token') then
    alter table orders add column livreur_token text unique;
  end if;
  -- Date de confirmation de réception par le client
  if not exists (select 1 from information_schema.columns where table_name='orders' and column_name='confirmed_at') then
    alter table orders add column confirmed_at timestamp with time zone;
  end if;
end $$;

-- 3. MISE À JOUR delivery_tracking : ajouter le livreur_id sur les points GPS
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='delivery_tracking' and column_name='livreur_id') then
    alter table delivery_tracking add column livreur_id uuid references livreurs(id) on delete set null;
  end if;
  -- Garder le dernier point GPS seulement (upsert)
  if not exists (select 1 from information_schema.columns where table_name='delivery_tracking' and column_name='accuracy') then
    alter table delivery_tracking add column accuracy decimal(8,2);
  end if;
end $$;

-- 4. POLICIES ROW LEVEL SECURITY

alter table livreurs enable row level security;

do $$
begin
  -- Livreurs : visible par tout le monde (pour la page livreur sans login)
  drop policy if exists "Anyone can view livreurs" on livreurs;
  create policy "Anyone can view livreurs" on livreurs for select using (true);

  -- Livreurs : seul le propriétaire de la boutique peut gérer
  drop policy if exists "Owners can manage livreurs" on livreurs;
  create policy "Owners can manage livreurs" on livreurs for all using (
    exists (select 1 from stores where stores.id = livreurs.store_id and stores.owner_id = auth.uid())
  );

  -- Orders : mise à jour du statut par le livreur (via token, sans auth)
  drop policy if exists "Owners can update their store orders" on orders;
  create policy "Owners can update their store orders" on orders for update using (
    exists (select 1 from stores where stores.id = orders.store_id and stores.owner_id = auth.uid())
  );

  -- Client peut confirmer réception (sans auth, par token ou order_id)
  drop policy if exists "Anyone can confirm order receipt" on orders;
  create policy "Anyone can confirm order receipt" on orders for update
    using (true)
    with check (true);

  -- Tracking : livreur peut insérer sa position (sans auth, authentifié par livreur_token)
  drop policy if exists "Anyone can insert tracking" on delivery_tracking;
  create policy "Anyone can insert tracking" on delivery_tracking for insert with check (true);

  drop policy if exists "Anyone can update tracking" on delivery_tracking;
  create policy "Anyone can update tracking" on delivery_tracking for update using (true);
end $$;

-- 5. REALTIME pour livreurs
do $$
begin
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'livreurs') then
        alter publication supabase_realtime add table livreurs;
    end if;
end $$;

-- ============================================================
-- TERMINÉ — Vestyle Livreur System est prêt
-- ============================================================
