import { LegalLayout } from '@/components/legal/LegalLayout'
import { TRIAL_DAYS } from '@/lib/plans'

export function Terminos() {
  return (
    <LegalLayout title="Términos y condiciones" updatedAt="agosto de 2026">
      <p>
        Estas condiciones regulan el uso de Atiende, un servicio de gestión de citas, clientes y conversaciones de
        WhatsApp para negocios, prestado por Pablo Ángel (NIF [pendiente de completar]), operando bajo el nombre
        comercial{' '}
        <a href="https://pamenagency.com" target="_blank" rel="noreferrer">
          PaMen Agency
        </a>
        , con domicilio en Jerez de la Frontera (Cádiz), España, y contacto en{' '}
        <a href="mailto:soporte.Atiende@gmail.com">soporte.Atiende@gmail.com</a>. Al crear una cuenta aceptas estas
        condiciones. Atiende forma parte del catálogo de productos de PaMen Agency (
        <a href="https://pamenagency.com" target="_blank" rel="noreferrer">
          pamenagency.com
        </a>
        ).
      </p>

      <h2>1. Qué es el servicio</h2>
      <p>
        Atiende es una aplicación web que permite a un negocio gestionar su agenda de citas, sus clientes, sus
        conversaciones de WhatsApp (con la ayuda de un asistente automático), su facturación y su inventario, según
        el plan contratado.
      </p>

      <h2>2. Registro y cuenta</h2>
      <p>
        Para usar Atiende necesitas crear una cuenta con un email válido. Eres responsable de mantener la
        confidencialidad de tu contraseña y de toda la actividad que ocurra desde tu cuenta. Debes darnos datos
        veraces al registrarte.
      </p>

      <h2>3. Planes, precios y prueba gratuita</h2>
      <p>
        Atiende ofrece los planes Starter, Pro y Agencia, con los precios y funciones indicados en la página de
        precios en cada momento. Todo negocio nuevo dispone de {TRIAL_DAYS} días de prueba gratuita del plan Pro
        completo, sin necesidad de introducir una tarjeta. Al terminar ese periodo sin haber contratado un plan de
        pago, el acceso al panel se bloquea hasta que se elija uno; los datos introducidos durante la prueba no se
        eliminan. Los pagos de los planes de pago se procesan a través de Stripe, con renovación periódica
        automática mientras la suscripción esté activa.
      </p>

      <h2>4. Cancelación</h2>
      <p>
        Puedes cancelar tu suscripción cuando quieras desde el propio panel. La cancelación surte efecto al final
        del periodo ya pagado; no se realizan devoluciones proporcionales de periodos ya facturados, salvo que la
        normativa aplicable exija lo contrario.
      </p>

      <h2>5. Tus obligaciones como usuario</h2>
      <ul>
        <li>Usar el servicio conforme a la ley y a estas condiciones.</li>
        <li>
          No usar Atiende para enviar comunicaciones no solicitadas, contenido ilícito, ni para suplantar a
          terceros.
        </li>
        <li>
          Si gestionas datos de tus propios clientes a través de Atiende (nombre, teléfono, notas, documentos), eres
          responsable de tener base legal para tratarlos y de cumplir el RGPD frente a ellos — Atiende actúa aquí
          únicamente como encargado técnico del tratamiento, según se explica en la Política de privacidad.
        </li>
      </ul>

      <h2>6. El asistente automático de WhatsApp</h2>
      <p>
        El asistente responde en base a la información que cada negocio configura. Puede no responder correctamente
        en todos los casos, y las conversaciones pueden pasar a un humano en cualquier momento desde el panel.
        Atiende no garantiza que las respuestas automáticas sean siempre exactas ni sustituye el criterio del propio
        negocio frente a sus clientes.
      </p>

      <h2>7. Disponibilidad del servicio</h2>
      <p>
        Hacemos lo razonablemente posible para que Atiende esté disponible de forma continua, pero puede haber
        interrupciones por mantenimiento, incidencias técnicas o causas ajenas (por ejemplo, de nuestros
        proveedores de infraestructura). No garantizamos una disponibilidad del 100%.
      </p>

      <h2>8. Propiedad intelectual</h2>
      <p>
        El software, el diseño y la marca "Atiende" son propiedad de su responsable. Los datos que introduces en la
        app (información de tu negocio, tus clientes, tus citas) son tuyos; no los usamos para ningún fin distinto
        de prestarte el servicio.
      </p>

      <h2>9. Limitación de responsabilidad</h2>
      <p>
        Atiende se presta "tal cual". En la medida permitida por la ley, no respondemos por daños indirectos o
        lucro cesante derivados del uso del servicio. Nada en esta cláusula limita la responsabilidad en los casos
        en que la ley no permite hacerlo (por ejemplo, dolo o negligencia grave).
      </p>

      <h2>10. Modificación de estas condiciones</h2>
      <p>
        Podemos actualizar estas condiciones para reflejar cambios legales o del servicio. Si el cambio es
        relevante, te avisaremos con antelación razonable por email o dentro de la app.
      </p>

      <h2>11. Legislación y jurisdicción</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Para cualquier controversia, y sin perjuicio del
        fuero que corresponda por ley a las personas consumidoras, las partes se someten a los juzgados y
        tribunales de Jerez de la Frontera (Cádiz).
      </p>
    </LegalLayout>
  )
}
