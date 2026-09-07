import * as THREE from 'three'

/**
 * Mundo WebGL del "viaje" cinematográfico de la Home (Intro → Servicios).
 *
 * Hermana de `scenes.ts`: mismas convenciones (renderer de bajo consumo, DPR
 * acotado a 2, bucle con reloj propio, limpieza completa en `dispose`), pero
 * en vez de 6 escenas WebGL independientes hay UN solo grupo de objetos que
 * se transforma con el scroll — así el "mundo" se siente continuo en vez de
 * reiniciarse en cada sección. Reutiliza el lenguaje visual que ya existe en
 * `scenes.ts`: el núcleo neuronal (`createNeuralCore`) y las grietas
 * (`createCrackedCore`), mezclados según el progreso del scroll en vez de
 * vivir en escenas separadas.
 */

export type JourneyWorldHandle = {
  dispose: () => void
  setPaused: (paused: boolean) => void
  /** Progreso 0..1 a lo largo de las 6 escenas del viaje. */
  setProgress: (progress: number) => void
}

type Options = {
  canvas: HTMLCanvasElement
  quality?: 'high' | 'low'
  sceneCount: number
}

const GOLD = 0xd4af37
const GOLD_BRIGHT = 0xf0d680

function makeRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: window.devicePixelRatio < 2,
    powerPreference: 'low-power',
  })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  return renderer
}

