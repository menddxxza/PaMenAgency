const TONOS = {
  neutro: 'border-superficie-300 bg-superficie-100 text-ink/70',
  marca: 'border-brand-200 bg-brand-50 text-brand-700',
  exito: 'border-exito-600/25 bg-exito-50 text-exito-700',
  aviso: 'border-aviso-600/25 bg-aviso-50 text-aviso-700',
  peligro: 'border-peligro-600/25 bg-peligro-50 text-peligro-700',
  oscuro: 'border-transparent bg-ink text-white',
} as const;

/**
 * Etiqueta corta de estado o categoría. Siempre con borde: sobre una tarjeta
 * blanca, un relleno claro sin borde se pierde.
 */
export default function Distintivo({
  children,
  tono = 'neutro',
  className = '',
}: {
  children: React.ReactNode;
  tono?: keyof typeof TONOS;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs
                  font-medium leading-5 ${TONOS[tono]} ${className}`}
    >
      {children}
    </span>
  );
}
