-- Pruebas de RLS y moderación de la Fase 1.
--
-- No se ejecutan en Supabase, sino en un Postgres local con un shim que simula
-- auth.users, auth.uid() y storage (ver README de esta carpeta). Sirven para
-- verificar que las políticas hacen lo que decimos que hacen antes de tocar
-- el proyecto real.
--
--   psql -d iapyme -f supabase/tests/shim_supabase.sql
--   psql -d iapyme -f supabase/migrations/0001_fase1.sql
--   psql -d iapyme -f supabase/tests/rls_fase1.sql

\set ON_ERROR_STOP on
\pset pager off

do $r$ begin create role anon nologin;          exception when duplicate_object then null; end $r$;
do $r$ begin create role authenticated nologin; exception when duplicate_object then null; end $r$;

grant usage on schema public, auth, storage to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant insert on public.leads to anon;
grant usage, select on all sequences in schema public to anon, authenticated;
grant execute on all functions in schema public, auth, storage to anon, authenticated;

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'jerez@iapyme.es', '{"full_name":"Jerez"}'),
  ('22222222-2222-2222-2222-222222222222', 'otra@dev.es',     '{"full_name":"Otra Dev"}'),
  ('33333333-3333-3333-3333-333333333333', 'admin@iapyme.es', '{"full_name":"Admin"}');

\echo '=== 1. El perfil se crea solo al registrarse'
select count(*) = 3 as ok from public.profiles;

update public.profiles set role = 'admin'  where id = '33333333-3333-3333-3333-333333333333';
update public.profiles set role = 'seller', slug = 'jerez' where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set role = 'seller', slug = 'otra'  where id = '22222222-2222-2222-2222-222222222222';

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

insert into public.products (seller_id, category_id, slug, titulo, tagline, problema, solucion, precio_setup, precio_mensual)
values (
  '11111111-1111-1111-1111-111111111111',
  (select id from public.categories where slug = 'atencion-al-cliente'),
  'atiende', 'Atiende', 'Atención al cliente 24/7 por WhatsApp',
  'Las pymes pierden clientes por no responder.', 'Un agente que responde como humano.',
  197, 29
);

\echo '=== 2. Una ficha nueva nace en borrador y sin fecha de publicación'
select status = 'draft' and published_at is null as ok from public.products where slug = 'atiende';

\echo '=== 3. Un anónimo no ve borradores'
set role anon; set request.jwt.claim.sub = '';
select count(*) = 0 as ok from public.products;

\echo '=== 4. Otro vendedor no puede editar ficha ajena'
set role authenticated; set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
with u as (update public.products set titulo = 'SECUESTRADO' where slug = 'atiende' returning 1)
select count(*) = 0 as ok from u;

\echo '=== 5. Otro vendedor no puede suplantar al vendedor en un insert'
do $$ begin
  insert into public.products (seller_id, category_id, slug, titulo, tagline, problema, solucion)
  values ('11111111-1111-1111-1111-111111111111',
          (select id from public.categories where slug = 'ecommerce'), 'falso', 'Falso', 'x', 'x', 'x');
  raise exception 'FALLO: se permitió la suplantación';
exception when insufficient_privilege then raise notice 'ok';
end $$;

\echo '=== 6. El vendedor no puede autopublicarse'
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
do $$ begin
  update public.products set status = 'published' where slug = 'atiende';
  raise exception 'FALLO: el vendedor se autopublicó';
exception when raise_exception then
  if sqlerrm like 'FALLO%' then raise; end if; raise notice 'ok';
end $$;

\echo '=== 7. El vendedor no puede autodestacarse en portada'
do $$ begin
  update public.products set is_featured = true where slug = 'atiende';
  raise exception 'FALLO: el vendedor se autodestacó';
exception when raise_exception then
  if sqlerrm like 'FALLO%' then raise; end if; raise notice 'ok';
end $$;

\echo '=== 8. El vendedor no puede escribir el motivo de rechazo'
do $$ begin
  update public.products set motivo_rechazo = 'todo bien' where slug = 'atiende';
  raise exception 'FALLO';
exception when raise_exception then
  if sqlerrm like 'FALLO%' then raise; end if; raise notice 'ok';
end $$;

\echo '=== 9. El vendedor no puede crear la ficha ya destacada ni con contadores inflados'
insert into public.products (seller_id, category_id, slug, titulo, tagline, problema, solucion, is_featured, view_count)
values ('11111111-1111-1111-1111-111111111111',
        (select id from public.categories where slug = 'ecommerce'),
        'trampa', 'Trampa', 'x', 'x', 'x', true, 9999);
select is_featured = false and view_count = 0 as ok from public.products where slug = 'trampa';

\echo '=== 10. El vendedor sí puede enviar a revisión'
update public.products set status = 'pending_review' where slug = 'atiende';
select status = 'pending_review' as ok from public.products where slug = 'atiende';

\echo '=== 11. El admin publica y published_at se sella solo'
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
update public.products set status = 'published', is_featured = true where slug = 'atiende';
select status = 'published' and published_at is not null and is_featured as ok
from public.products where slug = 'atiende';

\echo '=== 12. Ahora el anónimo sí lo ve'
set role anon; set request.jwt.claim.sub = '';
select count(*) = 1 as ok from public.products;

\echo '=== 13. Búsqueda fuzzy por título'
select count(*) = 1 as ok from public.products where titulo % 'atiend';

\echo '=== 14. Un anónimo puede dejar un lead y el contador sube'
insert into public.leads (product_id, seller_id, nombre, email, mensaje)
values ((select id from public.products where slug = 'atiende'),
        '11111111-1111-1111-1111-111111111111',
        'Clínica Dental Sonrisa', 'hola@sonrisa.es', '¿Funciona con Gesden?');
select lead_count = 1 as ok from public.products where slug = 'atiende';

\echo '=== 15. Un anónimo no puede leer ningún lead'
select count(*) = 0 as ok from public.leads;

\echo '=== 16. El vendedor ve su lead'
set role authenticated; set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select count(*) = 1 as ok from public.leads;

\echo '=== 17. Otro vendedor no ve leads ajenos'
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select count(*) = 0 as ok from public.leads;

\echo '=== 18. Editar una ficha publicada la devuelve a revisión'
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
update public.products set problema = 'Otro problema distinto' where slug = 'atiende';
select status = 'pending_review' as ok from public.products where slug = 'atiende';

\echo '=== 19. updated_at se mueve solo'
select updated_at > created_at as ok from public.products where slug = 'atiende';

reset role;
\echo '=== Todos los checks deben decir ok = t'
