import { LegalPage } from './LegalPage'
import { site } from '@/content/site'

export default function AvisoLegal() {
  return (
    <LegalPage
      title="Aviso legal"
      description="Información general y datos identificativos del titular del sitio web de PaMenAgency."
      path="/legal/aviso-legal"
    >
      <h2>1. Datos identificativos</h2>
      <p>
        En cumplimiento del deber de información recogido en la Ley 34/2002, de Servicios de la
        Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan los siguientes
        datos:
      </p>
      <ul>
        <li>Nombre comercial: {site.name}</li>
        <li>Correo electrónico: {site.email}</li>
        <li>Nombre de dominio: {site.url.replace(/^https?:\/\//, '')}</li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        Este sitio web tiene por objeto presentar los servicios de {site.name} y poner a
        disposición del público contenidos divulgativos sobre inteligencia artificial,
        automatización y transformación digital. El acceso al sitio es gratuito y no requiere
        registro.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El acceso a este sitio implica la aceptación de las presentes condiciones. La persona
        usuaria se compromete a utilizar el sitio conforme a la ley, a la buena fe y al orden
        público, absteniéndose de cualquier uso que pueda dañar el sitio, impedir su normal
        funcionamiento o vulnerar derechos de terceros.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Los contenidos de este sitio —textos, guías, diseño, código, elementos gráficos y
        estructura— son titularidad de {site.name} o se utilizan con la autorización
        correspondiente, y están protegidos por la normativa de propiedad intelectual e
        industrial.
      </p>
      <p>
        Se permite la lectura, la consulta y la cita con indicación de la fuente. No se autoriza su
        reproducción, distribución, transformación ni comunicación pública con fines comerciales
        sin autorización previa y por escrito.
      </p>

      <h2>5. Responsabilidad sobre los contenidos divulgativos</h2>
      <p>
        Las guías y contenidos publicados en el centro de conocimiento tienen carácter informativo
        y divulgativo. No constituyen asesoramiento profesional, jurídico, fiscal ni técnico
        aplicable a un caso concreto, y su aplicación práctica depende de circunstancias que este
        sitio no puede conocer.
      </p>
      <p>
        Lo mismo se aplica al diagnóstico orientativo disponible en la web: su resultado es una
        orientación general basada en las respuestas facilitadas y no constituye un análisis
        profesional ni una estimación económica de ningún tipo.
      </p>

      <h2>6. Exclusión de responsabilidad</h2>
      <p>
        {site.name} no se responsabiliza de las interrupciones del servicio, de los daños derivados
        del uso de la información contenida en el sitio ni de los contenidos de sitios de terceros
        a los que se pueda acceder mediante enlaces. La inclusión de un enlace no implica relación
        ni recomendación.
      </p>

      <h2>7. Legislación aplicable</h2>
      <p>
        Las presentes condiciones se rigen por la legislación española. Para la resolución de
        cualquier controversia, las partes se someten a los juzgados y tribunales que correspondan
        conforme a la normativa aplicable.
      </p>

      <h2>8. Identificación del titular</h2>
      <p>
        El titular de este sitio web es una persona física, con domicilio en Jerez de la Frontera,
        Cádiz, España (11404). Por motivos de privacidad, el NIF no se publica en este aviso
        legal; queda identificado ante las autoridades competentes que lo requieran, y puede
        facilitarse de forma no pública si es necesario para un trámite concreto. El canal de
        contacto disponible es el correo electrónico indicado arriba.
      </p>
    </LegalPage>
  )
}
