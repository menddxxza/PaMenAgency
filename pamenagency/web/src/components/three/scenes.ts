import * as THREE from 'three'

/**
 * Escenas WebGL del sitio.
 *
 * Este módulo se carga de forma diferida: `three` vive en su propio chunk y
 * sólo llega al navegador de quien va a poder ejecutar la escena. Cada función
 * devuelve un controlador con `dispose`, `resize` y `setPaused`, y quien la
 * monta es responsable de llamarlos.
 */

export type SceneHandle = {
  dispose: () => void
  setPaused: (paused: boolean) => void
}

type Options = {
  canvas: HTMLCanvasElement
  /** Reduce el número de elementos en equipos modestos. */
  quality?: 'high' | 'low'
}

const GOLD = 0xd4af37
const GOLD_BRIGHT = 0xf0d680

/** Renderizador con ajustes comunes: fondo transparente y DPR acotado. */
function makeRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: window.devicePixelRatio < 2,
    powerPreference: 'low-power',
  })
  renderer.setClearColor(0x000000, 0)
  // Por encima de 2 el coste crece mucho más que la calidad percibida.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  return renderer
}

/**
 * Bucle de animación compartido: se detiene solo cuando la pestaña se oculta
 * o cuando el elemento sale de pantalla, para no gastar batería en balde.
 */
function makeLoop(
  renderer: THREE.WebGLRenderer,
  render: (elapsed: number, delta: number) => void,
) {
  const clock = new THREE.Clock()
  let paused = false
  let frame = 0

  const tick = () => {
    frame = requestAnimationFrame(tick)
    if (paused) return
    // El orden importa: `getDelta` es quien avanza `elapsedTime`, así que
    // pedir primero el tiempo transcurrido dejaría el delta siempre a cero.
    const delta = Math.min(clock.getDelta(), 0.05)
    render(clock.elapsedTime, delta)
  }

  const onVisibility = () => {
    if (document.hidden) clock.stop()
    else clock.start()
  }

  document.addEventListener('visibilitychange', onVisibility)
  frame = requestAnimationFrame(tick)

  return {
    setPaused(value: boolean) {
      paused = value
      if (value) clock.stop()
      else clock.start()
    },
    stop() {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibility)
      renderer.dispose()
    },
  }
}

/** Ajusta cámara y buffer al tamaño real del contenedor. */
function attachResize(
  canvas: HTMLCanvasElement,
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
) {
  const apply = () => {
    const parent = canvas.parentElement
    if (!parent) return
    const { clientWidth: w, clientHeight: h } = parent
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  apply()
  const observer = new ResizeObserver(apply)
  if (canvas.parentElement) observer.observe(canvas.parentElement)
  return () => observer.disconnect()
}

/** Puntero normalizado (-1..1) con suavizado, para el paralaje del cursor. */
function attachPointer() {
  const target = { x: 0, y: 0 }
  const current = { x: 0, y: 0 }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    target.x = (e.clientX / window.innerWidth) * 2 - 1
    target.y = (e.clientY / window.innerHeight) * 2 - 1
  }

  window.addEventListener('pointermove', onMove, { passive: true })

  return {
    update(damping = 0.05) {
      current.x += (target.x - current.x) * damping
      current.y += (target.y - current.y) * damping
      return current
    },
    dispose() {
      window.removeEventListener('pointermove', onMove)
    },
  }
}

/**
 * Núcleo neuronal del hero: una esfera de puntos conectados entre sí,
 * envolviendo una estructura geométrica dorada.
 */
export function createNeuralCore({ canvas, quality = 'high' }: Options): SceneHandle {
  const renderer = makeRenderer(canvas)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(0, 0, 7.4)

  const group = new THREE.Group()
  scene.add(group)

  // — Estructura interior: icosaedro en alambre.
  const shellGeom = new THREE.IcosahedronGeometry(1.75, 1)
  const shell = new THREE.LineSegments(
    new THREE.WireframeGeometry(shellGeom),
    new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.32 }),
  )
  group.add(shell)

  // — Corazón: esfera translúcida que respira.
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.62, 2),
    new THREE.MeshBasicMaterial({ color: GOLD_BRIGHT, transparent: true, opacity: 0.14 }),
  )
  group.add(core)

  // — Nube de nodos distribuida sobre una esfera.
  const count = quality === 'high' ? 220 : 90
  const radius = 2.9
  const positions = new Float32Array(count * 3)
  const nodes: THREE.Vector3[] = []

  for (let i = 0; i < count; i++) {
    // Distribución de Fibonacci: reparte los puntos sin agrupamientos en los polos.
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = i * Math.PI * (3 - Math.sqrt(5))
    // Un poco de irregularidad para que no parezca una malla perfecta.
    const jitter = 0.88 + Math.random() * 0.24
    const v = new THREE.Vector3(
      Math.cos(theta) * r * radius * jitter,
      y * radius * jitter,
      Math.sin(theta) * r * radius * jitter,
    )
    nodes.push(v)
    v.toArray(positions, i * 3)
  }

  const nodeGeom = new THREE.BufferGeometry()
  nodeGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const points = new THREE.Points(
    nodeGeom,
    new THREE.PointsMaterial({
      color: GOLD_BRIGHT,
      size: 0.035,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    }),
  )
  group.add(points)

  // — Conexiones entre nodos cercanos: la parte que hace que parezca una red.
  const linkPositions: number[] = []
  const maxDist = quality === 'high' ? 1.15 : 1.0
  const maxLinks = quality === 'high' ? 340 : 130
  outer: for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].distanceTo(nodes[j]) > maxDist) continue
      linkPositions.push(...nodes[i].toArray(), ...nodes[j].toArray())
      if (linkPositions.length / 6 >= maxLinks) break outer
    }
  }

  const linkGeom = new THREE.BufferGeometry()
  linkGeom.setAttribute('position', new THREE.Float32BufferAttribute(linkPositions, 3))
  const links = new THREE.LineSegments(
    linkGeom,
    new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.16 }),
  )
  group.add(links)

  const pointer = attachPointer()
  const detachResize = attachResize(canvas, renderer, camera)

  // Entrada suave: la escena aparece en lugar de encenderse de golpe.
  let intro = 0

  const loop = makeLoop(renderer, (elapsed, delta) => {
    intro = Math.min(1, intro + delta * 0.8)
    const eased = 1 - Math.pow(1 - intro, 3)

    group.rotation.y = elapsed * 0.075
    group.rotation.x = Math.sin(elapsed * 0.22) * 0.12

    const p = pointer.update()
    group.rotation.y += p.x * 0.22
    group.rotation.x += p.y * 0.14

    const breathe = 1 + Math.sin(elapsed * 0.9) * 0.045
    core.scale.setScalar(breathe * eased)
    group.scale.setScalar(0.9 + eased * 0.1)

    shell.material.opacity = 0.32 * eased
    points.material.opacity = 0.85 * eased
    links.material.opacity = 0.16 * eased
    core.material.opacity = 0.14 * eased

    renderer.render(scene, camera)
  })

  return {
    setPaused: loop.setPaused,
    dispose() {
      loop.stop()
      detachResize()
      pointer.dispose()
      shellGeom.dispose()
      shell.geometry.dispose()
      shell.material.dispose()
      core.geometry.dispose()
      core.material.dispose()
      nodeGeom.dispose()
      points.material.dispose()
      linkGeom.dispose()
      links.material.dispose()
    },
  }
}

