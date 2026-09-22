-- =========================================================
-- QUIÉN ESCRIBIÓ POR ÚLTIMO EN CADA CONVERSACIÓN
-- =========================================================
--
-- El panel necesita saber, sin abrir cada chat, a quién le toca responder:
-- si el último mensaje es del cliente y nadie (ni el bot) ha contestado
-- todavía, esa conversación necesita atención. Antes solo se sabía leyendo
-- los mensajes uno a uno.
--
-- handle_inbound_message ya es el único punto de escritura para mensajes de
-- cliente (webhooks de WhatsApp/Telegram); generate-bot-reply y
-- send-staff-message son los únicos para bot/staff. Los tres actualizan esta
-- columna al insertar, así que no hace falta ningún trigger.

alter table conversations add column if not exists last_sender text
  check (last_sender in ('client', 'bot', 'staff'));

-- Backfill con el remitente del mensaje más reciente de cada conversación.
update conversations c
set last_sender = m.sender
from (
  select distinct on (conversation_id) conversation_id, sender
  from messages
  order by conversation_id, created_at desc
) m
where m.conversation_id = c.id and c.last_sender is null;

create or replace function handle_inbound_message(
  p_business_id uuid,
  p_phone text,
  p_content text,
  p_client_name text default null,
  p_sender text default 'client'
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_client_id uuid;
  v_conversation_id uuid;
  v_message_id uuid;
begin
  insert into clients (business_id, phone, name)
  values (p_business_id, p_phone, p_client_name)
  on conflict (business_id, phone)
  do update set name = coalesce(excluded.name, clients.name)
  returning id into v_client_id;

  select id into v_conversation_id
  from conversations
  where business_id = p_business_id and client_id = v_client_id and status = 'open'
  order by last_message_at desc
  limit 1;

  if v_conversation_id is null then
    insert into conversations (business_id, client_id)
    values (p_business_id, v_client_id)
    returning id into v_conversation_id;
  end if;

  insert into messages (conversation_id, sender, content)
  values (v_conversation_id, p_sender, p_content)
  returning id into v_message_id;

  update conversations
  set last_message_at = now(), last_sender = p_sender
  where id = v_conversation_id;

  return v_message_id;
end;
$$;
