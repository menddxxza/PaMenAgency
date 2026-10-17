import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAccess } from '@/lib/admin';
import { r2Configured, uploadUrl } from '@/lib/r2';

/**
 * URL firmada para que el navegador suba el GLB directo a R2.
 * El fichero no pasa por Vercel: los GLB pesan decenas de MB y el límite
 * de payload de una función serverless es mucho menor.
 */

const schema = z.object({
  filename: z.string().min(1).max(200),
  prefix: z.string().regex(/^[a-z0-9/_-]*$/).default('models'),
});

export async function POST(request: Request) {
  if (adminAccess() !== 'ok') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (!r2Configured()) {
    return NextResponse.json({ error: 'R2 no está configurado' }, { status: 503 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Petición inválida' }, { status: 400 });
  }

  const { filename, prefix } = parsed.data;
  const safe = filename.toLowerCase().replace(/[^a-z0-9._-]/g, '_');
  if (!safe.endsWith('.glb')) {
    return NextResponse.json({ error: 'Solo se aceptan ficheros .glb' }, { status: 400 });
  }

  const storageKey = `${prefix.replace(/\/$/, '')}/${Date.now()}_${safe}`;
  return NextResponse.json({ url: await uploadUrl(storageKey), storage_key: storageKey });
}
