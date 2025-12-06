
-- 6. Storage Setup (Images)
-- Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

-- Allow public access to view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'site-assets' );

-- Allow authenticated users to upload images
create policy "Authenticated Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'site-assets' );

-- Allow authenticated users to delete images
create policy "Authenticated Delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'site-assets' );
