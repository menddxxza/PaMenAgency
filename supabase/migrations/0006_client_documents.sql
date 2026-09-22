-- =========================================================
-- FICHA DE CLIENTE COMPLETA — documentos e imágenes adjuntos
-- (contratos, consentimientos, fotos de antes/después, informes…)
-- =========================================================

insert into storage.buckets (id, name, public)
values ('client-documents', 'client-documents', false)
on conflict (id) do nothing;

create table client_documents (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid references businesses(id) on delete cascade,
  client_id    uuid references clients(id) on delete cascade,
  name         text not null,
  storage_path text not null,
  mime_type    text,
  size_bytes   integer,
  created_at   timestamptz default now()
);
create index idx_client_documents_client on client_documents (client_id, created_at desc);

alter table client_documents enable row level security;

create policy "acceso por negocio" on client_documents
  for all using (business_id in (select auth_business_ids()));

-- Cada objeto vive en client-documents/<business_id>/<client_id>/<archivo>,
-- así que basta comprobar el primer segmento de la ruta contra los negocios
-- del usuario para replicar el mismo aislamiento multi-tenant que en las
-- tablas normales.
create policy "acceso por negocio a documentos de cliente"
  on storage.objects
  for all
  using (
    bucket_id = 'client-documents'
    and (storage.foldername(name))[1]::uuid in (select auth_business_ids())
  )
  with check (
    bucket_id = 'client-documents'
    and (storage.foldername(name))[1]::uuid in (select auth_business_ids())
  );
