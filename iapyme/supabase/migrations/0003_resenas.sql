-- IAPyme — Reseñas de producto.
-- Ejecutar en el SQL Editor de Supabase, después de 0001 y 0002.

-- ---------------------------------------------------------------- reviews

create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  buyer_id   uuid not null references public.profiles (id) on delete cascade,

  puntuacion int not null check (puntuacion between 1 and 5),
  comentario text not null check (char_length(comentario) between 10 and 1000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Una reseña por comprador y producto. Si quiere corregirla, la edita.
  unique (product_id, buyer_id)
);

create index reviews_product_idx on public.reviews (product_id, created_at desc);
create index reviews_buyer_idx   on public.reviews (buyer_id);

alter table public.reviews enable row level security;

-- Las reseñas son prueba social pública: visibles para cualquiera, igual
-- que los productos publicados a los que pertenecen.
create policy "reseñas visibles para todos"
  on public.reviews for select using (true);

create policy "un comprador con sesión deja su reseña"
  on public.reviews for insert
  with check (buyer_id = auth.uid());

create policy "el autor edita su reseña"
  on public.reviews for update using (buyer_id = auth.uid());

create policy "el autor o un admin borra la reseña"
  on public.reviews for delete
  using (buyer_id = auth.uid() or public.is_admin());

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- Nadie valora su propio producto.
create or replace function public.enforce_review_not_self()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if exists (
    select 1 from public.products
    where id = new.product_id and seller_id = new.buyer_id
  ) then
    raise exception 'No puedes valorar tu propio producto';
  end if;
  return new;
end;
$$;

create trigger reviews_enforce_not_self
  before insert on public.reviews
  for each row execute function public.enforce_review_not_self();

-- ---------------------------------------------------------------- products.rating

alter table public.products
  add column rating_promedio numeric(2,1) not null default 0,
  add column rating_total    int not null default 0;

-- Recalcula el promedio y el total tras cualquier alta, edición o borrado
-- de reseñas de un producto. A esta escala, recalcular es más simple y
-- menos propenso a desincronizarse que llevar un contador incremental.
create or replace function public.recalcular_rating_producto()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  producto_id uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p
  set rating_promedio = coalesce(
        (select round(avg(puntuacion)::numeric, 1) from public.reviews where product_id = producto_id),
        0
      ),
      rating_total = (select count(*) from public.reviews where product_id = producto_id)
  where p.id = producto_id;
  return null;
end;
$$;

create trigger reviews_recalcular_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recalcular_rating_producto();
