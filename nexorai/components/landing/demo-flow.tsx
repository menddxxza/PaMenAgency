import { Search, Target, Bot, Zap, LineChart } from 'lucide-react';

const STEPS = [
  { icon: Search, title: 'Analiza empresa', detail: 'Lee tus métricas y tu objetivo' },
  { icon: Target, title: 'Encuentra oportunidades', detail: '5 categorías con potencial estimado' },
  { icon: Bot, title: 'Crea agentes', detail: 'Uno especializado por oportunidad' },
  { icon: Zap, title: 'Ejecuta acciones', detail: 'Tareas de adquisición y seguimiento' },
  { icon: LineChart, title: 'Mide resultados', detail: 'Dashboard y línea de tiempo en vivo' },
];

export function DemoFlow() {
  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-brand-400">Cómo funciona</p>
        <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          De un objetivo en una frase a agentes trabajando
        </h2>
      </div>

      <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-border bg-surface p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">El negocio escribe</p>
        <p className="mt-2 font-display text-lg text-fg">
          &ldquo;Quiero conseguir 20.000&euro; adicionales al mes.&rdquo;
        </p>
      </div>

      <div className="relative mt-14">
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
        />
        <ol className="grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-brand-500/40 bg-surface shadow-glow">
                <step.icon className="h-5 w-5 text-brand-400" strokeWidth={1.75} />
              </div>
              <span className="mt-3 font-mono text-[11px] text-muted">Paso {i + 1}</span>
              <h3 className="mt-1 text-sm font-semibold text-fg">{step.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
