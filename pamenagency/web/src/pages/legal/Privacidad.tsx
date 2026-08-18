import { LegalPage } from './LegalPage'
import { Placeholder } from '@/components/ui/Placeholder'
import { site } from '@/content/site'

export default function Privacidad() {
  return (
    <LegalPage
      title="Política de privacidad"
      description="Qué datos personales trata PaMenAgency, con qué finalidad, durante cuánto tiempo y qué derechos puedes ejercer."
      path="/legal/privacidad"
    >
      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>
          Responsable: <Placeholder>RESPONSABLE DEL TRATAMIENTO</Placeholder>
        </li>
        <li>
          NIF / CIF: <Placeholder>NIF / CIF</Placeholder>
        </li>
        <li>
          Dirección: <Placeholder>DIRECCIÓN</Placeholder>
        </li>
        <li>
          Correo de contacto: <Placeholder>EMAIL DE PROTECCIÓN DE DATOS</Placeholder>
        </li>
      </ul>

      <h2>2. Qué datos tratamos</h2>
      <p>Este sitio recoge datos personales únicamente en un caso: el formulario de contacto.</p>
      <ul>
        <li>Datos identificativos: nombre y, si lo indicas, empresa.</li>
        <li>Datos de contacto: correo electrónico y, opcionalmente, teléfono.</li>
        <li>
          Datos que decidas incluir voluntariamente: sector, tipo de necesidad, referencia de
          presupuesto y el contenido del mensaje.
        </li>
      </ul>
      <p>
        No se solicitan categorías especiales de datos. Te pedimos que no incluyas en el mensaje
        datos de salud, datos de terceros ni información confidencial: para eso ya habrá un canal
        adecuado si empezamos a trabajar juntos.
      </p>

      <h3>Lo que no recogemos</h3>
      <ul>
        <li>No hay registro de usuarios ni cuentas.</li>
        <li>No se crean perfiles ni se toman decisiones automatizadas sobre las personas.</li>
        <li>
          El diagnóstico de la web se calcula íntegramente en tu navegador: sus respuestas no se
          envían ni se almacenan en ningún servidor.
        </li>
      </ul>

      <h2>3. Finalidad y base jurídica</h2>
      <ul>
        <li>
          <strong>Responder a tu consulta.</strong> Base jurídica: tu consentimiento, prestado al
          marcar la casilla del formulario, y la aplicación de medidas precontractuales a petición
          tuya.
        </li>
        <li>
          <strong>Mantener la comunicación</strong> derivada de esa consulta mientras siga abierta.
        </li>
      </ul>
      <p>
        No se utilizan tus datos para enviarte comunicaciones comerciales no solicitadas ni se
        incorporan a ninguna lista de difusión.
      </p>

      <h2>4. Plazo de conservación</h2>
      <p>
        Los datos del formulario se conservan durante el tiempo necesario para atender tu consulta
        y, después, durante los plazos de prescripción legalmente aplicables a posibles
        responsabilidades. Transcurridos esos plazos, se suprimen.
      </p>

      <h2>5. Destinatarios</h2>
      <p>
        No se ceden datos a terceros salvo obligación legal. Sí pueden intervenir proveedores que
        prestan servicios técnicos —alojamiento web y correo electrónico— actuando como
        encargados del tratamiento, con contrato conforme al artículo 28 del RGPD.
      </p>
      <p>
        Proveedores utilizados: <Placeholder>PROVEEDOR DE ALOJAMIENTO</Placeholder> y{' '}
        <Placeholder>PROVEEDOR DE CORREO</Placeholder>.
      </p>

      <h2>6. Transferencias internacionales</h2>
      <p>
        Si alguno de los proveedores anteriores trata datos fuera del Espacio Económico Europeo, la
        transferencia se ampara en una decisión de adecuación o en las cláusulas contractuales tipo
        aprobadas por la Comisión Europea. El detalle se indicará aquí una vez confirmados los
        proveedores.
      </p>

      <h2>7. Tus derechos</h2>
      <p>
        Puedes ejercer los derechos de acceso, rectificación, supresión, limitación del
        tratamiento, portabilidad y oposición, así como retirar el consentimiento en cualquier
        momento, escribiendo a <Placeholder>EMAIL DE PROTECCIÓN DE DATOS</Placeholder> e indicando
        el derecho que deseas ejercer.
      </p>
      <p>
        Si consideras que el tratamiento no se ajusta a la normativa, puedes presentar una
        reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Se aplican medidas técnicas y organizativas razonables para proteger los datos frente a
        pérdida, acceso no autorizado o divulgación indebida. El sitio se sirve mediante conexión
        cifrada.
      </p>

      <h2>9. Cookies</h2>
      <p>
        El uso de cookies y tecnologías similares se describe en la política de cookies, accesible
        desde el pie de página. Puedes modificar tu elección en cualquier momento.
      </p>

      <h2>10. Cambios en esta política</h2>
      <p>
        Esta política puede actualizarse para adaptarse a cambios normativos o a nuevos
        tratamientos. La fecha de la última actualización figura al final del documento. Para
        cualquier duda previa, escribe a {site.email}.
      </p>
    </LegalPage>
  )
}
