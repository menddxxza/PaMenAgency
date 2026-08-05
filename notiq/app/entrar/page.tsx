import Link from 'next/link';
import Logo from '@/components/Logo';
import FormularioAcceso from '@/components/FormularioAcceso';
import AvisoSinSupabase from '@/components/AvisoSinSupabase';
import { supabaseConfigurado } from '@/lib/supabase/config';

export const metadata = {
  title: 'Entrar · Notiq',
  description: 'Accede a tus notas y tareas de Notiq.',
};

const ERRORES: Record<string, string> = {
  enlace: 'El enlace ha caducado o ya se ha usado. Pide otro.',
  configuracion: 'Este despliegue todavía no tiene Supabase configurado.',
};

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string; error?: string }>;
}) {
  const { volver, error } = await searchParams;
  const destino = volver?.startsWith('/') ? volver : '/notas';

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/">
            <Logo />
          </Link>

          <h1 className="mt-10 text-2xl font-extrabold tracking-tight">Entra en Notiq</h1>
          <p className="mt-2 text-sm text-ink/65">
            Tus notas, tus tareas y un asistente que las ha leído todas.
          </p>

          {error && ERRORES[error] && (
            <p className="mt-6 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {ERRORES[error]}
            </p>
          )}

          <div className="mt-8">
            {supabaseConfigurado() ? (
              <FormularioAcceso volver={destino} />
            ) : (
              <AvisoSinSupabase />
            )}
          </div>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-[26rem] w-[26rem] rounded-full bg-brand-600/40 blur-3xl"
        />
        <div className="relative max-w-md">
          <p className="eyebrow text-brand-300">Por qué Notiq</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight">
            Deja de copiar tus notas a la lista de tareas
          </h2>
          <p className="mt-4 text-white/70">
            Escribe el acta de la reunión como siempre. Notiq saca las tareas, les pone
            prioridad y fecha, y te las deja en el tablero.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/75">
            {[
              'Editor por bloques con markdown y atajos',
              'Resúmenes de tus notas largas en un clic',
              'Tareas en lista, Kanban o calendario',
              'Pregunta «¿qué tengo para el viernes?» y responde',
            ].map((linea) => (
              <li key={linea} className="flex gap-3">
                <span aria-hidden className="text-lima-400">
                  ✓
                </span>
                {linea}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
