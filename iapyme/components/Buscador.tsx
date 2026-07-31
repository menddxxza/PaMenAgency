'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
    <div className="h-[38px] w-full max-w-md rounded-xl border border-ink/15 bg-ink/[0.02]" />
  ) : (
    <div className="mx-auto h-[60px] w-full max-w-2xl rounded-2xl bg-white shadow-card" />
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
      <form onSubmit={onSubmit} role="search">
        <label htmlFor="buscador-nav" className="sr-only">
          Buscar soluciones
        </label>
        <input
          id="buscador-nav"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar soluciones de IA…"
          className="w-full max-w-md rounded-xl border border-ink/15 bg-ink/[0.02] px-4 py-2 text-sm
                     outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500"
        />
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-card"
    >
      <label htmlFor="buscador-hero" className="sr-only">
        Buscar soluciones
      </label>
      <input
        id="buscador-hero"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="¿Qué quieres automatizar? Ej: responder WhatsApp, hacer facturas…"
        className="flex-1 bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/40"
      />
      <button type="submit" className="btn-primary shrink-0">
        Buscar
      </button>
    </form>
  );
}
