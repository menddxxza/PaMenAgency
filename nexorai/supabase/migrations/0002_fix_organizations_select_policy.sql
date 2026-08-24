-- El flujo de creación de organización hace `insert(...).select('id').single()`
-- en la misma llamada: PostgREST re-lee la fila insertada a través de la
-- política de SELECT antes de devolverla. La política original sólo permitía
-- leer organizaciones de las que el usuario ya es miembro, pero la membresía
-- se crea en el paso siguiente (organización -> membresía) — así que esa
-- primera lectura fallaba siempre, aunque el insert en sí tuviera éxito, y
-- la API lo reportaba como "No se pudo crear la organización.".
--
-- Fix: el creador también puede leer su propia organización antes de tener
-- membresía todavía.
drop policy if exists "organizations_select_member" on public.organizations;
create policy "organizations_select_member" on public.organizations
  for select using (public.is_org_member(id) or created_by = auth.uid());
