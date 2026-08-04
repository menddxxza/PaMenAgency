import Link from 'next/link';
import { notFound } from 'next/navigation';
import AsistentePublicacion from '@/components/AsistentePublicacion';
import EstadoFicha from '@/components/EstadoFicha';
import { getCategorias } from '@/lib/queries';
import { createClient, getPerfilActual } from '@/lib/supabase/server';
import type { Product } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Editar producto · IAPyme' };

export default async function EditarProducto({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [categorias, perfil] = await Promise.all([getCategorias(), getPerfilActual()]);
  if (!supabase || !perfil) return null;

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  // RLS ya impide leer fichas ajenas sin publicar, pero una publicada sí es visible:
  // sin esta comprobación se podría abrir el editor con la ficha de otro vendedor.
  const producto = data as Product | null;
  if (!producto || producto.seller_id !== perfil.id) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/productos" className="text-sm text-ink/55 hover:text-ink">
        ← Mis productos
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">{producto.titulo}</h1>
        <EstadoFicha status={producto.status} />
      </div>

      {producto.status === 'published' ? (
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Esta ficha está publicada. Si cambias el título, la frase gancho, el problema, la
          solución, la descripción o los requisitos, volverá a la cola de revisión.
        </p>
      ) : null}

      {producto.status === 'rejected' && producto.motivo_rechazo ? (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <b>Motivo del rechazo:</b> {producto.motivo_rechazo}
        </p>
      ) : null}

      <div className="mt-8">
        <AsistentePublicacion
          categorias={categorias}
          producto={producto}
          userId={perfil.id}
        />
      </div>
    </div>
  );
}
