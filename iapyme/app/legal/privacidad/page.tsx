import PaginaLegal from '@/components/PaginaLegal';
import SeccionLegal from '@/components/SeccionLegal';

export const metadata = {
  title: 'Política de privacidad · IAPyme',
  description: 'Cómo tratamos tus datos personales en IAPyme.',
  alternates: { canonical: '/legal/privacidad' },
};

export default function PoliticaPrivacidadPage() {
  return (
    <PaginaLegal titulo="Política de privacidad" actualizado="11 de agosto de 2026">
      <SeccionLegal titulo="1. Quién es el responsable">
        <p>
          IAPyme (en adelante, &quot;nosotros&quot;) es el responsable del tratamiento de los
          datos personales que se recogen a través de{' '}
          <strong>iapymeapp.com</strong>. Para cualquier consulta sobre privacidad puedes
          escribir a{' '}
          <a href="mailto:hola@iapymeapp.com">hola@iapymeapp.com</a>.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="2. Qué datos recogemos">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Cuenta de usuario:</strong> email y, si te registras con Google, tu nombre y
            foto de perfil públicos de esa cuenta.
          </li>
          <li>
            <strong>Ficha de vendedor:</strong> si publicas un producto, los datos de la ficha
            (título, descripción, precio, contacto) son visibles públicamente en tu perfil de
            vendedor.
          </li>
          <li>
            <strong>Mensajes de contacto (leads):</strong> cuando pides información sobre un
            producto, guardamos tu nombre, email, teléfono (opcional), empresa (opcional) y el
            mensaje, para poder enviárselo al vendedor correspondiente.
          </li>
          <li>
            <strong>Lista de espera:</strong> si te apuntas antes del lanzamiento, guardamos tu
            email y si te interesa comprar, vender o ambas cosas.
          </li>
          <li>
            <strong>Datos técnicos:</strong> dirección IP y navegador, de forma automática, para
            mantener la seguridad del sitio y evitar abusos (spam, ataques).
          </li>
        </ul>
      </SeccionLegal>

      <SeccionLegal titulo="3. Para qué usamos tus datos">
        <ul className="list-disc space-y-2 pl-5">
          <li>Gestionar tu cuenta y darte acceso a la plataforma.</li>
          <li>Poner en contacto a compradores y vendedores.</li>
          <li>Avisarte por email de novedades relevantes para tu cuenta (por ejemplo, cuando un producto tuyo pasa a revisión).</li>
          <li>Prevenir fraude, spam y abusos del formulario de contacto.</li>
          <li>Cumplir con obligaciones legales cuando corresponda.</li>
        </ul>
      </SeccionLegal>

      <SeccionLegal titulo="4. Con quién compartimos tus datos">
        <p>No vendemos tus datos a nadie. Los compartimos únicamente con:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Supabase</strong> (base de datos y autenticación) y{' '}
            <strong>Netlify</strong> (alojamiento web), como encargados técnicos necesarios
            para que la web funcione.
          </li>
          <li>
            <strong>Resend</strong>, para el envío de emails automáticos.
          </li>
          <li>
            El <strong>vendedor</strong> de un producto, cuando le pides información a través
            del formulario de contacto de su ficha.
          </li>
        </ul>
      </SeccionLegal>

      <SeccionLegal titulo="5. Cuánto tiempo guardamos tus datos">
        <p>
          Mientras tu cuenta esté activa. Si la cierras, o nos pides que eliminemos tus datos,
          los borramos en un plazo razonable, salvo que la ley nos obligue a conservar algo
          durante más tiempo.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="6. Tus derechos">
        <p>
          Puedes pedirnos acceder a tus datos, corregirlos, borrarlos, limitarlos u oponerte a
          su uso, escribiendo a{' '}
          <a href="mailto:hola@iapymeapp.com">hola@iapymeapp.com</a>. También puedes reclamar
          ante la Agencia Española de Protección de Datos (aepd.es) si consideras que no hemos
          atendido tu solicitud correctamente.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="7. Cambios en esta política">
        <p>
          Si actualizamos esta política de forma relevante, lo indicaremos en esta misma
          página con la fecha de la última actualización.
        </p>
      </SeccionLegal>
    </PaginaLegal>
  );
}
