import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combina clases condicionales (clsx) y resuelve conflictos de Tailwind
 * (tailwind-merge) — lo que esperan los componentes de estilo shadcn/ui. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
