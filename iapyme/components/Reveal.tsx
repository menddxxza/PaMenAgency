'use client';

import { useEffect, useRef } from 'react';

/**
 * Entrada escalonada al hacer scroll. Sin librería de animación: un
 * IntersectionObserver que cambia un atributo, y el CSS hace el resto.
 *
 * El estado inicial es invisible, así que lleva dos redes de seguridad para
 * que el contenido nunca se quede oculto: un temporizador que revela pase lo
 * que pase, y una regla `@media (scripting: none)` en globals.css.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  estirar = true,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /**
   * Estira el envoltorio a la altura del contenedor (`h-full`). Es lo que
   * quieren las tarjetas dentro de un grid, pero no un párrafo suelto: ahí
   * deja un hueco enorme. No basta con pasar `h-auto` por `className`, porque
   * entre dos utilidades de la misma familia gana la que Tailwind ponga
   * después en la hoja, no la que se escriba después en el atributo.
   */
  estirar?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const revelar = () => {
      el.dataset.reveal = 'in';
    };

    if (typeof IntersectionObserver === 'undefined') {
      revelar();
      return;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        revelar();
        observador.disconnect();
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );

    observador.observe(el);
    const red = setTimeout(revelar, 1500);

    return () => {
      observador.disconnect();
      clearTimeout(red);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-reveal="pending"
      // `h-full` para no romper el estirado de altura cuando el envoltorio
      // queda entre un grid y una tarjeta que debe igualar a sus hermanas.
      className={`${estirar ? 'h-full' : ''} ${className ?? ''}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
