import {
  BedDouble,
  Dumbbell,
  GraduationCap,
  Hammer,
  HeartPulse,
  Home,
  PawPrint,
  Scale,
  Scissors,
  Store,
  Utensils,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { TextLoop } from '@/components/landing/text-loop';

const SECTORS: { label: string; examples: string; icon: LucideIcon }[] = [
  { label: 'Talleres', examples: 'Mecánica, chapa y pintura, neumáticos', icon: Wrench },
  { label: 'Restaurantes', examples: 'Bares, cafeterías, catering', icon: Utensils },
  { label: 'Belleza', examples: 'Peluquerías, estética, uñas', icon: Scissors },
  { label: 'Salud', examples: 'Clínicas, dentistas, fisioterapia', icon: HeartPulse },
  { label: 'Deporte y bienestar', examples: 'Gimnasios, yoga, entrenadores', icon: Dumbbell },
  { label: 'Servicios profesionales', examples: 'Abogados, gestorías, asesorías', icon: Scale },
  { label: 'Comercio', examples: 'Tiendas, boutiques, floristerías', icon: Store },
  { label: 'Construcción y reformas', examples: 'Albañiles, fontaneros, electricistas', icon: Hammer },
  { label: 'Inmobiliarias', examples: 'Agencias, administradores de fincas', icon: Home },
  { label: 'Educación', examples: 'Academias, autoescuelas, guarderías', icon: GraduationCap },
  { label: 'Mascotas', examples: 'Veterinarios, peluquería canina', icon: PawPrint },
  { label: 'Hostelería y turismo', examples: 'Hoteles, casas rurales, apartamentos', icon: BedDouble },
];

export function Sectors() {
  return (
    <section id="sectors" className="border-b border-border py-24">
      <div className="container">
        <div className="max-w-lg">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Clientes en cualquier sector
          </h2>
          <p className="mt-3 text-muted">
            Si es un negocio local, lo encuentras. Escribe el sector que te interesa y la zona.
          </p>
        </div>

        <TextLoop
          className="mt-10"
          text="Talleres ✦ Restaurantes ✦ Belleza ✦ Salud ✦ Deporte ✦ Comercio ✦ Reformas ✦ Inmobiliarias ✦ Educación ✦ Mascotas ✦ Hostelería"
          separator="✦"
          shape="wave"
          curviness={50}
          fontSize={38}
          ribbonWidth={80}
          speed={70}
        />

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SECTORS.map(({ label, examples, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-surface p-5 transition-colors hover:bg-surface-hover"
            >
              <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h3 className="mt-3 font-display text-base font-semibold text-fg">{label}</h3>
              <p className="mt-1 text-sm text-muted">{examples}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
