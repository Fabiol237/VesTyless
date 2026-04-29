-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. ENSURE TABLES EXIST (Idempotent)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists stores (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  theme_color text default '#6D28D9',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  slug text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(store_id, slug)
);

create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price decimal(12,2) not null default 0.00,
  image_url text,
  stock_quantity integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  total_amount decimal(12,2) not null,
  status text default 'pending',
  order_items jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ENSURE COLUMNS EXIST (Maintenance Section)
do $$
begin
  -- STORES new columns
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='secondary_color') then
    alter table stores add column secondary_color text default '#F3F4F6';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='banner_url') then
    alter table stores add column banner_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='city') then
    alter table stores add column city text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='phone') then
    alter table stores add column phone text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='font_family') then
    alter table stores add column font_family text default 'Inter';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='custom_message') then
    alter table stores add column custom_message text;
  end if;

  -- ORDERS new columns
  if not exists (select 1 from information_schema.columns where table_name='orders' and column_name='delivery_lat') then
    alter table orders add column delivery_lat decimal(9,6);
  end if;
  if not exists (select 1 from information_schema.columns where table_name='orders' and column_name='delivery_lng') then
    alter table orders add column delivery_lng decimal(9,6);
  end if;
  if not exists (select 1 from information_schema.columns where table_name='orders' and column_name='delivery_agent_id') then
    alter table orders add column delivery_agent_id uuid references profiles(id);
  end if;
end $$;

-- Update status check (Always refresh)
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));

-- 3. CREATE NEW FEATURE TABLES
create table if not exists cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

create table if not exists delivery_tracking (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  lat decimal(9,6) not null,
  lng decimal(9,6) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. POLICIES (Idempotent)
alter table profiles enable row level security;
alter table stores enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table cart_items enable row level security;
alter table delivery_tracking enable row level security;

do $$
begin
  drop policy if exists "Users can view their own profile" on profiles;
  create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
  
  drop policy if exists "Users can update their own profile" on profiles;
  create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

  drop policy if exists "Anyone can view stores" on stores;
  create policy "Anyone can view stores" on stores for select using (true);

  drop policy if exists "Owners can manage their stores" on stores;
  create policy "Owners can manage their stores" on stores for all using (auth.uid() = owner_id);

  drop policy if exists "Anyone can view categories" on categories;
  create policy "Anyone can view categories" on categories for select using (true);

  drop policy if exists "Owners can manage categories" on categories;
  create policy "Owners can manage categories" on categories for all using (
    exists (select 1 from stores where stores.id = categories.store_id and stores.owner_id = auth.uid())
  );

  drop policy if exists "Anyone can view products" on products;
  create policy "Anyone can view products" on products for select using (true);

  drop policy if exists "Owners can manage products" on products;
  create policy "Owners can manage products" on products for all using (
    exists (select 1 from stores where stores.id = products.store_id and stores.owner_id = auth.uid())
  );

  drop policy if exists "Owners can view orders for their stores" on orders;
  create policy "Owners can view orders for their stores" on orders for select using (
    exists (select 1 from stores where stores.id = orders.store_id and stores.owner_id = auth.uid())
  );

  drop policy if exists "Anyone can create an order" on orders;
  create policy "Anyone can create an order" on orders for insert with check (true);

  drop policy if exists "Users can manage their own cart" on cart_items;
  create policy "Users can manage their own cart" on cart_items for all using (auth.uid() = user_id);

  drop policy if exists "Anyone can view tracking for an order" on delivery_tracking;
  create policy "Anyone can view tracking for an order" on delivery_tracking for select using (true);

  drop policy if exists "Only assigned agents or store owners can update tracking" on delivery_tracking;
  create policy "Only assigned agents or store owners can update tracking" on delivery_tracking for all using (
    exists (
      select 1 from orders
      join stores on stores.id = orders.store_id
      where orders.id = delivery_tracking.order_id 
      and (orders.delivery_agent_id = auth.uid() or stores.owner_id = auth.uid())
    )
  );
end $$;

-- 5. FUNCTIONS & TRIGGERS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. REALTIME
do $$
begin
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'delivery_tracking') then
        alter publication supabase_realtime add table delivery_tracking;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'orders') then
        alter publication supabase_realtime add table orders;
    end if;
end $$;
