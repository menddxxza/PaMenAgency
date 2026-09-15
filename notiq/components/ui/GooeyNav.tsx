'use client';

import { useEffect, useRef } from 'react';
import styles from './GooeyNav.module.css';

export interface GooeyNavItem {
  id: string;
  label: string;
}

export interface GooeyNavProps {
  items: GooeyNavItem[];
  /** Controlado desde fuera (a diferencia del GooeyNav original de React Bits,
   * que solo aceptaba un `initialActiveIndex` y se olvidaba de quién lo
   * cambiara después): en Notiq la pestaña activa también cambia por atajos
   * de teclado, la paleta de comandos o el botón "Ampliar" — no solo por clic
   * aquí mismo — así que el nav tiene que poder seguir esos cambios. */
  activeId: string;
  onSelect: (id: string) => void;
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  className?: string;
  ariaLabel?: string;
}

const noise = (n = 1) => n / 2 - Math.random() * n;

const getXY = (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
  const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
  return [distance * Math.cos(angle), distance * Math.sin(angle)];
};

export default function GooeyNav({
  items,
  activeId,
  onSelect,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  className,
  ariaLabel,
}: GooeyNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const montadoRef = useRef(false);

  function createParticle(i: number, t: number, d: [number, number], r: number) {
    const rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
    };
  }

  function makeParticles(element: HTMLSpanElement) {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove(styles.active);

      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add(styles.particle);
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);

        point.classList.add(styles.point);
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => element.classList.add(styles.active));
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // Ya no está — no pasa nada.
          }
        }, t);
      }, 30);
    }
  }

  function updateEffectPosition(element: HTMLElement) {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const estilos = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };
    Object.assign(filterRef.current.style, estilos);
    Object.assign(textRef.current.style, estilos);
    textRef.current.innerText = element.innerText;
  }

  // Único disparador de la animación: tanto un clic aquí como un cambio de
  // pestaña por otra vía (atajo de teclado, paleta de comandos...) pasan por
  // `activeId`, así que un solo efecto basta para mantener la burbuja al día
  // venga el cambio de donde venga.
  useEffect(() => {
    const li = navRef.current?.querySelector<HTMLLIElement>(`[data-id="${CSS.escape(activeId)}"]`);
    if (!li) return;

    updateEffectPosition(li);
    textRef.current?.classList.add(styles.active);

    if (!montadoRef.current) {
      montadoRef.current = true;
      return; // Sin ráfaga de partículas en el primer render — solo al cambiar.
    }

    if (filterRef.current) {
      filterRef.current.querySelectorAll(`.${styles.particle}`).forEach((p) => filterRef.current!.removeChild(p));
      textRef.current?.classList.remove(styles.active);
      void textRef.current?.offsetWidth;
      textRef.current?.classList.add(styles.active);
      makeParticles(filterRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      const li = navRef.current?.querySelector<HTMLLIElement>(`[data-id="${CSS.escape(activeId)}"]`);
      if (li) updateEffectPosition(li);
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`${styles.gooeyNavContainer} ${className ?? ''}`} ref={containerRef}>
      <nav>
        <ul ref={navRef} role="tablist" aria-label={ariaLabel}>
          {items.map((item) => (
            <li key={item.id} data-id={item.id} className={activeId === item.id ? styles.active : ''}>
              <button type="button" role="tab" aria-selected={activeId === item.id} onClick={() => onSelect(item.id)}>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <span className={`${styles.effect} ${styles.filter}`} ref={filterRef} />
      <span className={`${styles.effect} ${styles.text}`} ref={textRef} />
    </div>
  );
}
