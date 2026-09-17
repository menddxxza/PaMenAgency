'use client';

import { useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import NotaEditor, { type NotaEditorHandle } from '@/components/NotaEditor';
import type { Bloque } from '@/lib/bloques';

/**
 * Envuelve el botón "← Notas" y el editor en la ruta standalone
 * (/notas/[id]/page.tsx) para que, igual que en el panel (SeccionNotas.tsx),
 * volver a la lista espere a que termine cualquier guardado pendiente antes
 * de navegar — con un <Link> normal no hay forma de interceptar eso.
 */
export default function VolverYEditor({
  id,
  tituloInicial,
  bloquesIniciales,
  favoritaInicial,
  resumenInicial,
  etiquetasIniciales,
  etiquetasConocidas,
  compartidaInicial,
  tieneVersionAnterior,
  formularioEliminar,
}: {
  id: string;
  tituloInicial: string;
  bloquesIniciales: Bloque[];
  favoritaInicial: boolean;
  resumenInicial: string | null;
  etiquetasIniciales: string[];
  etiquetasConocidas: string[];
  compartidaInicial: boolean;
  tieneVersionAnterior: boolean;
  /** El <form action={borrarNota}> se queda en el server component (page.tsx)
   * para poder usar la server action directamente como su action. */
  formularioEliminar: ReactNode;
}) {
  const router = useRouter();
  const editorRef = useRef<NotaEditorHandle>(null);

  async function volver() {
    await editorRef.current?.guardarSiHaceFalta();
    router.push('/notas');
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <button type="button" onClick={volver} className="btn-fantasma text-sm">
          ← Notas
        </button>
        {formularioEliminar}
      </div>

      <NotaEditor
        ref={editorRef}
        id={id}
        tituloInicial={tituloInicial}
        bloquesIniciales={bloquesIniciales}
        favoritaInicial={favoritaInicial}
        resumenInicial={resumenInicial}
        etiquetasIniciales={etiquetasIniciales}
        etiquetasConocidas={etiquetasConocidas}
        compartidaInicial={compartidaInicial}
      />
    </>
  );
}
