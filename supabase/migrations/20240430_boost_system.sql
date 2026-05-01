-- Migration: Add Boost and Discovery logic

-- 1. Add columns to stores
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='daily_views') then
    alter table stores add column daily_views integer default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='total_views') then
    alter table stores add column total_views integer default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='is_boosted') then
    alter table stores add column is_boosted boolean default false;
  end if;
end $$;

-- 2. Add columns to products
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='daily_views') then
    alter table products add column daily_views integer default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='total_views') then
    alter table products add column total_views integer default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='is_boosted') then
    alter table products add column is_boosted boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='is_promo') then
    alter table products add column is_promo boolean default false;
  end if;
end $$;

-- 3. Functions to increment views
create or replace function increment_product_view(prod_id uuid)
returns void as $$
begin
  update products 
  set daily_views = daily_views + 1,
      total_views = total_views + 1
  where id = prod_id;
end;
$$ language plpgsql security definer;

create or replace function increment_store_view(st_id uuid)
returns void as $$
begin
  update stores 
  set daily_views = daily_views + 1,
      total_views = total_views + 1
  where id = st_id;
end;
$$ language plpgsql security definer;

-- 4. Function to reset daily views
create or replace function reset_daily_stats()
returns void as $$
begin
  update products set daily_views = 0;
  update stores set daily_views = 0;
end;
$$ language plpgsql security definer;

-- 5. Discovery Score Functions (for efficient sorting)
create or replace function get_discovery_products()
returns setof products as $$
begin
  return query
  select * from products
  where is_active = true
  order by 
    (case when is_boosted then 10000 else 0 end) +
    (case when is_promo then 5000 else 0 end) +
    (daily_views * 50) +
    (floor(random() * 1000)) desc;
end;
$$ language plpgsql security definer;

create or replace function get_discovery_stores()
returns setof stores as $$
begin
  return query
  select * from stores
  order by 
    (case when is_boosted then 10000 else 0 end) +
    (daily_views * 50) +
    (floor(random() * 1000)) desc;
end;
$$ language plpgsql security definer;
