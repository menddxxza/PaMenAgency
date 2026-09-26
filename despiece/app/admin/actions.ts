'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ADMIN_COOKIE, requireAdmin } from '@/lib/admin';
import { glbNodes, parseGLB, suggestComponentCode } from '@/lib/glb';
import { fetchObject, r2Configured } from '@/lib/r2';
import { dbAdmin } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const token = String(formData.get('token') ?? '');
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    redirect('/admin?error=token');
  }
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  redirect('/admin');
}

export async function logout() {
  cookies().delete(ADMIN_COOKIE);
  redirect('/admin');
}

const registerSchema = z.object({
  vehicle_id: z.string().uuid(),
  code: z.string().regex(/^[A-Z0-9_]{4,64}$/, 'Código: mayúsculas, números y _'),
  storage_key: z.string().min(3),
  file_bytes: z.coerce.number().int().nonnegative().optional(),
});

/**
 * Registra un GLB ya subido a R2: lee sus nodos con el parser propio
 * (sin bajar la geometría al navegador) y crea una fila `model_node` por
 * nodo con malla, sugiriendo el componente por el nombre del objeto.
 *
 * El modelo se crea en `draft`: no se publica nada sin revisar el mapeo.
 */
export async function registerModel(formData: FormData) {
  requireAdmin();
  if (!r2Configured()) throw new Error('R2 no está configurado');

  const input = registerSchema.parse({
    vehicle_id: formData.get('vehicle_id'),
    code: formData.get('code'),
    storage_key: formData.get('storage_key'),
    file_bytes: formData.get('file_bytes') ?? undefined,
  });

  const json = parseGLB(await fetchObject(input.storage_key));
  const nodes = glbNodes(json);
  if (nodes.length === 0) throw new Error('El GLB no contiene ningún nodo con malla');

  const client = dbAdmin();
  const { data: model, error: modelError } = await client
    .from('model_3d')
    .insert({
      vehicle_id: input.vehicle_id,
      code: input.code,
      storage_key: input.storage_key,
      file_bytes: input.file_bytes ?? null,
      status: 'draft',
    })
    .select('id')
    .single();
  if (modelError) throw modelError;

  const { data: components, error: componentsError } = await client.from('component').select('id, code');
  if (componentsError) throw componentsError;
  const byCode = new Map((components ?? []).map((c) => [c.code as string, c.id as string]));

  const rows = nodes.map((n, i) => {
    const suggested = suggestComponentCode(n.name, byCode.keys());
    return {
      model_3d_id: model.id,
      // Sin node_uuid en extras, el path hace de identificador: el addon de
      // Blender debería haberlo escrito, y el admin lo muestra como aviso.
      node_uuid: n.node_uuid ?? `path:${n.path}`,
      node_path: n.path,
      component_id: suggested ? byCode.get(suggested) ?? null : null,
      explode_x: n.explode?.[0] ?? 0,
      explode_y: n.explode?.[1] ?? 0,
      explode_z: n.explode?.[2] ?? 0,
      explode_order: i,
      explode_group: n.name.split('.')[0] ?? null,
    };
  });

  const { error: nodesError } = await client
    .from('model_node')
    .upsert(rows, { onConflict: 'model_3d_id,node_uuid' });
  if (nodesError) throw nodesError;

  revalidatePath('/admin');
  redirect(`/admin/modelo/${model.id}`);
}

const nodeSchema = z.object({
  id: z.string().uuid(),
  component_id: z.string().uuid().nullable(),
  explode_x: z.coerce.number(),
  explode_y: z.coerce.number(),
  explode_z: z.coerce.number(),
  selectable: z.boolean(),
});

/** Guarda el mapeo nodo ↔ componente y los vectores de despiece. */
export async function saveNodes(formData: FormData) {
  requireAdmin();
  const ids = formData.getAll('node_id').map(String);
  const client = dbAdmin();

  const rows = ids.map((id) =>
    nodeSchema.parse({
      id,
      component_id: (formData.get(`component_id:${id}`) || null) as string | null,
      explode_x: formData.get(`explode_x:${id}`) ?? 0,
      explode_y: formData.get(`explode_y:${id}`) ?? 0,
      explode_z: formData.get(`explode_z:${id}`) ?? 0,
      selectable: formData.get(`selectable:${id}`) === 'on',
    }),
  );

  for (const row of rows) {
    const { id, ...patch } = row;
    const { error } = await client.from('model_node').update(patch).eq('id', id);
    if (error) throw error;
  }

  revalidatePath(`/admin/modelo/${formData.get('model_id')}`);
}

/** Publica o retira un modelo. Sin nodos mapeados no se publica. */
export async function setModelStatus(formData: FormData) {
  requireAdmin();
  const id = z.string().uuid().parse(formData.get('model_id'));
  const status = z.enum(['draft', 'review', 'published', 'archived']).parse(formData.get('status'));
  const client = dbAdmin();

  if (status === 'published') {
    const { count, error } = await client
      .from('model_node')
      .select('id', { count: 'exact', head: true })
      .eq('model_3d_id', id)
      .not('component_id', 'is', null);
    if (error) throw error;
    if (!count) throw new Error('No se puede publicar: ningún nodo está mapeado a un componente');
  }

  const { error } = await client.from('model_3d').update({ status }).eq('id', id);
  if (error) throw error;

  revalidatePath(`/admin/modelo/${id}`);
  revalidatePath('/admin');
}
