'use client';

import { useState } from 'react';
import { entrar, registrarYEntrar } from '@/app/entrar/actions';

export default function FormularioAcceso({
  volver,
  registroInicial = false,
}: {
  volver: string;
  registroInicial?: boolean;
}) {
  const [registro, setRegistro] = useState(registroInicial);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setError(null);

    const resultado = registro
      ? await registrarYEntrar(email, password, volver)
      : await entrar(email, password, volver);

    // Si ha ido bien, entrar()/registrarYEntrar() ya han redirigido lanzando el
    // NEXT_REDIRECT de signIn() — esta línea solo se alcanza en caso de error.
    if (!resultado.ok) {
      setError(resultado.error);
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

      <div>
        <label className="etiqueta-campo" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete={registro ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="campo"
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={enviando} className="btn-primary w-full">
        {enviando ? 'Un momento…' : registro ? 'Crear cuenta' : 'Entrar'}
      </button>

      <button
        type="button"
        className="block w-full text-center text-sm text-ink/60 underline underline-offset-4 hover:text-ink"
        onClick={() => {
          setRegistro(!registro);
          setError(null);
        }}
      >
        {registro ? 'Ya tengo cuenta' : 'Crear una cuenta'}
      </button>
    </form>
  );
}
