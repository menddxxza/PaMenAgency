'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Notificacion } from '@/lib/queries';
import Icono from './Icono';

function haceCuanto(iso: string): string {
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutos < 1) return 'ahora';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  return `hace ${dias} d`;
}

/**
 * La campana del panel: agrupa en un solo sitio lo que antes vivía repartido
 * entre el badge de "Mensajes" y el hecho de tener que entrar a cada hilo
 * para enterarte de que había algo nuevo. `items` y `total` llegan ya
 * calculados desde el layout (Server Component) — este componente solo
 * pinta y abre/cierra el desplegable.
 */
export default function CentroNotificaciones({
  items,
  total,
}: {
  items: Notificacion[];
  total: number;
}) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function alHacerClicFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener('mousedown', alHacerClicFuera);
    return () => document.removeEventListener('mousedown', alHacerClicFuera);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="true"
        aria-expanded={abierto}
        aria-label={total > 0 ? `${total} notificaciones sin leer` : 'Notificaciones'}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink/60
                   transition hover:bg-ink/[0.05] hover:text-ink"
      >
        <Icono nombre="campana" className="h-5 w-5" />
        {total > 0 ? (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center
                       rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white"
          >
            {total > 9 ? '9+' : total}
          </span>
        ) : null}
      </button>

      {abierto ? (
        <div
          className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-xl
                     border border-ink/10 bg-white shadow-card"
        >
          <p className="border-b border-ink/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-ink/50">
            Notificaciones
          </p>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink/50">
              Nada pendiente por ahora.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((item) => (
                <li key={`${item.leadId}-${item.fecha}`}>
                  <Link
                    href={`/dashboard/leads/${item.leadId}`}
                    onClick={() => setAbierto(false)}
                    className="block px-4 py-3 transition hover:bg-ink/[0.03]"
                  >
                    <p className="truncate text-sm font-semibold text-ink">{item.titulo}</p>
                    <p className="mt-0.5 truncate text-xs text-ink/55">{item.detalle}</p>
                    <p className="mt-1 text-[11px] text-ink/40">{haceCuanto(item.fecha)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/dashboard/leads"
            onClick={() => setAbierto(false)}
            className="block border-t border-ink/10 px-4 py-2.5 text-center text-xs font-semibold
                       text-brand-600 hover:bg-ink/[0.03]"
          >
            Ver todos los mensajes →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
