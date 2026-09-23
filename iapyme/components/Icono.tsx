/**
 * Iconos de trazo, dibujados a mano con la misma rejilla de 24 y el mismo
 * grosor. Sustituyen a los emoji que había escritos en el código: un emoji
 * cambia de forma en cada sistema operativo y abarata cualquier interfaz.
 *
 * Los emoji que vienen de la base de datos (el `icono` de cada categoría) se
 * respetan: son contenido del proyecto, no decoración nuestra.
 */
export type NombreIcono =
  | 'ficha'
  | 'rayo'
  | 'idioma'
  | 'buscar'
  | 'flecha'
  | 'check'
  | 'reloj'
  | 'chispa'
  | 'compartir'
  | 'enlace'
  // Navegación del marketplace
  | 'inicio'
  | 'explorar'
  | 'publicar'
  | 'mensajes'
  | 'perfil'
  | 'cuadricula'
  | 'filtro'
  | 'ubicacion'
  | 'escudo'
  // Tipos de publicación
  | 'negocio'
  | 'servicio'
  | 'profesional'
  | 'trabajo'
  | 'producto'
  | 'proyecto';

const TRAZOS: Record<NombreIcono, React.ReactNode> = {
  // Documento con líneas: la ficha técnica.
  ficha: (
    <>
      <path d="M6 3.5h8.5L19 8v12.5H6z" />
      <path d="M14 3.5V8h5" />
      <path d="M9 12.5h7M9 16h4.5" />
    </>
  ),
  // Rayo: puesta en marcha inmediata.
  rayo: <path d="M13.5 3 6 13.5h5L10.5 21 18 10.5h-5z" />,
  // Bocadillo con acento: el idioma.
  idioma: (
    <>
      <path d="M3.5 6.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H12l-4.5 4v-4H5.5a2 2 0 0 1-2-2z" />
      <path d="M8.5 10.5h7" />
    </>
  ),
  buscar: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  flecha: <path d="M4.5 12h15m0 0-6-6m6 6-6 6" />,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  reloj: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.5l3.5 2" />
    </>
  ),
  // Destello de cuatro puntas: el asistente de IA.
  chispa: (
    <>
      <path d="M12 3.5c.6 3.3 2 4.7 5.3 5.3-3.3.6-4.7 2-5.3 5.3-.6-3.3-2-4.7-5.3-5.3 3.3-.6 4.7-2 5.3-5.3Z" />
      <path d="M18.5 15.5c.3 1.6 1 2.3 2.6 2.6-1.6.3-2.3 1-2.6 2.6-.3-1.6-1-2.3-2.6-2.6 1.6-.3 2.3-1 2.6-2.6Z" />
    </>
  ),
  // Tres nodos enlazados: compartir.
  compartir: (
    <>
      <circle cx="18" cy="5.5" r="2.3" />
      <circle cx="6" cy="12" r="2.3" />
      <circle cx="18" cy="18.5" r="2.3" />
      <path d="M8.1 10.7 15.9 6.9M8.1 13.3 15.9 17.1" />
    </>
  ),
  // Dos eslabones: copiar enlace.
  enlace: (
    <>
      <path d="M10.3 13.7a3.7 3.7 0 0 1 0-5.2l2.2-2.2a3.7 3.7 0 0 1 5.2 5.2L16.5 12.7" />
      <path d="M13.7 10.3a3.7 3.7 0 0 1 0 5.2l-2.2 2.2a3.7 3.7 0 0 1-5.2-5.2L7.5 11.3" />
    </>
  ),

  /* --- Navegación del marketplace ------------------------------------- */

  inicio: (
    <>
      <path d="M4 10.5 12 4l8 6.5V20a.5.5 0 0 1-.5.5h-4V14h-7v6.5h-4A.5.5 0 0 1 4 20z" />
    </>
  ),
  // Brújula: descubrir, no solo buscar lo que ya sabes.
  explorar: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.8 9.2-1.6 4.4-4.4 1.6 1.6-4.4z" />
    </>
  ),
  publicar: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <path d="M12 8.5v7M8.5 12h7" />
    </>
  ),
  // Dos bocadillos: conversación, frente al bocadillo único del idioma.
  mensajes: (
    <>
      <path d="M3.5 6.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-3.5 3v-3H5.5a2 2 0 0 1-2-2z" />
      <path d="M8 16.5v.5a2 2 0 0 0 2 2h5l3.5 3v-3h.5a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-.5" />
    </>
  ),
  perfil: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20.2a7.5 7.5 0 0 1 14.4 0" />
    </>
  ),
  cuadricula: (
    <>
      <rect x="3.8" y="3.8" width="7" height="7" rx="1.8" />
      <rect x="13.2" y="3.8" width="7" height="7" rx="1.8" />
      <rect x="3.8" y="13.2" width="7" height="7" rx="1.8" />
      <rect x="13.2" y="13.2" width="7" height="7" rx="1.8" />
    </>
  ),
  // Tiradores: filtros de búsqueda.
  filtro: (
    <>
      <path d="M4 7.5h16M4 12h16M4 16.5h16" />
      <circle cx="9" cy="7.5" r="2" />
      <circle cx="15" cy="12" r="2" />
      <circle cx="7.5" cy="16.5" r="2" />
    </>
  ),
  ubicacion: (
    <>
      <path d="M12 21s6.5-5.7 6.5-10.3a6.5 6.5 0 1 0-13 0C5.5 15.3 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </>
  ),
  // Escudo con marca: verificación y confianza.
  escudo: (
    <>
      <path d="M12 3.2 5 6v5.5c0 4.2 2.9 7.6 7 9.3 4.1-1.7 7-5.1 7-9.3V6z" />
      <path d="m9 11.8 2.2 2.2 4-4.3" />
    </>
  ),

  /* --- Tipos de publicación -------------------------------------------- */

  // Local con toldo: un negocio.
  negocio: (
    <>
      <path d="M4 9.5h16V20a.5.5 0 0 1-.5.5h-15A.5.5 0 0 1 4 20z" />
      <path d="M4.8 9.5 6 4h12l1.2 5.5" />
      <path d="M9.8 20.5v-6h4.4v6" />
    </>
  ),
  // Llave inglesa: un servicio que se presta.
  servicio: (
    <>
      <path d="M15.6 4.6a5 5 0 0 0-6.2 6.2L4.6 15.6a2 2 0 0 0 2.8 2.8l4.8-4.8a5 5 0 0 0 6.2-6.2l-2.7 2.7-2.4-.6-.6-2.4z" />
    </>
  ),
  // Persona con distintivo: un profesional.
  profesional: (
    <>
      <circle cx="10" cy="8" r="3.4" />
      <path d="M3.8 19.8a6.6 6.6 0 0 1 12.4-3.2" />
      <circle cx="17.5" cy="17.5" r="3.3" />
      <path d="m16.2 17.6 1 1 2-2.2" />
    </>
  ),
  // Maletín: una oferta de trabajo.
  trabajo: (
    <>
      <rect x="3.5" y="7.5" width="17" height="13" rx="2" />
      <path d="M9 7.5V6a1.8 1.8 0 0 1 1.8-1.8h2.4A1.8 1.8 0 0 1 15 6v1.5" />
      <path d="M3.5 12.5h17" />
    </>
  ),
  // Caja: un producto.
  producto: (
    <>
      <path d="m12 3.5 8 4.2v8.6l-8 4.2-8-4.2V7.7z" />
      <path d="M4 7.7l8 4.3 8-4.3M12 12v8.5" />
    </>
  ),
  // Trazo ascendente con destello: un proyecto en marcha.
  proyecto: (
    <>
      <path d="M4 20c0-4 1.6-7.6 4.4-10.2C10.6 7.7 13.6 6.4 17 6c.4 3.4-.9 6.4-3 8.6C11.4 17.4 8 19.4 4 20Z" />
      <path d="M8.6 15.4 4.6 19.4" />
      <circle cx="13.6" cy="10.4" r="1.6" />
    </>
  ),
};

export default function Icono({
  nombre,
  className = 'h-5 w-5',
}: {
  nombre: NombreIcono;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {TRAZOS[nombre]}
    </svg>
  );
}
