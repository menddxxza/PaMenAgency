import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSesion } from '@/lib/sesion';
import { db, esUuid } from '@/lib/db';
import { comoBloques } from '@/lib/bloques';
import NotaEditor from '@/components/NotaEditor';
import { borrarNota } from '../actions';

export const metadata = { title: 'Nota · Notiq' };

export default async function NotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sesion = await getSesion();
  if (!sesion) return null;
  if (!esUuid(id)) notFound();

  const sql = db();

  const [nota] = await sql<
    { id: string; titulo: string; content: unknown; favorita: boolean; resumen_ia: string | null; deleted_at: string | null }[]
  >`
    select id, titulo, content, favorita, resumen_ia, deleted_at
    from notes where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
  `;

  if (!nota || nota.deleted_at) notFound();

  // Las tareas que salieron de esta nota, para poder volver a ellas desde aquí.
  const tareas = await sql<{ id: string; titulo: string; estado: string }[]>`
    select id, titulo, estado from tasks
    where note_id = ${id}::uuid and user_id = ${sesion.userId}::uuid
    order by created_at desc limit 10
  `;

  return (
    <div className="px-5 py-6 sm:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/notas" className="btn-fantasma text-sm">
          ← Notas
        </Link>
        <form action={borrarNota}>
          <input type="hidden" name="id" value={nota.id} />
          <button type="submit" className="btn-fantasma text-sm text-red-600 hover:bg-red-50">
            Eliminar
          </button>
        </form>
      </div>

      <NotaEditor
        id={nota.id}
        tituloInicial={nota.titulo ?? ''}
        bloquesIniciales={comoBloques(nota.content)}
        favoritaInicial={nota.favorita}
        resumenInicial={nota.resumen_ia}
      />

      {tareas.length > 0 && (
        <section className="mt-10 max-w-2xl border-t border-ink/10 pt-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">
            Tareas de esta nota
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {tareas.map((tarea) => (
              <li key={tarea.id} className="flex items-center gap-2">
                <span aria-hidden>{tarea.estado === 'hecha' ? '☑' : '☐'}</span>
                <span className={tarea.estado === 'hecha' ? 'text-ink/40 line-through' : ''}>
                  {tarea.titulo}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/tareas"
            className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline"
          >
            Ver en el tablero →
          </Link>
        </section>
      )}
    </div>
  );
}
