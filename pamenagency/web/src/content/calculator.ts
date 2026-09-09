/**
 * Calculadora de coste operativo.
 *
 * Regla que ordena todo este archivo: **no se inventa nada**. La
 * calculadora sólo multiplica los números que introduce el propio
 * visitante y le devuelve lo que ya le está costando hoy. No aplica
 * porcentajes de mejora, no estima ahorros y no promete resultados —
 * porque cualquier cifra de ahorro sin conocer el caso sería inventada,
 * que es exactamente lo que el diagnóstico gratuito ya declara.
 *
 * Lo que sí hace: poner un número delante de algo que la mayoría de
 * empresas nunca ha calculado. Ese número es el punto de partida de la
 * conversación, no su conclusión.
 */

export type CampoCalculadora = {
  id: 'personas' | 'horas' | 'coste' | 'consultas' | 'minutosConsulta'
  label: string
  ayuda: string
  sufijo: string
  min: number
  max: number
  porDefecto: number
}

export const campos: CampoCalculadora[] = [
  {
    id: 'personas',
    label: 'Personas que hacen tareas repetitivas',
    ayuda: 'Cuánta gente dedica parte de su semana a tareas que se repiten igual.',
    sufijo: 'personas',
    min: 1,
    max: 500,
    porDefecto: 3,
  },
  {
    id: 'horas',
    label: 'Horas repetitivas por persona y semana',
    ayuda: 'Copiar datos, rellenar plantillas, pasar información de un sitio a otro.',
    sufijo: 'h/semana',
    min: 1,
    max: 40,
    porDefecto: 6,
  },
  {
    id: 'coste',
    label: 'Coste aproximado por hora',
    ayuda: 'Coste para la empresa, no salario neto. Si no lo sabes, deja el valor por defecto.',
    sufijo: '€/hora',
    min: 5,
    max: 200,
    porDefecto: 20,
  },
  {
    id: 'consultas',
    label: 'Consultas repetidas que recibís al día',
    ayuda: 'Preguntas de clientes que se responden prácticamente igual cada vez.',
    sufijo: 'al día',
    min: 0,
    max: 500,
    porDefecto: 15,
  },
  {
    id: 'minutosConsulta',
    label: 'Minutos que lleva responder cada una',
    ayuda: 'Contando la interrupción, no sólo el tiempo de escribir.',
    sufijo: 'minutos',
    min: 1,
    max: 60,
    porDefecto: 6,
  },
]

export type Valores = Record<CampoCalculadora['id'], number>

export const valoresPorDefecto: Valores = campos.reduce(
  (acc, c) => ({ ...acc, [c.id]: c.porDefecto }),
  {} as Valores,
)

export type Resultado = {
  horasSemana: number
  horasAnio: number
  costeAnio: number
  jornadas: number
}

/** 46 semanas laborables al año: 52 menos vacaciones y festivos, redondeado. */
const SEMANAS_LABORABLES = 46
/** Jornada de referencia para traducir horas a días de trabajo. */
const HORAS_JORNADA = 8

/**
 * Aritmética pura sobre los datos introducidos. Sin porcentajes de mejora
 * ni supuestos: horas × coste, y las consultas convertidas a horas.
 */
export function calcular(v: Valores): Resultado {
  const horasTareas = v.personas * v.horas
  const horasConsultas = (v.consultas * v.minutosConsulta * 5) / 60
  const horasSemana = horasTareas + horasConsultas
  const horasAnio = horasSemana * SEMANAS_LABORABLES

  return {
    horasSemana: Math.round(horasSemana),
    horasAnio: Math.round(horasAnio),
    costeAnio: Math.round(horasAnio * v.coste),
    jornadas: Math.round(horasAnio / HORAS_JORNADA),
  }
}

export const formatoNumero = (n: number) => new Intl.NumberFormat('es-ES').format(n)
export const formatoEuros = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
