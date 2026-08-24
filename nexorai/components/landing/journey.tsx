'use client';

import { useRef } from 'react';
import { SystemScene, type JourneyState } from '@/components/landing/system-scene';
import { Hero } from '@/components/landing/hero';
import { DemoFlow } from '@/components/landing/demo-flow';
import { Calculator } from '@/components/landing/calculator';
import { AgentsPreview } from '@/components/landing/agents-preview';
import { PricingSection } from '@/components/landing/pricing-section';

/**
 * El recorrido completo: un único mundo Three.js persistente, fijado con
 * CSS (no con el pin de GSAP: un pin-spacer conserva el hueco estático del
 * elemento incluso con pinSpacing:false, lo que empujaba el Hero fuera de
 * la pantalla) mientras las cinco estaciones del producto pasan por
 * delante en flujo normal. Cada estación reporta su propio progreso (ver
 * useStageTrigger) para que la cámara del sistema avance con el scroll.
 */
export function Journey() {
  const journeyRef = useRef<JourneyState>({ index: 0, t: 0 });

  return (
    <div className="bg-void relative">
      <div className="pointer-events-none fixed inset-0 z-0 h-[100dvh] w-full overflow-hidden">
        <SystemScene journeyRef={journeyRef} className="h-full w-full" />
      </div>

      <div className="relative z-10">
        <Hero stageIndex={0} journeyRef={journeyRef} />
        <DemoFlow stageIndex={1} journeyRef={journeyRef} />
        <Calculator stageIndex={2} journeyRef={journeyRef} />
        <AgentsPreview stageIndex={3} journeyRef={journeyRef} />
        <PricingSection stageIndex={4} journeyRef={journeyRef} />
      </div>
    </div>
  );
}
