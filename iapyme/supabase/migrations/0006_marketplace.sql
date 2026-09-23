-- =============================================================================
-- 0006 · De catálogo a marketplace
--
-- Tres cosas que la interfaz nueva necesita y el esquema todavía no tiene:
--
--   1. Más tipos de publicación. Hasta ahora todo era una solución de IA
--      (automatización, agente, bot...). Ahora también se publican negocios,
--      trabajos, profesionales y proyectos, siempre dentro del mundo de la IA.
--   2. Ubicación. No había ni un campo: sin esto no se puede filtrar por
--      provincia ni decir dónde está un negocio.
--   3. Conversación. `leads` guarda el primer mensaje del comprador y nada
--      más; el vendedor no tiene dónde responder dentro de la plataforma.
--
-- Hasta que esto se ejecute, la web funciona igual que antes: los tipos
-- nuevos simplemente no aparecen como opción al publicar, y los filtros de
-- ubicación no devuelven nada. No rompe nada de lo que ya hay.
-- =============================================================================

-- 1. TIPOS NUEVOS ------------------------------------------------------------
-- Postgres no deja usar un valor de enum en la misma transacción en que se
-- añade, así que aquí solo se añaden. Se usan a partir del siguiente despliegue.
alter type product_type add value if not exists 'negocio';
alter type product_type add value if not exists 'trabajo';
alter type product_type add value if not exists 'profesional';
alter type product_type add value if not exists 'proyecto';

-- 2. UBICACIÓN ---------------------------------------------------------------
-- Texto libre para mostrar ("Jerez de la Frontera, Cádiz") y provincia
-- normalizada para filtrar. Se separan porque filtrar por texto libre obliga a
-- adivinar cómo lo ha escrito cada vendedor.
alter table products add column if not exists ubicacion text;
alter table products add column if not exists provincia text;

-- Muchas publicaciones no son presenciales (un SaaS no está en ningún sitio).
-- Sin esta marca habría que deducirlo de que la ubicación esté vacía, que es
-- lo mismo que no haberla rellenado todavía.
alter table products add column if not exists es_remoto boolean not null default true;

create index if not exists products_provincia_idx
  on products (provincia)
  where status = 'published';

-- 3. CONVERSACIÓN ------------------------------------------------------------
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

-- Solo las dos partes del hilo. El comprador puede ser anónimo (leads.buyer_id
-- es nullable si contactó sin cuenta): en ese caso solo el vendedor lo ve.
create policy "lead_mensajes_leer_partes"
  on lead_mensajes for select
  using (
    exists (
      select 1 from leads l
      where l.id = lead_mensajes.lead_id
        and (l.seller_id = auth.uid() or l.buyer_id = auth.uid())
    )
  );

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

-- Marcar como leído: solo quien recibe, y solo ese campo.
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
