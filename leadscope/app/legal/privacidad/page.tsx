import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/legal-layout';
import { LegalSection } from '@/components/legal/section';
import { EmailContacto } from '@/components/legal/email-contacto';

export const metadata: Metadata = {
  title: 'Política de privacidad — LeadScope',
  description: 'Cómo tratamos tus datos personales en LeadScope.',
  alternates: { canonical: '/legal/privacidad' },
};

export default function PrivacidadPage() {
  return (
    <LegalLayout title="Política de privacidad" updated="19 de agosto de 2026">
      <LegalSection title="1. Quién es el responsable">
        <p>
          LeadScope (en adelante, «nosotros») es el responsable del tratamiento de los datos
          personales que se recogen a través de esta plataforma. Para cualquier consulta sobre
          privacidad puedes escribir a <EmailContacto />.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué datos recogemos">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Cuenta de usuario:</strong> email, nombre y contraseña (cifrada) al
            registrarte.
          </li>
          <li>
            <strong>Datos de facturación:</strong> si contratas el plan Pro, Stripe procesa el
            pago; nosotros no almacenamos los datos de tu tarjeta, solo el identificador de
            cliente que nos da Stripe.
          </li>
          <li>
            <strong>Historial de búsquedas:</strong> los criterios de cada búsqueda (nicho,
            ubicación, filtros) y los resultados que genera, para que puedas consultarlos luego
            desde tu panel.
          </li>
          <li>
            <strong>Datos técnicos:</strong> dirección IP y navegador, de forma automática, para
            mantener la seguridad del servicio y evitar abusos.
          </li>
        </ul>
        <p className="mt-3">
          Los resultados de búsqueda contienen además datos de <strong>terceros</strong> (los
          negocios locales que encuentra la herramienta): nombre, teléfono, dirección y, si la web
          del negocio lo publica, un email de contacto. Esos datos no los generamos nosotros — los
          consultamos en tiempo real en Google Places y en la propia web pública del negocio. Ver{' '}
          <a href="/legal/tratamiento-datos" className="underline underline-offset-2">
            tratamiento de datos de terceros
          </a>{' '}
          para el detalle.
        </p>
      </LegalSection>

      <LegalSection title="3. Para qué usamos tus datos">
        <ul className="list-disc space-y-2 pl-5">
          <li>Darte acceso a tu cuenta y gestionar tu suscripción.</li>
          <li>Ejecutar las búsquedas que solicitas y guardar tu historial.</li>
          <li>Procesar pagos y gestionar la facturación del plan Pro.</li>
          <li>Enviarte comunicaciones de servicio (confirmaciones, avisos de tu cuenta).</li>
          <li>Prevenir fraude y abusos de la plataforma.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Con quién compartimos tus datos">
        <p>No vendemos tus datos a nadie. Los compartimos únicamente con:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Supabase</strong> (base de datos y autenticación) y <strong>Vercel</strong>{' '}
            (alojamiento web), como encargados técnicos necesarios para que el servicio funcione.
          </li>
          <li>
            <strong>Stripe</strong>, para procesar los pagos del plan Pro.
          </li>
          <li>
            <strong>Google</strong>, al consultar Google Places API para obtener los resultados
            de cada búsqueda que realizas.
          </li>
          <li>
            <strong>Anthropic u OpenAI</strong>, solo si tienes activada la clasificación de
            calidad de web con IA: les enviamos el HTML de la web de un negocio (no tus datos
            personales) para detectar si parece anticuada.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Cuánto tiempo guardamos tus datos">
        <p>
          Mientras tu cuenta esté activa. Si la cierras, o nos pides que eliminemos tus datos, los
          borramos en un plazo razonable, salvo que la ley nos obligue a conservar algo (por
          ejemplo, facturas) durante más tiempo.
        </p>
      </LegalSection>

      <LegalSection title="6. Tus derechos">
        <p>
          Puedes pedirnos acceder a tus datos, corregirlos, borrarlos, limitarlos u oponerte a su
          uso, escribiendo a <EmailContacto />. También puedes reclamar ante la Agencia Española
          de Protección de Datos (aepd.es) si consideras que no hemos atendido tu solicitud
          correctamente.
        </p>
      </LegalSection>

      <LegalSection title="7. Cambios en esta política">
        <p>
          Si actualizamos esta política de forma relevante, lo indicaremos en esta misma página
          con la fecha de la última actualización.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
