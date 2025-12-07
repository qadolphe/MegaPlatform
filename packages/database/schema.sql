-- 1. Stores: Who owns what?
create table stores (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  owner_id uuid references auth.users not null, -- Links to Supabase Auth
  subdomain text unique not null,               -- e.g. "bob-hoodies"
  custom_domain text unique,                    -- e.g. "bobhoodies.com"
  name text not null,
  theme text default 'simple'                   -- Global animation theme
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

-- 7. Enable RLS
alter table stores enable row level security;
alter table store_pages enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table collections enable row level security;
alter table product_collections enable row level security;

-- 8. Policies

-- Stores
-- Public Read: Anyone can read stores (needed for storefronts to resolve domains)
create policy "Public stores are viewable by everyone"
on stores for select
to public
using (true);

-- Owner Write: Users can insert their own store
create policy "Users can create their own stores"
on stores for insert
to authenticated
with check (auth.uid() = owner_id);

-- Owner Update: Users can update their own store
create policy "Users can update their own stores"
on stores for update
to authenticated
using (auth.uid() = owner_id);

-- Store Pages
-- Public Read: Anyone can read pages
create policy "Public pages are viewable by everyone"
on store_pages for select
to public
using (true);

-- Owner Write: Users can manage pages for their stores
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
-- Public Read
create policy "Public products are viewable by everyone"
on products for select
to public
using (true);

-- Owner Write
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
