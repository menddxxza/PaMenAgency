import { Sparkles, PencilLine } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Etiqueta obligatoria en cualquier dato simulado/demo (regla fundamental de
 * producto: nunca presentar datos ficticios como resultados reales). Sólo
 * debe aparecer cuando el contenido es la plantilla local de respaldo (sin
 * proveedor de IA configurado o fallo de la llamada), nunca sobre trabajo
 * real generado por el modelo.
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
      Plantilla local (sin IA)
    </span>
  );
}

/**
 * Etiqueta para trabajo real generado por IA que todavía no se ha enviado a
 * nadie: no hay conector externo (WhatsApp/email) conectado en el MVP, así
 * que todo borrador requiere revisión y envío manual por ahora.
 */
export function AIDraftTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-brand-400/30 bg-brand-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-300',
        className
      )}
    >
      <PencilLine className="h-3 w-3" />
      Borrador de IA · sin enviar
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
