import Link from 'next/link';
import { createClient, getPerfilActual } from '@/lib/supabase/server';
import type { Lead } from '@/lib/database.types';
import EstadoLead from '@/components/EstadoLead';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mensajes · IAPyme' };

type LeadConProducto = Lead & { products: { titulo: string; slug: string } | null };

export default async function LeadsPage() {
  const supabase = createClient();
  const perfil = await getPerfilActual();
  if (!supabase || !perfil) return null;

  const { data } = await supabase
    .from('leads')
    .select('*, products ( titulo, slug )')
    .eq('seller_id', perfil.id)
    .order('created_at', { ascending: false });

  const leads = (data ?? []) as unknown as LeadConProducto[];
  const sinResponder = leads.filter((l) => l.status === 'new').length;

  return (
    <div>
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Mensajes</h1>
        <p className="mt-1 text-sm text-ink/60">
          {leads.length === 0
            ? 'Aquí llegan las personas que preguntan por tus soluciones.'
            : `${leads.length} en total · ${sinResponder} sin responder`}
        </p>
      </header>

      {sinResponder > 0 ? (
        <p className="card mt-6 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Responder rápido es lo que más vende. Quien pregunta está comparando ahora mismo,
          no la semana que viene.
        </p>
      ) : null}

      {leads.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-4xl" aria-hidden>
            💬
          </p>
          <h2 className="mt-4 text-lg font-bold">Todavía no hay mensajes</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
            Cuando alguien pulse «Pedir información» en una de tus fichas, su mensaje
            aparecerá aquí con su email para que le contestes directamente.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {leads.map((lead) => (
            <li key={lead.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold">{lead.nombre}</h2>
                    <EstadoLead id={lead.id} status={lead.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-ink/60">
                    {lead.empresa ? `${lead.empresa} · ` : ''}
                    <a href={`mailto:${lead.email}`} className="text-brand-600 hover:underline">
                      {lead.email}
                    </a>
                    {lead.telefono ? ` · ${lead.telefono}` : ''}
                  </p>
                </div>

                <p className="text-xs text-ink/45">
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

              <p className="mt-3 whitespace-pre-line rounded-xl bg-ink/[0.03] p-4 text-sm text-ink/80">
                {lead.mensaje}
              </p>

              <a
                href={`mailto:${lead.email}?subject=${encodeURIComponent(
                  `Sobre ${lead.products?.titulo ?? 'tu consulta'}`,
                )}`}
                className="btn-primary mt-4 inline-block py-2"
              >
                Responder por email
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
