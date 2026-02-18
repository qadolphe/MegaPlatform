-- Add deleted_at column to orders for soft deletes
alter table public.orders add column if not exists deleted_at timestamp with time zone;

-- Update the status enum (if strictly enforced, though it looks like text)
-- If status was an enum type, we'd need to add 'deleted', but here it is just text default 'pending'.