function makeLoop(renderer: THREE.WebGLRenderer, render: (elapsed: number, delta: number) => void) {
  const clock = new THREE.Clock()
  let paused = false
  let frame = 0

  const tick = () => {
    frame = requestAnimationFrame(tick)
    if (paused) return
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

function attachResize(canvas: HTMLCanvasElement, renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
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

/** Un punto del recorrido: cómo se ve y se mueve el mundo en esa escena. */
type Keyframe = {
  cameraZ: number
  rotSpeed: number
  linkOpacity: number
  pointOpacity: number
  crackMix: number
  scale: number
}

/**
 * Intro → Problema → Quiénes somos → Ventaja (transformación) → Productos →
 * Servicios. La red se dispersa en "Problema", se recompone en "Quiénes
 * somos", se agrieta/transforma en "Ventaja" (la "escena IA" del brief es
 * este tránsito, no una parada propia), se aleja para el "showcase" de
 * Productos y vuelve a una red densa y cercana en Servicios.
 */
const KEYFRAMES: Keyframe[] = [
  { cameraZ: 7.4, rotSpeed: 1.0, linkOpacity: 1.0, pointOpacity: 1.0, crackMix: 0.0, scale: 1.0 },
  { cameraZ: 8.6, rotSpeed: 1.3, linkOpacity: 0.32, pointOpacity: 1.0, crackMix: 0.08, scale: 0.96 },
  { cameraZ: 6.3, rotSpeed: 0.7, linkOpacity: 1.0, pointOpacity: 1.0, crackMix: 0.0, scale: 1.03 },
  { cameraZ: 5.2, rotSpeed: 0.5, linkOpacity: 0.55, pointOpacity: 0.75, crackMix: 1.0, scale: 1.1 },
  { cameraZ: 9.7, rotSpeed: 0.3, linkOpacity: 0.7, pointOpacity: 0.85, crackMix: 0.32, scale: 0.9 },
  { cameraZ: 7.0, rotSpeed: 1.15, linkOpacity: 1.0, pointOpacity: 1.0, crackMix: 0.1, scale: 1.0 },
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function sampleKeyframes(progress: number, count: number): Keyframe {
  const p = Math.min(Math.max(progress, 0), 1)
  const idx = p * (count - 1)
  const i0 = Math.floor(idx)
  const i1 = Math.min(i0 + 1, count - 1)
  const t = idx - i0
  const a = KEYFRAMES[Math.min(i0, KEYFRAMES.length - 1)]
  const b = KEYFRAMES[Math.min(i1, KEYFRAMES.length - 1)]
  return {
    cameraZ: lerp(a.cameraZ, b.cameraZ, t),
    rotSpeed: lerp(a.rotSpeed, b.rotSpeed, t),
    linkOpacity: lerp(a.linkOpacity, b.linkOpacity, t),
    pointOpacity: lerp(a.pointOpacity, b.pointOpacity, t),
    crackMix: lerp(a.crackMix, b.crackMix, t),
    scale: lerp(a.scale, b.scale, t),
  }
}

export function createJourneyWorld({ canvas, quality = 'high', sceneCount }: Options): JourneyWorldHandle {
  const renderer = makeRenderer(canvas)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(0, 0, 7.4)

  const group = new THREE.Group()
  scene.add(group)

  const shellGeom = new THREE.IcosahedronGeometry(1.75, 1)
  const shell = new THREE.LineSegments(
    new THREE.WireframeGeometry(shellGeom),
    new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.32 }),
  )
  group.add(shell)

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.62, 2),
    new THREE.MeshBasicMaterial({ color: GOLD_BRIGHT, transparent: true, opacity: 0.14 }),
  )
  group.add(core)

  const count = quality === 'high' ? 220 : 90
  const radius = 2.9
  const positions = new Float32Array(count * 3)
  const nodes: THREE.Vector3[] = []

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = i * Math.PI * (3 - Math.sqrt(5))
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
    new THREE.PointsMaterial({ color: GOLD_BRIGHT, size: 0.035, transparent: true, opacity: 0.85, sizeAttenuation: true }),
  )
  group.add(points)

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
  const links = new THREE.LineSegments(linkGeom, new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.16 }))
  group.add(links)

  // Grietas: mismo lenguaje que `createCrackedCore`, en el mismo grupo que el
  // núcleo — así "transformarse" es solo subir su opacidad, no cambiar de escena.
  const crackCount = quality === 'high' ? 6 : 3
  const cracks: THREE.Line[] = []
  for (let c = 0; c < crackCount; c++) {
    const pts: THREE.Vector3[] = []
    const start = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize()
    let dir = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).cross(start).normalize()
    let current = start.clone()
    const segments = 14
    for (let s = 0; s <= segments; s++) {
      pts.push(current.clone().multiplyScalar(1.8))
      dir.add(new THREE.Vector3((Math.random() - 0.5) * 0.55, (Math.random() - 0.5) * 0.55, (Math.random() - 0.5) * 0.55)).normalize()
      current = current.clone().add(dir.clone().multiplyScalar(0.16)).normalize()
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts)
    const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: GOLD_BRIGHT, transparent: true, opacity: 0 }))
    line.userData.phase = Math.random() * Math.PI * 2
    line.userData.speed = 0.35 + Math.random() * 0.5
    cracks.push(line)
    group.add(line)
  }

  const pointer = attachPointer()
  const detachResize = attachResize(canvas, renderer, camera)

  let intro = 0
  let scrollProgress = 0
  const currentKf: Keyframe = { ...KEYFRAMES[0] }

  const loop = makeLoop(renderer, (elapsed, delta) => {
    intro = Math.min(1, intro + delta * 0.8)
    const eased = 1 - Math.pow(1 - intro, 3)

    const targetKf = sampleKeyframes(scrollProgress, sceneCount)
    const damp = 1 - Math.pow(1 - 0.09, delta * 60)
    currentKf.cameraZ = lerp(currentKf.cameraZ, targetKf.cameraZ, damp)
    currentKf.rotSpeed = lerp(currentKf.rotSpeed, targetKf.rotSpeed, damp)
    currentKf.linkOpacity = lerp(currentKf.linkOpacity, targetKf.linkOpacity, damp)
    currentKf.pointOpacity = lerp(currentKf.pointOpacity, targetKf.pointOpacity, damp)
    currentKf.crackMix = lerp(currentKf.crackMix, targetKf.crackMix, damp)
    currentKf.scale = lerp(currentKf.scale, targetKf.scale, damp)

    camera.position.z = currentKf.cameraZ

    group.rotation.y = elapsed * 0.075 * currentKf.rotSpeed
    group.rotation.x = Math.sin(elapsed * 0.22) * 0.12

    const p = pointer.update()
    group.rotation.y += p.x * 0.22
    group.rotation.x += p.y * 0.14

    const breathe = 1 + Math.sin(elapsed * 0.9) * 0.045
    core.scale.setScalar(breathe * eased)
    group.scale.setScalar((0.9 + eased * 0.1) * currentKf.scale)

    shell.material.opacity = 0.32 * eased
    points.material.opacity = 0.85 * eased * currentKf.pointOpacity
    links.material.opacity = 0.16 * eased * currentKf.linkOpacity
    core.material.opacity = 0.14 * eased

    for (const line of cracks) {
      const { phase, speed } = line.userData as { phase: number; speed: number }
      const pulse = 0.28 + (Math.sin(elapsed * speed + phase) * 0.5 + 0.5) * 0.62
      ;(line.material as THREE.LineBasicMaterial).opacity = pulse * eased * currentKf.crackMix
    }

    renderer.render(scene, camera)
  })

  return {
    setPaused: loop.setPaused,
    setProgress(progress: number) {
      scrollProgress = progress
    },
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
      for (const line of cracks) {
        line.geometry.dispose()
        ;(line.material as THREE.Material).dispose()
      }
    },
  }
}
