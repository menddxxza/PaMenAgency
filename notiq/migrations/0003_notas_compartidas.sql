-- Notiq — compartir una nota por enlace público de solo lectura.
--
-- Incremental sobre 0001/0002: una sola columna, con `if not exists` para poder
-- ejecutarse más de una vez sin fallar.
--
-- IMPORTANTE: el código que usa esta columna (app/(app)/notas/actions.ts →
-- alternarCompartir/obtenerNota, y la ruta pública app/compartido/[id]/page.tsx)
-- no se despliega hasta que esto se haya ejecutado contra el Neon real — sin la
-- columna, cualquier apertura de una nota fallaría en producción.
--
-- Ejecutar contra el proyecto de Neon, por ejemplo con psql:
--   psql "$DATABASE_URL" -f migrations/0003_notas_compartidas.sql
--
-- O, si es más cómodo, pegar este SQL en el "SQL Editor" del panel de Neon
-- (neon.tech → tu proyecto → SQL Editor) y ejecutarlo ahí.

alter table notes add column if not exists compartir_publico boolean not null default false;

-- Índice parcial: solo indexa las (pocas) notas compartidas, no las miles que no
-- lo están — la ruta pública busca siempre "por id, y que esté compartida".
create index if not exists notes_compartidas_idx on notes (id) where compartir_publico;
