export default function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-lg font-extrabold tracking-tight ${
        claro ? 'text-white' : 'text-ink'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- icono de marca
          fijo en public/, no una imagen de contenido que valga la pena pasar
          por next/image (siempre 32×32, sin variantes de tamaño de viewport). */}
      <img src="/logo.png" alt="" aria-hidden className="h-8 w-8 rounded-xl object-cover" />
      Notiq
    </span>
  );
}
