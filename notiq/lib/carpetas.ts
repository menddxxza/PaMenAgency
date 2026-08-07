import { db, esUuid } from '@/lib/db';

/**
 * Confirma que una carpeta es del usuario antes de usarla, y si no lo es, la
 * descarta en vez de fallar. El id de carpeta llega como campo oculto de un
 * <form> normal (o de un FormData armado a mano): cualquiera puede mandar un id
 * ajeno. Sin RLS, nada más lo impide — hay que comprobarlo aquí. Compartida entre
 * notas y tareas porque las carpetas son el mismo espacio para las dos: una
 * carpeta "Matemáticas" agrupa notas y tareas de ese tema por igual.
 */
export async function verificarCarpetaPropia(userId: string, folderId: string): Promise<string | null> {
  if (!esUuid(folderId)) return null;

  const sql = db();
  const filas = await sql<{ id: string }[]>`
    select id from folders where id = ${folderId}::uuid and user_id = ${userId}::uuid
  `;
  return filas[0]?.id ?? null;
}
