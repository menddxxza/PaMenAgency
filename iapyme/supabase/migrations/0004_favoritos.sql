-- IAPyme — Favoritos de producto.
-- Ejecutar en el SQL Editor de Supabase, después de 0001, 0002 y 0003.

create table public.favorites (
  id         uuid primary key default gen_random_uuid(),
  buyer_id   uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),

  -- Un producto solo se puede guardar una vez por comprador.
  unique (buyer_id, product_id)
);

create index favorites_buyer_idx   on public.favorites (buyer_id, created_at desc);
create index favorites_product_idx on public.favorites (product_id);

alter table public.favorites enable row level security;

-- Los favoritos son privados: cada quien ve, añade y quita solo los suyos.
create policy "cada quien ve sus propios favoritos"
  on public.favorites for select using (buyer_id = auth.uid());

create policy "cada quien añade sus propios favoritos"
  on public.favorites for insert with check (buyer_id = auth.uid());

create policy "cada quien borra sus propios favoritos"
  on public.favorites for delete using (buyer_id = auth.uid());
