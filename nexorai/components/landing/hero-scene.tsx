'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Motor visual del hero: una red de nodos y conexiones renderizada con
 * Three.js puro (sin fibras/abstracciones extra), pensada para leerse como
 * un sistema — no como una esfera 3D decorativa. La cámara no se mueve; el
 * grupo entero responde al cursor con inercia (lerp), y gira lentamente en
 * reposo para que nunca se sienta estático.
 */

const DESKTOP_NODE_COUNT = 260;
const MOBILE_NODE_COUNT = 90;
const CONNECT_DISTANCE = 2.6;
const MAX_CONNECTIONS_PER_NODE = 3;
const SIGNAL_COUNT_DESKTOP = 10;
const SIGNAL_COUNT_MOBILE = 4;

function isLowPower(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return (typeof cores === 'number' && cores <= 4) || (typeof mem === 'number' && mem <= 4);
}

// Nodos distribuidos en varias "capas" orbitales de radio y tilt distinto en
// vez de una nube esférica uniforme: eso es lo que hace que se lea como un
// sistema de anillos/circuitos y no como un planeta genérico.
function buildNodePositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const shellCount = 4;
  for (let i = 0; i < count; i++) {
    const shell = i % shellCount;
    const radius = 1.6 + shell * 0.85 + (Math.random() - 0.5) * 0.35;
    const tilt = (shell / shellCount) * Math.PI * 0.55 + (Math.random() - 0.5) * 0.3;
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

/** Textura de sprite circular con brillo suave, generada en canvas — evita cargar un PNG. */
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

export function HeroScene({ className }: { className?: string }) {
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
    camera.position.set(0, 0, 9);

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
      size: 0.052,
      map: makeGlowTexture('#9aa0a8'),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
    group.add(nodes);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(buildConnections(positions, nodeCount), 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.14 });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    group.add(lines);

    // Un puñado de nodos "hub" en dorado, ligeramente más grandes — los
    // puntos de datos que el sistema destaca, no decoración.
    const hubIndices: number[] = [];
    for (let i = 0; i < Math.min(14, nodeCount); i++) {
      hubIndices.push(Math.floor((i / 14) * nodeCount));
    }
    const hubPositions = new Float32Array(hubIndices.length * 3);
    hubIndices.forEach((idx, i) => hubPositions.set(positions.slice(idx * 3, idx * 3 + 3), i * 3));
    const hubGeometry = new THREE.BufferGeometry();
    hubGeometry.setAttribute('position', new THREE.BufferAttribute(hubPositions, 3));
    const hubMaterial = new THREE.PointsMaterial({
      size: 0.09,
      map: makeGlowTexture('#c9a24d'),
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const hubs = new THREE.Points(hubGeometry, hubMaterial);
    group.add(hubs);

    // Señales que recorren segmentos de línea reales, como paquetes de datos
    // moviéndose por el sistema — no partículas flotando sin sentido.
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
      size: 0.08,
      map: makeGlowTexture('#e8c988'),
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
    let lastTime = performance.now();

    function renderStaticFrame() {
      renderer.render(scene, camera);
    }

    function tick(now: number) {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      currentX += (targetX - currentX) * 0.035;
      currentY += (targetY - currentY) * 0.035;

      group.rotation.y += delta * 0.045 + currentX * 0.0009;
      group.rotation.x = currentY * 0.18;

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
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
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
  }, []);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
