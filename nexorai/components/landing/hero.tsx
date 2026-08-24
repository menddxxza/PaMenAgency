import Link from 'next/link';
import { ArrowRight, PlayCircle, Radar, Bot, Target, LineChart } from 'lucide-react';
import { TechCubeField } from '@/components/landing/tech-cube-field';
import { Button } from '@/components/ui/button';

const CARDS = [
  {
    icon: Radar,
    title: 'Analiza tu negocio',
    description: 'Conecta tu empresa y responde 10 preguntas. Nada de configurar modelos ni prompts.',
  },
  {
    icon: Target,
    title: 'Detecta oportunidades',
    description: 'El motor calcula, con tus propios datos, dónde hay ingreso sin explotar y cuánto vale.',
  },
  {
    icon: Bot,
    title: 'Activa agentes',
    description: 'Cada oportunidad tiene un agente especializado listo para trabajarla en cuanto la actives.',
  },
  {
    icon: LineChart,
    title: 'Mide resultados',
    description: 'Dashboard en vivo: qué se ha encontrado, qué se ha activado y qué ha generado.',
  },
];

export function Hero() {
  return (
    <>
      <section className="bg-hero-tech relative overflow-hidden pt-16 sm:pt-24">
        <div className="bg-grid-tech bg-fade-mask pointer-events-none absolute inset-0 -z-10" />

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 lg:grid-cols-[1fr_1fr] lg:gap-4">
          <div className="animate-slide-up max-w-xl">
            <span className="glass-panel inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-[#94A3B8]">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: 'linear-gradient(90deg, #ae36fb, #3b87ff)' }}
              />
              Un producto de PaMenAgency
            </span>

            <h1 className="mt-6 font-display text-4xl font-bold uppercase leading-[1.1] tracking-wide text-white sm:text-5xl lg:text-[3.1rem]">
              <span className="block">Tu próxima</span>
              <span className="block">fuente de ingresos</span>
            </h1>

            <p
              className="mt-4 bg-clip-text font-display text-xl font-semibold text-transparent sm:text-2xl"
              style={{ backgroundImage: 'linear-gradient(90deg, #c584ff, #6ea8ff)' }}
            >
              No vendemos IA. Vendemos resultados.
            </p>

            <p className="mt-4 max-w-md text-sm uppercase tracking-[0.05em] text-[#94A3B8]">
              Conecta tu empresa. La IA encuentra oportunidades, crea estrategias y activa
              agentes que las convierten en ingresos.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="border-0 text-white hover:brightness-110 focus-visible:ring-[#3B82F6]/50"
                  style={{
                    backgroundImage: 'linear-gradient(115deg, #ae36fb, #3b87ff)',
                    boxShadow: '0 0 30px rgba(174,54,251,0.35), 0 0 44px rgba(59,135,255,0.25)',
                  }}
                >
                  Analizar mi empresa
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button
                  size="lg"
                  variant="secondary"
                  className="glass-panel text-white hover:brightness-125 focus-visible:ring-[#3B82F6]/50"
                >
                  <PlayCircle className="h-4 w-4" />
                  Ver cómo funciona
                </Button>
              </a>
            </div>
          </div>

          <div className="glass-panel relative mx-auto h-[380px] w-full max-w-xl animate-fade-in overflow-hidden rounded-[2rem] p-2 sm:h-[440px]">
            <TechCubeField />
          </div>
        </div>
      </section>

      <div className="bg-bg mx-auto grid max-w-6xl grid-cols-1 gap-3 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="group rounded-2xl border border-border bg-surface/60 p-5 transition-colors hover:border-[#8b5cf6]/30 hover:bg-surface"
          >
            <card.icon
              className="h-5 w-5 text-[#a78bfa] transition-colors group-hover:text-[#c4b5fd]"
              strokeWidth={1.75}
            />
            <h3 className="mt-3 text-sm font-semibold text-fg">{card.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{card.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}
