'use client';

import { useEffect, useRef } from 'react';

/**
 * Fondo de partículas reactivas al ratón para el Hero — misma técnica que
 * components/ui/aether-flow-hero.tsx (conexiones por proximidad + empuje al
 * pasar el cursor), recortada a sólo el canvas para poder montarla dentro
 * del Hero real sin arrastrar su copy de demo (título/CTA propios).
 * Coloreado con el degradado real del logo (violeta #ae36fb → azul #3b87ff).
 */

interface ParticleProps {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  size: number;
  color: string;
}

class Particle {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  size: number;
  color: string;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private canvas: HTMLCanvasElement,
    { x, y, directionX, directionY, size, color }: ParticleProps
  ) {
    this.x = x;
    this.y = y;
    this.directionX = directionX;
    this.directionY = directionY;
    this.size = size;
    this.color = color;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }

  update(mouse: { x: number | null; y: number | null; radius: number }) {
    if (this.x > this.canvas.width || this.x < 0) this.directionX = -this.directionX;
    if (this.y > this.canvas.height || this.y < 0) this.directionY = -this.directionY;

    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius + this.size) {
        const force = (mouse.radius - distance) / mouse.radius;
        this.x -= (dx / distance) * force * 5;
        this.y -= (dy / distance) * force * 5;
      }
    }

    this.x += this.directionX;
    this.y += this.directionY;
    this.draw();
  }
}

export function ParticleCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = { x: null as number | null, y: null as number | null, radius: 160 };
    const isMobile = window.innerWidth < 768;

    function init() {
      particles = [];
      const divisor = isMobile ? 16000 : 9000;
      const numberOfParticles = (canvas!.height * canvas!.width) / divisor;
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 1.6 + 1;
        const x = Math.random() * (canvas!.width - size * 4) + size * 2;
        const y = Math.random() * (canvas!.height - size * 4) + size * 2;
        const directionX = Math.random() * 0.3 - 0.15;
        const directionY = Math.random() * 0.3 - 0.15;
        // Interpola entre el violeta (#ae36fb) y el azul (#3b87ff) del logo.
        const t = Math.random();
        const r = Math.round(174 + (59 - 174) * t);
        const g = Math.round(54 + (135 - 54) * t);
        const b = Math.round(251 + (255 - 251) * t);
        particles.push(
          new Particle(ctx!, canvas!, { x, y, directionX, directionY, size, color: `rgba(${r}, ${g}, ${b}, 0.75)` })
        );
      }
    }

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      init();
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const distance =
            (particles[a].x - particles[b].x) ** 2 + (particles[a].y - particles[b].y) ** 2;

          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            const opacityValue = 1 - distance / 20000;
            const dxMouseA = particles[a].x - (mouse.x ?? 0);
            const dyMouseA = particles[a].y - (mouse.y ?? 0);
            const distanceMouseA = Math.sqrt(dxMouseA * dxMouseA + dyMouseA * dyMouseA);

            ctx.strokeStyle =
              mouse.x !== null && distanceMouseA < mouse.radius
                ? `rgba(255, 255, 255, ${opacityValue})`
                : `rgba(116, 94, 253, ${opacityValue})`; // punto medio violeta→azul
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    let running = true;
    const animate = () => {
      if (!running) return;
      animationFrameId = requestAnimationFrame(animate);
      // Repinta opaco (no clearRect): este canvas sustituye visualmente al
      // fondo Three.js compartido sólo mientras dura el Hero, para que no se
      // superpongan dos redes de partículas a la vez.
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) particle.update(mouse);
      connect();
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };
    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };
    const handleVisibility = () => {
      running = !document.hidden;
      if (running) animate();
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('visibilitychange', handleVisibility);

    animate();

    return () => {
      running = false;
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
