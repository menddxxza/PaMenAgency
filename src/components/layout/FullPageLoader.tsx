// Pantalla de espera de los guardas de ruta. Antes cada uno pintaba un
// "Cargando…" suelto arriba a la izquierda, y como se encadenan (sesión →
// negocio → suscripción) el arranque se veía como tres saltos de texto.
export function FullPageLoader() {
  return (
    <div className="full-loader" role="status" aria-live="polite">
      <span className="full-loader__brand">Atiende</span>
      <span className="full-loader__bar">
        <span className="full-loader__bar-fill" />
      </span>
      <span className="sr-only">Cargando…</span>
    </div>
  )
}
