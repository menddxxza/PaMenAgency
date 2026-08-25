import { LegalPage } from './LegalPage'
import { Button } from '@/components/ui/Button'
import { categories, openCookieSettings } from '@/lib/consent'

export default function Cookies() {
  return (
    <LegalPage
      title="Política de cookies"
      description="Qué cookies y almacenamiento local utiliza la web de PaMenAgency, para qué sirven y cómo cambiar tu elección en cualquier momento."
      path="/legal/cookies"
    >
      <h2>1. Qué son las cookies</h2>
      <p>
        Una cookie es un pequeño archivo que un sitio web guarda en tu dispositivo al visitarlo.
        Sirve para recordar información entre páginas o entre visitas. Bajo el mismo régimen legal
        entran otras técnicas de almacenamiento en el navegador, como el almacenamiento local, que
        es el que utiliza este sitio.
      </p>

      <h2>2. Qué usa esta web hoy</h2>
      <p>
        Actualmente este sitio sólo utiliza <strong>almacenamiento técnico necesario</strong>: una
        única entrada en el almacenamiento local del navegador que guarda la elección que hagas
        sobre cookies, para no volver a preguntártelo en cada página.
      </p>
      <ul>
        <li>
          <strong>Nombre:</strong> pm-consent-v1
        </li>
        <li>
          <strong>Tipo:</strong> almacenamiento local, propio (no de terceros).
        </li>
        <li>
          <strong>Finalidad:</strong> recordar tu decisión sobre las categorías de cookies.
        </li>
        <li>
          <strong>Duración:</strong> permanece hasta que la borres o cambies tu elección.
        </li>
      </ul>
      <p>
        No hay herramientas de analítica, ni píxeles de redes sociales, ni sistemas de publicidad
        instalados. Las tipografías se sirven desde un proveedor externo, lo que implica que tu
        navegador realiza una petición a ese dominio para descargarlas; esa petición no instala
        cookies en tu dispositivo.
      </p>

      <h2>3. Categorías previstas</h2>
      <p>
        El panel de configuración contempla las siguientes categorías. Las tres últimas están
        desactivadas por defecto y ninguna herramienta se cargará mientras no las aceptes
        expresamente.
      </p>
      <ul>
        {categories.map((c) => (
          <li key={c.key}>
            <strong>{c.titulo}: </strong>
            {c.texto}
          </li>
        ))}
      </ul>

      <h2>4. Cómo cambiar tu elección</h2>
      <p>
        Puedes modificar tus preferencias en cualquier momento desde el botón inferior o desde el
        enlace «Configurar cookies» del pie de página. También puedes eliminar el almacenamiento
        de este sitio desde las opciones de tu navegador, en cuyo caso volveremos a preguntarte.
      </p>
      <p style={{ marginTop: '1.5rem' }}>
        <Button onClick={openCookieSettings} variant="ghost">
          Configurar cookies
        </Button>
      </p>

      <h2>5. Si esto cambia</h2>
      <p>
        Si en el futuro se incorpora alguna herramienta de medición o de marketing, se detallará en
        esta misma página —nombre, proveedor, finalidad y duración— y no se activará hasta contar
        con tu consentimiento para la categoría correspondiente.
      </p>
    </LegalPage>
  )
}
