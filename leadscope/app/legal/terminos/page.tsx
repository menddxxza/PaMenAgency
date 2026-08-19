import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/legal-layout';
import { LegalSection } from '@/components/legal/section';
import { EmailContacto } from '@/components/legal/email-contacto';

export const metadata: Metadata = {
  title: 'Términos y condiciones — LeadScope',
  description: 'Condiciones de uso de LeadScope.',
  alternates: { canonical: '/legal/terminos' },
};

export default function TerminosPage() {
  return (
    <LegalLayout title="Términos y condiciones" updated="19 de agosto de 2026">
      <LegalSection title="1. Objeto">
        <p>
          LeadScope es una herramienta que te permite buscar negocios locales por nicho y
          ubicación, usando datos de Google Places, y te ayuda a identificar cuáles no tienen
          página web o la tienen desactualizada. Al usar LeadScope aceptas estos términos.
        </p>
      </LegalSection>

      <LegalSection title="2. Tu cuenta">
        <p>
          Debes proporcionar datos veraces al registrarte y mantener tu contraseña en secreto.
          Eres responsable de la actividad que ocurra desde tu cuenta.
        </p>
      </LegalSection>

      <LegalSection title="3. Planes y pagos">
        <ul className="list-disc space-y-2 pl-5">
          <li>El plan Gratis incluye 5 búsquedas al mes con resultados limitados.</li>
          <li>
            El plan Pro es una suscripción mensual recurrente que se cobra a través de Stripe.
            Puedes cancelarla en cualquier momento desde tu panel de facturación; seguirá activa
            hasta el final del periodo ya pagado.
          </li>
          <li>
            Podemos modificar los precios o las características de los planes, avisando con
            antelación razonable a través de la plataforma o por email.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Uso permitido y responsabilidad sobre los datos exportados">
        <p>
          LeadScope te da acceso a información pública sobre negocios (nombre, teléfono,
          dirección, estado de su web) para que evalúes oportunidades comerciales. Cuando exportas
          esos resultados y los usas para contactar a esos negocios, <strong>tú</strong> te
          conviertes en responsable de ese tratamiento y debes cumplir la normativa aplicable a
          comunicaciones comerciales (por ejemplo, la LSSI-CE en España): identificarte
          claramente, no enviar comunicaciones masivas no solicitadas y ofrecer siempre una forma
          de darse de baja.
        </p>
        <p className="mt-3">Queda prohibido:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Revender o redistribuir el acceso a LeadScope como si fuera tu propio servicio.</li>
          <li>
            Automatizar consultas a la plataforma al margen de la interfaz o la API prevista para
            eludir los límites de tu plan.
          </li>
          <li>Usar los datos obtenidos para fines ilícitos, spam masivo o acoso.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Exactitud de los datos">
        <p>
          Los datos de cada negocio provienen de Google Places y de su propia web, consultados en
          el momento de la búsqueda. No garantizamos que estén siempre actualizados o sean
          exactos, ni que contactar con un negocio detectado como «oportunidad» genere ningún
          resultado comercial.
        </p>
      </LegalSection>

      <LegalSection title="6. Propiedad intelectual">
        <p>
          El software, el diseño y la marca LeadScope son de nuestra propiedad. Los datos de los
          negocios que aparecen en los resultados pertenecen a esos negocios o a las fuentes
          públicas de las que proceden.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitación de responsabilidad">
        <p>
          LeadScope se ofrece «tal cual». En la medida permitida por la ley, no respondemos por
          pérdidas derivadas del uso de la información proporcionada por la plataforma ni por
          interrupciones del servicio de terceros (Google, Stripe, proveedores de IA) de los que
          dependemos.
        </p>
      </LegalSection>

      <LegalSection title="8. Legislación aplicable">
        <p>
          Estos términos se rigen por la legislación española. Cualquier disputa se someterá a los
          juzgados y tribunales competentes según la normativa vigente de protección a personas
          consumidoras.
        </p>
      </LegalSection>

      <LegalSection title="9. Contacto">
        <p>
          Para cualquier consulta sobre estos términos, escríbenos a <EmailContacto />.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
