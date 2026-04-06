-- ==========================================
-- 4. FUNCTIONS
-- ==========================================
-- Security-definer functions live in the `internal` schema (not exposed via Data API).
-- Thin public wrappers (security invoker) delegate to internal so existing app code
-- calling public.get_my_stores() etc. continues to work without changes.

-- ==========================================
-- INTERNAL SCHEMA
-- ==========================================
create schema if not exists internal;
grant usage on schema internal to authenticated, anon;

-- ==========================================
-- ACCESS CONTROL FUNCTIONS (internal)
-- ==========================================

create or replace function internal.has_store_access(check_store_id uuid, required_role text default 'viewer')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.stores where id = check_store_id and owner_id = auth.uid()) then
    return true;
  end if;

  if exists (
    select 1 from public.store_collaborators
    where store_id = check_store_id
    and user_id = auth.uid()
    and (
      required_role = 'viewer'
      or (required_role = 'editor' and role = 'editor')
    )
  ) then
    return true;
  end if;

  return false;
end;
$$;

create or replace function internal.is_collaborator_lookup(_store_id uuid, _user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.store_collaborators
    where store_id = _store_id
    and user_id = _user_id
  );
end;
$$;

create or replace function internal.is_editor_lookup(_store_id uuid, _user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.store_collaborators
    where store_id = _store_id
      and user_id = _user_id
      and role = 'editor'
  );
end;
$$;

-- ==========================================
-- USER & COLLABORATOR FUNCTIONS (internal)
-- ==========================================

create or replace function internal.get_user_id_by_email(email_param text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare ret_id uuid;
begin
  select id into ret_id from auth.users where email = email_param;
  return ret_id;
end;
$$;

create or replace function internal.add_store_collaborator(target_store_id uuid, target_user_id uuid, target_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.stores where id = target_store_id and owner_id = auth.uid()) then
    raise exception 'Unauthorized: Only the store owner can manage the team.';
  end if;

  insert into public.store_collaborators (store_id, user_id, role)
  values (target_store_id, target_user_id, target_role)
  on conflict (store_id, user_id)
  do update set role = target_role;
end;
$$;

create or replace function internal.get_store_collaborators_with_meta(store_id_param uuid)
returns table (
  id uuid,
  user_id uuid,
  role text,
  email varchar,
  first_name text,
  last_name text,
  avatar_url text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    sc.id, sc.user_id, sc.role,
    au.email::varchar,
    p.first_name, p.last_name, p.avatar_url
  from public.store_collaborators sc
  join auth.users au on sc.user_id = au.id
  left join public.profiles p on sc.user_id = p.id
  where sc.store_id = store_id_param;
end;
$$;

-- ==========================================
-- STORE LOOKUP FUNCTIONS (internal)
-- ==========================================

create or replace function internal.get_my_stores()
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
begin
  return query
  select
    s.id, s.created_at, s.owner_id, s.subdomain, s.custom_domain,
    s.name, s.theme, s.colors, s.logo_url, s.favicon_url,
    s.is_visible, s.stripe_account_id, s.stripe_details_submitted,
    s.currency, s.header_config, s.footer_config, s.developer_mode
  from public.stores s
  where (
    s.owner_id = auth.uid()
    or exists (
      select 1 from public.store_collaborators sc
      where sc.store_id = s.id
      and sc.user_id = auth.uid()
    )
  )
  and s.is_visible = true;
end;
$$;

create or replace function internal.get_storefront_store_by_domain(host text)
returns table (
  id uuid,
  subdomain text,
  custom_domain text,
  name text,
  theme text,
  colors jsonb,
  logo_url text,
  favicon_url text,
  currency text,
  header_config jsonb,
  footer_config jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  sub text;
begin
  if host like '%.hoodieplatform.com' or host like '%.swatbloc.com' then
    sub := split_part(host, '.', 1);
  else
    sub := null;
  end if;

  return query
  select
    s.id, s.subdomain, s.custom_domain, s.name, s.theme, s.colors,
    s.logo_url, s.favicon_url, s.currency, s.header_config, s.footer_config
  from public.stores s
  where s.is_visible = true
    and (
      (sub is not null and s.subdomain = sub)
      or (sub is null and s.custom_domain = host)
    )
  limit 1;
end;
$$;

-- Grant execute on internal functions
grant execute on all functions in schema internal to authenticated;
grant execute on function internal.get_storefront_store_by_domain(text) to anon, authenticated;

-- ==========================================
-- PUBLIC WRAPPERS (security invoker, delegate to internal)
-- ==========================================

create or replace function public.has_store_access(check_store_id uuid, required_role text default 'viewer')
returns boolean language sql security invoker set search_path = public as $$
  select internal.has_store_access(check_store_id, required_role);
$$;

create or replace function public.is_collaborator_lookup(_store_id uuid, _user_id uuid)
returns boolean language sql security invoker set search_path = public as $$
  select internal.is_collaborator_lookup(_store_id, _user_id);
$$;

create or replace function public.is_editor_lookup(_store_id uuid, _user_id uuid)
returns boolean language sql security invoker set search_path = public as $$
  select internal.is_editor_lookup(_store_id, _user_id);
$$;

create or replace function public.get_user_id_by_email(email_param text)
returns uuid language sql security invoker set search_path = public as $$
  select internal.get_user_id_by_email(email_param);
$$;

create or replace function public.add_store_collaborator(target_store_id uuid, target_user_id uuid, target_role text)
returns void language sql security invoker set search_path = public as $$
  select internal.add_store_collaborator(target_store_id, target_user_id, target_role);
$$;

create or replace function public.get_store_collaborators_with_meta(store_id_param uuid)
returns table (id uuid, user_id uuid, role text, email varchar, first_name text, last_name text, avatar_url text)
language sql security invoker set search_path = public as $$
  select * from internal.get_store_collaborators_with_meta(store_id_param);
$$;

create or replace function public.get_my_stores()
returns table (id uuid, created_at timestamptz, owner_id uuid, subdomain text, custom_domain text, name text, theme text, colors jsonb, logo_url text, favicon_url text, is_visible boolean, stripe_account_id text, stripe_details_submitted boolean, currency text, header_config jsonb, footer_config jsonb, developer_mode boolean)
language sql security invoker set search_path = public as $$
  select * from internal.get_my_stores();
$$;

create or replace function public.get_storefront_store_by_domain(host text)
returns table (id uuid, subdomain text, custom_domain text, name text, theme text, colors jsonb, logo_url text, favicon_url text, currency text, header_config jsonb, footer_config jsonb)
language sql security invoker set search_path = public as $$
  select * from internal.get_storefront_store_by_domain(host);
$$;

grant execute on function public.get_storefront_store_by_domain(text) to anon, authenticated;

-- ==========================================
-- AI / KNOWLEDGE FUNCTIONS
-- ==========================================

drop function if exists public.match_knowledge(vector(768), float, int, uuid);
create or replace function public.match_knowledge (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_store_id uuid
)
returns table (id uuid, content text, similarity float)
language plpgsql
set search_path = public
as $$
begin
  return query
  select
    ki.id, ki.content,
    1 - (ki.embedding <=> query_embedding) as similarity
  from public.knowledge_items ki
  where 1 - (ki.embedding <=> query_embedding) > match_threshold
  and ki.store_id = filter_store_id
  order by ki.embedding <=> query_embedding
  limit match_count;
end;
$$;
