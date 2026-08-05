'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Modo = 'entrar' | 'registro' | 'enlace';

export default function FormularioAcceso({ volver }: { volver: string }) {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    setAviso(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?volver=${encodeURIComponent(volver)}`;

    try {
      if (modo === 'enlace') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        setAviso('Te hemos enviado un enlace de acceso. Revisa tu correo.');
        return;
      }

      if (modo === 'registro') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        setAviso('Cuenta creada. Confirma tu correo para entrar.');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // refresh() antes de push() para que el layout del servidor se vuelva a
      // renderizar ya con la sesión: si no, /notas se pinta como si no hubiera nadie.
      router.refresh();
      router.push(volver);
    } catch (fallo) {
      setError(mensajeDeError(fallo));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label className="etiqueta-campo" htmlFor="email">
          Correo
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="campo"
          placeholder="tu@correo.com"
        />
      </div>

      {modo !== 'enlace' && (
        <div>
          <label className="etiqueta-campo" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="campo"
            placeholder="Mínimo 8 caracteres"
          />
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {aviso && (
        <p className="rounded-xl bg-lima-400/15 px-3 py-2 text-sm text-lima-600">{aviso}</p>
      )}

      <button type="submit" disabled={enviando} className="btn-primary w-full">
        {enviando
          ? 'Un momento…'
          : modo === 'registro'
            ? 'Crear cuenta'
            : modo === 'enlace'
              ? 'Enviarme un enlace'
              : 'Entrar'}
      </button>

      <div className="flex flex-wrap justify-between gap-2 text-sm text-ink/60">
        <button
          type="button"
          className="underline underline-offset-4 hover:text-ink"
          onClick={() => {
            setModo(modo === 'registro' ? 'entrar' : 'registro');
            setError(null);
            setAviso(null);
          }}
        >
          {modo === 'registro' ? 'Ya tengo cuenta' : 'Crear una cuenta'}
        </button>
        <button
          type="button"
          className="underline underline-offset-4 hover:text-ink"
          onClick={() => {
            setModo(modo === 'enlace' ? 'entrar' : 'enlace');
            setError(null);
            setAviso(null);
          }}
        >
          {modo === 'enlace' ? 'Usar contraseña' : 'Entrar sin contraseña'}
        </button>
      </div>
    </form>
  );
}

function mensajeDeError(fallo: unknown): string {
  const mensaje = fallo instanceof Error ? fallo.message : '';

  if (/Invalid login credentials/i.test(mensaje)) return 'Correo o contraseña incorrectos.';
  if (/already registered/i.test(mensaje)) return 'Ya existe una cuenta con este correo.';
  if (/Email not confirmed/i.test(mensaje)) return 'Confirma tu correo antes de entrar.';
  if (/rate limit|too many/i.test(mensaje)) return 'Demasiados intentos. Prueba en un minuto.';

  return 'No hemos podido completar la operación. Inténtalo de nuevo.';
}
