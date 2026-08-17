import ProductoCard from '@/components/ProductoCard';
import ComparadorFavoritos from '@/components/ComparadorFavoritos';
import { getFavoritos } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mis favoritos · IAPyme' };

export default async function FavoritosPage() {
  const productos = await getFavoritos();

  return (
    <div>
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Mis favoritos</h1>
        <p className="mt-1 text-sm text-ink/60">
          {productos.length === 0
            ? 'Las soluciones que guardes con el corazón aparecen aquí.'
            : `${productos.length} ${productos.length === 1 ? 'solución guardada' : 'soluciones guardadas'}.`}
        </p>
      </header>

      {productos.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-4xl" aria-hidden>
            🤍
          </p>
          <h2 className="mt-4 text-lg font-bold">Todavía no has guardado nada</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
            Pulsa el corazón de cualquier ficha para guardarla y compararla más tarde.
          </p>
        </div>
      ) : (
        <>
          <ComparadorFavoritos productos={productos} />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {productos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
