import FormularioContrasena from '@/components/FormularioContrasena';
import SeccionEliminarCuenta from '@/components/SeccionEliminarCuenta';
import { getPerfilActual } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mi cuenta · IAPyme' };

export default async function CuentaPage() {
  const perfil = await getPerfilActual();
  if (!perfil) return null;

  return (
    <div>
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Mi cuenta</h1>
        <p className="mt-1 text-sm text-ink/60">{perfil.email}</p>
      </header>

      <div className="mt-8">
        <FormularioContrasena />
      </div>

      <SeccionEliminarCuenta />
    </div>
  );
}
