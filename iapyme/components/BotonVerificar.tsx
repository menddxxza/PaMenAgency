'use client';

import { useState, useTransition } from 'react';
import { verificarVendedor } from '@/app/admin/actions';

export default function BotonVerificar({
  id,
  verificadoInicial,
}: {
  id: string;
  verificadoInicial: boolean;
}) {
  const [verificado, setVerificado] = useState(verificadoInicial);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  function alternar() {
    const siguiente = !verificado;
    setVerificado(siguiente);
    setError(null);

    startTransition(async () => {
      const resultado = await verificarVendedor(id, siguiente);
      if (!resultado.ok) {
        setVerificado(!siguiente);
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
          verificado ? 'border-accent-400 text-accent-700' : ''
        }`}
      >
        {verificado ? '✓ Verificado — quitar' : 'Marcar verificado'}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
