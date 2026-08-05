-- Notiq — esquema base: perfiles, carpetas, notas, etiquetas, tareas y cuota de IA.
--
-- Todo el acceso pasa por RLS: cada usuario solo ve lo suyo. El único que escribe
-- `profiles.plan` es el webhook de Stripe con la service role key (que se salta RLS),
-- para que nadie pueda ascenderse a Pro desde el navegador.
--
-- Ejecutar en el SQL Editor de Supabase, o `supabase db push` con la CLI.

-- ---------------------------------------------------------------------------
-- Perfiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  plan_renueva_el timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "perfil propio: leer" on public.profiles;
create policy "perfil propio: leer" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "perfil propio: actualizar" on public.profiles;
create policy "perfil propio: actualizar" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

/*
 * El plan y los identificadores de Stripe no los toca el usuario: los escribe el
 * webhook con la service role key. Esto va en un trigger y no en el WITH CHECK de la
 * política porque una política que consulta su propia tabla se llama a sí misma.
 *
 * PostgREST cambia el rol de la conexión según el JWT: `authenticated` para una
 * sesión de usuario y `service_role` para la clave de servicio. Comprobar el rol es
 * más fiable que mirar los claims, que cambian de nombre entre versiones. La función
 * no es SECURITY DEFINER a propósito: si lo fuera, `current_user` sería el dueño.
 */
create or replace function public.proteger_plan()
returns trigger
language plpgsql
as $$
begin
  if current_user = 'authenticated' then
    new.plan := old.plan;
    new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
    new.plan_renueva_el := old.plan_renueva_el;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_proteger_plan on public.profiles;
create trigger profiles_proteger_plan
  before update on public.profiles
  for each row execute function public.proteger_plan();

-- Alta automática del perfil al registrarse.
create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- ---------------------------------------------------------------------------
-- Carpetas
-- ---------------------------------------------------------------------------

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 80),
  color text,
  created_at timestamptz not null default now()
);

create index if not exists folders_user_idx on public.folders (user_id, nombre);

alter table public.folders enable row level security;

drop policy if exists "carpetas propias" on public.folders;
create policy "carpetas propias" on public.folders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Notas
-- ---------------------------------------------------------------------------

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  folder_id uuid references public.folders (id) on delete set null,
  titulo text not null default '' check (char_length(titulo) <= 200),
  -- Array de bloques del editor. Ver lib/bloques.ts.
  content jsonb not null default '[]'::jsonb,
  -- Proyección en texto plano de `content`, para búsqueda y extractos. La escribe
  -- la aplicación al guardar: recorrer el jsonb en un trigger sería más elegante
  -- pero obligaría a duplicar en PL/pgSQL la lógica de bloques que ya está en TS.
  texto text not null default '',
  resumen_ia text,
  resumen_ia_el timestamptz,
  favorita boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Búsqueda full-text en español sobre título + cuerpo, con el título pesando más.
alter table public.notes
  drop column if exists busqueda;
alter table public.notes
  add column busqueda tsvector
  generated always as (
    setweight(to_tsvector('spanish', coalesce(titulo, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(texto, '')), 'B')
  ) stored;

create index if not exists notes_busqueda_idx on public.notes using gin (busqueda);
create index if not exists notes_user_idx on public.notes (user_id, updated_at desc);
create index if not exists notes_folder_idx on public.notes (folder_id);

alter table public.notes enable row level security;

drop policy if exists "notas propias" on public.notes;
create policy "notas propias" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.tocar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_updated_at on public.notes;
create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.tocar_updated_at();

-- ---------------------------------------------------------------------------
-- Etiquetas
-- ---------------------------------------------------------------------------

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (user_id, nombre)
);

alter table public.tags enable row level security;

