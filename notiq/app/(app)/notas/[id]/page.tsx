import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSesion } from '@/lib/supabase/server';
import { comoBloques } from '@/lib/bloques';
import NotaEditor from '@/components/NotaEditor';
import { borrarNota } from '../actions';

export const metadata = { title: 'Nota · Notiq' };

export default async function NotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sesion = await getSesion();
  if (!sesion) return null;

  const { data: nota } = await sesion.supabase
    .from('notes')
    .select('id, titulo, content, favorita, resumen_ia, deleted_at')
    .eq('id', id)
    .eq('user_id', sesion.userId)
    .maybeSingle();

  if (!nota || nota.deleted_at) notFound();

  // Las tareas que salieron de esta nota, para poder volver a ellas desde aquí.
  const { data: tareas } = await sesion.supabase
    .from('tasks')
    .select('id, titulo, estado')
    .eq('note_id', id)
    .eq('user_id', sesion.userId)
    .order('created_at', { ascending: false })
    .limit(10);

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

      {tareas && tareas.length > 0 && (
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
