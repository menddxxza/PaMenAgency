import { createClient } from '@/lib/supabase/server';
import { createPublicClient } from '@/lib/supabase/public';
import type {
  Category,
  ProductoConRelaciones,
  Profile,
  ResenaConAutor,
} from '@/lib/database.types';
import { CATEGORIAS } from '@/lib/categorias';
import { expandirBusqueda } from '@/lib/groq';

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

/**
 * Como getProductos, pero cuando una búsqueda de texto encuentra poco o nada,
 * le pide a Groq términos relacionados y hace una segunda pasada con ellos.
 * Solo para la página de búsqueda: es la única que quiere mostrar al usuario
 * que el resultado se ha ampliado con IA.
 */
export async function getProductosConAmpliacion(
  filtros: FiltrosCatalogo = {},
  limite = 24,
): Promise<{ productos: ProductoConRelaciones[]; ampliadoConIA: boolean }> {
  const productos = await getProductos(filtros, limite);
  const termino = filtros.q?.trim();

  if (!termino || productos.length >= 3) {
    return { productos, ampliadoConIA: false };
  }

  const terminosRelacionados = await expandirBusqueda(termino);
  if (!terminosRelacionados?.length) {
    return { productos, ampliadoConIA: false };
  }

  const supabase = createPublicClient();
  if (!supabase) return { productos, ampliadoConIA: false };

  const orAmpliado = terminosRelacionados
    .map((t) => t.replace(/[,()]/g, ' ').trim())
    .filter(Boolean)
    .map((t) => `titulo.ilike.%${t}%,tagline.ilike.%${t}%,problema.ilike.%${t}%`)
    .join(',');

  if (!orAmpliado) return { productos, ampliadoConIA: false };

  let consultaAmpliada = supabase
    .from('products')
    .select(SELECT_PRODUCTO)
    .eq('status', 'published')
    .or(orAmpliado)
    .limit(limite);

  // Reaplicamos los filtros no textuales para no colar resultados fuera de
  // precio, idioma o categoría solo porque encajan con un término ampliado.
  if (filtros.categoria) {
    const categoria = await getCategoria(filtros.categoria);
    if (categoria) consultaAmpliada = consultaAmpliada.eq('category_id', categoria.id);
  }
  if (filtros.idioma) consultaAmpliada = consultaAmpliada.eq('idioma_producto', filtros.idioma);
  if (filtros.minutosMax) {
    consultaAmpliada = consultaAmpliada.lte('minutos_instalacion', filtros.minutosMax);
  }
  if (filtros.precioMax) consultaAmpliada = consultaAmpliada.lte('precio_setup', filtros.precioMax);

  const { data, error } = await consultaAmpliada;
  if (error || !data?.length) {
    return { productos, ampliadoConIA: false };
  }

  const vistos = new Set(productos.map((p) => p.id));
  const ampliados = (data as unknown as ProductoConRelaciones[]).filter((p) => !vistos.has(p.id));

  if (ampliados.length === 0) {
    return { productos, ampliadoConIA: false };
  }

  return {
    productos: [...productos, ...ampliados].slice(0, limite),
    ampliadoConIA: true,
  };
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

/** Reseñas de un producto, con el autor resuelto, más recientes primero. */
export async function getResenas(productId: string): Promise<ResenaConAutor[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles ( display_name, avatar_url )')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[queries] getResenas:', error.message);
    return [];
  }

  return (data ?? []) as unknown as ResenaConAutor[];
}

/** Si el usuario con sesión ya dejó una reseña en este producto (para no duplicar el formulario). */
export async function getMiResena(productId: string): Promise<ResenaConAutor | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('reviews')
    .select('*, profiles ( display_name, avatar_url )')
    .eq('product_id', productId)
    .eq('buyer_id', user.id)
    .maybeSingle();

  return (data as unknown as ResenaConAutor) ?? null;
}

/**
 * Registra una visita a la ficha. Nunca debe tumbar la página si falla.
 * La función `registrar_visita` en la base de datos ignora las visitas del propio
 * vendedor a su ficha (cuando ha iniciado sesión), así que el contador refleja
 * solo interés real de terceros.
 */
export async function registrarVisita(productId: string, referrer?: string) {
  const supabase = createClient();
  if (!supabase) return;

  const { error } = await supabase.rpc('registrar_visita', {
    p_product_id: productId,
    p_referrer: referrer ?? null,
  });

  if (error) console.error('[queries] registrarVisita:', error.message);
}
