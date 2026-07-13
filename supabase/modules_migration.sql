-- ============================================================
-- 2VESTYLE - MIGRATION : SYSTÈME DE BOUTIQUES MODULAIRES
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- 1. EXTENSION DES STORES : Ajout des colonnes du système modulaire
do $$
begin
  -- Statut de la boutique : draft | published | suspended
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='status') then
    alter table stores add column status text default 'draft' check (status in ('draft', 'published', 'suspended'));
  end if;

  -- Données d'onboarding : réponses au formulaire initial
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='onboarding_data') then
    alter table stores add column onboarding_data jsonb default '{}';
  end if;

  -- Type d'activité déterminé par l'IA
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='activity_type') then
    alter table stores add column activity_type text;
  end if;

  -- Config du thème global (couleurs, police, ambiance)
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='theme_config') then
    alter table stores add column theme_config jsonb default '{
      "primaryColor": "#6366f1",
      "secondaryColor": "#f0f0ff",
      "accentColor": "#a855f7",
      "fontFamily": "Inter",
      "mode": "light",
      "borderRadius": "rounded"
    }';
  end if;

  -- Nom de domaine personnalisé
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='custom_domain') then
    alter table stores add column custom_domain text unique;
  end if;

  -- Langue(s) de la boutique
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='languages') then
    alter table stores add column languages text[] default array['fr'];
  end if;

  -- Socials & marketing
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='social_links') then
    alter table stores add column social_links jsonb default '{}';
  end if;

  -- CRM : nb total de clients uniques
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='total_clients') then
    alter table stores add column total_clients integer default 0;
  end if;

end $$;

