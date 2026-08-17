'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { slugConSufijo, slugificar } from '@/lib/slug';
import { avisarNuevaRevision } from '@/lib/email';
import type { PricingModel, ProductType } from '@/lib/database.types';

export type ResultadoAccion = { ok: true; slug?: string } | { ok: false; error: string };

const TIPOS: ProductType[] = [
  'automation', 'agent', 'bot', 'app', 'web', 'saas', 'script', 'template', 'service',
];
const MODELOS: PricingModel[] = ['one_time', 'setup_plus_monthly', 'monthly', 'free'];

function limpiar(valor: FormDataEntryValue | null, maximo: number): string {
  return typeof valor === 'string' ? valor.trim().slice(0, maximo) : '';
}

function numero(valor: FormDataEntryValue | null, porDefecto = 0): number {
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : porDefecto;
}

/**
 * Crea o actualiza una ficha. El `status` que llega del formulario solo puede ser
 * 'draft' o 'pending_review'; publicar es cosa del administrador y además la base de
 * datos lo impide con un trigger.
 */
export async function guardarProducto(
  formData: FormData,
): Promise<ResultadoAccion> {
  const supabase = createClient();
  if (!supabase) return { ok: false, error: 'La base de datos no está configurada.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Tienes que iniciar sesión.' };

  const id = limpiar(formData.get('id'), 40);
  const titulo = limpiar(formData.get('titulo'), 120);
  const tagline = limpiar(formData.get('tagline'), 200);
  const problema = limpiar(formData.get('problema'), 4000);
  const solucion = limpiar(formData.get('solucion'), 4000);
  const categoryId = limpiar(formData.get('category_id'), 40);

  if (titulo.length < 3) return { ok: false, error: 'El título es demasiado corto.' };
  if (tagline.length < 10) return { ok: false, error: 'Escribe una frase gancho más descriptiva.' };
  if (!categoryId) return { ok: false, error: 'Elige una categoría.' };
  if (problema.length < 20) return { ok: false, error: 'Explica mejor el problema que resuelve.' };
  if (solucion.length < 20) return { ok: false, error: 'Explica mejor cómo lo resuelve.' };

  const tipo = limpiar(formData.get('product_type'), 20) as ProductType;
  const modelo = limpiar(formData.get('pricing_model'), 24) as PricingModel;

  const enviarARevision = formData.get('enviar') === 'si';

  const campos = {
    seller_id: user.id,
    category_id: categoryId,
    titulo,
    tagline,
    problema,
    solucion,
    descripcion: limpiar(formData.get('descripcion'), 6000) || null,
    requisitos: limpiar(formData.get('requisitos'), 2000) || null,
    product_type: TIPOS.includes(tipo) ? tipo : 'automation',
    pricing_model: MODELOS.includes(modelo) ? modelo : 'setup_plus_monthly',
    precio_setup: numero(formData.get('precio_setup')),
    precio_mensual: numero(formData.get('precio_mensual')),
    precio_unico: numero(formData.get('precio_unico')),
    minutos_instalacion: Math.max(1, numero(formData.get('minutos_instalacion'), 30)),
    idioma_producto: formData.get('idioma_producto') === 'en' ? 'en' : 'es',
    tags: limpiar(formData.get('tags'), 400)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12),
    cover_image_url: limpiar(formData.get('cover_image_url'), 500) || null,
    demo_video_url: limpiar(formData.get('demo_video_url'), 500) || null,
    status: enviarARevision ? ('pending_review' as const) : ('draft' as const),
  };

  if (id) {
    const { error } = await supabase.from('products').update(campos).eq('id', id);
    if (error) return { ok: false, error: traducir(error.message) };

    if (enviarARevision) {
      await avisarNuevaRevision({ titulo, vendedor: user.email ?? 'un vendedor' });
    }

    revalidatePath('/dashboard/productos');
    return { ok: true };
  }

  // Slug único: se reintenta una vez con sufijo si el título ya está cogido.
  let slug = slugificar(titulo);
  let { data, error } = await supabase
    .from('products')
    .insert({ ...campos, slug })
    .select('slug')
    .single();

  if (error?.code === '23505') {
    slug = slugConSufijo(slug);
    ({ data, error } = await supabase
      .from('products')
      .insert({ ...campos, slug })
      .select('slug')
      .single());
  }

  if (error) return { ok: false, error: traducir(error.message) };

  await asegurarPerfilDeVendedor(user.id);

  if (enviarARevision) {
    await avisarNuevaRevision({ titulo, vendedor: user.email ?? 'un vendedor' });
  }

  revalidatePath('/dashboard/productos');
  return { ok: true, slug: data?.slug };
}

