'use client';

import { useEffect, useState } from 'react';
import type { Resumen } from '@/app/(app)/inicio/actions';
import type { Pestana } from './pestanas';

const CLAVE_OCULTO = 'notiq_checklist_oculto';

type Paso = { id: string; texto: string; hecho: boolean; pestana: Pestana };

/**
 * Lista de primeros pasos en Inicio — a diferencia de la nota de bienvenida
 * (que es un contenido fijo, la misma para todo el mundo), esto se marca solo
 * a partir de datos reales del usuario, así que refleja lo que de verdad ha
 * probado. Se oculta sola en cuanto completa los cuatro pasos, o si la
 * descarta a mano (guardado en localStorage: es solo una pista de la
 * interfaz, no algo que tenga sentido sincronizar entre dispositivos).
 */
export default function ChecklistInicio({
  resumen,
  onCambiarPestana,
}: {
  resumen: Resumen;
  onCambiarPestana: (p: Pestana) => void;
}) {
  const [oculto, setOculto] = useState(true);

  useEffect(() => {
    try {
      setOculto(localStorage.getItem(CLAVE_OCULTO) === '1');
    } catch {
      // localStorage bloqueado (navegación privada, permisos): se muestra
      // igual, simplemente no recuerda que se descartó entre visitas.
      setOculto(false);
    }
  }, []);

  const pasos: Paso[] = [
    { id: 'nota', texto: 'Crea una nota propia', hecho: resumen.totalNotas > 1, pestana: 'notas' },
    { id: 'tarea', texto: 'Crea una tarea', hecho: resumen.totalTareasCreadas > 0, pestana: 'tareas' },
    {
      id: 'ia',
      texto: 'Pregúntale algo al asistente',
      hecho: resumen.consumoIa.usadas > 0,
      pestana: 'asistente',
    },
    {
      id: 'estudio',
      texto: 'Genera un examen o flashcards en Estudio',
      hecho: resumen.totalEstudio > 0,
      pestana: 'estudio',
    },
  ];
  const completados = pasos.filter((p) => p.hecho).length;

  if (oculto || completados === pasos.length) return null;

  function descartar() {
    setOculto(true);
    try {
      localStorage.setItem(CLAVE_OCULTO, '1');
    } catch {
      // Sin persistencia si está bloqueado: se ocultará solo para esta vista.
    }
  }

  return (
    <div className="card mt-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight">Primeros pasos</h2>
          <p className="mt-0.5 text-xs text-ink/50">
            {completados} de {pasos.length} — para conocer lo esencial de Notiq.
          </p>
        </div>
        <button type="button" onClick={descartar} className="shrink-0 text-xs text-ink/40 hover:text-ink/70">
          Ocultar
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {pasos.map((paso) => (
          <li key={paso.id}>
            <button
              type="button"
              onClick={() => onCambiarPestana(paso.pestana)}
              disabled={paso.hecho}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                paso.hecho ? 'text-ink/40' : 'hover:bg-ink/[0.04]'
              }`}
            >
              <span
                aria-hidden
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                  paso.hecho
                    ? 'border-lima-400 bg-lima-400/20 text-lima-700'
                    : 'border-ink/20 text-transparent'
                }`}
              >
                ✓
              </span>
              <span className={paso.hecho ? 'line-through' : 'font-medium'}>{paso.texto}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
