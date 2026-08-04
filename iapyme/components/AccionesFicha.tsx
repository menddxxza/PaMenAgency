'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductStatus } from '@/lib/database.types';
import { archivarProducto, enviarARevision } from '@/app/dashboard/actions';

export default function AccionesFicha({
  id,
  slug,
  status,
}: {
  id: string;
  slug: string;
  status: ProductStatus;
}) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function ejecutar(accion: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const resultado = await accion();
      if (!resultado.ok) setError(resultado.error ?? 'Algo ha fallado.');
      else router.refresh();
    });
  }

  const puedeEnviar = status === 'draft' || status === 'rejected';

  return (
    <div className="flex shrink-0 flex-col items-stretch gap-2">
      <Link href={`/dashboard/productos/${id}`} className="btn-secondary py-2 text-center">
        Editar
      </Link>

      {status === 'published' ? (
        <Link href={`/p/${slug}`} className="btn-secondary py-2 text-center">
          Ver ficha
        </Link>
      ) : null}

      {puedeEnviar ? (
        <button
          type="button"
          disabled={pendiente}
          onClick={() => ejecutar(() => enviarARevision(id))}
          className="btn-primary py-2 disabled:opacity-60"
        >
          {pendiente ? 'Enviando…' : 'Enviar a revisión'}
        </button>
      ) : null}

      {status !== 'archived' ? (
        <button
          type="button"
          disabled={pendiente}
          onClick={() => {
            if (confirm('¿Archivar esta ficha? Dejará de estar visible en el catálogo.')) {
              ejecutar(() => archivarProducto(id));
            }
          }}
          className="text-xs font-medium text-ink/45 hover:text-red-600 disabled:opacity-60"
        >
          Archivar
        </button>
      ) : null}

      {error ? (
        <p role="alert" className="max-w-[12rem] text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
