-- Reactivada: el botón "Recuperar versión anterior" no era la única causa —
-- sigue pasando con él ya quitado, así que hace falta volver a ver la
-- secuencia real. Se borra en cuanto se encuentre la causa de verdad.
create table if not exists debug_log (
  id bigserial primary key,
  momento timestamptz not null default now(),
  etiqueta text not null,
  datos jsonb
);
