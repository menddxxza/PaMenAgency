/** Formateo compartido. Sin datos: "Información no disponible", nunca un guion solo. */

export const NO_DATA = 'Información no disponible';

export function cv(kw: number | null): string {
  return kw == null ? NO_DATA : `${Math.round(kw * 1.35962)} CV`;
}

export function displacement(cc: number | null): string {
  return cc == null ? NO_DATA : `${(cc / 1000).toFixed(1)} l`;
}

export function minutes(min: number | null): string {
  if (min == null) return NO_DATA;
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const rest = min % 60;
  return rest ? `${h} h ${rest} min` : `${h} h`;
}

export function difficultyLabel(level: number | null): string {
  if (level == null) return NO_DATA;
  return ['Muy baja', 'Baja', 'Media', 'Alta', 'Muy alta'][level - 1] ?? `${level}/5`;
}

export function years(start: number, end: number | null): string {
  return end ? `${start}–${end}` : `${start}–`;
}

export function bytes(n: number | null): string {
  if (n == null) return NO_DATA;
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} kB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
}

export function vehicleTitle(v: {
  manufacturer_name: string;
  model_name: string;
  displacement_cc: number | null;
  fuel: string;
  power_kw: number | null;
  trim: string | null;
}): string {
  const fuelTag = v.fuel === 'diesel' ? 'TDI' : v.fuel === 'petrol' ? 'TSI' : v.fuel.toUpperCase();
  const size = v.displacement_cc ? (v.displacement_cc / 1000).toFixed(1) : null;
  const power = v.power_kw ? `${Math.round(v.power_kw * 1.35962)}` : null;
  return [v.manufacturer_name, v.model_name, size, fuelTag, power, v.trim].filter(Boolean).join(' ');
}
