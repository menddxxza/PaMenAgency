'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearNotaEnPanel, guardarNota } from '@/app/(app)/notas/actions';
import { guardarFlashcards } from '@/app/(app)/estudio/actions';
import { desdeMarkdown } from '@/lib/bloques';

type Fase = 'inactivo' | 'listo-para-empezar' | 'procesando' | 'transcribiendo' | 'generando' | 'hecho' | 'error';

/**
 * Analiza un vídeo de clase ya grabado (no en directo, ver GrabarClase): en
 * vez de subir el vídeo entero (pesa demasiado — Whisper corta en 25 MB),
 * se reproduce en silencio en el propio navegador y se captura solo el
 * audio con `captureStream()` + MediaRecorder — el mismo mecanismo que ya
 * usa "Grabar clase" con el micrófono, aquí con la pista de audio del
 * vídeo en vez de la del micro. Sin librerías nuevas, pero tarda lo que
 * dure el vídeo (dividido por la velocidad elegida) porque hay que
 * reproducirlo de verdad para poder capturarlo.
 *
 * `captureStream()` no existe en Safari/iOS — se avisa en vez de fallar
 * a medias.
 */
export default function AnalizarVideo({ carpetas }: { carpetas: { id: string; nombre: string }[] }) {
  const router = useRouter();
  const [soportado, setSoportado] = useState(true);
  const [fase, setFase] = useState<Fase>('inactivo');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [velocidad, setVelocidad] = useState(1);
  const [folderId, setFolderId] = useState('');
  const [progreso, setProgreso] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notaId, setNotaId] = useState<string | null>(null);
  const [flashcardsCreadas, setFlashcardsCreadas] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const grabadorRef = useRef<MediaRecorder | null>(null);
  const trozosRef = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    setSoportado(typeof HTMLVideoElement !== 'undefined' && 'captureStream' in HTMLVideoElement.prototype);
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  function elegirArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setArchivo(f);
    setError(null);
    setNotaId(null);
    setFlashcardsCreadas(null);
    setFase('listo-para-empezar');
  }

  function cancelar() {
    grabadorRef.current?.stop();
    grabadorRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setArchivo(null);
    setFase('inactivo');
    setProgreso(0);
    setDuracion(0);
  }

  function empezar() {
    if (!archivo || !videoRef.current) return;
    const video = videoRef.current;

    const url = URL.createObjectURL(archivo);
    urlRef.current = url;
    video.src = url;
    video.muted = true;
    video.playbackRate = velocidad;

    video.onloadedmetadata = () => {
      setDuracion(video.duration || 0);

      const stream = (video as HTMLVideoElement & { captureStream: () => MediaStream }).captureStream();
      const pistasAudio = stream.getAudioTracks();
      if (pistasAudio.length === 0) {
        setError('Este vídeo no tiene pista de audio.');
        setFase('error');
        return;
      }

      const audioStream = new MediaStream(pistasAudio);
      // 32 kbps mono-ish: de sobra para que Whisper entienda una voz hablando,
      // y deja caber hasta ~1h40 de clase en los 25 MB que admite el proveedor
      // (el límite de la propia API, no uno puesto por Notiq).
      const grabador = new MediaRecorder(audioStream, { audioBitsPerSecond: 32_000 });
      trozosRef.current = [];
      grabador.ondataavailable = (e) => {
        if (e.data.size > 0) trozosRef.current.push(e.data);
      };
      grabador.onstop = () => void procesar();
      grabador.start();
      grabadorRef.current = grabador;

      video.play().catch(() => {
        setError('El navegador ha bloqueado la reproducción automática. Vuelve a intentarlo.');
        setFase('error');
      });
      setFase('procesando');
    };

    video.ontimeupdate = () => setProgreso(video.currentTime);
    video.onended = () => grabadorRef.current?.stop();
    video.onerror = () => {
      setError('No se ha podido leer este archivo de vídeo.');
      setFase('error');
    };
  }

  async function procesar() {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setFase('transcribiendo');
    try {
      const audio = new Blob(trozosRef.current, { type: grabadorRef.current?.mimeType || 'audio/webm' });
      const fd = new FormData();
      fd.set('audio', audio, 'video-clase.webm');

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
      const nueva = await crearNotaEnPanel(folderId || undefined);
      if (!nueva.ok || !nueva.id) {
        throw new Error(!nueva.ok ? nueva.error : 'No se ha podido crear la nota.');
      }

      const titulo = archivo?.name.replace(/\.[^.]+$/, '') || `Vídeo de clase — ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
      await guardarNota(nueva.id, titulo, bloques);
      setNotaId(nueva.id);

      try {
        const respuestaFlashcards = await fetch('/api/ia/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo, contenido: transcripcion }),
        });
        const datosFlashcards = await respuestaFlashcards.json().catch(() => ({}));
        if (respuestaFlashcards.ok && Array.isArray(datosFlashcards.flashcards)) {
          const guardado = await guardarFlashcards(datosFlashcards.flashcards, { folderId: folderId || undefined, noteId: nueva.id });
          if (guardado.ok) setFlashcardsCreadas(guardado.creadas ?? 0);
        }
      } catch {
        // Sin bloquear: los apuntes ya están guardados.
      }

      setFase('hecho');
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'Algo ha ido mal.');
      setFase('error');
    } finally {
      setArchivo(null);
      grabadorRef.current = null;
    }
  }

  function reiniciar() {
    setFase('inactivo');
    setArchivo(null);
    setError(null);
    setNotaId(null);
    setFlashcardsCreadas(null);
    setProgreso(0);
    setDuracion(0);
  }

  const minutos = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className="card p-5">
      <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50">Analizar vídeo de clase</h3>
      <p className="mt-1.5 text-sm text-ink/60">
        Sube un vídeo ya grabado y Notiq saca apuntes y flashcards de lo que se dice en él.
      </p>

      {/* Oculto: solo hace falta para decodificar el audio, no para verse. */}
      <video ref={videoRef} className="hidden" playsInline />

      {!soportado ? (
        <p className="mt-4 text-sm text-ink/55">
          Tu navegador no admite esta función. Pruébalo en Chrome, Edge o Firefox en un ordenador.
        </p>
      ) : (
        <>
          {fase === 'inactivo' && (
            <label className="btn-secondary mt-4 block w-full cursor-pointer text-center">
              📹 Elegir vídeo
              <input type="file" accept="video/*" onChange={elegirArchivo} className="hidden" />
            </label>
          )}

          {fase === 'listo-para-empezar' && archivo && (
            <div className="mt-4 space-y-3">
              <p className="truncate text-sm text-ink/70">🎬 {archivo.name}</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="etiqueta-campo" htmlFor="velocidad-video">Velocidad</label>
                  <select
                    id="velocidad-video"
                    value={velocidad}
                    onChange={(e) => setVelocidad(Number(e.target.value))}
                    className="campo"
                  >
                    <option value={1}>1×</option>
                    <option value={1.5}>1.5×</option>
                    <option value={2}>2× (más rápido, algo menos fiable)</option>
                  </select>
                </div>
                {carpetas.length > 0 && (
                  <div className="flex-1">
                    <label className="etiqueta-campo" htmlFor="carpeta-video">Carpeta</label>
                    <select id="carpeta-video" value={folderId} onChange={(e) => setFolderId(e.target.value)} className="campo">
                      <option value="">Sin carpeta</option>
                      {carpetas.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={empezar} className="btn-primary flex-1">
                  Empezar análisis
                </button>
                <button type="button" onClick={cancelar} className="btn-fantasma">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {fase === 'procesando' && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-brand-700">
                Procesando el vídeo — {minutos(progreso)} / {duracion ? minutos(duracion) : '…'}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/[0.08]">
                <div
                  className="h-full bg-brand-500 transition-all"
                  style={{ width: `${duracion ? Math.min(100, (progreso / duracion) * 100) : 0}%` }}
                />
              </div>
              <button type="button" onClick={cancelar} className="btn-fantasma mt-3 w-full">
                Cancelar
              </button>
            </div>
          )}

          {(fase === 'transcribiendo' || fase === 'generando') && (
            <p className="mt-4 text-sm text-ink/60">
              {fase === 'transcribiendo' ? 'Transcribiendo el audio…' : 'Generando apuntes y flashcards…'}
            </p>
          )}

          {fase === 'hecho' && notaId && (
            <div className="mt-4 rounded-xl bg-lima-400/15 px-3 py-2.5 text-sm text-lima-700">
              <p>Apuntes guardados{flashcardsCreadas ? ` junto con ${flashcardsCreadas} flashcards` : ''}.</p>
              <button type="button" onClick={() => router.push(`/notas/${notaId}`)} className="mt-2 block font-semibold underline underline-offset-4">
                Ver la nota →
              </button>
              <button type="button" onClick={reiniciar} className="mt-2 block text-ink/50 underline underline-offset-4">
                Analizar otro vídeo
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
        </>
      )}
    </div>
  );
}
