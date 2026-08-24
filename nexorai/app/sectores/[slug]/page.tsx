import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { LandingNav } from '@/components/landing/nav';
import { Footer } from '@/components/landing/footer';
import { Calculator } from '@/components/landing/calculator';
import { Button } from '@/components/ui/button';
import { SECTORS, getSector } from '@/lib/sectors';

export function generateStaticParams() {
  return SECTORS.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const sector = getSector(params.slug);
  if (!sector) return {};
  return {
    title: `Nexorai para ${sector.namePlural.toLowerCase()}`,
    description: `${sector.tagline} Nexorai analiza tu ${sector.name.toLowerCase()} y activa agentes de IA que convierten oportunidades en ingresos.`,
  };
}

export default function SectorPage({ params }: { params: { slug: string } }) {
  const sector = getSector(params.slug);
  if (!sector) notFound();

  return (
    <div className="min-h-screen bg-bg">
      <LandingNav />
      <main>
        <section className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            Nexorai para {sector.namePlural.toLowerCase()}
          </span>
          <h1 className="mt-5 text-balance font-display text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            {sector.tagline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-muted sm:text-lg">
            {sector.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">
                Analizar mi {sector.name.toLowerCase()}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#calculadora">
              <Button size="lg" variant="secondary">
                Ver potencial estimado
              </Button>
            </a>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
            <div className="flex items-start gap-2 rounded-xl border border-border bg-surface/60 p-4 text-sm text-muted">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              Ticket medio habitual: {sector.avgTicketHint}
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-border bg-surface/60 p-4 text-sm text-muted">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              Canales típicos: {sector.channels.join(', ')}
            </div>
          </div>
        </section>

        <Calculator defaultSector={sector.slug} />
      </main>
      <Footer />
    </div>
  );
}
