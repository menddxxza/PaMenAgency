'use client';

import { useState } from 'react';
import Logo from '@/components/Logo';
import Asistente from '@/components/Asistente';
import type { Plan } from '@/lib/planes';
import NavPestanas, { type Pestana } from './NavPestanas';
import SeccionInicio from './SeccionInicio';
import SeccionNotas from './SeccionNotas';
import SeccionTareas from './SeccionTareas';
import SeccionAjustes from './SeccionAjustes';

/**
 * Panel único: Notas, Tareas, Asistente y Ajustes conviven aquí, y cambiar de
 * pestaña solo cambia qué se ve — sin navegar ni recargar. Cada ruta (/notas,
 * /tareas, /asistente, /ajustes) sigue existiendo para poder entrar directamente
 * o compartir un enlace, pero todas renderizan este mismo componente con una
 * pestaña inicial distinta.
 *
 * Las secciones se montan la primera vez que se abren y luego se quedan en
 * memoria (solo se ocultan con `hidden`): así no se pierden el filtro de
 * búsqueda o la conversación con el asistente al cambiar de pestaña y volver.
 */
export default function PanelApp({
  tabInicial,
  email,
  plan,
  consumoIa,
  pago,
}: {
  tabInicial: Pestana;
  email: string | null;
  plan: Plan;
  consumoIa: { usadas: number; limite: number };
  pago?: string;
}) {
  const [activa, setActiva] = useState<Pestana>(tabInicial);
  const [abiertas, setAbiertas] = useState<Set<Pestana>>(new Set([tabInicial]));

  function cambiar(p: Pestana) {
    setActiva(p);
    setAbiertas((previas) => (previas.has(p) ? previas : new Set(previas).add(p)));
  }

  const porcentaje = Math.min(100, Math.round((consumoIa.usadas / consumoIa.limite) * 100));

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-ink/10 bg-paper px-5 py-3 sm:px-8">
        <div className="flex items-center gap-6">
          <Logo />
          <NavPestanas activa={activa} onCambiar={cambiar} />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-xs sm:flex">
            <span className="font-semibold text-ink/70">
              IA {consumoIa.usadas}/{consumoIa.limite}
            </span>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink/10">
              <div
                className={`h-full rounded-full ${porcentaje >= 90 ? 'bg-red-500' : 'bg-brand-500'}`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            {plan === 'free' && (
              <button
                type="button"
                onClick={() => cambiar('ajustes')}
                className="font-semibold text-brand-600"
              >
                Ampliar
              </button>
            )}
          </div>

          <p className="hidden truncate text-xs text-ink/55 md:block" title={email ?? undefined}>
            {email}
          </p>
          <form action="/auth/salir" method="post">
            <button type="submit" className="text-xs font-semibold text-ink/55 hover:text-ink">
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto bg-white">
        {abiertas.has('inicio') && (
          <div className={activa === 'inicio' ? '' : 'hidden'}>
            <SeccionInicio email={email} />
          </div>
        )}

        {abiertas.has('notas') && (
          <div className={activa === 'notas' ? '' : 'hidden'}>
            <SeccionNotas />
          </div>
        )}

        {abiertas.has('tareas') && (
          <div className={activa === 'tareas' ? '' : 'hidden'}>
            <SeccionTareas />
          </div>
        )}

        {abiertas.has('asistente') && (
          <div
            className={
              activa === 'asistente' ? 'flex h-full flex-col px-5 py-6 sm:px-8' : 'hidden'
            }
          >
            <header className="mb-6 shrink-0">
              <h1 className="text-2xl font-extrabold tracking-tight">Asistente</h1>
              <p className="mt-1 text-sm text-ink/55">
                Con contexto de tus notas y de tus tareas abiertas.
              </p>
            </header>
            <Asistente />
          </div>
        )}

        {abiertas.has('ajustes') && (
          <div className={activa === 'ajustes' ? '' : 'hidden'}>
            <SeccionAjustes pago={pago} />
          </div>
        )}
      </main>
    </div>
  );
}
