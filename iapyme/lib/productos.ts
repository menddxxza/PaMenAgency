export type Producto = {
  slug: string;
  titulo: string;
  tagline: string;
  categoriaSlug: string;
  problema: string;
  solucion: string;
  precioSetup: number;
  precioMensual: number;
  minutosInstalacion: number;
  idiomaProducto: 'es' | 'en';
  destacado?: boolean;
};

/** Catálogo de validación: los 5 productos del vendedor #1. */
export const PRODUCTOS: Producto[] = [
  {
    slug: 'atiende',
    titulo: 'Atiende',
    tagline: 'Atención al cliente automatizada 24/7 por WhatsApp',
    categoriaSlug: 'atencion-al-cliente',
    problema: 'Las pymes pierden clientes porque no pueden responder WhatsApp 24 h.',
    solucion:
      'Agente de IA que responde WhatsApp como un humano, agenda citas y filtra spam.',
    precioSetup: 197,
    precioMensual: 29,
    minutosInstalacion: 30,
    idiomaProducto: 'es',
    destacado: true,
  },
  {
    slug: 'agente-citas-clinicas-dentales',
    titulo: 'Agente de Citas para Clínicas Dentales',
    tagline: 'Recupera el 30 % de llamadas que hoy se pierden',
    categoriaSlug: 'salud-y-clinicas',
    problema: 'Las clínicas pierden el 30 % de las llamadas porque nadie las coge.',
    solucion:
      'Agente de IA que agenda citas en tu software dental y envía recordatorios automáticos.',
    precioSetup: 297,
    precioMensual: 49,
    minutosInstalacion: 60,
    idiomaProducto: 'es',
    destacado: true,
  },
  {
    slug: 'bot-facturacion-autonomos',
    titulo: 'Bot de Facturación para Autónomos y Pymes',
    tagline: 'Deja de perder 5 horas a la semana haciendo facturas',
    categoriaSlug: 'finanzas-y-facturacion',
    problema: 'Los autónomos pierden 5 h/semana haciendo facturas a mano.',
    solucion:
      'Bot que genera facturas desde un formulario, las envía y las registra en Holded, A3 o Sage.',
    precioSetup: 147,
    precioMensual: 19,
    minutosInstalacion: 45,
    idiomaProducto: 'es',
  },
  {
    slug: 'asistente-contenido-redes',
    titulo: 'Asistente de Contenido para Redes Sociales',
    tagline: '30 posts al mes con el tono de tu marca',
    categoriaSlug: 'marketing-y-contenido',
    problema: 'Las pymes no tienen tiempo para publicar en redes.',
    solucion:
      'Agente de IA que genera 30 posts al mes adaptados a tu sector y a tu tono de voz.',
    precioSetup: 97,
    precioMensual: 39,
    minutosInstalacion: 15,
    idiomaProducto: 'es',
  },
  {
    slug: 'resumidor-reuniones',
    titulo: 'Resumidor de Reuniones para Equipos',
    tagline: 'Cada reunión acaba con sus acuerdos en Slack',
    categoriaSlug: 'productividad',
    problema: 'Los equipos pierden 2 h/día en reuniones sin apuntes.',
    solucion:
      'Bot que se une a Meet o Zoom, transcribe, extrae los acuerdos y los envía a Slack.',
    precioSetup: 197,
    precioMensual: 29,
    minutosInstalacion: 20,
    idiomaProducto: 'es',
  },
];
