-- Enable pgvector for embeddings
create extension if not exists vector;

-- 1. Stores: Who owns what?
create table stores (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  owner_id uuid references auth.users not null, -- Links to Supabase Auth
  subdomain text unique not null,               -- e.g. "bob-hoodies"
  custom_domain text unique,                    -- e.g. "bobhoodies.com"
  name text not null,
  theme text default 'simple',                  -- Global animation theme
  colors jsonb default '{"primary": "#000000", "secondary": "#ffffff", "accent": "#3b82f6", "background": "#ffffff", "text": "#000000"}'::jsonb, -- Global color scheme
  logo_url text,                                -- Store Logo URL
  favicon_url text,                             -- Store Favicon URL
  is_visible boolean default true,              -- Soft delete flag
  stripe_account_id text,                       -- Stripe Connect Account ID
  stripe_details_submitted boolean default false,
  currency text default 'usd'
);

-- 2. Pages: The "Visual Config" for the Dynamic Renderer
create table store_pages (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  name text,                                    -- e.g. "Home Page"
  slug text not null,                           -- e.g. "home", "about"
  layout_config jsonb default '[]'::jsonb,      -- THE MAGIC COLUMN
  published boolean default false,
  is_home boolean default false,                -- New: Marks the landing page
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(store_id, slug)
);

-- 3. Products (Expanded)
create table products (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  title text not null,
  slug text not null,
  description text,
  price integer not null default 0, -- Base price in cents
  compare_at_price integer,         -- Original price for sales
  images text[] default '{}',       -- Array of image URLs
  options jsonb default '[]'::jsonb,-- e.g. [{"name": "Size", "values": ["S", "M"]}]
  metafields jsonb default '[]'::jsonb, -- Custom fields e.g. [{"key": "cpu_speed", "label": "CPU Speed", "value": "3.5GHz", "type": "text"}]
  published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(store_id, slug)
);

-- 4. Product Variants
create table product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  title text not null,              -- e.g. "Small / Red"
  sku text,
  price integer not null,           -- Variant specific price
  inventory_quantity integer default 0,
  options jsonb default '{}'::jsonb -- e.g. {"Size": "Small", "Color": "Red"}
);

-- 5. Collections
create table collections (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  title text not null,
  slug text not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(store_id, slug)
);

-- 6. Product <-> Collection Junction
create table product_collections (
  product_id uuid references products(id) on delete cascade not null,
  collection_id uuid references collections(id) on delete cascade not null,
  primary key (product_id, collection_id)
);

-- 7. Customers (Store-specific)
create table customers (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  metafields jsonb default '[]'::jsonb, -- Custom fields e.g. [{"key": "loyalty_tier", "label": "Loyalty Tier", "value": "Gold", "type": "text"}]
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(store_id, email)
);

-- 8. Orders
create table orders (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  customer_id uuid references customers(id) on delete set null,
  
  -- Stripe References
  stripe_checkout_session_id text, 
  stripe_payment_intent_id text,
  
  -- Financials
  subtotal_amount integer not null, -- sum of items
  shipping_amount integer default 0,
  tax_amount integer default 0,
  total_amount integer not null,    -- final charge in cents
  currency text default 'usd',
  
  -- State
  status text default 'pending', -- pending, paid, unfulfilled, fulfilled, cancelled, refunded
  payment_status text default 'unpaid', -- unpaid, paid, failed, refunded
  fulfillment_status text default 'unfulfilled', -- unfulfilled, fulfilled, partial
  
  -- Data Snapshots
  shipping_address jsonb,
  billing_address jsonb,
  metafields jsonb default '[]'::jsonb, -- Custom fields e.g. [{"key": "gift_message", "label": "Gift Message", "value": "Happy Birthday!", "type": "text"}]
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 9. Order Items
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  
  quantity integer not null default 1,
  price_at_purchase integer not null, -- In cents
  
  product_name text not null,
  variant_name text,
  image_url text
);

create table store_email_domains (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  domain text not null,           -- 'bob-hoodies.com'
  resend_domain_id text not null, -- ID from Resend API
  status text default 'pending',  -- 'pending', 'verified', 'failed'
  dns_records jsonb,              -- Store the SPF/DKIM records here to show in UI
  created_at timestamp with time zone default now()
);

-- 10. Enable RLS
alter table stores enable row level security;
alter table store_pages enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table collections enable row level security;
alter table product_collections enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table store_email_domains enable row level security;

-- 11. Policies

-- Stores
create policy "Public stores are viewable by everyone"
on stores for select
to public
using (true);

create policy "Users can create their own stores"
on stores for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "Users can update their own stores"
on stores for update
to authenticated
using (has_store_access(id, 'editor'));

create policy "Users can delete their own stores"
on stores for delete
to authenticated
using (auth.uid() = owner_id);

-- Store Pages
create policy "Public pages are viewable by everyone"
on store_pages for select
to public
using (true);

create policy "Users can manage pages for their stores"
on store_pages for all
to authenticated
using (has_store_access(store_id, 'editor'));

-- Products
create policy "Public products are viewable by everyone"
on products for select
to public
using (true);

create policy "Users can manage products for their stores"
on products for all
to authenticated
using (has_store_access(store_id, 'editor'));

-- Product Variants
create policy "Public variants are viewable by everyone"
on product_variants for select
to public
using (true);

create policy "Users can manage variants for their stores"
on product_variants for all
to authenticated
using (
  exists (
    select 1 from products
    where products.id = product_variants.product_id
    and has_store_access(products.store_id, 'editor')
  )
);

-- Collections
create policy "Public collections are viewable by everyone"
on collections for select
to public
using (true);

