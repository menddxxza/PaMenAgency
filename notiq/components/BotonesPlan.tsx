'use client';

import { useState } from 'react';
import type { Plan } from '@/lib/planes';

/**
 * Botones de contratación y de gestión de la suscripción.
 *
 * Ninguno cambia el plan: piden una URL de Stripe y redirigen. El plan solo lo
 * escribe el webhook cuando Stripe confirma el cobro.
 */
export default function BotonesPlan({
  planActual,
  tieneSuscripcion,
  pagosActivos,
}: {
  planActual: Plan;
  tieneSuscripcion: boolean;
  pagosActivos: boolean;
}) {
  const [cargando, setCargando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ir(ruta: string, cuerpo?: Record<string, unknown>) {
    setCargando(ruta);
    setError(null);

    try {
      const respuesta = await fetch(ruta, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo ?? {}),
      });

      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok || !datos.url) {
        throw new Error(datos.error ?? 'No se ha podido continuar.');
      }

      // Redirección completa y no router.push: el destino es stripe.com.
      window.location.href = datos.url;
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'Algo ha ido mal.');
      setCargando(null);
    }
  }

  if (!pagosActivos) {
    return (
      <p className="mt-5 rounded-xl bg-ink/[0.03] px-3 py-2 text-xs text-ink/55">
        Los pagos no están configurados en este despliegue. Los límites de cada plan sí
        están activos.
      </p>
    );
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-2">
        {planActual !== 'pro' && (
          <button
            type="button"
            onClick={() => ir('/api/stripe/checkout', { plan: 'pro' })}
            disabled={cargando !== null}
            className="btn-primary"
          >
            {cargando === '/api/stripe/checkout' ? 'Abriendo Stripe…' : 'Pasar a Pro'}
          </button>
        )}

        {planActual !== 'team' && (
          <button
            type="button"
            onClick={() => ir('/api/stripe/checkout', { plan: 'team' })}
            disabled={cargando !== null}
            className="btn-secondary"
          >
            Pasar a Team
          </button>
        )}

        {tieneSuscripcion && (
          <button
            type="button"
            onClick={() => ir('/api/stripe/portal')}
            disabled={cargando !== null}
            className="btn-secondary"
          >
            {cargando === '/api/stripe/portal' ? 'Abriendo…' : 'Gestionar suscripción'}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
