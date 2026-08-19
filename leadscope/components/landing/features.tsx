import {
  SearchCheck,
  Globe,
  Filter,
  FileDown,
  History,
  ShieldCheck,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const FEATURES = [
  {
    icon: SearchCheck,
    title: 'Búsqueda por ubicación y nicho',
    description:
      'País, ciudad, código postal o radio en kilómetros, combinado con cualquier nicho: dentistas, gimnasios, abogados y más.',
  },
  {
    icon: Globe,
    title: 'Detección automática de webs',
    description:
      'Identifica negocios sin web, con solo Facebook/Instagram, con web rota o desfasada (con IA opcional).',
  },
  {
    icon: Filter,
    title: 'Filtros avanzados',
    description:
      'Solo sin web, solo redes sociales, mínimo de reseñas, puntuación mínima, con teléfono o con email.',
  },
  {
    icon: Gauge,
    title: 'Puntuación de oportunidad',
    description:
      'Cada negocio recibe un score Alta / Media / Baja según su reputación y el estado de su web.',
  },
  {
    icon: FileDown,
    title: 'Exportación instantánea',
    description: 'Descarga tus resultados en CSV, Excel o PDF listos para tu CRM o campaña.',
  },
  {
    icon: History,
    title: 'Historial de búsquedas',
    description: 'Cada búsqueda queda guardada en tu dashboard para retomarla cuando quieras.',
  },
  {
    icon: Sparkles,
    title: 'Clasificación con IA',
    description: 'Detecta webs anticuadas analizando el HTML de la home con Claude u OpenAI.',
  },
  {
    icon: ShieldCheck,
    title: 'Datos oficiales de Google',
    description: 'Toda la información proviene de Google Places API: fiable y siempre actualizada.',
  },
];

export function Features() {
  return (
    <section id="features" className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Todo lo que necesitas para prospectar
        </h2>
        <p className="mt-4 text-muted">
          Diseñado para agencias de diseño web, freelancers y comerciales que venden presencia
          digital a negocios locales.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card
            key={title}
            className="p-5 transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-fg">{title}</h3>
            <p className="mt-1.5 text-sm text-muted">{description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
