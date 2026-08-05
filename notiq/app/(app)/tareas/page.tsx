import { getSesion } from '@/lib/sesion';
import { db } from '@/lib/db';
import VistasTareas from '@/components/VistasTareas';
import { PRIORIDADES, type Tarea } from '@/lib/tareas';
import { crearTarea } from './actions';

export const metadata = { title: 'Tareas · Notiq' };

export default async function TareasPage() {
  const sesion = await getSesion();
  if (!sesion) return null;

  const sql = db();
  const tareas = await sql<Tarea[]>`
    select id, titulo, estado, prioridad, vence::text, note_id, origen from tasks
    where user_id = ${sesion.userId}::uuid
    order by created_at desc limit 500
  `;

  const abiertas = tareas.filter((t) => t.estado !== 'hecha').length;

  return (
    <div className="px-5 py-6 sm:px-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Tareas</h1>
        <p className="mt-1 text-sm text-ink/55">
          {abiertas} abiertas · {tareas.length - abiertas} completadas
        </p>
      </header>

      <form action={crearTarea} className="card mt-6 flex flex-wrap gap-2 p-3">
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
        <input type="date" name="vence" aria-label="Fecha de vencimiento" className="campo w-40" />
        <button type="submit" className="btn-primary">
          Añadir
        </button>
      </form>

      <div className="mt-8">
        <VistasTareas tareas={tareas} />
      </div>
    </div>
  );
}
