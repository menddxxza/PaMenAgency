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
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
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
      className={`h-full ${className ?? ''}`}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
