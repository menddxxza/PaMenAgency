-- =========================================================
-- FACTURACIÓN — presupuestos, facturas y cobros pendientes
-- =========================================================

-- ---------- 1. NUMERACIÓN CORRELATIVA POR NEGOCIO/TIPO/AÑO ----------
create table invoice_counters (
  business_id   uuid references businesses(id) on delete cascade,
  type          text not null check (type in ('quote', 'invoice')),
  year          integer not null,
  last_number   integer not null default 0,
  primary key (business_id, type, year)
);

-- RPC: siguiente número correlativo (p.ej. "FAC-2026-0007"). El upsert sobre
-- una única fila es atómico en Postgres, así que dos facturas creadas casi a
-- la vez nunca comparten número.
create or replace function next_invoice_number(p_business_id uuid, p_type text)
returns text
language plpgsql
security definer
as $$
declare
  v_year   integer := extract(year from now())::integer;
  v_next   integer;
  v_prefix text := case when p_type = 'quote' then 'PRE' else 'FAC' end;
begin
  insert into invoice_counters (business_id, type, year, last_number)
  values (p_business_id, p_type, v_year, 1)
  on conflict (business_id, type, year)
  do update set last_number = invoice_counters.last_number + 1
  returning last_number into v_next;

  return v_prefix || '-' || v_year || '-' || lpad(v_next::text, 4, '0');
end;
$$;

-- ---------- 2. FACTURAS / PRESUPUESTOS ----------
create table invoices (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid references businesses(id) on delete cascade,
  client_id      uuid references clients(id) on delete set null,
  type           text not null default 'invoice' check (type in ('quote', 'invoice')),
  number         text not null,
  status         text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'cancelled')),
  issue_date     date not null default current_date,
  due_date       date,
  notes          text,
  tax_rate       numeric(5, 2) not null default 21.00,
  subtotal_cents integer not null default 0,
  tax_cents      integer not null default 0,
  total_cents    integer not null default 0,
  created_at     timestamptz default now(),
  unique (business_id, number)
);
create index idx_invoices_business_date on invoices (business_id, issue_date desc);

-- ---------- 3. LÍNEAS DE FACTURA ----------
create table invoice_items (
  id               uuid primary key default gen_random_uuid(),
  invoice_id       uuid references invoices(id) on delete cascade,
  service_id       uuid references services(id) on delete set null,
  description      text not null,
  quantity         numeric(10, 2) not null default 1,
  unit_price_cents integer not null,
  total_cents      integer not null,
  created_at       timestamptz default now()
);
create index idx_invoice_items_invoice on invoice_items (invoice_id);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table invoice_counters enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

create policy "acceso por negocio" on invoice_counters
  for all using (business_id in (select auth_business_ids()));
create policy "acceso por negocio" on invoices
  for all using (business_id in (select auth_business_ids()));

-- invoice_items hereda el negocio a través de invoices
create policy "acceso por negocio" on invoice_items
  for all using (
    invoice_id in (select id from invoices where business_id in (select auth_business_ids()))
  );

-- =========================================================
-- RPC: crear factura/presupuesto con sus líneas de forma atómica
-- =========================================================
-- Los totales se calculan aquí, no se confían del cliente: evita que un
-- payload manipulado infle o reduzca el importe a cobrar.
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
  -- Esta función corre security definer (salta RLS) para poder calcular
  -- totales e insertar líneas en una sola transacción; sin esta comprobación
  -- cualquier usuario autenticado podría facturar en nombre de otro negocio.
  if not exists (
    select 1 from business_users where business_id = p_business_id and user_id = auth.uid()
  ) then
    raise exception 'No tienes acceso a este negocio';
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
