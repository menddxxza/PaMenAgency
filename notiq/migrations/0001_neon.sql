-- Notiq — esquema para Neon.
--
-- Cambio de arquitectura respecto a la versión anterior (Supabase): aquí no hay
-- PostgREST ni RLS. Toda petición a la base de datos usa la misma conexión, con
-- todos los permisos — no existe un "auth.uid()" que Postgres pueda comprobar por
-- su cuenta. La autorización ("¿es esto del usuario que ha iniciado sesión?") es
-- responsabilidad de cada consulta en el código de la aplicación: hay que filtrar
-- por user_id explícitamente en cada una, siempre. Es el modelo estándar de una app
-- Next.js con Postgres fuera de Supabase, pero es una garantía menos que antes:
-- un descuido en una sola consulta ya no lo frena Postgres.
--
-- users sustituye a auth.users + profiles: aquí no hay un proveedor de auth
-- separado, así que el registro (email + contraseña con bcrypt) escribe
-- directamente en esta tabla.
--
-- Ejecutar contra el proyecto de Neon, por ejemplo con psql:
--   psql "$DATABASE_URL" -f migrations/0001_neon.sql

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  nombre text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text,
  plan_renueva_el timestamptz,
  -- Timestamp (evento.created de Stripe) del último webhook que ha tocado el
  -- plan. Los eventos más viejos que este valor se descartan: Stripe no
  -- garantiza el orden de entrega y reintenta los fallos hasta 3 días.
  stripe_evento_en bigint,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Carpetas
-- ---------------------------------------------------------------------------

create table if not exists folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 80),
  color text,
  created_at timestamptz not null default now()
);

create index if not exists folders_user_idx on folders (user_id, nombre);

-- ---------------------------------------------------------------------------
-- Notas
-- ---------------------------------------------------------------------------

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  folder_id uuid references folders (id) on delete set null,
  titulo text not null default '' check (char_length(titulo) <= 200),
  -- Array de bloques del editor. Ver lib/bloques.ts.
  content jsonb not null default '[]'::jsonb,
  -- Proyección en texto plano de `content`, para búsqueda y extractos. La
  -- escribe la aplicación al guardar.
  texto text not null default '',
  resumen_ia text,
  resumen_ia_el timestamptz,
  favorita boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Búsqueda full-text en español sobre título + cuerpo, con el título pesando más.
alter table notes drop column if exists busqueda;
alter table notes
  add column busqueda tsvector
  generated always as (
    setweight(to_tsvector('spanish', coalesce(titulo, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(texto, '')), 'B')
  ) stored;

create index if not exists notes_busqueda_idx on notes using gin (busqueda);
create index if not exists notes_user_idx on notes (user_id, updated_at desc);
create index if not exists notes_folder_idx on notes (folder_id);

create or replace function tocar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_updated_at on notes;
create trigger notes_updated_at
  before update on notes
  for each row execute function tocar_updated_at();

-- ---------------------------------------------------------------------------
-- Etiquetas
-- ---------------------------------------------------------------------------

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (user_id, nombre)
);

create table if not exists note_tags (
  note_id uuid not null references notes (id) on delete cascade,
  tag_id uuid not null references tags (id) on delete cascade,
  primary key (note_id, tag_id)
);

create index if not exists note_tags_tag_idx on note_tags (tag_id);

-- ---------------------------------------------------------------------------
-- Tareas
-- ---------------------------------------------------------------------------

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  -- Nota de la que salió, si la generó la IA. Se conserva para poder volver al origen.
  note_id uuid references notes (id) on delete set null,
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

create index if not exists tasks_user_idx on tasks (user_id, estado, orden);
create index if not exists tasks_vence_idx on tasks (user_id, vence) where vence is not null;
create index if not exists tasks_recordatorio_idx on tasks (recordar_el)
  where recordar_el is not null and recordatorio_enviado_el is null;

drop trigger if exists tasks_updated_at on tasks;
create trigger tasks_updated_at
  before update on tasks
  for each row execute function tocar_updated_at();

-- ---------------------------------------------------------------------------
-- Cuota de IA
-- ---------------------------------------------------------------------------

create table if not exists ai_usage (
  user_id uuid not null references users (id) on delete cascade,
  -- Mes natural en UTC, 'YYYY-MM'.
  periodo text not null,
  operaciones integer not null default 0,
  primary key (user_id, periodo)
);

/*
 * Suma una operación de IA y devuelve el total del periodo.
 *
 * Sigue siendo atómica (incrementa y comprueba el límite en el mismo statement:
 * sin eso, dos peticiones simultáneas podrían pasar las dos por el último hueco de
 * la cuota), pero ya no valida quién llama — sin PostgREST no hay un auth.uid()
 * con el que comparar p_usuario. La llama siempre código de servidor de
 * confianza, que ya ha resuelto la sesión antes de invocar esta función.
 * Cuando devuelve un número mayor que p_limite, la llamada NO se ha consumido (se
 * revierte) y hay que rechazarla.
 */
create or replace function consumir_ia(p_usuario uuid, p_periodo text, p_limite integer)
returns integer
language plpgsql
as $$
declare
  v_total integer;
begin
  insert into ai_usage (user_id, periodo, operaciones)
  values (p_usuario, p_periodo, 1)
  on conflict (user_id, periodo)
    do update set operaciones = ai_usage.operaciones + 1
  returning operaciones into v_total;

  if v_total > p_limite then
    update ai_usage
      set operaciones = operaciones - 1
      where user_id = p_usuario and periodo = p_periodo;
    return p_limite + 1;
  end if;

  return v_total;
end;
$$;

-- ---------------------------------------------------------------------------
-- Búsqueda full-text
-- ---------------------------------------------------------------------------

/*
 * Búsqueda de notas de un usuario, ordenada por relevancia. p_usuario sustituye a
 * auth.uid(): el filtro por usuario se pasa explícito porque no hay sesión de
 * Postgres por usuario.
 * `websearch_to_tsquery` acepta la sintaxis que la gente ya conoce de Google:
 * comillas para frases exactas y `-palabra` para excluir.
 */
create or replace function buscar_notas(p_usuario uuid, p_consulta text, p_limite integer default 20)
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
as $$
  select n.id, n.titulo, n.texto, n.folder_id, n.updated_at,
         ts_rank(n.busqueda, websearch_to_tsquery('spanish', p_consulta)) as relevancia
  from notes n
  where n.user_id = p_usuario
    and n.deleted_at is null
    and n.busqueda @@ websearch_to_tsquery('spanish', p_consulta)
  order by relevancia desc, n.updated_at desc
  limit least(coalesce(p_limite, 20), 50);
$$;
