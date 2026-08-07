-- Notiq — carpetas compartidas entre notas y tareas, y adjuntos (PDF/fotos).
--
-- Incremental sobre 0001_neon.sql: 0001 ya está aplicado contra el Neon real, así
-- que esto no lo toca — añade columnas y tablas nuevas, todas con `if not exists`
-- para poder ejecutarse más de una vez sin fallar.
--
-- Ejecutar contra el proyecto de Neon:
--   psql "$DATABASE_URL" -f migrations/0002_carpetas_compartidas_y_adjuntos.sql

-- ---------------------------------------------------------------------------
-- Carpetas también para tareas
-- ---------------------------------------------------------------------------
-- Las carpetas ya existían para notas. Ahora una tarea también puede vivir en
-- una: varias tareas sueltas de un mismo tema se agrupan en la misma carpeta que
-- sus notas, y la pestaña Inicio las enseña juntas.

alter table tasks add column if not exists folder_id uuid references folders (id) on delete set null;

create index if not exists tasks_folder_idx on tasks (folder_id) where folder_id is not null;

-- ---------------------------------------------------------------------------
-- Adjuntos (PDF y fotos)
-- ---------------------------------------------------------------------------
-- Se guardan en la propia base de datos (bytea) y no en un almacenamiento de
-- archivos aparte: sin cuentas nuevas que configurar, y de sobra para PDFs y
-- fotos de tamaño normal. El límite de 8 MB por archivo se aplica en la
-- aplicación (ver app/(app)/adjuntos/actions.ts), no aquí.

create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  note_id uuid references notes (id) on delete cascade,
  task_id uuid references tasks (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 200),
  tipo text not null,
  tamano integer not null,
  datos bytea not null,
  created_at timestamptz not null default now(),
  -- Un adjunto cuelga de una nota o de una tarea, nunca de las dos ni de
  -- ninguna: sin esto un insert con ambos en null quedaría huérfano.
  constraint attachments_un_solo_destino check (
    (note_id is not null and task_id is null) or (note_id is null and task_id is not null)
  )
);

create index if not exists attachments_note_idx on attachments (note_id) where note_id is not null;
create index if not exists attachments_task_idx on attachments (task_id) where task_id is not null;
create index if not exists attachments_user_idx on attachments (user_id);
