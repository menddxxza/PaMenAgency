'use client';

import { useEffect, useRef, useState } from 'react';

const VIDEO = '/hero.mp4';
const POSTER = '/hero-poster.jpg';

/** Tope de fotogramas cacheados. Más que esto no se nota y cuesta memoria. */
const MAX_FOTOGRAMAS = 90;
/** Ancho máximo de cada fotograma cacheado: se escala a pantalla al dibujar. */
const ANCHO_CACHE = 960;
/** Cuánto se acerca la posición suavizada a la real en cada fotograma. */
const SUAVIZADO = 0.12;

function esperar(elemento: HTMLVideoElement, evento: string, msTope = 8000) {
  return new Promise<void>((resolver) => {
    const fin = () => {
      elemento.removeEventListener(evento, fin);
      clearTimeout(temporizador);
      resolver();
    };
    const temporizador = setTimeout(fin, msTope);
    elemento.addEventListener(evento, fin, { once: true });
  });
}

/**
 * Fondo fijo cuyo avance lo marca el scroll, no el tiempo: el vídeo no se
 * reproduce solo, se "rebobina" según dónde estés en la zona cinematográfica.
 *
 * El vídeo se sirve desde /public a propósito. El original está en un CDN sin
 * cabeceras CORS, y sin CORS `createImageBitmap` sobre el vídeo lanza
 * SecurityError — es decir, la caché de fotogramas (lo que hace que el barrido
 * se vea fluido en vez de a saltos entre keyframes) sería imposible. Sirviéndolo
 * desde el mismo origen, funciona.
 *
 * No se monta en móvil, con `prefers-reduced-motion` ni con ahorro de datos
 * activado: son 10 MB y un bucle de dibujado constante. En esos casos queda el
 * póster, que es el primer fotograma del propio vídeo.
 */
