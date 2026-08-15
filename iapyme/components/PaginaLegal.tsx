import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PaginaLegal({
  titulo,
  actualizado,
  children,
}: {
  titulo: string;
  actualizado: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      <main className="container-page py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight">{titulo}</h1>
          <p className="mt-2 text-sm text-ink/65">Última actualización: {actualizado}</p>

          <div className="mt-8 space-y-8 text-ink/80">{children}</div>
        </div>
      </main>

      <Footer />
    </>
  );
}
