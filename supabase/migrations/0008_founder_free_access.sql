-- =========================================================
-- ACCESO GRATIS PARA CUENTAS DE FUNDADORES
-- =========================================================
-- Los negocios creados por estos dos correos reciben automáticamente un
-- plan Agencia activo, sin pasar por Stripe — pensado para las cuentas de
-- los fundadores (pruebas/demos), no para clientes reales. Se hardcodean
-- los correos aquí a propósito: son solo dos cuentas conocidas, no hace
-- falta una tabla de configuración para esto.
create or replace function create_business(p_name text, p_slug text, p_whatsapp_number text default null)
returns uuid
language plpgsql
security definer
as $$
declare
  v_business_id uuid;
  v_email       text;
begin
  insert into businesses (name, slug, whatsapp_number)
  values (p_name, p_slug, p_whatsapp_number)
  returning id into v_business_id;

  insert into business_users (business_id, user_id, role)
  values (v_business_id, auth.uid(), 'owner');

  insert into bot_config (business_id)
  values (v_business_id);

  select email into v_email from auth.users where id = auth.uid();

  if v_email in ('mendozitadjerez@gmail.com', 'amandacurbelo18@gmail.com') then
    insert into subscriptions (business_id, plan, status)
    values (v_business_id, 'agencia', 'active')
    on conflict (business_id) do update set plan = 'agencia', status = 'active';
  end if;

  return v_business_id;
end;
$$;

-- Retroactivo: si alguno de estos correos ya tiene un negocio creado antes
-- de este cambio, se le sube el plan ahora mismo (no solo a partir de aquí).
insert into subscriptions (business_id, plan, status)
select bu.business_id, 'agencia', 'active'
from business_users bu
join auth.users u on u.id = bu.user_id
where u.email in ('mendozitadjerez@gmail.com', 'amandacurbelo18@gmail.com')
on conflict (business_id) do update set plan = 'agencia', status = 'active';
