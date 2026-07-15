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

-- RPC: citas de cualquier negocio cuyo recordatorio ya toca enviar, según la
-- antelación configurada en bot_config.reminder_hours_before. La invoca el
-- cron con la service_role key (sin sesión de usuario), de ahí security
-- definer para saltar RLS igual que el resto de RPCs de este esquema.
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

-- RPC: marca el recordatorio de una cita como enviado.
create or replace function mark_reminder_sent(p_appointment_id uuid)
returns void
language sql
security definer
as $$
  update appointments set reminder_sent_at = now() where id = p_appointment_id;
$$;
