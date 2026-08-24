interface CubeSpec {
  size: number;
  top: string;
  left: string;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  opacity: number;
  glow?: boolean;
  delay?: string;
}

// Escena decorativa: bloques de cristal semitransparentes en perspectiva
// isométrica, tal como pide el brief de hero "tech dark 3D". Cada cubo
// muestra sus 6 caras (semitransparentes) para que se vean los bordes
// traseros a través del cristal, en vez de simular solo 3 caras opacas.
const CUBES: CubeSpec[] = [
  { size: 92, top: '4%', left: '58%', rotateX: -26, rotateY: 38, rotateZ: 0, opacity: 0.9, glow: true },
  { size: 64, top: '2%', left: '14%', rotateX: -30, rotateY: 50, rotateZ: 4, opacity: 0.55 },
  { size: 130, top: '20%', left: '30%', rotateX: -24, rotateY: 32, rotateZ: -2, opacity: 0.8, glow: true, delay: '0.6s' },
  { size: 54, top: '14%', left: '82%', rotateX: -32, rotateY: 44, rotateZ: 6, opacity: 0.5 },
  { size: 78, top: '46%', left: '8%', rotateX: -22, rotateY: 40, rotateZ: -4, opacity: 0.65 },
  { size: 104, top: '52%', left: '62%', rotateX: -28, rotateY: 34, rotateZ: 2, opacity: 0.85, glow: true, delay: '1.2s' },
  { size: 46, top: '38%', left: '46%', rotateX: -30, rotateY: 48, rotateZ: 0, opacity: 0.45 },
  { size: 68, top: '72%', left: '24%', rotateX: -26, rotateY: 42, rotateZ: 3, opacity: 0.6 },
  { size: 88, top: '76%', left: '76%', rotateX: -24, rotateY: 36, rotateZ: -3, opacity: 0.7 },
];

function Cube({ spec }: { spec: CubeSpec }) {
  const half = spec.size / 2;
  const faceStyle = (transform: string): React.CSSProperties => ({
    position: 'absolute',
    width: spec.size,
    height: spec.size,
    transform,
    background:
      'linear-gradient(135deg, rgba(143,197,255,0.22), rgba(47,111,237,0.12) 60%, rgba(10,14,28,0.08))',
    border: '1px solid rgba(143,197,255,0.35)',
    boxShadow: 'inset 0 0 18px rgba(143,197,255,0.08)',
  });

  return (
    <div
      className={spec.glow ? 'tech-cube tech-cube--glow' : 'tech-cube'}
      style={{
        position: 'absolute',
        top: spec.top,
        left: spec.left,
        width: spec.size,
        height: spec.size,
        opacity: spec.opacity,
        perspective: 700,
        animationDelay: spec.delay,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${spec.rotateX}deg) rotateY(${spec.rotateY}deg) rotateZ(${spec.rotateZ}deg)`,
        }}
      >
        <div style={faceStyle(`translateZ(${half}px)`)} />
        <div style={faceStyle(`translateZ(${-half}px) rotateY(180deg)`)} />
        <div style={faceStyle(`rotateY(90deg) translateZ(${half}px)`)} />
        <div style={faceStyle(`rotateY(-90deg) translateZ(${half}px)`)} />
        <div style={faceStyle(`rotateX(90deg) translateZ(${half}px)`)} />
        <div style={faceStyle(`rotateX(-90deg) translateZ(${half}px)`)} />
      </div>
    </div>
  );
}

export function TechCubeField() {
  return (
    <div className="tech-cube-scene bg-fade-mask relative h-full w-full" aria-hidden="true">
      {CUBES.map((spec, i) => (
        <Cube key={i} spec={spec} />
      ))}
    </div>
  );
}
