const COLORES = [
  'bg-amber-100 text-amber-800',
  'bg-emerald-100 text-emerald-800',
  'bg-sky-100 text-sky-800',
  'bg-rose-100 text-rose-800',
  'bg-violet-100 text-violet-800',
  'bg-teal-100 text-teal-800',
  'bg-orange-100 text-orange-800',
  'bg-fuchsia-100 text-fuchsia-800',
];

/** Mismo email → siempre el mismo color, sin guardar nada nuevo — igual que
 * colorDeCarpeta en SeccionNotas.tsx. */
function colorDe(texto: string): string {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  return COLORES[hash % COLORES.length];
}

/** Iniciales a partir de la parte del email antes de la @: "ana.garcia" → "AG",
 * "pablo" → "P". Es lo único que hay (Notiq no pide nombre al registrarse). */
function inicialesDe(email: string): string {
  const usuario = email.split('@')[0] ?? '';
  const partes = usuario.split(/[.\-_]+/).filter(Boolean);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return usuario.slice(0, 2).toUpperCase() || '?';
}

export default function Avatar({ email, className = '' }: { email: string; className?: string }) {
  return (
    <span
      aria-hidden
      title={email}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${colorDe(email)} ${className}`}
    >
      {inicialesDe(email)}
    </span>
  );
}
