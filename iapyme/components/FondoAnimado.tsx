/**
 * Manchas de color a la deriva detrás de todo el contenido. Fijas al
 * viewport (no se van con el scroll), muy difuminadas y a baja opacidad:
 * es un fondo ambiental, no una decoración que compita con el contenido.
 *
 * CSS puro, sin JavaScript: no es un componente de cliente, no añade peso
 * de hidratación.
 */
export default function FondoAnimado() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-white"
    >
      <div className="absolute -left-[10%] -top-[15%] h-[36rem] w-[36rem] animate-drift-a rounded-full bg-brand-400/[0.14] blur-[110px]" />
      <div className="absolute -right-[12%] top-[20%] h-[30rem] w-[30rem] animate-drift-b rounded-full bg-accent-400/[0.13] blur-[110px]" />
      <div className="absolute -bottom-[20%] left-[20%] h-[32rem] w-[32rem] animate-drift-c rounded-full bg-brand-300/[0.12] blur-[110px]" />
    </div>
  );
}
