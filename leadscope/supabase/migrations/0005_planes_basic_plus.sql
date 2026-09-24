-- Nuevos planes de pago: basic (10 EUR), plus (40 EUR) y pro (80 EUR).
-- Los usuarios que ya estaban en 'pro' (p. ej. las cuentas de administración) conservan
-- el plan sin cambios.

alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles
  add constraint profiles_plan_check check (plan in ('free', 'basic', 'plus', 'pro'));
