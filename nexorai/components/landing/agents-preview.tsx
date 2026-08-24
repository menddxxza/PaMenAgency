'use client';

import { useState } from 'react';
import { AGENT_CATALOG } from '@/lib/agents/catalog';
import { cn } from '@/lib/utils';
import { useStageTrigger } from '@/lib/use-stage-trigger';
import type { JourneyState } from '@/components/landing/system-scene';

const RADIAL_POSITIONS = AGENT_CATALOG.map((_, i) => {
  const angle = (i / AGENT_CATALOG.length) * Math.PI * 2 - Math.PI / 2;
  const r = 40;
  return {
    left: `${50 + r * Math.cos(angle)}%`,
    top: `${50 + r * Math.sin(angle)}%`,
  };
});

export function AgentsPreview({
  stageIndex = -1,
  journeyRef,
}: {
  stageIndex?: number;
  journeyRef?: React.MutableRefObject<JourneyState>;
} = {}) {
  const sectionRef = useStageTrigger<HTMLElement>(stageIndex, journeyRef);
  const [selected, setSelected] = useState(0);
  const agent = AGENT_CATALOG[selected];

  return (
    <section
      id="agentes"
      ref={sectionRef}
      className="relative mx-auto max-w-6xl scroll-mt-20 px-4 py-28 sm:px-8"
    >
      <div className="max-w-xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold-400">Agentes</p>
        <h2 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-6xl">
          Una infraestructura, no seis herramientas sueltas
        </h2>
        <p className="mt-3 max-w-md text-sm text-white/45">
          Cada agente es un nodo con objetivo, herramientas y permisos propios. Ninguno actúa fuera de
          tu negocio sin que actives su oportunidad primero.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:gap-4">
        {/* Diagrama radial — solo en pantallas grandes, donde la geometría respira */}
        <div className="relative mx-auto hidden aspect-square w-full max-w-md lg:block">
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            {RADIAL_POSITIONS.map((pos, i) => (
              <line
                key={i}
                x1="50%"
                y1="50%"
                x2={pos.left}
                y2={pos.top}
                stroke={i === selected ? '#c9a24d' : 'rgba(255,255,255,0.1)'}
                strokeWidth={1}
              />
            ))}
          </svg>

          <button
            className="landing-hairline absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-[#0b0b0c] font-mono text-[9px] uppercase tracking-widest text-white/50"
            aria-hidden="true"
            tabIndex={-1}
          >
            Nexorai
          </button>

          {AGENT_CATALOG.map((a, i) => (
            <button
              key={a.key}
              onClick={() => setSelected(i)}
              data-cursor-hover
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1 transition-transform hover:scale-110"
              style={{ left: RADIAL_POSITIONS[i].left, top: RADIAL_POSITIONS[i].top }}
            >
              <span
                className={cn(
                  'block h-3 w-3 rounded-full transition-all',
                  i === selected ? 'bg-gold-400 shadow-[0_0_16px_rgba(201,162,77,0.7)]' : 'bg-white/25'
                )}
              />
              <span
                className={cn(
                  'absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-widest transition-colors',
                  i === selected ? 'text-gold-300' : 'text-white/35'
                )}
              >
                {a.name}
              </span>
            </button>
          ))}
        </div>

        {/* Selector lineal — visible siempre, es la única vista en móvil/tablet */}
        <div className="landing-hairline flex flex-wrap gap-2 border-b pb-6 lg:hidden">
          {AGENT_CATALOG.map((a, i) => (
            <button
              key={a.key}
              onClick={() => setSelected(i)}
              data-cursor-hover
              className={cn(
                'landing-hairline border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors',
                i === selected ? 'border-gold-400/50 text-gold-300' : 'text-white/40'
              )}
            >
              {a.name}
            </button>
          ))}
        </div>

        <div className="landing-hairline border bg-[#050505]/75 p-6 backdrop-blur-sm sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">{agent.key}</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-white">{agent.name}</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/50">{agent.description}</p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">Objetivo</p>
              <p className="mt-1.5 text-sm text-white/70">{agent.objective}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">
                Activa con
              </p>
              <p className="mt-1.5 text-sm text-white/70">
                {agent.triggersFor ? agent.triggersFor.replace(/_/g, ' ') : 'Siempre disponible'}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">Herramientas</p>
              <ul className="mt-1.5 space-y-1">
                {agent.tools.map((t) => (
                  <li key={t} className="text-sm text-white/70">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">Permisos</p>
              <ul className="mt-1.5 space-y-1">
                {agent.permissions.map((p) => (
                  <li key={p} className="text-sm text-white/70">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
