'use client';

import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import Asistente from '@/components/Asistente';
import type { Plan } from '@/lib/planes';
import NavPestanas from './NavPestanas';
import NavPestanasMovil from './NavPestanasMovil';
import PaletaComandos from './PaletaComandos';
import { PESTANAS, type Pestana } from './pestanas';
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
  const [paletaAbierta, setPaletaAbierta] = useState(false);

  function cambiar(p: Pestana) {
    setActiva(p);
    setAbiertas((previas) => (previas.has(p) ? previas : new Set(previas).add(p)));
  }

  // Ctrl/Cmd+K abre la paleta desde cualquier pestaña. Los atajos de una sola
  // letra (n, t) solo cuentan si no se está escribiendo en ese momento — si no,
  // teclear una nota que empezara por "n" crearía notas nuevas sin parar.
  useEffect(() => {
    function atajo(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletaAbierta((abierta) => !abierta);
        return;
      }

      const objetivo = e.target as HTMLElement | null;
      const escribiendo =
        objetivo?.tagName === 'INPUT' ||
        objetivo?.tagName === 'TEXTAREA' ||
        objetivo?.isContentEditable;
      if (escribiendo || e.metaKey || e.ctrlKey || e.altKey || paletaAbierta) return;

      if (e.key === 'n') {
        cambiar('notas');
        setTimeout(() => window.dispatchEvent(new CustomEvent('notiq:crear-nota')), 0);
      } else if (e.key === 't') {
        cambiar('tareas');
        setTimeout(() => window.dispatchEvent(new CustomEvent('notiq:crear-tarea')), 0);
      }
    }
    window.addEventListener('keydown', atajo);
    return () => window.removeEventListener('keydown', atajo);
  }, [paletaAbierta]);

  const porcentaje = Math.min(100, Math.round((consumoIa.usadas / consumoIa.limite) * 100));
  const etiquetaActiva = PESTANAS.find((p) => p.id === activa)?.etiqueta ?? '';

  return (
    <div className="flex h-full flex-col">
      {/* flex-wrap es la red de seguridad: si el nav de escritorio (con las cinco
          etiquetas de texto) y el bloque de la derecha (IA, correo, Salir) no
          caben juntos en una fila — pasa en tablet, entre sm y lg — sin esto se
          solapaban en vez de bajar el bloque de la derecha a una segunda línea. */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-ink/10 bg-paper px-4 py-3 sm:px-8">
        {/* min-w-0 también aquí: el <nav> de dentro solo puede encoger y scrollear
            si su cadena de contenedores flex se lo permite hasta arriba. */}
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <Logo />
          {/* En móvil no hay fila de pestañas aquí (vive abajo, fija, en
              NavPestanasMovil) — en su lugar, el nombre de la sección actual, para
              no perder la orientación de "dónde estoy" que antes daba la pestaña
              resaltada. */}
          <p className="truncate text-sm font-semibold text-ink/70 sm:hidden">
            {etiquetaActiva}
          </p>
          <NavPestanas activa={activa} onCambiar={cambiar} />
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setPaletaAbierta(true)}
            className="hidden items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-semibold text-ink/55 transition hover:border-brand-300 hover:text-brand-700 sm:flex"
          >
            <span aria-hidden>⌕</span>
            Buscar
            {/* "Ctrl/⌘ K" y no uno de los dos: distinguir por navigator.platform
                pintaría algo distinto en el cliente que en el HTML del servidor
                (que no conoce el sistema operativo de quien lo pida) y React
                marcaría un error de hidratación por el desajuste. */}
            <kbd className="rounded border border-ink/15 px-1 font-sans text-[10px]">Ctrl/⌘ K</kbd>
          </button>

          {/* Versión compacta (móvil Y tablet, hasta lg): el medidor con la barra de
              progreso completa necesita más ancho del que suele sobrar entre sm y
              lg, justo el rango donde antes se solapaba con el nav. */}
          <button
            type="button"
            onClick={() => cambiar('ajustes')}
            aria-label={`Cuota de IA: ${consumoIa.usadas} de ${consumoIa.limite} usadas este mes`}
            className="flex items-center gap-1.5 rounded-full border border-ink/10 px-2 py-1 text-[11px] font-semibold text-ink/60 transition hover:border-brand-300 hover:text-brand-700 lg:hidden"
          >
            <span className={porcentaje >= 90 ? 'text-red-600' : 'text-brand-600'}>
              {consumoIa.usadas}/{consumoIa.limite}
            </span>
          </button>

          <div className="hidden items-center gap-2 text-xs lg:flex">
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

          <p className="hidden truncate text-xs text-ink/55 lg:block" title={email ?? undefined}>
            {email}
          </p>
          <form action="/auth/salir" method="post">
            <button type="submit" className="text-xs font-semibold text-ink/55 hover:text-ink">
              Salir
            </button>
          </form>
        </div>
      </header>

      {/* pb-16: en móvil deja hueco para la barra fija de pestañas de abajo, para
          que el final del contenido no quede tapado tras ella. sm:pb-0 porque en
          escritorio esa barra no existe (las pestañas viven en la cabecera). */}
      <main className="min-h-0 flex-1 overflow-y-auto bg-surface pb-16 sm:pb-0">
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

      <NavPestanasMovil activa={activa} onCambiar={cambiar} />

      <PaletaComandos
        abierta={paletaAbierta}
        onCerrar={() => setPaletaAbierta(false)}
        onCambiarPestana={cambiar}
      />
    </div>
  );
}
