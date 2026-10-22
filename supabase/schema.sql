-- Meera Photo Studio: database and storage setup
-- Run this entire file in Supabase SQL Editor after creating a Supabase project.
-- Add the owner's auth.users UUID to public.admins after the owner has signed up.

create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  category text not null default 'Weddings',
  image_url text not null,
  storage_path text,
  alt_text text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.video_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'Cinematic Films',
  video_url text not null,
  poster_url text,
  is_published boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  description text not null default '',
  image_url text,
  is_published boolean not null default true,
  position integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  service text not null,
  event_date date,
  event_location text,
  message text,
  status text not null default 'New'
    check (status in ('New', 'Contacted', 'In Discussion', 'Confirmed', 'Closed')),
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.gallery_items enable row level security;
alter table public.video_projects enable row level security;
alter table public.services enable row level security;
alter table public.site_settings enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists "Admins can view their own membership" on public.admins;
create policy "Admins can view their own membership"
on public.admins for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Public can read published photos" on public.gallery_items;
create policy "Public can read published photos"
on public.gallery_items for select to anon, authenticated
using (is_published = true);

drop policy if exists "Admins manage photos" on public.gallery_items;
create policy "Admins manage photos"
on public.gallery_items for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read published videos" on public.video_projects;
create policy "Public can read published videos"
on public.video_projects for select to anon, authenticated
using (is_published = true);

drop policy if exists "Admins manage videos" on public.video_projects;
create policy "Admins manage videos"
on public.video_projects for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read published services" on public.services;
create policy "Public can read published services"
on public.services for select to anon, authenticated
using (is_published = true);

drop policy if exists "Admins manage services" on public.services;
create policy "Admins manage services"
on public.services for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings for select to anon, authenticated
using (true);

drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings"
on public.site_settings for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Visitors can submit enquiries" on public.enquiries;
create policy "Visitors can submit enquiries"
on public.enquiries for insert to anon, authenticated
with check (
  length(trim(full_name)) between 2 and 120
  and length(trim(phone)) between 7 and 30
  and length(trim(service)) between 2 and 120
  and (email is null or length(email) <= 254)
  and (message is null or length(message) <= 5000)
);

drop policy if exists "Admins can view enquiries" on public.enquiries;
create policy "Admins can view enquiries"
on public.enquiries for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can update enquiries" on public.enquiries;
create policy "Admins can update enquiries"
on public.enquiries for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete enquiries" on public.enquiries;
create policy "Admins can delete enquiries"
on public.enquiries for delete to authenticated
using (public.is_admin());

-- Public read access is limited to published content. Storage uploads and management
-- require a user whose UUID is present in public.admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 15728640, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 15728640,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

drop policy if exists "Public can view portfolio images" on storage.objects;
create policy "Public can view portfolio images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'portfolio');

drop policy if exists "Admins can upload portfolio images" on storage.objects;
create policy "Admins can upload portfolio images"
on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio' and public.is_admin());

drop policy if exists "Admins can update portfolio images" on storage.objects;
create policy "Admins can update portfolio images"
on storage.objects for update to authenticated
using (bucket_id = 'portfolio' and public.is_admin())
with check (bucket_id = 'portfolio' and public.is_admin());

drop policy if exists "Admins can delete portfolio images" on storage.objects;
create policy "Admins can delete portfolio images"
on storage.objects for delete to authenticated
using (bucket_id = 'portfolio' and public.is_admin());

-- After creating the owner's user through Supabase Authentication, run this separately:
-- insert into public.admins (user_id) values ('PASTE_AUTH_USER_UUID_HERE');
--
-- Production recommendation: add CAPTCHA/rate limiting (ideally an Edge Function) to
-- public enquiry submission to reduce spam and abuse. Never expose the service-role key.
