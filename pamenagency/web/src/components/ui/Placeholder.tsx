/**
 * Marca visible de dato pendiente.
 *
 * Se usa en las páginas legales para los datos identificativos que todavía no
 * se han facilitado. Es deliberadamente evidente: publicar un dato legal
 * inventado sería peor que publicar un hueco.
 */
export function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <span className="pm-placeholder" title="Dato pendiente de facilitar">
      [{children}]
    </span>
  )
}
