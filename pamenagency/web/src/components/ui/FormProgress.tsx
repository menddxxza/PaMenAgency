/**
 * Progreso de un formulario largo, medido en campos obligatorios rellenos.
 *
 * No es un asistente por pasos —el formulario sigue siendo una sola
 * pantalla, para no complicar el envío— sólo una señal de cuánto queda,
 * pensada para formularios con más de cuatro campos obligatorios.
 */
export function FormProgress({ hechos, total }: { hechos: number; total: number }) {
  const pct = total > 0 ? Math.round((hechos / total) * 100) : 0
  return (
    <div className="pm-formprogress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="pm-formprogress__track">
        <div className="pm-formprogress__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="pm-formprogress__texto">
        {hechos} de {total} campos obligatorios
      </span>
    </div>
  )
}
