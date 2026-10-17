import Link from 'next/link';
import { NoData, DemoBadge } from '@/components/DemoBadge';
import { difficultyLabel, minutes } from '@/lib/format';
import type { ComponentFull } from '@/lib/types';

/**
 * Ficha de componente. Las dependencias son navegables: "desmontar
 * previamente" → clic → salta a ese componente, como en el prototipo.
 */
export function ComponentDetail({
  component,
  vehicleSlug,
  allComponents,
}: {
  component: ComponentFull;
  vehicleSlug: string;
  allComponents: ComponentFull[];
}) {
  const present = new Set(allComponents.map((c) => c.code));

  return (
    <article className="panel">
      <header className="border-b border-line p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[11px] text-accent">{component.code}</span>
          <DemoBadge origin={component.origin} />
        </div>
        <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">{component.name}</h2>
        <p className="mt-0.5 font-mono text-[11px] text-text-3">
          {component.system_name} › {component.subsystem_name}
        </p>
      </header>

      <div className="space-y-4 p-4">
        <Field label="Función">{component.description ?? <NoData />}</Field>
        <Field label="Posición">{component.position_note ?? <NoData />}</Field>

        <dl className="grid grid-cols-3 gap-px bg-line">
          <Cell label="Dificultad" value={component.difficulty ? `${component.difficulty}/5` : null} />
          <Cell label="Tiempo" value={component.est_time_min != null ? minutes(component.est_time_min) : null} />
          <Cell label="Material" value={component.material} />
        </dl>
        <p className="font-mono text-[10px] text-text-3">
          Dificultad: {difficultyLabel(component.difficulty)}
        </p>

        <Field label="Herramientas">
          {component.tools.length === 0 ? (
            <NoData />
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {component.tools.map((t) => (
                <li key={t} className="border border-line bg-surface-2 px-2 py-1 font-mono text-[11px] text-text-2">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </Field>

        <Field label="Desmontar previamente">
          {component.requires.length === 0 ? (
            <span className="text-sm text-text-2">Accesible directamente.</span>
          ) : (
            <ol className="space-y-1">
              {component.requires.map((r, i) => (
                <li key={r.code} className="flex items-baseline gap-2 text-sm">
                  <span className="font-mono text-[11px] text-text-3">{i + 1}.</span>
                  {present.has(r.code) ? (
                    <Link
                      href={`/vehiculo/${vehicleSlug}?c=${encodeURIComponent(r.code)}#${r.code}`}
                      scroll={false}
                      className="text-accent underline decoration-line-2 underline-offset-2 hover:decoration-accent"
                    >
                      {r.name}
                    </Link>
                  ) : (
                    <span>{r.name}</span>
                  )}
                  <span className="font-mono text-[10px] text-text-3">{r.code}</span>
                </li>
              ))}
            </ol>
          )}
        </Field>

        <Field label="Referencias comprables">
          {component.part_count > 0 ? (
            <span className="text-sm">{component.part_count}</span>
          ) : (
            <>
              <NoData />
              <p className="mt-1 font-mono text-[10px] leading-relaxed text-text-3">
                Las referencias OEM y equivalencias requieren una fuente con licencia (TecDoc o similar). No se
                inventan ni se scrapean.
              </p>
            </>
          )}
        </Field>
      </div>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="label mb-1">{label}</h3>
      <div className="text-sm leading-relaxed text-text-2">{children}</div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="bg-surface px-2 py-2">
      <dt className="label">{label}</dt>
      <dd className="mt-0.5 font-mono text-[12px] text-text">{value ?? <NoData />}</dd>
    </div>
  );
}