create policy "Users can manage collections for their stores"
on collections for all
to authenticated
using (has_store_access(store_id, 'editor'));

-- Product Collections
create policy "Public product collections are viewable by everyone"
on product_collections for select
to public
using (true);

create policy "Users can manage product collections for their stores"
on product_collections for all
to authenticated
using (
  exists (
    select 1 from products
    where products.id = product_collections.product_id
    and has_store_access(products.store_id, 'editor')
  )
);

-- Customers
create policy "Store owners can manage their customers"
on customers for all
to authenticated
using (has_store_access(store_id, 'editor'));

-- Orders
create policy "Store owners can manage their orders"
on orders for all
to authenticated
using (has_store_access(store_id, 'editor'));

-- Order Items
create policy "Store owners can manage their order items"
on order_items for all
to authenticated
using (
  exists (
    select 1 from orders
    where orders.id = order_items.order_id
    and has_store_access(orders.store_id, 'editor')
  )
);

-- 9. Knowledge Base (AI)
create table knowledge_items (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  content text not null,           -- The actual text chunk
  metadata jsonb default '{}',     -- Source url, page number, etc.
  embedding vector(768),           -- Gemini embedding dimension (text-embedding-004)
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index on knowledge_items using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

create or replace function match_knowledge (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_store_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    knowledge_items.id,
    knowledge_items.content,
    1 - (knowledge_items.embedding <=> query_embedding) as similarity
  from knowledge_items
  where 1 - (knowledge_items.embedding <=> query_embedding) > match_threshold
  and knowledge_items.store_id = filter_store_id
  order by knowledge_items.embedding <=> query_embedding
  limit match_count;
end;
$$;

alter table knowledge_items enable row level security;

create policy "Users can view their own store knowledge"
  on knowledge_items for select
  using (has_store_access(store_id, 'viewer'));

create policy "Users can insert their own store knowledge"
  on knowledge_items for insert
  with check (has_store_access(store_id, 'editor'));

create policy "Users can update their own store knowledge"
  on knowledge_items for update
  using (has_store_access(store_id, 'editor'));

create policy "Users can delete their own store knowledge"
  on knowledge_items for delete
  using (has_store_access(store_id, 'editor'));

-- 10. Store Collaborators
create table public.store_collaborators (
  id uuid not null default gen_random_uuid (),
  store_id uuid not null references public.stores (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'editor', -- 'owner', 'editor', 'viewer'
  created_at timestamp with time zone not null default now(),
  primary key (id),
  unique (store_id, user_id)
);

alter table public.store_collaborators enable row level security;

create policy "Owners can view collaborators"
  on public.store_collaborators
  for select
  using (
    exists (
      select 1 from public.stores
      where id = store_collaborators.store_id
      and user_id = auth.uid()
    )
    or user_id = auth.uid()
  );

create policy "Owners can add collaborators"
  on public.store_collaborators
  for insert
  with check (
    exists (
      select 1 from public.stores
      where id = store_collaborators.store_id
      and user_id = auth.uid()
    )
  );

create policy "Owners can remove collaborators"
  on public.store_collaborators
  for delete
  using (
    exists (
      select 1 from public.stores
      where id = store_collaborators.store_id
      and user_id = auth.uid()
    )
  );

-- 12. Helper Functions for Collaboration
create or replace function public.get_user_id_by_email(email_param text)
returns uuid
language plpgsql
security definer
as $$
declare
  ret_id uuid;
begin
  select id into ret_id from auth.users where email = email_param;
  return ret_id;
end;
$$;

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
      required_role = 'viewer' -- viewer role allows access if user has any role
      or (required_role = 'editor' and role = 'editor')
    )
  ) then
    return true;
  end if;

  return false;
end;
$$;

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'site-assets' );

create policy "Authenticated Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'site-assets' );

create policy "Authenticated Delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'site-assets' );

create policy "Owners can manage email domains"
  on store_email_domains for all
  to authenticated
  using (has_store_access(store_id, 'editor'));
-- 7. Planner Tasks
create table planner_tasks (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo', -- 'todo', 'in-progress', 'done'
  priority text default 'medium', -- 'low', 'medium', 'high'
  assignee_id uuid references auth.users,
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Planner
alter table planner_tasks enable row level security;

create policy "Store owners can view planner tasks"
  on planner_tasks for select
  using ( has_store_access(store_id) );

create policy "Store owners can insert planner tasks"
  on planner_tasks for insert
  with check ( has_store_access(store_id) );

create policy "Store owners can update planner tasks"
  on planner_tasks for update
  using ( has_store_access(store_id) );

create policy "Store owners can delete planner tasks"
  on planner_tasks for delete
  using ( has_store_access(store_id) );

-- 11. Content Packets (Reusable Content for Page Builder)
create table content_packets (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  type text not null, -- 'feature', 'testimonial', 'faq', 'text_block'
  name text not null, -- Internal name for selection
  data jsonb not null default '{}', -- Type-specific content
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index for faster lookups by store and type
create index content_packets_store_type_idx on content_packets(store_id, type);

-- RLS for Content Packets
alter table content_packets enable row level security;

create policy "Public content packets are viewable by everyone"
  on content_packets for select
  to public
  using (true);

create policy "Store owners can insert content packets"
  on content_packets for insert
  with check ( has_store_access(store_id, 'editor') );

create policy "Store owners can update content packets"
  on content_packets for update
  using ( has_store_access(store_id, 'editor') );

create policy "Store owners can delete content packets"
  on content_packets for delete
  using ( has_store_access(store_id, 'editor') );
