'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const RING_COUNT = 4;
const PING_COUNT = 9;
const ACCENT = 0xd18f22;
const ACCENT_DIM = 0x6b4a1a;

interface Ping {
  mesh: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
  angle: number;
  radius: number;
  phase: number;
  speed: number;
}

/**
 * Visual bespoke a la marca: una mesa de radar inclinada, barrido giratorio y
 * "pings" que aparecen al azar — la metáfora de "detectar negocios" sin
 * recurrir a un mockup de navegador ni a un blob genérico.
 */
export function RadarScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 3.4, 5.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const radarGroup = new THREE.Group();
    radarGroup.rotation.x = -Math.PI / 2.55;
    scene.add(radarGroup);

    // Anillos concéntricos
    for (let i = 1; i <= RING_COUNT; i++) {
      const radius = (i / RING_COUNT) * 2.2;
      const ringGeometry = new THREE.RingGeometry(radius - 0.008, radius, 96);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: ACCENT_DIM,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      radarGroup.add(new THREE.Mesh(ringGeometry, ringMaterial));
    }

    // Líneas radiales
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, 0),
      ];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: ACCENT_DIM,
        transparent: true,
        opacity: 0.2,
      });
      radarGroup.add(new THREE.Line(lineGeometry, lineMaterial));
    }

    // Sector de barrido (el "sweep" del radar)
    const sweepGeometry = new THREE.CircleGeometry(2.2, 48, 0, Math.PI / 5);
    const sweepMaterial = new THREE.MeshBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
    });
    const sweep = new THREE.Mesh(sweepGeometry, sweepMaterial);
    radarGroup.add(sweep);

    const sweepEdgeGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0.001),
      new THREE.Vector3(2.2, 0, 0.001),
    ]);
    const sweepEdge = new THREE.Line(
      sweepEdgeGeometry,
      new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.9 })
    );
    radarGroup.add(sweepEdge);

    // Pings: negocios detectados apareciendo en el radar
    const pingGeometry = new THREE.CircleGeometry(0.045, 16);
    const pings: Ping[] = Array.from({ length: PING_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.35 + Math.random() * 1.75;
      const material = new THREE.MeshBasicMaterial({
        color: ACCENT,
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(pingGeometry, material);
      mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.002);
      radarGroup.add(mesh);
      return { mesh, angle, radius, phase: Math.random() * Math.PI * 2, speed: 0.6 + Math.random() * 0.4 };
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      pings.forEach((ping, i) => {
        ping.mesh.material.opacity = i % 2 === 0 ? 0.7 : 0;
      });
      renderer.render(scene, camera);
      return () => {
        renderer.dispose();
        container.removeChild(renderer.domElement);
      };
    }

    let targetRotX = radarGroup.rotation.x;
    let targetRotZ = 0;

    function handlePointerMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotZ = nx * 0.25;
      targetRotX = -Math.PI / 2.55 + ny * 0.18;
    }
    container.addEventListener('pointermove', handlePointerMove);

    const clock = new THREE.Clock();
    let frameId: number;

    function animate() {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      sweep.rotation.z = elapsed * 0.5;
      sweepEdge.rotation.z = elapsed * 0.5;

      for (const ping of pings) {
        const cycle = (elapsed * ping.speed + ping.phase) % (Math.PI * 2);
        const opacity = Math.max(0, Math.sin(cycle)) * 0.9;
        ping.mesh.material.opacity = opacity;
        const scale = 1 + Math.max(0, Math.sin(cycle)) * 0.6;
        ping.mesh.scale.setScalar(scale);
      }

      // Amortiguación tipo "spring" hacia el objetivo del puntero
      radarGroup.rotation.x += (targetRotX - radarGroup.rotation.x) * 0.04;
      radarGroup.rotation.z += (targetRotZ - radarGroup.rotation.z) * 0.04;

      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', handlePointerMove);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
          obj.geometry.dispose();
          const material = obj.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" aria-hidden="true" />;
}
