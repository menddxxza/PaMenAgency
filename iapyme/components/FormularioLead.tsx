'use client';

import { useState } from 'react';

type Estado = 'cerrado' | 'abierto' | 'enviando' | 'ok';

export default function FormularioLead({
  productId,
  sellerId,
  tituloProducto,
}: {
  productId: string;
  sellerId: string;
  tituloProducto: string;
}) {
  const [estado, setEstado] = useState<Estado>('cerrado');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado('enviando');
    setError(null);

    const datos = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...datos, productId, sellerId }),
      });
      const cuerpo = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(cuerpo.error ?? 'No hemos podido enviarlo. Inténtalo de nuevo.');
        setEstado('abierto');
        return;
      }

      setEstado('ok');
    } catch {
      setError('No hay conexión. Inténtalo de nuevo.');
      setEstado('abierto');
    }
  }

  if (estado === 'ok') {
    return (
      <div className="rounded-xl bg-accent-500/10 p-4 text-center">
        <p className="text-2xl" aria-hidden>
          ✅
        </p>
        <p className="mt-1 text-sm font-bold text-accent-600">Mensaje enviado</p>
        <p className="mt-1 text-xs text-ink/65">
          {tituloProducto} es de un vendedor que responde directamente. Te escribirá al
          email que nos has dejado.
        </p>
      </div>
    );
  }

  if (estado === 'cerrado') {
    return (
      <button type="button" onClick={() => setEstado('abierto')} className="btn-primary w-full">
        Pedir información
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="text-sm font-bold">Habla con el vendedor</p>

      <div>
        <label htmlFor="lead-nombre" className="sr-only">
          Tu nombre
        </label>
        <input
          id="lead-nombre"
          name="nombre"
          required
          placeholder="Tu nombre"
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none
                     focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div>
        <label htmlFor="lead-email" className="sr-only">
          Tu email
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          required
          placeholder="tu@empresa.com"
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none
                     focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div>
        <label htmlFor="lead-empresa" className="sr-only">
          Tu empresa
        </label>
        <input
          id="lead-empresa"
          name="empresa"
          placeholder="Empresa (opcional)"
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none
                     focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div>
        <label htmlFor="lead-mensaje" className="sr-only">
          Tu mensaje
        </label>
        <textarea
          id="lead-mensaje"
          name="mensaje"
          required
          rows={3}
          defaultValue={`Hola, me interesa ${tituloProducto}. `}
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
        className="btn-primary w-full disabled:opacity-60"
      >
        {estado === 'enviando' ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  );
}
