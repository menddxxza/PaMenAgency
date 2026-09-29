'use client';

import { useEffect, useState } from 'react';

/**
 * Splash de arranque: logo + barra de progreso, solo en la carga inicial de
 * la app (este componente vive en el layout raíz, que no se vuelve a montar
 * en las navegaciones internas del App Router, así que no reaparece al
 * cambiar de página con un <Link>).
 *
 * La barra no mide una carga real —eso no existe como señal única en la
 * web— sino que avanza rápido al principio y se frena cerca del final,
 * simulando progreso, hasta que la página termina de cargar de verdad
 * (`load`) o hasta un tope de seguridad, momento en el que salta a 100% y
 * se desvanece.
 */
export default function PantallaCarga() {
  const [progreso, setProgreso] = useState(8);
  const [visible, setVisible] = useState(true);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const avance = window.setInterval(() => {
      setProgreso((actual) => {
        if (actual >= 90) return actual;
        return Math.min(actual + (actual < 55 ? 9 : 3), 90);
      });
    }, 130);

    const terminar = () => {
      window.clearInterval(avance);
      setProgreso(100);
      window.setTimeout(() => setSaliendo(true), 200);
      window.setTimeout(() => setVisible(false), 620);
    };

    // Tope de seguridad: nunca dejar el splash colgado si `load` tarda o no llega.
    const tope = window.setTimeout(terminar, 3500);

    if (document.readyState === 'complete') {
      terminar();
    } else {
      window.addEventListener('load', terminar);
    }

    return () => {
      window.clearInterval(avance);
      window.clearTimeout(tope);
      window.removeEventListener('load', terminar);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6
                  bg-superficie-0 transition-opacity duration-slow ease-out
                  ${saliendo ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-192.png"
        alt=""
        width={56}
        height={56}
        className="h-14 w-14 rounded-2xl shadow-lift motion-safe:animate-pulse"
      />

      <div className="h-1 w-36 overflow-hidden rounded-full bg-superficie-200">
        <div
          className="h-full rounded-full bg-brand-500 transition-[width] duration-base ease-out"
          style={{ width: `${progreso}%` }}
        />
      </div>
    </div>
  );
}
