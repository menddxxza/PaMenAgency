'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

/**
 * Apartado que se abre por encima de la página para contarlo en detalle, con
 * su botón de salir bien visible (arriba y abajo), Escape y clic fuera.
 *
 * El contenido llega como `children` desde el servidor, así que el texto largo
 * se renderiza en HTML aunque el usuario nunca abra el panel: es contenido
 * indexable, no algo que solo exista si hay JavaScript.
 */
export default function PanelDetalle({
  etiqueta,
  titulo,
  textoBoton = 'Ver en detalle',
  enlace,
  children,
}: {
  etiqueta: string;
  titulo: string;
  textoBoton?: string;
  enlace?: { href: string; texto: string };
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const idTitulo = useId();
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const disparadorRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;

    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierto(false);
    };

    const desbordePrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', alPulsar);
    cerrarRef.current?.focus();

    return () => {
      document.body.style.overflow = desbordePrevio;
      document.removeEventListener('keydown', alPulsar);
    };
  }, [abierto]);

  const cerrar = () => {
    setAbierto(false);
    disparadorRef.current?.focus();
  };

  return (
    <>
      <button
        ref={disparadorRef}
        type="button"
        onClick={() => setAbierto(true)}
        className="group inline-flex items-center gap-2 rounded-full border border-white/25
                   bg-white/10 px-5 py-2.5 text-xs font-medium text-white backdrop-blur-md
                   transition-colors duration-300 hover:bg-white/20 focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-white/70 sm:text-sm"
      >
        {textoBoton}
        <span
          aria-hidden
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        >
          →
        </span>
      </button>

      {/* Copia oculta mientras está cerrado: el texto largo viaja en el HTML
          (indexable, y legible si falla el JavaScript) sin estar a la vista ni
          en el árbol de accesibilidad. Al abrir se quita para no duplicarlo. */}
      {!abierto ? <div hidden>{children}</div> : null}

      {abierto ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          {/* Clic fuera para salir. Es un fondo decorativo: el botón de cerrar
              real está dentro del panel y es el que anuncian los lectores. */}
          <button
            type="button"
            aria-label="Cerrar"
            tabIndex={-1}
            onClick={cerrar}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={idTitulo}
            className="relative flex max-h-[88vh] w-full max-w-2xl flex-col
                       rounded-t-2xl border border-white/15 bg-[#0f0f11]/95 backdrop-blur-md
                       sm:max-h-[85vh] sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/55">
                  {etiqueta}
                </p>
                <h2
                  id={idTitulo}
                  className="mt-1.5 text-lg font-medium tracking-tight text-white sm:text-xl"
                >
                  {titulo}
                </h2>
              </div>

              <button
                ref={cerrarRef}
                type="button"
                onClick={cerrar}
                className="shrink-0 rounded-full border border-white/20 bg-white/10 px-4 py-2
                           text-xs font-medium text-white transition-colors duration-300
                           hover:bg-white/25 focus:outline-none focus-visible:ring-2
                           focus-visible:ring-white/70"
              >
                <span aria-hidden>✕</span> Cerrar
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <div className="space-y-4 text-sm leading-relaxed text-white/75">{children}</div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-white/10 px-5 py-4 sm:px-7">
              {enlace ? (
                <Link
                  href={enlace.href}
                  className="rounded-full bg-white px-5 py-2.5 text-xs font-medium text-black
                             transition-colors duration-300 hover:bg-white/85 focus:outline-none
                             focus-visible:ring-2 focus-visible:ring-white/70 sm:text-sm"
                >
                  {enlace.texto}
                </Link>
              ) : null}

              <button
                type="button"
                onClick={cerrar}
                className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs
                           font-medium text-white transition-colors duration-300
                           hover:bg-white/20 focus:outline-none focus-visible:ring-2
                           focus-visible:ring-white/70 sm:text-sm"
              >
                Salir de este apartado
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
