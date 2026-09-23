import Link from 'next/link';

/**
 * Hueco sin contenido. Dice qué pasa, por qué y qué se puede hacer: un vacío
 * sin salida es el sitio donde la gente abandona.
 */
export default function EstadoVacio({
  titulo,
  texto,
  accion,
  icono,
  className = '',
}: {
  titulo: string;
  texto: string;
  accion?: { href: string; texto: string };
  icono?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl border border-dashed border-superficie-300
                  bg-superficie-50 px-6 py-12 text-center ${className}`}
    >
      {icono ? (
        <span aria-hidden className="mb-4 text-ink/30">
          {icono}
        </span>
      ) : null}

      <h3 className="font-display text-base font-semibold text-ink">{titulo}</h3>
      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink/60">{texto}</p>

      {accion ? (
        <Link href={accion.href} className="btn-primary mt-6">
          {accion.texto}
        </Link>
      ) : null}
    </div>
  );
}
