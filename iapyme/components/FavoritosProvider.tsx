'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type FavoritosContexto = {
  cargado: boolean;
  esFavorito: (productId: string) => boolean;
  alternar: (productId: string) => Promise<void>;
};

const Contexto = createContext<FavoritosContexto | null>(null);

/**
 * Un solo GET /api/favoritos por carga de página, compartido por todas las
 * tarjetas de producto vía contexto. Así el corazón de cada tarjeta no fuerza
 * su propia consulta de sesión en el servidor: eso obligaría a la home y a
 * las páginas de categoría (hoy estáticas con caché de 60s) a renderizarse
 * en cada petición solo para saber quién ha iniciado sesión.
 */
export default function FavoritosProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [cargado, setCargado] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelado = false;

    fetch('/api/favoritos')
      .then((res) => (res.ok ? res.json() : { ids: [] }))
      .then((datos: { ids?: string[] }) => {
        if (!cancelado) {
          setIds(new Set(datos.ids ?? []));
          setCargado(true);
        }
      })
      .catch(() => {
        if (!cancelado) setCargado(true);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const esFavorito = useCallback((productId: string) => ids.has(productId), [ids]);

  const alternar = useCallback(
    async (productId: string) => {
      const yaEra = ids.has(productId);

      setIds((actual) => {
        const siguiente = new Set(actual);
        if (yaEra) siguiente.delete(productId);
        else siguiente.add(productId);
        return siguiente;
      });

      try {
        const res = yaEra
          ? await fetch(`/api/favoritos?productId=${encodeURIComponent(productId)}`, {
              method: 'DELETE',
            })
          : await fetch('/api/favoritos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId }),
            });

        if (res.status === 401) {
          setIds((actual) => {
            const revertido = new Set(actual);
            if (yaEra) revertido.add(productId);
            else revertido.delete(productId);
            return revertido;
          });
          router.push(`/entrar?volver=${encodeURIComponent(pathname)}`);
          return;
        }

        if (!res.ok) throw new Error('fallo al guardar');
      } catch {
        setIds((actual) => {
          const revertido = new Set(actual);
          if (yaEra) revertido.add(productId);
          else revertido.delete(productId);
          return revertido;
        });
      }
    },
    [ids, router, pathname],
  );

  return (
    <Contexto.Provider value={{ cargado, esFavorito, alternar }}>{children}</Contexto.Provider>
  );
}

export function useFavoritos() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useFavoritos debe usarse dentro de <FavoritosProvider>');
  return contexto;
}
