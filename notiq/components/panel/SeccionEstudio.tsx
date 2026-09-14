'use client';

import { useEffect, useState } from 'react';
import GrabarClase from './GrabarClase';
import {
  borrarExamen,
  borrarFlashcard,
  crearExamen,
  crearFlashcardsDeErrores,
  guardarFlashcards,
  guardarIntento,
  obtenerEstudioInicial,
  obtenerExamen,
  obtenerFlashcards,
  obtenerRepasoDeHoy,
  responderFlashcard,
  type EstudioInicial,
  type ExamenCompleto,
  type FlashcardResumen,
  type PreguntaExamen,
  type ResultadoIntento,
} from '@/app/(app)/estudio/actions';

type Vista = 'inicio' | 'repaso' | 'generar' | 'flashcards';

const ETIQUETA_ESTADO: Record<string, { texto: string; clase: string }> = {
  nueva: { texto: 'Nueva', clase: 'bg-ink/[0.05] text-ink/60' },
  repasar: { texto: 'A repasar', clase: 'bg-red-50 text-red-700' },
  progreso: { texto: 'En progreso', clase: 'bg-brand-50 text-brand-700' },
  dominada: { texto: 'Dominada', clase: 'bg-lima-400/15 text-lima-700' },
};

export default function SeccionEstudio() {
  const [datos, setDatos] = useState<EstudioInicial | null>(null);
  const [vista, setVista] = useState<Vista>('inicio');
  const [folderFiltro, setFolderFiltro] = useState<string | undefined>(undefined);

  async function cargar() {
    setDatos(await obtenerEstudioInicial());
  }

  useEffect(() => {
    cargar();
  }, []);

  if (!datos) return null;

  if (vista === 'repaso') {
    return <RepasoFlashcards onSalir={() => { setVista('inicio'); cargar(); }} />;
  }

  if (vista === 'flashcards') {
    return (
      <VerFlashcards
        folderId={folderFiltro}
        carpetas={datos.carpetas}
        onSalir={() => { setVista('inicio'); cargar(); }}
      />
    );
  }

  if (vista === 'generar') {
    return (
      <GenerarContenido
        carpetas={datos.carpetas}
        onSalir={() => { setVista('inicio'); cargar(); }}
      />
    );
  }

  return (
    <div className="px-5 py-6 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Estudio</h1>
          <p className="mt-1 text-sm text-ink/55">
            Flashcards, exámenes y apuntes de clase, todo generado de lo que ya has escrito.
          </p>
        </div>
        <button type="button" onClick={() => setVista('generar')} className="btn-primary">
          + Generar flashcards o examen
        </button>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-8">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold tracking-tight">Repaso de hoy</h2>
                <p className="mt-1 text-sm text-ink/55">
                  {datos.repasoDeHoy.length === 0
                    ? 'No tienes nada pendiente de repasar hoy.'
                    : `${datos.repasoDeHoy.length} flashcard${datos.repasoDeHoy.length === 1 ? '' : 's'} te tocan hoy.`}
                </p>
              </div>
              {datos.repasoDeHoy.length > 0 && (
                <button type="button" onClick={() => setVista('repaso')} className="btn-primary shrink-0">
                  Empezar
                </button>
              )}
            </div>
          </section>

          {datos.progreso.length > 0 && (
            <section>
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">
                Progreso por tema
              </h2>
              <ul className="mt-3 space-y-3">
                {datos.progreso.map((p) => {
                  const total = p.nueva + p.repasar + p.progreso + p.dominada;
                  return (
                    <li key={p.id} className="card p-4">
                      <button
                        type="button"
                        onClick={() => {
                          setFolderFiltro(p.id);
                          setVista('flashcards');
                        }}
                        className="flex w-full items-center justify-between gap-3 text-left"
                      >
                        <span className="font-semibold">📁 {p.nombre}</span>
                        <span className="text-xs text-ink/45">{total} flashcards</span>
                      </button>
                      {total > 0 && (
                        <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-ink/[0.06]">
                          <div className="bg-lima-500" style={{ width: `${(p.dominada / total) * 100}%` }} />
                          <div className="bg-brand-400" style={{ width: `${(p.progreso / total) * 100}%` }} />
                          <div className="bg-red-400" style={{ width: `${(p.repasar / total) * 100}%` }} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">Exámenes</h2>
            </div>
            {datos.examenes.length === 0 ? (
              <p className="mt-3 text-sm text-ink/55">
                Todavía no has generado ningún examen. Pulsa «+ Generar flashcards o examen» arriba.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {datos.examenes.map((e) => (
                  <ExamenFila key={e.id} examen={e} onCambio={cargar} />
                ))}
              </ul>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={() => {
                setFolderFiltro(undefined);
                setVista('flashcards');
              }}
              className="btn-fantasma text-sm"
            >
              Ver todas mis flashcards →
            </button>
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <GrabarClase />
        </div>
      </div>
    </div>
  );
}

function ExamenFila({
  examen,
  onCambio,
}: {
  examen: EstudioInicial['examenes'][number];
  onCambio: () => void;
}) {
  const [tomando, setTomando] = useState(false);
  const [borrando, setBorrando] = useState(false);

  async function borrar() {
    setBorrando(true);
    await borrarExamen(examen.id);
    onCambio();
  }

  if (tomando) {
    return <TomarExamen examenId={examen.id} onSalir={() => { setTomando(false); onCambio(); }} />;
  }

  return (
    <li className="card flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{examen.titulo}</p>
        <p className="text-xs text-ink/45">
          {examen.total_preguntas} preguntas
          {examen.mejor_puntuacion !== null
            ? ` · mejor resultado ${examen.mejor_puntuacion}/${examen.total_preguntas}`
            : ' · sin intentos todavía'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={() => setTomando(true)} className="btn-secondary text-xs">
          Empezar
        </button>
        <button
          type="button"
          onClick={borrar}
          disabled={borrando}
          aria-label={`Borrar el examen "${examen.titulo}"`}
          className="text-ink/30 transition hover:text-red-600"
        >
          ✕
        </button>
      </div>
    </li>
  );
}

/* ---------------------------------------------------------------------------
 * Repaso de flashcards: una tarjeta a la vez, girar para ver la respuesta,
 * "No lo sabía" / "Lo sabía" avanza a la siguiente y actualiza el estado.
 * ------------------------------------------------------------------------- */
function RepasoFlashcards({ onSalir }: { onSalir: () => void }) {
  const [cola, setCola] = useState<FlashcardResumen[] | null>(null);
  const [indice, setIndice] = useState(0);
  const [volteada, setVolteada] = useState(false);
  const [respondiendo, setRespondiendo] = useState(false);

  useEffect(() => {
    obtenerRepasoDeHoy().then((r) => setCola(r ?? []));
  }, []);

  async function responder(acierto: boolean) {
    if (!cola) return;
    setRespondiendo(true);
    await responderFlashcard(cola[indice].id, acierto);
    setRespondiendo(false);
    setVolteada(false);
    if (indice + 1 >= cola.length) onSalir();
    else setIndice(indice + 1);
  }

  if (!cola) return null;

  if (cola.length === 0) {
    return (
      <div className="px-5 py-6 sm:px-8">
        <button type="button" onClick={onSalir} className="btn-fantasma text-sm">
          ← Estudio
        </button>
        <div className="card mt-6 max-w-md p-10 text-center">
          <p className="text-lg font-semibold">Nada pendiente por hoy 🎉</p>
        </div>
      </div>
    );
  }

  const tarjeta = cola[indice];

  return (
    <div className="px-5 py-6 sm:px-8">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onSalir} className="btn-fantasma text-sm">
          ← Estudio
        </button>
        <p className="text-sm text-ink/50">
          {indice + 1} / {cola.length}
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-lg">
        <button
          type="button"
          onClick={() => setVolteada((v) => !v)}
          className="card flex min-h-[16rem] w-full flex-col items-center justify-center p-8 text-center transition hover:border-brand-300"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">
            {volteada ? 'Respuesta' : 'Pregunta'}
          </span>
          <p className="mt-4 text-lg font-semibold leading-relaxed">
            {volteada ? tarjeta.respuesta : tarjeta.pregunta}
          </p>
          {!volteada && <p className="mt-6 text-xs text-ink/40">Toca la tarjeta para ver la respuesta</p>}
        </button>

        {volteada && (
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={respondiendo}
              onClick={() => responder(false)}
              className="btn-secondary flex-1 border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
            >
              🔴 No lo sabía
            </button>
            <button
              type="button"
              disabled={respondiendo}
              onClick={() => responder(true)}
              className="btn-primary flex-1"
            >
              🟢 Lo sabía
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Lista de flashcards (todas, o filtradas por carpeta).
 * ------------------------------------------------------------------------- */
function VerFlashcards({
  folderId,
  carpetas,
  onSalir,
}: {
  folderId?: string;
  carpetas: { id: string; nombre: string }[];
  onSalir: () => void;
}) {
  const [tarjetas, setTarjetas] = useState<FlashcardResumen[] | null>(null);

  async function cargar() {
    setTarjetas(await obtenerFlashcards(folderId));
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  async function borrar(id: string) {
    setTarjetas((actual) => (actual ? actual.filter((t) => t.id !== id) : actual));
    await borrarFlashcard(id);
  }

  const nombreCarpeta = carpetas.find((c) => c.id === folderId)?.nombre;

  return (
    <div className="px-5 py-6 sm:px-8">
      <button type="button" onClick={onSalir} className="btn-fantasma text-sm">
        ← Estudio
      </button>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
        {nombreCarpeta ? `Flashcards · ${nombreCarpeta}` : 'Todas las flashcards'}
      </h1>

      {!tarjetas ? null : tarjetas.length === 0 ? (
        <p className="mt-6 text-sm text-ink/55">No hay flashcards aquí todavía.</p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tarjetas.map((t) => (
            <li key={t.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${ETIQUETA_ESTADO[t.estado].clase}`}>
                  {ETIQUETA_ESTADO[t.estado].texto}
                </span>
                <button
                  type="button"
                  onClick={() => borrar(t.id)}
                  aria-label="Borrar flashcard"
                  className="text-ink/30 transition hover:text-red-600"
                >
                  ✕
                </button>
              </div>
              <p className="mt-2.5 text-sm font-semibold leading-snug">{t.pregunta}</p>
              <p className="mt-1.5 text-sm leading-snug text-ink/60">{t.respuesta}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Generar flashcards o un examen a partir de un texto pegado.
 * ------------------------------------------------------------------------- */
function GenerarContenido({
  carpetas,
  onSalir,
}: {
  carpetas: { id: string; nombre: string }[];
  onSalir: () => void;
}) {
  const [tipo, setTipo] = useState<'flashcards' | 'examen'>('flashcards');
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [folderId, setFolderId] = useState('');
  const [numPreguntas, setNumPreguntas] = useState(10);
  const [dificultad, setDificultad] = useState<'facil' | 'media' | 'dificil'>('media');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function generar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setMensaje(null);

    try {
      if (tipo === 'flashcards') {
        const respuesta = await fetch('/api/ia/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo, contenido }),
        });
        const datos = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) throw new Error(datos.error ?? 'Algo ha ido mal.');

        const guardado = await guardarFlashcards(datos.flashcards, { folderId: folderId || undefined });
        if (!guardado.ok) throw new Error(guardado.error);
        setMensaje(`${guardado.creadas ?? 0} flashcards creadas.`);
      } else {
        const respuesta = await fetch('/api/ia/examen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo, contenido, numPreguntas, dificultad }),
        });
        const datos = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) throw new Error(datos.error ?? 'Algo ha ido mal.');

        const creado = await crearExamen(
          titulo || 'Examen sin título',
          datos.preguntas as PreguntaExamen[],
          folderId || undefined,
        );
        if (!creado.ok) throw new Error(creado.error);
        setMensaje('Examen creado. Puedes empezarlo desde la lista de Estudio.');
      }
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'Algo ha ido mal.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="px-5 py-6 sm:px-8">
      <button type="button" onClick={onSalir} className="btn-fantasma text-sm">
        ← Estudio
      </button>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Generar flashcards o examen</h1>
      <p className="mt-1 text-sm text-ink/55">
        Pega tus apuntes, el resumen de un tema, o el texto que quieras estudiar.
      </p>

      <form onSubmit={generar} className="mt-6 max-w-2xl space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTipo('flashcards')}
            className={`chip ${tipo === 'flashcards' ? 'border-brand-300 bg-brand-50 text-brand-700' : ''}`}
          >
            🃏 Flashcards
          </button>
          <button
            type="button"
            onClick={() => setTipo('examen')}
            className={`chip ${tipo === 'examen' ? 'border-brand-300 bg-brand-50 text-brand-700' : ''}`}
          >
            🎯 Examen
          </button>
        </div>

        <div>
          <label className="etiqueta-campo" htmlFor="titulo-generar">
            Título (opcional)
          </label>
          <input
            id="titulo-generar"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={200}
            placeholder="Genética — Tema 4"
            className="campo"
          />
        </div>

        {carpetas.length > 0 && (
          <div>
            <label className="etiqueta-campo" htmlFor="carpeta-generar">
              Carpeta (opcional)
            </label>
            <select
              id="carpeta-generar"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="campo"
            >
              <option value="">Sin carpeta</option>
              {carpetas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {tipo === 'examen' && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="etiqueta-campo" htmlFor="num-preguntas">
                Nº de preguntas
              </label>
              <input
                id="num-preguntas"
                type="number"
                min={5}
                max={30}
                value={numPreguntas}
                onChange={(e) => setNumPreguntas(Number(e.target.value))}
                className="campo"
              />
            </div>
            <div className="flex-1">
              <label className="etiqueta-campo" htmlFor="dificultad">
                Dificultad
              </label>
              <select
                id="dificultad"
                value={dificultad}
                onChange={(e) => setDificultad(e.target.value as typeof dificultad)}
                className="campo"
              >
                <option value="facil">Fácil</option>
                <option value="media">Media</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="etiqueta-campo" htmlFor="contenido-generar">
            Contenido
          </label>
          <textarea
            id="contenido-generar"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            rows={10}
            placeholder="Pega aquí tus apuntes o el texto que quieras estudiar…"
            className="campo resize-y"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {mensaje && (
          <p className="rounded-xl bg-lima-400/15 px-3 py-2 text-sm text-lima-700">{mensaje}</p>
        )}

        <button type="submit" disabled={cargando || contenido.trim().length < 40} className="btn-primary">
          {cargando ? 'Generando…' : tipo === 'flashcards' ? 'Generar flashcards' : 'Generar examen'}
        </button>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Tomar un examen: una pregunta a la vez, resultado + análisis por tema al
 * terminar, con la opción de convertir los fallos en flashcards.
 * ------------------------------------------------------------------------- */
function TomarExamen({ examenId, onSalir }: { examenId: string; onSalir: () => void }) {
  const [examen, setExamen] = useState<ExamenCompleto | null>(null);
  const [respuestas, setRespuestas] = useState<(number | null)[]>([]);
  const [indice, setIndice] = useState(0);
  const [resultado, setResultado] = useState<ResultadoIntento | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [repasando, setRepasando] = useState(false);
  const [flashcardsCreadas, setFlashcardsCreadas] = useState<number | null>(null);

  useEffect(() => {
    obtenerExamen(examenId).then((e) => {
      setExamen(e);
      if (e) setRespuestas(new Array(e.preguntas.length).fill(null));
    });
  }, [examenId]);

  function elegir(opcion: number) {
    setRespuestas((actual) => actual.map((r, i) => (i === indice ? opcion : r)));
  }

  async function terminar() {
    setEnviando(true);
    const resultadoIntento = await guardarIntento(examenId, respuestas);
    setEnviando(false);
    if (resultadoIntento.ok) {
      setResultado({
        intentoId: resultadoIntento.intentoId,
        puntuacion: resultadoIntento.puntuacion,
        total: resultadoIntento.total,
        porTema: resultadoIntento.porTema,
      });
    }
  }

  async function repasarErrores() {
    if (!resultado) return;
    setRepasando(true);
    const creado = await crearFlashcardsDeErrores(resultado.intentoId);
    setRepasando(false);
    if (creado.ok) setFlashcardsCreadas(creado.creadas ?? 0);
  }

  if (!examen) return null;

  if (resultado) {
    return (
      <div className="px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-lg text-center">
          <p className="eyebrow">{examen.titulo}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
            {resultado.puntuacion}/{resultado.total}
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            {Math.round((resultado.puntuacion / resultado.total) * 100)}% de aciertos
          </p>

          {resultado.porTema.some((t) => t.fallos > 0) && (
            <div className="card mt-6 p-5 text-left">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">
                Dónde has fallado más
              </h2>
              <ul className="mt-3 space-y-2">
                {resultado.porTema
                  .filter((t) => t.fallos > 0)
                  .map((t) => (
                    <li key={t.tema} className="flex items-center justify-between text-sm">
                      <span>🔴 {t.tema}</span>
                      <span className="text-ink/45">
                        {t.fallos}/{t.total} falladas
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            {resultado.puntuacion < resultado.total && flashcardsCreadas === null && (
              <button type="button" onClick={repasarErrores} disabled={repasando} className="btn-primary">
                {repasando ? 'Preparando…' : 'Repasar mis errores'}
              </button>
            )}
            {flashcardsCreadas !== null && (
              <p className="rounded-xl bg-lima-400/15 px-3 py-2 text-sm text-lima-700">
                {flashcardsCreadas} flashcards creadas con lo que has fallado.
              </p>
            )}
            <button type="button" onClick={onSalir} className="btn-secondary">
              Volver a Estudio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pregunta = examen.preguntas[indice];
  const esUltima = indice === examen.preguntas.length - 1;

  return (
    <div className="px-5 py-6 sm:px-8">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onSalir} className="btn-fantasma text-sm">
          ← Salir del examen
        </button>
        <p className="text-sm text-ink/50">
          {indice + 1} / {examen.preguntas.length}
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-lg">
        <p className="text-lg font-semibold leading-relaxed">{pregunta.pregunta}</p>
        <ul className="mt-4 space-y-2">
          {pregunta.opciones.map((opcion, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => elegir(i)}
                className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                  respuestas[indice] === i
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : 'border-ink/10 hover:border-brand-200'
                }`}
              >
                {opcion}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            disabled={indice === 0}
            onClick={() => setIndice((i) => i - 1)}
            className="btn-secondary disabled:opacity-40"
          >
            ← Anterior
          </button>
          {esUltima ? (
            <button type="button" onClick={terminar} disabled={enviando} className="btn-primary">
              {enviando ? 'Corrigiendo…' : 'Terminar examen'}
            </button>
          ) : (
            <button type="button" onClick={() => setIndice((i) => i + 1)} className="btn-primary">
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
