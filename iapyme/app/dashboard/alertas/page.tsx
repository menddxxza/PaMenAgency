import { getAlertas } from '@/lib/queries';
import { FAMILIAS } from '@/lib/tipos-publicacion';
import FormularioAlerta from './FormularioAlerta';
import FilaAlerta from './FilaAlerta';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mis alertas · IAPyme' };

export default async function AlertasPage() {
  const alertas = await getAlertas();

  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mis alertas</h1>
        <p className="mt-1 text-sm text-ink/60">
          Te avisamos por email cuando se publique algo que encaje. Se revisan una vez al
          día.
        </p>
      </header>

      <div className="card mt-6 p-5">
        <h2 className="text-sm font-bold">Nueva alerta</h2>
        <FormularioAlerta familias={FAMILIAS} />
      </div>

      {alertas.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-4xl" aria-hidden>
            🔔
          </p>
          <h2 className="mt-4 text-lg font-bold">Todavía no tienes alertas</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
            Crea una arriba, o pulsa «Avisarme» desde cualquier búsqueda.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {alertas.map((alerta) => (
            <FilaAlerta key={alerta.id} alerta={alerta} />
          ))}
        </ul>
      )}
    </div>
  );
}
