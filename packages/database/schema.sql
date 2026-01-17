-- ==========================================
-- 1. EXTENSIONS
-- ==========================================
create extension if not exists vector;

-- ==========================================
-- 2. TABLES
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

-- Knowledge Base (AI)
create table if not exists public.knowledge_items (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  content text not null,
  metadata jsonb default '{}',
  embedding vector(768),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

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

-- Task Tags
create table if not exists public.store_task_tags (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  name text not null,
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
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

-- ==========================================
-- 3. INDEXES
-- ==========================================
create index if not exists knowledge_items_embedding_idx on public.knowledge_items 
using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create index if not exists content_packets_store_type_idx on public.content_packets(store_id, type);
create index if not exists idx_content_items_data on public.content_items using gin (data);
create index if not exists idx_content_items_references on public.content_items using gin ("references");

-- ==========================================
-- 4. RLS ENABLE
-- ==========================================
alter table public.stores enable row level security;
alter table public.profiles enable row level security;
alter table public.store_collaborators enable row level security;
alter table public.store_pages enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.collections enable row level security;
alter table public.product_collections enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.store_email_domains enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.planner_tasks enable row level security;
alter table public.carts enable row level security;
alter table public.store_task_tags enable row level security;
alter table public.content_packets enable row level security;
alter table public.content_models enable row level security;
alter table public.content_items enable row level security;

-- ==========================================
-- 5. FUNCTIONS
-- ==========================================

-- Check if user has access to a store
drop function if exists public.has_store_access(uuid, text) cascade;
create or replace function public.has_store_access(check_store_id uuid, required_role text default 'viewer')
returns boolean
language plpgsql
security definer
as $$
begin
  -- Check if owner
  if exists (select 1 from public.stores where id = check_store_id and owner_id = auth.uid()) then
    return true;
  end if;

  -- Check if collaborator
  if exists (
    select 1 from public.store_collaborators 
    where store_id = check_store_id 
    and user_id = auth.uid()
    and (
      required_role = 'viewer'
      or (required_role = 'editor' and role = 'editor')
    )
  ) then
    return true;
  end if;

  return false;
end;
$$;

-- Get User ID from Email
drop function if exists public.get_user_id_by_email(text);
create or replace function public.get_user_id_by_email(email_param text)
returns uuid
language plpgsql
security definer
as $$
declare ret_id uuid;
begin
  select id into ret_id from auth.users where email = email_param;
  return ret_id;
end;
$$;

-- Securely add/update collaborators
drop function if exists public.add_store_collaborator(uuid, uuid, text);
create or replace function public.add_store_collaborator(target_store_id uuid, target_user_id uuid, target_role text)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.stores where id = target_store_id and owner_id = auth.uid()) then
    raise exception 'Unauthorized: Only the store owner can manage the team.';
  end if;

  insert into public.store_collaborators (store_id, user_id, role)
  values (target_store_id, target_user_id, target_role)
  on conflict (store_id, user_id) 
  do update set role = target_role;
end;
$$;

-- Get collaborators with profiles
drop function if exists public.get_store_collaborators_with_meta(uuid);
create or replace function public.get_store_collaborators_with_meta(store_id_param uuid)
returns table (
  id uuid,
  user_id uuid,
  role text,
  email varchar,
  first_name text,
  last_name text,
  avatar_url text
)
language plpgsql
security definer
as $$
begin
  return query
  select
    sc.id, sc.user_id, sc.role,
    au.email::varchar,
    p.first_name, p.last_name, p.avatar_url
  from public.store_collaborators sc
  join auth.users au on sc.user_id = au.id
  left join public.profiles p on sc.user_id = p.id
  where sc.store_id = store_id_param;
end;
$$;

-- Get stores the user has access to
drop function if exists public.get_my_stores();
create or replace function public.get_my_stores()
returns table (
  id uuid,
  created_at timestamptz,
  owner_id uuid,
  subdomain text,
  custom_domain text,
  name text,
  theme text,
  colors jsonb,
  logo_url text,
  favicon_url text,
  is_visible boolean,
  stripe_account_id text,
  stripe_details_submitted boolean,
  currency text,
  header_config jsonb,
  footer_config jsonb,
  developer_mode boolean
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  return query
  select 
    s.id,
    s.created_at,
    s.owner_id,
    s.subdomain,
    s.custom_domain,
    s.name,
    s.theme,
    s.colors,
    s.logo_url,
    s.favicon_url,
    s.is_visible,
    s.stripe_account_id,
    s.stripe_details_submitted,
    s.currency,
    s.header_config,
    s.footer_config,
    s.developer_mode
  from public.stores s
  where (
    s.owner_id = auth.uid()
    or exists (
      select 1 from public.store_collaborators sc 
      where sc.store_id = s.id 
      and sc.user_id = auth.uid()
    )
  )
  and s.is_visible = true;
end;
$$;

-- Debug helper (keep dropped in production)
drop function if exists public.debug_user_access();

-- Public storefront lookup (returns ONLY non-sensitive store fields)
drop function if exists public.get_storefront_store_by_domain(text);
create or replace function public.get_storefront_store_by_domain(host text)
returns table (
  id uuid,
  subdomain text,
  custom_domain text,
  name text,
  theme text,
  colors jsonb,
  logo_url text,
  favicon_url text,
  currency text,
  header_config jsonb,
  footer_config jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  sub text;
begin
  if host like '%.hoodieplatform.com' or host like '%.swatbloc.com' then
    sub := split_part(host, '.', 1);
  else
    sub := null;
  end if;

  return query
  select
    s.id,
    s.subdomain,
    s.custom_domain,
    s.name,
    s.theme,
    s.colors,
    s.logo_url,
    s.favicon_url,
    s.currency,
    s.header_config,
    s.footer_config
  from public.stores s
  where s.is_visible = true
    and (
      (sub is not null and s.subdomain = sub)
      or (sub is null and s.custom_domain = host)
    )
  limit 1;
end;
$$;

-- Allow storefront clients to call this RPC
grant execute on function public.get_storefront_store_by_domain(text) to anon, authenticated;
drop function if exists public.match_knowledge(vector(768), float, int, uuid);
create or replace function public.match_knowledge (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_store_id uuid
)
returns table (id uuid, content text, similarity float)
language plpgsql
as $$
begin
  return query
  select
    ki.id, ki.content,
    1 - (ki.embedding <=> query_embedding) as similarity
  from public.knowledge_items ki
  where 1 - (ki.embedding <=> query_embedding) > match_threshold
  and ki.store_id = filter_store_id
  order by ki.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ==========================================
-- 6. POLICIES
-- ==========================================

-- Helper function to avoid RLS recursion
drop function if exists public.is_collaborator_lookup(uuid, uuid);
create or replace function public.is_collaborator_lookup(_store_id uuid, _user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.store_collaborators 
    where store_id = _store_id 
    and user_id = _user_id
  );
end;
$$;

drop function if exists public.is_editor_lookup(uuid, uuid);
create or replace function public.is_editor_lookup(_store_id uuid, _user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.store_collaborators
    where store_id = _store_id
      and user_id = _user_id
      and role = 'editor'
  );
end;
$$;

-- Stores
drop policy if exists "Public stores viewable" on public.stores;
drop policy if exists "Owners manage own stores" on public.stores;
drop policy if exists "Collaborators view stores" on public.stores;
drop policy if exists "Users can view stores" on public.stores;
drop policy if exists "Owners and editors can update stores" on public.stores;
drop policy if exists "Owners can delete their own stores" on public.stores;
drop policy if exists "Authenticated users can create stores" on public.stores;
drop policy if exists "Enable read access for all users" on public.stores;
drop policy if exists "Anyone can view visible stores" on public.stores;
drop policy if exists "Visible stores are public" on public.stores;
drop policy if exists "Owners can see their own stores" on public.stores;

-- SELECT (Admin/App): Only owners + collaborators, and only visible stores
create policy "Users can view stores"
on public.stores for select
to authenticated
using (
  is_visible = true
  and (
    owner_id = auth.uid()
    or is_collaborator_lookup(id, auth.uid())
  )
);

-- UPDATE: Owner OR Editor
create policy "Owners and editors can update stores"
on public.stores for update
to authenticated
using (
  owner_id = auth.uid() 
  or is_editor_lookup(id, auth.uid())
)
with check (
  -- Owners can update anything (including soft-delete)
  owner_id = auth.uid()
  -- Editors can update only while the store stays visible
  or (is_editor_lookup(id, auth.uid()) and is_visible = true)
);

-- DELETE: Owner Only
create policy "Owners can delete their own stores"
on public.stores for delete
to authenticated
using (
  owner_id = auth.uid()
);

-- INSERT: Any authenticated user can create
create policy "Authenticated users can create stores"
on public.stores for insert
to authenticated
with check (
  owner_id = auth.uid()
);

-- Profiles
drop policy if exists "Public profiles viewable" on public.profiles;
create policy "Public profiles viewable" on public.profiles for select using (true);

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile" on public.profiles for all using (id = auth.uid());

-- Store Collaborators
drop policy if exists "View collaborators" on public.store_collaborators;
create policy "View collaborators" on public.store_collaborators for select to authenticated 
using (has_store_access(store_id) or user_id = auth.uid());

drop policy if exists "Owners manage collaborators" on public.store_collaborators;
create policy "Owners manage collaborators" on public.store_collaborators for all to authenticated
using (
  exists (
    select 1 from public.stores 
    where stores.id = store_collaborators.store_id 
    and stores.owner_id = auth.uid()
  )
);

-- Pages / Products / Collections
drop policy if exists "Public viewable" on public.store_pages;
create policy "Public viewable" on public.store_pages for select using (true);
drop policy if exists "Public viewable" on public.products;
create policy "Public viewable" on public.products for select using (true);
drop policy if exists "Public viewable" on public.collections;
create policy "Public viewable" on public.collections for select using (true);

drop policy if exists "Admins manage content" on public.store_pages;
create policy "Admins manage content" on public.store_pages for all to authenticated using (has_store_access(store_id, 'editor'));
drop policy if exists "Admins manage content" on public.products;
create policy "Admins manage content" on public.products for all to authenticated using (has_store_access(store_id, 'editor'));
drop policy if exists "Admins manage content" on public.collections;
create policy "Admins manage content" on public.collections for all to authenticated using (has_store_access(store_id, 'editor'));

-- Product Variants
drop policy if exists "Public viewable" on public.product_variants;
create policy "Public viewable" on public.product_variants for select using (true);
drop policy if exists "Admins manage variants" on public.product_variants;
create policy "Admins manage variants" on public.product_variants for all to authenticated using (
  exists (
    select 1 from public.products
    where products.id = product_variants.product_id
    and has_store_access(products.store_id, 'editor')
  )
);

-- Product Collections
drop policy if exists "Public viewable" on public.product_collections;
create policy "Public viewable" on public.product_collections for select using (true);
drop policy if exists "Admins manage product collections" on public.product_collections;
create policy "Admins manage product collections" on public.product_collections for all to authenticated using (
  exists (
    select 1 from public.products
    where products.id = product_collections.product_id
    and has_store_access(products.store_id, 'editor')
  )
);

-- Order Items
drop policy if exists "Admins manage order items" on public.order_items;
create policy "Admins manage order items" on public.order_items for all to authenticated using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and has_store_access(orders.store_id, 'editor')
  )
);

-- Email Domains
drop policy if exists "Admins manage email domains" on public.store_email_domains;
create policy "Admins manage email domains" on public.store_email_domains for all to authenticated using (has_store_access(store_id, 'editor'));

-- Task Tags
drop policy if exists "Member view tags" on public.store_task_tags;
create policy "Member view tags" on public.store_task_tags for select to authenticated using (has_store_access(store_id));
drop policy if exists "Admins manage tags" on public.store_task_tags;
create policy "Admins manage tags" on public.store_task_tags for all to authenticated using (has_store_access(store_id, 'editor'));

-- Customers / Orders
drop policy if exists "Admins manage sales" on public.customers;
create policy "Admins manage sales" on public.customers for all to authenticated using (has_store_access(store_id, 'editor'));
drop policy if exists "Admins manage sales" on public.orders;
create policy "Admins manage sales" on public.orders for all to authenticated using (has_store_access(store_id, 'editor'));

-- Knowledge Base
drop policy if exists "View knowledge" on public.knowledge_items;
create policy "View knowledge" on public.knowledge_items for select using (has_store_access(store_id));
drop policy if exists "Manage knowledge" on public.knowledge_items;
create policy "Manage knowledge" on public.knowledge_items for all to authenticated using (has_store_access(store_id, 'editor'));

-- Member planner access
drop policy if exists "Member planner access" on public.planner_tasks;
create policy "Member planner access" on public.planner_tasks for all to authenticated using (has_store_access(store_id));

-- Carts
drop policy if exists "Public viewable" on public.carts;
create policy "Public viewable" on public.carts for select using (true);
drop policy if exists "Public insert" on public.carts;
create policy "Public insert" on public.carts for insert with check (true);
drop policy if exists "Public update" on public.carts;
create policy "Public update" on public.carts for update using (true);

-- Content Packets
drop policy if exists "Public viewable" on public.content_packets;
create policy "Public viewable" on public.content_packets for select using (true);
drop policy if exists "Manage content packets" on public.content_packets;
create policy "Manage content packets" on public.content_packets for all to authenticated using (has_store_access(store_id, 'editor'));

-- Content Models
drop policy if exists "Public viewable" on public.content_models;
create policy "Public viewable" on public.content_models for select using (true);
drop policy if exists "Manage content models" on public.content_models;
create policy "Manage content models" on public.content_models for all to authenticated using (has_store_access(store_id, 'editor'));

-- Content Items
drop policy if exists "Public viewable" on public.content_items;
create policy "Public viewable" on public.content_items for select using (true);
drop policy if exists "Manage content items" on public.content_items;
create policy "Manage content items" on public.content_items for all to authenticated using (has_store_access(store_id, 'editor'));
