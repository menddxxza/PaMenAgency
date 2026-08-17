import FormularioContrasena from '@/components/FormularioContrasena';
import SeccionEliminarCuenta from '@/components/SeccionEliminarCuenta';
import { getPerfilActual } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mi cuenta · IAPyme' };

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: { recuperada?: string };
}) {
  const perfil = await getPerfilActual();
  if (!perfil) return null;

  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mi cuenta</h1>
        <p className="mt-1 text-sm text-ink/60">{perfil.email}</p>
      </header>

      {searchParams.recuperada ? (
        <p className="card mt-6 border-accent-300 bg-accent-500/10 p-4 text-sm font-medium text-accent-700">
          Has recuperado el acceso. Pon aquí tu nueva contraseña.
        </p>
      ) : null}

      <div className="mt-8">
        <FormularioContrasena />
      </div>

      <SeccionEliminarCuenta />
    </div>
  );
}
