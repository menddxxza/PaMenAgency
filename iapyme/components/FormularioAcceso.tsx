'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Modo = 'entrar' | 'registro' | 'recuperar';

export default function FormularioAcceso({
  volver,
  registroInicial,
}: {
  volver: string;
  registroInicial: boolean;
}) {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>(registroInicial ? 'registro' : 'entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCargando(true);
    setError(null);
    setAviso(null);

    const supabase = createClient();

    if (modo === 'recuperar') {
      const { error: errorRecuperar } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?volver=${encodeURIComponent('/dashboard/cuenta?recuperada=1')}`,
      });

      if (errorRecuperar) {
        setError(traducirError(errorRecuperar.message));
      } else {
        // No se confirma si el email existe o no: evita que alguien use este
        // formulario para averiguar qué emails están registrados.
        setAviso('Si ese email tiene cuenta, te hemos enviado un enlace para recuperarla.');
      }

      setCargando(false);
      return;
    }

    if (modo === 'registro') {
      const { data, error: errorRegistro } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: nombre },
          emailRedirectTo: `${window.location.origin}/auth/callback?volver=${encodeURIComponent(volver)}`,
        },
      });

      if (errorRegistro) {
        setError(traducirError(errorRegistro.message));
        setCargando(false);
        return;
      }

      // Con confirmación de email activada no hay sesión todavía.
      if (!data.session) {
        setAviso('Te hemos enviado un email para confirmar la cuenta.');
        setCargando(false);
        return;
      }
    } else {
      const { error: errorLogin } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (errorLogin) {
        setError(traducirError(errorLogin.message));
        setCargando(false);
        return;
      }
    }

    router.push(volver);
    router.refresh();
  }

  async function entrarConGoogle() {
    setError(null);
    const supabase = createClient();
    const { error: errorOauth } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?volver=${encodeURIComponent(volver)}`,
      },
    });
    if (errorOauth) setError(traducirError(errorOauth.message));
  }

  return (
    <div>
      {modo !== 'recuperar' ? (
        <>
          <button type="button" onClick={entrarConGoogle} className="btn-secondary w-full">
            <span aria-hidden>🇬</span> Continuar con Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-ink/40">
            <span className="h-px flex-1 bg-ink/10" />o con tu email
            <span className="h-px flex-1 bg-ink/10" />
          </div>
        </>
      ) : (
        <p className="mb-6 text-sm text-ink/60">
          Escribe tu email y te mandamos un enlace para poner una contraseña nueva.
        </p>
      )}

      <form onSubmit={onSubmit}>
        {modo === 'registro' ? (
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-semibold">
              Tu nombre o el de tu empresa
            </label>
            <input
              id="nombre"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink/15 px-4 py-3 text-sm
                         outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ink/15 px-4 py-3 text-sm
                       outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {modo !== 'recuperar' ? (
          <div className="mt-4">
            <label htmlFor="password" className="block text-sm font-semibold">
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
              className="mt-1.5 w-full rounded-xl border border-ink/15 px-4 py-3 text-sm
                         outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {modo === 'registro' ? (
              <p className="mt-1.5 text-xs text-ink/50">Mínimo 8 caracteres.</p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setModo('recuperar');
                  setError(null);
                  setAviso(null);
                }}
                className="mt-1.5 text-xs font-medium text-brand-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="mt-4 text-sm font-medium text-red-600">
            {error}
          </p>
        ) : null}

        {aviso ? (
          <p className="mt-4 rounded-xl bg-accent-500/10 p-3 text-sm font-medium text-accent-700">
            {aviso}
          </p>
        ) : null}

        <button type="submit" disabled={cargando} className="btn-primary mt-6 w-full disabled:opacity-60">
          {cargando
            ? 'Un momento…'
            : modo === 'registro'
              ? 'Crear cuenta'
              : modo === 'recuperar'
                ? 'Enviar enlace'
                : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        {modo === 'recuperar' ? (
          <button
            type="button"
            onClick={() => {
              setModo('entrar');
              setError(null);
              setAviso(null);
            }}
            className="font-semibold text-brand-600 hover:underline"
          >
            ← Volver a entrar
          </button>
        ) : (
          <>
            {modo === 'registro' ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setModo(modo === 'registro' ? 'entrar' : 'registro');
                setError(null);
                setAviso(null);
              }}
              className="font-semibold text-brand-600 hover:underline"
            >
              {modo === 'registro' ? 'Entra' : 'Créala gratis'}
            </button>
          </>
        )}
      </p>
    </div>
  );
}

function traducirError(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.';
  if (m.includes('already registered')) return 'Ya existe una cuenta con ese email.';
  if (m.includes('email not confirmed')) return 'Confirma tu email antes de entrar.';
  if (m.includes('password should be')) return 'La contraseña debe tener al menos 8 caracteres.';
  if (m.includes('provider is not enabled')) return 'El acceso con Google no está activado todavía.';
  return 'No hemos podido completar la operación. Inténtalo de nuevo.';
}
