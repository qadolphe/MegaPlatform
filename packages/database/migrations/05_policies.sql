-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- ==========================================
-- ENABLE RLS ON ALL TABLES
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
alter table public.api_keys enable row level security;
alter table public.store_task_tags enable row level security;
alter table public.content_packets enable row level security;
alter table public.content_models enable row level security;
alter table public.content_items enable row level security;
alter table public.webhook_subscriptions enable row level security;

-- ==========================================
-- STORES POLICIES
-- ==========================================

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

-- ==========================================
-- PROFILES POLICIES
-- ==========================================

drop policy if exists "Public profiles viewable" on public.profiles;
create policy "Public profiles viewable" on public.profiles for select using (true);

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile" on public.profiles for all using (id = auth.uid());

-- ==========================================
-- COLLABORATORS POLICIES
-- ==========================================

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

-- ==========================================
-- CONTENT POLICIES (Pages, Products, Collections)
-- ==========================================

-- Public viewable
drop policy if exists "Public viewable" on public.store_pages;
create policy "Public viewable" on public.store_pages for select using (true);
drop policy if exists "Public viewable" on public.products;
create policy "Public viewable" on public.products for select using (true);
drop policy if exists "Public viewable" on public.collections;
create policy "Public viewable" on public.collections for select using (true);

-- Admin manage
drop policy if exists "Admins manage content" on public.store_pages;
create policy "Admins manage content" on public.store_pages for all to authenticated using (has_store_access(store_id, 'editor'));
drop policy if exists "Admins manage content" on public.products;
create policy "Admins manage content" on public.products for all to authenticated using (has_store_access(store_id, 'editor'));
drop policy if exists "Admins manage content" on public.collections;
create policy "Admins manage content" on public.collections for all to authenticated using (has_store_access(store_id, 'editor'));

-- ==========================================
-- VARIANTS & PRODUCT COLLECTIONS POLICIES
-- ==========================================

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

-- ==========================================
-- ORDERS POLICIES
-- ==========================================

drop policy if exists "Admins manage order items" on public.order_items;
create policy "Admins manage order items" on public.order_items for all to authenticated using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and has_store_access(orders.store_id, 'editor')
  )
);

drop policy if exists "Admins manage sales" on public.customers;
create policy "Admins manage sales" on public.customers for all to authenticated using (has_store_access(store_id, 'editor'));
drop policy if exists "Admins manage sales" on public.orders;
create policy "Admins manage sales" on public.orders for all to authenticated using (has_store_access(store_id, 'editor'));

-- ==========================================
-- INTEGRATIONS POLICIES
-- ==========================================

-- Email Domains
drop policy if exists "Admins manage email domains" on public.store_email_domains;
create policy "Admins manage email domains" on public.store_email_domains for all to authenticated using (has_store_access(store_id, 'editor'));

-- API Keys
drop policy if exists "Admins manage keys" on public.api_keys;
create policy "Admins manage keys" on public.api_keys for all to authenticated using (has_store_access(store_id, 'editor'));

-- Webhooks
drop policy if exists "Admins manage webhooks" on public.webhook_subscriptions;
create policy "Admins manage webhooks" on public.webhook_subscriptions for all to authenticated using (has_store_access(store_id, 'editor'));

-- ==========================================
-- CMS & CONTENT POLICIES
-- ==========================================

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

-- ==========================================
-- AI & PLANNER POLICIES
-- ==========================================

-- Knowledge Base
drop policy if exists "View knowledge" on public.knowledge_items;
create policy "View knowledge" on public.knowledge_items for select using (has_store_access(store_id));
drop policy if exists "Manage knowledge" on public.knowledge_items;
create policy "Manage knowledge" on public.knowledge_items for all to authenticated using (has_store_access(store_id, 'editor'));

-- Planner Tasks
drop policy if exists "Member planner access" on public.planner_tasks;
create policy "Member planner access" on public.planner_tasks for all to authenticated using (has_store_access(store_id));

-- Task Tags
drop policy if exists "Member view tags" on public.store_task_tags;
create policy "Member view tags" on public.store_task_tags for select to authenticated using (has_store_access(store_id));
drop policy if exists "Admins manage tags" on public.store_task_tags;
create policy "Admins manage tags" on public.store_task_tags for all to authenticated using (has_store_access(store_id, 'editor'));

-- ==========================================
-- CART POLICIES (Public Access)
-- ==========================================

drop policy if exists "Public viewable" on public.carts;
create policy "Public viewable" on public.carts for select using (true);
drop policy if exists "Public insert" on public.carts;
create policy "Public insert" on public.carts for insert with check (true);
drop policy if exists "Public update" on public.carts;
create policy "Public update" on public.carts for update using (true);
