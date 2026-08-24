'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * El fondo persistente de todo el "viaje" por la web: una red de nodos y
 * conexiones en Three.js puro, cuya cámara avanza (dolly) según en qué
 * estación del recorrido está el usuario. Se monta UNA sola vez a nivel de
 * página (ver journey.tsx) — no hay un canvas por sección, es el mismo
 * mundo evolucionando mientras se hace scroll.
 */

const DESKTOP_NODE_COUNT = 420;
const MOBILE_NODE_COUNT = 130;
const CONNECT_DISTANCE = 2.4;
const MAX_CONNECTIONS_PER_NODE = 4;
const SIGNAL_COUNT_DESKTOP = 22;
const SIGNAL_COUNT_MOBILE = 7;
const GOLD = '#c9a24d';
const GOLD_BRIGHT = '#e8c988';

// Cámara: de dónde a dónde se mueve dentro de cada una de las 5 estaciones
// del recorrido (Hero, Cómo funciona, Calculadora, Agentes, Precios).
export const STAGE_CAMERA: Array<{ start: number; end: number }> = [
  { start: 14, end: 11 },
  { start: 11, end: 9 },
  { start: 9, end: 7.4 },
  { start: 7.4, end: 6.8 },
  { start: 6.8, end: 9.5 },
];

export interface JourneyState {
  index: number;
  t: number;
}

function isLowPower(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return (typeof cores === 'number' && cores <= 4) || (typeof mem === 'number' && mem <= 4);
}

function buildNodePositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const shellCount = 6;
  for (let i = 0; i < count; i++) {
    const shell = i % shellCount;
    const radius = 1.5 + shell * 0.78 + (Math.random() - 0.5) * 0.35;
    const tilt = (shell / shellCount) * Math.PI * 0.6 + (Math.random() - 0.5) * 0.3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(1 - 2 * Math.random()) * 0.55 + tilt;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi) * 0.72;
    const z = radius * Math.sin(phi) * Math.sin(theta);

    positions.set([x, y, z], i * 3);
  }
  return positions;
}

function buildConnections(positions: Float32Array, count: number): Float32Array {
  const segments: number[] = [];
  const connectionCounts = new Uint8Array(count);

  for (let i = 0; i < count; i++) {
    if (connectionCounts[i] >= MAX_CONNECTIONS_PER_NODE) continue;
    const ax = positions[i * 3];
    const ay = positions[i * 3 + 1];
    const az = positions[i * 3 + 2];

    let bestJ = -1;
    let bestDist = CONNECT_DISTANCE;
    for (let j = i + 1; j < count; j++) {
      if (connectionCounts[j] >= MAX_CONNECTIONS_PER_NODE) continue;
      const dx = ax - positions[j * 3];
      const dy = ay - positions[j * 3 + 1];
      const dz = az - positions[j * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < bestDist) {
        bestDist = dist;
        bestJ = j;
      }
    }
    if (bestJ !== -1) {
      segments.push(ax, ay, az, positions[bestJ * 3], positions[bestJ * 3 + 1], positions[bestJ * 3 + 2]);
      connectionCounts[i]++;
      connectionCounts[bestJ]++;
    }
  }
  return new Float32Array(segments);
}

