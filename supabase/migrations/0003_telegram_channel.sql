-- =========================================================
-- Canal de Telegram: enlaza un chat de Telegram con un negocio y su cliente
-- para poder reutilizar handle_inbound_message() igual que con WhatsApp.
-- =========================================================

create table telegram_links (
  chat_id       bigint primary key,               -- id de chat de Telegram (grupo o privado)
  business_id   uuid references businesses(id) on delete cascade,
  client_id     uuid references clients(id) on delete cascade,
  created_at    timestamptz default now()
);
create index idx_telegram_links_business on telegram_links(business_id);

alter table telegram_links enable row level security;

create policy "acceso por negocio" on telegram_links
  for all using (business_id in (select auth_business_ids()));

-- ---------------------------------------------------------
-- Enlaza (o reutiliza) un chat_id de Telegram con el negocio identificado
-- por su slug, dando de alta el cliente sintético "tg:<chat_id>" y
-- reenviando el mensaje a handle_inbound_message(). Pensada para que el
-- bot de Telegram la llame una sola vez por mensaje, igual que n8n hace
-- con WhatsApp — sin que el bot necesite conocer el esquema.
-- ---------------------------------------------------------
create or replace function handle_telegram_message(
  p_business_slug text,
  p_chat_id bigint,
  p_content text,
  p_client_name text default null,
  p_sender text default 'client'
)
returns table (message_id uuid, business_id uuid)
language plpgsql
security definer
as $$
declare
  v_business_id uuid;
  v_client_id uuid;
  v_phone text := 'tg:' || p_chat_id::text;
  v_message_id uuid;
begin
  select id into v_business_id from businesses where slug = p_business_slug;
  if v_business_id is null then
    raise exception 'negocio % no encontrado', p_business_slug;
  end if;

  select handle_inbound_message(v_business_id, v_phone, p_content, p_client_name, p_sender)
  into v_message_id;

  select id into v_client_id from clients
  where business_id = v_business_id and phone = v_phone;

  insert into telegram_links (chat_id, business_id, client_id)
  values (p_chat_id, v_business_id, v_client_id)
  on conflict (chat_id) do update
    set business_id = excluded.business_id,
        client_id = excluded.client_id;

  return query select v_message_id, v_business_id;
end;
$$;
