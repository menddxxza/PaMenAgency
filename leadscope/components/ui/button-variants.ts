import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-fg text-bg shadow-card hover:shadow-card-hover hover:opacity-90 dark:bg-white dark:text-black',
        brand: 'bg-brand-600 text-white shadow-glow hover:bg-brand-500',
        secondary: 'bg-surface text-fg border border-border hover:bg-surface-hover',
        ghost: 'text-fg hover:bg-surface-hover',
        outline: 'border border-border text-fg hover:bg-surface-hover',
        danger: 'bg-danger/10 text-danger hover:bg-danger/20',
        link: 'text-brand-600 hover:underline underline-offset-4',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 shrink-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);
