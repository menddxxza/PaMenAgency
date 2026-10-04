'use client';

import { useState, useTransition } from 'react';
import { destacarFicha } from '@/app/admin/actions';

export default function BotonDestacar({ id, destacadaInicial }: { id: string; destacadaInicial: boolean }) {
  const [destacada, setDestacada] = useState(destacadaInicial);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  function alternar() {
    const siguiente = !destacada;
    setDestacada(siguiente);
    setError(null);

    startTransition(async () => {
      const resultado = await destacarFicha(id, siguiente);
      if (!resultado.ok) {
        setDestacada(!siguiente);
        setError(resultado.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={alternar}
        disabled={pendiente}
        className={`btn-secondary whitespace-nowrap disabled:opacity-60 ${
          destacada ? 'border-brand-400 text-brand-700' : ''
        }`}
      >
        {destacada ? '★ Destacada — quitar' : 'Destacar'}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
