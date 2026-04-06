-- ==========================================
-- 3. INDEXES
-- ==========================================

-- Knowledge Base: Vector similarity search
create index if not exists knowledge_items_embedding_idx on public.knowledge_items 
using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Content: Fast lookups
create index if not exists content_packets_store_type_idx on public.content_packets(store_id, type);
create index if not exists idx_content_items_data on public.content_items using gin (data);
create index if not exists idx_content_items_references on public.content_items using gin ("references");

-- Commerce: Store-scoped lookups
create index if not exists idx_orders_store_id on public.orders(store_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_fulfillment_status on public.orders(fulfillment_status);
create index if not exists idx_products_store_id on public.products(store_id);
create index if not exists idx_customers_store_id on public.customers(store_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- Pages & Media
create index if not exists idx_store_pages_store_id on public.store_pages(store_id);
create index if not exists idx_media_assets_store_id on public.media_assets(store_id);

-- Planner
create index if not exists idx_planner_tasks_store_id on public.planner_tasks(store_id);

-- Requests
create index if not exists idx_customer_requests_store_id on public.customer_requests(store_id);
