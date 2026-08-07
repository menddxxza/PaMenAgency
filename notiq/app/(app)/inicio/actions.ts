'use server';

import { getSesion } from '@/lib/sesion';
import { db, esUuid } from '@/lib/db';
import { ordenarPorUrgencia, type Tarea } from '@/lib/tareas';
import type { NotaResumen } from '@/app/(app)/notas/actions';

export type CarpetaResumen = {
  id: string;
  nombre: string;
  notas: number;
  tareas: number;
  tareasAbiertas: number;
};

export type Resumen = {
  totalNotas: number;
  tareasAbiertas: number;
  tareasVencidas: number;
  totalAdjuntos: number;
  notasRecientes: NotaResumen[];
  tareasProximas: Tarea[];
  carpetas: CarpetaResumen[];
};

/**
 * Todo lo que pinta la pestaña Inicio, en una sola llamada. Las carpetas mezclan
 * notas y tareas a propósito: son el mismo espacio (ver migrations/0002), así que
 * "Matemáticas" cuenta lo que haya de las dos dentro.
 */
export async function obtenerResumen(): Promise<Resumen | null> {
  const sesion = await getSesion();
  if (!sesion) return null;

  const sql = db();
  const { userId } = sesion;

  const [
    [filaNotas],
    [filaAbiertas],
    [filaVencidas],
    [filaAdjuntos],
    notasRecientes,
    tareasAbiertas,
    carpetas,
  ] = await Promise.all([
    sql<{ total: number }[]>`
      select count(*)::int as total from notes
      where user_id = ${userId}::uuid and deleted_at is null
    `,
    sql<{ total: number }[]>`
      select count(*)::int as total from tasks
      where user_id = ${userId}::uuid and estado != 'hecha'
    `,
    sql<{ total: number }[]>`
      select count(*)::int as total from tasks
      where user_id = ${userId}::uuid and estado != 'hecha' and vence < current_date
    `,
    sql<{ total: number }[]>`
      select count(*)::int as total from attachments where user_id = ${userId}::uuid
    `,
    sql<NotaResumen[]>`
      select id, titulo, content, favorita, folder_id, updated_at from notes
      where user_id = ${userId}::uuid and deleted_at is null
      order by updated_at desc limit 5
    `,
    sql<Tarea[]>`
      select id, titulo, estado, prioridad, vence::text, note_id, origen, folder_id from tasks
      where user_id = ${userId}::uuid and estado != 'hecha'
      order by created_at desc limit 200
    `,
    sql<CarpetaResumen[]>`
      select
        f.id, f.nombre,
        count(distinct n.id)::int as notas,
        count(distinct t.id)::int as tareas,
        count(distinct t.id) filter (where t.estado != 'hecha')::int as "tareasAbiertas"
      from folders f
      left join notes n on n.folder_id = f.id and n.deleted_at is null
      left join tasks t on t.folder_id = f.id
      where f.user_id = ${userId}::uuid
      group by f.id, f.nombre
      order by f.nombre
    `,
  ]);

  return {
    totalNotas: filaNotas.total,
    tareasAbiertas: filaAbiertas.total,
    tareasVencidas: filaVencidas.total,
    totalAdjuntos: filaAdjuntos.total,
    notasRecientes,
    tareasProximas: ordenarPorUrgencia(tareasAbiertas).slice(0, 5),
    carpetas,
  };
}

export type ContenidoCarpeta = {
  carpeta: { id: string; nombre: string };
  notas: NotaResumen[];
  tareas: Tarea[];
};

/** Notas y tareas de una carpeta juntas — lo que pide "entrar y tenerlo todo ordenado". */
export async function obtenerContenidoCarpeta(id: string): Promise<ContenidoCarpeta | null> {
  const sesion = await getSesion();
  if (!sesion) return null;
  if (!esUuid(id)) return null;

  const sql = db();
  const [carpeta] = await sql<{ id: string; nombre: string }[]>`
    select id, nombre from folders where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
  `;
  if (!carpeta) return null;

  const [notas, tareas] = await Promise.all([
    sql<NotaResumen[]>`
      select id, titulo, content, favorita, folder_id, updated_at from notes
      where folder_id = ${id}::uuid and user_id = ${sesion.userId}::uuid and deleted_at is null
      order by favorita desc, updated_at desc
    `,
    sql<Tarea[]>`
      select id, titulo, estado, prioridad, vence::text, note_id, origen, folder_id from tasks
      where folder_id = ${id}::uuid and user_id = ${sesion.userId}::uuid
      order by created_at desc
    `,
  ]);

  return { carpeta, notas, tareas };
}
