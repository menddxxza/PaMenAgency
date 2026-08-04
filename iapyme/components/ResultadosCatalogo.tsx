import Link from 'next/link';
import ProductoCard from '@/components/ProductoCard';
import AvisoSinSupabase from '@/components/AvisoSinSupabase';
import type { ProductoConRelaciones } from '@/lib/database.types';
import { supabaseConfigurado } from '@/lib/supabase/config';

export default function ResultadosCatalogo({
  productos,
  vacio,
}: {
  productos: ProductoConRelaciones[];
  vacio: { titulo: string; texto: string };
}) {
  if (!supabaseConfigurado()) {
    return <AvisoSinSupabase que="El catálogo" />;
  }

  if (productos.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-3xl" aria-hidden>
          🔍
        </p>
        <h2 className="mt-3 text-lg font-bold">{vacio.titulo}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">{vacio.texto}</p>
        <Link href="/entrar?registro=1" className="btn-secondary mt-6">
          Publicar una solución
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {productos.map((producto) => (
        <ProductoCard key={producto.id} producto={producto} />
      ))}
    </div>
  );
}
