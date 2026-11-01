create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  address text,
  role text not null default 'user' check (role in ('user', 'admin'))
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  image_url text,
  type text not null default 'update',
  work_category text not null default 'general',
  application_enabled boolean not null default false,
  application_category text,
  application_category_label text,
  application_fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text check (type in ('eye_camp', 'book_distribution', 'flood_relief', 'other')),
  description text,
  event_date date,
  location text,
  registration_open boolean not null default true
);

alter table public.posts add column if not exists type text not null default 'update';
alter table public.posts add column if not exists work_category text not null default 'general';
alter table public.posts add column if not exists application_enabled boolean not null default false;
alter table public.posts add column if not exists application_category text;
alter table public.posts add column if not exists application_category_label text;
alter table public.posts add column if not exists application_fields jsonb not null default '[]'::jsonb;

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  event_id uuid references public.events(id),
  post_id uuid references public.posts(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.registrations alter column event_id drop not null;
alter table public.registrations add column if not exists post_id uuid references public.posts(id) on delete set null;

revoke all on table public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.posts, public.events to anon, authenticated;
grant insert, update, delete on public.posts, public.events to authenticated;
grant select, insert, update, delete on public.registrations to authenticated;

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
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, address)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'address'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, full_name, phone, address)
select
  id,
  raw_user_meta_data ->> 'full_name',
  raw_user_meta_data ->> 'phone',
  raw_user_meta_data ->> 'address'
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;

drop policy if exists "Users and admins can read profiles" on public.profiles;
create policy "Users and admins can read profiles"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id or (select public.is_admin()));

drop policy if exists "Anyone can read posts" on public.posts;
create policy "Anyone can read posts"
  on public.posts for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can manage posts" on public.posts;
create policy "Admins can manage posts"
  on public.posts for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Anyone can read events" on public.events;
create policy "Anyone can read events"
  on public.events for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can manage events" on public.events;
create policy "Admins can manage events"
  on public.events for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Users can read own registrations and admins can read all" on public.registrations;
create policy "Users can read own registrations and admins can read all"
  on public.registrations for select
  to authenticated
  using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Users can register for open events" on public.registrations;
create policy "Users can register for open events"
  on public.registrations for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      (
        event_id is not null
        and exists (
          select 1
          from public.events
          where id = event_id
            and registration_open = true
        )
      )
      or (
        event_id is null
        and post_id is not null
        and exists (
          select 1
          from public.posts
          where id = post_id
            and type = 'update'
            and application_enabled = true
        )
      )
    )
  );

drop policy if exists "Admins can manage registrations" on public.registrations;
create policy "Admins can manage registrations"
  on public.registrations for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Anyone can view post images" on storage.objects;
create policy "Anyone can view post images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'post-images');

drop policy if exists "Admins can upload post images" on storage.objects;
create policy "Admins can upload post images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-images' and (select public.is_admin()));

drop policy if exists "Admins can update post images" on storage.objects;
create policy "Admins can update post images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'post-images' and (select public.is_admin()))
  with check (bucket_id = 'post-images' and (select public.is_admin()));

drop policy if exists "Admins can delete post images" on storage.objects;
create policy "Admins can delete post images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-images' and (select public.is_admin()));
