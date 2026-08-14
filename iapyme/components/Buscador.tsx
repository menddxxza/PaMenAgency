'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Icono from './Icono';

/**
 * useSearchParams() obliga a renderizar en cliente, y sin un límite de Suspense
 * eso tumba el prerenderizado estático de cualquier página que monte el buscador.
 * El límite va aquí para que ningún consumidor tenga que acordarse de ponerlo.
 */
export default function Buscador({ compacto = false }: { compacto?: boolean }) {
  return (
    <Suspense fallback={<BuscadorEsqueleto compacto={compacto} />}>
      <BuscadorInterno compacto={compacto} />
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

function BuscadorInterno({ compacto }: { compacto: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const termino = q.trim();
    router.push(termino ? `/buscar?q=${encodeURIComponent(termino)}` : '/buscar');
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
        onChange={(e) => setQ(e.target.value)}
        placeholder="¿Qué quieres automatizar?"
        className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-ink outline-none
                   placeholder:text-ink/40 sm:text-base"
      />

      <button type="submit" className="btn-primary shrink-0 px-4 py-2.5 sm:px-5">
        Buscar
      </button>
    </form>
  );
}
