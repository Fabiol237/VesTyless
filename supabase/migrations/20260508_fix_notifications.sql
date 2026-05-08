-- Mise à jour de la table notifications pour le dashboard vendeur
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='notifications' and column_name='store_id') then
    alter table notifications add column store_id uuid references stores(id) on delete cascade;
  end if;
end $$;

-- Mise à jour de la contrainte de type
alter table notifications drop constraint if exists notifications_type_check;
alter table notifications add constraint notifications_type_check 
check (type in ('order_placed', 'order_shipped', 'order_delivered', 'review_added', 'new_follower', 'promotional', 'stock_alert', 'daily_pulse'));

-- Politique RLS pour permettre aux vendeurs de voir les notifications de leur boutique
drop policy if exists "Vendors can view their store notifications" on notifications;
create policy "Vendors can view their store notifications" on notifications 
for select using (
  exists (select 1 from stores where stores.id = notifications.store_id and stores.owner_id = auth.uid())
);
