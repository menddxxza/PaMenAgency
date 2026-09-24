'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
  const failsafe = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathRef = useRef(pathname);

  function clearTimers() {
    if (trickle.current) clearInterval(trickle.current);
    if (failsafe.current) clearTimeout(failsafe.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }

  function start() {
    clearTimers();
    setVisible(true);
    setProgress(12);
    trickle.current = setInterval(() => {
      setProgress((p) => (p < 85 ? p + (90 - p) * 0.12 : p));
    }, 180);
    failsafe.current = setTimeout(finish, 10000);
  }

  function finish() {
    clearTimers();
    setProgress(100);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 260);
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathRef.current && !url.hash) return;
      if (url.pathname === pathRef.current) return;
      start();
    }
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pathRef.current !== pathname) {
      pathRef.current = pathname;
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[9998] h-[3px]"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' }}
    >
      <div
        className="h-full bg-brand-500 shadow-[0_0_10px_rgba(209,143,34,0.8)]"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? 'width 180ms ease-out' : 'width 300ms ease-out',
        }}
      />
    </div>
  );
}
