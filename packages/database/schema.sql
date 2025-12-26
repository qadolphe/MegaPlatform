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
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

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
using (
  exists (
    select 1 from stores
    where stores.id = store_pages.store_id
    and stores.owner_id = auth.uid()
  )
);

-- Products
create policy "Public products are viewable by everyone"
on products for select
to public
using (true);

create policy "Users can manage products for their stores"
on products for all
to authenticated
using (
  exists (
    select 1 from stores
    where stores.id = products.store_id
    and stores.owner_id = auth.uid()
  )
);

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
    join stores on products.store_id = stores.id
    where products.id = product_variants.product_id
    and stores.owner_id = auth.uid()
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
using (
  exists (
    select 1 from stores
    where stores.id = collections.store_id
    and stores.owner_id = auth.uid()
  )
);

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
    join stores on products.store_id = stores.id
    where products.id = product_collections.product_id
    and stores.owner_id = auth.uid()
  )
);

-- Customers
create policy "Store owners can manage their customers"
on customers for all
to authenticated
using (
  exists (
    select 1 from stores
    where stores.id = customers.store_id
    and stores.owner_id = auth.uid()
  )
);

-- Orders
create policy "Store owners can manage their orders"
on orders for all
to authenticated
using (
  exists (
    select 1 from stores
    where stores.id = orders.store_id
    and stores.owner_id = auth.uid()
  )
);

-- Order Items
create policy "Store owners can manage their order items"
on order_items for all
to authenticated
using (
  exists (
    select 1 from orders
    join stores on orders.store_id = stores.id
    where orders.id = order_items.order_id
    and stores.owner_id = auth.uid()
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
  using ( store_id in (select id from stores where owner_id = auth.uid()) );

create policy "Users can insert their own store knowledge"
  on knowledge_items for insert
  with check ( store_id in (select id from stores where owner_id = auth.uid()) );

create policy "Users can update their own store knowledge"
  on knowledge_items for update
  using ( store_id in (select id from stores where owner_id = auth.uid()) );

create policy "Users can delete their own store knowledge"
  on knowledge_items for delete
  using ( store_id in (select id from stores where owner_id = auth.uid()) );

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

-- 11. Storage Setup (Images)
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
  using (
    exists (
      select 1 from stores
      where stores.id = store_email_domains.store_id
      and stores.owner_id = auth.uid()
    )
  );