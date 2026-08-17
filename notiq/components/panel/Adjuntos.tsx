'use client';

import { useEffect, useState, useTransition, type ChangeEvent } from 'react';
import { borrarAdjunto, obtenerAdjuntos, subirAdjunto, type Adjunto } from '@/app/(app)/adjuntos/actions';

function formatoTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Subir y listar PDFs o fotos adjuntos a una nota o a una tarea (uno de los dos). */
export default function Adjuntos({ noteId, taskId }: { noteId?: string; taskId?: string }) {
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, empezar] = useTransition();

  useEffect(() => {
    obtenerAdjuntos({ noteId, taskId }).then(setAdjuntos);
  }, [noteId, taskId]);

  async function subir(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    // Sin esto, elegir el mismo archivo dos veces seguidas no dispara onChange
    // la segunda vez, porque el valor del input no ha cambiado.
    e.target.value = '';
    if (!archivo) return;

    setSubiendo(true);
    setError(null);

    const fd = new FormData();
    fd.set('archivo', archivo);
    if (noteId) fd.set('noteId', noteId);
    if (taskId) fd.set('taskId', taskId);

    const resultado = await subirAdjunto(fd);
    setSubiendo(false);

    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    if (resultado.adjunto) setAdjuntos((previos) => [resultado.adjunto!, ...previos]);
  }

  function borrar(id: string) {
    empezar(async () => {
      await borrarAdjunto(id);
      setAdjuntos((previos) => previos.filter((a) => a.id !== id));
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50">Adjuntos</h3>
        <label className="cursor-pointer text-xs font-semibold text-brand-600 hover:underline">
          {subiendo ? 'Subiendo…' : '+ Añadir PDF o foto'}
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={subir}
            disabled={subiendo}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {adjuntos.length === 0 ? (
        <p className="mt-2 text-xs text-ink/45">Sin adjuntos todavía.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {adjuntos.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-ink/10 px-2.5 py-1.5 text-xs"
            >
              <a
                href={`/api/adjuntos/${a.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate font-medium text-ink/75 hover:text-brand-600"
              >
                {a.tipo.startsWith('image/') ? '🖼️' : '📄'} {a.nombre}
                <span className="ml-1.5 font-normal text-ink/40">{formatoTamano(a.tamano)}</span>
              </a>
              <button
                type="button"
                aria-label={`Eliminar el adjunto "${a.nombre}"`}
                onClick={() => borrar(a.id)}
                className="shrink-0 text-ink/30 transition hover:text-red-600"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
