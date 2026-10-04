/**
 * Progreso de un formulario largo, medido en campos obligatorios rellenos.
 *
 * No es un asistente por pasos —el formulario sigue siendo una sola
 * pantalla, para no complicar el envío— sólo una señal de cuánto queda,
 * pensada para formularios con más de cuatro campos obligatorios.
 */
export function FormProgress({ hechos, total }: { hechos: number; total: number }) {
  const pct = total > 0 ? Math.round((hechos / total) * 100) : 0
  const texto = `${hechos} de ${total} campos obligatorios`
  return (
    <div
      className="pm-formprogress"
      role="progressbar"
      // Hallado con un escaneo automático de accesibilidad: sin aria-label,
      // un "progressbar" no tiene nombre accesible y un lector de pantalla
      // sólo anuncia "barra de progreso", sin decir de qué. aria-valuetext
      // expone el texto real ("2 de 6 campos") en vez del porcentaje solo.
      aria-label="Progreso del formulario"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={texto}
    >
      <div className="pm-formprogress__track">
        <div className="pm-formprogress__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="pm-formprogress__texto" aria-hidden="true">
        {texto}
      </span>
    </div>
  )
}
