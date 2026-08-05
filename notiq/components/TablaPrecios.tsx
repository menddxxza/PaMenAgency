import Link from 'next/link';
import { ORDEN_PLANES, PLANES, type Plan } from '@/lib/planes';

export default function TablaPrecios({ actual }: { actual?: Plan }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {ORDEN_PLANES.map((id) => {
        const plan = PLANES[id];
        const destacado = id === 'pro';
        const esActual = actual === id;

        return (
          <div
            key={id}
            className={`card flex flex-col p-6 ${
              destacado ? 'ring-2 ring-brand-500' : ''
            }`}
          >
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-extrabold">{plan.nombre}</h3>
              {destacado && !esActual && (
                <span className="chip border-brand-200 bg-brand-50 text-brand-700">
                  El más elegido
                </span>
              )}
              {esActual && (
                <span className="chip border-lima-400/40 bg-lima-400/15 text-lima-600">
                  Tu plan
                </span>
              )}
            </div>

            <p className="mt-3 text-3xl font-extrabold tracking-tight">
              {plan.precio === 0 ? 'Gratis' : `${plan.precio} €`}
              {plan.precio > 0 && (
                <span className="text-sm font-medium text-ink/50">
                  /mes{id === 'team' ? ' por usuario' : ''}
                </span>
              )}
            </p>
            <p className="mt-2 text-sm text-ink/65">{plan.reclamo}</p>

            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-ink/75">
              {plan.incluye.map((linea) => (
                <li key={linea} className="flex gap-2.5">
                  <span aria-hidden className="text-brand-600">
                    ✓
                  </span>
                  {linea}
                </li>
              ))}
            </ul>

            {/*
              Dentro de la aplicación (`actual` definido) la tabla es informativa: la
              contratación va por los botones de arriba, que hablan con Stripe. Aquí
              solo hace falta el CTA en la landing, para quien todavía no tiene cuenta.
            */}
            {actual === undefined && (
              <Link
                href="/entrar"
                className={`mt-6 ${destacado ? 'btn-primary' : 'btn-secondary'} w-full`}
              >
                {plan.precio === 0 ? 'Empezar gratis' : `Elegir ${plan.nombre}`}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
