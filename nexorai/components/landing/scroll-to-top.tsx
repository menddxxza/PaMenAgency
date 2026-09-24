'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleClick() {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      data-cursor-hover
      aria-label="Volver arriba"
      className={cn(
        'landing-hairline fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border bg-[#0b0b0c]/90 text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-brand-400/40 hover:text-brand-300',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
