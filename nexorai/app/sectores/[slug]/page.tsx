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
    <div className="bg-void min-h-screen">
      <LandingNav />
      <main>
        <section className="mx-auto max-w-4xl px-4 pb-16 pt-32 text-center sm:pt-40">
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-brand-400">
            Nexorai para {sector.namePlural.toLowerCase()}
          </span>
          <h1 className="mt-5 text-balance font-display text-4xl font-semibold uppercase tracking-tight text-white sm:text-5xl">
            {sector.tagline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-white/45 sm:text-lg">
            {sector.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
            <Link href="/signup">
              <Button
                variant="secondary"
                size="lg"
                className="border-0 bg-white text-[#0b0b0c] shadow-none hover:bg-white/90"
              >
                Analizar mi {sector.name.toLowerCase()}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a
              href="#calculadora"
              className="font-mono text-xs uppercase tracking-widest text-white/45 transition-colors hover:text-white"
            >
              Ver potencial estimado
            </a>
          </div>

          <div className="landing-hairline mx-auto mt-12 grid max-w-2xl grid-cols-1 border-t text-left sm:grid-cols-2">
            <div className="landing-hairline flex items-start gap-2 border-b p-4 text-sm text-white/50 sm:border-b-0 sm:border-r">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              Ticket medio habitual: {sector.avgTicketHint}
            </div>
            <div className="flex items-start gap-2 p-4 text-sm text-white/50">
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
