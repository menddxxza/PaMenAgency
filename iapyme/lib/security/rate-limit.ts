const peticionesPorIp = new Map<string, number[]>();

/**
 * Límite simple en memoria por IP y ventana de tiempo. No es a prueba de balas
 * en un entorno con varias instancias serverless, pero frena de forma barata
 * los envíos masivos automatizados a los formularios públicos.
 */
export function excedeLimite(ip: string, maxPeticiones: number, ventanaMs: number): boolean {
  const ahora = Date.now();
  const historial = (peticionesPorIp.get(ip) ?? []).filter((t) => ahora - t < ventanaMs);
  historial.push(ahora);
  peticionesPorIp.set(ip, historial);

  if (peticionesPorIp.size > 5000) {
    for (const [clave, tiempos] of peticionesPorIp) {
      if (tiempos.every((t) => ahora - t > ventanaMs)) peticionesPorIp.delete(clave);
    }
  }

  return historial.length > maxPeticiones;
}

export function obtenerIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'desconocida';
}
