-- Notiq — suscripciones de notificaciones push del navegador.
--
-- Incremental sobre 0001-0005: una tabla nueva, con `if not exists` para poder
-- ejecutarse más de una vez sin fallar.
--
-- Cada fila es UN dispositivo/navegador donde el usuario ha activado las
-- notificaciones (puede haber varias por usuario: móvil + portátil, por
-- ejemplo). `endpoint` es único porque lo asigna el navegador y ya identifica
-- de sobra la suscripción — es lo que usa app/api/cron/recordatorios/route.ts
-- para saber a quién mandarle un push y para borrar la fila si el navegador
-- responde que ya no existe (404/410).
--
-- Ejecutar contra el proyecto de Neon:
--   psql "$DATABASE_URL" -f migrations/0006_notificaciones_push.sql
-- o pegar este SQL en el SQL Editor de neon.tech.

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on push_subscriptions (user_id);
