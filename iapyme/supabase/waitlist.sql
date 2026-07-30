-- IAPyme — tabla de lista de espera (Fase 0: validación)
-- Ejecutar en el SQL Editor de Supabase.

create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  perfil      text not null check (perfil in ('comprador', 'vendedor', 'ambos')),
  mensaje     text,
  origen      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists waitlist_perfil_idx on public.waitlist (perfil);
create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

-- RLS activo y sin políticas: la tabla solo es accesible con la service role key,
-- que vive en el servidor (route handler /api/waitlist). Nadie la lee desde el navegador.
alter table public.waitlist enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists waitlist_set_updated_at on public.waitlist;
create trigger waitlist_set_updated_at
  before update on public.waitlist
  for each row execute function public.set_updated_at();
