import Link from 'next/link';
import FormularioPerfil from '@/components/FormularioPerfil';
import { getPerfilActual } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mi perfil · IAPyme' };

export default async function PerfilPage() {
  const perfil = await getPerfilActual();
  if (!perfil) return null;

  return (
    <div>
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Mi perfil</h1>
        <p className="mt-1 text-sm text-ink/60">
          {perfil.slug ? (
            <>
              Visible en{' '}
              <Link href={`/vendedor/${perfil.slug}`} target="_blank" className="text-brand-600 hover:underline">
                iapymeapp.com/vendedor/{perfil.slug}
              </Link>
            </>
          ) : (
            'Se crea un perfil público en cuanto publiques tu primera solución.'
          )}
        </p>
      </header>

      <div className="mt-8">
        <FormularioPerfil perfil={perfil} />
      </div>
    </div>
  );
}
