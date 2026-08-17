'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { guardarResumen, guardarTareasExtraidas } from '@/app/(app)/notas/actions';

type TareaExtraida = { titulo: string; prioridad: string; vence: string | null };

const ETIQUETA_PRIORIDAD: Record<string, string> = {
  urgente: 'Urgente',
  alta: 'Alta',
  normal: 'Normal',
  baja: 'Baja',
};

export default function PanelIa({
  noteId,
  titulo,
  markdown,
  resumenInicial,
}: {
  noteId: string;
  titulo: string;
  markdown: string;
  resumenInicial: string | null;
}) {
  const router = useRouter();
  const [resumen, setResumen] = useState(resumenInicial);
  const [tareas, setTareas] = useState<TareaExtraida[] | null>(null);
  const [cargando, setCargando] = useState<'resumen' | 'tareas' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardadas, setGuardadas] = useState<number | null>(null);

  const vacia = markdown.trim().length < 40;

  async function llamar(ruta: string) {
    const respuesta = await fetch(ruta, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, titulo, contenido: markdown }),
    });

    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      throw new Error(datos.error ?? 'Algo ha ido mal con la IA.');
    }
    return datos;
  }

  async function resumir() {
    setCargando('resumen');
    setError(null);
    try {
      const datos = (await llamar('/api/ia/resumen')) as { resumen: string };
      setResumen(datos.resumen);
      await guardarResumen(noteId, datos.resumen);
      router.refresh();
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'Algo ha ido mal.');
    } finally {
      setCargando(null);
    }
  }

  async function extraer() {
    setCargando('tareas');
    setError(null);
    setGuardadas(null);
    try {
      const datos = (await llamar('/api/ia/tareas')) as { tareas: TareaExtraida[] };
      setTareas(datos.tareas);
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'Algo ha ido mal.');
    } finally {
      setCargando(null);
    }
  }

  async function anadirAlTablero() {
    if (!tareas || tareas.length === 0) return;
    const resultado = await guardarTareasExtraidas(noteId, tareas);
    if (resultado.ok) {
      setGuardadas(resultado.creadas ?? 0);
      setTareas(null);
    } else {
      setError(resultado.error);
    }
  }

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="card p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">
          Asistente
        </h2>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={resumir}
            disabled={cargando !== null || vacia}
            className="btn-secondary w-full justify-start"
          >
            {cargando === 'resumen' ? 'Resumiendo…' : '✨ Resumir esta nota'}
          </button>
          <button
            type="button"
            onClick={extraer}
            disabled={cargando !== null || vacia}
            className="btn-secondary w-full justify-start"
          >
            {cargando === 'tareas' ? 'Buscando tareas…' : '✅ Extraer tareas'}
          </button>
        </div>

        {vacia && (
          <p className="mt-3 text-xs text-ink/45">
            Escribe un poco más y la IA tendrá algo con lo que trabajar.
          </p>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {resumen && (
          <div className="mt-5 border-t border-ink/10 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50">Resumen</h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink/75">
              {resumen
                .split('\n')
                .map((linea) => linea.replace(/^[-*]\s*/, '').trim())
                .filter(Boolean)
                .map((linea, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="text-brand-500">
                      •
                    </span>
                    {linea}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {tareas && (
          <div className="mt-5 border-t border-ink/10 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50">
              {tareas.length > 0 ? `${tareas.length} tareas encontradas` : 'Sin tareas'}
            </h3>

            {tareas.length === 0 ? (
              <p className="mt-2 text-sm text-ink/60">
                No hay nada accionable en esta nota.
              </p>
            ) : (
              <>
                <ul className="mt-2 space-y-2 text-sm">
                  {tareas.map((tarea, i) => (
                    <li key={i} className="rounded-xl border border-ink/10 px-3 py-2">
                      <p className="font-medium">{tarea.titulo}</p>
                      <p className="mt-0.5 text-xs text-ink/50">
                        {ETIQUETA_PRIORIDAD[tarea.prioridad] ?? 'Normal'}
                        {tarea.vence ? ` · vence ${tarea.vence}` : ''}
                      </p>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={anadirAlTablero} className="btn-primary mt-3 w-full">
                  Añadir al tablero
                </button>
              </>
            )}
          </div>
        )}

        {guardadas !== null && (
          <p className="mt-4 rounded-xl bg-lima-400/15 px-3 py-2 text-sm text-lima-600">
            {guardadas} tareas añadidas.{' '}
            <Link href="/tareas" className="font-semibold underline underline-offset-4">
              Ver tablero
            </Link>
          </p>
        )}
      </div>
    </aside>
  );
}
