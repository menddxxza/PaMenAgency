-- =========================================================
-- PRUEBA GRATIS DE 5 DÍAS, SIN TARJETA
-- =========================================================
--
-- Hasta ahora un negocio recién creado se quedaba fuera del panel hasta
-- pagar, mientras la landing prometía "Empezar gratis". Con esto, cada
-- negocio nuevo arranca con 5 días de plan Pro en estado 'trialing'.
--
-- Decisiones y por qué:
--
-- 1. Sin tarjeta. Stripe permite `trial_period_days` en el checkout, pero eso
--    obliga a meter la tarjeta antes de probar nada, que es justo la
--    fricción que la prueba pretende quitar en la venta a negocios locales.
--    La prueba vive solo en esta tabla; Stripe no se entera y el camino del
--    pago no se toca.
--
-- 2. Plan Pro, no Starter. Durante la prueba interesa que se vea el producto
--    entero (Clientes, Facturación, Inventario, Estadísticas); con Starter
--    la mitad de las pantallas estarían bloqueadas y la prueba vendería peor
--    de lo que es el producto.
--
-- 3. La caducidad se comprueba por fecha, no con un proceso que cambie el
--    `status`. Así no hace falta ningún cron ni Edge Function programada: en
--    cuanto `current_period_end` queda atrás, `business_plan()` deja de
--    devolver plan y el panel pide contratar. Un negocio que no convierte se
--    queda con su fila en 'trialing' caducada, que además sirve de registro.
--
-- 4. Al contratar un plan, el webhook de Stripe sobrescribe la fila (plan,
--    status, current_period_end reales) y la prueba deja de aplicar. Es
--    decir: contratar durante la prueba la termina y empieza a facturar.

-- ---------------------------------------------------------
-- business_plan(): una prueba caducada ya no da acceso
-- ---------------------------------------------------------
-- Antes bastaba con status in ('active','trialing'), sin mirar la fecha. Con
-- pruebas gratis eso sería acceso Pro gratis para siempre. Se comprueba aquí
-- —y no solo en el frontend— porque esta función es la que usan las RLS de
-- invoices/inventory y las funciones security definer.
create or replace function business_plan(p_business_id uuid)
returns text
language sql
stable
security definer
as $$
  select plan from subscriptions
  where business_id = p_business_id
    and (
      status = 'active'
      -- current_period_end nulo solo puede venir de filas anteriores a esta
      -- migración: no se les quita el acceso de golpe.
      or (status = 'trialing' and (current_period_end is null or current_period_end > now()))
    );
$$;

-- ---------------------------------------------------------
-- create_business(): alta con prueba incluida
-- ---------------------------------------------------------
-- Se mantiene tal cual lo que ya hacía (negocio + owner + bot_config + acceso
-- gratis de fundadores) y se añade la rama de la prueba para el resto.
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
  else
    -- 5 días: si se cambia la duración, cambiarla también en TRIAL_DAYS de
    -- src/lib/plans.ts, que es lo que se le enseña al cliente.
    insert into subscriptions (business_id, plan, status, current_period_end)
    values (v_business_id, 'pro', 'trialing', now() + interval '5 days')
    on conflict (business_id) do nothing;
  end if;

  return v_business_id;
end;
$$;

-- ---------------------------------------------------------
-- NOTAS
-- ---------------------------------------------------------
-- * La prueba va por negocio (business_id es la PK de subscriptions), así que
--   no se puede repetir dándose de baja y de alta en el mismo negocio. Sí se
--   podría creando otro negocio: el límite de negocios por plan hoy solo se
--   aplica en la interfaz, no aquí. Para la escala actual (venta directa a
--   negocios locales) se asume ese riesgo; si algún día molesta, el sitio de
--   arreglarlo es esta función, comprobando pruebas previas del mismo user_id.
-- * No se toca ninguna fila existente a propósito: los negocios que ya
--   estaban de alta antes de esta migración no reciben prueba retroactiva.
