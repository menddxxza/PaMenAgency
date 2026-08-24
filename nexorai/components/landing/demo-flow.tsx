'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStageTrigger } from '@/lib/use-stage-trigger';
import type { JourneyState } from '@/components/landing/system-scene';

const STAGES = [
  {
    tag: '01',
    label: 'Empresa',
    detail: 'Conectas tu negocio: métricas, objetivo, contexto real. Nada de configurar modelos.',
  },
  {
    tag: '02',
    label: 'Datos',
    detail: 'El motor procesa facturación, leads, conversión y ticket medio de tu negocio.',
  },
  {
    tag: '03',
    label: 'Oportunidades',
    detail: 'Aparecen los tramos de ingreso sin explotar, cada uno con un importe estimado.',
  },
  {
    tag: '04',
    label: 'Agentes',
    detail: 'Cada oportunidad activa su agente especializado, con herramientas y permisos propios.',
  },
  {
    tag: '05',
    label: 'Acciones',
    detail: 'El agente ejecuta tareas de captación y seguimiento sobre esa oportunidad.',
  },
  {
    tag: '06',
    label: 'Ingresos',
    detail: 'El resultado se mide y se atribuye en tiempo real en el dashboard.',
  },
];

export function DemoFlow({
  stageIndex,
  journeyRef,
}: {
  stageIndex: number;
  journeyRef: React.MutableRefObject<JourneyState>;
}) {
  const sectionRef = useStageTrigger<HTMLElement>(stageIndex, journeyRef);
  const lineRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              end: 'bottom 60%',
              scrub: 0.6,
            },
          }
        );
      }
      rowRefs.current.forEach((row) => {
        if (!row) return;
        gsap.fromTo(
          row,
          { opacity: 0.25, x: -8 },
          {
            opacity: 1,
            x: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: row,
              start: 'top 78%',
              end: 'top 45%',
              scrub: 0.4,
            },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [sectionRef]);

  return (
    <section
      id="como-funciona"
      ref={sectionRef}
      className="relative mx-auto max-w-6xl scroll-mt-20 px-4 py-28 sm:px-8"
    >
      <div className="max-w-xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brand-400">Cómo funciona</p>
        <h2 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-6xl">
          De un objetivo a agentes trabajando
        </h2>
      </div>

      <div className="relative mt-16 pl-8 sm:pl-10">
        <div className="landing-hairline absolute left-0 top-1 h-[calc(100%-0.25rem)] w-px border-l" />
        <div
          ref={lineRef}
          className="absolute left-0 top-1 h-[calc(100%-0.25rem)] w-px origin-top bg-brand-400"
        />

        <div className="flex flex-col gap-12 sm:gap-14">
          {STAGES.map((stage, i) => (
            <div
              key={stage.tag}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="relative grid grid-cols-1 gap-2 sm:grid-cols-[5rem_14rem_1fr] sm:items-baseline sm:gap-6"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -top-8 select-none font-display text-7xl font-bold text-white/[0.04] sm:-top-10 sm:text-9xl"
              >
                {stage.tag}
              </span>
              <span className="absolute -left-8 top-1 h-2 w-2 -translate-x-1/2 rounded-full bg-brand-400 sm:-left-10" />
              <span className="font-mono text-xs text-white/30">{stage.tag}</span>
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
                {stage.label}
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-white/45">{stage.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
