import Link from 'next/link';
import AsistentePublicacion from '@/components/AsistentePublicacion';
import { getCategorias } from '@/lib/queries';
import { getPerfilActual } from '@/lib/supabase/server';
import { familiaPorSlug } from '@/lib/tipos-publicacion';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Publicar producto · IAPyme' };

export default async function NuevoProducto({
  searchParams,
}: {
  searchParams: { familia?: string };
}) {
  const [categorias, perfil] = await Promise.all([getCategorias(), getPerfilActual()]);
  if (!perfil) return null;

  const familia = searchParams.familia ? familiaPorSlug(searchParams.familia) : undefined;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/productos" className="text-sm text-ink/55 hover:text-ink">
        ← Mis productos
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {familia ? `Publicar en ${familia.nombre.toLowerCase()}` : 'Publicar producto'}
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        Cuatro pasos. Puedes guardar el borrador y seguir en otro momento.
      </p>

      <div className="mt-8">
        <AsistentePublicacion
          categorias={categorias}
          userId={perfil.id}
          familiaInicial={familia?.slug}
        />
      </div>
    </div>
  );
}
