'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Icono from './Icono';

/**
 * useSearchParams() obliga a renderizar en cliente, y sin un límite de Suspense
 * eso tumba el prerenderizado estático de cualquier página que monte el buscador.
 * El límite va aquí para que ningún consumidor tenga que acordarse de ponerlo.
 */
export default function Buscador({
  compacto = false,
  oscuro = false,
}: {
  compacto?: boolean;
  /** El buscador de portada vive sobre el hero oscuro: los acentos de
   *  marca necesitan un tono más claro para seguir leyéndose ahí. */
  oscuro?: boolean;
}) {
  return (
    <Suspense fallback={<BuscadorEsqueleto compacto={compacto} />}>
      <BuscadorInterno compacto={compacto} oscuro={oscuro} />
    </Suspense>
  );
}

function BuscadorEsqueleto({ compacto }: { compacto: boolean }) {
  return compacto ? (
    <div className="h-9 w-full max-w-md rounded-xl border border-ink/10 bg-ink/[0.03]" />
  ) : (
    <div className="h-[66px] w-full rounded-2xl border border-ink/10 bg-white shadow-card" />
  );
}

type RespuestaIA = { respuesta: string; productos: { slug: string; titulo: string }[] };
type EstadoIA = 'idle' | 'pensando' | 'lista' | 'error';

function BuscadorInterno({ compacto, oscuro }: { compacto: boolean; oscuro: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [estadoIA, setEstadoIA] = useState<EstadoIA>('idle');
  const [respuestaIA, setRespuestaIA] = useState<RespuestaIA | null>(null);
  const [errorIA, setErrorIA] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const termino = q.trim();
    router.push(termino ? `/buscar?q=${encodeURIComponent(termino)}` : '/buscar');
  }

  async function preguntarIA() {
    const consulta = q.trim();
    if (consulta.length < 3) {
      setEstadoIA('error');
      setErrorIA('Cuéntame un poco más qué quieres automatizar.');
      return;
    }

    setEstadoIA('pensando');
    setErrorIA(null);
    setRespuestaIA(null);

    try {
      const res = await fetch('/api/recomendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consulta }),
      });
      const datos = (await res.json()) as RespuestaIA & { error?: string };

      if (!res.ok) {
        setEstadoIA('error');
        setErrorIA(datos.error ?? 'Algo ha fallado. Inténtalo de nuevo.');
        return;
      }

      setRespuestaIA(datos);
      setEstadoIA('lista');
    } catch {
      setEstadoIA('error');
      setErrorIA('No hay conexión. Inténtalo de nuevo.');
    }
  }

  if (compacto) {
    return (
      <form onSubmit={onSubmit} role="search" className="group relative max-w-md">
        <label htmlFor="buscador-nav" className="sr-only">
          Buscar soluciones
        </label>
        <Icono
          nombre="buscar"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2
                     text-ink/35 transition-colors duration-fast ease-out
                     group-focus-within:text-brand-600"
        />
        <input
          id="buscador-nav"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar soluciones…"
          className="w-full rounded-xl border border-ink/10 bg-ink/[0.03] py-2 pl-9 pr-3 text-sm
                     outline-none transition-[background-color,border-color] duration-fast ease-out
                     placeholder:text-ink/40
                     hover:border-ink/20
                     focus:border-brand-500 focus:bg-white
                     focus-visible:ring-2 focus-visible:ring-brand-500/30"
        />
      </form>
    );
  }

  return (
    <div>
      <form
        onSubmit={onSubmit}
        role="search"
        className="group flex w-full items-center gap-2 rounded-2xl border border-ink/10
                   bg-white p-2 shadow-card
                   transition-[box-shadow,border-color] duration-base ease-out
                   focus-within:border-brand-400 focus-within:shadow-lift"
      >
        <label htmlFor="buscador-hero" className="sr-only">
          Buscar soluciones
        </label>

        <Icono
          nombre="buscar"
          className="ml-2 h-5 w-5 shrink-0 text-ink/35
                     transition-colors duration-fast ease-out
                     group-focus-within:text-brand-600"
        />

        <input
          id="buscador-hero"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (estadoIA !== 'idle') {
              setEstadoIA('idle');
              setRespuestaIA(null);
              setErrorIA(null);
            }
          }}
          placeholder="¿Qué quieres automatizar?"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-ink outline-none
                     placeholder:text-ink/40 sm:text-base"
        />

        <button type="submit" className="btn-primary shrink-0 px-4 py-2.5 sm:px-5">
          Buscar
        </button>
      </form>

      <button
        type="button"
        onClick={preguntarIA}
        disabled={estadoIA === 'pensando'}
        className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium
                    transition-colors duration-fast ease-out disabled:cursor-wait disabled:opacity-60
                    ${oscuro ? 'text-brand-300 hover:text-brand-200' : 'text-brand-700 hover:text-brand-800'}`}
      >
        <Icono nombre="chispa" className="h-4 w-4" />
        {estadoIA === 'pensando' ? 'Pensando…' : '¿No sabes qué buscar? Pregúntale a la IA'}
      </button>

      {estadoIA === 'error' && errorIA ? (
        <p role="alert" className={`mt-2 text-sm ${oscuro ? 'text-red-300' : 'text-red-600'}`}>
          {errorIA}
        </p>
      ) : null}

      {estadoIA === 'lista' && respuestaIA ? (
        <div className="mt-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
            <Icono nombre="chispa" className="h-3.5 w-3.5" />
            Recomendación de la IA
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">{respuestaIA.respuesta}</p>
          {respuestaIA.productos.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {respuestaIA.productos.map((producto) => (
                <Link
                  key={producto.slug}
                  href={`/p/${producto.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700
                             transition-colors duration-fast ease-out hover:text-brand-800"
                >
                  Ver {producto.titulo}
                  <Icono nombre="flecha" className="h-4 w-4" />
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
