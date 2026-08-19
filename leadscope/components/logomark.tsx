import { cn } from '@/lib/utils';

export function Logomark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn('h-6 w-6 text-brand-600 dark:text-brand-400', className)}
      aria-hidden="true"
    >
      <circle cx="5" cy="19" r="1.7" fill="currentColor" />
      <path d="M5 13A6 6 0 0 1 11 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="1" />
      <path d="M5 8A11 11 0 0 1 16 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <path d="M5 3A16 16 0 0 1 21 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.28" />
    </svg>
  );
}
