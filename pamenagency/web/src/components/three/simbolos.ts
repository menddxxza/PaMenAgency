import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/**
 * Símbolos tridimensionales de los servicios.
 *
 * Un único renderizador WebGL, fuera de pantalla, dibuja todos los símbolos
 * y copia cada fotograma al canvas 2D de su tarjeta. Así hay un solo contexto
 * WebGL aunque haya varias tarjetas, y sólo se trabaja para las que están en
 * pantalla. Se carga de forma diferida, como el resto de escenas.
 *
 * Materiales comunes a todos: oro cepillado, oro pulido, cromo, cristal y un
 * negro burdeos lacado, con iluminación de estudio y reflejos de entorno.
 */

export type SimboloKind = 'engranajes' | 'documentos' | 'nucleo' | 'modulos' | 'esfera' | 'bloques'

export type SimboloHandle = {
  setVisible: (v: boolean) => void
  setHover: (v: boolean) => void
  setPuntero: (x: number, y: number) => void
  dispose: () => void
}

type Instancia = {
  ctx: CanvasRenderingContext2D
  ancho: number
  alto: number
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  grupo: THREE.Group
  luzClave: THREE.DirectionalLight
  animar: (t: number) => void
  semilla: number
  visible: boolean
  hover: number
  hoverObjetivo: number
  px: number
  py: number
  rx: number
  ry: number
  sucio: boolean
}

type Motor = {
  renderer: THREE.WebGLRenderer
  entorno: THREE.Texture
  mat: Record<'oro' | 'oroPulido' | 'cromo' | 'cristal' | 'burdeos' | 'luz', THREE.Material>
  instancias: Set<Instancia>
  frame: number
  reloj: THREE.Clock
  estatico: boolean
}

let motor: Motor | null = null
const TAM = 224 // lado interno del renderizador (los símbolos se ven a ~96-112 px con DPR 2)

function crearMotor(estatico: boolean): Motor {
  const canvas = document.createElement('canvas')
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: true })
  renderer.setPixelRatio(1)
  renderer.setSize(TAM, TAM, false)
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95
  const pmrem = new THREE.PMREMGenerator(renderer)
  const entorno = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()

  const mat = {
    oro: new THREE.MeshPhysicalMaterial({ color: 0xb4823f, metalness: 1, roughness: 0.38, anisotropy: 0.8, anisotropyRotation: Math.PI / 2, clearcoat: 0.2, clearcoatRoughness: 0.4 }),
    oroPulido: new THREE.MeshPhysicalMaterial({ color: 0xc89a55, metalness: 1, roughness: 0.16, clearcoat: 0.6, clearcoatRoughness: 0.15 }),
    cromo: new THREE.MeshPhysicalMaterial({ color: 0xe9e1d6, metalness: 1, roughness: 0.1 }),
    cristal: new THREE.MeshPhysicalMaterial({ color: 0xf6ead6, metalness: 0, roughness: 0.06, transmission: 1, thickness: 0.5, ior: 1.45, transparent: true, opacity: 0.95, attenuationColor: new THREE.Color(0xe8cb94), attenuationDistance: 1.6 }),
    burdeos: new THREE.MeshPhysicalMaterial({ color: 0x3a1113, metalness: 0.35, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.4, sheenColor: new THREE.Color(0x8e2c27) }),
    luz: new THREE.MeshStandardMaterial({ color: 0xe8cb94, emissive: 0xe8cb94, emissiveIntensity: 1.3, roughness: 0.4 }),
  }
  return { renderer, entorno, mat, instancias: new Set(), frame: 0, reloj: new THREE.Clock(), estatico }
}

/* ---------- Geometrías ---------- */

function engranaje(dientes: number, rExt: number, rInt: number, grosor: number, agujero: number) {
  const s = new THREE.Shape()
  const paso = (Math.PI * 2) / dientes
  for (let i = 0; i < dientes; i++) {
    const a = i * paso
    const p = [
      [rInt, a], [rExt, a + paso * 0.18], [rExt, a + paso * 0.42], [rInt, a + paso * 0.6],
    ]
    p.forEach(([r, ang], k) => {
      const x = Math.cos(ang) * r, y = Math.sin(ang) * r
      if (i === 0 && k === 0) s.moveTo(x, y)
      else s.lineTo(x, y)
    })
    s.absarc(0, 0, rInt, a + paso * 0.6, a + paso, false)
  }
  const h = new THREE.Path()
  h.absarc(0, 0, agujero, 0, Math.PI * 2, true)
  s.holes.push(h)
  const g = new THREE.ExtrudeGeometry(s, { depth: grosor, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 3, curveSegments: 6 })
  g.center()
  return g
}

/* ---------- Escenas de cada símbolo ---------- */

type Construido = { grupo: THREE.Group; animar: (t: number) => void }

