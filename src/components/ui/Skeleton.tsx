// Marcadores de carga con la forma del contenido que va a llegar. Sustituyen
// al texto "Cargando…", que dejaba la tarjeta casi vacía y hacía que la
// página diera un salto al aparecer los datos.

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-rows" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton skeleton-row" key={i} />
      ))}
    </div>
  )
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="stat-row" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="skeleton skeleton-stat" key={i} />
      ))}
    </div>
  )
}

// Anuncia la carga a lectores de pantalla, que no "ven" los skeletons.
export function LoadingAnnouncer({ label = 'Cargando datos' }: { label?: string }) {
  return (
    <span role="status" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
      {label}
    </span>
  )
}