-- ============================================================
-- 2. TABLE : store_modules
-- Chaque ligne = un module (page) activé dans une boutique
-- ============================================================
create table if not exists store_modules (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  type text not null,        -- 'vitrine' | 'catalogue' | 'reservation' | 'portfolio' | 'billetterie' | 'restaurant' | 'services' | 'links' | 'testimonials' | 'contact' | 'abonnement' | 'digital' | 'devis' | 'newsletter'
  label text not null,       -- Nom affiché dans le menu (ex: "Nos Produits")
  icon text,                 -- Icône lucide (ex: "ShoppingBag")
  position integer default 0, -- Ordre dans la navigation
  is_active boolean default true,
  config jsonb default '{}', -- Configuration spécifique au module (couleurs, textes, etc.)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 3. TABLE : reservations
-- Pour le Module de Prise de Rendez-vous
-- ============================================================
create table if not exists reservations (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  service_id uuid,            -- Optionnel, lie à une prestation
  client_name text not null,
  client_email text,
  client_phone text,
  date date not null,
  time_slot text not null,    -- Ex: "10:00"
  duration_minutes integer default 60,
  notes text,
  status text default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  price decimal(12,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 4. TABLE : services
-- Prestations proposées par les vendeurs de services
-- ============================================================
create table if not exists services (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  description text,
  price decimal(12,2) default 0,
  duration_minutes integer default 60,
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 5. TABLE : events (Billetterie)
-- Pour le Module Billetterie / Événements
-- ============================================================
create table if not exists events (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  title text not null,
  description text,
  cover_image text,
  location text,
  event_date timestamp with time zone not null,
  end_date timestamp with time zone,
  ticket_price decimal(12,2) default 0,
  total_tickets integer default 100,
  sold_tickets integer default 0,
  status text default 'active' check (status in ('draft', 'active', 'sold_out', 'cancelled', 'past')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 6. TABLE : tickets
-- Billets achetés pour un événement
-- ============================================================
create table if not exists tickets (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  store_id uuid references stores(id) on delete cascade not null,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text,
  quantity integer default 1,
  total_amount decimal(12,2) not null,
  qr_code text unique,        -- QR code unique pour scanner à l'entrée
  status text default 'valid' check (status in ('valid', 'used', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 7. TABLE : portfolio_items
-- Réalisations pour le Module Portfolio
-- ============================================================
create table if not exists portfolio_items (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  title text not null,
  description text,
  image_url text,
  tags text[],
  link_url text,
  position integer default 0,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 8. TABLE : testimonials
-- Avis clients pour le Module Témoignages
-- ============================================================
create table if not exists testimonials (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  author_name text not null,
  author_avatar text,
  rating integer default 5 check (rating between 1 and 5),
  content text not null,
  is_approved boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 9. TABLE : restaurant_menu
-- Plats / articles pour le Module Restaurant
-- ============================================================
create table if not exists restaurant_menu (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  category text not null,    -- Ex: "Entrées", "Plats", "Desserts"
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  allergens text[],
  is_available boolean default true,
  position integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 10. TABLE : store_clients (CRM unifié)
-- Base de données clients centralisée par boutique
-- ============================================================
create table if not exists store_clients (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  source text,               -- 'order' | 'reservation' | 'ticket' | 'newsletter'
  total_spent decimal(12,2) default 0,
  last_interaction timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(store_id, email)
);

-- ============================================================
-- 11. TABLE : newsletter_subscribers
-- Abonnés à la newsletter d'une boutique
-- ============================================================
create table if not exists newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  email text not null,
  name text,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(store_id, email)
);

-- ============================================================
-- 12. TABLE : devis_requests
-- Demandes de devis pour le Module Devis
-- ============================================================
create table if not exists devis_requests (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  client_name text not null,
  client_email text not null,
  client_phone text,
  project_description text not null,
  budget_range text,
  deadline text,
  ai_generated_devis jsonb,
  status text default 'new' check (status in ('new', 'in_review', 'sent', 'accepted', 'refused')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 13. TABLE : subscriptions (Abonnements)
-- Abonnements vendus par les boutiques
-- ============================================================
create table if not exists subscriptions (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  plan_name text not null,
  price decimal(12,2) not null,
  billing_cycle text default 'monthly' check (billing_cycle in ('weekly', 'monthly', 'yearly')),
  features text[],
  max_subscribers integer,
  current_subscribers integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 14. POLICIES RLS
-- ============================================================
alter table store_modules enable row level security;
alter table reservations enable row level security;
alter table services enable row level security;
alter table events enable row level security;
alter table tickets enable row level security;
alter table portfolio_items enable row level security;
alter table testimonials enable row level security;
alter table restaurant_menu enable row level security;
alter table store_clients enable row level security;
alter table newsletter_subscribers enable row level security;
alter table devis_requests enable row level security;
alter table subscriptions enable row level security;

do $$
begin
  -- store_modules
  drop policy if exists "Anyone can view active modules" on store_modules;
  create policy "Anyone can view active modules" on store_modules for select using (is_active = true);
  drop policy if exists "Owners can manage their modules" on store_modules;
  create policy "Owners can manage their modules" on store_modules for all using (
    exists (select 1 from stores where stores.id = store_modules.store_id and stores.owner_id = auth.uid())
  );

  -- reservations
  drop policy if exists "Owners can view reservations" on reservations;
  create policy "Owners can view reservations" on reservations for select using (
    exists (select 1 from stores where stores.id = reservations.store_id and stores.owner_id = auth.uid())
  );
  drop policy if exists "Anyone can create reservation" on reservations;
  create policy "Anyone can create reservation" on reservations for insert with check (true);
  drop policy if exists "Owners can update reservations" on reservations;
  create policy "Owners can update reservations" on reservations for update using (
    exists (select 1 from stores where stores.id = reservations.store_id and stores.owner_id = auth.uid())
  );

  -- services
  drop policy if exists "Anyone can view active services" on services;
  create policy "Anyone can view active services" on services for select using (is_active = true);
  drop policy if exists "Owners can manage services" on services;
  create policy "Owners can manage services" on services for all using (
    exists (select 1 from stores where stores.id = services.store_id and stores.owner_id = auth.uid())
  );

  -- events
  drop policy if exists "Anyone can view events" on events;
  create policy "Anyone can view events" on events for select using (true);
  drop policy if exists "Owners can manage events" on events;
  create policy "Owners can manage events" on events for all using (
    exists (select 1 from stores where stores.id = events.store_id and stores.owner_id = auth.uid())
  );

  -- tickets
  drop policy if exists "Anyone can buy tickets" on tickets;
  create policy "Anyone can buy tickets" on tickets for insert with check (true);
  drop policy if exists "Owners can view tickets" on tickets;
  create policy "Owners can view tickets" on tickets for select using (
    exists (select 1 from stores where stores.id = tickets.store_id and stores.owner_id = auth.uid())
  );

  -- portfolio_items
  drop policy if exists "Anyone can view portfolio" on portfolio_items;
  create policy "Anyone can view portfolio" on portfolio_items for select using (true);
  drop policy if exists "Owners can manage portfolio" on portfolio_items;
  create policy "Owners can manage portfolio" on portfolio_items for all using (
    exists (select 1 from stores where stores.id = portfolio_items.store_id and stores.owner_id = auth.uid())
  );

  -- testimonials
  drop policy if exists "Anyone can view approved testimonials" on testimonials;
  create policy "Anyone can view approved testimonials" on testimonials for select using (is_approved = true);
  drop policy if exists "Anyone can submit testimonial" on testimonials;
  create policy "Anyone can submit testimonial" on testimonials for insert with check (true);
  drop policy if exists "Owners can manage testimonials" on testimonials;
  create policy "Owners can manage testimonials" on testimonials for all using (
    exists (select 1 from stores where stores.id = testimonials.store_id and stores.owner_id = auth.uid())
  );

  -- restaurant_menu
  drop policy if exists "Anyone can view menu" on restaurant_menu;
  create policy "Anyone can view menu" on restaurant_menu for select using (true);
  drop policy if exists "Owners can manage menu" on restaurant_menu;
  create policy "Owners can manage menu" on restaurant_menu for all using (
    exists (select 1 from stores where stores.id = restaurant_menu.store_id and stores.owner_id = auth.uid())
  );

  -- store_clients
  drop policy if exists "Owners can view their clients" on store_clients;
  create policy "Owners can view their clients" on store_clients for select using (
    exists (select 1 from stores where stores.id = store_clients.store_id and stores.owner_id = auth.uid())
  );
  drop policy if exists "System can insert clients" on store_clients;
  create policy "System can insert clients" on store_clients for insert with check (true);

  -- newsletter_subscribers
  drop policy if exists "Anyone can subscribe to newsletter" on newsletter_subscribers;
  create policy "Anyone can subscribe to newsletter" on newsletter_subscribers for insert with check (true);
  drop policy if exists "Owners can view subscribers" on newsletter_subscribers;
  create policy "Owners can view subscribers" on newsletter_subscribers for select using (
    exists (select 1 from stores where stores.id = newsletter_subscribers.store_id and stores.owner_id = auth.uid())
  );

  -- devis_requests
  drop policy if exists "Anyone can submit devis" on devis_requests;
  create policy "Anyone can submit devis" on devis_requests for insert with check (true);
  drop policy if exists "Owners can view devis" on devis_requests;
  create policy "Owners can view devis" on devis_requests for all using (
    exists (select 1 from stores where stores.id = devis_requests.store_id and stores.owner_id = auth.uid())
  );

  -- subscriptions
  drop policy if exists "Anyone can view active subscriptions" on subscriptions;
  create policy "Anyone can view active subscriptions" on subscriptions for select using (is_active = true);
  drop policy if exists "Owners can manage subscriptions" on subscriptions;
  create policy "Owners can manage subscriptions" on subscriptions for all using (
    exists (select 1 from stores where stores.id = subscriptions.store_id and stores.owner_id = auth.uid())
  );

end $$;

-- ============================================================
-- 15. REALTIME pour les nouvelles tables importantes
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'reservations') then
    alter publication supabase_realtime add table reservations;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'tickets') then
    alter publication supabase_realtime add table tickets;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'store_modules') then
    alter publication supabase_realtime add table store_modules;
  end if;
end $$;

-- Fin de la migration ✅
