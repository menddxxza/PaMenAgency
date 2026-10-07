'use client';

import { useEffect, useRef, useState } from 'react';
import Icono from './Icono';

const CLAVE = 'iapyme_respuestas_rapidas';

/**
 * Plantillas de respuesta guardadas en este navegador, no en el servidor.
 * Es una elección deliberada: crear una tabla nueva significa otra
 * migración pendiente de que el admin la pegue a mano en Supabase (ya van
 * varias), y para algo tan personal como "mis frases de siempre" el coste de
 * no sincronizar entre dispositivos vale la pena a cambio de no añadir una
 * más. Vive aparte de `FormularioMensaje` porque la lógica de guardar/borrar
 * no tiene nada que ver con la de enviar un mensaje.
 */
export default function RespuestasRapidas({ onElegir }: { onElegir: (texto: string) => void }) {
  const [plantillas, setPlantillas] = useState<string[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [nueva, setNueva] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CLAVE);
      if (guardado) setPlantillas(JSON.parse(guardado));
    } catch {
      // Sin acceso a localStorage, simplemente no hay plantillas guardadas.
    }
  }, []);

  useEffect(() => {
    function alHacerClicFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener('mousedown', alHacerClicFuera);
    return () => document.removeEventListener('mousedown', alHacerClicFuera);
  }, []);

  function guardar(siguiente: string[]) {
    setPlantillas(siguiente);
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(siguiente));
    } catch {
      // Si no se puede guardar, la lista sigue viva en memoria para esta
      // sesión — no hay razón para romper la interfaz por esto.
    }
  }

  function anadir() {
    const texto = nueva.trim();
    if (!texto) return;
    guardar([...plantillas, texto]);
    setNueva('');
  }

  function borrar(indice: number) {
    guardar(plantillas.filter((_, i) => i !== indice));
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        title="Respuestas rápidas"
        className="mb-0.5 shrink-0 rounded-xl p-2.5 text-ink/60 transition hover:bg-ink/[0.05] hover:text-ink"
      >
        <Icono nombre="chispa" className="h-5 w-5" />
      </button>

      {abierto ? (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-72 rounded-xl border border-ink/10 bg-white p-3 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/50">
            Respuestas rápidas
          </p>

          {plantillas.length === 0 ? (
            <p className="mt-2 text-xs text-ink/50">
              Guarda aquí las frases que más repites al responder.
            </p>
          ) : (
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
              {plantillas.map((texto, indice) => (
                <li key={`${texto}-${indice}`} className="flex items-start gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onElegir(texto);
                      setAbierto(false);
                    }}
                    className="flex-1 truncate rounded-lg px-2 py-1.5 text-left text-xs text-ink/80 hover:bg-ink/[0.05]"
                  >
                    {texto}
                  </button>
                  <button
                    type="button"
                    onClick={() => borrar(indice)}
                    aria-label="Borrar plantilla"
                    className="shrink-0 rounded-lg px-1.5 py-1.5 text-xs text-ink/40 hover:text-red-600"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2 flex gap-1.5 border-t border-ink/10 pt-2">
            <input
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  anadir();
                }
              }}
              maxLength={500}
              placeholder="Nueva plantilla…"
              className="min-w-0 flex-1 rounded-lg border border-ink/15 px-2 py-1.5 text-xs outline-none
                         focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={anadir}
              className="shrink-0 rounded-lg bg-ink/[0.06] px-2.5 py-1.5 text-xs font-semibold text-ink/70 hover:bg-ink/[0.1]"
            >
              Guardar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
