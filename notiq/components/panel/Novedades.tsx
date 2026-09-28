'use client';

import { useEffect, useState } from 'react';
import { CHANGELOG } from '@/lib/changelog';

const CLAVE_VISTO = 'notiq_novedades_vistas_hasta';

function fechaCorta(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/** Botón "🎉 Novedades" del panel: enseña el changelog (ver lib/changelog.ts)
 * y marca un punto de aviso mientras haya entradas más nuevas que la última
 * vez que se abrió — guardado en localStorage, por dispositivo, como el
 * resto de preferencias puramente de interfaz de este panel. */
export default function Novedades() {
  const [abierto, setAbierto] = useState(false);
  const [visto, setVisto] = useState<string | null>(null);

  useEffect(() => {
    try {
      setVisto(localStorage.getItem(CLAVE_VISTO));
    } catch {
      setVisto(CHANGELOG[0]?.fecha ?? null);
    }
  }, []);

  const hayNovedades = CHANGELOG.length > 0 && (!visto || CHANGELOG[0].fecha > visto);

  function alternar() {
    const siguiente = !abierto;
    setAbierto(siguiente);
    if (siguiente && CHANGELOG[0]) {
      setVisto(CHANGELOG[0].fecha);
      try {
        localStorage.setItem(CLAVE_VISTO, CHANGELOG[0].fecha);
      } catch {
        // Sin persistencia si está bloqueado: volverá a marcar aviso la próxima vez.
      }
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={alternar}
        aria-expanded={abierto}
        className="relative hover:text-ink"
      >
        🎉
        {hayNovedades && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-500"
          />
        )}
        <span className="sr-only">Novedades</span>
      </button>

      {abierto && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setAbierto(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="card absolute right-0 top-full z-20 mt-2 w-80 max-w-[calc(100vw-2.5rem)] overflow-hidden p-0">
            <div className="border-b border-ink/10 px-4 py-3">
              <h3 className="text-sm font-extrabold tracking-tight">Novedades</h3>
            </div>
            <ul className="max-h-96 overflow-y-auto py-1.5">
              {CHANGELOG.map((entrada) => (
                <li key={entrada.fecha} className="px-4 py-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-ink/85">{entrada.titulo}</p>
                    <span className="shrink-0 text-[11px] text-ink/40">{fechaCorta(entrada.fecha)}</span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink/60">{entrada.descripcion}</p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
