interface CubeSpec {
  size: number;
  top: string;
  left: string;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  opacity: number;
  tint: 'violet' | 'blue' | 'mix';
  glow?: boolean;
  float?: boolean;
  delay?: string;
  floatDelay?: string;
}

// Escena decorativa: bloques de cristal semitransparentes en perspectiva
// isométrica, con el degradado violeta→azul del logotipo (no azul puro).
// Cada cubo muestra sus 6 caras (semitransparentes) para que se vean los
// bordes traseros a través del cristal, en vez de simular solo 3 caras
// opacas. La mitad "flota" con una deriva vertical lenta y continua para
// que el fondo se sienta vivo, no una imagen estática.
const CUBES: CubeSpec[] = [
  { size: 92, top: '4%', left: '58%', rotateX: -26, rotateY: 38, rotateZ: 0, opacity: 0.92, tint: 'violet', glow: true, float: true },
  { size: 64, top: '2%', left: '14%', rotateX: -30, rotateY: 50, rotateZ: 4, opacity: 0.55, tint: 'blue', float: true, floatDelay: '1.5s' },
  { size: 130, top: '20%', left: '30%', rotateX: -24, rotateY: 32, rotateZ: -2, opacity: 0.85, tint: 'mix', glow: true, delay: '0.6s', float: true, floatDelay: '0.8s' },
  { size: 54, top: '14%', left: '82%', rotateX: -32, rotateY: 44, rotateZ: 6, opacity: 0.5, tint: 'blue' },
  { size: 78, top: '46%', left: '8%', rotateX: -22, rotateY: 40, rotateZ: -4, opacity: 0.68, tint: 'violet', float: true, floatDelay: '2.4s' },
  { size: 104, top: '52%', left: '62%', rotateX: -28, rotateY: 34, rotateZ: 2, opacity: 0.9, tint: 'mix', glow: true, delay: '1.2s', float: true, floatDelay: '0.3s' },
  { size: 46, top: '38%', left: '46%', rotateX: -30, rotateY: 48, rotateZ: 0, opacity: 0.45, tint: 'blue' },
  { size: 68, top: '72%', left: '24%', rotateX: -26, rotateY: 42, rotateZ: 3, opacity: 0.62, tint: 'violet', float: true, floatDelay: '1.1s' },
  { size: 88, top: '76%', left: '76%', rotateX: -24, rotateY: 36, rotateZ: -3, opacity: 0.72, tint: 'mix', float: true, floatDelay: '3s' },
];

const TINTS: Record<CubeSpec['tint'], { fill: string; border: string }> = {
  violet: {
    fill: 'linear-gradient(135deg, rgba(196,131,255,0.30), rgba(139,47,224,0.16) 55%, rgba(10,14,28,0.06))',
    border: 'rgba(196,148,255,0.42)',
  },
  blue: {
    fill: 'linear-gradient(135deg, rgba(143,197,255,0.24), rgba(47,111,237,0.14) 55%, rgba(10,14,28,0.06))',
    border: 'rgba(143,197,255,0.38)',
  },
  mix: {
    fill: 'linear-gradient(135deg, rgba(196,131,255,0.28), rgba(96,90,240,0.18) 45%, rgba(59,135,255,0.16) 80%, rgba(10,14,28,0.06))',
    border: 'rgba(180,160,255,0.4)',
  },
};

function Cube({ spec }: { spec: CubeSpec }) {
  const half = spec.size / 2;
  const { fill, border } = TINTS[spec.tint];
  const faceStyle = (transform: string): React.CSSProperties => ({
    position: 'absolute',
    width: spec.size,
    height: spec.size,
    transform,
    background: fill,
    border: `1px solid ${border}`,
    boxShadow: 'inset 0 0 18px rgba(196,148,255,0.1)',
  });

  const classNames = ['tech-cube', spec.glow && 'tech-cube--glow', spec.float && 'tech-cube--float']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      style={{
        position: 'absolute',
        top: spec.top,
        left: spec.left,
        width: spec.size,
        height: spec.size,
        opacity: spec.opacity,
        perspective: 700,
        animationDelay: spec.float ? spec.floatDelay : spec.delay,
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
      <div className="hero-aurora pointer-events-none absolute -inset-10 -z-10" />
      {CUBES.map((spec, i) => (
        <Cube key={i} spec={spec} />
      ))}
    </div>
  );
}
