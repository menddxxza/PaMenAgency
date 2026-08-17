/** Fila de estrellas de solo lectura, para mostrar una puntuación ya dada. */
export default function Estrellas({
  puntuacion,
  tamano = 'text-sm',
}: {
  puntuacion: number;
  tamano?: string;
}) {
  const redondeada = Math.round(puntuacion);

  return (
    <span className={`${tamano} tracking-tight text-amber-500`} aria-hidden>
      {'★'.repeat(redondeada)}
      <span className="text-ink/20">{'★'.repeat(5 - redondeada)}</span>
    </span>
  );
}
