-- IAPyme — no contar como visita cuando el propio vendedor mira su ficha.
-- Ejecutar en el SQL Editor de Supabase.

create or replace function public.registrar_visita(p_product_id uuid, p_referrer text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_seller_id uuid;
begin
  select seller_id into v_seller_id from public.products where id = p_product_id;

  -- Si quien mira la ficha es su propio vendedor (con sesión iniciada), no cuenta.
  if v_seller_id is not null and v_seller_id = auth.uid() then
    return;
  end if;

  insert into public.product_views (product_id, viewer_id, referrer)
  values (p_product_id, auth.uid(), p_referrer);

  update public.products set view_count = view_count + 1 where id = p_product_id;
end;
$$;
