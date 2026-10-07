import type { SemanaLeads } from '@/lib/queries';

const ALTURA_MAX = 96; // px

/**
 * Barras simples con divs, sin librería de gráficos: son 8 barras, no un
 * dashboard de BI, y así no añadimos una dependencia nueva para esto. Las
 * alturas se calculan en px (no en %) porque un % de altura dentro de un
 * flex solo funciona si toda la cadena de ancestros tiene alturas
 * explícitas, y aquí no las tiene.
 */
export default function GraficoSemanal({
  datos,
  titulo,
}: {
  datos: SemanaLeads[];
  titulo: string;
}) {
  const max = Math.max(1, ...datos.map((d) => d.total));
  const total = datos.reduce((suma, d) => suma + d.total, 0);

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-bold">{titulo}</h2>
        <span className="text-xs text-ink/50">últimas {datos.length} semanas</span>
      </div>

      <div className="mt-5 flex items-end gap-1.5 sm:gap-2" style={{ height: ALTURA_MAX + 20 }}>
        {datos.map((d) => {
          const alturaPx = d.total > 0 ? Math.max((d.total / max) * ALTURA_MAX, 4) : 2;
          return (
            <div key={d.etiqueta} className="flex flex-1 flex-col items-center justify-end gap-1.5">
              <div
                className={`w-full rounded-t-md ${d.total > 0 ? 'bg-brand-500/80' : 'bg-ink/10'}`}
                style={{ height: alturaPx }}
                title={`${d.total} ${d.total === 1 ? 'mensaje' : 'mensajes'} · semana del ${d.etiqueta}`}
              />
              <span className="text-[10px] text-ink/45">{d.etiqueta}</span>
            </div>
          );
        })}
      </div>

      {total === 0 ? (
        <p className="mt-3 text-xs text-ink/50">
          Todavía no ha llegado ningún mensaje en este periodo.
        </p>
      ) : null}
    </div>
  );
}
