-- ============================================================
-- 005 — RLS
-- ============================================================
-- Regla: el front anónimo solo ve lo `published`. Todas las escrituras
-- pasan por el service_role (el admin en el servidor), que salta RLS.
-- Ninguna tabla se queda sin RLS: en Supabase eso equivale a publicarla.
--
-- Las tablas de usuario (workshop, app_user, user_favorite, user_history)
-- dependen de auth.uid(). En un Postgres local sin el esquema `auth` esa
-- parte se salta: queda RLS activo y sin políticas, es decir, cerrado.
--
-- Idempotente.
-- ============================================================

-- Roles de Supabase: existen en el proyecto real; se crean aquí para que
-- el fichero se pueda aplicar también en un Postgres local de validación.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- RLS en todo.
DO $$
DECLARE t text;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- Lectura pública: catálogo de referencia sin estado propio.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'body_style','engine','transmission','system','subsystem','tool','brand','supplier',
    'vehicle_component','component_dependency','component_tool','vehicle_alias',
    'part_reference','part_fitment','reference_equivalence','price_quote','procedure_step','procedure_tool'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS read_all ON public.%I', t);
    EXECUTE format('CREATE POLICY read_all ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
  END LOOP;
END $$;

-- Lectura pública solo de lo publicado.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'manufacturer','model','vehicle','component','part','model_3d','repair_procedure'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS read_published ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY read_published ON public.%I FOR SELECT TO anon, authenticated USING (status = ''published'')', t);
  END LOOP;
END $$;

-- generation no tiene `status`: cuelga de model, que sí.
DROP POLICY IF EXISTS read_published ON public.generation;
CREATE POLICY read_published ON public.generation FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM model m WHERE m.id = generation.model_id AND m.status = 'published'));

-- Nodos: visibles solo si su modelo está publicado.
DROP POLICY IF EXISTS read_published ON public.model_node;
CREATE POLICY read_published ON public.model_node FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM model_3d m WHERE m.id = model_node.model_3d_id AND m.status = 'published'));

-- Sin política y con RLS activo => cerrado a anon/authenticated:
--   mesh_asset   (biblioteca interna de mallas)
--   import_run / import_row (trazabilidad de licencias)

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL    ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON vehicle_full, component_full TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_vehicles(text, integer)   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_components(text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION vehicle_components(text)         TO anon, authenticated;

-- ------------------------------------------------------------
-- Tablas de usuario (requieren el esquema auth de Supabase)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF to_regprocedure('auth.uid()') IS NULL THEN
    RAISE NOTICE 'auth.uid() no existe: se saltan las políticas de usuario (quedan cerradas)';
    RETURN;
  END IF;

  DROP POLICY IF EXISTS self_read ON public.app_user;
  CREATE POLICY self_read ON public.app_user FOR SELECT TO authenticated USING (id = auth.uid());

  DROP POLICY IF EXISTS own_rw ON public.user_favorite;
  CREATE POLICY own_rw ON public.user_favorite FOR ALL TO authenticated
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

  DROP POLICY IF EXISTS own_rw ON public.user_history;
  CREATE POLICY own_rw ON public.user_history FOR ALL TO authenticated
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

  DROP POLICY IF EXISTS member_read ON public.workshop;
  CREATE POLICY member_read ON public.workshop FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM app_user u WHERE u.id = auth.uid() AND u.workshop_id = workshop.id));
END $$;
