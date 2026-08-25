import { useMemo } from 'react'

type Particle = {
  top: number
  left: number
  size: number
  duration: number
  delay: number
  drift: number
  opacity: number
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 1.5 + Math.random() * 2.5,
    duration: 14 + Math.random() * 18,
    delay: -Math.random() * 20,
    drift: 14 + Math.random() * 26,
    opacity: 0.25 + Math.random() * 0.45,
  }))
}

/**
 * Pintitas doradas que flotan muy despacio por todo el fondo del sitio.
 *
 * Puramente decorativas: fixed, `pointer-events: none`, sólo animan
 * `transform` y `opacity` (nunca layout), y se generan una única vez por
 * carga de página. Con `prefers-reduced-motion` no se monta nada.
 */
export function AmbientParticles() {
  // Un poco más de densidad en pantallas anchas; en móvil, la mitad.
  const particles = useMemo(() => makeParticles(30), [])

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null
  }

  return (
    <div className="pm-particles" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className={`pm-particle${i >= 15 ? ' pm-particle--wide' : ''}`}
          style={
            {
              top: `${p.top}%`,
              left: `${p.left}%`,
              '--size': `${p.size}px`,
              '--dur': `${p.duration}s`,
              '--delay': `${p.delay}s`,
              '--drift': `${p.drift}px`,
              '--op': p.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
