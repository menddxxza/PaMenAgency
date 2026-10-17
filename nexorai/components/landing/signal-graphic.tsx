/**
 * Gráfico de firma de Revynai: nodos de negocio conectándose a un núcleo de
 * decisión mediante trazos que se "encienden" en secuencia — una metáfora de
 * "detectar oportunidades y activar agentes", sin recurrir a clichés de
 * cerebro digital o robot.
 */
export function SignalGraphic() {
  const nodes = [
    { x: 40, y: 60, delay: '0s' },
    { x: 360, y: 40, delay: '0.3s' },
    { x: 380, y: 200, delay: '0.6s' },
    { x: 60, y: 260, delay: '0.9s' },
    { x: 20, y: 170, delay: '1.2s' },
  ];
  const cx = 210;
  const cy = 150;

  return (
    <svg viewBox="0 0 420 320" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#39bd8a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#39bd8a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r="110" fill="url(#core-glow)" />
      <circle cx={cx} cy={cy} r="92" stroke="hsl(var(--border))" strokeWidth="1" fill="none" />
      <circle cx={cx} cy={cy} r="60" stroke="hsl(var(--border))" strokeWidth="1" fill="none" />

      {nodes.map((n, i) => (
        <line
          key={i}
          x1={n.x}
          y1={n.y}
          x2={cx}
          y2={cy}
          stroke="#1f9c6f"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeLinecap="round"
          opacity="0.55"
        />
      ))}

      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="5" fill="#0d1117" stroke="#39bd8a" strokeWidth="1.5" />
          <circle
            cx={n.x}
            cy={n.y}
            r="5"
            fill="#39bd8a"
            className="origin-center animate-signal-pulse"
            style={{ animationDelay: n.delay, transformOrigin: `${n.x}px ${n.y}px` }}
          />
        </g>
      ))}

      <circle cx={cx} cy={cy} r="16" fill="#0d1117" stroke="#c9a24d" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="5" fill="#c9a24d" />
    </svg>
  );
}
