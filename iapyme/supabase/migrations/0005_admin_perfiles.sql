-- IAPyme — Permite a un admin verificar vendedores.
-- Ejecutar en el SQL Editor de Supabase, después de 0001-0004.

-- Hasta ahora solo existía "cada uno edita su perfil" (auth.uid() = id), así
-- que no había forma de marcar is_verified en el perfil de otra persona.
-- Las políticas permisivas se combinan con OR, así que esto amplía el acceso
-- sin tocar la que ya tenían los usuarios sobre su propio perfil.
create policy "un admin edita cualquier perfil"
  on public.profiles for update using (public.is_admin());
