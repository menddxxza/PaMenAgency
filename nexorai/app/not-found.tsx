import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logomark, Wordmark } from '@/components/logomark';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <div className="flex items-center gap-2">
        <Logomark />
        <Wordmark className="text-lg" />
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Error 404</p>
        <h1 className="mt-2 text-2xl font-semibold text-fg">Esta página no existe</h1>
        <p className="mt-2 text-sm text-muted">Puede que el enlace esté roto o la página se haya movido.</p>
      </div>
      <Link href="/">
        <Button variant="secondary">Volver al inicio</Button>
      </Link>
    </div>
  );
}
