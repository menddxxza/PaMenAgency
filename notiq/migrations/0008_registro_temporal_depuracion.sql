-- Tabla temporal solo para cazar el bug de la nota que se vacía sola — se
-- borra en cuanto se encuentre la causa, no es parte permanente del esquema.
create table if not exists debug_log (
  id bigserial primary key,
  momento timestamptz not null default now(),
  etiqueta text not null,
  datos jsonb
);
