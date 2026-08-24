-- =========================================================
-- RECORDATORIOS AUTOMÁTICOS + IA PARA CONSULTAS FRECUENTES
-- =========================================================

-- Antelación (en horas) con la que se envía el recordatorio de una cita, y
-- marca de si el bot puede responder solo a preguntas frecuentes o si todo
-- mensaje debe esperar a un humano.
alter table bot_config
  add column reminder_hours_before integer not null default 24 check (reminder_hours_before > 0),
  add column faq_auto_reply boolean not null default false;

-- Evita reenviar el mismo recordatorio: se marca en cuanto se envía.
alter table appointments
  add column reminder_sent_at timestamptz;

create index idx_appointments_pending_reminder
  on appointments (business_id, starts_at)
  where reminder_sent_at is null and status in ('pending', 'confirmed');

-- RPC: citas de CUALQUIER negocio cuyo recordatorio ya toca enviar, según la
-- antelación configurada en bot_config.reminder_hours_before. La invoca el
-- cron con la service_role key (sin sesión de usuario), de ahí security
-- definer para saltar RLS igual que el resto de RPCs de este esquema.
--
-- A diferencia de create_invoice/receive_supplier_order, esta función no
-- tiene forma de comprobar "pertenece este negocio al que llama" porque por
-- diseño devuelve citas de todos los negocios a la vez — no hay un
-- p_business_id que validar. Por eso, en vez de un check de pertenencia,
-- se revoca el EXECUTE por defecto (PUBLIC, heredado por anon/authenticated)
-- y se concede solo a service_role: sin esto, cualquier usuario autenticado
-- podría llamarla vía supabase.rpc() y leer teléfono/nombre de clientes de
-- todos los negocios de la plataforma.
create or replace function due_appointment_reminders()
returns table (
  appointment_id uuid,
  business_id uuid,
  client_phone text,
  client_name text,
  service_name text,
  starts_at timestamptz
)
language sql
security definer
stable
as $$
  select
    a.id,
    a.business_id,
    c.phone,
    c.name,
    s.name,
    a.starts_at
  from appointments a
  join bot_config bc on bc.business_id = a.business_id
  join clients c on c.id = a.client_id
  left join services s on s.id = a.service_id
  where a.reminder_sent_at is null
    and a.status in ('pending', 'confirmed')
    and a.starts_at > now()
    and a.starts_at <= now() + (bc.reminder_hours_before || ' hours')::interval;
$$;

revoke execute on function due_appointment_reminders() from public;
grant execute on function due_appointment_reminders() to service_role;

-- RPC: marca el recordatorio de una cita como enviado. Mismo razonamiento
-- que arriba: no hay p_business_id que validar contra business_users (solo
-- un appointment_id), así que se restringe el EXECUTE a service_role para
-- que un usuario autenticado no pueda silenciar el recordatorio de una cita
-- de otro negocio.
create or replace function mark_reminder_sent(p_appointment_id uuid)
returns void
language sql
security definer
as $$
  update appointments set reminder_sent_at = now() where id = p_appointment_id;
$$;

revoke execute on function mark_reminder_sent(uuid) from public;
grant execute on function mark_reminder_sent(uuid) to service_role;