/**
 * «Las grietas de la IA»: una estructura que parece sólida y perfecta,
 * recorrida por fracturas luminosas que laten muy lentamente.
 */
export function createCrackedCore({ canvas, quality = 'high' }: Options): SceneHandle {
  const renderer = makeRenderer(canvas)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 0, 6.2)

  const group = new THREE.Group()
  scene.add(group)

  // — El bloque: casi negro, apenas se distingue del fondo. Es intencionado.
  const solidGeom = new THREE.IcosahedronGeometry(1.9, quality === 'high' ? 1 : 0)
  const solid = new THREE.Mesh(
    solidGeom,
    new THREE.MeshBasicMaterial({ color: 0x0d0d10, transparent: true, opacity: 0.96 }),
  )
  group.add(solid)

  // — Aristas tenues: dan volumen sin iluminar la escena.
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(solidGeom),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07 }),
  )
  group.add(edges)

  // — Las grietas: recorridos irregulares sobre la superficie, en dorado.
  const crackCount = quality === 'high' ? 7 : 4
  const cracks: THREE.Line[] = []

  for (let c = 0; c < crackCount; c++) {
    const pts: THREE.Vector3[] = []
    // Punto de partida aleatorio en la esfera y avance con desvíos.
    const start = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
    ).normalize()
    let dir = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
    )
      .cross(start)
      .normalize()

    let current = start.clone()
    const segments = 16
    for (let s = 0; s <= segments; s++) {
      pts.push(current.clone().multiplyScalar(1.93))
      dir
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.55,
            (Math.random() - 0.5) * 0.55,
            (Math.random() - 0.5) * 0.55,
          ),
        )
        .normalize()
      current = current.clone().add(dir.clone().multiplyScalar(0.16)).normalize()
    }

    const geom = new THREE.BufferGeometry().setFromPoints(pts)
    const line = new THREE.Line(
      geom,
      new THREE.LineBasicMaterial({ color: GOLD_BRIGHT, transparent: true, opacity: 0.6 }),
    )
    // Cada grieta late a su propio ritmo.
    line.userData.phase = Math.random() * Math.PI * 2
    line.userData.speed = 0.35 + Math.random() * 0.5
    cracks.push(line)
    group.add(line)
  }

  const pointer = attachPointer()
  const detachResize = attachResize(canvas, renderer, camera)
  let intro = 0

  const loop = makeLoop(renderer, (elapsed, delta) => {
    intro = Math.min(1, intro + delta * 0.7)
    const eased = 1 - Math.pow(1 - intro, 3)

    group.rotation.y = elapsed * 0.055
    group.rotation.x = Math.sin(elapsed * 0.17) * 0.1

    const p = pointer.update(0.04)
    group.rotation.y += p.x * 0.3
    group.rotation.x += p.y * 0.18

    for (const line of cracks) {
      const { phase, speed } = line.userData as { phase: number; speed: number }
      const pulse = 0.28 + (Math.sin(elapsed * speed + phase) * 0.5 + 0.5) * 0.62
      ;(line.material as THREE.LineBasicMaterial).opacity = pulse * eased
    }

    group.scale.setScalar(0.92 + eased * 0.08)
    renderer.render(scene, camera)
  })

  return {
    setPaused: loop.setPaused,
    dispose() {
      loop.stop()
      detachResize()
      pointer.dispose()
      solidGeom.dispose()
      solid.material.dispose()
      edges.geometry.dispose()
      edges.material.dispose()
      for (const line of cracks) {
        line.geometry.dispose()
        ;(line.material as THREE.Material).dispose()
      }
    },
  }
}

export const sceneFactories = {
  core: createNeuralCore,
  cracks: createCrackedCore,
}

export type SceneKind = keyof typeof sceneFactories
