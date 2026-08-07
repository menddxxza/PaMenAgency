'use client';

import { Caveat } from 'next/font/google';

const caveat = Caveat({ subsets: ['latin'], weight: ['700'] });

/**
 * Fondo decorativo de la landing: "Notiq" escribiéndose solo en bucle, con un
 * lápiz que lo sigue. Puramente estético — `pointer-events-none` y opacidad baja
 * para no interferir con los clics ni con la legibilidad del contenido real, que
 * va siempre encima con su propio fondo opaco.
 *
 * Fijo (`fixed`) y con z-index negativo: cubre toda la ventana y no se mueve al
 * hacer scroll, pero queda detrás de cualquier elemento normal de la página sin
 * que haga falta subir el z-index de nada más.
 */
export default function FondoAnimado() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-paper">
      <svg
        viewBox="0 0 1000 320"
        className="absolute left-1/2 top-1/2 w-[150vw] max-w-none -translate-x-1/2 -translate-y-1/2 sm:w-[95vw] lg:w-[70vw]"
        fill="none"
      >
        <text
          x="30"
          y="210"
          className={`${caveat.className} notiq-trazo`}
          style={{ fontSize: '210px' }}
        >
          Notiq
        </text>
      </svg>

      <div className="notiq-lapiz absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl sm:text-5xl">
        ✏️
      </div>

      {/* Un par de acentos sueltos para que el fondo no se sienta vacío fuera del texto. */}
      <span className="notiq-acento notiq-acento-1" />
      <span className="notiq-acento notiq-acento-2" />
      <span className="notiq-acento notiq-acento-3" />
    </div>
  );
}
