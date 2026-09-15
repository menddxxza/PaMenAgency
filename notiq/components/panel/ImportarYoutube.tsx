'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearNotaEnPanel, guardarNota } from '@/app/(app)/notas/actions';
import { guardarFlashcards, crearExamen, type PreguntaExamen } from '@/app/(app)/estudio/actions';
import { desdeMarkdown } from '@/lib/bloques';

type Fase = 'inactivo' | 'extrayendo' | 'generando' | 'listo' | 'error';

/**
 * Pegas un enlace de YouTube y Notiq encadena: transcripción (propia página
 * del vídeo, ver /api/youtube/transcripcion) → apuntes (nota) → flashcards →
 * examen. Igual que "Grabar clase" pero a partir de un vídeo ya subido en
 * vez del micrófono en directo — mismas tres llamadas de IA de pago
 * (apuntes, flashcards, examen), la transcripción en sí es gratis.
 */
export default function ImportarYoutube({ carpetas }: { carpetas: { id: string; nombre: string }[] }) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [folderId, setFolderId] = useState('');
  const [fase, setFase] = useState<Fase>('inactivo');
  const [error, setError] = useState<string | null>(null);
  const [notaId, setNotaId] = useState<string | null>(null);
  const [flashcardsCreadas, setFlashcardsCreadas] = useState<number | null>(null);
  const [examenCreado, setExamenCreado] = useState(false);

  function reiniciar() {
    setFase('inactivo');
    setUrl('');
    setError(null);
    setNotaId(null);
    setFlashcardsCreadas(null);
    setExamenCreado(false);
  }

  async function importar(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || fase === 'extrayendo' || fase === 'generando') return;

    setError(null);
    setFase('extrayendo');

    try {
      const respuestaTranscripcion = await fetch('/api/youtube/transcripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const datosTranscripcion = await respuestaTranscripcion.json().catch(() => ({}));
      if (!respuestaTranscripcion.ok) {
        throw new Error(datosTranscripcion.error ?? 'No se ha podido leer este vídeo.');
      }
      const tituloVideo = datosTranscripcion.titulo as string;
      const transcripcion = datosTranscripcion.texto as string;

      setFase('generando');

      const respuestaApuntes = await fetch('/api/ia/apuntes-clase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcripcion }),
      });
      const datosApuntes = await respuestaApuntes.json().catch(() => ({}));
      if (!respuestaApuntes.ok) {
        throw new Error(datosApuntes.error ?? 'No se han podido generar los apuntes.');
      }

      const bloques = desdeMarkdown(datosApuntes.apuntes as string);
      const nueva = await crearNotaEnPanel(folderId || undefined);
      if (!nueva.ok || !nueva.id) {
        throw new Error(!nueva.ok ? nueva.error : 'No se ha podido crear la nota.');
      }

      await guardarNota(nueva.id, tituloVideo, bloques);
      setNotaId(nueva.id);

      // Flashcards y examen son un extra: si fallan, la nota con los apuntes
      // ya está guardada y a salvo, así que ninguno de los dos bloquea al otro.
      try {
        const respuestaFlashcards = await fetch('/api/ia/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo: tituloVideo, contenido: transcripcion }),
        });
        const datosFlashcards = await respuestaFlashcards.json().catch(() => ({}));
        if (respuestaFlashcards.ok && Array.isArray(datosFlashcards.flashcards)) {
          const guardado = await guardarFlashcards(datosFlashcards.flashcards, {
            folderId: folderId || undefined,
            noteId: nueva.id,
          });
          if (guardado.ok) setFlashcardsCreadas(guardado.creadas ?? 0);
        }
      } catch {
        // Sin bloquear.
      }

      try {
        const respuestaExamen = await fetch('/api/ia/examen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo: tituloVideo, contenido: transcripcion, numPreguntas: 10, dificultad: 'media' }),
        });
        const datosExamen = await respuestaExamen.json().catch(() => ({}));
        if (respuestaExamen.ok && Array.isArray(datosExamen.preguntas) && datosExamen.preguntas.length > 0) {
          const creado = await crearExamen(tituloVideo, datosExamen.preguntas as PreguntaExamen[], folderId || undefined);
          if (creado.ok) setExamenCreado(true);
        }
      } catch {
        // Sin bloquear.
      }

      setFase('listo');
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'Algo ha ido mal.');
      setFase('error');
    }
  }

  return (
    <div className="card p-5">
      <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50">Importar de YouTube</h3>
      <p className="mt-1.5 text-sm text-ink/60">
        Pega el enlace de una clase o vídeo y Notiq saca los apuntes, flashcards y un examen.
      </p>

      {(fase === 'inactivo' || fase === 'extrayendo' || fase === 'generando') && (
        <form onSubmit={importar} className="mt-4 space-y-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=…"
            aria-label="Enlace de YouTube"
            disabled={fase !== 'inactivo'}
            required
            className="campo"
          />
          {carpetas.length > 0 && (
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              disabled={fase !== 'inactivo'}
              aria-label="Carpeta"
              className="campo"
            >
              <option value="">Sin carpeta</option>
              {carpetas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          )}
          <button type="submit" disabled={fase !== 'inactivo' || !url.trim()} className="btn-primary w-full">
            {fase === 'extrayendo' ? 'Leyendo el vídeo…' : fase === 'generando' ? 'Generando apuntes…' : '📺 Importar vídeo'}
          </button>
        </form>
      )}

      {fase === 'listo' && notaId && (
        <div className="mt-4 rounded-xl bg-lima-400/15 px-3 py-2.5 text-sm text-lima-700">
          <p>
            Apuntes guardados
            {flashcardsCreadas ? `, ${flashcardsCreadas} flashcards` : ''}
            {examenCreado ? ' y un examen' : ''}.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/notas/${notaId}`)}
            className="mt-2 block font-semibold underline underline-offset-4"
          >
            Ver la nota →
          </button>
          <button type="button" onClick={reiniciar} className="mt-2 block text-ink/50 underline underline-offset-4">
            Importar otro vídeo
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <p role="alert">{error}</p>
          <button type="button" onClick={reiniciar} className="mt-2 font-semibold underline underline-offset-4">
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
