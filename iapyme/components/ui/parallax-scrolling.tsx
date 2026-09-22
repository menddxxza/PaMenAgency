'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import './parallax-scrolling.css';

/**
 * Hero con capas que se separan al hacer scroll (patrón de Osmo, osmo.supply).
 *
 * Tres desvíos respecto al componente original, cada uno por un motivo:
 *
 * 1. El paquete es `lenis`, no `@studio-freight/lenis`: ese está deprecado y
 *    su propio aviso de npm dice que se renombró.
 * 2. El disparador del ScrollTrigger es la pista alta (`.parallax__header`),
 *    no el contenedor de capas. Las capas van en un elemento `sticky`, y un
 *    sticky no se mueve respecto al viewport: medir su recorrido da cero y el
 *    barrido no llega a ocurrir.
 * 3. Con `prefers-reduced-motion` no se monta nada —ni GSAP ni Lenis—, porque
 *    Lenis secuestra el scroll de toda la página. Queda la composición fija.
 */
export function ParallaxHero({
  titulo,
  children,
}: {
  titulo: React.ReactNode;
  /** Va bajo el titular, dentro de la capa que se mueve con él. */
  children?: React.ReactNode;
}) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const raiz = parallaxRef.current;
    const pista = raiz?.querySelector('[data-parallax-runway]');
    const capas = raiz?.querySelector('[data-parallax-layers]');
    if (!raiz || !pista || !capas) return;

    const contexto = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pista,
          start: '0% 0%',
          end: '100% 0%',
          scrub: 0,
        },
      });

      const definicion = [
        { layer: '1', yPercent: 70 },
        { layer: '2', yPercent: 55 },
        { layer: '3', yPercent: 40 },
        { layer: '4', yPercent: 10 },
      ];

      definicion.forEach((capa, idx) => {
        tl.to(
          capas.querySelectorAll(`[data-parallax-layer="${capa.layer}"]`),
          { yPercent: capa.yPercent, ease: 'none' },
          idx === 0 ? undefined : '<',
        );
      });
    }, raiz);

    const lenis = new Lenis();
    const alScroll = () => ScrollTrigger.update();
    lenis.on('scroll', alScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Se revierte solo lo que ha creado este componente. `ScrollTrigger
      // .getAll().kill()` del original se llevaría por delante cualquier otro
      // ScrollTrigger de la página.
      contexto.revert();
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off('scroll', alScroll);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="parallax" ref={parallaxRef}>
      <section className="parallax__header" data-parallax-runway>
        <div className="parallax__visuals">
          <div className="parallax__black-line-overflow" />

          <div data-parallax-layers className="parallax__layers">
            <img
              src="/parallax/fondo.jpg"
              loading="eager"
              width="1920"
              height="1080"
              data-parallax-layer="1"
              alt=""
              className="parallax__layer-img"
            />
            <img
              src="/parallax/medio.jpg"
              loading="eager"
              width="1920"
              height="1080"
              data-parallax-layer="2"
              alt=""
              className="parallax__layer-img"
            />

            <div data-parallax-layer="3" className="parallax__layer-title">
              <h1 className="parallax__title">{titulo}</h1>
              {children}
            </div>

            <img
              src="/parallax/frente.jpg"
              loading="eager"
              width="1920"
              height="1080"
              data-parallax-layer="4"
              alt=""
              className="parallax__layer-img"
            />
          </div>

          <div className="parallax__fade" />
        </div>
      </section>
    </div>
  );
}
