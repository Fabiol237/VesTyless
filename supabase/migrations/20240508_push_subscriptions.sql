begin;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  unique(user_id, subscription)
);

alter table public.push_subscriptions enable row level security;

create policy "Users can manage their own subscriptions"
  on public.push_subscriptions
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant all on public.push_subscriptions to authenticated;

commit;
