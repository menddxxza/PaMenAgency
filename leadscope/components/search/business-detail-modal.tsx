'use client';

import {
  Star,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  MessageCircle,
  Globe,
  Instagram,
  Facebook,
  Clock3,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { WebsiteStatusBadge, OpportunityBadge } from '@/components/search/status-badges';
import { formatNumber } from '@/lib/utils';
import type { Business } from '@/lib/types';

export function BusinessDetailModal({
  business,
  onClose,
}: {
  business: Business | null;
  onClose: () => void;
}) {
  return (
    <Modal open={!!business} onClose={onClose} title={business?.name}>
      {business && <BusinessDetail business={business} />}
    </Modal>
  );
}

function BusinessDetail({ business: b }: { business: Business }) {
  const hasContact = b.phone || b.email || b.socialLinks.whatsapp;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <WebsiteStatusBadge status={b.websiteStatus} />
        <OpportunityBadge opportunity={b.opportunity} />
        <span className="text-xs text-muted">Puntuación {b.opportunityScore}/100</span>
      </div>

      <div className="space-y-1.5">
        <a
          href={b.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-start gap-1.5 text-sm text-fg hover:text-brand-600"
        >
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <span>{b.address}</span>
          <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted" />
        </a>
        <p className="pl-[22px] text-xs text-muted">{b.category}</p>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-fg">
        {b.rating ? (
          <>
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-medium">{b.rating.toFixed(1)}</span>
            <span className="text-muted">({formatNumber(b.reviewsCount)} reseñas)</span>
          </>
        ) : (
          <span className="text-muted">Sin reseñas todavía</span>
        )}
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-bg p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Contacto</p>
        {!hasContact && <p className="text-sm text-muted">No hemos encontrado datos de contacto.</p>}

        {b.phone && (
          <div className="flex items-center justify-between gap-3">
            <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`} className="flex min-w-0 items-center gap-2 text-sm text-fg hover:text-brand-600">
              <Phone className="h-4 w-4 shrink-0 text-muted" />
              <span className="truncate">{b.phone}</span>
            </a>
            {b.phone.trim().startsWith('+') && (
              <a
                href={`https://wa.me/${b.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, os escribo por ${b.name}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-muted hover:text-success"
                aria-label="Escribir por WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {b.email && (
          <a href={`mailto:${b.email}`} className="flex items-center gap-2 text-sm text-fg hover:text-brand-600">
            <Mail className="h-4 w-4 shrink-0 text-muted" />
            <span className="truncate">{b.email}</span>
          </a>
        )}

        {b.socialLinks.whatsapp && (
          <a
            href={b.socialLinks.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-fg hover:text-success"
          >
            <MessageCircle className="h-4 w-4 shrink-0 text-muted" />
            <span>WhatsApp</span>
          </a>
        )}

        {b.website && (
          <a
            href={b.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-fg hover:text-brand-600"
          >
            <Globe className="h-4 w-4 shrink-0 text-muted" />
            <span className="truncate">{b.website}</span>
          </a>
        )}

        {b.socialLinks.instagram && (
          <a
            href={b.socialLinks.instagram}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-fg hover:text-brand-600"
          >
            <Instagram className="h-4 w-4 shrink-0 text-muted" />
            <span>Instagram</span>
          </a>
        )}

        {b.socialLinks.facebook && (
          <a
            href={b.socialLinks.facebook}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-fg hover:text-brand-600"
          >
            <Facebook className="h-4 w-4 shrink-0 text-muted" />
            <span>Facebook</span>
          </a>
        )}
      </div>

      {b.openingHours && b.openingHours.weekdayText.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            <Clock3 className="h-3.5 w-3.5" />
            Horario
            {b.openingHours.openNow !== null && (
              <span className={b.openingHours.openNow ? 'text-success' : 'text-danger'}>
                · {b.openingHours.openNow ? 'Abierto ahora' : 'Cerrado ahora'}
              </span>
            )}
          </div>
          <ul className="space-y-0.5 text-sm text-muted">
            {b.openingHours.weekdayText.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