drop policy if exists "etiquetas propias" on public.tags;
create policy "etiquetas propias" on public.tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.note_tags (
  note_id uuid not null references public.notes (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (note_id, tag_id)
);

create index if not exists note_tags_tag_idx on public.note_tags (tag_id);

alter table public.note_tags enable row level security;

-- La pertenencia se comprueba a través de la nota: note_tags no tiene user_id.
drop policy if exists "etiquetas de notas propias" on public.note_tags;
create policy "etiquetas de notas propias" on public.note_tags
  for all using (
    exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid())
    and exists (select 1 from public.tags t where t.id = tag_id and t.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Tareas
-- ---------------------------------------------------------------------------

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Nota de la que salió, si la generó la IA. Se conserva para poder volver al origen.
  note_id uuid references public.notes (id) on delete set null,
  titulo text not null check (char_length(titulo) between 1 and 200),
  detalle text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_curso', 'hecha')),
  prioridad text not null default 'normal' check (prioridad in ('urgente', 'alta', 'normal', 'baja')),
  vence date,
  recordar_el timestamptz,
  recordatorio_enviado_el timestamptz,
  orden double precision not null default 0,
  origen text not null default 'manual' check (origen in ('manual', 'ia')),
  completada_el timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_idx on public.tasks (user_id, estado, orden);
create index if not exists tasks_vence_idx on public.tasks (user_id, vence) where vence is not null;
-- Para el cron de recordatorios: solo las que aún no se han enviado.
create index if not exists tasks_recordatorio_idx on public.tasks (recordar_el)
  where recordar_el is not null and recordatorio_enviado_el is null;

alter table public.tasks enable row level security;

drop policy if exists "tareas propias" on public.tasks;
create policy "tareas propias" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.tocar_updated_at();

-- ---------------------------------------------------------------------------
-- Cuota de IA
-- ---------------------------------------------------------------------------

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Mes natural en UTC, 'YYYY-MM'.
  periodo text not null,
  operaciones integer not null default 0,
  primary key (user_id, periodo)
);

alter table public.ai_usage enable row level security;

-- Solo lectura desde el cliente: escribir es cosa de consumir_ia().
drop policy if exists "consumo propio: leer" on public.ai_usage;
create policy "consumo propio: leer" on public.ai_usage
  for select using (auth.uid() = user_id);

/*
 * Suma una operación de IA y devuelve el total del periodo.
 *
 * El chequeo del límite va dentro del mismo statement que el incremento. Si se
 * contara primero y se escribiera después, dos peticiones simultáneas podrían pasar
 * las dos por el último hueco de la cuota. Cuando devuelve un número mayor que
 * p_limite, la llamada NO se ha consumido (se revierte) y hay que rechazarla.
 */
create or replace function public.consumir_ia(
  p_usuario uuid,
  p_periodo text,
  p_limite integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
begin
  if p_usuario <> auth.uid() then
    raise exception 'No se puede consumir cuota de otro usuario';
  end if;

  insert into public.ai_usage (user_id, periodo, operaciones)
  values (p_usuario, p_periodo, 1)
  on conflict (user_id, periodo)
    do update set operaciones = public.ai_usage.operaciones + 1
  returning operaciones into v_total;

  if v_total > p_limite then
    -- Deshace el incremento para que el contador no se dispare a base de rechazos.
    update public.ai_usage
      set operaciones = operaciones - 1
      where user_id = p_usuario and periodo = p_periodo;
    return p_limite + 1;
  end if;

  return v_total;
end;
$$;

revoke all on function public.consumir_ia(uuid, text, integer) from public;
grant execute on function public.consumir_ia(uuid, text, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Búsqueda full-text
-- ---------------------------------------------------------------------------

/*
 * Búsqueda de notas del usuario actual, ordenada por relevancia.
 * `websearch_to_tsquery` acepta la sintaxis que la gente ya conoce de Google:
 * comillas para frases exactas y `-palabra` para excluir.
 */
create or replace function public.buscar_notas(p_consulta text, p_limite integer default 20)
returns table (
  id uuid,
  titulo text,
  texto text,
  folder_id uuid,
  updated_at timestamptz,
  relevancia real
)
language sql
stable
security invoker
set search_path = public
as $$
  select n.id, n.titulo, n.texto, n.folder_id, n.updated_at,
         ts_rank(n.busqueda, websearch_to_tsquery('spanish', p_consulta)) as relevancia
  from public.notes n
  where n.user_id = auth.uid()
    and n.deleted_at is null
    and n.busqueda @@ websearch_to_tsquery('spanish', p_consulta)
  order by relevancia desc, n.updated_at desc
  limit least(coalesce(p_limite, 20), 50);
$$;

grant execute on function public.buscar_notas(text, integer) to authenticated;
