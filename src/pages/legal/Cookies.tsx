import { LegalLayout } from '@/components/legal/LegalLayout'

export function Cookies() {
  return (
    <LegalLayout title="Política de cookies" updatedAt="agosto de 2026">
      <p>
        Una cookie es un pequeño archivo que una web guarda en tu navegador para recordar información entre
        visitas. Esta página explica qué usa Atiende exactamente.
      </p>

      <h2>1. Lo importante, resumido</h2>
      <p>
        Atiende <strong>no usa cookies de publicidad ni de análisis de terceros</strong>. Solo usamos almacenamiento
        técnico estrictamente necesario para que la app funcione — principalmente, para mantener tu sesión iniciada.
        Por eso no te mostramos un banner pidiendo aceptar cookies: la normativa española (guía de la AEPD) exime de
        ese aviso a las cookies estrictamente necesarias para prestar el servicio que has solicitado.
      </p>

      <h2>2. Qué guardamos y por qué</h2>
      <ul>
        <li>
          <strong>Sesión de acceso</strong> (Supabase Auth): guarda tu token de sesión para que no tengas que iniciar
          sesión cada vez que abres la app. Sin esto, no podrías entrar al panel.
        </li>
        <li>
          <strong>Preferencias de interfaz</strong> (por ejemplo, qué negocio tienes activo si gestionas varios):
          guardadas localmente en tu dispositivo, para que la app recuerde tu elección.
        </li>
      </ul>
      <p>Ninguno de estos datos se usa para elaborar perfiles publicitarios ni se comparte con anunciantes.</p>

      <h2>3. Cookies de terceros durante el pago</h2>
      <p>
        Cuando contratas un plan, el pago se procesa en la página de Stripe, fuera de atiendeapp.es. Stripe puede
        usar sus propias cookies técnicas de seguridad y prevención de fraude en ese momento, bajo su propia
        política de privacidad y cookies.
      </p>

      <h2>4. Cómo desactivarlas</h2>
      <p>
        Puedes bloquear o eliminar estas cookies desde la configuración de tu navegador. Ten en cuenta que, al
        tratarse de las cookies necesarias para mantener tu sesión, si las bloqueas no podrás iniciar sesión ni usar
        el panel de Atiende.
      </p>

      <h2>5. Cambios en esta política</h2>
      <p>
        Si en el futuro añadimos alguna herramienta de analítica o marketing que use cookies no esenciales,
        actualizaremos esta página y te pediremos tu consentimiento antes de activarlas.
      </p>
    </LegalLayout>
  )
}
