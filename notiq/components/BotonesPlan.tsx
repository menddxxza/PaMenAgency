'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Plan } from '@/lib/planes';

/**
 * Botones de contratación y de gestión de la suscripción.
 *
 * Ninguno escribe el plan directamente: el alta y el portal piden una URL de Stripe
 * y redirigen; solo el webhook escribe `profiles.plan` cuando Stripe confirma el
 * cobro. El cambio entre planes de pago es la excepción a "siempre hay URL": el
 * servidor actualiza la suscripción existente en el sitio (con prorrateo) en vez de
 * abrir un checkout nuevo, así que esa respuesta no trae `url` y aquí solo se
 * refresca la página en vez de redirigir.
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
  const router = useRouter();
  const [cargando, setCargando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cambiado, setCambiado] = useState(false);

  async function ir(ruta: string, cuerpo?: Record<string, unknown>) {
    setCargando(ruta);
    setError(null);
    setCambiado(false);

    try {
      const respuesta = await fetch(ruta, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo ?? {}),
      });

      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) {
        throw new Error(datos.error ?? 'No se ha podido continuar.');
      }

      if (datos.url) {
        // Redirección completa y no router.push: el destino es stripe.com.
        window.location.href = datos.url;
        return;
      }

      // Cambio de plan sobre una suscripción ya existente: no hay a dónde
      // redirigir, el cambio ya es efectivo en Stripe.
      setCambiado(true);
      setCargando(null);
      router.refresh();
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
      {cambiado && (
        <p className="mt-3 rounded-xl bg-lima-400/15 px-3 py-2 text-sm text-lima-600">
          Cambio de plan confirmado. El importe de lo que llevas de mes se prorratea
          en tu próxima factura.
        </p>
      )}
    </div>
  );
}
