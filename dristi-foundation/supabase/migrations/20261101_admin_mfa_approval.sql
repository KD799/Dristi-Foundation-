alter table public.profiles
  add column if not exists admin_mfa_enabled boolean not null default false;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and admin_mfa_enabled = true
  )
  and coalesce((select auth.jwt() ->> 'aal') = 'aal2', false);
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
