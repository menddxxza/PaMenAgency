'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { JourneyState } from '@/components/landing/system-scene';

/**
 * Cada estación del recorrido reporta su propio progreso de scroll al
 * estado compartido `journeyRef`, que el canvas persistente (system-scene)
 * lee en su loop de render para mover la cámara. No hay un único
 * ScrollTrigger global — cada sección es dueña de su propio tramo, lo que
 * evita tener que calcular alturas combinadas a mano.
 */
export function useStageTrigger<T extends HTMLElement>(
  stageIndex: number,
  journeyRef?: React.MutableRefObject<JourneyState>
) {
  const sectionRef = useRef<T>(null);

  useEffect(() => {
    if (!sectionRef.current || !journeyRef) return;
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top center',
      end: 'bottom center',
      onUpdate: (self) => {
        journeyRef.current = { index: stageIndex, t: self.progress };
      },
      onToggle: (self) => {
        if (self.isActive) journeyRef.current = { index: stageIndex, t: self.progress };
      },
    });
    return () => trigger.kill();
  }, [stageIndex, journeyRef]);

  return sectionRef;
}
