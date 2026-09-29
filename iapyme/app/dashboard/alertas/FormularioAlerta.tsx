'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Familia } from '@/lib/tipos-publicacion';
import { crearAlerta } from './actions';

export default function FormularioAlerta({ familias }: { familias: Familia[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  return (
    <form
      className="mt-4 grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        if (guardando) return;
        setGuardando(true);
        setError(null);

        const resultado = await crearAlerta(new FormData(e.currentTarget));
        setGuardando(false);

        if (!resultado.ok) {
          setError(resultado.error);
          return;
        }
        e.currentTarget.reset();
        router.refresh();
      }}
    >
      <label className="block">
        <span className="text-xs font-semibold text-ink/70">Qué buscas</span>
        <input
          name="termino"
          placeholder="facturación automática…"
          maxLength={200}
          className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none
                     focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-ink/70">Tipo</span>
        <select
          name="familia"
          className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none
                     focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        >
          <option value="">Cualquiera</option>
          {familias.map((f) => (
            <option key={f.slug} value={f.slug}>
              {f.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-ink/70">Provincia</span>
        <input
          name="provincia"
          placeholder="Cádiz…"
          maxLength={80}
          className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none
                     focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </label>

      <button type="submit" disabled={guardando} className="btn-primary disabled:opacity-60">
        {guardando ? 'Guardando…' : 'Crear alerta'}
      </button>

      {error ? (
        <p role="alert" className="sm:col-span-4 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </form>
  );
}
