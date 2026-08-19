'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Nudo toroidal como un único trazo continuo — la curva paramétrica en sí,
 * no la malla de un sólido (eso daba una jaula de cuadrícula densa, ruidosa).
 * Un segundo trazo más fino, mismo recorrido con un offset de fase, hace de
 * eco discreto. Dos colores de marca, sin relleno: sigue la disciplina de
 * "solo línea" del resto del sistema, pero con una silueta que no se repite
 * en ningún otro producto — cinta anudada, no esfera ni red de nodos.
 */
function curvaNudo(p: number, q: number, radio: number, puntos: number, faseExtra = 0): THREE.Vector3[] {
  const vertices: THREE.Vector3[] = [];
  for (let i = 0; i <= puntos; i++) {
    const t = (i / puntos) * Math.PI * 2 + faseExtra;
    const r = 2 + Math.cos(q * t);
    vertices.push(
      new THREE.Vector3(r * Math.cos(p * t), r * Math.sin(p * t), Math.sin(q * t)).multiplyScalar(radio),
    );
  }
  return vertices;
}

function Forma() {
  const grupo = useRef<THREE.Group>(null);
  const trazoInterior = useRef<THREE.LineLoop>(null);

  const trazoPrincipal = useMemo(() => {
    const geometria = new THREE.BufferGeometry().setFromPoints(curvaNudo(2, 3, 0.72, 260));
    return geometria;
  }, []);

  const trazoEco = useMemo(() => {
    const geometria = new THREE.BufferGeometry().setFromPoints(curvaNudo(2, 3, 0.78, 260, 0.35));
    return geometria;
  }, []);

  useFrame((estado, delta) => {
    if (grupo.current) {
      grupo.current.rotation.y += delta * 0.16;
      grupo.current.rotation.x = Math.sin(estado.clock.elapsedTime * 0.13) * 0.3;
    }
    if (trazoInterior.current) {
      trazoInterior.current.rotation.y -= delta * 0.05;
    }
  });

  return (
    <group ref={grupo}>
      <lineLoop geometry={trazoPrincipal}>
        <lineBasicMaterial color="#7ba1ff" transparent opacity={0.85} />
      </lineLoop>
      <lineLoop ref={trazoInterior} geometry={trazoEco}>
        <lineBasicMaterial color="#3ddcb0" transparent opacity={0.4} />
      </lineLoop>
    </group>
  );
}

export default function EscenaHero() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <Forma />
    </Canvas>
  );
}
