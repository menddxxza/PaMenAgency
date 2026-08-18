'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { comoBloques, extracto } from '@/lib/bloques';
import { clasePrioridad, etiquetaPrioridad, etiquetaVencimiento, type Tarea } from '@/lib/tareas';
import { cambiarEstado } from '@/app/(app)/tareas/actions';
import {
  obtenerContenidoCarpeta,
  obtenerResumen,
  type ContenidoCarpeta,
  type Resumen,
} from '@/app/(app)/inicio/actions';

function fecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default function SeccionInicio({ email }: { email: string | null }) {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [carpetaAbierta, setCarpetaAbierta] = useState<ContenidoCarpeta | null>(null);
  const [abriendoCarpeta, setAbriendoCarpeta] = useState(false);
  const [, empezar] = useTransition();

  const cargar = useCallback(async () => {
    setResumen(await obtenerResumen());
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function abrirCarpeta(id: string) {
    setAbriendoCarpeta(true);
    const datos = await obtenerContenidoCarpeta(id);
    setAbriendoCarpeta(false);
    if (datos) setCarpetaAbierta(datos);
  }

  function marcarHecha(tarea: Tarea) {
    empezar(async () => {
      await cambiarEstado(tarea.id, 'hecha');
      if (carpetaAbierta) {
        setCarpetaAbierta({
          ...carpetaAbierta,
          tareas: carpetaAbierta.tareas.map((t) => (t.id === tarea.id ? { ...t, estado: 'hecha' } : t)),
        });
      }
      cargar();
    });
  }

  if (!resumen) return null;

  if (carpetaAbierta) {
    const { carpeta, notas, tareas } = carpetaAbierta;
    const abiertas = tareas.filter((t) => t.estado !== 'hecha');

    return (
      <div className="px-5 py-6 sm:px-8">
        <button
          type="button"
          onClick={() => setCarpetaAbierta(null)}
          className="btn-fantasma text-sm"
        >
          ← Inicio
        </button>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">📁 {carpeta.nombre}</h1>
        <p className="mt-1 text-sm text-ink/55">
          {notas.length} notas · {abiertas.length} tareas abiertas
        </p>

        {notas.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">Notas</h2>
            <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {notas.map((nota) => {
                const bloques = comoBloques(nota.content);
                return (
                  <li key={nota.id} className="card p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 font-bold tracking-tight">
                        {nota.titulo || 'Sin título'}
                      </h3>
                      {nota.favorita && <span aria-label="Favorita">⭐</span>}
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/60">
                      {extracto(bloques, 180) || 'Nota vacía'}
                    </p>
                    <p className="mt-3 text-xs text-ink/40">Abre esta nota desde la pestaña Notas.</p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {tareas.length > 0 && (
          <section className="mt-8 max-w-2xl">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">Tareas</h2>
            <ul className="mt-3 space-y-2">
              {tareas.map((tarea) => {
                const hecha = tarea.estado === 'hecha';
                const vencimiento = etiquetaVencimiento(tarea.vence);
                return (
                  <li key={tarea.id} className="card flex items-center gap-3 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={hecha}
                      disabled={hecha}
                      aria-label={`Marcar "${tarea.titulo}" como hecha`}
                      onChange={() => marcarHecha(tarea)}
                      className="h-4 w-4 shrink-0 rounded border-ink/25 text-brand-600 focus:ring-brand-400"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${hecha ? 'text-ink/40 line-through' : ''}`}>
                        {tarea.titulo}
                      </p>
                      {vencimiento && (
                        <span
                          className={`text-xs ${vencimiento.vencida ? 'font-semibold text-red-600' : 'text-ink/50'}`}
                        >
                          {vencimiento.texto}
                        </span>
                      )}
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${clasePrioridad(tarea.prioridad)}`}
                    >
                      {etiquetaPrioridad(tarea.prioridad)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {notas.length === 0 && tareas.length === 0 && (
          <p className="mt-6 text-sm text-ink/55">
            Esta carpeta está vacía. Asigna notas o tareas a «{carpeta.nombre}» para verlas aquí.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 py-6 sm:px-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Inicio</h1>
        <p className="mt-1 text-sm text-ink/55">{email}</p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaResumen etiqueta="Notas" valor={resumen.totalNotas} />
        <TarjetaResumen etiqueta="Tareas abiertas" valor={resumen.tareasAbiertas} />
        <TarjetaResumen
          etiqueta="Tareas vencidas"
          valor={resumen.tareasVencidas}
          alerta={resumen.tareasVencidas > 0}
        />
        <TarjetaResumen etiqueta="Adjuntos" valor={resumen.totalAdjuntos} />
      </div>

      {resumen.carpetas.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">Tus temas</h2>
          <p className="mt-1 text-xs text-ink/45">
            Cada carpeta agrupa las notas y las tareas de ese tema en un solo sitio.
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resumen.carpetas.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => abrirCarpeta(c.id)}
                  disabled={abriendoCarpeta}
                  className="card block w-full p-4 text-left transition hover:border-brand-300 hover:shadow-lg disabled:opacity-60"
                >
                  <p className="font-bold tracking-tight">📁 {c.nombre}</p>
                  <p className="mt-1 text-xs text-ink/55">
                    {c.notas} notas · {c.tareasAbiertas} tareas abiertas
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">
            Notas recientes
          </h2>
          {resumen.notasRecientes.length === 0 ? (
            <p className="mt-3 text-sm text-ink/55">Todavía no hay notas.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {resumen.notasRecientes.map((nota) => (
                <li key={nota.id} className="card flex items-center justify-between gap-3 px-4 py-3">
                  <p className="truncate text-sm font-medium">
                    {nota.favorita && '⭐ '}
                    {nota.titulo || 'Sin título'}
                  </p>
                  <span className="shrink-0 text-xs text-ink/40">{fecha(nota.updated_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">
            Próximas tareas
          </h2>
          {resumen.tareasProximas.length === 0 ? (
            <p className="mt-3 text-sm text-ink/55">No tienes tareas abiertas. Bien ahí.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {resumen.tareasProximas.map((tarea) => {
                const vencimiento = etiquetaVencimiento(tarea.vence);
                return (
                  <li key={tarea.id} className="card flex items-center justify-between gap-3 px-4 py-3">
                    <p className="truncate text-sm font-medium">{tarea.titulo}</p>
                    {vencimiento && (
                      <span
                        className={`shrink-0 text-xs ${vencimiento.vencida ? 'font-semibold text-red-600' : 'text-ink/40'}`}
                      >
                        {vencimiento.texto}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function TarjetaResumen({
  etiqueta,
  valor,
  alerta = false,
}: {
  etiqueta: string;
  valor: number;
  alerta?: boolean;
}) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{etiqueta}</p>
      <p className={`mt-1 text-3xl font-extrabold tracking-tight ${alerta ? 'text-red-600' : ''}`}>
        {valor}
      </p>
    </div>
  );
}
