import { cn } from '@/lib/utils';

/**
 * Marca de Nexorai: hexágono con dos triángulos entrelazados (esmeralda y
 * oro) — la identidad visual del producto ("crecimiento estratégico
 * entrelazado"), no un icono de IA genérico. Los vértices de los triángulos
 * coinciden con los del hexágono exterior, por lo que su cruce dibuja un
 * hexágono más pequeño en el centro: un nudo, no una forma aislada.
 */
export function Logomark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn('h-7 w-7', className)}
      aria-hidden="true"
    >
      <path
        d="M24 3 43 13.5v21L24 45 5 34.5v-21L24 3Z"
        stroke="hsl(var(--border))"
        strokeWidth="1"
        fill="hsl(var(--surface))"
      />
      <path
        d="M24 3 43 34.5 5 34.5Z"
        fill="none"
        stroke="#39bd8a"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M43 13.5 24 45 5 13.5Z"
        fill="none"
        stroke="#c9a24d"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="2.1" fill="#eafbf3" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-display font-semibold tracking-tight', className)}>
      NEXORA<span className="text-brand-400">I</span>
    </span>
  );
}
