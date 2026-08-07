'use client';

import { useEffect, useState, useTransition, type FormEvent } from 'react';
import Link from 'next/link';
import { comoBloques, extracto } from '@/lib/bloques';
import { limitesDe } from '@/lib/planes';
import { crearNota, crearCarpeta, obtenerNotas, type NotaResumen } from '@/app/(app)/notas/actions';

type Carpeta = { id: string; nombre: string };

export default function SeccionNotas() {
  const [carpetas, setCarpetas] = useState<Carpeta[]>([]);
  const [notas, setNotas] = useState<NotaResumen[]>([]);
  const [totalNotas, setTotalNotas] = useState(0);
  const [plan, setPlan] = useState('free');
  const [carpeta, setCarpeta] = useState<string | undefined>(undefined);
  const [q, setQ] = useState('');
  const [cargando, setCargando] = useState(true);
  const [nombreCarpeta, setNombreCarpeta] = useState('');
  const [, empezar] = useTransition();

  async function cargar(filtro: { carpeta?: string; q?: string }) {
    const datos = await obtenerNotas(filtro);
    if (!datos) return;
    setCarpetas(datos.carpetas);
    setNotas(datos.notas);
    setTotalNotas(datos.totalNotas);
    setPlan(datos.plan);
    setCargando(false);
  }

  // Carga inicial al montar la sección la primera vez que se abre la pestaña.
  useEffect(() => {
    cargar({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Búsqueda con debounce: sin URL de por medio, el estado local basta.
  useEffect(() => {
    if (!q) return;
    const temporizador = setTimeout(() => cargar({ q: q.trim() }), 300);
    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function elegirCarpeta(id: string | undefined) {
    setCarpeta(id);
    setQ('');
    cargar({ carpeta: id });
  }

  function buscar(valor: string) {
    setQ(valor);
    if (!valor.trim()) cargar({ carpeta });
  }

  async function crearCarpetaLocal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nombre = nombreCarpeta.trim();
    if (!nombre) return;

    const fd = new FormData();
    fd.set('nombre', nombre);
    empezar(async () => {
      await crearCarpeta(fd);
      setNombreCarpeta('');
      await cargar({ carpeta, q: q.trim() || undefined });
    });
  }

  const limites = limitesDe(plan);
  const cupoLleno = limites.notas !== null && totalNotas >= limites.notas;

  return (
    <div className="px-5 py-6 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Notas</h1>
          <p className="mt-1 text-sm text-ink/55">
            {totalNotas}
            {limites.notas !== null ? ` de ${limites.notas}` : ''} notas
          </p>
        </div>

        <form action={crearNota}>
          {carpeta && <input type="hidden" name="folder_id" value={carpeta} />}
          <button type="submit" className="btn-primary" disabled={cupoLleno}>
            Nueva nota
          </button>
        </form>
      </header>

      {cupoLleno && (
        <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Has llegado al límite de {limites.notas} notas del plan {limites.nombre}. Pasa a Pro
          para tenerlas ilimitadas.
        </p>
      )}

      <div className="relative mt-6 max-w-md">
        <span aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35">
          ⌕
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => buscar(e.target.value)}
          placeholder='Buscar en todas tus notas… ("frase exacta", -excluir)'
          aria-label="Buscar notas"
          className="campo pl-9"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => elegirCarpeta(undefined)}
          className={`chip ${!carpeta && !q ? 'border-brand-300 bg-brand-50 text-brand-700' : ''}`}
        >
          Todas
        </button>
        {carpetas.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => elegirCarpeta(c.id)}
            className={`chip ${carpeta === c.id ? 'border-brand-300 bg-brand-50 text-brand-700' : ''}`}
          >
            {c.nombre}
          </button>
        ))}
        <form onSubmit={crearCarpetaLocal} className="flex items-center gap-1.5">
          <input
            value={nombreCarpeta}
            onChange={(e) => setNombreCarpeta(e.target.value)}
            placeholder="Nueva carpeta"
            maxLength={80}
            className="w-36 rounded-full border border-dashed border-ink/20 px-3 py-1 text-xs outline-none focus:border-brand-400"
          />
        </form>
      </div>

      {!cargando && notas.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-lg font-semibold">
            {q ? 'Ninguna nota coincide con esa búsqueda' : 'Todavía no hay notas aquí'}
          </p>
          <p className="mt-2 text-sm text-ink/60">
            {q
              ? 'Prueba con otras palabras, o con "comillas" para buscar una frase exacta.'
              : 'Crea la primera y empieza a escribir. Los atajos de markdown funcionan desde el primer bloque.'}
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {notas.map((nota) => {
            const bloques = comoBloques(nota.content);
            return (
              <li key={nota.id}>
                <Link
                  href={`/notas/${nota.id}`}
                  className="card block h-full p-5 transition hover:border-brand-300 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-2 font-bold tracking-tight">
                      {nota.titulo || 'Sin título'}
                    </h2>
                    {nota.favorita && <span aria-label="Favorita">⭐</span>}
                  </div>
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink/60">
                    {extracto(bloques, 220) || 'Nota vacía'}
                  </p>
                  <p className="mt-4 text-xs text-ink/40">
                    {new Date(nota.updated_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
