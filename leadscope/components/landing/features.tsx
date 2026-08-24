import { Filter, FileDown, History, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function Features() {
  return (
    <section id="features" className="border-b border-border py-24">
      <div className="container">
        <div className="max-w-lg">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Todo lo que hace falta para prospectar
          </h2>
          <p className="mt-3 text-muted">
            Pensado para quien vende webs a negocios locales: agencias, freelancers y comerciales.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Card grande: detección de estado de web */}
          <Card className="overflow-hidden p-7 hover:-translate-y-0.5 hover:shadow-card-hover lg:col-span-7">
            <h3 className="font-display text-xl font-semibold text-fg">
              Detecta el estado real de cada web
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Comprobamos en vivo si existe, si está rota, si solo hay una red social o si el
              diseño se quedó anclado en 2012 (con IA, opcional).
            </p>
            <div className="mt-6 space-y-2">
              {[
                ['Sin página web', 'danger'],
                ['Solo redes sociales', 'warning'],
                ['Web rota', 'danger'],
                ['Web activa', 'success'],
              ].map(([label, tone]) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-lg border border-border bg-bg px-3.5 py-2.5"
                >
                  <span
                    className={
                      tone === 'danger'
                        ? 'h-2 w-2 shrink-0 rounded-full bg-danger'
                        : tone === 'warning'
                          ? 'h-2 w-2 shrink-0 rounded-full bg-warning'
                          : 'h-2 w-2 shrink-0 rounded-full bg-success'
                    }
                  />
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
                Cada negocio recibe un score de 0 a 100 según su reputación y el estado de su web.
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
            <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h3 className="mt-4 font-display text-lg font-semibold text-fg">
              Clasificación de calidad con IA
            </h3>
            <p className="mt-1.5 text-sm text-muted">
              Analiza el HTML de la home para detectar webs anticuadas: tablas de maquetación,
              Flash, sin viewport responsive.
            </p>
          </Card>

          <Card className="flex items-center p-7 lg:col-span-6">
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
