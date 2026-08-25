// Adaptado de React Bits (reactbits.dev) a TypeScript.
import { useLayoutEffect, useRef, useCallback, type ReactNode } from 'react';
import Lenis from 'lenis';
import './ScrollStack.css';

export function ScrollStackItem({
  children,
  itemClassName = '',
}: {
  children: ReactNode;
  itemClassName?: string;
}) {
  return <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>;
}

interface CardTransform {
  translateY: number;
  scale: number;
  rotation: number;
  blur: number;
  opacity: number;
}

export interface ScrollStackProps {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  rotationAmount?: number;
  blurAmount?: number;
  /** Opacidad que pierde cada tarjeta por nivel de profundidad al quedar
   *  detrás de otra. Sin esto (y sin blurAmount), la tarjeta de detrás se ve
   *  nítida hasta el borde exacto donde la de delante la tapa — un corte
   *  duro en vez de una transición suave. */
  fadeAmount?: number;
  /** Suelo de opacidad para las tarjetas más profundas del apilado. */
  minOpacity?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

export default function ScrollStack({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  fadeAmount = 0,
  minOpacity = 1,
  useWindowScroll = false,
  onStackComplete,
}: ScrollStackProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef<Map<number, CardTransform>>(new Map());
  const isUpdatingRef = useRef(false);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return typeof value === 'string' ? parseFloat(value) : value;
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return { scrollTop: window.scrollY, containerHeight: window.innerHeight };
    }
    const scroller = scrollerRef.current;
    return { scrollTop: scroller?.scrollTop ?? 0, containerHeight: scroller?.clientHeight ?? 0 };
  }, [useWindowScroll]);

  const getElementOffset = useCallback(
    (element: HTMLElement) => {
      if (useWindowScroll) {
        // offsetTop/offsetParent no se ven afectados por `transform`, a
        // diferencia de getBoundingClientRect(): este último incluye el
        // transform que el propio bucle ya escribió en el frame anterior,
        // lo que crea una realimentación entre frames (la posición medida
        // depende del último desplazamiento aplicado) y se traduce en
        // parpadeo/saltos de la tarjeta al hacer scroll.
        let top = 0;
        let node: HTMLElement | null = element;
        while (node) {
          top += node.offsetTop;
          node = node.offsetParent as HTMLElement | null;
        }
        return top;
      }
      return element.offsetTop;
    },
    [useWindowScroll],
  );

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    const endElement = useWindowScroll
      ? document.querySelector<HTMLElement>('.scroll-stack-end')
      : (scrollerRef.current?.querySelector<HTMLElement>('.scroll-stack-end') ?? null);

    const endElementTop = endElement ? getElementOffset(endElement) : 0;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop = getElementOffset(card);
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
      const pinEnd = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      // Una tarjeta se difumina/atenúa en sincronía exacta con el avance de
      // la que viene justo detrás (su propio scaleProgress) — no con un
      // escalón brusco de "ya hay otra tarjeta fijada en algún punto". Así
      // el desvanecimiento empieza en el mismo instante en que la siguiente
      // tarjeta empieza a solaparla, y nunca hay un frame con dos tarjetas
      // opacas superpuestas sin transición (que se veía como un corte).
      let blur = 0;
      let opacity = 1;
      if ((blurAmount || fadeAmount) && i < cardsRef.current.length - 1) {
        const nextCard = cardsRef.current[i + 1];
        if (nextCard) {
          const nextCardTop = getElementOffset(nextCard);
          const nextTriggerStart = nextCardTop - stackPositionPx - itemStackDistance * (i + 1);
          const nextTriggerEnd = nextCardTop - scaleEndPositionPx;
          const incomingProgress = calculateProgress(scrollTop, nextTriggerStart, nextTriggerEnd);
          if (blurAmount) blur = incomingProgress * blurAmount;
          if (fadeAmount) opacity = 1 - incomingProgress * (1 - minOpacity);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const newTransform: CardTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
        opacity: Math.round(opacity * 1000) / 1000,
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1 ||
        Math.abs(lastTransform.opacity - newTransform.opacity) > 0.001;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';

        card.style.transform = transform;
        card.style.filter = filter;
        card.style.opacity = String(newTransform.opacity);

        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    fadeAmount,
    minOpacity,
    useWindowScroll,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollData,
    getElementOffset,
  ]);

  const handleScroll = useCallback(() => {
    updateCardTransforms();
  }, [updateCardTransforms]);

  const setupLenis = useCallback(() => {
    const common = {
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      wheelMultiplier: 1,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075,
    };

    const lenis = useWindowScroll
      ? new Lenis(common)
      : new Lenis({
          ...common,
          wrapper: scrollerRef.current ?? undefined,
          content: scrollerRef.current?.querySelector('.scroll-stack-inner') ?? undefined,
          gestureOrientation: 'vertical',
          syncTouchLerp: 0.075,
        });

    lenis.on('scroll', handleScroll);

    const raf = (time: number) => {
      lenis.raf(time);
      animationFrameRef.current = requestAnimationFrame(raf);
    };
    animationFrameRef.current = requestAnimationFrame(raf);

    lenisRef.current = lenis;
    return lenis;
  }, [handleScroll, useWindowScroll]);

  useLayoutEffect(() => {
    if (!useWindowScroll && !scrollerRef.current) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll<HTMLElement>('.scroll-stack-card')
        : (scrollerRef.current?.querySelectorAll<HTMLElement>('.scroll-stack-card') ?? []),
    );

    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translateZ(0)';
      card.style.perspective = '1000px';
    });

    setupLenis();
    updateCardTransforms();

    return () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lenisRef.current?.destroy();
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    fadeAmount,
    minOpacity,
    useWindowScroll,
    onStackComplete,
    setupLenis,
    updateCardTransforms,
  ]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        {/* Hueco para que el último elemento se "despine" con suavidad. */}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
}
