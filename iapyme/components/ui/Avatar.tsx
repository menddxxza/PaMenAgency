const TAMANOS = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
} as const;

/** Iniciales a partir del nombre visible, como máximo dos. */
function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0] ?? '')
    .join('')
    .toUpperCase();
}

/**
 * Foto de perfil con recambio en iniciales. El recambio no es decorativo: la
 * mayoría de cuentas nuevas no suben imagen, y un hueco gris hace que un
 * listado entero parezca roto.
 */
export default function Avatar({
  nombre,
  url,
  tamano = 'md',
  className = '',
}: {
  nombre: string;
  url?: string | null;
  tamano?: keyof typeof TAMANOS;
  className?: string;
}) {
  const base = `${TAMANOS[tamano]} shrink-0 overflow-hidden rounded-full ${className}`;

  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" loading="lazy" className={`${base} object-cover`} />;
  }

  return (
    <span
      aria-hidden
      className={`${base} flex items-center justify-center bg-superficie-200 font-semibold text-ink/55`}
    >
      {iniciales(nombre)}
    </span>
  );
}
