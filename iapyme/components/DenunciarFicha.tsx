'use client';

import { useState, useTransition } from 'react';
import { denunciarFicha } from '@/app/p/[slug]/actions';
import Icono from './Icono';

const MOTIVOS = [
  { valor: 'estafa', etiqueta: 'Parece una estafa' },
  { valor: 'inapropiado', etiqueta: 'Contenido inapropiado' },
  { valor: 'falsos', etiqueta: 'Precio o datos falsos' },
  { valor: 'spam', etiqueta: 'Spam o duplicado' },
  { valor: 'otro', etiqueta: 'Otro motivo' },
];

type Estado = 'cerrado' | 'abierto' | 'enviada';

/** "Denunciar" al estilo Wallapop/Vinted/Milanuncios: para lo que se cuela después de la revisión inicial. */
export default function DenunciarFicha({ productId }: { productId: string }) {
  const [estado, setEstado] = useState<Estado>('cerrado');
  const [motivo, setMotivo] = useState('estafa');
  const [detalle, setDetalle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  if (estado === 'enviada') {
    return <p className="text-xs text-ink/50">Gracias, la vamos a revisar.</p>;
  }

  if (estado === 'cerrado') {
    return (
      <button
        type="button"
        onClick={() => setEstado('abierto')}
        className="inline-flex items-center gap-1 text-xs text-ink/40 hover:text-ink/70"
      >
        <Icono nombre="bandera" className="h-3.5 w-3.5" />
        Denunciar esta ficha
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-ink/[0.02] p-4 text-left">
      <p className="text-sm font-bold">¿Qué pasa con esta ficha?</p>

      <select
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        className="mt-2 w-full rounded-lg border border-ink/15 px-2.5 py-1.5 text-sm outline-none
                   focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      >
        {MOTIVOS.map((m) => (
          <option key={m.valor} value={m.valor}>
            {m.etiqueta}
          </option>
        ))}
      </select>

      <textarea
        value={detalle}
        onChange={(e) => setDetalle(e.target.value)}
        rows={2}
        maxLength={1000}
        placeholder="Algo más que debamos saber (opcional)"
        className="mt-2 w-full resize-y rounded-lg border border-ink/15 px-2.5 py-1.5 text-xs outline-none
                   focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={pendiente}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const resultado = await denunciarFicha(productId, motivo, detalle);
              if (resultado.ok) setEstado('enviada');
              else setError(resultado.error);
            });
          }}
          className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink/85 disabled:opacity-60"
        >
          {pendiente ? 'Enviando…' : 'Enviar denuncia'}
        </button>
        <button
          type="button"
          onClick={() => setEstado('cerrado')}
          className="text-xs font-medium text-ink/50 hover:text-ink"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
