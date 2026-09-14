'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearNotaEnPanel, guardarNota } from '@/app/(app)/notas/actions';
import { guardarFlashcards } from '@/app/(app)/estudio/actions';
import { desdeMarkdown } from '@/lib/bloques';

type Fase = 'inactivo' | 'grabando' | 'transcribiendo' | 'generando' | 'listo' | 'error';

/**
 * "Grabar clase" → transcripción (Whisper vía Groq, lib/ia/openai.ts) → apuntes
 * estructurados guardados como nota normal → flashcards a partir de la propia
 * transcripción (no de los apuntes ya reescritos, para quedarse más cerca de lo
 * que se dijo de verdad en clase).
 *
 * Tres llamadas de IA encadenadas (transcribir, apuntes, flashcards), cada una
 * contando como una operación de la cuota del plan — coherente con que ya son
 * tres pasos de trabajo real, no uno solo disfrazado.
 */
export default function GrabarClase() {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>('inactivo');
  const [segundos, setSegundos] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notaId, setNotaId] = useState<string | null>(null);
  const [flashcardsCreadas, setFlashcardsCreadas] = useState<number | null>(null);

  const grabadorRef = useRef<MediaRecorder | null>(null);
  const trozosRef = useRef<Blob[]>([]);
  const cronometroRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function empezar() {
    setError(null);
    setNotaId(null);
    setFlashcardsCreadas(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const grabador = new MediaRecorder(stream);
      trozosRef.current = [];

      grabador.ondataavailable = (e) => {
        if (e.data.size > 0) trozosRef.current.push(e.data);
      };
      grabador.onstop = () => {
        // Parar las pistas y no solo el grabador: si no, el navegador sigue
        // mostrando el icono de "usando el micrófono" después de terminar.
        stream.getTracks().forEach((t) => t.stop());
        void procesar();
      };

      grabador.start();
      grabadorRef.current = grabador;
      setSegundos(0);
      cronometroRef.current = setInterval(() => setSegundos((s) => s + 1), 1000);
      setFase('grabando');
    } catch {
      setError('No se ha podido acceder al micrófono. Revisa los permisos del navegador.');
      setFase('error');
    }
  }

  function detener() {
    grabadorRef.current?.stop();
    if (cronometroRef.current) clearInterval(cronometroRef.current);
  }

  async function procesar() {
    setFase('transcribiendo');
    try {
      const audio = new Blob(trozosRef.current, { type: grabadorRef.current?.mimeType || 'audio/webm' });
      const fd = new FormData();
      fd.set('audio', audio, 'clase.webm');

      const respuestaTranscripcion = await fetch('/api/ia/transcribir', { method: 'POST', body: fd });
      const datosTranscripcion = await respuestaTranscripcion.json().catch(() => ({}));
      if (!respuestaTranscripcion.ok) {
        throw new Error(datosTranscripcion.error ?? 'No se ha podido transcribir el audio.');
      }
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
      const nueva = await crearNotaEnPanel();
      if (!nueva.ok || !nueva.id) {
        throw new Error(!nueva.ok ? nueva.error : 'No se ha podido crear la nota.');
      }

      const titulo = `Clase — ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
      await guardarNota(nueva.id, titulo, bloques);
      setNotaId(nueva.id);

      // Las flashcards son un extra: si fallan, la nota con los apuntes ya está
      // guardada y a salvo, así que el error de este paso no tira todo lo demás.
      try {
        const respuestaFlashcards = await fetch('/api/ia/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo, contenido: transcripcion }),
        });
        const datosFlashcards = await respuestaFlashcards.json().catch(() => ({}));
        if (respuestaFlashcards.ok && Array.isArray(datosFlashcards.flashcards)) {
          const guardado = await guardarFlashcards(datosFlashcards.flashcards, { noteId: nueva.id });
          if (guardado.ok) setFlashcardsCreadas(guardado.creadas ?? 0);
        }
      } catch {
        // Sin bloquear: los apuntes son lo importante y ya están guardados.
      }

      setFase('listo');
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'Algo ha ido mal.');
      setFase('error');
    }
  }

  const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
  const segs = String(segundos % 60).padStart(2, '0');

  return (
    <div className="card p-5">
      <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50">Grabar clase</h3>
      <p className="mt-1.5 text-sm text-ink/60">
        Graba la explicación del profesor y Notiq la convierte en apuntes y flashcards.
      </p>

      {fase === 'inactivo' && (
        <button type="button" onClick={empezar} className="btn-primary mt-4 w-full">
          🎙️ Empezar a grabar
        </button>
      )}

      {fase === 'grabando' && (
        <div className="mt-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-red-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" aria-hidden />
            Grabando — {minutos}:{segs}
          </p>
          <button type="button" onClick={detener} className="btn-secondary mt-3 w-full">
            Detener y procesar
          </button>
        </div>
      )}

      {(fase === 'transcribiendo' || fase === 'generando') && (
        <p className="mt-4 text-sm text-ink/60">
          {fase === 'transcribiendo' ? 'Transcribiendo el audio…' : 'Generando apuntes y flashcards…'}
        </p>
      )}

      {fase === 'listo' && notaId && (
        <div className="mt-4 rounded-xl bg-lima-400/15 px-3 py-2.5 text-sm text-lima-700">
          <p>Apuntes guardados{flashcardsCreadas ? ` junto con ${flashcardsCreadas} flashcards` : ''}.</p>
          <button
            type="button"
            onClick={() => router.push(`/notas/${notaId}`)}
            className="mt-2 font-semibold underline underline-offset-4"
          >
            Ver la nota →
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
