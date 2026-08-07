'use client';

import { useEffect, useRef, useState } from 'react';

type Turno = { role: 'user' | 'assistant'; content: string };

const SUGERENCIAS = [
  'Resume mis notas de esta semana',
  '¿Qué tareas tengo pendientes para el viernes?',
  '¿Qué decidimos en la última reunión?',
  'Dame las tres cosas más urgentes que tengo',
];

export default function Asistente() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [pregunta, setPregunta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turnos, cargando]);

  async function enviar(texto: string) {
    const limpia = texto.trim();
    if (!limpia || cargando) return;

    const historial = turnos;
    setTurnos([...historial, { role: 'user', content: limpia }]);
    setPregunta('');
    setCargando(true);
    setError(null);

    try {
      const respuesta = await fetch('/api/ia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: limpia, historial }),
      });

      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(datos.error ?? 'Algo ha ido mal.');

      setTurnos((previos) => [...previos, { role: 'assistant', content: datos.respuesta }]);
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'Algo ha ido mal.');
      // La pregunta vuelve al campo para no obligar a reescribirla.
      setTurnos(historial);
      setPregunta(limpia);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col max-w-3xl">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {turnos.length === 0 && (
          <div className="card p-6">
            <p className="text-sm text-ink/70">
              Pregúntame sobre tus notas y tus tareas. Solo veo lo tuyo, y solo cuando
              me preguntas.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGERENCIAS.map((sugerencia) => (
                <button
                  key={sugerencia}
                  type="button"
                  onClick={() => enviar(sugerencia)}
                  className="chip transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {sugerencia}
                </button>
              ))}
            </div>
          </div>
        )}

        {turnos.map((turno, i) => (
          <div
            key={i}
            className={turno.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                turno.role === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'border border-ink/10 bg-white text-ink/85 shadow-card'
              }`}
            >
              {turno.content}
            </div>
          </div>
        ))}

        {cargando && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink/45 shadow-card">
              Leyendo tus notas…
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div ref={finRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void enviar(pregunta);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder="Pregunta sobre tus notas y tareas…"
          aria-label="Pregunta"
          maxLength={1000}
          className="campo flex-1"
        />
        <button type="submit" disabled={cargando || !pregunta.trim()} className="btn-primary">
          Enviar
        </button>
      </form>
    </div>
  );
}
