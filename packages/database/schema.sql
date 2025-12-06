-- 1. Stores: Who owns what?
create table stores (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  owner_id uuid references auth.users not null, -- Links to Supabase Auth
  subdomain text unique not null,               -- e.g. "bob-hoodies"
  custom_domain text unique,                    -- e.g. "bobhoodies.com"
  name text not null
);

-- 2. Pages: The "Visual Config" for the Dynamic Renderer
create table store_pages (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  slug text not null,                           -- e.g. "home", "about"
  layout_config jsonb default '[]'::jsonb,      -- THE MAGIC COLUMN
  published boolean default false,
  unique(store_id, slug)
);

-- 3. Products (Simplified)
create table products (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) not null,
  title text not null,
  price integer not null, -- stored in cents
  image_url text
);

-- 4. Enable RLS
alter table stores enable row level security;
alter table store_pages enable row level security;
alter table products enable row level security;

-- 5. Policies

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
