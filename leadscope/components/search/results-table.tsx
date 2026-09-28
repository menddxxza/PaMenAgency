'use client';

import { useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Star, Phone, Mail, MapPin, ExternalLink, MessageCircle } from 'lucide-react';
import { WebsiteStatusBadge, OpportunityBadge } from '@/components/search/status-badges';
import { BusinessDetailModal } from '@/components/search/business-detail-modal';
import { CopyButton } from '@/components/ui/copy-button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Business } from '@/lib/types';

const ROW_HEIGHT = 64;
const GRID_COLS =
  'grid-cols-[auto_1fr_auto_auto] gap-3 lg:grid-cols-[auto_2fr_1.4fr_0.9fr_0.9fr_1fr_1fr]';

interface ResultsTableProps {
  businesses: Business[];
  loading: boolean;
  selectedIds?: Set<string>;
  onToggleRow?: (id: string) => void;
  onToggleAll?: () => void;
}

export function ResultsTable({
  businesses,
  loading,
  selectedIds,
  onToggleRow,
  onToggleAll,
}: ResultsTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [detailBusiness, setDetailBusiness] = useState<Business | null>(null);
  const selectable = !!selectedIds && !!onToggleRow;

  const virtualizer = useVirtualizer({
    count: businesses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  if (loading) {
    return (
      <div className="space-y-2 rounded-2xl border border-border bg-surface p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-20 text-center">
        <span className="relative flex h-12 w-12 items-center justify-center">
          <span className="absolute inset-0 animate-signal-pulse rounded-full bg-brand-500/10" />
          <MapPin className="relative h-6 w-6 text-muted" />
        </span>
        <p className="mt-3 text-sm text-muted">
          Ningún resultado todavía. Ajusta tu búsqueda o tus filtros.
        </p>
      </div>
    );
  }

  const items = virtualizer.getVirtualItems();
  const allSelected = selectable && businesses.length > 0 && businesses.every((b) => selectedIds!.has(b.id));

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div
        className={cn(
          'grid items-center border-b border-border bg-surface-hover px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted',
          GRID_COLS
        )}
      >
        {selectable ? (
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleAll}
            aria-label="Seleccionar todos los resultados"
            className="h-3.5 w-3.5 accent-brand-500"
          />
        ) : (
          <span />
        )}
        <span>Negocio</span>
        <span className="hidden lg:block">Contacto</span>
        <span className="hidden lg:block">Rating</span>
        <span className="hidden lg:block">Categoría</span>
        <span>Estado web</span>
        <span>Oportunidad</span>
      </div>

      <div ref={parentRef} className="h-[560px] overflow-auto">
        <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
          {items.map((virtualRow) => {
            const b = businesses[virtualRow.index]!;
            const checked = selectable && selectedIds!.has(b.id);
            return (
              <div
                key={b.id}
                role="button"
                tabIndex={0}
                onClick={() => setDetailBusiness(b)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setDetailBusiness(b);
                  }
                }}
                className={cn(
                  'absolute left-0 top-0 grid w-full cursor-pointer items-center border-b border-border px-4 text-sm transition-colors hover:bg-surface-hover',
                  GRID_COLS,
                  checked && 'bg-brand-500/5'
                )}
                style={{ height: ROW_HEIGHT, transform: `translateY(${virtualRow.start}px)` }}
              >
                {selectable ? (
                  <input
                    type="checkbox"
                    checked={checked}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onToggleRow!(b.id)}
                    aria-label={`Seleccionar ${b.name}`}
                    className="h-3.5 w-3.5 accent-brand-500"
                  />
                ) : (
                  <span />
                )}

                <div className="min-w-0">
                  <a
                    href={b.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 truncate font-medium text-fg hover:text-brand-600"
                  >
                    <span className="truncate">{b.name}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted" />
                  </a>
                  <p className="truncate text-xs text-muted">{b.address}</p>
                  <p className="truncate text-xs text-muted lg:hidden">
                    {b.phone ?? b.category}
                    {b.rating ? ` · ★ ${b.rating.toFixed(1)}` : ''}
                  </p>
                </div>

                <div className="hidden min-w-0 space-y-0.5 text-xs text-muted lg:block">
                  {b.phone && (
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex min-w-0 items-center gap-1.5 hover:text-fg"
                      >
                        <Phone className="h-3 w-3 shrink-0" />
                        <span className="truncate">{b.phone}</span>
                      </a>
                      <CopyButton value={b.phone} />
                      {!b.socialLinks.whatsapp && b.phone.trim().startsWith('+') && (
                        <a
                          href={`https://wa.me/${b.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, os escribo por ${b.name}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Escribir por WhatsApp"
                          className="shrink-0 hover:text-success"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                  {b.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{b.email}</span>
                      <CopyButton value={b.email} />
                    </div>
                  )}
                  {b.socialLinks.whatsapp && (
                    <a
                      href={b.socialLinks.whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 hover:text-success"
                    >
                      <MessageCircle className="h-3 w-3 shrink-0" />
                      <span className="truncate">WhatsApp</span>
                    </a>
                  )}
                  {!b.phone && !b.email && !b.socialLinks.whatsapp && <span>—</span>}
                </div>

                <div className="hidden items-center gap-1 text-xs text-fg lg:flex">
                  {b.rating ? (
                    <>
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {b.rating.toFixed(1)}
                      <span className="text-muted">({b.reviewsCount})</span>
                    </>
                  ) : (
                    <span className="text-muted">Sin reseñas</span>
                  )}
                </div>

                <span className="hidden truncate text-xs text-muted lg:block">{b.category}</span>

                <WebsiteStatusBadge status={b.websiteStatus} />

                <OpportunityBadge opportunity={b.opportunity} />
              </div>
            );
          })}
        </div>
      </div>

      <BusinessDetailModal business={detailBusiness} onClose={() => setDetailBusiness(null)} />
    </div>
  );
}
