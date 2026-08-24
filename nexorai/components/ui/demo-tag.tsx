import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Etiqueta obligatoria en cualquier dato simulado/demo (regla fundamental de
 * producto: nunca presentar datos ficticios como resultados reales).
 */
export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-gold-400/30 bg-gold-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gold-300',
        className
      )}
    >
      <Sparkles className="h-3 w-3" />
      Simulación de demostración
    </span>
  );
}

export function EstimateNote({ className }: { className?: string }) {
  return (
    <p className={cn('text-xs text-muted', className)}>
      Estimación basada en los datos proporcionados. No es un resultado garantizado.
    </p>
  );
}
