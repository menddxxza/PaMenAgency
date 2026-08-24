-- =========================================================
-- INVENTARIO — material disponible, alertas de stock bajo,
-- control de caducidades y pedidos a proveedores
-- =========================================================

create table inventory_items (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid references businesses(id) on delete cascade,
  name         text not null,
  unit         text not null default 'unidad',
  quantity     numeric(10, 2) not null default 0 check (quantity >= 0),
  min_quantity numeric(10, 2) not null default 0 check (min_quantity >= 0),
  expiry_date  date,
  notes        text,
  created_at   timestamptz default now()
);
create index idx_inventory_items_business on inventory_items (business_id, name);

create table supplier_orders (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid references businesses(id) on delete cascade,
  item_id       uuid references inventory_items(id) on delete set null,
  supplier_name text not null,
  quantity      numeric(10, 2) not null check (quantity > 0),
  status        text not null default 'pending' check (status in ('pending', 'received', 'cancelled')),
  ordered_at    timestamptz default now(),
  received_at   timestamptz
);
create index idx_supplier_orders_business on supplier_orders (business_id, status);

alter table inventory_items enable row level security;
alter table supplier_orders enable row level security;

create policy "acceso por negocio" on inventory_items
  for all using (business_id in (select auth_business_ids()));
create policy "acceso por negocio" on supplier_orders
  for all using (business_id in (select auth_business_ids()));

-- RPC: marca un pedido como recibido y suma la cantidad al stock del
-- artículo en la misma transacción, para que nunca quede el pedido marcado
-- como recibido sin que el stock se haya actualizado.
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

  -- security definer salta RLS: sin esta comprobación cualquier usuario
  -- autenticado podría recibir pedidos (y mover stock) de otro negocio.
  if not exists (
    select 1 from business_users where business_id = v_business_id and user_id = auth.uid()
  ) then
    raise exception 'No tienes acceso a este negocio';
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
