import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button-variants';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm font-medium text-brand-600">404</p>
      <h1 className="text-2xl font-semibold text-fg">Página no encontrada</h1>
      <p className="max-w-sm text-sm text-muted">
        La página que buscas no existe o se ha movido.
      </p>
      <Link href="/" className={buttonVariants({ variant: 'brand' })}>
        Volver al inicio
      </Link>
    </div>
  );
}
