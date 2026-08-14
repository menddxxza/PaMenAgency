import type { ProductStatus } from '@/lib/database.types';

const ESTILOS: Record<ProductStatus, { etiqueta: string; clase: string }> = {
  draft: { etiqueta: 'Borrador', clase: 'bg-ink/[0.06] text-ink/60' },
  pending_review: { etiqueta: 'En revisión', clase: 'bg-amber-100 text-amber-800' },
  published: { etiqueta: 'Publicado', clase: 'bg-accent-500/15 text-accent-700' },
  rejected: { etiqueta: 'Rechazado', clase: 'bg-red-100 text-red-700' },
  archived: { etiqueta: 'Archivado', clase: 'bg-ink/[0.06] text-ink/45' },
};

export default function EstadoFicha({ status }: { status: ProductStatus }) {
  const estilo = ESTILOS[status];

  return (
    <span className={`inline-block rounded-md px-2 py-1 text-xs font-bold ${estilo.clase}`}>
      {estilo.etiqueta}
    </span>
  );
}
