/** Convierte un texto en slug URL-safe: "Bot de Facturación" → "bot-de-facturacion". */
export function slugificar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // marcas diacríticas sueltas tras el NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Añade un sufijo corto para desempatar slugs que ya existen. */
export function slugConSufijo(base: string): string {
  const sufijo = Math.random().toString(36).slice(2, 6);
  return `${base}-${sufijo}`;
}
