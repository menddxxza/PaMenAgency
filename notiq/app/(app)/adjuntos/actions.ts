'use server';

import { getSesion } from '@/lib/sesion';
import { db, esUuid } from '@/lib/db';

export type Resultado = { ok: true } | { ok: false; error: string };

export type Adjunto = {
  id: string;
  nombre: string;
  tipo: string;
  tamano: number;
  created_at: string;
};

const TIPOS_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO = 8 * 1024 * 1024;

type Destino = { noteId?: string; taskId?: string };

/** Confirma que la nota o la tarea destino es del usuario antes de adjuntar nada. */
async function verificarDestinoPropio(userId: string, destino: Destino): Promise<boolean> {
  const sql = db();

  if (destino.noteId) {
    if (!esUuid(destino.noteId)) return false;
    const [fila] = await sql<{ id: string }[]>`
      select id from notes where id = ${destino.noteId}::uuid and user_id = ${userId}::uuid
    `;
    return Boolean(fila);
  }

  if (destino.taskId) {
    if (!esUuid(destino.taskId)) return false;
    const [fila] = await sql<{ id: string }[]>`
      select id from tasks where id = ${destino.taskId}::uuid and user_id = ${userId}::uuid
    `;
    return Boolean(fila);
  }

  return false;
}

export async function subirAdjunto(formData: FormData): Promise<Resultado & { adjunto?: Adjunto }> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada. Vuelve a entrar.' };

  const archivo = formData.get('archivo');
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { ok: false, error: 'No se ha recibido ningún archivo.' };
  }
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    return { ok: false, error: 'Solo se admiten PDF, JPG, PNG o WEBP.' };
  }
  if (archivo.size > TAMANO_MAXIMO) {
    return { ok: false, error: 'El archivo pesa más de 8 MB.' };
  }

  const noteId = String(formData.get('noteId') ?? '') || undefined;
  const taskId = String(formData.get('taskId') ?? '') || undefined;
  const destino: Destino = { noteId, taskId };

  if (!(await verificarDestinoPropio(sesion.userId, destino))) {
    return { ok: false, error: 'Ese destino ya no está disponible.' };
  }

  const datos = Buffer.from(await archivo.arrayBuffer());
  const nombre = archivo.name.slice(0, 200) || 'archivo';

  const sql = db();
  try {
    const [fila] = await sql<{ id: string; created_at: string }[]>`
      insert into attachments (user_id, note_id, task_id, nombre, tipo, tamano, datos)
      values (
        ${sesion.userId}::uuid,
        ${noteId ?? null}::uuid,
        ${taskId ?? null}::uuid,
        ${nombre},
        ${archivo.type},
        ${archivo.size},
        ${datos}
      )
      returning id, created_at
    `;

    return {
      ok: true,
      adjunto: { id: fila.id, nombre, tipo: archivo.type, tamano: archivo.size, created_at: fila.created_at },
    };
  } catch (fallo) {
    console.error('[notiq] no se ha podido guardar el adjunto', fallo);
    return { ok: false, error: 'No se ha podido guardar el archivo.' };
  }
}

export async function obtenerAdjuntos(destino: Destino): Promise<Adjunto[]> {
  const sesion = await getSesion();
  if (!sesion) return [];

  const sql = db();

  if (destino.noteId && esUuid(destino.noteId)) {
    return sql<Adjunto[]>`
      select id, nombre, tipo, tamano, created_at from attachments
      where note_id = ${destino.noteId}::uuid and user_id = ${sesion.userId}::uuid
      order by created_at desc
    `;
  }

  if (destino.taskId && esUuid(destino.taskId)) {
    return sql<Adjunto[]>`
      select id, nombre, tipo, tamano, created_at from attachments
      where task_id = ${destino.taskId}::uuid and user_id = ${sesion.userId}::uuid
      order by created_at desc
    `;
  }

  return [];
}

export async function borrarAdjunto(id: string): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Adjunto no válido.' };

  const sql = db();
  await sql`delete from attachments where id = ${id}::uuid and user_id = ${sesion.userId}::uuid`;

  return { ok: true };
}