function makeGlowTexture(hex: string): THREE.Texture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, `${hex}ff`);
  gradient.addColorStop(0.4, `${hex}88`);
  gradient.addColorStop(1, `${hex}00`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function SystemScene({
  className,
  journeyRef,
}: {
  className?: string;
  journeyRef: React.MutableRefObject<JourneyState>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = isLowPower() || window.innerWidth < 768;
    const nodeCount = lowPower ? MOBILE_NODE_COUNT : DESKTOP_NODE_COUNT;
    const signalCount = lowPower ? SIGNAL_COUNT_MOBILE : SIGNAL_COUNT_DESKTOP;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, STAGE_CAMERA[0].start);

    const renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: false });
    renderer.setClearColor(0x050505, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1 : 1.75));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const positions = buildNodePositions(nodeCount);

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const nodeMaterial = new THREE.PointsMaterial({
      size: 0.055,
      map: makeGlowTexture('#9a9690'),
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
    group.add(nodes);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(buildConnections(positions, nodeCount), 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x6a6560, transparent: true, opacity: 0.15 });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    group.add(lines);

    const hubCount = Math.min(28, Math.floor(nodeCount * 0.08));
    const hubIndices: number[] = [];
    for (let i = 0; i < hubCount; i++) {
      hubIndices.push(Math.floor((i / hubCount) * nodeCount));
    }
    const hubPositions = new Float32Array(hubIndices.length * 3);
    hubIndices.forEach((idx, i) => hubPositions.set(positions.slice(idx * 3, idx * 3 + 3), i * 3));
    const hubGeometry = new THREE.BufferGeometry();
    hubGeometry.setAttribute('position', new THREE.BufferAttribute(hubPositions, 3));
    const hubMaterial = new THREE.PointsMaterial({
      size: 0.095,
      map: makeGlowTexture(GOLD),
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const hubs = new THREE.Points(hubGeometry, hubMaterial);
    group.add(hubs);

    const lineSegmentCount = lineGeometry.getAttribute('position').count / 2;
    const signals = Array.from({ length: Math.min(signalCount, lineSegmentCount) }, () => ({
      segment: Math.floor(Math.random() * lineSegmentCount),
      t: Math.random(),
      speed: 0.12 + Math.random() * 0.18,
    }));
    const signalPositions = new Float32Array(signals.length * 3);
    const signalGeometry = new THREE.BufferGeometry();
    signalGeometry.setAttribute('position', new THREE.BufferAttribute(signalPositions, 3));
    const signalMaterial = new THREE.PointsMaterial({
      size: 0.085,
      map: makeGlowTexture(GOLD_BRIGHT),
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const signalPoints = new THREE.Points(signalGeometry, signalMaterial);
    if (!lowPower) group.add(signalPoints);

    const linePos = lineGeometry.getAttribute('position') as THREE.BufferAttribute;
    function updateSignals(delta: number) {
      for (let i = 0; i < signals.length; i++) {
        const s = signals[i];
        s.t += delta * s.speed;
        if (s.t > 1) {
          s.t = 0;
          s.segment = Math.floor(Math.random() * lineSegmentCount);
        }
        const a = s.segment * 2;
        const ax = linePos.getX(a);
        const ay = linePos.getY(a);
        const az = linePos.getZ(a);
        const bx = linePos.getX(a + 1);
        const by = linePos.getY(a + 1);
        const bz = linePos.getZ(a + 1);
        signalPositions[i * 3] = ax + (bx - ax) * s.t;
        signalPositions[i * 3 + 1] = ay + (by - ay) * s.t;
        signalPositions[i * 3 + 2] = az + (bz - az) * s.t;
      }
      signalGeometry.getAttribute('position').needsUpdate = true;
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function onPointerMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    function resize() {
      const { clientWidth, clientHeight } = container!;
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    }
    resize();

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);

    let rafId = 0;
    let running = true;
    let lastTime = performance.now();
    let currentZ = STAGE_CAMERA[0].start;

    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else if (!reducedMotion) {
        running = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    function renderStaticFrame() {
      renderer.render(scene, camera);
    }

    function tick(now: number) {
      if (!running) return;
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      currentX += (targetX - currentX) * 0.035;
      currentY += (targetY - currentY) * 0.035;

      const { index, t } = journeyRef.current;
      const stage = STAGE_CAMERA[Math.min(index, STAGE_CAMERA.length - 1)];
      const targetZ = THREE.MathUtils.lerp(stage.start, stage.end, THREE.MathUtils.clamp(t, 0, 1));
      currentZ += (targetZ - currentZ) * 0.06;
      camera.position.z = currentZ;

      const settleFactor = 1 - Math.min(index / (STAGE_CAMERA.length - 1), 1) * 0.45;
      group.rotation.y += delta * 0.045 * settleFactor + currentX * 0.0009;
      group.rotation.x = currentY * 0.16;

      if (!lowPower) updateSignals(delta);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    }

    if (reducedMotion) {
      renderStaticFrame();
    } else {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      hubGeometry.dispose();
      hubMaterial.dispose();
      signalGeometry.dispose();
      signalMaterial.dispose();
      renderer.dispose();
      container!.removeChild(renderer.domElement);
    };
  }, [journeyRef]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
