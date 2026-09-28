'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, Phone, Search } from 'lucide-react';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { WebsiteStatusBadge, OpportunityBadge } from '@/components/search/status-badges';
import type { Opportunity, WebsiteStatus } from '@/lib/types';

interface DemoRow {
  name: string;
  phone: string;
  websiteStatus: WebsiteStatus;
  opportunity: Opportunity;
}

const DEMO_ROWS: DemoRow[] = [
  { name: 'Taller Rodríguez', phone: '+34 611 22 33 44', websiteStatus: 'no_website', opportunity: 'alta' },
  { name: 'Peluquería Nova', phone: '+34 622 33 44 55', websiteStatus: 'social_only', opportunity: 'alta' },
  { name: 'Fisio Centro Salud', phone: '+34 633 44 55 66', websiteStatus: 'outdated', opportunity: 'media' },
  { name: 'Restaurante El Roble', phone: '+34 644 55 66 77', websiteStatus: 'active', opportunity: 'baja' },
];

export function DemoSearch() {
  const [niche, setNiche] = useState('Talleres');
  const [city, setCity] = useState('Valencia');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setTimeout(() => setStatus('done'), 850);
  }

  return (
    <section id="demo" className="border-b border-border bg-surface/50 py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Pruébalo sin registrarte
          </h2>
          <p className="mt-3 text-muted">
            Escribe un sector y una ciudad para ver cómo se ve el resultado. Es una demo con datos
            de ejemplo — la búsqueda real usa Google Places en vivo.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border bg-surface p-6 shadow-card">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <Label htmlFor="demo-niche">Sector</Label>
              <Input id="demo-niche" value={niche} onChange={(e) => setNiche(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="demo-city">Ciudad</Label>
              <Input id="demo-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="brand" className="w-full sm:w-auto" loading={status === 'loading'}>
                <Search className="h-4 w-4" />
                Ver ejemplo
              </Button>
            </div>
          </form>

          {status === 'loading' && (
            <div className="mt-6 flex items-center justify-center gap-2 py-10 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analizando presencia online en {city || 'tu zona'}…
            </div>
          )}

          {status === 'done' && (
            <div className="mt-6 animate-fade-in">
              <div className="overflow-hidden rounded-xl border border-border">
                {DEMO_ROWS.map((row) => (
                  <div
                    key={row.name}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg px-4 py-3 text-sm last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-fg">{row.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted">
                        <Phone className="h-3 w-3" />
                        {row.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <WebsiteStatusBadge status={row.websiteStatus} />
                      <OpportunityBadge opportunity={row.opportunity} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-muted">
                Resultados de ejemplo — no son negocios reales.
              </p>
              <div className="mt-5 flex justify-center">
                <Link href="/signup" className={buttonVariants({ variant: 'brand' })}>
                  Buscar de verdad, gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
