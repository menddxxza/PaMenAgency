import { LegalPage } from './LegalPage'
import { Placeholder } from '@/components/ui/Placeholder'

export default function TratamientoDatos() {
  return (
    <LegalPage
      title="Política de tratamiento de datos"
      description="Detalle de las actividades de tratamiento de datos personales realizadas a través del sitio web de PaMenAgency."
      path="/legal/tratamiento-de-datos"
    >
      <h2>1. Objeto de este documento</h2>
      <p>
        Este documento amplía la política de privacidad y describe, actividad por actividad, qué
        datos se tratan a través del sitio web, con qué base jurídica y durante cuánto tiempo. Es
        el detalle operativo de lo que allí se resume.
      </p>

      <h2>2. Actividades de tratamiento</h2>

      <h3>2.1 Atención de consultas recibidas por el formulario</h3>
      <ul>
        <li>
          <strong>Categorías de interesados:</strong> personas que envían el formulario de contacto.
        </li>
        <li>
          <strong>Categorías de datos:</strong> identificativos y de contacto, más la información
          que la persona decida incluir en el mensaje.
        </li>
        <li>
          <strong>Finalidad:</strong> responder a la consulta y, en su caso, elaborar una propuesta.
        </li>
        <li>
          <strong>Base jurídica:</strong> consentimiento del interesado y medidas precontractuales
          adoptadas a su petición.
        </li>
        <li>
          <strong>Conservación:</strong> mientras dure la consulta y, después, durante los plazos
          de prescripción aplicables.
        </li>
        <li>
          <strong>Destinatarios:</strong> proveedores de alojamiento y de correo electrónico como
          encargados del tratamiento.
        </li>
      </ul>

      <h3>2.2 Gestión del consentimiento de cookies</h3>
      <ul>
        <li>
          <strong>Datos:</strong> la elección realizada sobre las categorías de cookies y la fecha
          en que se realizó.
        </li>
        <li>
          <strong>Ubicación:</strong> almacenamiento local del navegador de la persona usuaria.
          Esta información no se transmite a ningún servidor.
        </li>
        <li>
          <strong>Base jurídica:</strong> cumplimiento de la obligación legal de acreditar el
          consentimiento.
        </li>
      </ul>

      <h3>2.3 Diagnóstico orientativo</h3>
      <p>
        Las respuestas del diagnóstico se procesan exclusivamente en el navegador de la persona
        usuaria y no se transmiten ni se almacenan. No existe tratamiento de datos personales por
        parte del responsable en esta funcionalidad.
      </p>

      <h2>3. Encargados del tratamiento</h2>
      <p>
        Los proveedores que acceden a datos personales por cuenta del responsable lo hacen bajo
        contrato conforme al artículo 28 del RGPD. Relación de encargados:{' '}
        <Placeholder>LISTADO DE PROVEEDORES</Placeholder>.
      </p>

      <h2>4. Medidas de seguridad</h2>
      <ul>
        <li>Transmisión cifrada mediante HTTPS en todo el sitio.</li>
        <li>Acceso a los mensajes recibidos limitado a las personas que deben atenderlos.</li>
        <li>Minimización: sólo se solicitan los datos necesarios para responder.</li>
        <li>Supresión de la información una vez cumplidos los plazos de conservación.</li>
      </ul>

      <h2>5. Ejercicio de derechos</h2>
      <p>
        Las solicitudes de acceso, rectificación, supresión, limitación, portabilidad u oposición
        se dirigen a <Placeholder>EMAIL DE PROTECCIÓN DE DATOS</Placeholder> y se responden en el
        plazo máximo de un mes desde su recepción, prorrogable conforme a la normativa.
      </p>

      <h2>6. Violaciones de seguridad</h2>
      <p>
        En caso de violación de seguridad de los datos personales, se notificará a la autoridad de
        control competente en el plazo legalmente previsto y, cuando proceda por el riesgo para los
        derechos y libertades, a las personas afectadas.
      </p>
    </LegalPage>
  )
}
