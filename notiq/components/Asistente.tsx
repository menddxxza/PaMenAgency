'use client';

import { useEffect, useRef, useState } from 'react';

type Turno = { role: 'user' | 'assistant'; content: string };

const SUGERENCIAS = [
  'Resume mis notas de esta semana',
  '¿Qué tareas tengo pendientes para el viernes?',
  '¿Qué decidimos en la última reunión?',
  'Búscame las últimas noticias sobre esto',
];

/** Trocea un texto en fragmentos de texto plano y URLs, para poder pintar las URLs
 * como enlaces clicables — hace falta sobre todo cuando el asistente cita fuentes
 * de algo que ha buscado en internet. */
function trocearConEnlaces(texto: string): (string | { url: string })[] {
  const patronUrl = /https?:\/\/[^\s)]+/g;
  const partes: (string | { url: string })[] = [];
  let ultimoIndice = 0;
  for (const coincidencia of texto.matchAll(patronUrl)) {
    const indice = coincidencia.index ?? 0;
    if (indice > ultimoIndice) partes.push(texto.slice(ultimoIndice, indice));
    partes.push({ url: coincidencia[0] });
    ultimoIndice = indice + coincidencia[0].length;
  }
  if (ultimoIndice < texto.length) partes.push(texto.slice(ultimoIndice));
  return partes;
}

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
              Pregúntame sobre tus notas y tareas, o cualquier otra cosa — si hace falta,
              busco en internet antes de responder. De tu contenido solo veo lo tuyo, y
              solo cuando me preguntas.
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
              {turno.role === 'assistant'
                ? trocearConEnlaces(turno.content).map((parte, j) =>
                    typeof parte === 'string' ? (
                      <span key={j}>{parte}</span>
                    ) : (
                      <a
                        key={j}
                        href={parte.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-brand-600 underline hover:text-brand-700"
                      >
                        {parte.url}
                      </a>
                    ),
                  )
                : turno.content}
            </div>
          </div>
        ))}

        {cargando && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink/45 shadow-card">
              Pensando…
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
          placeholder="Pregúntame lo que sea…"
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
