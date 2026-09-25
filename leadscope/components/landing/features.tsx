import { Filter, FileDown, History, Sparkles, Phone, Mail, MessageCircle, Clock3, Globe, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

const CONTACT_FIELDS: [string, LucideIcon][] = [
  ['Teléfono', Phone],
  ['Email', Mail],
  ['WhatsApp', MessageCircle],
  ['Horario', Clock3],
];
import { ScrollReveal } from '@/components/landing/scroll-reveal';

export function Features() {
  return (
    <section id="features" className="border-b border-border py-24">
      <div className="container">
        <ScrollReveal className="max-w-lg">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Todo lo que hace falta para prospectar
          </h2>
          <p className="mt-3 text-muted">
            Pensado para quien vende a negocios locales: agencias, freelancers y comerciales.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Card grande: todos los datos de cada cliente de un vistazo */}
          <Card className="overflow-hidden p-7 hover:-translate-y-0.5 hover:shadow-card-hover lg:col-span-7">
            <h3 className="font-display text-xl font-semibold text-fg">
              Todos los datos de tus clientes, de un vistazo
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Nada de buscar negocio por negocio. Cada resultado trae ya todo lo que necesitas para
              contactar y cerrar la venta.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {CONTACT_FIELDS.map(([label, Icon]) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-bg px-3.5 py-2.5"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-400" />
                  <span className="text-sm text-fg">{label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Card grande: puntuación de oportunidad */}
          <Card className="flex flex-col justify-between p-7 hover:-translate-y-0.5 hover:shadow-card-hover lg:col-span-5">
            <div>
              <h3 className="font-display text-xl font-semibold text-fg">
                Puntuación de oportunidad
              </h3>
              <p className="mt-2 text-sm text-muted">
                Cada negocio recibe un score de 0 a 100 según su reputación y su presencia online.
              </p>
            </div>
            <div className="mt-6 space-y-3">
              {[
                ['Alta', 82],
                ['Media', 54],
                ['Baja', 21],
              ].map(([label, score]) => (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-fg">{label}</span>
                    <span className="text-muted">{score}/100</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-hover">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Card oscura: filtros */}
          <Card className="border-none bg-fg p-7 text-bg hover:-translate-y-0.5 lg:col-span-4">
            <Filter className="h-5 w-5 opacity-70" />
            <h3 className="mt-4 font-display text-lg font-semibold">Filtros al segundo</h3>
            <p className="mt-1.5 text-sm opacity-70">
              Solo sin web, solo redes, reseñas mínimas, rating, con teléfono o email — todo
              client-side, sin recargar.
            </p>
          </Card>

          <Card className="p-7 hover:-translate-y-0.5 hover:shadow-card-hover lg:col-span-4">
            <FileDown className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h3 className="mt-4 font-display text-lg font-semibold text-fg">
              Exporta y listo
            </h3>
            <p className="mt-1.5 text-sm text-muted">
              CSV, Excel o PDF generados en el navegador, con los datos ya filtrados.
            </p>
          </Card>

          <Card className="p-7 hover:-translate-y-0.5 hover:shadow-card-hover lg:col-span-4">
            <History className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h3 className="mt-4 font-display text-lg font-semibold text-fg">
              Historial completo
            </h3>
            <p className="mt-1.5 text-sm text-muted">
              Cada búsqueda queda guardada — retómala desde tu panel cuando quieras.
            </p>
          </Card>

          <Card className="p-7 hover:-translate-y-0.5 hover:shadow-card-hover lg:col-span-6">
            <Globe className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h3 className="mt-4 font-display text-lg font-semibold text-fg">
              Presencia online de cada negocio
            </h3>
            <p className="mt-1.5 text-sm text-muted">
              Sin web, solo redes, web rota o activa — un dato más para priorizar a quién
              contactar primero.
            </p>
          </Card>

          <Card className="p-7 hover:-translate-y-0.5 hover:shadow-card-hover lg:col-span-6">
            <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h3 className="mt-4 font-display text-lg font-semibold text-fg">
              Clasificación de calidad con IA
            </h3>
            <p className="mt-1.5 text-sm text-muted">
              Analiza el HTML de la home para detectar webs anticuadas: tablas de maquetación,
              Flash, sin viewport responsive.
            </p>
          </Card>

          <Card className="flex items-center p-7 lg:col-span-12">
            <p className="text-sm text-muted">
              Toda la información proviene de{' '}
              <span className="font-medium text-fg">Google Places API</span> — fiable y siempre
              actualizada, sin scraping frágil.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
