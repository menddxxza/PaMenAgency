import { LegalPage } from './LegalPage'
import { site } from '@/content/site'

export default function Terminos() {
  return (
    <LegalPage
      title="Términos y condiciones"
      description="Condiciones de uso del sitio web de PaMenAgency y del formulario de contacto."
      path="/legal/terminos"
    >
      <h2>1. Ámbito</h2>
      <p>
        Estos términos regulan el uso del sitio web de {site.name}. La contratación de servicios,
        cuando se produzca, se regirá por la propuesta y el contrato firmados entre las partes,
        que prevalecerán sobre este documento en lo que se refiera a la prestación concreta.
      </p>

      <h2>2. Uso del sitio</h2>
      <p>
        El acceso es libre y gratuito. La persona usuaria se compromete a no utilizar el sitio con
        fines ilícitos, a no intentar acceder a áreas restringidas, a no introducir código dañino y
        a no realizar acciones que puedan afectar a su disponibilidad.
      </p>

      <h2>3. Contenidos divulgativos</h2>
      <p>
        Las guías del centro de conocimiento y el resto de contenidos informativos se ofrecen tal
        cual, con finalidad divulgativa. No sustituyen asesoramiento profesional y su aplicación es
        responsabilidad de quien la lleva a cabo.
      </p>

      <h2>4. Diagnóstico orientativo</h2>
      <p>
        La herramienta de diagnóstico disponible en la web genera un resultado a partir de las
        respuestas facilitadas, mediante un cálculo que se ejecuta en el propio navegador. Ese
        resultado es orientativo, no constituye un análisis profesional y no incluye estimaciones
        de ahorro, coste ni retorno de ningún tipo.
      </p>

      <h2>5. Formulario de contacto</h2>
      <p>
        El envío del formulario no genera ninguna obligación contractual para ninguna de las
        partes. Es una solicitud de información. {site.name} podrá responder, solicitar aclaraciones
        o declinar la petición.
      </p>
      <p>
        Quien utiliza el formulario garantiza que los datos facilitados son veraces y que, si
        incluye datos de terceros, cuenta con legitimación para hacerlo.
      </p>

      <h2>6. Propiedad intelectual</h2>
      <p>
        Los contenidos del sitio están protegidos conforme se detalla en el aviso legal. Se permite
        la cita con indicación de la fuente; no se autoriza su explotación comercial sin permiso
        previo por escrito.
      </p>

      <h2>7. Enlaces</h2>
      <p>
        El sitio puede contener enlaces a recursos externos. {site.name} no controla esos recursos
        ni responde de sus contenidos, disponibilidad o políticas.
      </p>

      <h2>8. Disponibilidad y modificaciones</h2>
      <p>
        {site.name} puede modificar, suspender o retirar total o parcialmente los contenidos del
        sitio, así como estos términos, sin necesidad de aviso previo. La versión aplicable es la
        publicada en el momento del acceso.
      </p>

      <h2>9. Ley aplicable</h2>
      <p>
        Estos términos se rigen por la legislación española. Para cualquier controversia, las
        partes se someten a los juzgados y tribunales que correspondan conforme a la normativa
        de protección de personas consumidoras y usuarias aplicable.
      </p>
    </LegalPage>
  )
}
