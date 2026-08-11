import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';
import EmailContacto from '@/components/legal/EmailContacto';

export const metadata: Metadata = {
  title: 'Política de cookies — Notiq',
  description: 'Qué cookies usa Notiq y por qué son las mínimas imprescindibles.',
};

export default function CookiesPage() {
  return (
    <LegalLayout titulo="Política de cookies" actualizado="11 de agosto de 2026">
      <p>
        Notiq usa las cookies mínimas imprescindibles para que la aplicación funcione. No
        usamos cookies de publicidad, ni de analítica de terceros, ni rastreadores que sigan tu
        actividad fuera de Notiq.
      </p>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">La única cookie que usamos</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-ink/[0.03] text-xs font-semibold uppercase tracking-wide text-ink/55">
              <tr>
                <th className="px-4 py-3">Cookie</th>
                <th className="px-4 py-3">Para qué sirve</th>
                <th className="px-4 py-3">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              <tr>
                <td className="px-4 py-3 font-mono text-xs">authjs.session-token</td>
                <td className="px-4 py-3">
                  Mantiene tu sesión iniciada. Sin ella, Notiq no sabría quién eres al navegar
                  entre páginas y tendrías que iniciar sesión en cada clic.
                </td>
                <td className="px-4 py-3">Hasta que cierras sesión o caduca</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          Es una cookie técnica, necesaria para el funcionamiento del servicio: no requiere tu
          consentimiento previo según la normativa, igual que no lo requeriría recordar en qué
          página estabas.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">Lo que no hacemos</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>No usamos Google Analytics ni ninguna herramienta de analítica de terceros.</li>
          <li>No usamos cookies de publicidad ni de redes sociales.</li>
          <li>No hay píxeles de seguimiento ni scripts de terceros cargando en tu navegador.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">Cómo desactivarla</h2>
        <p className="mt-3">
          Puedes borrar o bloquear esta cookie desde la configuración de tu navegador en
          cualquier momento. Ten en cuenta que, al ser la cookie que mantiene tu sesión, si la
          bloqueas no podrás permanecer conectado a Notiq entre visitas.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">Contacto</h2>
        <p className="mt-3">
          Si tienes dudas sobre esta política, escríbenos a{' '}
          <EmailContacto className="font-semibold text-brand-600 hover:underline" />.
        </p>
      </section>
    </LegalLayout>
  );
}
