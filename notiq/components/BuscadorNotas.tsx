'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Buscador con debounce. Escribe en la URL en lugar de guardar estado local para
 * que la búsqueda se pueda compartir, recargar y navegar hacia atrás.
 */
export default function BuscadorNotas({
  valorInicial,
  carpeta,
}: {
  valorInicial: string;
  carpeta?: string;
}) {
  const router = useRouter();
  const [valor, setValor] = useState(valorInicial);
  const primeraVez = useRef(true);

  useEffect(() => {
    // Sin esto, montar el componente relanza la navegación que acaba de traernos aquí.
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }

    const temporizador = setTimeout(() => {
      const params = new URLSearchParams();
      if (valor.trim()) params.set('q', valor.trim());
      else if (carpeta) params.set('carpeta', carpeta);

      const query = params.toString();
      router.replace(query ? `/notas?${query}` : '/notas');
    }, 300);

    return () => clearTimeout(temporizador);
  }, [valor, carpeta, router]);

  return (
    <div className="relative max-w-md">
      <span aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35">
        ⌕
      </span>
      <input
        type="search"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder='Buscar en todas tus notas… ("frase exacta", -excluir)'
        aria-label="Buscar notas"
        className="campo pl-9"
      />
    </div>
  );
}
