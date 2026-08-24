import { cn } from '@/lib/utils';

/**
 * Marca de Nexorai: hexágono formado por tres bandas entrelazadas (esmeralda,
 * verde oscuro y oro) — la identidad visual del producto ("crecimiento
 * estratégico entrelazado"), no un icono de IA genérico.
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
        d="M24 8 12 27h9l-4 13L36 21h-9l4-13Z"
        fill="none"
        stroke="#39bd8a"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M15 34 24 8"
        stroke="#c9a24d"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M33 34 24 8"
        stroke="#135f46"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="24" cy="8" r="2.1" fill="#c9a24d" />
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
