import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';
import EmailContacto from '@/components/legal/EmailContacto';

export const metadata: Metadata = {
  title: 'Política de privacidad — Notiq',
  description: 'Qué datos recoge Notiq, para qué los usa y cómo ejercer tus derechos.',
};

export default function PrivacidadPage() {
  return (
    <LegalLayout titulo="Política de privacidad" actualizado="11 de agosto de 2026">
      <p>
        Notiq es un servicio de notas, tareas y asistente de IA, parte de{' '}
        <a
          href="https://pamenagency.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-600 hover:underline"
        >
          PaMenAgency
        </a>
        , operado por Pablo Angel Piñeiro Mendoza, como persona física, con domicilio
        en España. Para cualquier cuestión sobre tus datos personales puedes escribir
        a{' '}
        <EmailContacto className="font-semibold text-brand-600 hover:underline" />.
      </p>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">Qué datos recogemos</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong className="text-ink">Datos de la cuenta:</strong> tu correo electrónico, la
            contraseña (guardada siempre cifrada, nunca en claro) y, si lo indicas, tu nombre.
          </li>
          <li>
            <strong className="text-ink">Tu contenido:</strong> las notas, tareas, carpetas,
            etiquetas y adjuntos (imágenes, PDFs) que creas dentro de Notiq.
          </li>
          <li>
            <strong className="text-ink">Datos de uso del asistente de IA:</strong> el número de
            operaciones de IA que consumes cada mes, para aplicar el límite de tu plan.
          </li>
          <li>
            <strong className="text-ink">Datos de facturación:</strong> si contratas un plan de
            pago, Stripe procesa el cobro directamente — Notiq no almacena en ningún momento el
            número de tu tarjeta.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">Para qué los usamos</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Darte acceso a tu cuenta y mantener tu sesión iniciada.</li>
          <li>Guardar y mostrarte tus propias notas y tareas.</li>
          <li>
            Generar resúmenes, extraer tareas y responder en el asistente, usando el contenido
            que tú eliges compartir en cada pregunta — nunca de forma automática ni en segundo
            plano.
          </li>
          <li>Aplicar los límites de tu plan y gestionar el cobro de las suscripciones.</li>
          <li>Responder a tus consultas cuando nos escribes.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">Con quién compartimos datos</h2>
        <p className="mt-3">
          No vendemos tus datos a nadie. Los compartimos únicamente con los proveedores que
          hacen posible el servicio, cada uno con su propia relación contractual y solo con lo
          estrictamente necesario:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong className="text-ink">Neon</strong> — aloja la base de datos donde vive tu
            cuenta, tus notas y tus tareas.
          </li>
          <li>
            <strong className="text-ink">OpenAI</strong> — procesa el texto que envías al
            asistente, a un resumen o a la extracción de tareas, solo cuando usas esas
            funciones.
          </li>
          <li>
            <strong className="text-ink">Stripe</strong> — gestiona el cobro de los planes de
            pago y los datos de facturación asociados.
          </li>
          <li>
            <strong className="text-ink">Vercel</strong> — aloja la aplicación y sirve las
            páginas que visitas.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">Cuánto tiempo los guardamos</h2>
        <p className="mt-3">
          Mientras tu cuenta esté activa. Si pides que la borremos, eliminamos tu cuenta, tus
          notas, tus tareas y tus adjuntos de nuestra base de datos. Algunos datos de
          facturación pueden conservarse el tiempo que exige la normativa fiscal.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">Tus derechos</h2>
        <p className="mt-3">
          Puedes cambiar o cancelar tu plan en cualquier momento desde Ajustes. Para acceder,
          rectificar, exportar o borrar tus datos personales, escríbenos a{' '}
          <EmailContacto className="font-semibold text-brand-600 hover:underline" />. También
          tienes derecho a limitar u oponerte al tratamiento, y a presentar una
          reclamación ante la Agencia Española de Protección de Datos (aepd.es) si consideras
          que no hemos atendido tu solicitud correctamente.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">Seguridad</h2>
        <p className="mt-3">
          Las contraseñas se guardan cifradas con bcrypt, nunca en texto plano. La conexión
          entre tu navegador y Notiq va siempre cifrada (HTTPS). El acceso a la base de datos
          está restringido a la propia aplicación.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold tracking-tight text-ink">Cambios en esta política</h2>
        <p className="mt-3">
          Si cambiamos algo relevante en cómo tratamos tus datos, actualizaremos esta página y
          la fecha de arriba. Si el cambio es significativo, te avisaremos por correo.
        </p>
      </section>
    </LegalLayout>
  );
}
