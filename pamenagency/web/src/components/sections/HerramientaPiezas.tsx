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
