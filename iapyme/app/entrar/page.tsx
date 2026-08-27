import Link from 'next/link';
import Logo from '@/components/Logo';
import FormularioAcceso from '@/components/FormularioAcceso';
import { supabaseConfigurado } from '@/lib/supabase/config';
import AvisoSinSupabase from '@/components/AvisoSinSupabase';

export const metadata = {
  title: 'Entrar · IAPyme',
  description: 'Accede a IAPyme para comprar soluciones de IA o publicar las tuyas.',
};

export default function EntrarPage({
  searchParams,
}: {
  searchParams: { volver?: string; registro?: string; error?: string };
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/">
            <Logo />
          </Link>

          <h1 className="mt-10 text-2xl font-semibold tracking-tight">
            {searchParams.registro ? 'Crea tu cuenta' : 'Entra en IAPyme'}
          </h1>
          <p className="mt-2 text-sm text-ink/65">
            Con la misma cuenta compras soluciones y publicas las tuyas.
          </p>

          <div className="mt-8">
            {supabaseConfigurado() ? (
              <FormularioAcceso
                volver={searchParams.volver ?? '/'}
                registroInicial={Boolean(searchParams.registro)}
                errorInicial={searchParams.error}
              />
            ) : (
              <AvisoSinSupabase />
            )}
          </div>
        </div>
      </div>

      <aside className="hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-center">
        <div className="max-w-md">
          <p className="eyebrow text-brand-300">Vendedores</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
            Sube tu proyecto una vez y véndelo mil
          </h2>
          <p className="mt-4 text-white/70">
            Publicar es gratis y IAPyme no se lleva comisión. Tú pones el precio y cobras
            tú.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/75">
            {[
              'Sin comisión ni cuota mensual.',
              'Ficha técnica seria, no un anuncio.',
              'Los primeros vendedores salen destacados en portada.',
            ].map((punto) => (
              <li key={punto} className="flex gap-3">
                <span aria-hidden className="text-accent-400">
                  ✓
                </span>
                {punto}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
