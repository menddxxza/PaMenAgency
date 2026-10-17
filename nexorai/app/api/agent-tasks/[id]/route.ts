import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({ status: z.enum(['pending', 'done']) });

/**
 * Marca una tarea de agente como hecha/pendiente a mano. Estas tareas son
 * borradores de IA sin envío automático (ver lib/agents/plan.ts): el usuario
 * las ejecuta él mismo fuera de la app y aquí sólo lleva la cuenta de cuáles
 * ya hizo.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('agent_tasks')
    .update({
      status: parsed.data.status,
      completed_at: parsed.data.status === 'done' ? new Date().toISOString() : null,
    })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: 'No se pudo actualizar la tarea.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
