-- =========================================================
-- APLICAR EL PLAN DE PAGO A NIVEL DE BASE DE DATOS
-- (Facturación e Inventario, funciones exclusivas de Pro/Agencia)
-- =========================================================
--
-- Hasta ahora, Facturación e Inventario solo se ocultaban en el panel
-- (RequirePlanFeature, según plans.ts) — un usuario autenticado de un
-- negocio en plan Starter podía saltarse esa pantalla y llamar a la API de
-- Supabase directamente (supabase.from('invoices').insert(...), etc.) para
-- usar funciones de pago sin haberlas contratado. Esta función centraliza
-- qué plan tiene contratado (y activo) un negocio, para que las RLS lo
-- comprueben en vez de confiar solo en el frontend.
--
-- Nota: `clients` y `services` (y por tanto Citas/Conversaciones) NO se
-- tocan aquí a propósito — Citas es una función de Starter y depende de
-- poder crear/leer `clients` sin restricción de plan (ver
-- NewAppointmentModal → upsertClient), así que gatear esa tabla por plan
-- rompería la reserva de citas para negocios en Starter. La diferencia
-- Starter/Pro en Clientes/Estadísticas es de interfaz (ficha completa,
-- gráficas), no de qué filas existen.
create or replace function business_plan(p_business_id uuid)
returns text
language sql
stable
security definer
as $$
  select plan from subscriptions
  where business_id = p_business_id and status in ('active', 'trialing');
$$;

drop policy "acceso por negocio" on invoices;
create policy "acceso por negocio" on invoices
  for all using (
    business_id in (select auth_business_ids())
    and business_plan(business_id) in ('pro', 'agencia')
  );

drop policy "acceso por negocio" on invoice_counters;
create policy "acceso por negocio" on invoice_counters
  for all using (
    business_id in (select auth_business_ids())
    and business_plan(business_id) in ('pro', 'agencia')
  );

drop policy "acceso por negocio" on invoice_items;
create policy "acceso por negocio" on invoice_items
  for all using (
    invoice_id in (
      select id from invoices
      where business_id in (select auth_business_ids())
        and business_plan(business_id) in ('pro', 'agencia')
    )
  );

drop policy "acceso por negocio" on inventory_items;
create policy "acceso por negocio" on inventory_items
  for all using (
    business_id in (select auth_business_ids())
    and business_plan(business_id) in ('pro', 'agencia')
  );

drop policy "acceso por negocio" on supplier_orders;
create policy "acceso por negocio" on supplier_orders
  for all using (
    business_id in (select auth_business_ids())
    and business_plan(business_id) in ('pro', 'agencia')
  );

-- create_invoice y receive_supplier_order son security definer (saltan RLS
-- a propósito, para poder calcular totales / reponer stock en una sola
-- transacción), así que las políticas de arriba no las protegen: hay que
-- repetir la comprobación de plan dentro de cada función, igual que ya
-- comprueban la pertenencia al negocio.
create or replace function create_invoice(
  p_business_id uuid,
  p_client_id   uuid,
  p_type        text,
  p_issue_date  date,
  p_due_date    date,
  p_notes       text,
  p_tax_rate    numeric,
  p_items       jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_invoice_id uuid;
  v_number     text;
  v_subtotal   integer := 0;
  v_tax        integer := 0;
  v_item       jsonb;
  v_item_total integer;
begin
  if not exists (
    select 1 from business_users where business_id = p_business_id and user_id = auth.uid()
  ) then
    raise exception 'No tienes acceso a este negocio';
  end if;

  if business_plan(p_business_id) not in ('pro', 'agencia') then
    raise exception 'Facturación no está disponible en tu plan actual';
  end if;

  v_number := next_invoice_number(p_business_id, p_type);

  insert into invoices (business_id, client_id, type, number, issue_date, due_date, notes, tax_rate)
  values (p_business_id, p_client_id, p_type, v_number, p_issue_date, p_due_date, p_notes, p_tax_rate)
  returning id into v_invoice_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_item_total := round((v_item ->> 'quantity')::numeric * (v_item ->> 'unit_price_cents')::numeric)::integer;
    v_subtotal := v_subtotal + v_item_total;

    insert into invoice_items (invoice_id, service_id, description, quantity, unit_price_cents, total_cents)
    values (
      v_invoice_id,
      nullif(v_item ->> 'service_id', '')::uuid,
      v_item ->> 'description',
      (v_item ->> 'quantity')::numeric,
      (v_item ->> 'unit_price_cents')::integer,
      v_item_total
    );
  end loop;

  v_tax := round(v_subtotal * p_tax_rate / 100.0)::integer;

  update invoices
  set subtotal_cents = v_subtotal, tax_cents = v_tax, total_cents = v_subtotal + v_tax
  where id = v_invoice_id;

  return v_invoice_id;
end;
$$;

create or replace function receive_supplier_order(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_business_id uuid;
  v_item_id     uuid;
  v_quantity    numeric;
  v_status      text;
begin
  select business_id, item_id, quantity, status
  into v_business_id, v_item_id, v_quantity, v_status
  from supplier_orders
  where id = p_order_id;

  if v_business_id is null then
    raise exception 'Pedido no encontrado';
  end if;

  if not exists (
    select 1 from business_users where business_id = v_business_id and user_id = auth.uid()
  ) then
    raise exception 'No tienes acceso a este negocio';
  end if;

  if business_plan(v_business_id) not in ('pro', 'agencia') then
    raise exception 'Inventario no está disponible en tu plan actual';
  end if;

  if v_status != 'pending' then
    raise exception 'El pedido ya no está pendiente';
  end if;

  update supplier_orders set status = 'received', received_at = now() where id = p_order_id;

  if v_item_id is not null then
    update inventory_items set quantity = quantity + v_quantity where id = v_item_id;
  end if;
end;
$$;
