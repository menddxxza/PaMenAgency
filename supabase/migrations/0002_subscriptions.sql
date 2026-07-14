-- =========================================================
-- SUSCRIPCIONES — planes de pago mensual (Stripe) por negocio
-- =========================================================

create table subscriptions (
  business_id          uuid primary key references businesses(id) on delete cascade,
  stripe_customer_id   text,
  stripe_subscription_id text,
  plan                 text not null default 'starter'
                          check (plan in ('starter', 'pro', 'agencia')),
  status               text not null default 'incomplete'
                          check (status in ('incomplete', 'trialing', 'active', 'past_due', 'canceled')),
  current_period_end   timestamptz,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

alter table subscriptions enable row level security;

-- Solo lectura desde el cliente: el alta/baja real la hacen las Edge
-- Functions (create-checkout-session, stripe-webhook) con la service_role
-- key, nunca el browser directo.
create policy "acceso por negocio" on subscriptions
  for select using (business_id in (select auth_business_ids()));

create index idx_subscriptions_stripe_customer on subscriptions(stripe_customer_id);
create index idx_subscriptions_stripe_subscription on subscriptions(stripe_subscription_id);

-- =========================================================
-- NOTAS
-- =========================================================
-- 1. Un negocio sin fila en `subscriptions`, o con status fuera de
--    ('trialing','active'), se considera sin acceso — ver
--    RequireSubscription en el frontend.
-- 2. plan -> Stripe Price ID se mapea en las Edge Functions vía env vars
--    (STRIPE_PRICE_STARTER / STRIPE_PRICE_PRO / STRIPE_PRICE_AGENCIA), no
--    en esta tabla, para no tener que migrar si cambian los precios.
