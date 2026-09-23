import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icono from '@/components/Icono';
import Distintivo from '@/components/ui/Distintivo';
import { FAMILIAS } from '@/lib/tipos-publicacion';
import { getPerfilActual } from '@/lib/supabase/server';

export const metadata = {
  title: 'Publicar · IAPyme',
  description:
    'Publica en IAPyme una solución de IA, un servicio, un negocio, tu perfil profesional, una oferta de trabajo o un proyecto. Publicar es gratis y sin comisión.',
  alternates: { canonical: '/publicar' },
};

export const dynamic = 'force-dynamic';

export default async function PublicarPage() {
  const perfil = await getPerfilActual();

  /** Sin cuenta se pasa por el registro, pero volviendo aquí después. */
  const destino = (slug: string) =>
    perfil
      ? `/dashboard/productos/nuevo?familia=${slug}`
      : `/entrar?registro=1&volver=${encodeURIComponent(`/dashboard/productos/nuevo?familia=${slug}`)}`;

  return (
    <>
      <Header />

      <main className="container-page py-10 sm:py-14">
        <header className="max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            ¿Qué quieres publicar?
          </h1>
          <p className="mt-3 leading-relaxed text-ink/65">
            Elige el tipo y te llevamos al formulario que corresponde. Son cinco pasos, puedes
            guardar a medias y verás cómo queda antes de enviarlo.
          </p>

          <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink/60">
            <Distintivo tono="exito">Gratis</Distintivo>
            <span>Sin cuota y sin comisión sobre lo que cobres.</span>
          </p>
        </header>

        <ul className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FAMILIAS.map((familia) => (
            <li key={familia.slug}>
              <Link
                href={destino(familia.slug)}
                className="group flex h-full flex-col gap-3 rounded-xl border border-superficie-200
                           bg-superficie-0 p-5 transition-colors duration-fast ease-out
                           hover:border-brand-300 hover:bg-brand-50/40 focus:outline-none
                           focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <span
                  aria-hidden
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-superficie-100
                             text-ink/70 transition-colors duration-fast ease-out
                             group-hover:bg-brand-100 group-hover:text-brand-700"
                >
                  <Icono nombre={familia.icono} />
                </span>

                <span className="font-display text-base font-semibold text-ink">
                  {familia.nombre}
                </span>
                <span className="text-sm leading-relaxed text-ink/60">{familia.descripcion}</span>

                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-brand-700">
                  Empezar
                  <Icono
                    nombre="flecha"
                    className="h-4 w-4 transition-transform duration-base ease-out
                               group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <aside className="mt-10 rounded-xl border border-superficie-200 bg-superficie-0 p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-ink">Antes de publicar</h2>
          <ul className="mt-3 grid gap-2.5 text-sm leading-relaxed text-ink/65 sm:grid-cols-3">
            <li>
              <strong className="font-medium text-ink">Pon el precio.</strong> Las fichas sin
              precio reciben la mitad de mensajes, y casi todos preguntando lo mismo.
            </li>
            <li>
              <strong className="font-medium text-ink">Di qué hace falta.</strong> Integraciones,
              cuentas o datos que necesitas del cliente para ponerlo en marcha.
            </li>
            <li>
              <strong className="font-medium text-ink">Pasa la revisión.</strong> Se comprueba
              antes de publicarse; si algo no encaja te decimos el motivo.
            </li>
          </ul>
        </aside>
      </main>

      <Footer />
    </>
  );
}
