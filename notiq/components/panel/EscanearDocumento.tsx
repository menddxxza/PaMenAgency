'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearNotaEnPanel, guardarNota } from '@/app/(app)/notas/actions';
import { subirAdjunto } from '@/app/(app)/adjuntos/actions';
import { desdeMarkdown } from '@/lib/bloques';

type Fase = 'inactivo' | 'procesando' | 'listo' | 'error';

/** Mete la foto tal cual en un PDF de una sola página, del mismo tamaño que
 * la foto (nada de recortar ni enderezar — versión simple, ver el commit).
 * jsPDF se carga solo cuando hace falta (import dinámico) para no engordar
 * el resto de la app con algo que la mayoría de páginas no usa nunca. */
async function fotoAPdf(archivo: File): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = () => reject(new Error('No se ha podido leer la foto.'));
    lector.readAsDataURL(archivo);
  });

  const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('No se ha podido leer la foto.'));
    img.src = dataUrl;
  });

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: width > height ? 'l' : 'p', unit: 'px', format: [width, height] });
  doc.addImage(dataUrl, archivo.type === 'image/png' ? 'PNG' : 'JPEG', 0, 0, width, height);
  return doc.output('blob');
}

/**
 * Escáner de documentos, versión simple: foto → texto (OCR con el mismo
 * modelo de visión que "Resolver ejercicio") + un PDF de la foto tal cual,
 * los dos guardados en una nota nueva de la carpeta elegida — así no hace
 * falta otra app de escaneo para meter un apunte en papel en Notiq.
 */
export default function EscanearDocumento({ carpetas }: { carpetas: { id: string; nombre: string }[] }) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>('inactivo');
  const [folderId, setFolderId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notaId, setNotaId] = useState<string | null>(null);

  async function elegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;

    setError(null);
    setNotaId(null);
    setFase('procesando');

    try {
      const fd = new FormData();
      fd.set('imagen', archivo);
      const respuestaOcr = await fetch('/api/ia/escanear', { method: 'POST', body: fd });
      const datosOcr = await respuestaOcr.json().catch(() => ({}));
      if (!respuestaOcr.ok) throw new Error(datosOcr.error ?? 'No se ha podido leer este documento.');
      const texto = datosOcr.texto as string;

      const bloques = desdeMarkdown(texto);
      const nueva = await crearNotaEnPanel(folderId || undefined);
      if (!nueva.ok || !nueva.id) {
        throw new Error(!nueva.ok ? nueva.error : 'No se ha podido crear la nota.');
      }

      const titulo = `Documento escaneado — ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
      await guardarNota(nueva.id, titulo, bloques);
      setNotaId(nueva.id);

      // El PDF es un extra (queda el original a mano, por si el texto se ha
      // leído mal en algún punto) — si falla, el texto ya está a salvo.
      try {
        const pdfBlob = await fotoAPdf(archivo);
        const fdAdjunto = new FormData();
        fdAdjunto.set('archivo', new File([pdfBlob], 'documento.pdf', { type: 'application/pdf' }));
        fdAdjunto.set('noteId', nueva.id);
        await subirAdjunto(fdAdjunto);
      } catch {
        // Sin bloquear.
      }

      setFase('listo');
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'Algo ha ido mal.');
      setFase('error');
    }
  }

  function reiniciar() {
    setFase('inactivo');
    setError(null);
    setNotaId(null);
  }

  return (
    <div className="card p-5">
      <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50">Escanear documento</h3>
      <p className="mt-1.5 text-sm text-ink/60">
        Hazle una foto a una página en papel y Notiq saca el texto y guarda también el PDF.
      </p>

      {fase === 'inactivo' && (
        <div className="mt-4 space-y-3">
          {carpetas.length > 0 && (
            <select value={folderId} onChange={(e) => setFolderId(e.target.value)} aria-label="Carpeta" className="campo">
              <option value="">Sin carpeta</option>
              {carpetas.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          )}
          <label className="btn-secondary block w-full cursor-pointer text-center">
            📄 Hacer foto o elegir imagen
            <input type="file" accept="image/*" capture="environment" onChange={elegirFoto} className="hidden" />
          </label>
        </div>
      )}

      {fase === 'procesando' && <p className="mt-4 text-sm text-ink/60">Leyendo el documento…</p>}

      {fase === 'listo' && notaId && (
        <div className="mt-4 rounded-xl bg-lima-400/15 px-3 py-2.5 text-sm text-lima-700">
          <p>Texto y PDF guardados.</p>
          <button type="button" onClick={() => router.push(`/notas/${notaId}`)} className="mt-2 block font-semibold underline underline-offset-4">
            Ver la nota →
          </button>
          <button type="button" onClick={reiniciar} className="mt-2 block text-ink/50 underline underline-offset-4">
            Escanear otro documento
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
