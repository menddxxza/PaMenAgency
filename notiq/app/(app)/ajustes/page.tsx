import { getSesion } from '@/lib/supabase/server';
import { consumoIa, puedeCrearNota } from '@/lib/ia/limites';
import { limitesDe } from '@/lib/planes';
import TablaPrecios from '@/components/TablaPrecios';

export const metadata = { title: 'Ajustes · Notiq' };

export default async function AjustesPage() {
  const sesion = await getSesion();
  if (!sesion) return null;

  const [consumo, cupoNotas] = await Promise.all([
    consumoIa(sesion.supabase, sesion.userId, sesion.plan),
    puedeCrearNota(sesion.supabase, sesion.userId, sesion.plan),
  ]);

  const limites = limitesDe(sesion.plan);

  return (
    <div className="px-5 py-6 sm:px-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Ajustes</h1>
        <p className="mt-1 text-sm text-ink/55">{sesion.email}</p>
      </header>

      <section className="mt-8 max-w-2xl">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">
          Tu plan
        </h2>

        <div className="card mt-3 p-5">
          <p className="text-lg font-extrabold">{limites.nombre}</p>
          <p className="mt-1 text-sm text-ink/60">{limites.reclamo}</p>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                Operaciones de IA este mes
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {consumo.usadas} de {consumo.limite}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                Notas
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {cupoNotas.limite === null
                  ? 'Ilimitadas'
                  : `${cupoNotas.usadas} de ${cupoNotas.limite}`}
              </dd>
            </div>
          </dl>

          {/*
            El alta y la gestión de la suscripción llegan con Stripe (semanas 7-8 del
            roadmap). Hasta entonces el plan se cambia a mano en la base de datos, y
            los límites que se ven aquí ya son los que aplica el servidor.
          */}
          <p className="mt-5 rounded-xl bg-ink/[0.03] px-3 py-2 text-xs text-ink/55">
            El pago con Stripe todavía no está conectado. Los límites de cada plan sí
            están activos.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">Planes</h2>
        <div className="mt-3">
          <TablaPrecios actual={sesion.plan} />
        </div>
      </section>
    </div>
  );
}
