'use client';

import { useEffect, useRef, useState } from 'react';

export function CountUp({ value, formatter }: { value: number; formatter?: (n: number) => string }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    prev.current = value;

    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(to);
      return;
    }
    if (from === to) return;

    const duration = 500;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{formatter ? formatter(display) : display}</>;
}
