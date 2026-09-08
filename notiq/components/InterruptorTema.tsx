'use client';

import { useEffect, useState } from 'react';

const CLAVE = 'notiq-tema';

/**
 * Alterna la clase `.dark` en `<html>`, que es lo que de verdad cambia el tema
 * (ver las variables --color-* en globals.css). El script inline en
 * app/layout.tsx ya ha puesto esa clase antes de que React hidrate, según lo
 * guardado en localStorage o `prefers-color-scheme` si no hay nada guardado —
 * este componente solo la lee y la toca a partir de ahí.
 */
export default function InterruptorTema() {
  // null mientras no se sabe: sin esto el primer render asumiría "claro" y
  // parpadearía al montar si el usuario ya había elegido oscuro.
  const [oscuro, setOscuro] = useState<boolean | null>(null);

  useEffect(() => {
    setOscuro(document.documentElement.classList.contains('dark'));
  }, []);

  function alternar() {
    const siguiente = !oscuro;
    setOscuro(siguiente);
    document.documentElement.classList.toggle('dark', siguiente);
    try {
      localStorage.setItem(CLAVE, siguiente ? 'oscuro' : 'claro');
    } catch {
      // Navegación privada puede bloquear localStorage: el tema no sobrevive a
      // un refresco, pero el interruptor sigue funcionando en lo que dure la sesión.
    }
  }

  if (oscuro === null) {
    return <div className="h-[74px] w-full max-w-2xl rounded-2xl border border-ink/10" aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={oscuro}
      className="card flex w-full max-w-2xl items-center justify-between gap-4 p-5 text-left transition hover:border-brand-300"
    >
      <div>
        <p className="font-semibold">{oscuro ? 'Modo oscuro' : 'Modo claro'}</p>
        <p className="mt-0.5 text-sm text-ink/55">
          {oscuro ? 'Cambiar a un tema claro.' : 'Cambiar a un tema oscuro.'}
        </p>
      </div>
      <span aria-hidden className="text-2xl">
        {oscuro ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
