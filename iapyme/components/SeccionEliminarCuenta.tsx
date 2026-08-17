'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eliminarCuenta } from '@/app/dashboard/actions';
import { createClient } from '@/lib/supabase/client';

type Estado = 'reposo' | 'confirmando' | 'borrando';

export default function SeccionEliminarCuenta() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>('reposo');
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function confirmar() {
    if (texto.trim().toUpperCase() !== 'ELIMINAR') {
      setError('Escribe ELIMINAR, tal cual, para confirmar.');
      return;
    }

    setError(null);
    setEstado('borrando');

    const resultado = await eliminarCuenta();
    if (!resultado.ok) {
      setError(resultado.error);
      setEstado('confirmando');
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <section className="card mt-8 max-w-md border-red-200 p-6">
      <h2 className="font-bold text-red-700">Eliminar cuenta</h2>
      <p className="mt-1 text-sm text-ink/60">
        Se borra todo: tus fichas publicadas, los mensajes recibidos, tus reseñas y
        favoritos. No se puede deshacer.
      </p>

      {estado === 'reposo' ? (
        <button
          type="button"
          onClick={() => setEstado('confirmando')}
          className="btn-secondary mt-4 border-red-300 text-red-700 hover:bg-red-50"
        >
          Eliminar mi cuenta
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <label htmlFor="confirmar-borrado" className="text-sm font-semibold">
            Escribe <span className="font-mono">ELIMINAR</span> para confirmar
          </label>
          <input
            id="confirmar-borrado"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            disabled={estado === 'borrando'}
            className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm outline-none
                       focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />

          {error ? (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmar}
              disabled={estado === 'borrando'}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white
                         transition hover:bg-red-700 disabled:opacity-60"
            >
              {estado === 'borrando' ? 'Eliminando…' : 'Sí, eliminar definitivamente'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEstado('reposo');
                setTexto('');
                setError(null);
              }}
              disabled={estado === 'borrando'}
              className="btn-ghost"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
