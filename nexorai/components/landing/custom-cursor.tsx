'use client';

import { useEffect, useRef } from 'react';

/**
 * Cursor propio, sutil: un punto que sigue al ratón con inercia y un anillo
 * que se agranda sobre elementos interactivos (marcados con
 * data-cursor-hover). Solo en dispositivos con puntero fino — en touch no
 * se monta, no tiene sentido ahí.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.body.classList.add('cursor-none-desktop');

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;

    function onMove(e: PointerEvent) {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      }
    }

    function onOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-cursor-hover]')) {
        ringRef.current?.classList.add('scale-[1.8]', 'opacity-60');
      }
    }
    function onOut(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-cursor-hover]')) {
        ringRef.current?.classList.remove('scale-[1.8]', 'opacity-60');
      }
    }

    let rafId = 0;
    function tick() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);

    return () => {
      document.body.classList.remove('cursor-none-desktop');
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400 [@media(pointer:fine)]:block"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold-400/50 transition-[transform,opacity] duration-150 ease-out [@media(pointer:fine)]:block"
      />
    </>
  );
}
