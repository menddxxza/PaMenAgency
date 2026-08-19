'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Icosaedro de líneas girando despacio, con una nube de puntos alrededor
 * conectados por aristas finas — un motivo abstracto de "red"/"nodo", no
 * un cerebro brillante ni un robot: encaja con el resto del sistema
 * (trazo fino, sin relleno, paleta de marca) en vez de parecer una
 * ilustración de stock de IA.
 */
function Forma() {
  const grupo = useRef<THREE.Group>(null);

  const geometriaIco = useMemo(() => new THREE.IcosahedronGeometry(1.6, 1), []);
  const bordesIco = useMemo(() => new THREE.EdgesGeometry(geometriaIco), [geometriaIco]);

  const nodos = useMemo(() => {
    const puntos: THREE.Vector3[] = [];
    const total = 22;
    // Distribución en espiral sobre la esfera (Fibonacci sphere), para que
    // los nodos queden repartidos de forma pareja sin agruparse en los polos.
    for (let i = 0; i < total; i++) {
      const y = 1 - (i / (total - 1)) * 2;
      const radio = Math.sqrt(1 - y * y);
      const theta = ((1 + Math.sqrt(5)) * Math.PI) * i;
      puntos.push(new THREE.Vector3(Math.cos(theta) * radio, y, Math.sin(theta) * radio).multiplyScalar(2.3));
    }
    return puntos;
  }, []);

  const lineasNodos = useMemo(() => {
    const posiciones: number[] = [];
    for (let i = 0; i < nodos.length; i++) {
      for (let j = i + 1; j < nodos.length; j++) {
        if (nodos[i].distanceTo(nodos[j]) < 1.7) {
          posiciones.push(nodos[i].x, nodos[i].y, nodos[i].z, nodos[j].x, nodos[j].y, nodos[j].z);
        }
      }
    }
    const geometria = new THREE.BufferGeometry();
    geometria.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3));
    return geometria;
  }, [nodos]);

  useFrame((_, delta) => {
    if (!grupo.current) return;
    grupo.current.rotation.y += delta * 0.08;
    grupo.current.rotation.x += delta * 0.02;
  });

  return (
    <group ref={grupo}>
      <lineSegments geometry={bordesIco}>
        <lineBasicMaterial color="#5c8dff" transparent opacity={0.55} />
      </lineSegments>
      <lineSegments geometry={lineasNodos}>
        <lineBasicMaterial color="#3ddcb0" transparent opacity={0.22} />
      </lineSegments>
      {nodos.map((posicion, i) => (
        <mesh key={i} position={posicion}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#8fb4ff" />
        </mesh>
      ))}
    </group>
  );
}

export default function EscenaHero() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <Forma />
    </Canvas>
  );
}
