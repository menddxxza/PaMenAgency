'use client';

import { useState } from 'react';

type Fase = 'inactivo' | 'resolviendo' | 'resuelto' | 'error';

type Practica = { enunciado: string; respuesta: string };
type Solucion = { enunciado: string; resultado: string; pasos: string[]; practica: Practica | null };

/** Compara respuestas del tipo "x = 7" / "x=7" / "7" como si fueran la misma,
 * sin exigir que el usuario escriba el ejercicio letra por letra — solo lo
 * imprescindible (letras, números y signo menos) importa para acertar. */
function normalizar(texto: string): string {
  return texto.toLowerCase().replace(/[^a-z0-9áéíóúñ-]/g, '');
}

export default function ResolverEjercicio({ onSalir }: { onSalir: () => void }) {
  const [fase, setFase] = useState<Fase>('inactivo');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [solucion, setSolucion] = useState<Solucion | null>(null);
  const [mostrarPasos, setMostrarPasos] = useState(false);
  const [respuestaPractica, setRespuestaPractica] = useState('');
  const [aciertoPractica, setAciertoPractica] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function elegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(archivo));
    setSolucion(null);
    setMostrarPasos(false);
    setRespuestaPractica('');
    setAciertoPractica(null);
    setError(null);
    setFase('resolviendo');

    try {
      const fd = new FormData();
      fd.set('imagen', archivo);
      const respuesta = await fetch('/api/ia/ejercicio', { method: 'POST', body: fd });
      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(datos.error ?? 'No se ha podido resolver este ejercicio.');

      setSolucion(datos as Solucion);
      setFase('resuelto');
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'Algo ha ido mal.');
      setFase('error');
    }
  }

  function comprobarPractica() {
    if (!solucion?.practica || !respuestaPractica.trim()) return;
    setAciertoPractica(normalizar(respuestaPractica) === normalizar(solucion.practica.respuesta));
  }

  function otraFoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSolucion(null);
    setMostrarPasos(false);
    setRespuestaPractica('');
    setAciertoPractica(null);
    setError(null);
    setFase('inactivo');
  }

  return (
    <div className="px-5 py-6 sm:px-8">
      <button type="button" onClick={onSalir} className="btn-fantasma text-sm">
        ← Estudio
      </button>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Resolver ejercicio</h1>
      <p className="mt-1 text-sm text-ink/55">
        Hazle una foto a un ejercicio (matemáticas, física, química…) y Notiq te lo resuelve paso a paso.
      </p>

      <div className="mx-auto mt-6 max-w-lg">
        {fase === 'inactivo' && (
          <label className="btn-primary block w-full cursor-pointer text-center">
            📸 Hacer foto o elegir imagen
            <input type="file" accept="image/*" capture="environment" onChange={elegirFoto} className="hidden" />
          </label>
        )}

        {previewUrl && fase !== 'inactivo' && (
          <img src={previewUrl} alt="Foto del ejercicio" className="mx-auto max-h-64 rounded-xl border border-ink/10 object-contain" />
        )}

        {fase === 'resolviendo' && <p className="mt-4 text-center text-sm text-ink/60">Leyendo el ejercicio…</p>}

        {fase === 'error' && (
          <div className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-center text-sm text-red-700">
            <p role="alert">{error}</p>
            <button type="button" onClick={otraFoto} className="mt-2 font-semibold underline underline-offset-4">
              Probar con otra foto
            </button>
          </div>
        )}

        {fase === 'resuelto' && solucion && (
          <div className="mt-5 space-y-4">
            <div className="card p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{solucion.enunciado}</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-brand-700">{solucion.resultado}</p>
            </div>

            <button
              type="button"
              onClick={() => setMostrarPasos((v) => !v)}
              className="btn-secondary w-full"
            >
              {mostrarPasos ? 'Ocultar el porqué' : '¿Por qué? →'}
            </button>

            {mostrarPasos && (
              <ol className="card space-y-2 p-5 text-sm">
                {solucion.pasos.map((paso, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 font-bold text-brand-600">{i + 1}.</span>
                    <span className="text-ink/75">{paso}</span>
                  </li>
                ))}
              </ol>
            )}

            {solucion.practica && (
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-ink/50">🎯 Prueba tú</p>
                <p className="mt-2 text-sm font-semibold">{solucion.practica.enunciado}</p>
                <div className="mt-3 flex gap-2">
                  <input
                    value={respuestaPractica}
                    onChange={(e) => {
                      setRespuestaPractica(e.target.value);
                      setAciertoPractica(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && comprobarPractica()}
                    placeholder="Tu respuesta"
                    aria-label="Tu respuesta"
                    className="campo flex-1"
                  />
                  <button type="button" onClick={comprobarPractica} disabled={!respuestaPractica.trim()} className="btn-primary shrink-0">
                    Comprobar
                  </button>
                </div>
                {aciertoPractica !== null && (
                  <p className={`mt-2.5 text-sm font-semibold ${aciertoPractica ? 'text-lima-700' : 'text-red-700'}`}>
                    {aciertoPractica ? '✅ ¡Correcto!' : `❌ No es eso — la respuesta era ${solucion.practica.respuesta}`}
                  </p>
                )}
              </div>
            )}

            <button type="button" onClick={otraFoto} className="btn-fantasma w-full">
              📸 Resolver otro ejercicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