function construir(kind: SimboloKind, m: Motor['mat']): Construido {
  const g = new THREE.Group()
  let animar: (t: number) => void = () => {}

  if (kind === 'engranajes') {
    // Automatización: un engranaje de oro cepillado que mueve otro de cromo.
    const a = new THREE.Mesh(engranaje(12, 0.62, 0.5, 0.18, 0.16), m.oro)
    const b = new THREE.Mesh(engranaje(8, 0.42, 0.32, 0.16, 0.1), m.cromo)
    a.position.set(-0.24, 0.12, 0)
    b.position.set(0.5, -0.36, 0.06)
    const eje = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 32), m.cristal)
    eje.rotation.x = Math.PI / 2
    eje.position.copy(a.position)
    g.add(a, b, eje)
    animar = (t) => { a.rotation.z = t * 0.35; b.rotation.z = -t * 0.35 * (12 / 8) + 0.2 }
  }

  if (kind === 'documentos') {
    // Documentos: láminas de cristal sobre una base burdeos y una barra de luz que las lee.
    const base = new THREE.Mesh(new RoundedBoxGeometry(0.9, 1.15, 0.06, 4, 0.05), m.burdeos)
    base.position.set(-0.12, -0.08, -0.22)
    g.add(base)
    const laminas = [0, 1, 2].map((i) => {
      const l = new THREE.Mesh(new RoundedBoxGeometry(0.9, 1.15, 0.035, 4, 0.04), m.cristal)
      l.position.set(-0.04 + i * 0.1, -0.02 + i * 0.07, -0.08 + i * 0.13)
      g.add(l)
      return l
    })
    const filo = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.04, 0.04, 2, 0.015), m.oroPulido)
    filo.position.set(0.16, 0.6, 0.3)
    const barra = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.025, 0.02), m.luz)
    g.add(filo, barra)
    animar = (t) => {
      barra.position.set(0.16, 0.5 - ((t * 0.18) % 1) * 1.05, 0.33)
      laminas.forEach((l, i) => { l.position.z = -0.08 + i * 0.13 + Math.sin(t * 0.8 + i) * 0.01 })
    }
  }

  if (kind === 'nucleo') {
    // Asistente: núcleo lacado con pequeñas piezas orbitando en anillos de oro.
    const nucleo = new THREE.Mesh(new THREE.SphereGeometry(0.4, 48, 32), m.burdeos)
    const brillo = new THREE.Mesh(new THREE.SphereGeometry(0.46, 48, 32), m.cristal)
    g.add(nucleo, brillo)
    const orbitas = [0.72, 0.62].map((r, i) => {
      const anillo = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 12, 96), m.oro)
      const piv = new THREE.Group()
      piv.rotation.set(i ? 1.1 : 1.45, i ? 0.5 : -0.3, 0)
      const pieza = new THREE.Mesh(new THREE.SphereGeometry(i ? 0.07 : 0.09, 24, 16), i ? m.cromo : m.oroPulido)
      piv.add(anillo, pieza)
      g.add(piv)
      return { piv, pieza, r }
    })
    animar = (t) => orbitas.forEach((o, i) => {
      const a = t * (i ? -0.7 : 0.5) + i * 2
      o.pieza.position.set(Math.cos(a) * o.r, Math.sin(a) * o.r, 0)
    })
  }

  if (kind === 'modulos') {
    // Integración: tres módulos conectados por enlaces de luz, con pulsos que viajan.
    const pos = [new THREE.Vector3(-0.52, 0.32, 0), new THREE.Vector3(0.5, 0.36, -0.1), new THREE.Vector3(0, -0.5, 0.12)]
    const mats = [m.cromo, m.burdeos, m.oro]
    pos.forEach((p, i) => {
      const c = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.36, 0.36, 4, 0.07), mats[i])
      c.position.copy(p)
      c.rotation.set(0.4, 0.6 + i, 0)
      g.add(c)
    })
    const enlaces = [[0, 1], [1, 2], [2, 0]].map(([a, b]) => {
      const pa = pos[a], pb = pos[b], largo = pa.distanceTo(pb)
      const tubo = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, largo, 12), m.oroPulido)
      tubo.position.copy(pa).add(pb).multiplyScalar(0.5)
      tubo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pb.clone().sub(pa).normalize())
      const pulso = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), m.luz)
      g.add(tubo, pulso)
      return { pa, pb, pulso }
    })
    animar = (t) => enlaces.forEach((e, i) => {
      const f = (t * 0.35 + i / 3) % 1
      e.pulso.position.lerpVectors(e.pa, e.pb, f)
    })
  }

  if (kind === 'esfera') {
    // Consultoría: estructura armilar equilibrada alrededor de un octaedro de cristal.
    const centro = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), m.cristal)
    const nucleo = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), m.oroPulido)
    g.add(centro, nucleo)
    const aros = [0, 1, 2].map((i) => {
      const aro = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.016, 12, 128), i === 1 ? m.cromo : m.oro)
      aro.rotation.set(Math.PI / 2, (i * Math.PI) / 3, 0)
      g.add(aro)
      return aro
    })
    animar = (t) => {
      centro.rotation.set(t * 0.3, t * 0.4, 0)
      nucleo.rotation.set(-t * 0.5, 0, t * 0.3)
      aros.forEach((a, i) => { a.rotation.z = t * 0.12 * (i % 2 ? -1 : 1) })
    }
  }

  if (kind === 'bloques') {
    // Formación: bloques que se ensamblan en escalones (cada uno sobre lo aprendido).
    const datos: [number, number, number, THREE.Material][] = [[-0.36, -0.36, 0.46, m.burdeos], [0.04, -0.12, 0.7, m.oro], [0.42, 0.12, 0.94, m.cristal]]
    const piezas = datos.map(([x, y, h, mat], i) => {
      const b = new THREE.Mesh(new RoundedBoxGeometry(0.34, h, 0.42, 4, 0.05), mat)
      b.position.set(x, y + (h - 0.46) / 2 - 0.1, 0)
      g.add(b)
      return { b, y: b.position.y, i }
    })
    const filo = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.03, 0.5, 2, 0.012), m.oroPulido)
    filo.position.set(0.03, -0.6, 0)
    g.add(filo)
    animar = (t) => piezas.forEach((p) => { p.b.position.y = p.y + Math.sin(t * 0.9 + p.i * 0.8) * 0.018 })
  }

  return { grupo: g, animar }
}

