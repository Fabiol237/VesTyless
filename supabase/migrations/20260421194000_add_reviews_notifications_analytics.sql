-- Add missing tables for: reviews, notifications, product views (analytics), and order status tracking

-- 1. REVIEWS TABLE (for product ratings and comments)
create table if not exists reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade not null,
  order_id uuid references orders(id) on delete cascade,
  reviewer_id uuid references profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(product_id, reviewer_id, order_id)
);

-- 2. NOTIFICATIONS TABLE (for real-time alerts)
create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('order_placed', 'order_shipped', 'order_delivered', 'review_added', 'new_follower', 'promotional')),
  title text not null,
  message text,
  related_order_id uuid references orders(id) on delete cascade,
  related_product_id uuid references products(id) on delete cascade,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PRODUCT VIEWS TABLE (for analytics: track product views by vendor)
create table if not exists product_views (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade not null,
  viewer_id uuid references profiles(id) on delete set null,
  view_date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. VENDOR ANALYTICS TABLE (aggregated metrics for dashboard)
create table if not exists vendor_analytics (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  date date default current_date,
  total_views integer default 0,
  total_orders integer default 0,
  total_revenue decimal(12,2) default 0.00,
  average_rating decimal(3,2),
  unique(store_id, date)
);

-- 5. IMPROVE ORDERS TABLE - Add missing fields
alter table if exists orders add column if not exists user_id uuid references profiles(id) on delete set null;
alter table if exists orders add column if not exists tracking_number text;
alter table if exists orders add column if not exists paid_at timestamp with time zone;
alter table if exists orders add column if not exists shipped_at timestamp with time zone;
alter table if exists orders add column if not exists delivered_at timestamp with time zone;
alter table if exists orders add column if not exists payment_method text check (payment_method in ('credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'));
alter table if exists orders add column if not exists notes text;

-- 6. ENABLE RLS ON NEW TABLES
alter table reviews enable row level security;
alter table notifications enable row level security;
alter table product_views enable row level security;
alter table vendor_analytics enable row level security;

-- 7. RLS POLICIES FOR REVIEWS
drop policy if exists "Anyone can view reviews" on reviews;
create policy "Anyone can view reviews" on reviews for select using (true);

drop policy if exists "Users can create reviews for their purchases" on reviews;
create policy "Users can create reviews for their purchases" on reviews for insert with check (auth.uid() = reviewer_id);

drop policy if exists "Users can update their own reviews" on reviews;
create policy "Users can update their own reviews" on reviews for update using (auth.uid() = reviewer_id);

-- 8. RLS POLICIES FOR NOTIFICATIONS
drop policy if exists "Users can view their own notifications" on notifications;
create policy "Users can view their own notifications" on notifications for select using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on notifications;
create policy "Users can update their own notifications" on notifications for update using (auth.uid() = user_id);

-- 9. RLS POLICIES FOR PRODUCT VIEWS (mostly internal)
drop policy if exists "Anyone can insert product views" on product_views;
create policy "Anyone can insert product views" on product_views for insert with check (true);

-- 10. RLS POLICIES FOR VENDOR ANALYTICS
drop policy if exists "Vendors can view their own analytics" on vendor_analytics;
create policy "Vendors can view their own analytics" on vendor_analytics for select using (
  exists (select 1 from stores where stores.id = store_id and stores.owner_id = auth.uid())
);

-- 11. CREATE INDEXES FOR PERFORMANCE
create index if not exists idx_reviews_product_id on reviews(product_id);
create index if not exists idx_reviews_reviewer_id on reviews(reviewer_id);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_created_at on notifications(created_at);
create index if not exists idx_product_views_product_id on product_views(product_id);
create index if not exists idx_product_views_view_date on product_views(view_date);
create index if not exists idx_vendor_analytics_store_id on vendor_analytics(store_id);
create index if not exists idx_vendor_analytics_date on vendor_analytics(date);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_store_id on orders(store_id);

-- 12. UPDATE ORDERS CONSTRAINT
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'awaiting_payment'));
