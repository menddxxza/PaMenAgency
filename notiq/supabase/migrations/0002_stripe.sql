-- Notiq — estado de la suscripción de Stripe.
--
-- `profiles` ya tenía plan, stripe_customer_id, stripe_subscription_id y
-- plan_renueva_el desde 0001. Falta guardar el estado crudo que manda Stripe, para
-- poder distinguir en la interfaz una suscripción sana de una con el cobro fallando.

alter table public.profiles
  add column if not exists subscription_status text;

comment on column public.profiles.subscription_status is
  'Estado tal cual lo manda Stripe (active, trialing, past_due, canceled…). Se guarda sin normalizar para no perder información al depurar.';

-- El webhook busca el perfil por customer cuando la suscripción no trae user_id.
-- La restricción unique de 0001 ya crea un índice, pero solo si la columna existe:
-- este índice explícito deja claro que esa consulta es un camino caliente.
create index if not exists profiles_stripe_customer_idx
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

-- El trigger `proteger_plan` de 0001 ya impide que un usuario se toque el plan,
-- pero se creó antes de que existiera esta columna. Se vuelve a crear incluyéndola:
-- si no, cualquiera podría escribir subscription_status = 'active' desde el
-- navegador y engañar a la interfaz.
create or replace function public.proteger_plan()
returns trigger
language plpgsql
as $$
begin
  if current_user = 'authenticated' then
    new.plan := old.plan;
    new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
    new.plan_renueva_el := old.plan_renueva_el;
    new.subscription_status := old.subscription_status;
  end if;
  return new;
end;
$$;
