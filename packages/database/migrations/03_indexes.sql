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
