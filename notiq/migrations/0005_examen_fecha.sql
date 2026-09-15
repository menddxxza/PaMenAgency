-- Notiq — fecha de examen por carpeta, para el "modo examen" de Estudio.
--
-- Incremental sobre 0001-0004: una sola columna, con `if not exists` para poder
-- ejecutarse más de una vez sin fallar.
--
-- Ejecutar contra el proyecto de Neon:
--   psql "$DATABASE_URL" -f migrations/0005_examen_fecha.sql
-- o pegar este SQL en el SQL Editor de neon.tech.

alter table folders add column if not exists fecha_examen date;
