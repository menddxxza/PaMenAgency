export type Step = {
  num: string
  titulo: string
  resumen: string
  texto: string
  entregables: string[]
}

/** Metodología propia. Se muestra en la home y en /metodologia. */
export const methodology: Step[] = [
  {
    num: '01',
    titulo: 'Descubrir',
    resumen: 'Entender el problema.',
    texto:
      'Antes de hablar de tecnología, hablamos de tu semana. Qué haces, cuántas veces, con qué herramientas y qué parte te consume tiempo sin aportar nada. Esta fase se hace escuchando, no proponiendo.',
    entregables: ['Mapa de tareas', 'Puntos de fricción', 'Inventario de herramientas'],
  },
  {
    num: '02',
    titulo: 'Analizar',
    resumen: 'Encontrar oportunidades.',
    texto:
      'Con el mapa delante, separamos lo repetitivo de lo que exige criterio. Sólo lo primero es candidato. Cada oportunidad se ordena por impacto y por esfuerzo, y las que no compensan se descartan por escrito.',
    entregables: ['Oportunidades priorizadas', 'Descartes justificados', 'Estimación de impacto'],
  },
  {
    num: '03',
    titulo: 'Diseñar',
    resumen: 'Crear la solución.',
    texto:
      'Definimos cómo va a funcionar: qué se automatiza, qué sigue en manos de una persona, qué herramientas intervienen y qué ocurre cuando algo falla. El diseño incluye siempre el plan para los errores.',
    entregables: ['Diseño del flujo', 'Selección de herramientas', 'Plan ante fallos'],
  },
  {
    num: '04',
    titulo: 'Implementar',
    resumen: 'Integrar la tecnología.',
    texto:
      'Construimos, conectamos y probamos con casos reales antes de dejar nada en producción. Se documenta para que no dependas de nosotros para entender lo que tienes.',
    entregables: ['Sistema funcionando', 'Documentación', 'Formación de uso'],
  },
  {
    num: '05',
    titulo: 'Optimizar',
    resumen: 'Medir y mejorar.',
    texto:
      'Revisamos si lo implantado hace lo que debía con los criterios acordados en la fase de análisis. Lo que no funciona se corrige o se retira; mantener algo que no aporta también cuesta dinero.',
    entregables: ['Medición de resultados', 'Ajustes', 'Siguiente prioridad'],
  },
]

/** Cadena visual PROBLEMA → RESULTADO. */
export const pipeline = [
  { label: 'Problema', text: 'Algo que cuesta tiempo, dinero o clientes.' },
  { label: 'Análisis', text: 'Se descompone en pasos y se mide.' },
  { label: 'IA', text: 'Entra sólo donde aporta, no en todo.' },
  { label: 'Automatización', text: 'El proceso pasa a ejecutarse solo.' },
  { label: 'Resultado', text: 'Tiempo recuperado y un criterio para repetirlo.' },
]

/** Los nueve pasos de «de herramienta a ventaja competitiva». */
export const advantageSteps = [
  { titulo: 'Identificar problemas', texto: 'Empieza por lo que molesta, no por lo que suena moderno.' },
  { titulo: 'Identificar tareas repetitivas', texto: 'Lo que haces igual cada semana es el terreno fértil.' },
  { titulo: 'Analizar procesos', texto: 'Descomponer en pasos revela los que sobran.' },
  { titulo: 'Detectar oportunidades', texto: 'No todas las tareas repetitivas merecen automatizarse.' },
  { titulo: 'Seleccionar herramientas', texto: 'La herramienta se elige al final, nunca al principio.' },
  { titulo: 'Crear automatizaciones', texto: 'Empezar por una sola, y que funcione de verdad.' },
  { titulo: 'Medir resultados', texto: 'Si no se mide, en tres meses nadie sabrá si sirvió.' },
  { titulo: 'Optimizar', texto: 'Corregir lo que falla y retirar lo que no aporta.' },
  { titulo: 'Escalar', texto: 'Sólo se extiende lo que ya ha demostrado funcionar.' },
]
