import { db, esUuid } from '@/lib/db';

export type Etiqueta = { id: string; nombre: string };

/** Todas las etiquetas del usuario, para el selector de la nota y los filtros de la lista. */
export async function listarEtiquetas(userId: string): Promise<Etiqueta[]> {
  const sql = db();
  return sql<Etiqueta[]>`
    select id, nombre from tags where user_id = ${userId}::uuid order by nombre
  `;
}

export async function etiquetasDeNota(noteId: string, userId: string): Promise<Etiqueta[]> {
  const sql = db();
  return sql<Etiqueta[]>`
    select t.id, t.nombre from tags t
    join note_tags nt on nt.tag_id = t.id
    where nt.note_id = ${noteId}::uuid and t.user_id = ${userId}::uuid
    order by t.nombre
  `;
}

/**
 * Sustituye las etiquetas de una nota por la lista de nombres dada, creando las que
 * no existan todavía. No borra las que se queden sin ninguna nota: puede que el
 * usuario quiera reusarlas luego, y no cuestan nada mientras tanto.
 */
export async function ponerEtiquetas(noteId: string, userId: string, nombres: string[]): Promise<void> {
  if (!esUuid(noteId)) return;

  const limpios = [...new Set(nombres.map((n) => n.trim().slice(0, 40)).filter(Boolean))].slice(0, 20);

  const sql = db();
  await sql.begin(async (tx) => {
    const [notaPropia] = await tx<{ id: string }[]>`
      select id from notes where id = ${noteId}::uuid and user_id = ${userId}::uuid
    `;
    if (!notaPropia) return;

    // Un insert por nombre y no un array-insert de una tacada: así el
    // "on conflict ... returning id" devuelve el id tanto de las etiquetas nuevas
    // como de las que ya existían, en el mismo viaje a la base de datos.
    const filas = await Promise.all(
      limpios.map(
        (nombre) => tx<{ id: string }[]>`
          insert into tags (user_id, nombre) values (${userId}::uuid, ${nombre})
          on conflict (user_id, nombre) do update set nombre = excluded.nombre
          returning id
        `,
      ),
    );
    const ids = filas.map(([fila]) => fila.id);

    await tx`delete from note_tags where note_id = ${noteId}::uuid`;
    if (ids.length > 0) {
      await Promise.all(
        ids.map((tagId) => tx`insert into note_tags (note_id, tag_id) values (${noteId}::uuid, ${tagId}::uuid)`),
      );
    }
  });
}
