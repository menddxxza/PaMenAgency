-- =========================================================
-- QUITAR EL ACCESO ANÓNIMO INNECESARIO A RPCs QUE YA SE AUTOPROTEGEN
-- =========================================================
--
-- auth_business_ids, business_plan, create_business, create_invoice y
-- receive_supplier_order seguían siendo ejecutables por `anon` porque se
-- crearon con el grant por defecto de Postgres a PUBLIC (visible en
-- pg_proc.proacl como la entrada `=X/postgres`), aparte de los grants
-- directos a anon/authenticated/service_role que añade Supabase. Ese
-- PUBLIC nunca se había revocado.
--
-- No es una vulnerabilidad activa como las de la migración anterior: las
-- cinco comprueban por dentro la pertenencia al negocio con auth.uid()
-- (que para `anon` es NULL, así que el exists() falla y la llamada revienta
-- con "No tienes acceso a este negocio"), o —en el caso de
-- auth_business_ids/business_plan— no exponen nada más sensible que el
-- plan de un negocio. Se cierra igualmente por higiene: no hay ningún
-- motivo para que un visitante sin sesión pueda llamarlas.
--
-- `revoke ... from public` solo quita la entrada PUBLIC del ACL; el grant
-- propio de `authenticated` es una entrada distinta y no se toca, así que
-- el panel (que llama a estas funciones ya con sesión) sigue funcionando
-- exactamente igual.
revoke execute on function auth_business_ids() from public;
revoke execute on function business_plan(uuid) from public;
revoke execute on function create_business(text, text, text) from public;
revoke execute on function create_invoice(uuid, uuid, text, date, date, text, numeric, jsonb) from public;
revoke execute on function receive_supplier_order(uuid) from public;
