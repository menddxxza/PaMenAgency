-- =============================================================================
-- 0006 · De catálogo a marketplace
--
-- El enum de tipos (negocio, trabajo, profesional, proyecto) YA está aplicado
-- en producción — se hizo aparte porque Postgres no deja añadir un valor de
-- enum y usarlo en la misma transacción. Este archivo es el resto, que se
-- quedó pendiente porque crear tablas y políticas de seguridad en la base de
-- datos compartida requiere que lo pegues tú mismo.
--
-- Cómo aplicarlo: Supabase → tu proyecto IAPyme → SQL Editor → pega esto
-- entero → Run. Es idempotente (todo lleva `if not exists`), así que
-- ejecutarlo dos veces no rompe nada.
--
-- Hasta que lo ejecutes, la web sigue funcionando exactamente igual: las
-- familias nuevas muestran su vacío honesto, no se puede filtrar por
-- ubicación, no hay mensajería ni alertas ni peticiones de compra. No se
-- rompe nada de lo que ya hay.
-- =============================================================================

-- 1. UBICACIÓN ---------------------------------------------------------------
alter table products add column if not exists ubicacion text;
alter table products add column if not exists provincia text;
alter table products add column if not exists es_remoto boolean not null default true;

create index if not exists products_provincia_idx
  on products (provincia)
  where status = 'published';

-- 2. PETICIONES DE COMPRA -----------------------------------------------------
-- Hasta ahora solo se podía ofrecer. Con esta columna, la misma tabla de
-- `products` también sirve para publicar demanda ("busco quien me automatice
-- las facturas"): mismo formulario, mismas fichas, misma revisión — solo
-- cambia el sentido. No se crea una tabla paralela porque duplicaría fichas,
-- moderación, favoritos y mensajería sin necesidad.
alter table products add column if not exists es_peticion boolean not null default false;

create index if not exists products_peticiones_idx
  on products (created_at desc)
  where status = 'published' and es_peticion = true;

-- 3. CONVERSACIÓN --------------------------------------------------------------
-- Cada lead pasa a ser el hilo, y aquí van los mensajes que se cruzan dentro.
-- El primer mensaje sigue viviendo en leads.mensaje para no tocar lo que ya
-- funciona (avisos por email, exportación, panel de mensajes).
create table if not exists lead_mensajes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  autor_id uuid not null references profiles (id) on delete cascade,
  cuerpo text not null check (char_length(trim(cuerpo)) between 1 and 4000),
  leido_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists lead_mensajes_lead_idx on lead_mensajes (lead_id, created_at);

alter table lead_mensajes enable row level security;

drop policy if exists "lead_mensajes_leer_partes" on lead_mensajes;
create policy "lead_mensajes_leer_partes"
  on lead_mensajes for select
  using (
    exists (
      select 1 from leads l
      where l.id = lead_mensajes.lead_id
        and (l.seller_id = auth.uid() or l.buyer_id = auth.uid())
    )
  );

drop policy if exists "lead_mensajes_escribir_partes" on lead_mensajes;
create policy "lead_mensajes_escribir_partes"
  on lead_mensajes for insert
  with check (
    autor_id = auth.uid()
    and exists (
      select 1 from leads l
      where l.id = lead_mensajes.lead_id
        and (l.seller_id = auth.uid() or l.buyer_id = auth.uid())
    )
  );

drop policy if exists "lead_mensajes_marcar_leido" on lead_mensajes;
create policy "lead_mensajes_marcar_leido"
  on lead_mensajes for update
  using (
    autor_id <> auth.uid()
    and exists (
      select 1 from leads l
      where l.id = lead_mensajes.lead_id
        and (l.seller_id = auth.uid() or l.buyer_id = auth.uid())
    )
  );

-- 4. ALERTAS GUARDADAS ---------------------------------------------------------
-- "Avísame cuando publiquen algo de facturación en Cádiz". Se comprueban una
-- vez al día (ver app/api/cron/alertas/route.ts) contra lo publicado desde la
-- última vez, y el email sale por Resend, igual que los avisos de leads.
create table if not exists alertas_busqueda (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references profiles (id) on delete cascade,
  termino text,
  tipos text[] not null default '{}',
  provincia text,
  activa boolean not null default true,
  ultima_ejecucion timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists alertas_busqueda_activas_idx
  on alertas_busqueda (ultima_ejecucion)
  where activa = true;

alter table alertas_busqueda enable row level security;

drop policy if exists "alertas_leer_propias" on alertas_busqueda;
create policy "alertas_leer_propias"
  on alertas_busqueda for select
  using (usuario_id = auth.uid());

drop policy if exists "alertas_crear_propias" on alertas_busqueda;
create policy "alertas_crear_propias"
  on alertas_busqueda for insert
  with check (usuario_id = auth.uid());

drop policy if exists "alertas_editar_propias" on alertas_busqueda;
create policy "alertas_editar_propias"
  on alertas_busqueda for update
  using (usuario_id = auth.uid());

drop policy if exists "alertas_borrar_propias" on alertas_busqueda;
create policy "alertas_borrar_propias"
  on alertas_busqueda for delete
  using (usuario_id = auth.uid());
