-- =========================================================
-- ATIENDE — Esquema Supabase (multi-tenant: varios negocios)
-- =========================================================

-- ---------- 1. NEGOCIOS (tenant raíz) ----------
create table businesses (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,                    -- "All Nails"
  slug          text unique not null,              -- "all-nails" (para URLs/subdominios futuros)
  whatsapp_number text,                            -- número conectado a Meta Cloud API
  timezone      text default 'Europe/Madrid',
  opening_hours jsonb default '{}',                -- {"mon":["10:00","20:00"], ...}
  created_at    timestamptz default now()
);

-- ---------- 2. USUARIOS DEL NEGOCIO ----------
-- Vincula un usuario de Supabase Auth a uno o varios negocios.
-- Un mismo login (agencia) puede tener acceso a varios negocios.
create table business_users (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid references businesses(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete cascade,
  role          text not null default 'owner' check (role in ('owner','staff','agency')),
  created_at    timestamptz default now(),
  unique(business_id, user_id)
);

-- ---------- 3. SERVICIOS Y PRECIOS ----------
create table services (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid references businesses(id) on delete cascade,
  name          text not null,                    -- "Manicura semipermanente"
  price_cents   integer not null,                 -- 1800 = 18,00€
  duration_min  integer default 30,
  active        boolean default true,
  created_at    timestamptz default now()
);

-- ---------- 4. CLIENTES (del negocio) ----------
create table clients (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid references businesses(id) on delete cascade,
  name          text,
  phone         text not null,                    -- identifica al cliente vía WhatsApp
  notes         text,
  created_at    timestamptz default now(),
  unique(business_id, phone)
);

-- ---------- 5. CITAS ----------
create table appointments (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid references businesses(id) on delete cascade,
  client_id     uuid references clients(id) on delete set null,
  service_id    uuid references services(id) on delete set null,
  starts_at     timestamptz not null,
  status        text not null default 'pending'
                  check (status in ('pending','confirmed','cancelled','no_show','completed')),
  source        text default 'bot' check (source in ('bot','manual')),
  created_at    timestamptz default now()
);
create index idx_appointments_business_date on appointments(business_id, starts_at);

-- ---------- 6. CONVERSACIONES (hilo de WhatsApp por cliente) ----------
create table conversations (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid references businesses(id) on delete cascade,
  client_id       uuid references clients(id) on delete cascade,
  status          text default 'open' check (status in ('open','closed')),
  last_message_at timestamptz default now(),
  created_at      timestamptz default now()
);
create index idx_conversations_business_recent on conversations(business_id, last_message_at desc);

-- ---------- 7. MENSAJES ----------
create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender          text not null check (sender in ('client','bot','staff')),
  content         text not null,
  created_at      timestamptz default now()
);
create index idx_messages_conversation on messages(conversation_id, created_at);

-- ---------- 8. CONFIGURACIÓN DEL BOT (1 fila por negocio) ----------
create table bot_config (
  business_id      uuid primary key references businesses(id) on delete cascade,
  tone             text default 'cercano' check (tone in ('cercano','profesional','directo','divertido')),
  greeting_message text default '¡Hola! ¿En qué puedo ayudarte?',
  knowledge_base   jsonb default '{}',              -- contexto extra: políticas, FAQs, etc.
  updated_at       timestamptz default now()
);

-- =========================================================
-- ROW LEVEL SECURITY — cada negocio solo ve sus propios datos
-- =========================================================
alter table businesses enable row level security;
alter table business_users enable row level security;
alter table services enable row level security;
alter table clients enable row level security;
alter table appointments enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table bot_config enable row level security;

-- Función helper: negocios a los que tiene acceso el usuario autenticado
create or replace function auth_business_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select business_id from business_users where user_id = auth.uid();
$$;

-- Política genérica reutilizada en cada tabla con business_id directo
create policy "acceso por negocio" on services
  for all using (business_id in (select auth_business_ids()));
create policy "acceso por negocio" on clients
  for all using (business_id in (select auth_business_ids()));
create policy "acceso por negocio" on appointments
  for all using (business_id in (select auth_business_ids()));
create policy "acceso por negocio" on conversations
  for all using (business_id in (select auth_business_ids()));
create policy "acceso por negocio" on bot_config
  for all using (business_id in (select auth_business_ids()));
create policy "acceso por negocio" on business_users
  for select using (business_id in (select auth_business_ids()));
create policy "acceso por negocio" on businesses
  for all using (id in (select auth_business_ids()));

-- messages hereda el negocio a través de conversations
create policy "acceso por negocio" on messages
  for all using (
    conversation_id in (
      select id from conversations where business_id in (select auth_business_ids())
    )
  );

-- =========================================================
-- FUNCIONES RPC
-- =========================================================

-- Alta de un negocio nuevo: crea businesses + business_users(owner) + bot_config
-- en una transacción. Necesaria porque la policy de `businesses` exige que el
-- id ya esté en auth_business_ids(), lo cual no es cierto hasta que existe la
-- fila de business_users — security definer evita ese huevo-gallina.
create or replace function create_business(p_name text, p_slug text, p_whatsapp_number text default null)
returns uuid
language plpgsql
security definer
as $$
declare
  v_business_id uuid;
begin
  insert into businesses (name, slug, whatsapp_number)
  values (p_name, p_slug, p_whatsapp_number)
  returning id into v_business_id;

  insert into business_users (business_id, user_id, role)
  values (v_business_id, auth.uid(), 'owner');

  insert into bot_config (business_id)
  values (v_business_id);

  return v_business_id;
end;
$$;

-- Registro atómico de un mensaje entrante de WhatsApp: upsert de cliente,
-- localizar/crear conversación abierta e insertar el mensaje. Pensada para
-- que n8n la llame una sola vez (vía RPC con la service_role key) en lugar
-- de encadenar 3 llamadas REST, evitando condiciones de carrera si llegan
-- varios mensajes del mismo cliente casi a la vez.
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
  set last_message_at = now()
  where id = v_conversation_id;

  return v_message_id;
end;
$$;

-- =========================================================
-- NOTAS
-- =========================================================
-- 1. n8n llama a `handle_inbound_message` (RPC) con la service_role key para
--    cada mensaje entrante o saliente del bot (p_sender = 'client' | 'bot').
--    Los mensajes de staff desde el panel se insertan directo en `messages`
--    (RLS ya cubre el acceso).
-- 2. Al registrar un negocio nuevo desde el panel, llamar a `create_business`
--    en vez de insertar directo en `businesses`.
-- 3. `business_users.role = 'agency'` es para el acceso de agencia a todos
--    los negocios gestionados desde un panel central.
-- 4. Falta: tabla `subscriptions` cuando se conecte cobro (Stripe) — no
--    incluida aún porque no se ha decidido el proveedor de pago.
