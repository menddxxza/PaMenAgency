import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import {
  campos,
  calcular,
  formatoEuros,
  formatoNumero,
  valoresPorDefecto,
  type Valores,
} from '@/content/calculator'

/**
 * Calculadora del coste operativo actual.
 *
 * Deliberadamente NO es una calculadora de ahorro: sólo multiplica los
 * números que introduce el visitante. Cualquier porcentaje de mejora sería
 * inventado sin conocer el caso, y esta web no hace eso — la misma razón
 * por la que el diagnóstico tampoco da cifras económicas.
 *
 * El resultado se recalcula en cada cambio: no hay botón de "calcular"
 * porque no hay nada que enviar a ninguna parte. Todo ocurre en el
 * navegador y no se guarda nada.
 */
export function CostCalculator() {
  const [valores, setValores] = useState<Valores>(valoresPorDefecto)
  const resultado = calcular(valores)

  const set = (id: keyof Valores, valor: number) =>
    setValores((prev) => ({ ...prev, [id]: valor }))

  return (
    <div className="pm-diag">
      <div className="pm-calc">
        <div className="pm-calc__campos">
          {campos.map((campo) => (
            <div className="pm-field" key={campo.id}>
              <label className="pm-label" htmlFor={`pm-calc-${campo.id}`}>
                {campo.label}
              </label>
              <div className="pm-calc__entrada">
                <input
                  id={`pm-calc-${campo.id}`}
                  className="pm-input"
                  type="number"
                  inputMode="numeric"
                  min={campo.min}
                  max={campo.max}
                  value={valores[campo.id]}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    if (Number.isNaN(n)) return
                    set(campo.id, Math.min(Math.max(n, campo.min), campo.max))
                  }}
                />
                <span className="pm-calc__sufijo">{campo.sufijo}</span>
              </div>
              <p className="pm-calc__ayuda">{campo.ayuda}</p>
            </div>
          ))}
        </div>

        <div className="pm-calc__resultado" aria-live="polite">
          <p className="pm-eyebrow">Lo que cuesta hoy</p>

          <p className="pm-calc__cifra">{formatoEuros(resultado.costeAnio)}</p>
          <p className="pm-calc__cifra-label">al año en tareas repetitivas</p>

          <ul className="pm-calc__detalle">
            <li>
              <strong>{formatoNumero(resultado.horasSemana)} h</strong>
              <span className="pm-muted"> a la semana</span>
            </li>
            <li>
              <strong>{formatoNumero(resultado.horasAnio)} h</strong>
              <span className="pm-muted"> al año</span>
            </li>
            <li>
              <strong>{formatoNumero(resultado.jornadas)} jornadas</strong>
              <span className="pm-muted"> de 8 horas</span>
            </li>
          </ul>

          <p className="pm-calc__nota">
            <Icon name="alert" size={15} />
            <span>
              Esto no es una estimación de ahorro: es tu propio dato multiplicado. Cuánto de esto se
              puede recuperar depende de cada proceso, y eso no se puede saber sin mirarlo.
            </span>
          </p>

          <div className="pm-row" style={{ marginTop: '1.5rem' }}>
            <Button to="/auditoria-ia" size="sm" arrow>
              Ver qué parte es recuperable
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
