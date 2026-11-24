import { Link, useLocation } from 'react-router-dom'
import { bfActivo, bfQuedan, blackFriday } from '@/content/blackfriday'
import '@/styles/blackfriday-promo.css'

/**
 * Promoción del Black Friday 2026 en el resto de la web (la página está en /blackfriday).
 * Todo desaparece solo cuando pasa el cierre (blackFriday.cierre).
 */

/** Barra dorada en lo alto de todas las páginas, salvo en la propia del Black Friday. */
export function BlackFridayBarra() {
  const { pathname } = useLocation()
  if (!bfActivo() || pathname.startsWith('/blackfriday')) return null
  return (
    <Link to="/blackfriday" className="bf-barra">
      <span className="bf-barra__regalo" aria-hidden="true">🎁</span>
      <span className="bf-barra__texto">
        <strong>Black Friday:</strong> <span className="bf-barra__largo">regalamos {blackFriday.plazas} herramientas a medida</span>
        <span className="bf-barra__corto">{blackFriday.plazas} herramientas gratis</span>
      </span>
      <span className="bf-barra__quedan">
        <span className="bf-barra__quedan-largo">{bfQuedan()}</span>
        <span className="bf-barra__quedan-corto">{bfQuedan().replace(/^Queda[n]? /, '')}</span>
      </span>
      <span className="bf-barra__accion">
        Quiero la mía <span aria-hidden="true">→</span>
      </span>
    </Link>
  )
}

/** Píldora encima del titular de la portada. */
export function BlackFridayPildora() {
  if (!bfActivo()) return null
  return (
    <Link to="/blackfriday" className="bf-pildora">
      <span className="bf-pildora__chip">Black Friday</span>
      Regalamos {blackFriday.plazas} herramientas <span aria-hidden="true">→</span>
    </Link>
  )
}

/** Tarjeta grande de la portada. */
export function BlackFridayTarjeta() {
  if (!bfActivo()) return null
  return (
    <article className="pt-herr-tarjeta bf-tarjeta pm-reveal">
      <div>
        <span className="pt-herr-chip">
          <span className="pt-herr-chip__punto" aria-hidden="true" /> Black Friday · {blackFriday.plazas} plazas
        </span>
        <h2 className="pt-h2">
          No bajamos precios. <em>Regalamos {blackFriday.plazas} herramientas.</em>
        </h2>
        <p className="pt-text">
          Elegimos {blackFriday.plazas} empresas y les hacemos gratis una herramienta a medida que hace sola una tarea que hoy
          hacen a mano. A cambio, solo poder contar el caso.
        </p>
        <ul className="bf-tarjeta__lista">
          {blackFriday.regalamos.map((r) => (
            <li key={r.titulo}>{r.titulo}</li>
          ))}
        </ul>
        <div className="bf-tarjeta__accion">
          <Link className="pt-btn pt-btn--gold" to="/blackfriday">
            Quiero mi herramienta gratis <span aria-hidden="true">→</span>
          </Link>
          <span className="bf-tarjeta__nota">
            {bfQuedan()} · cierra el {blackFriday.cierreTexto}
          </span>
        </div>
      </div>
      <div className="bf-tarjeta__visual" aria-hidden="true">
        <p className="bf-tarjeta__precio">
          <s>Desde 200 €</s>
          <b>0 €</b>
        </p>
        <div className="bf-tarjeta__plazas">
          {Array.from({ length: blackFriday.plazas }, (_, i) => (
            <span key={i} style={{ '--i': i } as React.CSSProperties}>
              🎁
            </span>
          ))}
        </div>
        <p className="bf-tarjeta__pie">No es un sorteo: elegimos casos distintos</p>
      </div>
    </article>
  )
}