/* ---------- Bucle compartido ---------- */

function pintar(inst: Instancia, t: number, dt: number) {
  const M = motor!
  inst.hover += (inst.hoverObjetivo - inst.hover) * Math.min(1, dt * 6)
  inst.rx += (inst.py * 0.28 - inst.rx) * Math.min(1, dt * 4)
  inst.ry += (inst.px * 0.36 - inst.ry) * Math.min(1, dt * 4)
  const tt = t + inst.semilla * 10
  if (!M.estatico) inst.animar(tt)
  // Vaivén lento en vez de vuelta completa: las piezas planas nunca quedan de canto.
  inst.grupo.rotation.set(-0.18 + inst.rx, (M.estatico ? 0.5 : 0.4 + Math.sin(tt * 0.22) * 0.65) + inst.ry, 0.04)
  inst.grupo.position.y = M.estatico ? 0 : Math.sin(tt * 0.8) * 0.035
  const s = 1 + inst.hover * 0.05
  inst.grupo.scale.setScalar(s)
  inst.luzClave.intensity = 1.6 + inst.hover * 1.4
  inst.scene.environmentIntensity = 0.9 + inst.hover * 0.5
  M.renderer.render(inst.scene, inst.camera)
  inst.ctx.clearRect(0, 0, inst.ancho, inst.alto)
  inst.ctx.drawImage(M.renderer.domElement, 0, 0, inst.ancho, inst.alto)
  inst.sucio = false
}

function arrancar() {
  const M = motor!
  if (M.frame || M.estatico) return
  M.reloj.getDelta()
  const tick = () => {
    const dt = Math.min(M.reloj.getDelta(), 0.05)
    const t = M.reloj.elapsedTime
    let algunoVisible = false
    M.instancias.forEach((i) => {
      if (!i.visible) return
      algunoVisible = true
      pintar(i, t, dt)
    })
    M.frame = algunoVisible && !document.hidden ? requestAnimationFrame(tick) : 0
  }
  M.frame = requestAnimationFrame(tick)
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && motor) arrancar() })

/**
 * Monta un símbolo en `canvas` (2D). `estatico`: un único fotograma, sin animación
 * (movimiento reducido o equipos modestos). Devuelve el controlador.
 */
export function montarSimbolo(canvas: HTMLCanvasElement, kind: SimboloKind, opciones: { estatico: boolean }): SimboloHandle {
  if (!motor) motor = crearMotor(opciones.estatico)
  const M = motor
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Sin canvas 2D')

  const scene = new THREE.Scene()
  scene.environment = M.entorno
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20)
  camera.position.set(0, 0.15, 4.15)
  camera.lookAt(0, 0, 0)
  const luzClave = new THREE.DirectionalLight(0xfff0d8, 1.6)
  luzClave.position.set(-2, 3, 4)
  const contra = new THREE.DirectionalLight(0x9a3a30, 1.4) // reflejo burdeos por detrás
  contra.position.set(3, -1, -3)
  scene.add(luzClave, contra, new THREE.AmbientLight(0xffffff, 0.15))
  const { grupo, animar } = construir(kind, M.mat)
  scene.add(grupo)

  const inst: Instancia = {
    ctx, ancho: canvas.width, alto: canvas.height, scene, camera, grupo, luzClave, animar,
    semilla: Math.random(), visible: false, hover: 0, hoverObjetivo: 0, px: 0, py: 0, rx: 0, ry: 0, sucio: true,
  }
  M.instancias.add(inst)
  // Primer fotograma siempre, para que nunca se vea vacío.
  pintar(inst, 0, 0.016)

  return {
    setVisible(v) {
      inst.visible = v
      if (v) { if (M.estatico) pintar(inst, 0, 1); else arrancar() }
    },
    setHover(v) { inst.hoverObjetivo = v ? 1 : 0; if (M.estatico) { inst.hover = inst.hoverObjetivo; pintar(inst, 0, 1) } },
    setPuntero(x, y) { if (!M.estatico) { inst.px = x; inst.py = y } },
    dispose() {
      M.instancias.delete(inst)
      grupo.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose() })
    },
  }
}
