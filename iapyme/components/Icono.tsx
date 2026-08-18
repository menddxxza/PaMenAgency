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
  | 'enlace';

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
