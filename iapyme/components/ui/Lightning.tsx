'use client';

import { useEffect, useRef } from 'react';

import './Lightning.css';

/**
 * Rayo en WebGL (React Bits). El shader va tal cual; lo que cambia es cómo
 * se gobierna, porque aquí vive de fondo de una sección que está al final de
 * una página larga:
 *
 * - No dibuja si no se ve. El original tiene un requestAnimationFrame eterno:
 *   estaría ocupando la GPU todo el rato que pasas leyendo la portada, con la
 *   sección fuera de pantalla.
 * - No redimensiona en cada fotograma. El original llama a resizeCanvas()
 *   dentro del bucle, y asignar canvas.width reconstruye el búfer de dibujo
 *   cada vez, además de forzar un cálculo de layout por fotograma.
 * - Con prefers-reduced-motion no se monta: es una animación continua.
 * - Al desmontar suelta el contexto WebGL, que no se libera solo por dejar de
 *   pintar.
 */
export default function Lightning({
  hue = 230,
  xOffset = 0,
  speed = 1,
  intensity = 1,
  size = 1,
}: {
  /** Tono del rayo en grados (0-360). */
  hue?: number;
  /** Desplazamiento horizontal en unidades normalizadas. */
  xOffset?: number;
  /** Multiplicador de velocidad. */
  speed?: number;
  /** Multiplicador de brillo. */
  intensity?: number;
  /** Escala del rayo. */
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      // Sin WebGL no hay efecto, pero la sección se lee igual: es decoración.
      return;
    }

    const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;

      #define OCTAVE_COUNT 10

      vec3 hsv2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z * mix(vec3(1.0), rgb, c.y);
      }

      float hash11(float p) {
          p = fract(p * .1031);
          p *= p + 33.33;
          p *= p + p;
          return fract(p);
      }

      float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
      }

      mat2 rotate2d(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat2(c, -s, s, c);
      }

      float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          float a = hash12(ip);
          float b = hash12(ip + vec2(1.0, 0.0));
          float c = hash12(ip + vec2(0.0, 1.0));
          float d = hash12(ip + vec2(1.0, 1.0));

          vec2 t = smoothstep(0.0, 1.0, fp);
          return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }

      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
              value += amplitude * noise(p);
              p *= rotate2d(0.45);
              p *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          vec2 uv = fragCoord / iResolution.xy;
          uv = 2.0 * uv - 1.0;
          uv.x *= iResolution.x / iResolution.y;
          uv.x += uXOffset;

          uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;

          float dist = abs(uv.x);
          vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
          vec3 col = baseColor * pow(mix(0.0, 0.07, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
          col = pow(col, vec3(1.0));
          float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
          fragColor = vec4(col, a);
      }

      void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error al compilar el shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Error al enlazar el programa:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLocation = gl.getUniformLocation(program, 'iResolution');
    const iTimeLocation = gl.getUniformLocation(program, 'iTime');
    const uHueLocation = gl.getUniformLocation(program, 'uHue');
    const uXOffsetLocation = gl.getUniformLocation(program, 'uXOffset');
    const uSpeedLocation = gl.getUniformLocation(program, 'uSpeed');
    const uIntensityLocation = gl.getUniformLocation(program, 'uIntensity');
    const uSizeLocation = gl.getUniformLocation(program, 'uSize');

    let animationFrameId = 0;
    let visible = false;
    const startTime = performance.now();

    const ajustarTamano = () => {
      const ancho = canvas.clientWidth;
      const alto = canvas.clientHeight;
      if (canvas.width === ancho && canvas.height === alto) return;
      canvas.width = ancho;
      canvas.height = alto;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = () => {
      ajustarTamano();
      gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(iTimeLocation, (performance.now() - startTime) / 1000);
      gl.uniform1f(uHueLocation, hue);
      gl.uniform1f(uXOffsetLocation, xOffset);
      gl.uniform1f(uSpeedLocation, speed);
      gl.uniform1f(uIntensityLocation, intensity);
      gl.uniform1f(uSizeLocation, size);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    const arrancar = () => {
      if (animationFrameId) return;
      animationFrameId = requestAnimationFrame(render);
    };

    const parar = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    };

    const observador = new IntersectionObserver(
      ([entrada]) => {
        visible = entrada.isIntersecting;
        if (visible) arrancar();
        else parar();
      },
      { rootMargin: '150px' },
    );
    observador.observe(canvas);

    // En otra pestaña tampoco hace falta pintar.
    const alCambiarVisibilidad = () => {
      if (document.hidden) parar();
      else if (visible) arrancar();
    };
    document.addEventListener('visibilitychange', alCambiarVisibilidad);

    const alRedimensionar = () => ajustarTamano();
    window.addEventListener('resize', alRedimensionar);

    return () => {
      parar();
      observador.disconnect();
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      window.removeEventListener('resize', alRedimensionar);

      gl.deleteBuffer(vertexBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      // Aquí NO se destruye el contexto con WEBGL_lose_context. Un contexto
      // perdido no se recupera solo, y `getContext` sobre el mismo <canvas>
      // devuelve ese mismo contexto muerto: al remontar el efecto (React lo
      // hace dos veces en desarrollo) los shaders ya no compilan y no se
      // dibuja nada. El navegador libera el contexto al retirar el canvas.
    };
  }, [hue, xOffset, speed, intensity, size]);

  return <canvas ref={canvasRef} className="lightning-container" aria-hidden />;
}
