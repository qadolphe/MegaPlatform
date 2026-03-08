-- ==========================================
-- 9. PAYMENT CAPTURE & CUSTOMER REQUESTS
-- ==========================================

-- Extend payment_status to support manual capture flow
-- Existing values: 'unpaid', 'paid', 'refunded'
-- New values: 'authorized', 'captured', 'failed'
do $$ begin
  -- Drop the old constraint if it exists
  if exists (
    select 1 from pg_constraint where conname = 'orders_payment_status_check'
  ) then
    alter table public.orders drop constraint orders_payment_status_check;
  end if;

  -- Re-create with the full set of values
  alter table public.orders
    add constraint orders_payment_status_check
    check (payment_status in ('unpaid', 'paid', 'authorized', 'captured', 'refunded', 'failed'));
end $$;

-- Generic table for customer requests (domain requests, feature requests, etc.)
create table if not exists public.customer_requests (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade not null,
  type text not null,           -- e.g., 'domain_request', 'feature_request'
  payload jsonb not null,       -- e.g., {"domain": "pacsun.com", "email": "user@mail.com"}
  status text default 'pending',
  created_at timestamp with time zone default now()
);
