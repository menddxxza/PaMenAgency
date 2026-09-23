import type { NombreIcono } from '@/components/Icono';
import type { ProductType } from './database.types';

/**
 * Las seis familias del marketplace. Es la capa que traduce lo que hay en la
 * base de datos a lo que entiende quien entra: nadie busca "un template",
 * busca "algo hecho que pueda usar".
 *
 * Cada familia agrupa uno o varios `product_type`. Las cuatro últimas
 * (negocio, trabajo, profesional, proyecto) dependen de la migración 0006: sin
 * ejecutarla existen en la interfaz pero no hay nada publicado en ellas, que
 * es justo lo que se ve —un estado vacío honesto—, no una sección falsa.
 */
export type SlugFamilia =
  | 'soluciones'
  | 'servicios'
  | 'negocios'
  | 'profesionales'
  | 'trabajos'
  | 'proyectos';

export type Familia = {
  slug: SlugFamilia;
  nombre: string;
  /** Qué encuentra aquí quien busca. En segunda persona, sin adornos. */
  descripcion: string;
  icono: NombreIcono;
  /** Valores de `product_type` que caen en esta familia. */
  tipos: ProductType[];
  /** Necesita la migración 0006 para poder publicarse. */
  requiereMigracion?: boolean;
};

export const FAMILIAS: Familia[] = [
  {
    slug: 'soluciones',
    nombre: 'Soluciones de IA',
    descripcion: 'Automatizaciones, agentes y bots ya construidos y listos para instalar.',
    icono: 'producto',
    tipos: ['automation', 'agent', 'bot', 'app', 'web', 'saas', 'script', 'template'],
  },
  {
    slug: 'servicios',
    nombre: 'Servicios',
    descripcion: 'Trabajo a medida: implantación, consultoría, formación y soporte.',
    icono: 'servicio',
    tipos: ['service'],
  },
  {
    slug: 'negocios',
    nombre: 'Negocios',
    descripcion: 'Empresas que aplican IA y buscan clientes, socios o traspaso.',
    icono: 'negocio',
    tipos: ['negocio' as ProductType],
    requiereMigracion: true,
  },
  {
    slug: 'profesionales',
    nombre: 'Profesionales',
    descripcion: 'Perfiles que ofrecen su trabajo: desarrollo, datos, automatización.',
    icono: 'profesional',
    tipos: ['profesional' as ProductType],
    requiereMigracion: true,
  },
  {
    slug: 'trabajos',
    nombre: 'Trabajos',
    descripcion: 'Ofertas de empleo y encargos puntuales relacionados con IA.',
    icono: 'trabajo',
    tipos: ['trabajo' as ProductType],
    requiereMigracion: true,
  },
  {
    slug: 'proyectos',
    nombre: 'Proyectos',
    descripcion: 'Ideas en marcha que buscan equipo, socios o financiación.',
    icono: 'proyecto',
    tipos: ['proyecto' as ProductType],
    requiereMigracion: true,
  },
];

export function familiaPorSlug(slug: string): Familia | undefined {
  return FAMILIAS.find((familia) => familia.slug === slug);
}

/** A qué familia pertenece un `product_type` concreto. */
export function familiaDeTipo(tipo: ProductType): Familia | undefined {
  return FAMILIAS.find((familia) => familia.tipos.includes(tipo));
}
