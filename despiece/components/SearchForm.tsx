'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Buscador de la home. Escribe en la query (?q=) para que el resultado
 * sea una URL compartible y la búsqueda siga ocurriendo en Postgres.
 */
export function SearchForm({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const push = (q: string) => {
    router.push(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : '/');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        clearTimeout(timer.current);
        push(value);
      }}
      role="search"
    >
      <label className="label mb-2 block" htmlFor="q">
        Vehículo o componente
      </label>
      <div className="flex gap-2">
        <input
          id="q"
          name="q"
          autoFocus={autoFocus}
          autoComplete="off"
          className="input font-mono"
          placeholder="león 2.0 tdi 150 · turbo · válvula egr"
          value={value}
          onChange={(e) => {
            const next = e.target.value;
            setValue(next);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => push(next), 320);
          }}
        />
        <button type="submit" className="btn btn-accent">
          Buscar
        </button>
      </div>
    </form>
  );
}
