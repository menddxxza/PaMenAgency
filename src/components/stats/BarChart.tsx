import { useState } from 'react'

export interface BarChartDatum {
  label: string
  value: number
  color: string
}

interface Props {
  title: string
  data: BarChartDatum[]
  valueSuffix?: string
}

// Barra simple con tooltip al hover y una vista de tabla accesible
// alternativa — ver dataviz skill: references/marks-and-anatomy.md e
// interaction.md. Sin leyenda: cada barra ya lleva su etiqueta categórica
// directamente en el eje, así que un swatch de color aparte sería redundante.
export function BarChart({ title, data, valueSuffix = '' }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div>
      <div className="page__header" style={{ marginBottom: 0 }}>
        <span className="card__title" style={{ marginBottom: 0 }}>
          {title}
        </span>
        <button className="btn btn--ghost btn--sm" onClick={() => setShowTable((v) => !v)}>
          {showTable ? 'Ver gráfico' : 'Ver tabla'}
        </button>
      </div>

      {!showTable && (
        <div style={{ position: 'relative' }}>
          <div className="bar-chart" role="img" aria-label={`${title}: ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`}>
            {data.map((d, i) => (
              <div
                key={d.label}
                className="bar-chart__col"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((v) => (v === i ? null : v))}
              >
                {hovered === i && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {d.value}
                    {valueSuffix}
                  </span>
                )}
                <div
                  className="bar-chart__bar"
                  style={{
                    height: `${Math.max(4, (d.value / max) * 100)}%`,
                    background: d.color,
                    outline: hovered === i ? `2px solid ${d.color}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
                <span className="bar-chart__label">{d.label}</span>
              </div>
            ))}
          </div>
          {hovered !== null && (
            <div
              className="chart-tooltip"
              style={{
                left: `${((hovered + 0.5) / data.length) * 100}%`,
                top: 0,
              }}
            >
              {data[hovered].label}: {data[hovered].value}
              {valueSuffix}
            </div>
          )}
        </div>
      )}

      {showTable && (
        <table className="table" aria-label={`Tabla de datos — ${title}`}>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <td>{d.label}</td>
                <td>
                  {d.value}
                  {valueSuffix}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
