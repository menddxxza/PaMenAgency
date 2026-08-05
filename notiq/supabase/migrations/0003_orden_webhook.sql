-- Notiq — protección contra eventos de Stripe fuera de orden.
--
-- Stripe no garantiza el orden de entrega de los webhooks, y reintenta los fallos
-- hasta 3 días. Sin nada que lo evite, un evento viejo (p.ej. un `subscription.
-- updated` con estado "active") puede reintentarse con éxito DESPUÉS de que un
-- evento más nuevo (`subscription.deleted`) ya haya bajado al usuario a Free, y
-- volver a subirle el plan aunque la baja sea la realidad vigente.
--
-- `stripe_evento_en` guarda el timestamp (`evento.created`, en segundos, tal cual
-- lo manda Stripe) del último evento que ha tocado el plan del perfil. El webhook
-- descarta cualquier evento que no sea más nuevo que el ya aplicado.

alter table public.profiles
  add column if not exists stripe_evento_en bigint;

comment on column public.profiles.stripe_evento_en is
  'Timestamp (evento.created de Stripe, en segundos) del último webhook que ha escrito el plan. Los eventos más viejos que este valor se descartan.';

-- Sin proteger esta columna, un usuario podría escribirse un valor enorme y dejar
-- que el webhook ignore para siempre cualquier baja futura por "evento desordenado":
-- el plan de pago se quedaría pegado aunque cancelara la suscripción de verdad.
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
    new.stripe_evento_en := old.stripe_evento_en;
  end if;
  return new;
end;
$$;
