'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Estado = 'reposo' | 'guardando' | 'guardado';

function traducirError(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (m.includes('password should be')) return 'La contraseña debe tener al menos 8 caracteres.';
  if (m.includes('should be different')) return 'Elige una contraseña distinta de la actual.';
  return 'No hemos podido cambiarla. Inténtalo de nuevo.';
}

export default function FormularioContrasena() {
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [estado, setEstado] = useState<Estado>('reposo');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmar) {
      setError('Las dos contraseñas no coinciden.');
      return;
    }

    setEstado('guardando');
    const supabase = createClient();
    const { error: errorSupabase } = await supabase.auth.updateUser({ password });

    if (errorSupabase) {
      setError(traducirError(errorSupabase.message));
      setEstado('reposo');
      return;
    }

    setPassword('');
    setConfirmar('');
    setEstado('guardado');
    setTimeout(() => setEstado('reposo'), 2500);
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-md space-y-4 p-6">
      <h2 className="font-bold">Cambiar contraseña</h2>

      <div>
        <label htmlFor="cuenta-password" className="text-sm font-semibold">
          Nueva contraseña
        </label>
        <input
          id="cuenta-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
          className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none
                     focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div>
        <label htmlFor="cuenta-password-confirmar" className="text-sm font-semibold">
          Repite la contraseña
        </label>
        <input
          id="cuenta-password-confirmar"
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
          className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none
                     focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={estado === 'guardando'}
          className="btn-primary disabled:opacity-60"
        >
          {estado === 'guardando' ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
        {estado === 'guardado' ? (
          <span className="text-sm font-medium text-accent-700">✓ Cambiada</span>
        ) : null}
      </div>
    </form>
  );
}
