import { LegalLayout } from '@/components/legal/LegalLayout'

export function Privacidad() {
  return (
    <LegalLayout title="Política de privacidad" updatedAt="agosto de 2026">
      <p>
        Esta política explica qué datos personales trata Atiende, con qué finalidad, durante cuánto tiempo y qué
        derechos tienes al respecto, conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de
        Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>
          <strong>Nombre:</strong> Pablo Ángel
        </li>
        <li>
          <strong>NIF:</strong> [pendiente de completar]
        </li>
        <li>
          <strong>Domicilio:</strong> Jerez de la Frontera (Cádiz), España
        </li>
        <li>
          <strong>Email de contacto:</strong> <a href="mailto:soporte.Atiende@gmail.com">soporte.Atiende@gmail.com</a>
        </li>
      </ul>

      <h2>2. Dos papeles distintos frente a los datos</h2>
      <p>
        Es importante distinguir dos situaciones, porque cambia quién responde legalmente de cada dato:
      </p>
      <ul>
        <li>
          <strong>Datos de quien se registra y usa Atiende</strong> (email, contraseña, datos del negocio): aquí
          Atiende es <strong>responsable del tratamiento</strong>.
        </li>
        <li>
          <strong>Datos de los clientes finales de cada negocio</strong> (nombre, teléfono, notas, citas, documentos
          que un negocio sube sobre sus propios clientes): aquí Atiende actúa como <strong>encargado del
          tratamiento</strong>, y el negocio que usa la app es el <strong>responsable</strong>. Si tienes un negocio
          en Atiende, eres tú quien debe tener base legal para tratar los datos de tus propios clientes (por
          ejemplo, porque te han dado su teléfono para reservar una cita).
        </li>
      </ul>

      <h2>3. Qué datos tratamos y para qué</h2>
      <ul>
        <li>
          <strong>Cuenta:</strong> email y contraseña (la contraseña se guarda cifrada, nunca en texto plano) — para
          darte acceso a la app.
        </li>
        <li>
          <strong>Negocio:</strong> nombre, número de WhatsApp, servicios, configuración del bot — para prestar el
          servicio de agenda y atención automática.
        </li>
        <li>
          <strong>Pagos:</strong> el plan contratado y el estado de la suscripción. Los datos de tu tarjeta los
          gestiona directamente Stripe; Atiende no los almacena ni los ve.
        </li>
        <li>
          <strong>Uso técnico:</strong> registros de acceso y errores, para mantener la app funcionando y detectar
          problemas de seguridad.
        </li>
      </ul>

      <h2>4. Base legal</h2>
      <p>
        Tratamos tus datos porque es necesario para ejecutar el contrato de prestación del servicio (darte acceso al
        panel, procesar tu suscripción), y en el caso de las comunicaciones informativas, con tu consentimiento, que
        puedes retirar cuando quieras.
      </p>

      <h2>5. Con quién compartimos datos</h2>
      <p>Usamos los siguientes proveedores, que actúan como encargados del tratamiento bajo contrato:</p>
      <ul>
        <li>
          <strong>Supabase</strong> — alojamiento de la base de datos, autenticación y almacenamiento de archivos.
        </li>
        <li>
          <strong>Stripe</strong> — procesamiento de pagos y suscripciones.
        </li>
        <li>
          <strong>Netlify</strong> — alojamiento de la aplicación web.
        </li>
        <li>
          <strong>Google (Gmail)</strong> — envío de correos de la aplicación (confirmación de cuenta, recuperación
          de contraseña).
        </li>
        <li>
          <strong>Anthropic</strong> — generación de respuestas automáticas del bot de WhatsApp, cuando esta función
          está activada por el negocio.
        </li>
      </ul>
      <p>
        Ninguno de estos datos se vende ni se cede a terceros con fines publicitarios. Algunos de estos proveedores
        pueden procesar datos fuera del Espacio Económico Europeo; en ese caso, se apoyan en las Cláusulas
        Contractuales Tipo de la Comisión Europea u otro mecanismo de transferencia válido conforme al RGPD.
      </p>

      <h2>6. Cuánto tiempo conservamos los datos</h2>
      <p>
        Mientras tu cuenta esté activa, y durante los plazos adicionales que exija la normativa fiscal o mercantil
        (por ejemplo, las facturas). Si cierras tu cuenta, eliminamos o anonimizamos los datos que ya no sea
        obligatorio conservar.
      </p>

      <h2>7. Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y
        portabilidad escribiendo a{' '}
        <a href="mailto:soporte.Atiende@gmail.com">soporte.Atiende@gmail.com</a>. También puedes reclamar ante la
        Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noreferrer">
          www.aepd.es
        </a>
        ) si consideras que no hemos atendido tu solicitud correctamente.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Los datos de cada negocio están aislados de los del resto mediante controles de acceso a nivel de base de
        datos (Row Level Security), de forma que ningún negocio puede ver los datos de otro.
      </p>

      <h2>9. Menores de edad</h2>
      <p>Atiende está dirigido a negocios y profesionales, no a menores de edad.</p>

      <h2>10. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política para reflejar cambios legales o del propio servicio. Si el cambio es
        relevante, te avisaremos por email o mediante un aviso en la app.
      </p>
    </LegalLayout>
  )
}
