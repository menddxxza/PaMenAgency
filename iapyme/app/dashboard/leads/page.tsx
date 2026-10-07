import Link from 'next/link';
import { getPerfilActual } from '@/lib/supabase/server';
import { getConversaciones } from '@/lib/queries';
import { decodificarOferta, euros } from '@/lib/formato';
import EstadoLead from '@/components/EstadoLead';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mensajes · IAPyme' };

export default async function LeadsPage() {
  const perfil = await getPerfilActual();
  if (!perfil) return null;

  const conversaciones = await getConversaciones(perfil.id);
  const recibidos = conversaciones.filter((c) => c.seller_id === perfil.id);
  const sinResponder = recibidos.filter((c) => c.status === 'new').length;

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mensajes</h1>
          <p className="mt-1 text-sm text-ink/60">
            {conversaciones.length === 0
              ? 'Aquí verás tanto lo que te pregunten sobre tus soluciones como lo que tú preguntes a otros.'
              : `${conversaciones.length} en total${sinResponder > 0 ? ` · ${sinResponder} sin responder` : ''}`}
          </p>
        </div>
        {recibidos.length > 0 ? (
          <a href="/dashboard/leads/exportar" className="btn-secondary">
            Exportar CSV
          </a>
        ) : null}
      </header>

      {sinResponder > 0 ? (
        <p className="card mt-6 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Responder rápido es lo que más vende. Quien pregunta está comparando ahora mismo,
          no la semana que viene.
        </p>
      ) : null}

      {conversaciones.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-4xl" aria-hidden>
            💬
          </p>
          <h2 className="mt-4 text-lg font-bold">Todavía no hay mensajes</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
            Cuando alguien pulse «Pedir información» en una de tus fichas, o cuando tú
            preguntes por la de otra persona, la conversación aparecerá aquí.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {conversaciones.map((lead) => {
            const esVendedor = lead.seller_id === perfil.id;
            const { oferta, texto } = decodificarOferta(lead.mensaje);

            return (
              <li key={lead.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-bold">
                        {esVendedor ? lead.nombre : lead.products?.titulo ?? 'Conversación'}
                      </h2>
                      {esVendedor ? (
                        <EstadoLead id={lead.id} status={lead.status} />
                      ) : (
                        <span className="shrink-0 rounded-md bg-ink/[0.06] px-2 py-1 text-xs font-bold text-ink/60">
                          Enviado por ti
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-ink/60">
                      {esVendedor ? (
                        <>
                          {lead.empresa ? `${lead.empresa} · ` : ''}
                          <a href={`mailto:${lead.email}`} className="text-brand-600 hover:underline">
                            {lead.email}
                          </a>
                          {lead.telefono ? ` · ${lead.telefono}` : ''}
                        </>
                      ) : lead.vendedor ? (
                        `A ${lead.vendedor.display_name}`
                      ) : null}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs text-ink/60">
                    {new Date(lead.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {lead.products ? (
                  <p className="mt-3 text-xs text-ink/50">
                    Sobre{' '}
                    <Link
                      href={`/p/${lead.products.slug}`}
                      className="font-semibold text-ink/70 hover:underline"
                    >
                      {lead.products.titulo}
                    </Link>
                  </p>
                ) : null}

                <div className="mt-3 rounded-xl bg-ink/[0.03] p-4">
                  {oferta !== null ? (
                    <p className="mb-1 text-sm font-bold text-brand-700">
                      💶 Propone {euros(oferta)}
                    </p>
                  ) : null}
                  {texto ? (
                    <p className="line-clamp-3 whitespace-pre-line text-sm text-ink/80">{texto}</p>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/dashboard/leads/${lead.id}`} className="btn-primary py-2">
                    Abrir conversación
                  </Link>
                  {esVendedor ? (
                    <a
                      href={`mailto:${lead.email}?subject=${encodeURIComponent(
                        `Sobre ${lead.products?.titulo ?? 'tu consulta'}`,
                      )}`}
                      className="btn-secondary py-2"
                    >
                      Responder por email
                    </a>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
