'use client';

import { useCallback, useEffect, useState, useTransition, type FormEvent } from 'react';
import VistasTareas from '@/components/VistasTareas';
import { PRIORIDADES, type Tarea } from '@/lib/tareas';
import { crearTarea, obtenerTareas } from '@/app/(app)/tareas/actions';

type Carpeta = { id: string; nombre: string };

export default function SeccionTareas() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [carpetas, setCarpetas] = useState<Carpeta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pendiente, empezar] = useTransition();

  const cargar = useCallback(async () => {
    const datos = await obtenerTareas();
    if (datos) {
      setTareas(datos.tareas);
      setCarpetas(datos.carpetas);
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function crear(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formulario = e.currentTarget;
    const fd = new FormData(formulario);
    empezar(async () => {
      await crearTarea(fd);
      formulario.reset();
      await cargar();
    });
  }

  const abiertas = tareas.filter((t) => t.estado !== 'hecha').length;

  return (
    <div className="px-5 py-6 sm:px-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Tareas</h1>
        <p className="mt-1 text-sm text-ink/55">
          {abiertas} abiertas · {tareas.length - abiertas} completadas
        </p>
      </header>

      <form onSubmit={crear} className="card mt-6 flex flex-wrap gap-2 p-3">
        <input
          name="titulo"
          required
          maxLength={200}
          placeholder="¿Qué hay que hacer?"
          aria-label="Título de la tarea"
          className="campo min-w-[12rem] flex-1 border-0 shadow-none focus:ring-0"
        />
        <select
          name="prioridad"
          defaultValue="normal"
          aria-label="Prioridad"
          className="campo w-32"
        >
          {PRIORIDADES.map((p) => (
            <option key={p.valor} value={p.valor}>
              {p.etiqueta}
            </option>
          ))}
        </select>
        {carpetas.length > 0 && (
          <select name="folder_id" defaultValue="" aria-label="Carpeta" className="campo w-36">
            <option value="">Sin carpeta</option>
            {carpetas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        )}
        <input type="date" name="vence" aria-label="Fecha de vencimiento" className="campo w-40" />
        <button type="submit" className="btn-primary" disabled={pendiente}>
          Añadir
        </button>
      </form>

      <div className="mt-8">
        {!cargando && (
          <VistasTareas tareas={tareas} carpetas={carpetas} onCambio={cargar} />
        )}
      </div>
    </div>
  );
}
