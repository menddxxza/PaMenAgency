'use client';

import { useState } from 'react';
import Estrellas from '@/components/Estrellas';
import { fechaRelativa } from '@/lib/formato';
import type { ResenaConAutor } from '@/lib/database.types';

type Estado = 'cerrado' | 'abierto' | 'enviando' | 'ok';

export default function ResenasProducto({
  productId,
  tituloProducto,
  resenas,
  ratingPromedio,
  ratingTotal,
  sesionIniciada,
  yaHaResenado,
}: {
  productId: string;
  tituloProducto: string;
  resenas: ResenaConAutor[];
  ratingPromedio: number;
  ratingTotal: number;
  sesionIniciada: boolean;
  yaHaResenado: boolean;
}) {
  const [estado, setEstado] = useState<Estado>('cerrado');
  const [error, setError] = useState<string | null>(null);
  const [puntuacion, setPuntuacion] = useState(5);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado('enviando');
    setError(null);

    const datos = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...datos, productId, puntuacion }),
      });
      const cuerpo = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(cuerpo.error ?? 'No hemos podido guardarla. Inténtalo de nuevo.');
        setEstado('abierto');
        return;
      }

      setEstado('ok');
    } catch {
      setError('No hay conexión. Inténtalo de nuevo.');
      setEstado('abierto');
    }
  }

  return (
    <section>
      <h2 className="eyebrow">Reseñas</h2>

      <div className="mt-3 flex items-center gap-3">
        {ratingTotal > 0 ? (
          <>
            <Estrellas puntuacion={ratingPromedio} tamano="text-xl" />
            <p className="text-sm text-ink/60">
              <span className="font-bold text-ink">{ratingPromedio.toFixed(1)}</span> sobre 5 ·{' '}
              {ratingTotal} {ratingTotal === 1 ? 'reseña' : 'reseñas'}
            </p>
          </>
        ) : (
          <p className="text-sm text-ink/60">Todavía no hay reseñas de esta solución.</p>
        )}
      </div>

      <div className="mt-6 max-w-md">
        {yaHaResenado ? (
          <p className="rounded-lg bg-ink/[0.04] px-4 py-3 text-sm text-ink/60">
            Ya has dejado tu reseña en esta solución. Gracias.
          </p>
        ) : !sesionIniciada ? (
          <p className="rounded-lg bg-ink/[0.04] px-4 py-3 text-sm text-ink/60">
            <a href="/entrar" className="font-semibold text-brand-700 hover:underline">
              Inicia sesión
            </a>{' '}
            para dejar tu reseña.
          </p>
        ) : estado === 'ok' ? (
          <div className="rounded-xl bg-accent-500/10 p-4 text-center">
            <p className="text-2xl" aria-hidden>
              ✅
            </p>
            <p className="mt-1 text-sm font-bold text-accent-700">Reseña publicada</p>
            <p className="mt-1 text-xs text-ink/65">Gracias por ayudar a otros a decidir.</p>
          </div>
        ) : estado === 'cerrado' ? (
          <button type="button" onClick={() => setEstado('abierto')} className="btn-secondary">
            Dejar una reseña
          </button>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <p className="text-sm font-bold">Valora {tituloProducto}</p>

            <div className="flex gap-1" role="radiogroup" aria-label="Puntuación">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={n === puntuacion}
                  aria-label={`${n} de 5 estrellas`}
                  onClick={() => setPuntuacion(n)}
                  className={`text-2xl leading-none transition-colors ${
                    n <= puntuacion ? 'text-amber-500' : 'text-ink/20 hover:text-amber-400'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="resena-comentario" className="sr-only">
                Tu reseña
              </label>
              <textarea
                id="resena-comentario"
                name="comentario"
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                placeholder="¿Qué tal tu experiencia con esta solución?"
                className="w-full resize-y rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none
                           focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm font-medium text-red-600">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={estado === 'enviando'}
              className="btn-primary disabled:opacity-60"
            >
              {estado === 'enviando' ? 'Publicando…' : 'Publicar reseña'}
            </button>
          </form>
        )}
      </div>

      {resenas.length > 0 ? (
        <ul className="mt-8 space-y-6 border-t border-ink/10 pt-6">
          {resenas.map((resena) => (
            <li key={resena.id}>
              <div className="flex items-center gap-2">
                <p className="font-bold">{resena.profiles?.display_name ?? 'Comprador'}</p>
                <Estrellas puntuacion={resena.puntuacion} />
                <p className="text-xs text-ink/60">{fechaRelativa(resena.created_at)}</p>
              </div>
              <p className="mt-1.5 whitespace-pre-line text-sm text-ink/75">
                {resena.comentario}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
