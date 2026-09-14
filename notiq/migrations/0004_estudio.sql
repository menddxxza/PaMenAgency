-- Notiq — Estudio: flashcards, exámenes generados por IA e intentos.
--
-- Incremental sobre 0001/0002: tres tablas nuevas, con `if not exists` para poder
-- ejecutarse más de una vez sin fallar.
--
-- IMPORTANTE: el código que usa estas tablas (app/(app)/estudio/actions.ts y todo
-- lo que cuelga de components/panel/estudio/) no se despliega hasta que esto se
-- haya ejecutado contra el Neon real — sin las tablas, cualquier visita a la
-- pestaña Estudio fallaría en producción.
--
-- Ejecutar contra el proyecto de Neon, por ejemplo con psql:
--   psql "$DATABASE_URL" -f migrations/0004_estudio.sql
--
-- O pegar este SQL en el "SQL Editor" del panel de Neon (neon.tech → tu
-- proyecto → SQL Editor) y ejecutarlo ahí.

-- ---------------------------------------------------------------------------
-- Flashcards
-- ---------------------------------------------------------------------------
-- `estado` es el "semáforo" de dominio (🔴 repasar, 🟡 en progreso, 🟢 dominada) —
-- 'nueva' es el punto de partida, antes de la primera respuesta. `repasar_el`
-- es la fecha a partir de la cual la tarjeta vuelve a aparecer en el repaso
-- (repetición espaciada simple: acertar la aleja en el tiempo, fallar la trae
-- a hoy — la lógica vive en app/(app)/estudio/actions.ts, no aquí).

create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  folder_id uuid references folders (id) on delete set null,
  note_id uuid references notes (id) on delete set null,
  pregunta text not null check (char_length(pregunta) between 1 and 500),
  respuesta text not null check (char_length(respuesta) between 1 and 2000),
  estado text not null default 'nueva' check (estado in ('nueva', 'repasar', 'progreso', 'dominada')),
  veces_repasada integer not null default 0,
  veces_fallada integer not null default 0,
  repasar_el date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flashcards_repaso_idx on flashcards (user_id, repasar_el);
create index if not exists flashcards_folder_idx on flashcards (folder_id) where folder_id is not null;

-- tocar_updated_at() ya existe desde 0001_neon.sql (la usan notes y tasks).
drop trigger if exists flashcards_updated_at on flashcards;
create trigger flashcards_updated_at
  before update on flashcards
  for each row execute function tocar_updated_at();

-- ---------------------------------------------------------------------------
-- Exámenes generados y los intentos de cada uno
-- ---------------------------------------------------------------------------
-- `preguntas` guarda el examen completo tal como lo generó la IA:
--   [{ "pregunta": "...", "opciones": ["...", "...", "...", "..."],
--      "correcta": 0, "tema": "Genética molecular" }, ...]
-- "tema" es lo que permite el análisis "has fallado sobre todo en X" sin tener
-- que mantener una tabla de temas aparte — es una etiqueta libre que pone la IA
-- al generar el examen, no una referencia a otra tabla.

create table if not exists examenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  folder_id uuid references folders (id) on delete set null,
  titulo text not null check (char_length(titulo) between 1 and 200),
  preguntas jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists examenes_user_idx on examenes (user_id, created_at desc);

create table if not exists intentos_examen (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  examen_id uuid not null references examenes (id) on delete cascade,
  -- Índice de la opción elegida por pregunta, en el mismo orden que
  -- examenes.preguntas; null en las que se dejaron sin contestar.
  respuestas jsonb not null,
  puntuacion integer not null,
  total integer not null,
  completado_el timestamptz not null default now()
);

create index if not exists intentos_examen_examen_idx on intentos_examen (examen_id, completado_el desc);
