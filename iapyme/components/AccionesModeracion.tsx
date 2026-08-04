'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { aprobarFicha, destacarFicha, rechazarFicha } from '@/app/admin/actions';

export default function AccionesModeracion({
  id,
  destacada,
}: {
  id: string;
  destacada: boolean;
}) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [destacar, setDestacar] = useState(destacada);

  function ejecutar(accion: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const resultado = await accion();
      if (!resultado.ok) setError(resultado.error ?? 'Algo ha fallado.');
      else {
        setRechazando(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="lg:border-l lg:border-ink/10 lg:pl-6">
      {rechazando ? (
        <div>
          <label htmlFor={`motivo-${id}`} className="text-sm font-bold">
            ¿Qué tiene que corregir?
          </label>
          <p className="mt-0.5 text-xs text-ink/55">
            Lo verá el vendedor en su panel. Sé concreto.
          </p>
          <textarea
            id={`motivo-${id}`}
            rows={4}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Falta indicar qué cuenta hace falta para instalarlo, y no hay ninguna captura del producto funcionando."
            className="mt-2 w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none
                       focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={pendiente}
              onClick={() => ejecutar(() => rechazarFicha(id, motivo))}
              className="btn bg-red-600 py-2 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {pendiente ? 'Enviando…' : 'Pedir cambios'}
            </button>
            <button
              type="button"
              onClick={() => {
                setRechazando(false);
                setError(null);
              }}
              className="btn-secondary py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            disabled={pendiente}
            onClick={() => ejecutar(() => aprobarFicha(id))}
            className="btn w-full bg-accent-500 py-2.5 text-white hover:bg-accent-600 disabled:opacity-60"
          >
            {pendiente ? 'Publicando…' : 'Aprobar y publicar'}
          </button>

          <button
            type="button"
            disabled={pendiente}
            onClick={() => setRechazando(true)}
            className="btn-secondary w-full py-2.5"
          >
            Pedir cambios
          </button>

          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={destacar}
              disabled={pendiente}
              onChange={(e) => {
                setDestacar(e.target.checked);
                ejecutar(() => destacarFicha(id, e.target.checked));
              }}
              className="h-4 w-4 rounded border-ink/25"
            />
            Destacar en portada
          </label>
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
