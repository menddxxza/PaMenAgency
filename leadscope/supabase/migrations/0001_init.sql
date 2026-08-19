-- LeadScope: esquema inicial
-- Perfiles, plan/uso, búsquedas guardadas y resultados de negocios.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: 1 fila por usuario de auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_subscription_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Crea el perfil automáticamente al registrarse.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- usage_counters: contador de búsquedas por usuario y periodo (para el plan free)
-- ---------------------------------------------------------------------------
create table if not exists public.usage_counters (
  user_id uuid not null references public.profiles(id) on delete cascade,
  period_start date not null,
  searches_count int not null default 0,
  primary key (user_id, period_start)
);

alter table public.usage_counters enable row level security;

create policy "usage_select_own" on public.usage_counters
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- searches: historial de búsquedas
-- ---------------------------------------------------------------------------
create table if not exists public.searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  niche text not null,
  country text,
  city text,
  postal_code text,
  radius_km numeric,
  filters jsonb not null default '{}'::jsonb,
  results_count int not null default 0,
  no_website_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists searches_user_created_idx on public.searches (user_id, created_at desc);

alter table public.searches enable row level security;

create policy "searches_select_own" on public.searches
  for select using (auth.uid() = user_id);

create policy "searches_insert_own" on public.searches
  for insert with check (auth.uid() = user_id);

create policy "searches_delete_own" on public.searches
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- search_results: negocios devueltos por cada búsqueda (cache + export offline)
-- ---------------------------------------------------------------------------
create table if not exists public.search_results (
  id uuid primary key default gen_random_uuid(),
  search_id uuid not null references public.searches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  place_id text not null,
  name text not null,
  phone text,
  email text,
  address text,
  lat double precision,
  lng double precision,
  rating numeric,
  reviews_count int not null default 0,
  category text,
  opening_hours jsonb,
  maps_url text,
  website text,
  social_links jsonb not null default '{}'::jsonb,
  website_status text not null default 'no_website'
    check (website_status in ('no_website', 'social_only', 'broken', 'outdated', 'active')),
  opportunity text not null default 'media' check (opportunity in ('alta', 'media', 'baja')),
  opportunity_score int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists search_results_search_idx on public.search_results (search_id);
create index if not exists search_results_user_idx on public.search_results (user_id);

alter table public.search_results enable row level security;

create policy "search_results_select_own" on public.search_results
  for select using (auth.uid() = user_id);

create policy "search_results_insert_own" on public.search_results
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- updated_at automático en profiles
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
