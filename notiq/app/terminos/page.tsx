import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';
import EmailContacto from '@/components/legal/EmailContacto';

export const metadata: Metadata = {
  title: 'Términos y condiciones — Notiq',
  description: 'Las condiciones de uso de Notiq: cuenta, planes, pagos y responsabilidad.',
};

export default function TerminosPage() {
  return (
    <LegalLayout titulo="Términos y condiciones" actualizado="11 de agosto de 2026">
      <p>
        Estos términos regulan el uso de Notiq, un servicio parte de{' '}
        <a
          href="https://pamenagency.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-600 hover:underline"
        >
          PaMenAgency
        </a>
        , operado por Pablo Angel Piñeiro Mendoza. Al crear una cuenta aceptas estas
        condiciones. Si no estás de acuerdo, no uses el servicio.
      </p>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">1. Qué es Notiq</h2>
        <p className="mt-3">
          Notiq es una aplicación de notas, tareas y un asistente de IA que responde usando tu
          propio contenido como contexto. Ofrece un plan Free y dos planes de pago, Pro y Team,
          con distintos límites de notas y operaciones de IA al mes.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">2. Tu cuenta</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Debes dar un correo electrónico válido y una contraseña para registrarte.</li>
          <li>Eres responsable de mantener tu contraseña en secreto y de la actividad de tu cuenta.</li>
          <li>Debes tener al menos 16 años para usar Notiq.</li>
          <li>No está permitido crear cuentas con datos falsos ni suplantar a otra persona.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">3. Tu contenido</h2>
        <p className="mt-3">
          Las notas, tareas y adjuntos que subes son tuyos. Notiq no reclama ninguna propiedad
          sobre tu contenido: solo lo almacena y lo procesa para ofrecerte el servicio (mostrar
          tus notas, generar un resumen que pidas, responder en el asistente). Eres el único
          responsable de lo que subes y de tener derecho a compartirlo.
        </p>
        <p className="mt-3">No está permitido usar Notiq para:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Contenido ilegal, difamatorio o que infrinja derechos de terceros.</li>
          <li>Intentar acceder a cuentas o datos de otros usuarios.</li>
          <li>Sobrecargar el servicio de forma deliberada (por ejemplo, con peticiones automatizadas masivas).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">4. Planes y pagos</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>El plan Free es gratuito, con límite de notas y de operaciones de IA al mes.</li>
          <li>
            Los planes Pro y Team se cobran por suscripción mensual a través de Stripe. El pago
            se renueva automáticamente cada mes hasta que canceles.
          </li>
          <li>
            Puedes cambiar de plan o cancelar en cualquier momento desde Ajustes. Al cancelar,
            mantienes el plan de pago hasta el final del periodo ya cobrado.
          </li>
          <li>
            No se realizan reembolsos de periodos ya iniciados, salvo que la ley aplicable
            exija lo contrario.
          </li>
          <li>Los precios pueden cambiar; si afecta a tu plan, te avisaremos con antelación razonable.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">5. El asistente de IA</h2>
        <p className="mt-3">
          El asistente genera resúmenes, extrae tareas y responde preguntas basándose en tus
          notas y en un modelo de lenguaje de un proveedor externo. Puede cometer errores o
          malinterpretar el contenido: revisa siempre lo importante antes de darlo por bueno.
          Notiq no se hace responsable de decisiones tomadas únicamente en base a una respuesta
          del asistente.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">6. Disponibilidad del servicio</h2>
        <p className="mt-3">
          Hacemos lo posible por mantener Notiq disponible, pero no garantizamos un servicio sin
          interrupciones. Puede haber mantenimientos, incidencias o cambios en las
          funcionalidades. Te recomendamos no depender de Notiq como única copia de información
          crítica.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">7. Cancelación y baja</h2>
        <p className="mt-3">
          Puedes cambiar o cancelar tu plan de pago cuando quieras desde Ajustes. Si quieres que
          eliminemos tu cuenta y todo tu contenido de forma permanente, escríbenos a{' '}
          <EmailContacto className="font-semibold text-brand-600 hover:underline" />. Nos
          reservamos el derecho a suspender o cerrar cuentas que incumplan estos términos.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">8. Cambios en estos términos</h2>
        <p className="mt-3">
          Podemos actualizar estos términos si cambia el servicio. Si el cambio es
          significativo, te avisaremos por correo antes de que entre en vigor.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">9. Contacto</h2>
        <p className="mt-3">
          Para cualquier duda sobre estos términos, escríbenos a{' '}
          <EmailContacto className="font-semibold text-brand-600 hover:underline" />.
        </p>
      </section>
    </LegalLayout>
  );
}
