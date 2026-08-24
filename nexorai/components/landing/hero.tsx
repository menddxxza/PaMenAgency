import Link from 'next/link';
import { ArrowRight, PlayCircle, Radar, Bot, Target, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignalGraphic } from '@/components/landing/signal-graphic';

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
    <section className="relative overflow-hidden pt-16 sm:pt-24">
      <div className="bg-grid bg-fade-mask bg-radial-signal pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div className="animate-slide-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            Un producto de PaMenAgency
          </span>

          <h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.08] tracking-tight text-fg sm:text-5xl lg:text-[3.4rem]">
            Tu próxima fuente de ingresos puede estar dentro de tu propio negocio.
          </h1>

          <p className="mt-5 max-w-xl text-balance text-base leading-relaxed text-muted sm:text-lg">
            Conecta tu empresa. Nuestra IA encuentra oportunidades, crea estrategias y pone agentes a
            trabajar para convertirlas en ingresos.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button size="lg">
                Analizar mi empresa
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button size="lg" variant="secondary">
                <PlayCircle className="h-4 w-4" />
                Ver cómo funciona
              </Button>
            </a>
          </div>

          <p className="mt-4 text-xs text-muted">
            No vendemos IA. Vendemos resultados — no necesitas saber nada de inteligencia artificial.
          </p>
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-md animate-fade-in">
          <SignalGraphic />
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-3 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-border bg-surface/60 p-5 transition-colors hover:border-brand-500/30 hover:bg-surface"
          >
            <card.icon className="h-5 w-5 text-brand-400" strokeWidth={1.75} />
            <h3 className="mt-3 text-sm font-semibold text-fg">{card.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
