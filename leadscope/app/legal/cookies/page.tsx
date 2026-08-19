import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/legal-layout';
import { LegalSection } from '@/components/legal/section';
import { EmailContacto } from '@/components/legal/email-contacto';

export const metadata: Metadata = {
  title: 'Política de cookies — LeadScope',
  description: 'Qué cookies y almacenamiento local usa LeadScope.',
  alternates: { canonical: '/legal/cookies' },
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Política de cookies" updated="19 de agosto de 2026">
      <LegalSection title="1. Qué son las cookies">
        <p>
          Las cookies son pequeños archivos que un sitio web guarda en tu navegador. LeadScope usa
          muy pocas, y ninguna con fines publicitarios.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué usamos exactamente">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Cookies de sesión (necesarias):</strong> las gestiona Supabase Auth para
            mantenerte identificado mientras usas el panel. Sin ellas no podrías iniciar sesión.
          </li>
          <li>
            <strong>Preferencia de tema:</strong> guardamos si prefieres modo claro u oscuro en el{' '}
            <code>localStorage</code> de tu navegador, no en una cookie — no viaja al servidor.
          </li>
        </ul>
        <p className="mt-3">
          No usamos cookies de analítica ni de publicidad de terceros. Las cookies necesarias no
          requieren tu consentimiento según la normativa vigente (son imprescindibles para prestar
          el servicio que has solicitado: iniciar sesión).
        </p>
      </LegalSection>

      <LegalSection title="3. Cómo desactivarlas">
        <p>
          Puedes bloquear o borrar las cookies desde la configuración de tu navegador. Ten en
          cuenta que si bloqueas la cookie de sesión no podrás mantener la sesión iniciada en
          LeadScope.
        </p>
      </LegalSection>

      <LegalSection title="4. Dudas">
        <p>
          Si tienes cualquier duda sobre esta política, escríbenos a <EmailContacto />.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
