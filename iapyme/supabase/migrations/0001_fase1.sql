-- IAPyme — Fase 1: catálogo, fichas y leads. Sin pagos.
-- Ejecutar en el SQL Editor de Supabase.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------- enums

create type user_role as enum ('buyer', 'seller', 'admin');
create type product_status as enum ('draft', 'pending_review', 'published', 'rejected', 'archived');
create type product_type as enum ('automation', 'agent', 'bot', 'app', 'web', 'saas', 'script', 'template', 'service');
create type pricing_model as enum ('one_time', 'setup_plus_monthly', 'monthly', 'free');
create type lead_status as enum ('new', 'contacted', 'converted', 'discarded');

-- ---------------------------------------------------------------- utilidades

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- profiles

create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  role          user_role not null default 'buyer',
  slug          text unique,
  display_name  text not null default '',
  bio           text,
  avatar_url    text,
  website_url   text,
  is_verified   boolean not null default false,
  is_founder    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index profiles_slug_idx on public.profiles (slug);

alter table public.profiles enable row level security;

create policy "perfiles visibles para todos"
  on public.profiles for select using (true);

create policy "cada uno edita su perfil"
  on public.profiles for update using (auth.uid() = id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Perfil automático al registrarse.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Comprueba el rol sin releer profiles bajo RLS (evita recursión en las políticas).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------- categories

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  nombre      text not null,
  icono       text not null,
  descripcion text not null,
  posicion    int not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categorías visibles para todos"
  on public.categories for select using (true);

insert into public.categories (slug, nombre, icono, descripcion, posicion) values
  ('atencion-al-cliente',    'Atención al cliente',    '💬', 'Chatbots, agentes de WhatsApp, helpdesk.',            1),
  ('salud-y-clinicas',       'Salud y clínicas',       '🏥', 'Agendamiento, recordatorios, triaje.',                2),
  ('finanzas-y-facturacion', 'Finanzas y facturación', '💰', 'Facturación automática, cobros, conciliación.',       3),
  ('marketing-y-contenido',  'Marketing y contenido',  '📱', 'Generación de contenido, SEO, redes.',                4),
  ('productividad',          'Productividad',          '⚡', 'Resúmenes, transcripciones, gestión de tareas.',      5),
  ('ventas-y-crm',           'Ventas y CRM',           '📈', 'Lead scoring, seguimiento, propuestas.',              6),
  ('ecommerce',              'Ecommerce',              '🛒', 'Recomendadores, atención post-venta, logística.',     7),
  ('educacion',              'Educación',              '📚', 'Tutores IA, generación de cursos, evaluación.',       8),
  ('legal-y-compliance',     'Legal y compliance',     '⚖️', 'Contratos, RGPD, análisis de documentos.',            9),
  ('recursos-humanos',       'Recursos humanos',       '👥', 'Filtrado de CVs, onboarding, evaluación.',           10);

-- ---------------------------------------------------------------- products

create table public.products (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references public.profiles (id) on delete cascade,
  category_id uuid not null references public.categories (id),

  slug        text not null unique,
  titulo      text not null,
  tagline     text not null,

  problema    text not null,
  solucion    text not null,
  descripcion text,
  requisitos  text,

  product_type  product_type not null default 'automation',
  pricing_model pricing_model not null default 'setup_plus_monthly',
  precio_setup   numeric(10,2) not null default 0,
  precio_mensual numeric(10,2) not null default 0,
  precio_unico   numeric(10,2) not null default 0,

  minutos_instalacion int not null default 30,
  idioma_producto     text not null default 'es' check (idioma_producto in ('es', 'en')),
  tags                text[] not null default '{}',

  cover_image_url text,
  gallery_urls    text[] not null default '{}',
  demo_video_url  text,

  status        product_status not null default 'draft',
  motivo_rechazo text,
  is_featured   boolean not null default false,
  published_at  timestamptz,

  view_count  int not null default 0,
  lead_count  int not null default 0,

  meta_title       text,
  meta_description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_seller_idx    on public.products (seller_id);
create index products_category_idx  on public.products (category_id);
create index products_status_idx    on public.products (status);
create index products_published_idx on public.products (published_at desc nulls last);
create index products_titulo_trgm   on public.products using gin (titulo gin_trgm_ops);
create index products_tagline_trgm  on public.products using gin (tagline gin_trgm_ops);
create index products_tags_idx      on public.products using gin (tags);

alter table public.products enable row level security;

create policy "productos publicados visibles para todos"
  on public.products for select
  using (status = 'published' or seller_id = auth.uid() or public.is_admin());

create policy "el vendedor crea sus productos"
  on public.products for insert
  with check (seller_id = auth.uid());

create policy "el vendedor edita sus productos"
  on public.products for update
  using (seller_id = auth.uid() or public.is_admin());

create policy "el vendedor borra sus productos"
  on public.products for delete
  using (seller_id = auth.uid());

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Sella published_at la primera vez que la ficha se publica.
create or replace function public.stamp_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and old.status is distinct from 'published' then
    new.published_at = coalesce(new.published_at, now());
  end if;
  return new;
end;
$$;

create trigger products_stamp_published_at
  before update on public.products
  for each row execute function public.stamp_published_at();

-- La moderación es obligatoria: sin esto, un vendedor podría poner su propia ficha
-- en 'published' con un UPDATE y saltarse la cola de revisión entera. RLS no basta,
-- porque el vendedor sí tiene permiso para editar su fila — lo que hay que acotar es
-- QUÉ columnas puede tocar.
create or replace function public.enforce_product_moderation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.status is distinct from old.status
     and new.status not in ('draft', 'pending_review', 'archived') then
    raise exception 'Solo un administrador puede publicar o rechazar una ficha';
  end if;

  if new.is_featured is distinct from old.is_featured then
    raise exception 'Solo un administrador puede destacar una ficha';
  end if;

  if new.motivo_rechazo is distinct from old.motivo_rechazo then
    raise exception 'Solo un administrador puede escribir el motivo de rechazo';
  end if;

  -- Cualquier cambio de contenido en una ficha ya publicada la devuelve a revisión:
  -- si no, se publica algo inocuo y luego se edita para colar otra cosa.
  if old.status = 'published' and (
       new.titulo     is distinct from old.titulo or
       new.tagline    is distinct from old.tagline or
       new.problema   is distinct from old.problema or
       new.solucion   is distinct from old.solucion or
       new.descripcion is distinct from old.descripcion or
       new.requisitos is distinct from old.requisitos
     ) then
    new.status = 'pending_review';
  end if;

  return new;
end;
$$;

create trigger products_enforce_moderation
  before update on public.products
  for each row execute function public.enforce_product_moderation();

-- Un vendedor tampoco puede crear la ficha ya publicada ni destacada.
create or replace function public.enforce_product_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.status not in ('draft', 'pending_review') then
    raise exception 'Una ficha nueva solo puede crearse como borrador o enviarse a revisión';
  end if;

  new.is_featured = false;
  new.published_at = null;
  new.motivo_rechazo = null;
  new.view_count = 0;
  new.lead_count = 0;

  return new;
end;
$$;

create trigger products_enforce_insert
  before insert on public.products
  for each row execute function public.enforce_product_insert();

-- ---------------------------------------------------------------- leads

create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  seller_id  uuid not null references public.profiles (id) on delete cascade,
  buyer_id   uuid references public.profiles (id) on delete set null,

  nombre   text not null,
  email    text not null,
  telefono text,
  empresa  text,
  mensaje  text not null,

  status     lead_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_seller_idx  on public.leads (seller_id, created_at desc);
create index leads_product_idx on public.leads (product_id);

alter table public.leads enable row level security;

create policy "el vendedor ve sus leads"
  on public.leads for select
  using (seller_id = auth.uid() or buyer_id = auth.uid() or public.is_admin());

create policy "cualquiera puede dejar un lead"
  on public.leads for insert with check (true);

create policy "el vendedor gestiona sus leads"
  on public.leads for update using (seller_id = auth.uid());

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- Mantiene products.lead_count al día.
create or replace function public.bump_lead_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.products set lead_count = lead_count + 1 where id = new.product_id;
  return new;
end;
$$;

create trigger leads_bump_count
  after insert on public.leads
  for each row execute function public.bump_lead_count();

-- ---------------------------------------------------------------- product_views

create table public.product_views (
  id         bigserial primary key,
  product_id uuid not null references public.products (id) on delete cascade,
  viewer_id  uuid references public.profiles (id) on delete set null,
  referrer   text,
  created_at timestamptz not null default now()
);

create index product_views_product_idx on public.product_views (product_id, created_at desc);

alter table public.product_views enable row level security;

create policy "el vendedor ve las visitas de sus productos"
  on public.product_views for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.products p
      where p.id = product_views.product_id and p.seller_id = auth.uid()
    )
  );

-- Registra una visita e incrementa el contador. Se llama desde el servidor.
create or replace function public.registrar_visita(p_product_id uuid, p_referrer text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.product_views (product_id, viewer_id, referrer)
  values (p_product_id, auth.uid(), p_referrer);

  update public.products set view_count = view_count + 1 where id = p_product_id;
end;
$$;

-- ---------------------------------------------------------------- storage

insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

create policy "imágenes de producto visibles para todos"
  on storage.objects for select
  using (bucket_id = 'productos');

create policy "el vendedor sube a su carpeta"
  on storage.objects for insert
  with check (
    bucket_id = 'productos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "el vendedor borra de su carpeta"
  on storage.objects for delete
  using (
    bucket_id = 'productos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
