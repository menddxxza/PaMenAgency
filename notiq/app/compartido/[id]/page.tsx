import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db, esUuid } from '@/lib/db';
import { comoBloques, type Bloque } from '@/lib/bloques';
import Logo from '@/components/Logo';

export const dynamic = 'force-dynamic';

/**
 * Vista pública de solo lectura de una nota (app/(app)/notas/actions.ts →
 * alternarCompartir). A propósito NO usa getSesion(): cualquiera con el enlace
 * puede entrar aquí, autenticado o no — lo que la protege no es la sesión, es el
 * filtro `compartir_publico = true` de la consulta.
 *
 * No requiere estar en RUTAS_PRIVADAS de auth.config.ts porque no lo está: fuera
 * de esa lista, el middleware deja pasar sin pedir sesión.
 */
export default async function NotaCompartidaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!esUuid(id)) notFound();

  const sql = db();
  const [nota] = await sql<{ titulo: string; content: unknown; updated_at: string }[]>`
    select titulo, content, updated_at from notes
    where id = ${id}::uuid and deleted_at is null and compartir_publico = true
  `;
  if (!nota) notFound();

  const bloques = comoBloques(nota.content);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-ink/5">
        <div className="container-page flex items-center justify-between py-4">
          <Logo />
          <Link href="/" className="btn-fantasma text-sm">
            Qué es Notiq
          </Link>
        </div>
      </header>

      <main className="container-page py-14 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">Nota compartida · solo lectura</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {nota.titulo || 'Sin título'}
          </h1>
          <p className="mt-2 text-sm text-ink/45">
            Actualizada el{' '}
            {new Date(nota.updated_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          <div className="mt-8 space-y-3 text-[15px] leading-relaxed text-ink/85">
            {bloques.map((bloque) => (
              <BloqueLectura key={bloque.id} bloque={bloque} />
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-ink/10 py-8 text-center text-xs text-ink/40">
        Hecho con Notiq — un producto de{' '}
        <a
          href="https://pamenagency.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-ink/55 hover:text-ink"
        >
          PaMenAgency
        </a>
      </footer>
    </div>
  );
}

/**
 * Un bloque, en modo lectura. Sin `imagen`: los adjuntos viven detrás de
 * /api/adjuntos/[id], que exige sesión — enseñarlos aquí requeriría abrir esa
 * ruta a quien no ha iniciado sesión, y eso es un cambio de superficie de
 * seguridad aparte que no entra en "compartir una nota de texto por enlace".
 */
function BloqueLectura({ bloque }: { bloque: Bloque }) {
  if (!bloque.texto.trim() && bloque.tipo !== 'imagen') return null;

  switch (bloque.tipo) {
    case 'titulo':
      return <h2 className="pt-2 text-xl font-extrabold tracking-tight">{bloque.texto}</h2>;
    case 'subtitulo':
      return <h3 className="pt-1 text-lg font-bold tracking-tight">{bloque.texto}</h3>;
    case 'lista':
      return (
        <ul className="list-disc pl-5">
          <li>{bloque.texto}</li>
        </ul>
      );
    case 'tarea':
      return (
        <p className={`flex items-start gap-2 ${bloque.hecho ? 'text-ink/45 line-through' : ''}`}>
          <span aria-hidden>{bloque.hecho ? '☑' : '☐'}</span>
          {bloque.texto}
        </p>
      );
    case 'codigo':
      return (
        <pre className="overflow-x-auto rounded-xl bg-ink/[0.04] p-4 text-sm">
          <code>{bloque.texto}</code>
        </pre>
      );
    case 'cita':
      return (
        <blockquote className="border-l-2 border-brand-300 pl-4 text-ink/65 italic">
          {bloque.texto}
        </blockquote>
      );
    case 'imagen':
      return <p className="text-sm italic text-ink/40">[Imagen no disponible en la vista compartida]</p>;
    default:
      return <p className="whitespace-pre-wrap">{bloque.texto}</p>;
  }
}
