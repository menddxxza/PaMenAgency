import { createClient } from '@/lib/supabase/server';
import { createPublicClient } from '@/lib/supabase/public';
import type {
  AlertaBusqueda,
  Category,
  ConversacionResumen,
  Lead,
  LeadMensajeConAutor,
  ProductoConRelaciones,
  ProductType,
  Profile,
  ResenaConAutor,
} from '@/lib/database.types';
import { CATEGORIAS } from '@/lib/categorias';
import { expandirBusqueda } from '@/lib/groq';
import { decodificarOferta } from '@/lib/formato';

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
  orden?: 'recientes' | 'vistos' | 'baratos' | 'valorados';
  /** Tipos de publicación, normalmente los de una familia entera. */
  tipos?: ProductType[];
  /**
   * Provincia normalizada. La columna llega con la migración 0006: si todavía
   * no se ha ejecutado, este filtro concreto no devuelve nada, pero el resto
   * del catálogo sigue funcionando.
   */
  provincia?: string;
  /** Nota media mínima, de 1 a 5. */
  valoracionMin?: number;
  /** Solo peticiones de compra ("busco...") o solo ofertas, según el valor. */
  esPeticion?: boolean;
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
  if (filtros.tipos?.length) consulta = consulta.in('product_type', filtros.tipos);
  if (filtros.provincia) consulta = consulta.eq('provincia', filtros.provincia);
  if (filtros.valoracionMin) consulta = consulta.gte('rating_promedio', filtros.valoracionMin);
  if (filtros.esPeticion !== undefined) consulta = consulta.eq('es_peticion', filtros.esPeticion);

  switch (filtros.orden) {
    case 'vistos':
      consulta = consulta.order('view_count', { ascending: false });
      break;
    case 'baratos':
      consulta = consulta.order('precio_setup', { ascending: true });
      break;
    case 'valorados':
      // Primero la nota, y a igual nota la que tenga más reseñas: un 5,0 con
      // una sola opinión no debería ganarle a un 4,8 con cuarenta.
      consulta = consulta
        .order('rating_promedio', { ascending: false })
        .order('rating_total', { ascending: false });
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

/** Productos guardados por el usuario con sesión, para "Mis favoritos" en el panel. */
export async function getFavoritos(): Promise<ProductoConRelaciones[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('favorites')
    .select(`product_id, products ( ${SELECT_PRODUCTO} )`)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  // Un producto ya no visible por RLS (archivado, o del propio vendedor visto
  // por otra persona) llega como products: null. Se descarta en vez de romper.
  return ((data ?? []) as unknown as { products: ProductoConRelaciones | null }[])
    .map((fila) => fila.products)
    .filter((p): p is ProductoConRelaciones => p !== null);
}

/**
 * Alertas guardadas del usuario. Devuelve [] tanto si no hay sesión como si
 * la tabla `alertas_busqueda` todavía no existe (falta ejecutar la migración
 * 0006) — en ambos casos la página debe verse vacía, no romperse.
 */
export async function getAlertas(): Promise<AlertaBusqueda[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('alertas_busqueda')
    .select('*')
    .eq('usuario_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code !== '42P01') console.error('[queries] getAlertas:', error.message);
    return [];
  }

  return (data ?? []) as unknown as AlertaBusqueda[];
}

/**
 * Todas las conversaciones de una persona: los leads que ha recibido como
 * vendedor y los que ha enviado como comprador, en un único hilo temporal.
 * La política de RLS de `leads` ya solo deja ver `seller_id = auth.uid() or
 * buyer_id = auth.uid()`, así que el `.or()` de aquí solo evita depender
 * únicamente de esa capa.
 */
export async function getConversaciones(perfilId: string): Promise<ConversacionResumen[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('leads')
    .select('*, products ( titulo, slug ), vendedor:profiles!seller_id ( display_name, slug )')
    .or(`seller_id.eq.${perfilId},buyer_id.eq.${perfilId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[queries] getConversaciones:', error.message);
    return [];
  }

  return (data ?? []) as unknown as ConversacionResumen[];
}

/**
 * Un hilo concreto: el lead (con producto y vendedor resueltos) más los
 * mensajes que se han cruzado dentro. Devuelve `null` si el lead no existe o
 * si `perfilId` no es ninguna de las dos partes — cinturón y tirantes sobre
 * lo que ya impide la política de RLS.
 *
 * Los mensajes vienen [] si `lead_mensajes` todavía no existe (falta la
 * migración 0006): el hilo se ve con solo el mensaje original, no se rompe.
 */
export async function getConversacion(
  leadId: string,
  perfilId: string,
): Promise<{ lead: ConversacionResumen; mensajes: LeadMensajeConAutor[] } | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: lead } = await supabase
    .from('leads')
    .select('*, products ( titulo, slug ), vendedor:profiles!seller_id ( display_name, slug )')
    .eq('id', leadId)
    .maybeSingle();

  if (!lead) return null;
  const conversacion = lead as unknown as ConversacionResumen;
  if (conversacion.seller_id !== perfilId && conversacion.buyer_id !== perfilId) return null;

  const { data: mensajes, error } = await supabase
    .from('lead_mensajes')
    .select('*, profiles ( display_name, avatar_url )')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true });

  if (error) {
    if (error.code !== '42P01') console.error('[queries] getConversacion:', error.message);
    return { lead: conversacion, mensajes: [] };
  }

  return { lead: conversacion, mensajes: (mensajes ?? []) as unknown as LeadMensajeConAutor[] };
}

export type Notificacion = {
  leadId: string;
  titulo: string;
  detalle: string;
  fecha: string;
};

/**
 * Para la campana del panel: une leads nuevos sin responder (como vendedor)
 * y respuestas sin leer dentro de un hilo ya abierto (como vendedor o
 * comprador) en una sola lista, de más reciente a más antigua.
 *
 * `total` es el recuento exacto (para el número del badge); `items` es la
 * vista recortada que se enseña en el desplegable — no hace falta traer 200
 * filas para pintar una lista de 10.
 */
export async function getNotificaciones(
  perfilId: string,
): Promise<{ items: Notificacion[]; total: number }> {
  const supabase = createClient();
  if (!supabase) return { items: [], total: 0 };

  const [{ count: totalLeads }, { data: leadsNuevos }] = await Promise.all([
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', perfilId)
      .eq('status', 'new'),
    supabase
      .from('leads')
      .select('id, nombre, mensaje, created_at, products ( titulo )')
      .eq('seller_id', perfilId)
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  const items: Notificacion[] = ((leadsNuevos ?? []) as unknown as (Lead & {
    products: { titulo: string } | null;
  })[]).map((lead) => ({
    leadId: lead.id,
    titulo: `${lead.nombre} te ha escrito`,
    detalle: lead.products?.titulo ?? lead.mensaje.slice(0, 90),
    fecha: lead.created_at,
  }));

  let total = totalLeads ?? 0;

  // Tolerante a que `lead_mensajes` todavía no exista (falta la migración
  // 0006): en ese caso se queda solo con los leads nuevos de arriba.
  const [{ count: totalMensajes }, { data: mensajes, error }] = await Promise.all([
    supabase
      .from('lead_mensajes')
      .select('id, leads!inner(seller_id,buyer_id)', { count: 'exact', head: true })
      .is('leido_at', null)
      .neq('autor_id', perfilId)
      .or(`seller_id.eq.${perfilId},buyer_id.eq.${perfilId}`, { referencedTable: 'leads' }),
    supabase
      .from('lead_mensajes')
      .select('lead_id, cuerpo, created_at, leads!inner ( seller_id, buyer_id, nombre, products ( titulo ) )')
      .is('leido_at', null)
      .neq('autor_id', perfilId)
      .or(`seller_id.eq.${perfilId},buyer_id.eq.${perfilId}`, { referencedTable: 'leads' })
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  if (!error) {
    total += totalMensajes ?? 0;

    type MensajeConLead = {
      lead_id: string;
      cuerpo: string;
      created_at: string;
      leads: { nombre: string; products: { titulo: string } | null } | null;
    };

    for (const m of (mensajes ?? []) as unknown as MensajeConLead[]) {
      const { texto, oferta } = decodificarOferta(m.cuerpo);
      items.push({
        leadId: m.lead_id,
        titulo: m.leads?.products?.titulo ?? `Mensaje de ${m.leads?.nombre ?? 'alguien'}`,
        detalle: oferta !== null ? `Propone ${oferta} €` : texto.slice(0, 90),
        fecha: m.created_at,
      });
    }
  }

  items.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  return { items: items.slice(0, 10), total };
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

/**
 * "También te puede interesar" al final de una ficha. Prioriza la misma
 * categoría (el sector es más relevante que el tipo de publicación para
 * decidir si algo encaja), y si no hay suficientes, completa con el mismo
 * `product_type`. Nunca se devuelve a sí misma.
 */
export async function getProductosRelacionados(
  producto: Pick<ProductoConRelaciones, 'id' | 'category_id' | 'product_type'>,
  limite = 4,
): Promise<ProductoConRelaciones[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data: porCategoria } = await supabase
    .from('products')
    .select(SELECT_PRODUCTO)
    .eq('category_id', producto.category_id)
    .eq('status', 'published')
    .neq('id', producto.id)
    .order('view_count', { ascending: false })
    .limit(limite);

  const relacionados = (porCategoria ?? []) as unknown as ProductoConRelaciones[];
  if (relacionados.length >= limite) return relacionados;

  // No hay suficientes en la misma categoría: se completa con el mismo tipo,
  // sin repetir ninguna de las ya elegidas.
  const vistos = new Set([producto.id, ...relacionados.map((p) => p.id)]);
  const { data: porTipo } = await supabase
    .from('products')
    .select(SELECT_PRODUCTO)
    .eq('product_type', producto.product_type)
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(limite);

  for (const p of (porTipo ?? []) as unknown as ProductoConRelaciones[]) {
    if (relacionados.length >= limite) break;
    if (!vistos.has(p.id)) {
      relacionados.push(p);
      vistos.add(p.id);
    }
  }

  return relacionados;
}

export type SemanaLeads = { etiqueta: string; total: number };

/**
 * Lunes de la semana en la que cae `fecha`, a medianoche. No es el `view_count`
 * acumulado de `products` (eso no tiene fecha por fila, así que no se puede
 * trocear en el tiempo) — es `leads.created_at`, que sí la tiene, y por eso el
 * gráfico del panel es "mensajes por semana" y no "visitas por semana".
 */
function inicioDeSemana(fecha: Date): Date {
  const d = new Date(fecha);
  const dia = d.getDay();
  const diff = (dia === 0 ? -6 : 1) - dia; // lunes como primer día
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Mensajes recibidos por semana, las últimas `semanas` completas, para el gráfico del panel. */
export async function getLeadsPorSemana(sellerId: string, semanas = 8): Promise<SemanaLeads[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const hoy = new Date();
  const desde = inicioDeSemana(new Date(hoy.getTime() - (semanas - 1) * 7 * 86_400_000));

  const { data } = await supabase
    .from('leads')
    .select('created_at')
    .eq('seller_id', sellerId)
    .gte('created_at', desde.toISOString());

  const buckets = new Map<string, number>();
  for (let i = semanas - 1; i >= 0; i--) {
    const inicio = inicioDeSemana(new Date(hoy.getTime() - i * 7 * 86_400_000));
    buckets.set(inicio.toISOString().slice(0, 10), 0);
  }

  for (const lead of data ?? []) {
    const clave = inicioDeSemana(new Date(lead.created_at)).toISOString().slice(0, 10);
    if (buckets.has(clave)) buckets.set(clave, (buckets.get(clave) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([inicio, total]) => ({
    etiqueta: new Date(inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    total,
  }));
}

/**
 * Igual que `getProducto`, pero para los sitios que generan una imagen a
 * partir de la ficha (`opengraph-image.tsx`, `/p/[slug]/imagen`): esos
 * endpoints son cacheables y públicos por diseño (los recorre cualquier bot
 * de WhatsApp/redes sin sesión, y Vercel los sirve desde CDN compartida), así
 * que no pueden depender de `getProducto` — ese usa el cliente con sesión, y
 * respeta RLS para que el propio vendedor pueda ver su ficha sin publicar
 * antes de que salga al catálogo.
 *
 * Esa combinación es la trampa: si el vendedor (con su sesión) es quien
 * dispara la primera generación de la imagen de una ficha todavía no
 * publicada, y la respuesta se cachea como pública, cualquier otra persona
 * que pida esa misma URL después recibiría la imagen cacheada con datos que
 * se suponía que solo el vendedor podía ver — sin que la CDN vuelva a
 * comprobar sesión ni RLS. Esta función usa el cliente público (sin cookies,
 * nunca puede acceder a algo que RLS bloquee) y además filtra
 * `status = 'published'` ella misma, por si el día de mañana cambiara esa
 * política de RLS.
 */
export async function getProductoPublico(slug: string): Promise<ProductoConRelaciones | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('products')
    .select(SELECT_PRODUCTO)
    .eq('slug', slug)
    .eq('status', 'published')
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

/**
 * Cuántas publicaciones hay de cada `product_type`. Una sola consulta y el
 * recuento en memoria, igual que el de categorías: PostgREST no agrupa, y
 * seis consultas —una por familia— para pintar seis números no compensa.
 */
export async function getConteoPorTipo(): Promise<Record<string, number>> {
  const supabase = createPublicClient();
  if (!supabase) return {};

  const { data } = await supabase
    .from('products')
    .select('product_type')
    .eq('status', 'published');

  const conteo: Record<string, number> = {};
  for (const fila of data ?? []) {
    const tipo = (fila as { product_type: string }).product_type;
    conteo[tipo] = (conteo[tipo] ?? 0) + 1;
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
