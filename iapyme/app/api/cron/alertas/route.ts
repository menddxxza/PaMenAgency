import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { avisarAlertaCoincidencias } from '@/lib/email';
import { FAMILIAS } from '@/lib/tipos-publicacion';
import type { AlertaBusqueda, ProductType } from '@/lib/database.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// El plan gratuito de Vercel corta a los 10s; con Resend por medio, más
// margen. Revisar alertas es trabajo de fondo, no responde a un usuario
// esperando, así que puede permitirse tardar.
export const maxDuration = 60;

function descripcionAlerta(alerta: AlertaBusqueda): string {
  const primerTipo = alerta.tipos[0] as ProductType | undefined;
  const familia = FAMILIAS.find((f) => primerTipo && f.tipos.includes(primerTipo));
  const partes = [alerta.termino, familia?.nombre, alerta.provincia].filter(Boolean);
  return partes.length > 0 ? partes.join(' · ') : 'tu búsqueda guardada';
}

/**
 * Cron diario (ver vercel.json): por cada alerta activa, busca publicaciones
 * llegadas desde la última vez que se revisó y, si hay, avisa por email.
 *
 * Protegido con CRON_SECRET — sin él, cualquiera podría llamar a esta ruta y
 * disparar el envío de todos los avisos a la vez. Vercel Cron manda ese
 * secreto solo si la variable está configurada; si no lo está, la ruta
 * rechaza toda petición en vez de quedarse abierta por descuido.
 */
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) {
    return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secreto}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  const { data: alertas, error } = await supabase
    .from('alertas_busqueda')
    .select('*')
    .eq('activa', true);

  if (error) {
    // 42P01: la tabla no existe todavía (falta la migración 0006, parte 2).
    // No es un fallo del cron, es que no hay nada que revisar aún.
    if (error.code === '42P01') return NextResponse.json({ revisadas: 0, avisos: 0 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let avisos = 0;

  for (const alerta of (alertas ?? []) as AlertaBusqueda[]) {
    let consulta = supabase
      .from('products')
      .select('titulo, slug')
      .eq('status', 'published')
      .gt('created_at', alerta.ultima_ejecucion)
      .limit(20);

    if (alerta.tipos.length > 0) consulta = consulta.in('product_type', alerta.tipos);
    if (alerta.provincia) consulta = consulta.eq('provincia', alerta.provincia);
    if (alerta.termino) {
      const termino = alerta.termino.replace(/[,()]/g, ' ').trim();
      if (termino) consulta = consulta.or(`titulo.ilike.%${termino}%,tagline.ilike.%${termino}%`);
    }

    const { data: coincidencias } = await consulta;

    if (coincidencias && coincidencias.length > 0) {
      const { data: usuario } = await supabase.auth.admin.getUserById(alerta.usuario_id);
      if (usuario?.user?.email) {
        await avisarAlertaCoincidencias({
          destinatario: usuario.user.email,
          descripcionAlerta: descripcionAlerta(alerta),
          publicaciones: coincidencias,
        });
        avisos += 1;
      }
    }

    await supabase
      .from('alertas_busqueda')
      .update({ ultima_ejecucion: new Date().toISOString() })
      .eq('id', alerta.id);
  }

  return NextResponse.json({ revisadas: alertas?.length ?? 0, avisos });
}
