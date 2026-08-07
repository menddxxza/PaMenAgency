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
    /*
     * h-dvh (no min-h-screen) + overflow-hidden aquí, y overflow-y-auto en
     * <main>: así el alto disponible para el contenido lo calcula el propio
     * flexbox (viewport completo menos lo que ocupe NavLateral, sea cual sea su
     * alto real en cada pantalla), y no un número fijo adivinado a mano. Una
     * página como /asistente que necesita ocupar exactamente el hueco restante
     * solo tiene que poner h-full en su interior — sin eso, un cálculo del tipo
     * "100vh menos tantos píxeles" se descuadra en cualquier pantalla donde el
     * menú de arriba no mida justo esos píxeles (como pasaba antes en cualquier
     * ventana más alta de lo esperado, dejando el campo del asistente fuera de
     * la vista).
     */
    <div className="flex h-dvh flex-col overflow-hidden md:flex-row">
      <NavLateral email={sesion.email} plan={sesion.plan} consumoIa={consumo} />
      <main className="min-w-0 flex-1 overflow-y-auto bg-white">{children}</main>
    </div>
  );
}
