-- Migration: Add content_packets table
-- Run this on your Supabase database

create table if not exists content_packets (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  type text not null, -- 'feature', 'testimonial', 'faq', 'text_block'
  name text not null, -- Internal name for selection
  data jsonb not null default '{}', -- Type-specific content
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index for faster lookups by store and type
create index if not exists content_packets_store_type_idx on content_packets(store_id, type);

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