export default function FondoVideoScroll({ idZona }: { idZona?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activo, setActivo] = useState(false);
  const [dibujando, setDibujando] = useState(false);

  useEffect(() => {
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pantallaAmplia = window.matchMedia('(min-width: 1024px)').matches;
    const conexion = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setActivo(!reducido && pantallaAmplia && conexion?.saveData !== true);
  }, []);

  useEffect(() => {
    if (!activo) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let cancelado = false;
    let animacion = 0;
    let suavizada = 0;
    let fotogramas: ImageBitmap[] = [];
    let ancho = 0;
    let alto = 0;

    const redimensionar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = window.innerWidth;
      alto = window.innerHeight;
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      canvas.style.width = `${ancho}px`;
      canvas.style.height = `${alto}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** Dibuja recortando al centro, como `object-fit: cover`. */
    const dibujarCover = (
      fuente: CanvasImageSource,
      anchoFuente: number,
      altoFuente: number,
    ) => {
      if (!anchoFuente || !altoFuente) return;
      const escala = Math.max(ancho / anchoFuente, alto / altoFuente);
      const w = anchoFuente * escala;
      const h = altoFuente * escala;
      ctx.drawImage(fuente, (ancho - w) / 2, (alto - h) / 2, w, h);
    };

    /** 0 = principio de la zona cinematográfica, 1 = final. */
    const progreso = () => {
      const zona = idZona ? document.getElementById(idZona) : null;
      if (zona) {
        const recorrido = zona.offsetHeight - window.innerHeight;
        if (recorrido <= 0) return 0;
        return Math.min(1, Math.max(0, (window.scrollY - zona.offsetTop) / recorrido));
      }
      const recorrido = document.documentElement.scrollHeight - window.innerHeight;
      if (recorrido <= 0) return 0;
      return Math.min(1, Math.max(0, window.scrollY / recorrido));
    };

    const bucle = () => {
      suavizada += (progreso() - suavizada) * SUAVIZADO;

      if (fotogramas.length > 0) {
        const indice = Math.round(suavizada * (fotogramas.length - 1));
        const fotograma = fotogramas[Math.min(fotogramas.length - 1, Math.max(0, indice))];
        dibujarCover(fotograma, fotograma.width, fotograma.height);
      } else if (video.readyState >= 2 && video.duration) {
        // Sin caché todavía: se rebobina el propio vídeo. Va a saltos entre
        // keyframes, pero cubre el rato que tarda la extracción.
        const instante = suavizada * (video.duration - 0.05);
        if (Math.abs(video.currentTime - instante) > 0.04) video.currentTime = instante;
        dibujarCover(video, video.videoWidth, video.videoHeight);
      }

      animacion = requestAnimationFrame(bucle);
    };

    /** Trocea el vídeo en fotogramas para que el barrido sea continuo. */
    const extraerFotogramas = async () => {
      await esperar(video, 'loadeddata');
      if (cancelado || !video.duration) return;
      // Respiro para no competir con la carga de la página.
      await new Promise((r) => setTimeout(r, 300));
      if (cancelado) return;

      const oculto = document.createElement('video');
      oculto.src = VIDEO;
      oculto.muted = true;
      oculto.playsInline = true;
      oculto.preload = 'auto';
      await esperar(oculto, 'loadeddata');
      if (cancelado || !oculto.videoWidth) return;

      const total = Math.max(24, Math.min(MAX_FOTOGRAMAS, Math.round(oculto.duration * 12)));
      const escala = Math.min(1, ANCHO_CACHE / oculto.videoWidth);
      const lienzo = document.createElement('canvas');
      lienzo.width = Math.round(oculto.videoWidth * escala);
      lienzo.height = Math.round(oculto.videoHeight * escala);
      const ctxLienzo = lienzo.getContext('2d');
      if (!ctxLienzo) return;

      const extraidos: ImageBitmap[] = [];
      for (let i = 0; i < total; i += 1) {
        if (cancelado) break;
        oculto.currentTime = (i / (total - 1)) * (oculto.duration - 0.05);
        await esperar(oculto, 'seeked', 2000);
        if (cancelado) break;
        ctxLienzo.drawImage(oculto, 0, 0, lienzo.width, lienzo.height);
        try {
          extraidos.push(await createImageBitmap(lienzo));
        } catch {
          // Si el navegador no deja (o se queda sin memoria), nos quedamos con
          // el rebobinado directo: peor, pero funciona.
          return;
        }
      }

      if (cancelado) {
        extraidos.forEach((f) => f.close());
        return;
      }
      fotogramas = extraidos;
    };

    const marcarDibujando = () => setDibujando(true);

    redimensionar();
    window.addEventListener('resize', redimensionar);
    video.addEventListener('loadeddata', marcarDibujando);
    if (video.readyState >= 2) marcarDibujando();
    animacion = requestAnimationFrame(bucle);
    void extraerFotogramas();

    return () => {
      cancelado = true;
      cancelAnimationFrame(animacion);
      window.removeEventListener('resize', redimensionar);
      video.removeEventListener('loadeddata', marcarDibujando);
      fotogramas.forEach((f) => f.close());
    };
  }, [activo, idZona]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0a0a0a]"
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={POSTER}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          dibujando ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {activo ? (
        <>
          <video
            ref={videoRef}
            src={VIDEO}
            muted
            playsInline
            preload="auto"
            // Se queda debajo del lienzo: hace falta que el navegador lo siga
            // decodificando, pero lo que se ve es siempre el lienzo.
            className="absolute inset-0 h-full w-full object-cover"
          />
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
              dibujando ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : null}

      {/* Velo. El vídeo es claro (bruma azul), así que el texto blanco encima no
          llegaría a contraste legible sin esto. Semitransparente, nunca opaco:
          la imagen se sigue viendo entera. */}
      <div className="absolute inset-0 bg-[#0a0a0a]/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-transparent to-[#0a0a0a]/85" />
    </div>
  );
}
