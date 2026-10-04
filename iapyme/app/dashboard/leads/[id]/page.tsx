import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPerfilActual } from '@/lib/supabase/server';
import { getConversacion } from '@/lib/queries';
import EstadoLead from '@/components/EstadoLead';
import { decodificarOferta, euros } from '@/lib/formato';
import MarcarLeido from './MarcarLeido';
import FormularioMensaje from './FormularioMensaje';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Conversación · IAPyme' };

function fecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Una burbuja del hilo: a la derecha y en azul si el mensaje es de quien mira la pantalla. */
function Burbuja({
  propio,
  autor,
  cuerpo,
  creadoEn,
}: {
  propio: boolean;
  autor: string;
  cuerpo: string;
  creadoEn: string;
}) {
  const { oferta, texto } = decodificarOferta(cuerpo);

  return (
    <div className={`flex flex-col ${propio ? 'items-end' : 'items-start'}`}>
      <div
        className={`rounded-2xl px-4 py-3 text-sm ${
          propio
            ? 'rounded-br-sm bg-brand-500 text-white'
            : 'rounded-bl-sm bg-ink/[0.05] text-ink/85'
        }`}
        style={{ maxWidth: '38rem' }}
      >
        {oferta !== null ? (
          <p
            className={`mb-1.5 text-base font-bold ${propio ? 'text-white' : 'text-brand-700'}`}
          >
            💶 Propone {euros(oferta)}
          </p>
        ) : null}
        {texto ? <p className="whitespace-pre-line">{texto}</p> : null}
      </div>
      <p className="mt-1 px-1 text-[11px] text-ink/40">
        {propio ? 'Tú' : autor} · {fecha(creadoEn)}
      </p>
    </div>
  );
}

export default async function ConversacionPage({ params }: { params: { id: string } }) {
  const perfil = await getPerfilActual();
  // El layout del dashboard ya exige sesión antes de llegar aquí; esto es
  // solo cinturón y tirantes por si algún día esta página se monta de otra forma.
  if (!perfil) notFound();

  const conversacion = await getConversacion(params.id, perfil.id);
  if (!conversacion) notFound();

  const { lead, mensajes } = conversacion;
  const esVendedor = lead.seller_id === perfil.id;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard/leads" className="text-sm text-ink/50 hover:text-ink">
        ← Todos los mensajes
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">
            {esVendedor ? lead.nombre : lead.products?.titulo ?? 'Conversación'}
          </h1>
          <p className="mt-0.5 text-sm text-ink/60">
            {esVendedor ? (
              <a href={`mailto:${lead.email}`} className="hover:underline">
                {lead.email}
              </a>
            ) : lead.vendedor ? (
              `Con ${lead.vendedor.display_name}`
            ) : null}
            {lead.products ? (
              <>
                {' · '}
                <Link href={`/p/${lead.products.slug}`} className="hover:underline">
                  {lead.products.titulo}
                </Link>
              </>
            ) : null}
          </p>
        </div>

        {esVendedor ? <EstadoLead id={lead.id} status={lead.status} /> : null}
      </header>

      <MarcarLeido leadId={lead.id} />

      <div className="mt-8 space-y-5">
        {/* El primer mensaje de todos vive en leads.mensaje, no en lead_mensajes:
            es el que se escribió al preguntar, antes de que existiera el hilo. */}
        <Burbuja
          propio={!esVendedor}
          autor={esVendedor ? lead.nombre : 'Tú'}
          cuerpo={lead.mensaje}
          creadoEn={lead.created_at}
        />

        {mensajes.map((mensaje) => (
          <Burbuja
            key={mensaje.id}
            propio={mensaje.autor_id === perfil.id}
            autor={
              mensaje.autor_id === perfil.id
                ? 'Tú'
                : mensaje.profiles?.display_name ?? (esVendedor ? lead.nombre : 'Vendedor')
            }
            cuerpo={mensaje.cuerpo}
            creadoEn={mensaje.created_at}
          />
        ))}
      </div>

      <FormularioMensaje leadId={lead.id} />
    </div>
  );
}
