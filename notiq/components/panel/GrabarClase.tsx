'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearNotaEnPanel, guardarNota } from '@/app/(app)/notas/actions';
import { guardarFlashcards } from '@/app/(app)/estudio/actions';
import { desdeMarkdown } from '@/lib/bloques';
import { GrabadoraVisual } from '@/components/ui/ia-siri-chat';

type Fase = 'inactivo' | 'grabando' | 'transcribiendo' | 'generando' | 'listo' | 'error';

const BANDAS_ONDA = 20;

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
  const [nivelAudio, setNivelAudio] = useState<number[]>(new Array(BANDAS_ONDA).fill(0));

  const grabadorRef = useRef<MediaRecorder | null>(null);
  const trozosRef = useRef<Blob[]>([]);
  const cronometroRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  // La onda del botón de grabar es el nivel real del micrófono (AnalyserNode),
  // no números aleatorios — así si no se oye nada, tampoco se mueve nada.
  function pararVisualizador() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setNivelAudio(new Array(BANDAS_ONDA).fill(0));
  }

  function empezarVisualizador(stream: MediaStream) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx();
    audioContextRef.current = audioCtx;
    const analizador = audioCtx.createAnalyser();
    analizador.fftSize = 256;
    audioCtx.createMediaStreamSource(stream).connect(analizador);
    const datos = new Uint8Array(analizador.frequencyBinCount);

    const paso = Math.floor(datos.length / BANDAS_ONDA);
    const actualizar = () => {
      analizador.getByteFrequencyData(datos);
      const bandas = new Array(BANDAS_ONDA).fill(0);
      for (let i = 0; i < BANDAS_ONDA; i++) {
        let suma = 0;
        for (let j = 0; j < paso; j++) suma += datos[i * paso + j];
        bandas[i] = suma / paso / 255;
      }
      setNivelAudio(bandas);
      rafRef.current = requestAnimationFrame(actualizar);
    };
    rafRef.current = requestAnimationFrame(actualizar);
  }

  useEffect(() => pararVisualizador, []);

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
        pararVisualizador();
        void procesar();
      };

      grabador.start();
      grabadorRef.current = grabador;
      setSegundos(0);
      cronometroRef.current = setInterval(() => setSegundos((s) => s + 1), 1000);
      empezarVisualizador(stream);
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

  function reiniciar() {
    setFase('inactivo');
    setSegundos(0);
    setError(null);
    setNotaId(null);
    setFlashcardsCreadas(null);
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

  const faseVisual = fase === 'transcribiendo' || fase === 'generando' ? 'procesando' : fase === 'grabando' ? 'grabando' : 'inactivo';
  const etiqueta =
    fase === 'grabando'
      ? 'Escuchando…'
      : fase === 'transcribiendo'
        ? 'Transcribiendo el audio…'
        : fase === 'generando'
          ? 'Generando apuntes y flashcards…'
          : 'Toca para grabar';

  return (
    <div className="card p-5">
      <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50">Grabar clase</h3>
      <p className="mt-1.5 text-sm text-ink/60">
        Graba la explicación del profesor y Notiq la convierte en apuntes y flashcards.
      </p>

      {(fase === 'inactivo' || fase === 'grabando' || fase === 'transcribiendo' || fase === 'generando') && (
        <GrabadoraVisual
          fase={faseVisual}
          etiqueta={etiqueta}
          segundos={segundos}
          nivelAudio={nivelAudio}
          disabled={fase === 'transcribiendo' || fase === 'generando'}
          onToggle={fase === 'grabando' ? detener : empezar}
          className="mt-2"
        />
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
          <button type="button" onClick={reiniciar} className="mt-2 block text-ink/50 underline underline-offset-4">
            Grabar otra clase
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
