'use client';

import { useState } from 'react';
import { guardarEtiquetas } from '@/app/(app)/notas/actions';

/**
 * Etiquetas de una nota, editables in situ: chips con una `x` para quitar y un
 * campo de texto con sugerencias (datalist nativo, sin dependencias) para añadir.
 * Se guarda al momento con cada cambio, como marcar/desmarcar favorita — no hace
 * falta el debounce del resto del editor porque tocar etiquetas es poco frecuente.
 */
export default function EtiquetasNota({
  noteId,
  etiquetasIniciales,
  etiquetasConocidas,
}: {
  noteId: string;
  etiquetasIniciales: string[];
  etiquetasConocidas: string[];
}) {
  const [etiquetas, setEtiquetas] = useState(etiquetasIniciales);
  const [entrada, setEntrada] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar(siguientes: string[]) {
    setEtiquetas(siguientes);
    setGuardando(true);
    await guardarEtiquetas(noteId, siguientes);
    setGuardando(false);
  }

  function añadirDesdeEntrada() {
    const nombre = entrada.trim();
    setEntrada('');
    if (!nombre || etiquetas.some((e) => e.toLowerCase() === nombre.toLowerCase())) return;
    void guardar([...etiquetas, nombre].slice(0, 20));
  }

  function quitar(nombre: string) {
    void guardar(etiquetas.filter((e) => e !== nombre));
  }

  const sugerencias = etiquetasConocidas.filter(
    (e) => !etiquetas.some((actual) => actual.toLowerCase() === e.toLowerCase()),
  );

  return (
    <div className="mb-5 flex flex-wrap items-center gap-1.5">
      {etiquetas.map((nombre) => (
        <span
          key={nombre}
          className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"
        >
          #{nombre}
          <button
            type="button"
            onClick={() => quitar(nombre)}
            aria-label={`Quitar etiqueta ${nombre}`}
            className="text-brand-400 hover:text-brand-700"
          >
            ×
          </button>
        </span>
      ))}
      <input
        list="etiquetas-sugeridas"
        value={entrada}
        onChange={(e) => setEntrada(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            añadirDesdeEntrada();
          }
        }}
        onBlur={añadirDesdeEntrada}
        placeholder={etiquetas.length === 0 ? 'Añadir etiqueta…' : ''}
        maxLength={40}
        aria-label="Añadir etiqueta"
        className="w-32 bg-transparent text-xs outline-none placeholder:text-ink/35"
      />
      <datalist id="etiquetas-sugeridas">
        {sugerencias.map((nombre) => (
          <option key={nombre} value={nombre} />
        ))}
      </datalist>
      {guardando && <span className="text-[10px] text-ink/35">Guardando…</span>}
    </div>
  );
}
