import type { FiltrosCatalogo } from '@/lib/queries';
import { familiaPorSlug } from '@/lib/tipos-publicacion';

export type ParamsBusqueda = {
  q?: string;
  precioMax?: string;
  minutosMax?: string;
  idioma?: string;
  orden?: string;
  familia?: string;
  provincia?: string;
  /** 'si' = solo peticiones, 'no' = solo ofertas, ausente = las dos cosas. */
  peticion?: string;
};

/** Traduce los parámetros de la URL a filtros de consulta, descartando basura. */
export function leerFiltros(params: ParamsBusqueda): FiltrosCatalogo {
  const precioMax = Number(params.precioMax);
  const minutosMax = Number(params.minutosMax);
  const familia = params.familia ? familiaPorSlug(params.familia) : undefined;

  return {
    q: params.q?.trim() || undefined,
    precioMax: Number.isFinite(precioMax) && precioMax > 0 ? precioMax : undefined,
    minutosMax: Number.isFinite(minutosMax) && minutosMax > 0 ? minutosMax : undefined,
    idioma: params.idioma === 'es' || params.idioma === 'en' ? params.idioma : undefined,
    orden:
      params.orden === 'vistos' ||
      params.orden === 'baratos' ||
      params.orden === 'recientes' ||
      params.orden === 'valorados'
        ? params.orden
        : undefined,
    tipos: familia?.tipos,
    provincia: params.provincia?.trim() || undefined,
    esPeticion:
      params.peticion === 'si' ? true : params.peticion === 'no' ? false : undefined,
  };
}
