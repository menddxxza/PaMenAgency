import { ImageResponse } from 'next/og';
import { elementoIconoNotiq } from '@/lib/iconoNotiq';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icono() {
  return new ImageResponse(elementoIconoNotiq(32), size);
}
