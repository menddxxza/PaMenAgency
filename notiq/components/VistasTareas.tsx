'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  COLUMNAS,
  PRIORIDADES,
  clasePrioridad,
  etiquetaPrioridad,
  etiquetaVencimiento,
  ordenarPorUrgencia,
  type Tarea,
} from '@/lib/tareas';
import { borrarTarea, cambiarCarpetaTarea, cambiarEstado, cambiarPrioridad } from '@/app/(app)/tareas/actions';
import Adjuntos from '@/components/panel/Adjuntos';

type Vista = 'lista' | 'kanban' | 'calendario';
type Carpeta = { id: string; nombre: string };

const VISTAS: { id: Vista; etiqueta: string }[] = [
  { id: 'lista', etiqueta: 'Lista' },
  { id: 'kanban', etiqueta: 'Kanban' },
  { id: 'calendario', etiqueta: 'Calendario' },
];

export default function VistasTareas({
  tareas,
  carpetas,
  onCambio,
}: {
  tareas: Tarea[];
  carpetas: Carpeta[];
  /** Se llama tras cada cambio para que quien tenga las tareas cargadas las recargue. */
  onCambio: () => void;
}) {
  const [vista, setVista] = useState<Vista>('lista');

  return (
    <div>
      <div
        role="tablist"
        aria-label="Vista de las tareas"
        className="inline-flex rounded-xl border border-ink/10 bg-ink/[0.03] p-1"
      >
        {VISTAS.map((v) => (
          <button
            key={v.id}
            role="tab"
            aria-selected={vista === v.id}
            onClick={() => setVista(v.id)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${
              vista === v.id ? 'bg-white text-ink shadow-sm' : 'text-ink/55 hover:text-ink'
            }`}
          >
            {v.etiqueta}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {vista === 'lista' && <VistaLista tareas={tareas} carpetas={carpetas} onCambio={onCambio} />}
        {vista === 'kanban' && <VistaKanban tareas={tareas} onCambio={onCambio} />}
        {vista === 'calendario' && (
          <VistaCalendario tareas={tareas} carpetas={carpetas} onCambio={onCambio} />
        )}
      </div>
    </div>
  );
}

function VistaLista({
  tareas,
  carpetas,
  onCambio,
}: {
  tareas: Tarea[];
  carpetas: Carpeta[];
  onCambio: () => void;
}) {
  const abiertas = ordenarPorUrgencia(tareas.filter((t) => t.estado !== 'hecha'));
  const hechas = tareas.filter((t) => t.estado === 'hecha');

  if (tareas.length === 0) return <Vacio />;

  return (
    <div className="max-w-3xl space-y-6">
      <ul className="space-y-2">
        {abiertas.map((tarea) => (
          <FilaTarea key={tarea.id} tarea={tarea} carpetas={carpetas} onCambio={onCambio} />
        ))}
      </ul>

      {hechas.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-ink/50 hover:text-ink">
            {hechas.length} completadas
          </summary>
          <ul className="mt-3 space-y-2">
            {hechas.map((tarea) => (
              <FilaTarea key={tarea.id} tarea={tarea} carpetas={carpetas} onCambio={onCambio} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function FilaTarea({
  tarea,
  carpetas,
  onCambio,
}: {
  tarea: Tarea;
  carpetas: Carpeta[];
  onCambio: () => void;
}) {
  const [pendiente, empezar] = useTransition();
  const [expandida, setExpandida] = useState(false);
  const hecha = tarea.estado === 'hecha';
  const vencimiento = etiquetaVencimiento(tarea.vence);
  const carpeta = carpetas.find((c) => c.id === tarea.folder_id);

  return (
    <li className={`card px-4 py-3 ${pendiente ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={hecha}
          aria-label={`Marcar "${tarea.titulo}" como hecha`}
          onChange={() =>
            empezar(async () => {
              await cambiarEstado(tarea.id, hecha ? 'pendiente' : 'hecha');
              onCambio();
            })
          }
          className="h-4 w-4 shrink-0 rounded border-ink/25 text-brand-600 focus:ring-brand-400"
        />

        <button
          type="button"
          onClick={() => setExpandida((v) => !v)}
          className="min-w-0 flex-1 text-left"
          aria-expanded={expandida}
        >
          <p className={`truncate text-sm font-medium ${hecha ? 'text-ink/40 line-through' : ''}`}>
            {tarea.titulo}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            {vencimiento && (
              <span className={vencimiento.vencida ? 'font-semibold text-red-600' : 'text-ink/50'}>
                {vencimiento.texto}
              </span>
            )}
            {carpeta && <span className="text-ink/45">📁 {carpeta.nombre}</span>}
            {tarea.note_id && (
              <Link
                href={`/notas/${tarea.note_id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-ink/45 underline underline-offset-2 hover:text-ink"
              >
                ver nota
              </Link>
            )}
            {tarea.origen === 'ia' && <span className="text-brand-500">✨ IA</span>}
          </div>
        </button>

        <select
          value={tarea.prioridad}
          aria-label={`Prioridad de "${tarea.titulo}"`}
          onChange={(e) =>
            empezar(async () => {
              await cambiarPrioridad(tarea.id, e.target.value as Tarea['prioridad']);
              onCambio();
            })
          }
          className={`rounded-full border px-2 py-1 text-xs font-medium ${clasePrioridad(tarea.prioridad)}`}
        >
          {PRIORIDADES.map((p) => (
            <option key={p.valor} value={p.valor}>
              {p.etiqueta}
            </option>
          ))}
        </select>

        <button
          type="button"
          aria-label={`Eliminar "${tarea.titulo}"`}
          onClick={() =>
            empezar(async () => {
              await borrarTarea(tarea.id);
              onCambio();
            })
          }
          className="text-ink/30 transition hover:text-red-600"
        >
          ✕
        </button>
      </div>

      {expandida && (
        <div className="mt-3 space-y-3 border-t border-ink/10 pt-3">
          <label className="flex items-center gap-2 text-xs text-ink/55">
            Carpeta
            <select
              value={tarea.folder_id ?? ''}
              onChange={(e) =>
                empezar(async () => {
                  await cambiarCarpetaTarea(tarea.id, e.target.value || null);
                  onCambio();
                })
              }
              className="campo w-auto py-1 text-xs"
            >
              <option value="">Sin carpeta</option>
              {carpetas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>

          <Adjuntos taskId={tarea.id} />
        </div>
      )}
    </li>
  );
}

function VistaKanban({ tareas, onCambio }: { tareas: Tarea[]; onCambio: () => void }) {
  const [pendiente, empezar] = useTransition();

  if (tareas.length === 0) return <Vacio />;

  return (
    <div className={`grid gap-4 md:grid-cols-3 ${pendiente ? 'opacity-70' : ''}`}>
      {COLUMNAS.map((columna) => {
        const suyas = ordenarPorUrgencia(tareas.filter((t) => t.estado === columna.estado));

        return (
          <section key={columna.estado} className="rounded-2xl bg-ink/[0.03] p-3">
            <h3 className="flex items-baseline justify-between px-1 pb-3 text-sm font-extrabold">
              {columna.etiqueta}
              <span className="text-xs font-medium text-ink/40">{suyas.length}</span>
            </h3>

            <ul className="space-y-2">
              {suyas.map((tarea) => {
                const vencimiento = etiquetaVencimiento(tarea.vence);
                return (
                  <li key={tarea.id} className="card p-3">
                    <p className="text-sm font-medium leading-snug">{tarea.titulo}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${clasePrioridad(tarea.prioridad)}`}
                      >
                        {etiquetaPrioridad(tarea.prioridad)}
                      </span>
                      {vencimiento && (
                        <span
                          className={`text-[11px] ${vencimiento.vencida ? 'font-semibold text-red-600' : 'text-ink/50'}`}
                        >
                          {vencimiento.texto}
                        </span>
                      )}
                    </div>

                    {/* Mover con botones y no arrastrando: el drag&drop nativo no
                        funciona en táctil sin una librería, y esto ya sirve. */}
                    <div className="mt-2 flex gap-1">
                      {COLUMNAS.filter((c) => c.estado !== tarea.estado).map((destino) => (
                        <button
                          key={destino.estado}
                          type="button"
                          onClick={() =>
                            empezar(async () => {
                              await cambiarEstado(tarea.id, destino.estado);
                              onCambio();
                            })
                          }
                          className="rounded-lg px-2 py-1 text-[11px] font-semibold text-ink/45 transition hover:bg-ink/[0.05] hover:text-ink"
                        >
                          → {destino.etiqueta}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function VistaCalendario({
  tareas,
  carpetas,
  onCambio,
}: {
  tareas: Tarea[];
  carpetas: Carpeta[];
  onCambio: () => void;
}) {
  const conFecha = tareas.filter((t) => t.vence);
  const sinFecha = tareas.filter((t) => !t.vence && t.estado !== 'hecha');

  // Agrupadas por día, que es como se mira un calendario de tareas: no hace falta
  // una rejilla mensual para responder "¿qué tengo el viernes?".
  const porDia = new Map<string, Tarea[]>();
  for (const tarea of ordenarPorUrgencia(conFecha)) {
    const dia = tarea.vence as string;
    porDia.set(dia, [...(porDia.get(dia) ?? []), tarea]);
  }

  if (tareas.length === 0) return <Vacio />;

  return (
    <div className="max-w-3xl space-y-6">
      {porDia.size === 0 ? (
        <p className="text-sm text-ink/55">Ninguna tarea tiene fecha todavía.</p>
      ) : (
        [...porDia.entries()].map(([dia, delDia]) => {
          const vencimiento = etiquetaVencimiento(dia);
          const [ano, mes, numero] = dia.split('-').map(Number);
          const fecha = new Date(ano, mes - 1, numero);

          return (
            <section key={dia}>
              <h3 className="flex items-baseline gap-2 border-b border-ink/10 pb-2">
                <span
                  className={`text-sm font-extrabold ${vencimiento?.vencida ? 'text-red-600' : ''}`}
                >
                  {vencimiento?.texto}
                </span>
                <span className="text-xs text-ink/45">
                  {fecha.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
              </h3>
              <ul className="mt-3 space-y-2">
                {delDia.map((tarea) => (
                  <FilaTarea key={tarea.id} tarea={tarea} carpetas={carpetas} onCambio={onCambio} />
                ))}
              </ul>
            </section>
          );
        })
      )}

      {sinFecha.length > 0 && (
        <section>
          <h3 className="border-b border-ink/10 pb-2 text-sm font-extrabold text-ink/55">
            Sin fecha ({sinFecha.length})
          </h3>
          <ul className="mt-3 space-y-2">
            {ordenarPorUrgencia(sinFecha).map((tarea) => (
              <FilaTarea key={tarea.id} tarea={tarea} carpetas={carpetas} onCambio={onCambio} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Vacio() {
  return (
    <div className="card max-w-3xl p-10 text-center">
      <p className="text-lg font-semibold">Todavía no hay tareas</p>
      <p className="mt-2 text-sm text-ink/60">
        Añade una arriba, o abre una nota de reunión y pulsa «Extraer tareas».
      </p>
    </div>
  );
}
