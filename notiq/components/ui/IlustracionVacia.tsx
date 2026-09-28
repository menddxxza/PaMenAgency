type Tipo = 'notas' | 'papelera' | 'tareas' | 'estudio';

/**
 * Ilustraciones muy simples (solo trazos, sin relleno) para los sitios de la
 * app que hoy solo tienen un texto cuando no hay nada que enseñar — "todavía
 * no hay notas", papelera vacía, etc. A propósito minimalistas y en el color
 * de marca, para no desentonar con el resto de la interfaz (sin sombras, sin
 * degradados) ni pesar nada en el bundle: son trazos a mano, no un icon pack.
 */
export default function IlustracionVacia({ tipo, className = '' }: { tipo: Tipo; className?: string }) {
  const comun = {
    viewBox: '0 0 96 96',
    fill: 'none',
    className: `text-brand-300 ${className}`,
    'aria-hidden': true as const,
  };

  if (tipo === 'notas') {
    return (
      <svg {...comun}>
        <rect x="22" y="14" width="52" height="68" rx="6" stroke="currentColor" strokeWidth="3" />
        <path d="M33 34h30M33 46h30M33 58h18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="66" cy="70" r="12" className="text-lima-400" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.5" />
        <path d="M61 70h10M66 65v10" className="text-lima-600" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (tipo === 'papelera') {
    return (
      <svg {...comun}>
        <path d="M26 30h44l-4 46a6 6 0 0 1-6 5.5H36a6 6 0 0 1-6-5.5L26 30Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M18 30h60M40 20h16a4 4 0 0 1 4 4v6H36v-6a4 4 0 0 1 4-4Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M40 42v28M48 42v28M56 42v28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    );
  }

  if (tipo === 'tareas') {
    return (
      <svg {...comun}>
        <rect x="18" y="16" width="60" height="64" rx="6" stroke="currentColor" strokeWidth="3" />
        {[30, 46, 62].map((y) => (
          <g key={y}>
            <rect x="28" y={y} width="12" height="12" rx="3" stroke="currentColor" strokeWidth="2.5" />
            <path d={`M48 ${y + 6}h20`} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          </g>
        ))}
        <path
          d="M30 30l3 3 6-6"
          className="text-lima-600"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg {...comun}>
      <path
        d="M48 26 20 38l28 12 28-12-28-12Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M32 44v18c0 4 7 8 16 8s16-4 16-8V44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M76 38v16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="76" cy="58" r="2.5" fill="currentColor" />
    </svg>
  );
}
