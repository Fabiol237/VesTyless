begin;

create extension if not exists pgcrypto;

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid null references auth.users(id) on delete set null,
  customer_name text not null check (char_length(trim(customer_name)) > 0),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_reviews_product_id_created_at
  on public.product_reviews (product_id, created_at desc);

create index if not exists idx_product_reviews_store_id_created_at
  on public.product_reviews (store_id, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  order_id uuid null references public.orders(id) on delete set null,
  type text not null check (char_length(trim(type)) > 0),
  title text not null check (char_length(trim(title)) > 0),
  message text not null check (char_length(trim(message)) > 0),
  is_read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_store_id_created_at
  on public.notifications (store_id, created_at desc);

create index if not exists idx_notifications_store_id_is_read
  on public.notifications (store_id, is_read);

alter table public.product_reviews enable row level security;
alter table public.notifications enable row level security;

do $$
declare
  owner_column text;
begin
  select column_name
  into owner_column
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'stores'
    and column_name in ('owner_id', 'user_id', 'seller_id')
  order by case column_name
    when 'owner_id' then 1
    when 'user_id' then 2
    when 'seller_id' then 3
    else 10
  end
  limit 1;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'product_reviews'
      and policyname = 'product_reviews_select_public'
  ) then
    create policy product_reviews_select_public
      on public.product_reviews
      for select
      to public
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'product_reviews'
      and policyname = 'product_reviews_insert_public'
  ) then
    create policy product_reviews_insert_public
      on public.product_reviews
      for insert
      to public
      with check (
        product_id is not null
        and store_id is not null
        and rating between 1 and 5
        and char_length(trim(customer_name)) > 0
      );
  end if;

  if owner_column is not null then
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'product_reviews'
        and policyname = 'product_reviews_update_store_owner'
    ) then
      execute format(
        'create policy product_reviews_update_store_owner
           on public.product_reviews
           for update
           to authenticated
           using (
             exists (
               select 1
               from public.stores s
               where s.id = product_reviews.store_id
                 and s.%I = auth.uid()
             )
           )
           with check (
             exists (
               select 1
               from public.stores s
               where s.id = product_reviews.store_id
                 and s.%I = auth.uid()
             )
           )',
        owner_column,
        owner_column
      );
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'product_reviews'
        and policyname = 'product_reviews_delete_store_owner'
    ) then
      execute format(
        'create policy product_reviews_delete_store_owner
           on public.product_reviews
           for delete
           to authenticated
           using (
             exists (
               select 1
               from public.stores s
               where s.id = product_reviews.store_id
                 and s.%I = auth.uid()
             )
           )',
        owner_column
      );
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'notifications'
        and policyname = 'notifications_select_store_owner'
    ) then
      execute format(
        'create policy notifications_select_store_owner
           on public.notifications
           for select
           to authenticated
           using (
             exists (
               select 1
               from public.stores s
               where s.id = notifications.store_id
                 and s.%I = auth.uid()
             )
           )',
        owner_column
      );
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'notifications'
        and policyname = 'notifications_insert_store_owner'
    ) then
      execute format(
        'create policy notifications_insert_store_owner
           on public.notifications
           for insert
           to authenticated
           with check (
             exists (
               select 1
               from public.stores s
               where s.id = notifications.store_id
                 and s.%I = auth.uid()
             )
           )',
        owner_column
      );
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'notifications'
        and policyname = 'notifications_update_store_owner'
    ) then
      execute format(
        'create policy notifications_update_store_owner
           on public.notifications
           for update
           to authenticated
           using (
             exists (
               select 1
               from public.stores s
               where s.id = notifications.store_id
                 and s.%I = auth.uid()
             )
           )
           with check (
             exists (
               select 1
               from public.stores s
               where s.id = notifications.store_id
                 and s.%I = auth.uid()
             )
           )',
        owner_column,
        owner_column
      );
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'notifications'
        and policyname = 'notifications_delete_store_owner'
    ) then
      execute format(
        'create policy notifications_delete_store_owner
           on public.notifications
           for delete
           to authenticated
           using (
             exists (
               select 1
               from public.stores s
               where s.id = notifications.store_id
                 and s.%I = auth.uid()
             )
           )',
        owner_column
      );
    end if;
  end if;
end
$$;

grant select, insert on public.product_reviews to anon, authenticated;
grant update, delete on public.product_reviews to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;

do $$
begin
  begin
    alter publication supabase_realtime add table public.product_reviews;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.notifications;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end
$$;

commit;