/**
 * Versión estática de las escenas 3D.
 *
 * Se sirve en móvil, en equipos modestos, sin WebGL o cuando el usuario ha
 * pedido reducir el movimiento. No es un hueco vacío ni un mensaje de error:
 * es la misma imagen, sin bucle de render.
 */
export function StaticScene({
  kind,
  className,
  style,
}: {
  kind: 'core' | 'cracks'
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={`pm-scene ${className ?? ''}`.trim()} style={style} aria-hidden="true">
      <svg
        viewBox="0 0 400 400"
        width="100%"
        height="100%"
        fill="none"
        style={{ display: 'block' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id={`pm-static-glow-${kind}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.28" />
            <stop offset="65%" stopColor="#D4AF37" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="200" r="180" fill={`url(#pm-static-glow-${kind})`} />

        {kind === 'core' ? (
          <g stroke="#D4AF37" strokeWidth="1">
            <circle cx="200" cy="200" r="118" opacity="0.3" />
            <ellipse cx="200" cy="200" rx="118" ry="46" opacity="0.22" />
            <ellipse cx="200" cy="200" rx="46" ry="118" opacity="0.22" />
            <ellipse
              cx="200"
              cy="200"
              rx="118"
              ry="46"
              opacity="0.16"
              transform="rotate(45 200 200)"
            />
            <ellipse
              cx="200"
              cy="200"
              rx="118"
              ry="46"
              opacity="0.16"
              transform="rotate(-45 200 200)"
            />
            <circle cx="200" cy="200" r="42" opacity="0.5" />
            <g fill="#F0D680" stroke="none">
              {[
                [200, 82], [318, 200], [200, 318], [82, 200],
                [284, 116], [284, 284], [116, 284], [116, 116],
                [200, 158], [242, 200], [200, 242], [158, 200],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r={i < 8 ? 2.6 : 1.8} opacity={i < 8 ? 0.9 : 0.6} />
              ))}
            </g>
          </g>
        ) : (
          <g>
            <path
              d="M200 60 330 140v160L200 380 70 300V140z"
              fill="#0D0D10"
              stroke="#FFFFFF"
              strokeOpacity="0.08"
            />
            <g stroke="#F0D680" strokeLinecap="round" fill="none">
              <path d="M200 60l-22 74 34 40-28 52 16 60" strokeWidth="1.2" opacity="0.75" />
              <path d="M70 140l64 30-18 46 40 26" strokeWidth="1" opacity="0.5" />
              <path d="M330 300l-58-18 12-52-44-22" strokeWidth="1" opacity="0.55" />
              <path d="M148 380l14-58 46 10" strokeWidth="0.9" opacity="0.4" />
            </g>
          </g>
        )}
      </svg>
    </div>
  )
}
