'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Star, Phone, Mail, MapPin, ExternalLink, MessageCircle } from 'lucide-react';
import { WebsiteStatusBadge, OpportunityBadge } from '@/components/search/status-badges';
import { Skeleton } from '@/components/ui/skeleton';
import type { Business } from '@/lib/types';

const ROW_HEIGHT = 64;

export function ResultsTable({ businesses, loading }: { businesses: Business[]; loading: boolean }) {
  const parentRef = useRef<HTMLDivElement>(null);

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
        <MapPin className="h-8 w-8 text-muted" />
        <p className="mt-3 text-sm text-muted">
          Ningún resultado todavía. Ajusta tu búsqueda o tus filtros.
        </p>
      </div>
    );
  }

  const items = virtualizer.getVirtualItems();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="grid grid-cols-[2fr_1.4fr_0.9fr_0.9fr_1fr_1fr] gap-3 border-b border-border bg-surface-hover px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">
        <span>Negocio</span>
        <span>Contacto</span>
        <span>Rating</span>
        <span>Categoría</span>
        <span>Estado web</span>
        <span>Oportunidad</span>
      </div>

      <div ref={parentRef} className="h-[560px] overflow-auto">
        <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
          {items.map((virtualRow) => {
            const b = businesses[virtualRow.index]!;
            return (
              <div
                key={b.id}
                className="absolute left-0 top-0 grid w-full grid-cols-[2fr_1.4fr_0.9fr_0.9fr_1fr_1fr] items-center gap-3 border-b border-border px-4 text-sm transition-colors hover:bg-surface-hover"
                style={{ height: ROW_HEIGHT, transform: `translateY(${virtualRow.start}px)` }}
              >
                <div className="min-w-0">
                  <a
                    href={b.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 truncate font-medium text-fg hover:text-brand-600"
                  >
                    <span className="truncate">{b.name}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted" />
                  </a>
                  <p className="truncate text-xs text-muted">{b.address}</p>
                </div>

                <div className="min-w-0 space-y-0.5 text-xs text-muted">
                  {b.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span className="truncate">{b.phone}</span>
                    </div>
                  )}
                  {b.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{b.email}</span>
                    </div>
                  )}
                  {b.socialLinks.whatsapp && (
                    <a
                      href={b.socialLinks.whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 hover:text-success"
                    >
                      <MessageCircle className="h-3 w-3 shrink-0" />
                      <span className="truncate">WhatsApp</span>
                    </a>
                  )}
                  {!b.phone && !b.email && !b.socialLinks.whatsapp && <span>—</span>}
                </div>

                <div className="flex items-center gap-1 text-xs text-fg">
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

                <span className="truncate text-xs text-muted">{b.category}</span>

                <WebsiteStatusBadge status={b.websiteStatus} />

                <OpportunityBadge opportunity={b.opportunity} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
