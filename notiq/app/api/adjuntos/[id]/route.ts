import { getSesion } from '@/lib/sesion';
import { db, esUuid } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sesion = await getSesion();
  if (!sesion) return new Response('No autorizado', { status: 401 });
  if (!esUuid(id)) return new Response('No encontrado', { status: 404 });

  const sql = db();
  const [fila] = await sql<{ nombre: string; tipo: string; datos: Buffer }[]>`
    select nombre, tipo, datos from attachments
    where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
  `;
  if (!fila) return new Response('No encontrado', { status: 404 });

  return new Response(new Uint8Array(fila.datos), {
    headers: {
      'Content-Type': fila.tipo,
      'Content-Disposition': `inline; filename="${encodeURIComponent(fila.nombre)}"`,
      // Cada adjunto pertenece a un usuario y no cambia una vez subido, pero es
      // privado: sin este encabezado un proxy o el propio navegador podría
      // guardarlo en una caché compartida.
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  });
}
