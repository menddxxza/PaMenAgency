/**
 * IAPyme puede desplegarse antes de tener el proyecto de Supabase creado. En ese caso
 * las páginas muestran un aviso de configuración en lugar de reventar, así que hace
 * falta poder preguntar si hay credenciales antes de construir ningún cliente.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function supabaseConfigurado(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * `cover_image_url` solo debería llevar una URL de Supabase Storage, pero
 * `guardarProducto` la guarda como texto libre (`limpiar`, sin validar
 * formato) — cualquiera con sesión podría llamar a la Server Action
 * directamente, sin pasar por `SubirImagen`, y poner ahí lo que quisiera.
 *
 * Eso importa especialmente en `app/p/[slug]/imagen/route.tsx`: ese endpoint
 * hace que el propio servidor (Edge Runtime) vaya a buscar esa URL para
 * componer la imagen, así que una `cover_image_url` maliciosa (una IP
 * interna, el endpoint de metadatos de la nube, un servicio que solo
 * debería ser alcanzable desde dentro) convertiría a IAPyme en una sonda
 * contra su propia red. Esta lista blanca —solo el propio bucket de
 * Storage, por https— es lo que lo impide.
 */
export function esImagenDeStorageConfiable(url: string | null | undefined): boolean {
  if (!url || !SUPABASE_URL) return false;

  let destino: URL;
  let origenPermitido: URL;
  try {
    destino = new URL(url);
    origenPermitido = new URL(SUPABASE_URL);
  } catch {
    return false;
  }

  return (
    destino.protocol === 'https:' &&
    destino.origin === origenPermitido.origin &&
    destino.pathname.startsWith('/storage/v1/object/public/productos/')
  );
}
