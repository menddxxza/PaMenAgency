import { Briefcase, Megaphone, UserRound } from 'lucide-react';

const CASES = [
  {
    icon: Briefcase,
    role: 'Agencia de diseño web',
    scenario:
      'Filtra por «sin página web» en su ciudad, exporta la lista y la reparte entre su equipo comercial cada lunes.',
  },
  {
    icon: UserRound,
    role: 'Comercial freelance',
    scenario:
      'Busca por sector y radio alrededor de su zona, llama directamente desde la ficha y anota quién ya respondió.',
  },
  {
    icon: Megaphone,
    role: 'Agencia de marketing',
    scenario:
      'Prioriza negocios con «web antigua» y buen rating: son los que más se benefician de una campaña, no solo de una web nueva.',
  },
];

export function UseCases() {
  return (
    <section className="border-b border-border py-24">
      <div className="container">
        <div className="max-w-lg">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Así lo usarías
          </h2>
          <p className="mt-3 text-muted">Tres formas habituales de sacarle partido, según a qué te dediques.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {CASES.map(({ icon: Icon, role, scenario }) => (
            <div key={role} className="rounded-2xl border border-border bg-surface p-6">
              <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h3 className="mt-4 font-display text-base font-semibold text-fg">{role}</h3>
              <p className="mt-2 text-sm text-muted">{scenario}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
