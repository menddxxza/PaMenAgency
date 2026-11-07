import { useAltasAbiertas } from '@/lib/estadoHerramienta'

/** Piezas de las herramientas de pago, compartidas entre la portada y la pestaña Herramientas. */

export function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Una factura dibujada que se va «leyendo»: la línea dorada la recorre y aparecen las marcas. */
export function FacturaLeyendose() {
  return (
    <div className="pt-herr-doc" aria-hidden="true">
      <div className="pt-herr-doc__hoja">
        <span className="pt-herr-doc__cab" />
        {['NIF', 'Fecha', 'Base', 'IVA', 'Total'].map((c, i) => (
          <span key={c} className="pt-herr-doc__fila" style={{ '--i': i } as React.CSSProperties}>
            <b>{c}</b>
            <i />
            <em>✓</em>
          </span>
        ))}
        <span className="pt-herr-doc__scan" />
      </div>
      <span className="pt-herr-doc__sello">Lista para tu gestoría</span>
    </div>
  )
}

/** Una pregunta y su respuesta con la cita al documento, que aparece al leerse. */
export function ChatCitado() {
  return (
    <div className="pt-herr-chat" aria-hidden="true">
      <p className="pt-herr-chat__pregunta">¿Cuántos días hay para devolver un producto?</p>
      <div className="pt-herr-chat__respuesta">
        <p>
          <span className="pt-herr-chat__linea" style={{ '--i': 0 } as React.CSSProperties} />
          <span className="pt-herr-chat__linea" style={{ '--i': 1 } as React.CSSProperties} />
          <span className="pt-herr-chat__linea pt-herr-chat__linea--corta" style={{ '--i': 2 } as React.CSSProperties} />
        </p>
        <span className="pt-herr-chat__cita">
          <b>1</b> Manual de atención · pág. 1
        </span>
      </div>
      <span className="pt-herr-doc__sello">Con su fuente</span>
    </div>
  )
}

/** La ilustración de cada herramienta. */
export function Ilustracion({ slug }: { slug: string }) {
  return slug === 'asistente' ? <ChatCitado /> : <FacturaLeyendose />
}

/** Botones de entrada a una herramienta, según si ya admite altas. */
export function EntradaHerramienta({ ruta, compacto = false }: { ruta: string; compacto?: boolean }) {
  const altas = useAltasAbiertas(ruta)
  return (
    <div className="pt-actions pt-herr-acciones">
      {altas === false ? (
        <span className="pt-btn pt-btn--gold pt-herr-pronto" aria-disabled="true">
          Abre en unos días
        </span>
      ) : (
        <a className="pt-btn pt-btn--gold" href={`${ruta}#/registro`}>
          Probar gratis <span aria-hidden="true">→</span>
        </a>
      )}
      <a className="pt-btn pt-btn--line" href={ruta}>
        {compacto ? 'Entrar' : 'Ya tengo cuenta · Entrar'}
      </a>
    </div>
  )
}
