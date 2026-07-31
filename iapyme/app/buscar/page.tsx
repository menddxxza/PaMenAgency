import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FiltrosCatalogo from '@/components/FiltrosCatalogo';
import ResultadosCatalogo from '@/components/ResultadosCatalogo';
import { getProductos } from '@/lib/queries';
import { leerFiltros, type ParamsBusqueda } from '@/lib/filtros';

export const metadata = {
  title: 'Buscar soluciones de IA · IAPyme',
  description:
    'Busca entre automatizaciones, agentes y bots de IA listos para usar, en español.',
};

export const dynamic = 'force-dynamic';

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: ParamsBusqueda;
}) {
  const filtros = leerFiltros(searchParams);
  const productos = await getProductos(filtros, 48);

  return (
    <>
      <Header />

      <main className="container-page py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {filtros.q ? `Resultados para «${filtros.q}»` : 'Todas las soluciones'}
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside>
            <FiltrosCatalogo />
          </aside>

          <div>
            <p className="mb-6 text-sm text-ink/60">
              {productos.length}{' '}
              {productos.length === 1 ? 'solución encontrada' : 'soluciones encontradas'}
            </p>
            <ResultadosCatalogo
              productos={productos}
              vacio={{
                titulo: 'No hemos encontrado nada con esos criterios',
                texto:
                  'Prueba con menos filtros o con otras palabras. Si nadie lo ha construido todavía, quizá sea tu oportunidad de venderlo.',
              }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
