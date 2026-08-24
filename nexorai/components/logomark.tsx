import { cn } from '@/lib/utils';

/**
 * Marca de Nexorai: monograma angular en degradado violeta→azul, tal como
 * la proporciona la identidad de marca. Se sirve como PNG con fondo
 * transparente (public/logo-mark.png) en vez de vectorizarse a mano, para
 * no perder fidelidad frente al diseño original.
 */
export function Logomark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.png"
      alt="Nexorai"
      className={cn('h-7 w-auto object-contain', className)}
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-display font-semibold tracking-tight', className)}>
      NEXOR
      <span
        className="bg-clip-text text-transparent"
        style={{ backgroundImage: 'linear-gradient(90deg, #ae36fb, #3b87ff)' }}
      >
        AI
      </span>
    </span>
  );
}
