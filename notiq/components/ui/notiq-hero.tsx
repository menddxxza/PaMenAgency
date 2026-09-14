'use client';

import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export const WordsPullUp = ({ text, className = '', style }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(' ');

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
          style={{ marginRight: i === words.length - 1 ? 0 : '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

/* ---------------- Hero ---------------- */

/**
 * Hero a pantalla completa para app/page.tsx, adaptado del componente de
 * ejemplo "PrismaHero" (mismo patrón de animación WordsPullUp + framer-motion)
 * con contenido y color de marca de Notiq en vez del demo original — ver el
 * historial de commits si hace falta recuperar la versión genérica.
 *
 * Sin nav propio: el original llevaba una barra flotante superpuesta al vídeo,
 * pero page.tsx ya tiene un <header> sticky con el logo y la navegación justo
 * encima — otra barra aquí habría quedado duplicada. Este componente empieza
 * ya debajo de esa cabecera.
 *
 * Sin vídeo de fondo: el original usaba uno de un desconocido en CloudFront,
 * que no es un asset de Notiq. Un degradado con la marca (violeta + un halo
 * lima) hace de fondo mientras no haya un vídeo propio — cambiar `<video>` por
 * este `<div>` es el único paso si algún día se graba uno.
 */
export const NotiqHero = () => {
  return (
    <section className="h-[calc(100dvh-4.5rem)] w-full">
      <div className="relative isolate h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem]">
        {/* Fondo: degradado de marca + un par de halos difuminados, no un vídeo */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-ink to-ink" />
        <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-brand-500/30 blur-[100px]" />
        <div className="absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-lima-500/20 blur-[100px]" />

        {/* Contenido */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 sm:px-6 md:px-10 md:pb-12">
          <div className="grid grid-cols-12 items-end gap-4">
            <div className="col-span-12 lg:col-span-8">
              <h1
                className="font-medium leading-[0.85] tracking-[-0.07em] text-white text-[24vw] sm:text-[20vw] md:text-[18vw] lg:text-[16vw]"
              >
                <WordsPullUp text="Notiq" />
              </h1>
            </div>

            <div className="col-span-12 flex flex-col gap-5 pb-2 lg:col-span-4 lg:pb-4">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm leading-snug text-white/70 md:text-base"
              >
                Escribes la reunión y Notiq saca las tareas. Notas, tareas y un asistente de IA
                metido en el flujo, que ha leído todo lo que apuntas — no en una pestaña aparte.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap gap-2"
              >
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white/80">
                  Sin tarjeta
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white/80">
                  50 notas gratis
                </span>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href="/entrar"
                  className="group inline-flex items-center gap-2 self-start rounded-full bg-white py-1 pl-5 pr-1 text-sm font-semibold text-ink transition-all hover:gap-3 sm:text-base"
                >
                  Empezar gratis
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
