'use client';

import { useCallback, useEffect, useState } from 'react';
import { limitesDe } from '@/lib/planes';
import TablaPrecios from '@/components/TablaPrecios';
import BotonesPlan from '@/components/BotonesPlan';
import { obtenerAjustes } from '@/app/(app)/ajustes/actions';

/** Cómo se le cuenta al usuario lo que dice `subscription_status` de Stripe. */
const AVISO_ESTADO: Record<string, { texto: string; tono: 'ok' | 'aviso' | 'error' }> = {
  trialing: { texto: 'Estás en periodo de prueba.', tono: 'ok' },
  past_due: {
    texto:
      'El último cobro ha fallado. Actualiza la tarjeta desde «Gestionar suscripción»: mantienes el plan mientras Stripe lo reintenta.',
    tono: 'error',
  },
  canceled: { texto: 'La suscripción está cancelada.', tono: 'aviso' },
  incomplete: { texto: 'El pago se quedó a medias. Vuelve a intentarlo.', tono: 'aviso' },
  unpaid: { texto: 'Hay facturas sin pagar.', tono: 'error' },
};

type Ajustes = Exclude<Awaited<ReturnType<typeof obtenerAjustes>>, null>;

export default function SeccionAjustes({ pago }: { pago?: string }) {
  const [datos, setDatos] = useState<Ajustes | null>(null);

  const cargar = useCallback(async () => {
    setDatos(await obtenerAjustes());
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (!datos) return null;

  const { email, plan, consumo, cupoNotas, perfil, pagosActivos } = datos;
  const limites = limitesDe(plan);
  const aviso = perfil?.subscription_status ? AVISO_ESTADO[perfil.subscription_status] : undefined;

  return (
    <div className="px-5 py-6 sm:px-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Ajustes</h1>
        <p className="mt-1 text-sm text-ink/55">{email}</p>
      </header>

      {pago === 'ok' && (
        <p className="mt-6 max-w-2xl rounded-xl bg-lima-400/15 px-4 py-3 text-sm text-lima-600">
          Pago completado. El plan se activa en unos segundos; recarga si aún no lo ves.
        </p>
      )}
      {pago === 'cancelado' && (
        <p className="mt-6 max-w-2xl rounded-xl bg-ink/[0.04] px-4 py-3 text-sm text-ink/65">
          No se ha cobrado nada. Sigues en el plan {limites.nombre}.
        </p>
      )}

      <section className="mt-8 max-w-2xl">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">Tu plan</h2>

        <div className="card mt-3 p-5">
          <p className="text-lg font-extrabold">{limites.nombre}</p>
          <p className="mt-1 text-sm text-ink/60">{limites.reclamo}</p>

          {aviso && (
            <p
              className={`mt-3 rounded-xl px-3 py-2 text-sm ${
                aviso.tono === 'error'
                  ? 'bg-red-50 text-red-700'
                  : aviso.tono === 'aviso'
                    ? 'bg-ink/[0.04] text-ink/70'
                    : 'bg-lima-400/15 text-lima-600'
              }`}
            >
              {aviso.texto}
            </p>
          )}

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
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink/45">Notas</dt>
              <dd className="mt-1 text-sm font-medium">
                {cupoNotas.limite === null
                  ? 'Ilimitadas'
                  : `${cupoNotas.usadas} de ${cupoNotas.limite}`}
              </dd>
            </div>
            {perfil?.plan_renueva_el && plan !== 'free' && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                  Se renueva el
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {new Date(perfil.plan_renueva_el).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </div>
            )}
          </dl>

          <BotonesPlan
            planActual={plan}
            tieneSuscripcion={Boolean(perfil?.stripe_customer_id)}
            pagosActivos={pagosActivos}
            onCambio={cargar}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">Planes</h2>
        <div className="mt-3">
          <TablaPrecios actual={plan} />
        </div>
      </section>
    </div>
  );
}
