-- ==========================================
-- 6. SERVICE PRODUCTS & LINE ITEM METADATA
-- ==========================================
-- Run this migration against existing databases to add:
-- 1. Product type (physical / service / digital)
-- 2. Order item metadata (linkage data)

-- 1. Product type column
alter table public.products add column if not exists type text default 'physical';

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_type_check'
  ) then
    alter table public.products
      add constraint products_type_check check (type in ('physical', 'service', 'digital'));
  end if;
end $$;

-- 2. Order item metadata
alter table public.order_items add column if not exists metadata jsonb default '{}';
