/**
 * Datos de la simulación "A mano / Con IA".
 *
 * Es una simulación: las dos columnas procesan las mismas seis tareas y la
 * de IA avanza a `FACTOR` veces la velocidad. En una jornada, la IA termina
 * las seis y a mano sale una — que es exactamente lo que dice el titular
 * de la sección. Si se cambia el factor, se cambia aquí y en ningún otro
 * sitio.
 */
export const FACTOR = 5

export const tareas = [
  'Responder emails de clientes',
  'Pasar facturas al programa',
  'Preparar el informe semanal',
  'Actualizar la ficha de clientes',
  'Resumir las reuniones',
  'Clasificar pedidos',
]

/** Jornada que recorre el reloj: de 9:00 a 17:00. */
export const INICIO_MIN = 9 * 60
export const FIN_MIN = 17 * 60
