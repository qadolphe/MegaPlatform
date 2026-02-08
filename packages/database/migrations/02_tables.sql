-- ==========================================
-- 2. TABLES
-- ==========================================

-- ==========================================
-- CORE: Stores & Users
-- ==========================================

-- Stores
create table if not exists public.stores (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  owner_id uuid references auth.users not null,
  subdomain text unique not null,
  custom_domain text unique,
  name text not null,
  theme text default 'simple',
  colors jsonb default '{"primary": "#000000", "secondary": "#ffffff", "accent": "#3b82f6", "background": "#ffffff", "text": "#000000"}'::jsonb,
  logo_url text,
  favicon_url text,
  is_visible boolean not null default true,
  stripe_account_id text,
  stripe_details_submitted boolean default false,
  currency text default 'usd',
  header_config jsonb default '{}'::jsonb,
  footer_config jsonb default '{}'::jsonb,
  developer_mode boolean default false,
  stripe_account_id_test text,
  stripe_details_submitted_test boolean default false,
  plan text default 'free',
  subscription_status text default 'active'
);

-- Keep existing DBs aligned (idempotent)
alter table public.stores alter column is_visible set default true;
update public.stores set is_visible = true where is_visible is null;
alter table public.stores alter column is_visible set not null;

-- Profiles (Global)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  avatar_url text, 
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Store Collaborators
create table if not exists public.store_collaborators (
  id uuid not null default gen_random_uuid (),
  store_id uuid not null references public.stores (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'editor', -- 'owner', 'editor', 'viewer'
  created_at timestamp with time zone not null default now(),
  primary key (id),
  unique (store_id, user_id)
);

-- Store Pages
create table if not exists public.store_pages (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  name text,
  slug text not null,
  layout_config jsonb default '[]'::jsonb,
  published boolean default false,
  is_home boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(store_id, slug)
);

-- ==========================================
-- COMMERCE: Products & Variants
-- ==========================================

-- Products
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  title text not null,
  slug text not null,
  description text,
  price integer not null default 0,
  compare_at_price integer,
  images text[] default '{}',
  category text,
  sku text,
  barcode text,
  inventory_quantity integer default 0,
  weight numeric,
  weight_unit text default 'kg',
  options jsonb default '[]'::jsonb,
  metafields jsonb default '[]'::jsonb,
  published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(store_id, slug)
);

-- Product Variants
create table if not exists public.product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  title text not null,
  sku text,
  price integer not null,
  inventory_quantity integer default 0,
  options jsonb default '{}'::jsonb,
  description text,
  image_url text,
  images text[] default '{}'
);

-- Collections
create table if not exists public.collections (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  title text not null,
  slug text not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(store_id, slug)
);

-- Product <-> Collection Junction
create table if not exists public.product_collections (
  product_id uuid references public.products(id) on delete cascade not null,
  collection_id uuid references public.collections(id) on delete cascade not null,
  primary key (product_id, collection_id)
);

-- Add image_key to products
alter table public.products add column if not exists image_key text;

-- Add fulfillment_pipeline to products (Steps Engine)
alter table public.products add column if not exists fulfillment_pipeline jsonb default '[]';

-- ==========================================
-- COMMERCE: Customers & Orders
-- ==========================================

-- Customers
create table if not exists public.customers (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  metafields jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(store_id, email)
);

-- Orders
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete set null,
  stripe_checkout_session_id text, 
  stripe_payment_intent_id text,
  subtotal_amount integer not null,
  shipping_amount integer default 0,
  tax_amount integer default 0,
  total_amount integer not null,
  currency text default 'usd',
  status text default 'pending',
  payment_status text default 'unpaid',
  fulfillment_status text default 'unfulfilled',
  shipping_address jsonb,
  billing_address jsonb,
  metafields jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Order Items
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer not null default 1,
  price_at_purchase integer not null,
  product_name text not null,
  variant_name text,
  image_url text
);

-- Add step tracking to order_items (Steps Engine)
alter table public.order_items add column if not exists current_step_id text;
alter table public.order_items add column if not exists step_history jsonb default '[]';

-- Carts
create table if not exists public.carts (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  items jsonb default '[]'::jsonb,
  subtotal integer default 0,
  currency text default 'usd',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- INTEGRATIONS: API Keys, Webhooks, Email
-- ==========================================

-- API Keys
create table if not exists public.api_keys (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  public_key text unique not null,
  secret_key text,
  name text,
  is_active boolean default true,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Webhook Subscriptions
create table if not exists public.webhook_subscriptions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade not null,
  url text not null,
  events text[] not null default '{}',
  secret_key text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Email Domains
create table if not exists public.store_email_domains (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  domain text not null,
  resend_domain_id text not null,
  status text default 'pending',
  dns_records jsonb,
  created_at timestamp with time zone default now()
);

-- ==========================================
-- CONTENT: CMS, Knowledge Base, Media
-- ==========================================

-- Custom Content Models (The Schema Definition)
create table if not exists public.content_models (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  name text not null,
  slug text not null,
  schema jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(store_id, slug)
);

-- Custom Content Items (The Data)
create table if not exists public.content_items (
  id uuid default gen_random_uuid() primary key,
  model_id uuid references public.content_models(id) on delete cascade not null,
  store_id uuid references public.stores(id) on delete cascade not null,
  data jsonb not null default '{}'::jsonb,
  "references" text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Content Packets
create table if not exists public.content_packets (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  type text not null,
  name text not null,
  data jsonb not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Knowledge Base (AI)
create table if not exists public.knowledge_items (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  content text not null,
  metadata jsonb default '{}',
  embedding vector(768),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Media Assets (Content Library)
create table if not exists public.media_assets (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  filename text not null,
  content_type text,
  size integer,
  storage_key text not null,
  alt_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- PLANNER: Tasks & Tags
-- ==========================================

-- Planner Tasks
create table if not exists public.planner_tasks (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  assignee_id uuid references auth.users,
  due_date timestamp with time zone,
  tag_ids uuid[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Task Tags
create table if not exists public.store_task_tags (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  name text not null,
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
