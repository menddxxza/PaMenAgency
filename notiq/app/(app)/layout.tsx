import { redirect } from 'next/navigation';
import AvisoSinBaseDeDatos from '@/components/AvisoSinBaseDeDatos';
import { getSesion } from '@/lib/sesion';
import { baseDeDatosConfigurada } from '@/lib/db';

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

  return (
    /*
     * h-dvh (no min-h-screen) + overflow-hidden aquí, y overflow-y-auto en
     * <main>: así el alto disponible para el contenido lo calcula el propio
     * flexbox (viewport completo), y no un número fijo adivinado a mano. El
     * panel único (Notas/Tareas/Asistente/Ajustes en una sola pantalla, ver
     * components/panel/PanelApp.tsx) pone su propio h-full por dentro para
     * ocupar exactamente ese hueco — sin eso, un cálculo del tipo "100vh menos
     * tantos píxeles" se descuadra en cualquier pantalla donde el menú de
     * arriba no mida justo esos píxeles (como pasaba antes con el asistente).
     */
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="min-h-0 flex-1 overflow-y-auto bg-white">{children}</main>
    </div>
  );
}
