'use client';

import { useState } from 'react';
import { codificarOferta } from '@/lib/formato';

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
  const [conOferta, setConOferta] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado('enviando');
    setError(null);

    const datos = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const precio = Number(datos.precio);
    delete datos.precio;
    if (conOferta && Number.isFinite(precio) && precio > 0) {
      datos.mensaje = codificarOferta(precio, datos.mensaje);
    }

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
        <p className="mt-1 text-sm font-bold text-accent-700">Mensaje enviado</p>
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

      {/* Campo trampa anti-spam: oculto para personas, los bots lo rellenan igual que el resto. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="lead-web">No rellenar</label>
        <input id="lead-web" name="web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

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

      {conOferta ? (
        <div>
          <label htmlFor="lead-precio" className="text-xs font-semibold text-ink/70">
            💶 Propones
          </label>
          <div className="mt-1 flex items-center gap-1.5">
            <input
              id="lead-precio"
              name="precio"
              type="number"
              min={1}
              step={1}
              autoFocus
              placeholder="150"
              className="w-28 rounded-lg border border-ink/15 px-2.5 py-1.5 text-sm outline-none
                         focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <span className="text-sm text-ink/60">€</span>
            <button
              type="button"
              onClick={() => setConOferta(false)}
              className="ml-auto text-xs font-medium text-ink/50 hover:text-ink"
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConOferta(true)}
          className="text-xs font-semibold text-brand-600 hover:underline"
        >
          💶 Proponer un precio
        </button>
      )}

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
