'use client';

import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Grid, OrbitControls, useGLTF } from '@react-three/drei';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { minutes } from '@/lib/format';
import type { ViewerNode } from '@/lib/types';

/**
 * Explorador 3D. Porta el comportamiento del prototipo:
 *
 *  - despiece continuo por slider, con lerp 0.14 hacia el objetivo
 *  - umbral de 6 px para distinguir clic de arrastre
 *  - aislar componente y filtrar por sistema, atenuando el resto al 24 %
 *  - vectores de despiece leídos de `model_node`, NO del GLB: se ajustan
 *    sin reexportar 40 MB
 *  - mapeo por `node_uuid` de extras, nunca por nombre de nodo
 */

const LERP = 0.14;
const DIM_OPACITY = 0.24;
const DRAG_THRESHOLD_PX = 6;

type Props = {
  url: string;
  nodes: ViewerNode[];
  vehicleSlug: string;
  upAxis: string;
};

export function Viewer3D({ url, nodes, vehicleSlug, upAxis }: Props) {
  const [explode, setExplode] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isolate, setIsolate] = useState(false);
  const [systems, setSystems] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [unmatched, setUnmatched] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  const byUuid = useMemo(() => new Map(nodes.map((n) => [n.node_uuid, n])), [nodes]);

  const systemList = useMemo(() => {
    const map = new Map<string, { code: string; name: string; count: number }>();
    for (const n of nodes) {
      const code = n.component?.system_code ?? n.explode_group ?? '—';
      const name = n.component?.system_name ?? 'Sin componente asignado';
      const entry = map.get(code) ?? { code, name, count: 0 };
      entry.count += 1;
      map.set(code, entry);
    }
    return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
  }, [nodes]);

  const selectedNode = selected ? nodes.find((n) => n.component?.code === selected) ?? null : null;
  const noVectors = nodes.every((n) => n.explode_x === 0 && n.explode_y === 0 && n.explode_z === 0);

  const visibleSystem = (n: ViewerNode) =>
    systems.size === 0 || systems.has(n.component?.system_code ?? n.explode_group ?? '—');

  const toggleSystem = (code: string) =>
    setSystems((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
      {/* ── Panel izquierdo: sistemas ── */}
      <aside className="panel h-fit p-3">
        <h2 className="label mb-2">Sistemas</h2>
        <ul className="space-y-1">
          {systemList.map((s) => {
            const on = systems.size === 0 || systems.has(s.code);
            return (
              <li key={s.code}>
                <button
                  onClick={() => toggleSystem(s.code)}
                  className={`flex w-full items-center justify-between border px-2 py-1.5 text-left font-mono text-[11px] transition-colors ${
                    on ? 'border-line-2 text-text' : 'border-line text-text-3'
                  }`}
                >
                  <span>
                    {s.code} · {s.name}
                  </span>
                  <span className="text-text-3">{s.count}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {systems.size > 0 && (
          <button onClick={() => setSystems(new Set())} className="btn mt-2 w-full justify-center">
            Ver todo
          </button>
        )}
      </aside>

      {/* ── Lienzo ── */}
      <div className="panel relative aspect-[4/3] min-h-[420px] overflow-hidden lg:aspect-auto lg:h-[70vh]">
        {mounted ? (
          <Canvas
            camera={{ position: [1.6, 1.1, 1.8], fov: 42, near: 0.01, far: 100 }}
            dpr={[1, 2]}
            gl={{ antialias: true }}
          >
            <Suspense fallback={null}>
              <color attach="background" args={['#0b0d10']} />
              <hemisphereLight intensity={0.45} groundColor="#14171b" />
              <directionalLight position={[3, 5, 2]} intensity={1.1} />
              <directionalLight position={[-3, 2, -2]} intensity={0.35} />
              <Grid
                args={[10, 10]}
                cellSize={0.1}
                cellColor="#2a3038"
                sectionSize={1}
                sectionColor="#333a42"
                fadeDistance={14}
                infiniteGrid
                position={[0, -0.001, 0]}
              />
              <Model
                url={url}
                byUuid={byUuid}
                explode={explode}
                selected={selected}
                isolate={isolate}
                visibleSystem={visibleSystem}
                onPick={setSelected}
                onUnmatched={setUnmatched}
                upAxis={upAxis}
              />
              <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.08}
                minDistance={0.3}
                maxDistance={20}
                target={[0, 0.3, 0]}
              />
            </Suspense>
          </Canvas>
        ) : (
          <div className="grid h-full place-items-center font-mono text-[11px] text-text-3">Cargando visor…</div>
        )}

        {/* Controles superpuestos */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
          <div className="pointer-events-auto border border-line bg-surface/95 px-3 py-2 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="label whitespace-nowrap">Despiece</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={explode}
                onChange={(e) => setExplode(Number(e.target.value))}
                className="h-1 w-full accent-accent"
                aria-label="Nivel de despiece"
              />
              <span className="w-10 text-right font-mono text-[11px] text-text-2">
                {Math.round(explode * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="absolute right-3 top-3 flex gap-2">
          <button
            onClick={() => setIsolate((v) => !v)}
            disabled={!selected}
            className={`btn ${isolate ? 'btn-accent' : ''}`}
          >
            Aislar
          </button>
          <button onClick={() => { setSelected(null); setIsolate(false); }} className="btn" disabled={!selected}>
            Limpiar
          </button>
        </div>
      </div>

      {/* ── Panel derecho: componente seleccionado ── */}
      <aside className="panel h-fit p-4">
        {selectedNode?.component ? (
          <>
            <span className="font-mono text-[11px] text-accent">{selectedNode.component.code}</span>
            <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">{selectedNode.component.name}</h2>
            <p className="mt-0.5 font-mono text-[11px] text-text-3">
              {selectedNode.component.system_name} › {selectedNode.component.subsystem_name}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-px bg-line">
              <div className="bg-surface px-2 py-2">
                <dt className="label">Dificultad</dt>
                <dd className="font-mono text-[12px]">
                  {selectedNode.component.difficulty ? `${selectedNode.component.difficulty}/5` : '—'}
                </dd>
              </div>
              <div className="bg-surface px-2 py-2">
                <dt className="label">Tiempo</dt>
                <dd className="font-mono text-[12px]">{minutes(selectedNode.component.est_time_min)}</dd>
              </div>
            </dl>
            <p className="mt-3 font-mono text-[10px] text-text-3">nodo {selectedNode.node_path}</p>
            <Link
              href={`/vehiculo/${vehicleSlug}?c=${encodeURIComponent(selectedNode.component.code)}`}
              className="btn mt-4 w-full justify-center"
            >
              Ficha completa
            </Link>
          </>
        ) : (
          <>
            <h2 className="label">Componente</h2>
            <p className="mt-2 text-sm text-text-2">
              Haz clic en una pieza del modelo. Arrastrar orbita la cámara; la rueda o el pinch acercan.
            </p>
          </>
        )}

        <div className="mt-5 space-y-2 border-t border-line pt-4 font-mono text-[10px] leading-relaxed text-text-3">
          <p>
            {nodes.length} nodos mapeados
            {unmatched != null && unmatched > 0 && ` · ${unmatched} mallas del GLB sin fila en model_node`}
          </p>
          {noVectors && (
            <p className="text-text-2">
              Sin vectores de despiece configurados: se aplica un despiece radial automático desde el centro del
              conjunto. Los vectores definitivos se editan en Admin › Modelos.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

// ------------------------------------------------------------------
// Escena
// ------------------------------------------------------------------

type ModelProps = {
  url: string;
  byUuid: Map<string, ViewerNode>;
  explode: number;
  selected: string | null;
  isolate: boolean;
  visibleSystem: (n: ViewerNode) => boolean;
  onPick: (code: string | null) => void;
  onUnmatched: (n: number) => void;
  upAxis: string;
};

type Tracked = {
  mesh: THREE.Mesh;
  node: ViewerNode;
  base: THREE.Vector3;
  target: THREE.Vector3;
  material: THREE.Material & { opacity: number; transparent: boolean };
};

function Model({
  url,
  byUuid,
  explode,
  selected,
  isolate,
  visibleSystem,
  onPick,
  onUnmatched,
  upAxis,
}: ModelProps) {
  const { scene } = useGLTF(url);
  const { gl } = useThree();
  const down = useRef<{ x: number; y: number } | null>(null);

  // Clonar: `useGLTF` cachea la escena y no se debe mutar el original.
  const root = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((m) => m.clone())
          : mesh.material.clone();
      }
    });
    return copy;
  }, [scene]);

  const tracked = useMemo<Tracked[]>(() => {
    const list: Tracked[] = [];
    let unmatched = 0;

    // Centro del conjunto: base del despiece radial cuando no hay vectores.
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());

    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;

      // Mapeo por node_uuid de extras (userData en three). El nombre es fallback.
      const uuid = typeof mesh.userData?.node_uuid === 'string' ? mesh.userData.node_uuid : null;
      const node =
        (uuid ? byUuid.get(uuid) : undefined) ??
        [...byUuid.values()].find((n) => n.node_path.endsWith(mesh.name));

      if (!node) {
        unmatched += 1;
        return;
      }

      const base = mesh.position.clone();
      let target = new THREE.Vector3(node.explode_x, node.explode_y, node.explode_z);
      if (target.lengthSq() === 0) {
        // Radial desde el centro, como el prototipo. 0,35 m de recorrido.
        const world = mesh.getWorldPosition(new THREE.Vector3());
        target = world.sub(center);
        if (upAxis.toUpperCase() === 'Y') target.y *= 0.6; // menos vertical: se lee mejor
        target.normalize().multiplyScalar(0.35);
      }

      const material = mesh.material as Tracked['material'];
      material.transparent = true;
      list.push({ mesh, node, base, target, material });
    });

    onUnmatched(unmatched);
    return list;
  }, [root, byUuid, onUnmatched, upAxis]);

  // Visibilidad y atenuación: no toca la geometría, solo material y visible.
  useEffect(() => {
    for (const t of tracked) {
      const isSelected = selected != null && t.node.component?.code === selected;
      const inFilter = visibleSystem(t.node);
      t.mesh.visible = isolate && selected != null ? isSelected : inFilter;
      const dim = selected != null && !isSelected;
      t.material.opacity = !inFilter || dim ? DIM_OPACITY : 1;
      t.material.depthWrite = t.material.opacity === 1;
    }
  }, [tracked, selected, isolate, visibleSystem]);

  const position = useRef(new THREE.Vector3());

  useFrame(() => {
    for (const t of tracked) {
      position.current.copy(t.base).addScaledVector(t.target, explode);
      t.mesh.position.lerp(position.current, LERP);
    }
  });

  // Umbral de 6 px: arrastrar orbita, no selecciona.
  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      down.current = { x: e.clientX, y: e.clientY };
    };
    el.addEventListener('pointerdown', onDown);
    return () => el.removeEventListener('pointerdown', onDown);
  }, [gl]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    const start = down.current;
    if (start) {
      const dx = e.nativeEvent.clientX - start.x;
      const dy = e.nativeEvent.clientY - start.y;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) return;
    }
    e.stopPropagation();

    let object: THREE.Object3D | null = e.object;
    while (object) {
      const hit = tracked.find((t) => t.mesh === object);
      if (hit) {
        if (!hit.node.selectable) return;
        onPick(hit.node.component?.code ?? null);
        return;
      }
      object = object.parent;
    }
  };

  return (
    <primitive
      object={root}
      onClick={handleClick}
      onPointerMissed={() => onPick(null)}
    />
  );
}
