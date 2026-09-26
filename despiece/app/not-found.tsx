import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="panel max-w-lg p-5">
      <h1 className="label">No encontrado</h1>
      <p className="mt-2 text-sm text-text-2">
        Esa ruta no existe, o el vehículo no está publicado todavía.
      </p>
      <Link href="/" className="btn mt-4">
        Volver al buscador
      </Link>
    </div>
  );
}
