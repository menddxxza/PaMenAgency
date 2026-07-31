import type { FiltrosCatalogo } from '@/lib/queries';

export type ParamsBusqueda = {
  q?: string;
  precioMax?: string;
  minutosMax?: string;
  idioma?: string;
  orden?: string;
};

/** Traduce los parámetros de la URL a filtros de consulta, descartando basura. */
export function leerFiltros(params: ParamsBusqueda): FiltrosCatalogo {
  const precioMax = Number(params.precioMax);
  const minutosMax = Number(params.minutosMax);

  return {
    q: params.q?.trim() || undefined,
    precioMax: Number.isFinite(precioMax) && precioMax > 0 ? precioMax : undefined,
    minutosMax: Number.isFinite(minutosMax) && minutosMax > 0 ? minutosMax : undefined,
    idioma: params.idioma === 'es' || params.idioma === 'en' ? params.idioma : undefined,
    orden:
      params.orden === 'vistos' || params.orden === 'baratos' || params.orden === 'recientes'
        ? params.orden
        : undefined,
  };
}
