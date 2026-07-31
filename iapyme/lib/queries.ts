import { createClient } from '@/lib/supabase/server';
import { createPublicClient } from '@/lib/supabase/public';
import type { Category, ProductoConRelaciones, Profile } from '@/lib/database.types';
import { CATEGORIAS } from '@/lib/categorias';

/** Columnas de producto + categoría + vendedor, para las tarjetas y la ficha. */
const SELECT_PRODUCTO = `
  *,
  categories ( slug, nombre, icono ),
  profiles ( slug, display_name, avatar_url, is_verified )
`;

export type FiltrosCatalogo = {
  categoria?: string;
  q?: string;
  precioMax?: number;
  minutosMax?: number;
  idioma?: 'es' | 'en';
  orden?: 'recientes' | 'vistos' | 'baratos';
};

/**
 * Las 10 categorías. Se leen de la base de datos, pero si aún no hay Supabase
 * configurado se sirven las del módulo estático para que la web siga navegable.
 */
export async function getCategorias(): Promise<Category[]> {
  const supabase = createPublicClient();

  if (supabase) {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('posicion', { ascending: true });

    if (data?.length) return data as Category[];
  }

  return CATEGORIAS.map((c, i) => ({
    id: c.slug,
    slug: c.slug,
    nombre: c.nombre,
    icono: c.icono,
    descripcion: c.descripcion,
    posicion: i + 1,
    created_at: new Date(0).toISOString(),
  }));
}

export async function getCategoria(slug: string): Promise<Category | null> {
  const categorias = await getCategorias();
  return categorias.find((c) => c.slug === slug) ?? null;
}

/** Catálogo publicado, con filtros. Devuelve [] si no hay Supabase todavía. */
export async function getProductos(
  filtros: FiltrosCatalogo = {},
  limite = 24,
): Promise<ProductoConRelaciones[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  let consulta = supabase
    .from('products')
    .select(SELECT_PRODUCTO)
    .eq('status', 'published')
    .limit(limite);

  if (filtros.categoria) {
    const categoria = await getCategoria(filtros.categoria);
    if (!categoria) return [];
    consulta = consulta.eq('category_id', categoria.id);
  }

  if (filtros.q) {
    // Escapar comas y paréntesis: rompen la sintaxis de `or` de PostgREST.
    const termino = filtros.q.replace(/[,()]/g, ' ').trim();
    if (termino) {
      consulta = consulta.or(
        `titulo.ilike.%${termino}%,tagline.ilike.%${termino}%,problema.ilike.%${termino}%`,
      );
    }
  }

  if (filtros.idioma) consulta = consulta.eq('idioma_producto', filtros.idioma);
  if (filtros.minutosMax) consulta = consulta.lte('minutos_instalacion', filtros.minutosMax);
  if (filtros.precioMax) consulta = consulta.lte('precio_setup', filtros.precioMax);

  switch (filtros.orden) {
    case 'vistos':
      consulta = consulta.order('view_count', { ascending: false });
      break;
    case 'baratos':
      consulta = consulta.order('precio_setup', { ascending: true });
      break;
    default:
      consulta = consulta.order('published_at', { ascending: false, nullsFirst: false });
  }

  const { data, error } = await consulta;
  if (error) {
    console.error('[queries] getProductos:', error.message);
    return [];
  }

  return (data ?? []) as unknown as ProductoConRelaciones[];
}

export async function getDestacados(limite = 4): Promise<ProductoConRelaciones[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('products')
    .select(SELECT_PRODUCTO)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limite);

  return (data ?? []) as unknown as ProductoConRelaciones[];
}

/**
 * Ficha por slug. Usa el cliente de sesión a propósito: así el vendedor puede ver su
 * propia ficha antes de publicarla, y el admin puede revisarla. La página que la
 * consume es dinámica, de modo que aquí sí hay cookies.
 */
export async function getProducto(slug: string): Promise<ProductoConRelaciones | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('products')
    .select(SELECT_PRODUCTO)
    .eq('slug', slug)
    .maybeSingle();

  return (data as unknown as ProductoConRelaciones) ?? null;
}

export async function getVendedor(slug: string): Promise<Profile | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  return (data as Profile) ?? null;
}

export async function getProductosDeVendedor(
  sellerId: string,
): Promise<ProductoConRelaciones[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('products')
    .select(SELECT_PRODUCTO)
    .eq('seller_id', sellerId)
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false });

  return (data ?? []) as unknown as ProductoConRelaciones[];
}

/** Cuenta cuántos productos publicados tiene cada categoría. */
export async function getConteoPorCategoria(): Promise<Record<string, number>> {
  const supabase = createPublicClient();
  if (!supabase) return {};

  const { data } = await supabase
    .from('products')
    .select('category_id')
    .eq('status', 'published');

  const conteo: Record<string, number> = {};
  for (const fila of data ?? []) {
    const id = (fila as { category_id: string }).category_id;
    conteo[id] = (conteo[id] ?? 0) + 1;
  }
  return conteo;
}

/** Registra una visita a la ficha. Nunca debe tumbar la página si falla. */
export async function registrarVisita(productId: string, referrer?: string) {
  const supabase = createClient();
  if (!supabase) return;

  const { error } = await supabase.rpc('registrar_visita', {
    p_product_id: productId,
    p_referrer: referrer ?? null,
  });

  if (error) console.error('[queries] registrarVisita:', error.message);
}
