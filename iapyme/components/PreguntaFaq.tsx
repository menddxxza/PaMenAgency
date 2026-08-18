/**
 * <details>/<summary> nativos: accesibles y sin JS. El signo +/− es puro CSS,
 * así que el estado abierto/cerrado no depende de que el navegador ejecute nada.
 */
export default function PreguntaFaq({
  pregunta,
  children,
}: {
  pregunta: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group border-b border-ink/10 py-5 first:pt-0 last:border-b-0">
      <summary
        className="flex cursor-pointer list-none items-center justify-between gap-4
                   font-display text-lg font-normal text-ink outline-none
                   focus-visible:ring-2 focus-visible:ring-brand-500 [&::-webkit-details-marker]:hidden"
      >
        {pregunta}
        <span
          aria-hidden
          className="shrink-0 text-xl text-ink/40 transition-transform duration-fast ease-out
                     group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="mt-3 max-w-[62ch] leading-relaxed text-ink/70">{children}</div>
    </details>
  );
}
