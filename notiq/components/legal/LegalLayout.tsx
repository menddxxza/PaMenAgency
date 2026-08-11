import Link from 'next/link';
import Logo from '@/components/Logo';

/**
 * Cabecera + pie compartidos por las tres páginas legales (privacidad, cookies,
 * términos): mismas piezas que la landing (Logo, footer con los mismos enlaces),
 * pero sin el fondo animado ni el header con blur — aquí no hace falta, es texto
 * para leer, no una portada.
 */
export default function LegalLayout({
  titulo,
  actualizado,
  children,
}: {
  titulo: string;
  actualizado: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="border-b border-ink/5">
        <div className="container-page flex items-center justify-between py-4">
          <Logo />
          <Link href="/" className="btn-fantasma">
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="container-page py-14 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{titulo}</h1>
          <p className="mt-3 text-sm text-ink/50">Última actualización: {actualizado}</p>

          <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink/75">
            {children}
          </div>
        </div>
      </main>

      <footer className="border-t border-ink/10 py-12">
        <div className="container-page flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-ink/55">
              Notas, tareas y un asistente que las ha leído todas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink/60">
            <Link href="/privacidad" className="hover:text-ink">
              Política de privacidad
            </Link>
            <Link href="/cookies" className="hover:text-ink">
              Política de cookies
            </Link>
            <Link href="/terminos" className="hover:text-ink">
              Términos y condiciones
            </Link>
          </div>
        </div>
        <div className="container-page mt-8 border-t border-ink/10 pt-6 text-xs text-ink/40">
          © {new Date().getFullYear()} Notiq
        </div>
      </footer>
    </div>
  );
}