/** Manda una ficha a la cola de revisión. */
export async function enviarARevision(id: string): Promise<ResultadoAccion> {
  const supabase = createClient();
  if (!supabase) return { ok: false, error: 'La base de datos no está configurada.' };

  const { data, error } = await supabase
    .from('products')
    .update({ status: 'pending_review' })
    .eq('id', id)
    .select('titulo')
    .single();

  if (error) return { ok: false, error: traducir(error.message) };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  await avisarNuevaRevision({ titulo: data.titulo, vendedor: user?.email ?? 'un vendedor' });

  revalidatePath('/dashboard/productos');
  return { ok: true };
}

export async function archivarProducto(id: string): Promise<ResultadoAccion> {
  const supabase = createClient();
  if (!supabase) return { ok: false, error: 'La base de datos no está configurada.' };

  const { error } = await supabase
    .from('products')
    .update({ status: 'archived' })
    .eq('id', id);

  if (error) return { ok: false, error: traducir(error.message) };

  revalidatePath('/dashboard/productos');
  return { ok: true };
}

/**
 * Quien publica su primera ficha pasa a vendedor y recibe un slug público, para que
 * su perfil sea enlazable desde la ficha. No hay solicitud ni aprobación: el filtro
 * está en la moderación de la ficha, no en la persona.
 */
async function asegurarPerfilDeVendedor(userId: string) {
  const supabase = createClient();
  if (!supabase) return;

  const { data: perfil } = await supabase
    .from('profiles')
    .select('role, slug, display_name')
    .eq('id', userId)
    .single();

  if (!perfil) return;

  const cambios: Record<string, string> = {};
  if (perfil.role === 'buyer') cambios.role = 'seller';

  if (!perfil.slug) {
    const base = slugificar(perfil.display_name) || 'vendedor';
    const { data: ocupado } = await supabase
      .from('profiles')
      .select('id')
      .eq('slug', base)
      .maybeSingle();
    cambios.slug = ocupado ? slugConSufijo(base) : base;
  }

  if (Object.keys(cambios).length > 0) {
    await supabase.from('profiles').update(cambios).eq('id', userId);
  }
}

export async function irAFicha(slug: string) {
  redirect(`/p/${slug}`);
}

/** Normaliza una URL opcional: añade https:// si falta, o la descarta si no es válida. */
function limpiarUrl(valor: FormDataEntryValue | null): string | null {
  const texto = limpiar(valor, 300);
  if (!texto) return null;

  const conProtocolo = /^https?:\/\//i.test(texto) ? texto : `https://${texto}`;
  try {
    return new URL(conProtocolo).toString();
  } catch {
    return null;
  }
}

/** Actualiza los datos del perfil público: nombre, bio, foto y web. */
export async function actualizarPerfil(formData: FormData): Promise<ResultadoAccion> {
  const supabase = createClient();
  if (!supabase) return { ok: false, error: 'La base de datos no está configurada.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Tienes que iniciar sesión.' };

  const displayName = limpiar(formData.get('display_name'), 80);
  if (!displayName) return { ok: false, error: 'Escribe tu nombre o el de tu negocio.' };

  const bio = limpiar(formData.get('bio'), 500) || null;
  const websiteUrl = limpiarUrl(formData.get('website_url'));
  const avatarUrl = limpiarUrl(formData.get('avatar_url'));

  const { data: actualizado, error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      bio,
      website_url: websiteUrl,
      avatar_url: avatarUrl,
    })
    .eq('id', user.id)
    .select('slug')
    .single();

  if (error) return { ok: false, error: 'No hemos podido guardar los cambios.' };

  revalidatePath('/dashboard/perfil');

  // getVendedor() usa el cliente público, que cachea sus fetch 60s (para no
  // pegarle a Supabase en cada visita al catálogo). Que esa página sea
  // force-dynamic no libra de esa caché: es una caché de datos, no de ruta.
  // Sin este revalidatePath explícito, el perfil público podía tardar hasta
  // un minuto en reflejar la foto o la bio recién guardadas.
  if (actualizado?.slug) revalidatePath(`/vendedor/${actualizado.slug}`);
  return { ok: true };
}

function traducir(mensaje: string): string {
  if (mensaje.includes('administrador')) return mensaje;
  if (mensaje.includes('duplicate key')) return 'Ya existe una ficha con ese nombre.';
  if (mensaje.includes('row-level security')) {
    return 'No tienes permiso para modificar esta ficha.';
  }
  return 'No hemos podido guardar los cambios. Inténtalo de nuevo.';
}
