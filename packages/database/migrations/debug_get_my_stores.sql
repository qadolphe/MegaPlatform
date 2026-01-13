-- Ensure get_my_stores is absolutely correct and permissive for debugging
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
  curr_user_id := auth.uid();
  -- Return ALL stores for the user (owner or collaborator)
  -- Use DISTINCT to avoid duplicates if user is somehow both (unlikely but safe)
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
  where (s.owner_id = curr_user_id or sc.user_id = curr_user_id)
  -- Temporarily comment out is_visible check to see if that's hiding it
  -- and s.is_visible is not false
  ;
end;
$$;

grant execute on function public.get_my_stores to authenticated;
grant execute on function public.get_my_stores to service_role;
