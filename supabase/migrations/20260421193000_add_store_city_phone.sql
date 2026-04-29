-- Add optional location/contact fields for stores
alter table if exists public.stores
  add column if not exists city text;

alter table if exists public.stores
  add column if not exists phone text;