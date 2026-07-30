'use client';

import { useState } from 'react';

type Perfil = 'comprador' | 'vendedor' | 'ambos';
type Estado = 'idle' | 'enviando' | 'ok' | 'error';

const OPCIONES: { valor: Perfil; etiqueta: string; ayuda: string }[] = [
  { valor: 'comprador', etiqueta: 'Quiero comprar', ayuda: 'Busco soluciones de IA para mi negocio' },
  { valor: 'vendedor', etiqueta: 'Quiero vender', ayuda: 'Tengo automatizaciones o proyectos que vender' },
  { valor: 'ambos', etiqueta: 'Las dos cosas', ayuda: 'Compro y vendo' },
];

export default function WaitlistForm({
  perfilInicial = 'comprador',
  origen,
}: {
  perfilInicial?: Perfil;
  origen: string;
}) {
  const [perfil, setPerfil] = useState<Perfil>(perfilInicial);
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [estado, setEstado] = useState<Estado>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado('enviando');
    setError(null);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, perfil, mensaje, origen }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Algo ha fallado. Inténtalo de nuevo.');
        setEstado('error');
        return;
      }

      setEstado('ok');
    } catch {
      setError('No hay conexión. Inténtalo de nuevo.');
      setEstado('error');
    }
  }

  if (estado === 'ok') {
    return (
      <div className="card p-6 text-center">
        <p className="text-2xl">🎉</p>
        <h3 className="mt-2 text-lg font-bold">Estás dentro</h3>
        <p className="mt-1 text-sm text-ink/70">
          Te escribiremos en cuanto abramos el acceso.
          {perfil !== 'comprador'
            ? ' Como vendedor entras en la primera tanda: sin comisión durante los primeros 3 meses.'
            : ' Mientras tanto, cuéntanos qué necesitas y buscamos quién lo haya construido ya.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6">
      <fieldset>
        <legend className="text-sm font-semibold">¿Qué te trae por aquí?</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {OPCIONES.map((opcion) => {
            const activo = perfil === opcion.valor;
            return (
              <label
                key={opcion.valor}
                className={`cursor-pointer rounded-xl border p-3 text-left transition ${
                  activo
                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                    : 'border-ink/15 hover:border-ink/30'
                }`}
              >
                <input
                  type="radio"
                  name="perfil"
                  value={opcion.valor}
                  checked={activo}
                  onChange={() => setPerfil(opcion.valor)}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold">{opcion.etiqueta}</span>
                <span className="mt-0.5 block text-xs text-ink/60">{opcion.ayuda}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4">
        <label htmlFor={`email-${origen}`} className="block text-sm font-semibold">
          Tu email
        </label>
        <input
          id={`email-${origen}`}
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@empresa.com"
          className="mt-1.5 w-full rounded-xl border border-ink/15 px-4 py-3 text-sm
                     outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="mt-4">
        <label htmlFor={`mensaje-${origen}`} className="block text-sm font-semibold">
          {perfil === 'vendedor'
            ? '¿Qué venderías? (opcional)'
            : '¿Qué te gustaría automatizar? (opcional)'}
        </label>
        <textarea
          id={`mensaje-${origen}`}
          rows={3}
          value={mensaje}
          onChange={(event) => setMensaje(event.target.value)}
          placeholder={
            perfil === 'vendedor'
              ? 'Ej: automatizaciones de n8n para ecommerce, un bot de soporte…'
              : 'Ej: responder WhatsApp fuera de horario, generar facturas…'
          }
          className="mt-1.5 w-full resize-y rounded-xl border border-ink/15 px-4 py-3 text-sm
                     outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="btn-primary mt-5 w-full disabled:opacity-60"
      >
        {estado === 'enviando' ? 'Enviando…' : 'Entrar en la lista de espera'}
      </button>

      <p className="mt-3 text-center text-xs text-ink/50">
        Sin spam. Solo te escribimos cuando abramos el acceso.
      </p>
    </form>
  );
}
