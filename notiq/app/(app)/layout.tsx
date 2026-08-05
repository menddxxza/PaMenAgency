import { redirect } from 'next/navigation';
import NavLateral from '@/components/NavLateral';
import AvisoSinBaseDeDatos from '@/components/AvisoSinBaseDeDatos';
import { getSesion } from '@/lib/sesion';
import { baseDeDatosConfigurada } from '@/lib/db';
import { consumoIa } from '@/lib/ia/limites';

/*
 * Todo lo que cuelga de aquí depende de la sesión. Sin esto, `next build` sin
 * variables de entorno prerenderiza páginas privadas como estáticas, que luego en
 * producción se sirven cacheadas.
 */
export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!baseDeDatosConfigurada()) {
    return (
      <main className="mx-auto max-w-lg px-5 py-24">
        <AvisoSinBaseDeDatos />
      </main>
    );
  }

  const sesion = await getSesion();
  if (!sesion) redirect('/entrar');

  const consumo = await consumoIa(sesion.userId, sesion.plan);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <NavLateral email={sesion.email} plan={sesion.plan} consumoIa={consumo} />
      <main className="min-w-0 flex-1 bg-white">{children}</main>
    </div>
  );
}
