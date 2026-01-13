-- Fix get_my_stores to ensure collaborators can see stores
-- Also ensure RLS policies are correct for collaborators

drop function if exists public.get_my_stores();

create or replace function public.get_my_stores()
returns table (
  id uuid,
  created_at timestamptz,
  owner_id uuid,
  subdomain text,
  custom_domain text,
  name text,
  theme text,
  colors jsonb,
  logo_url text,
  favicon_url text,
  is_visible boolean,
  stripe_account_id text,
  stripe_details_submitted boolean,
  currency text,
  header_config jsonb,
  footer_config jsonb,
  developer_mode boolean
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  curr_user_id uuid;
begin
  -- Capture user ID safely
  curr_user_id := auth.uid();

  return query
  select distinct
    s.id,
    s.created_at,
    s.owner_id,
    s.subdomain,
    s.custom_domain,
    s.name,
    s.theme,
    s.colors,
    s.logo_url,
    s.favicon_url,
    s.is_visible,
    s.stripe_account_id,
    s.stripe_details_submitted,
    s.currency,
    s.header_config,
    s.footer_config,
    s.developer_mode
  from public.stores s
  left join public.store_collaborators sc on s.id = sc.store_id
  where s.is_visible is not false
  and (
    s.owner_id = curr_user_id
    or sc.user_id = curr_user_id
  );
end;
$$;

grant execute on function public.get_my_stores to authenticated;
grant execute on function public.get_my_stores to service_role;

-- Ensure RLS allows collaborators to view stores
drop policy if exists "Collaborators view stores" on public.stores;
create policy "Collaborators view stores" on public.stores for select to authenticated using (
  has_store_access(id, 'viewer')
);

-- Ensure add_store_collaborator is robust
create or replace function public.add_store_collaborator(target_store_id uuid, target_user_id uuid, target_role text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Check if requester is owner
  if not exists (select 1 from public.stores where id = target_store_id and owner_id = auth.uid()) then
    raise exception 'Unauthorized: Only the store owner can manage the team.';
  end if;

  insert into public.store_collaborators (store_id, user_id, role)
  values (target_store_id, target_user_id, target_role)
  on conflict (store_id, user_id) 
  do update set role = target_role;
end;
$$;
