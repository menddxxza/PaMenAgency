import Link from 'next/link';
import { getSesion } from '@/lib/supabase/server';
import { comoBloques, extracto } from '@/lib/bloques';
import { limitesDe } from '@/lib/planes';
import { crearNota, crearCarpeta } from './actions';
import BuscadorNotas from '@/components/BuscadorNotas';

export const metadata = { title: 'Notas · Notiq' };

type Nota = {
  id: string;
  titulo: string;
  content: unknown;
  favorita: boolean;
  folder_id: string | null;
  updated_at: string;
};

export default async function NotasPage({
  searchParams,
}: {
  searchParams: Promise<{ carpeta?: string; q?: string; limite?: string; error?: string }>;
}) {
  const { carpeta, q, limite } = await searchParams;
  const sesion = await getSesion();
  if (!sesion) return null;

  const { supabase, userId, plan } = sesion;

  const [{ data: carpetas }, { count: totalNotas }] = await Promise.all([
    supabase.from('folders').select('id, nombre').eq('user_id', userId).order('nombre'),
    supabase
      .from('notes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('deleted_at', null),
  ]);

  let notas: Nota[] = [];

  if (q) {
    // La búsqueda va por la función SQL: ts_rank ordena por relevancia y el índice
    // GIN hace el trabajo, en lugar de traerse todas las notas y filtrar en JS.
    const { data } = await supabase.rpc('buscar_notas', { p_consulta: q, p_limite: 50 });
    const ids = (data ?? []).map((f: { id: string }) => f.id);

    if (ids.length > 0) {
      const { data: completas } = await supabase
        .from('notes')
        .select('id, titulo, content, favorita, folder_id, updated_at')
        .in('id', ids);

      // El .in() pierde el orden por relevancia, así que se reordena por los ids.
      const porId = new Map((completas ?? []).map((n) => [n.id, n as Nota]));
      notas = ids.flatMap((id: string) => {
        const nota = porId.get(id);
        return nota ? [nota] : [];
      });
    }
  } else {
    let consulta = supabase
      .from('notes')
      .select('id, titulo, content, favorita, folder_id, updated_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('favorita', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(100);

    if (carpeta) consulta = consulta.eq('folder_id', carpeta);

    const { data } = await consulta;
    notas = (data ?? []) as Nota[];
  }

  const limites = limitesDe(plan);
  const cupoLleno = limites.notas !== null && (totalNotas ?? 0) >= limites.notas;

  return (
    <div className="px-5 py-6 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Notas</h1>
          <p className="mt-1 text-sm text-ink/55">
            {totalNotas ?? 0}
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

      {(cupoLleno || limite) && (
        <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Has llegado al límite de {limites.notas} notas del plan {limites.nombre}.{' '}
          <Link href="/ajustes" className="font-semibold underline underline-offset-4">
            Pasa a Pro
          </Link>{' '}
          para tenerlas ilimitadas.
        </p>
      )}

      <div className="mt-6">
        <BuscadorNotas valorInicial={q ?? ''} carpeta={carpeta} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          href="/notas"
          className={`chip ${!carpeta && !q ? 'border-brand-300 bg-brand-50 text-brand-700' : ''}`}
        >
          Todas
        </Link>
        {(carpetas ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/notas?carpeta=${c.id}`}
            className={`chip ${carpeta === c.id ? 'border-brand-300 bg-brand-50 text-brand-700' : ''}`}
          >
            {c.nombre}
          </Link>
        ))}
        <form action={crearCarpeta} className="flex items-center gap-1.5">
          <input
            name="nombre"
            placeholder="Nueva carpeta"
            maxLength={80}
            className="w-36 rounded-full border border-dashed border-ink/20 px-3 py-1 text-xs outline-none focus:border-brand-400"
          />
        </form>
      </div>

      {notas.length === 0 ? (
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
